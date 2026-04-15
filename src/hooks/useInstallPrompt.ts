import { useCallback, useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isIosOrIpados(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/i.test(ua)) return true;
  // iPadOS 13+ may report as Mac with touch
  if (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) {
    return true;
  }
  return false;
}

function isRunningAsInstalledPwa(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  return (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [iosOrIpados, setIosOrIpados] = useState(false);
  const [standalonePwa, setStandalonePwa] = useState(false);

  useEffect(() => {
    setIosOrIpados(isIosOrIpados());
    setStandalonePwa(isRunningAsInstalledPwa());
  }, []);

  useEffect(() => {
    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onAppInstalled = () => setDeferredPrompt(null);

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  /** Android / desktop Chromium only — not available on iPhone (any browser). */
  const isInstallAvailable = deferredPrompt !== null;

  /** Show Share → Add to Home Screen copy; all iOS browsers use WebKit (no install API). */
  const showIosManualInstallHint =
    iosOrIpados && !standalonePwa && !isInstallAvailable;

  return {
    isInstallAvailable,
    promptInstall,
    showIosManualInstallHint,
  };
}
