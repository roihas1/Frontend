import axios from "axios";

const MISSING_TOKEN_MESSAGE = "Unauthorized: missing auth token";

const serverMessage = (data: unknown): string | null => {
  if (!data || typeof data !== "object") {
    return null;
  }
  const message = (data as { message?: unknown }).message;
  if (Array.isArray(message)) {
    const parts = message.filter(
      (part): part is string => typeof part === "string" && part.trim().length > 0,
    );
    return parts.length > 0 ? parts.join(", ") : null;
  }
  if (typeof message === "string" && message.trim().length > 0) {
    return message;
  }
  return null;
};

const requestPath = (url?: string): string => {
  if (!url) {
    return "";
  }
  const withoutQuery = url.split("?")[0];
  try {
    const pathname = new URL(withoutQuery, "http://localhost").pathname;
    return pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;
  } catch {
    return withoutQuery.replace(/\/+$/, "");
  }
};

/**
 * Turns an unknown failure into copy a player can act on.
 * Returns null when the caller should stay quiet (missing token, or a 401
 * that the session-expiry flow already explains).
 */
export function getErrorMessage(error: unknown, fallback: string): string | null {
  if (error instanceof Error && error.message === MISSING_TOKEN_MESSAGE) {
    return null;
  }

  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  if (!error.response) {
    return "Can't reach the server. Check your connection.";
  }

  const status = error.response.status;
  const path = requestPath(error.config?.url);
  const fromServer = serverMessage(error.response.data);

  if (status === 401) {
    if (path === "/auth/signin") {
      return fromServer ?? "Wrong email or password.";
    }
    if (path === "/auth/signup") {
      return fromServer ?? fallback;
    }
    return null;
  }

  if (status === 403) {
    return "You don't have permission to do that.";
  }

  if (status >= 500) {
    return "Something went wrong on our side. Try again in a moment.";
  }

  if (status === 400 || status === 404 || status === 409) {
    return fromServer ?? fallback;
  }

  return fromServer ?? fallback;
}
