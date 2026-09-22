import Cookies from "js-cookie";
import { resetSessionExpiryHandling } from "../api/axiosInstance";
import {
  AUTH_EXPIRES_AT_KEY,
  getOrCreateAuthTabId,
  publishAuthSyncEvent,
} from "./sessionSync";

export const decodeJwtExpMs = (token: string): number | null => {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) {
      return null;
    }
    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const decoded = atob(padded);
    const payload = JSON.parse(decoded) as { exp?: unknown };
    if (typeof payload.exp === "number" && Number.isFinite(payload.exp)) {
      return payload.exp * 1000;
    }
    return null;
  } catch {
    return null;
  }
};

export const parseExpiresInMs = (expiresIn: string | number): number => {
  if (typeof expiresIn === "number" && Number.isFinite(expiresIn)) {
    return expiresIn * 1000;
  }

  const trimmed = String(expiresIn).trim().toLowerCase();
  if (!trimmed) {
    return 0;
  }
  if (trimmed.endsWith("d")) {
    const days = Number(trimmed.slice(0, -1));
    if (Number.isFinite(days)) {
      return days * 24 * 60 * 60 * 1000;
    }
  }
  if (trimmed.endsWith("h")) {
    const hours = Number(trimmed.slice(0, -1));
    if (Number.isFinite(hours)) {
      return hours * 60 * 60 * 1000;
    }
  }
  if (trimmed.endsWith("s")) {
    const seconds = Number(trimmed.slice(0, -1));
    if (Number.isFinite(seconds)) {
      return seconds * 1000;
    }
  }
  const numeric = Number(trimmed);
  if (Number.isFinite(numeric)) {
    return numeric * 1000;
  }
  return 0;
};

export type CompleteLoginSessionInput = {
  accessToken: string;
  expiresIn?: string | number | null;
  username: string;
  userRole: string;
};

export const completeLoginSession = ({
  accessToken,
  expiresIn,
  username,
  userRole,
}: CompleteLoginSessionInput): { expiresAt: number } => {
  const expiresInMs =
    expiresIn === undefined || expiresIn === null
      ? 0
      : parseExpiresInMs(expiresIn);
  const expiresAt = decodeJwtExpMs(accessToken) ?? Date.now() + expiresInMs;
  const remainingMs = Math.max(1000, expiresAt - Date.now());
  const expiresInDays = remainingMs / (24 * 60 * 60 * 1000);

  Cookies.set("auth_token", accessToken, {
    expires: expiresInDays,
  });
  localStorage.setItem(AUTH_EXPIRES_AT_KEY, String(expiresAt));
  localStorage.setItem("username", username);
  localStorage.setItem("role", userRole);
  Cookies.remove("tokenExpiry");

  resetSessionExpiryHandling();
  publishAuthSyncEvent("login", getOrCreateAuthTabId());

  return { expiresAt };
};
