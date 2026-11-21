import { useCallback, useEffect, useState } from "react";
import {
  getPushRegistrationStatus,
  subscribePushNotification,
  unsubscribePushNotification,
} from "../api/pushNotifications";

export type PushNotificationState =
  | "loading"
  | "unsupported"
  | "needs-install"
  | "unavailable"
  | "blocked"
  | "off"
  | "on";

type EnableResult =
  | { ok: true }
  | {
      ok: false;
      reason: "unsupported" | "denied" | "unavailable" | "failed";
      detail?: string;
    };

function detectPlatform(): "ios" | "android" | "other" {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  if (
    /iPhone|iPad|iPod/i.test(ua) ||
    (ua.includes("Macintosh") && navigator.maxTouchPoints > 1)
  ) {
    return "ios";
  }
  if (/Android/i.test(ua)) return "android";
  return "other";
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  return (
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
    true
  );
}

function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

function getConfiguredVapidPublicKey(): string | null {
  const key =
    window.RUNTIME_CONFIG?.VAPID_PUBLIC_KEY ??
    import.meta.env.VITE_VAPID_PUBLIC_KEY;
  return typeof key === "string" && key.trim() ? key.trim() : null;
}

/** Chrome requires an ArrayBuffer-backed view for applicationServerKey. */
function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padded = (
    base64 + "=".repeat((4 - (base64.length % 4)) % 4)
  )
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const raw = atob(padded);
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) {
    out[i] = raw.charCodeAt(i);
  }
  return out;
}

async function currentSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  const reg = await navigator.serviceWorker.ready;
  return (await reg.pushManager.getSubscription()) ?? null;
}

async function detectPushState(): Promise<PushNotificationState> {
  if (!getConfiguredVapidPublicKey()) return "unavailable";
  if (detectPlatform() === "ios" && !isStandalone()) return "needs-install";
  if (!isPushSupported()) return "unsupported";
  if (Notification.permission === "denied") return "blocked";
  const sub = await currentSubscription();
  if (!sub || Notification.permission !== "granted") return "off";
  // Browser subscription alone is not enough — server must have the endpoint.
  try {
    const registered = await getPushRegistrationStatus(sub.endpoint);
    return registered ? "on" : "off";
  } catch {
    return "off";
  }
}

function stateAfterFailedEnable(
  reason: Extract<EnableResult, { ok: false }>["reason"],
): PushNotificationState {
  if (reason === "denied") {
    return Notification.permission === "denied" ? "blocked" : "off";
  }
  if (reason === "unsupported") return "unsupported";
  if (reason === "unavailable") return "unavailable";
  return "off";
}

/**
 * Web Push opt-in for nightly results. `enable` must run from a user gesture
 * (required for the permission prompt on iOS).
 */
export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>("loading");
  const [isBusy, setIsBusy] = useState(false);

  const refresh = useCallback(() => {
    void detectPushState().then(setState);
  }, []);

  useEffect(() => {
    let alive = true;
    void detectPushState().then((next) => {
      if (alive) setState(next);
    });

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void detectPushState().then((next) => {
          if (alive) setState(next);
        });
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      alive = false;
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const enable = useCallback(async (): Promise<EnableResult> => {
    if (!isPushSupported()) {
      setState("unsupported");
      return { ok: false, reason: "unsupported" };
    }
    const key = getConfiguredVapidPublicKey();
    if (!key) {
      setState("unavailable");
      return { ok: false, reason: "unavailable" };
    }

    setIsBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        const next = stateAfterFailedEnable("denied");
        setState(next);
        return { ok: false, reason: "denied" };
      }

      // Ensure an active SW before PushManager.subscribe (throws without one).
      const reg =
        (await navigator.serviceWorker.getRegistration()) ??
        (await navigator.serviceWorker.ready);
      await navigator.serviceWorker.ready;
      if (!reg?.active && !reg?.installing && !reg?.waiting) {
        setState("off");
        return {
          ok: false,
          reason: "failed",
          detail: "Service worker is not active. Hard-refresh and try again.",
        };
      }

      const existing = await reg.pushManager.getSubscription();
      const sub =
        existing ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(key),
        }));

      const json = sub.toJSON();
      const endpoint = json.endpoint;
      const p256dh = json.keys?.p256dh;
      const auth = json.keys?.auth;
      if (!endpoint || !p256dh || !auth) {
        setState("off");
        return {
          ok: false,
          reason: "failed",
          detail: "Browser returned an incomplete push subscription.",
        };
      }

      await subscribePushNotification({
        endpoint,
        keys: { p256dh, auth },
        userAgent: navigator.userAgent,
      });

      setState("on");
      return { ok: true };
    } catch (err) {
      console.error("enablePush failed", err);
      setState("off");
      const detail =
        err && typeof err === "object" && "response" in err
          ? `Server ${(err as { response?: { status?: number } }).response?.status ?? "error"}`
          : err instanceof Error
            ? err.message
            : "Unknown error";
      return { ok: false, reason: "failed", detail };
    } finally {
      setIsBusy(false);
    }
  }, []);

  /** Unsubscribes this device only (browser subscription + server endpoint). */
  const disable = useCallback(async (): Promise<void> => {
    setIsBusy(true);
    try {
      const sub = await currentSubscription();
      if (!sub) {
        setState("off");
        return;
      }
      const endpoint = sub.endpoint;
      await sub.unsubscribe().catch(() => false);
      await unsubscribePushNotification(endpoint).catch(() => undefined);
      setState("off");
    } finally {
      setIsBusy(false);
    }
  }, []);

  return {
    state,
    isBusy,
    enable,
    disable,
    refresh,
  };
}
