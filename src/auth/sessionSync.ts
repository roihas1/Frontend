export const AUTH_EXPIRES_AT_KEY = "auth_expires_at";
export const AUTH_SYNC_EVENT_KEY = "auth_sync_event";
export const AUTH_SYNC_CHANNEL = "auth_sync";
const AUTH_TAB_ID_KEY = "auth_tab_id";

export type AuthSyncReason = "manual" | "sessionExpired";
export type AuthSyncType = "login" | "logout";

export type AuthSyncEventPayload = {
  id: string;
  type: AuthSyncType;
  reason?: AuthSyncReason;
  at: number;
  sourceId: string;
};

const createEventId = () => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const getOrCreateAuthTabId = () => {
  // Keep one stable tab id in sessionStorage so this tab
  // can ignore its own cross-tab events.
  const existing = sessionStorage.getItem(AUTH_TAB_ID_KEY);
  if (existing) {
    return existing;
  }
  const next = createEventId();
  sessionStorage.setItem(AUTH_TAB_ID_KEY, next);
  return next;
};

export const publishAuthSyncEvent = (
  type: AuthSyncType,
  sourceId: string,
  reason?: AuthSyncReason
) => {
  // One payload contract is shared by BroadcastChannel and storage fallback.
  const payload: AuthSyncEventPayload = {
    id: createEventId(),
    type,
    reason,
    at: Date.now(),
    sourceId,
  };

  // storage writes propagate to other tabs through the `storage` event.
  localStorage.setItem(AUTH_SYNC_EVENT_KEY, JSON.stringify(payload));

  if (typeof BroadcastChannel !== "undefined") {
    // BroadcastChannel gives faster propagation when supported.
    const channel = new BroadcastChannel(AUTH_SYNC_CHANNEL);
    channel.postMessage(payload);
    channel.close();
  }
};

export const parseAuthSyncEvent = (value: unknown): AuthSyncEventPayload | null => {
  // Defensive parsing prevents malformed payloads from breaking auth flow.
  if (typeof value !== "string") {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<AuthSyncEventPayload>;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    if (
      typeof parsed.id !== "string" ||
      typeof parsed.type !== "string" ||
      typeof parsed.at !== "number" ||
      typeof parsed.sourceId !== "string"
    ) {
      return null;
    }
    if (parsed.type !== "login" && parsed.type !== "logout") {
      return null;
    }
    if (
      parsed.reason !== undefined &&
      parsed.reason !== "manual" &&
      parsed.reason !== "sessionExpired"
    ) {
      return null;
    }
    return {
      id: parsed.id,
      type: parsed.type,
      reason: parsed.reason,
      at: parsed.at,
      sourceId: parsed.sourceId,
    };
  } catch {
    return null;
  }
};
