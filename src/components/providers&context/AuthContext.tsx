// src/components/providers&context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  AUTH_EXPIRES_AT_KEY,
  AUTH_SYNC_CHANNEL,
  AUTH_SYNC_EVENT_KEY,
  AuthSyncReason,
  getOrCreateAuthTabId,
  parseAuthSyncEvent,
  publishAuthSyncEvent,
} from "../../auth/sessionSync";

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  checkAuthStatus: () => void;
  logout: (options?: LogoutOptions) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type LogoutOptions = {
  sessionExpired?: boolean;
  reason?: AuthSyncReason;
  skipSync?: boolean;
};

type ForceLogoutDetail = {
  sessionExpired?: boolean;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  // Guards duplicate logout side effects (clear + navigate) from parallel triggers.
  const isLogoutHandledRef = useRef(false);
  // Tracks the active auto-logout timeout driven by auth_expires_at.
  const logoutTimerRef = useRef<number | null>(null);
  // Reused channel instance for BroadcastChannel listener lifecycle.
  const syncChannelRef = useRef<BroadcastChannel | null>(null);
  // Stable tab id used to ignore self-originated sync events.
  const tabSourceIdRef = useRef(getOrCreateAuthTabId());
  // Dedupe repeated events that may arrive from both BC + storage.
  const lastHandledSyncIdRef = useRef<string | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const clearLogoutTimer = useCallback(() => {
    if (logoutTimerRef.current !== null) {
      window.clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  }, []);

  // Function to check authentication status
  const checkAuthStatus = useCallback(() => {
    const token = Cookies.get("auth_token");
    setIsLoggedIn(!!token); // True if token exists, false otherwise
    if (token) {
      isLogoutHandledRef.current = false;
    }
  }, []);

  const logout = useCallback((options?: LogoutOptions) => {
    if (isLogoutHandledRef.current) {
      return;
    }
    isLogoutHandledRef.current = true;
    clearLogoutTimer();
    Cookies.remove("auth_token");
    Cookies.remove("tokenExpiry");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    localStorage.removeItem(AUTH_EXPIRES_AT_KEY);
    setIsLoggedIn(false);
    queryClient.clear();
    if (!options?.skipSync) {
      // Notify other tabs, unless this logout came from a remote sync event.
      publishAuthSyncEvent(
        "logout",
        tabSourceIdRef.current,
        options?.reason ?? (options?.sessionExpired ? "sessionExpired" : "manual")
      );
    }
    navigate("/login", {
      replace: true,
      state: options?.sessionExpired ? { sessionExpired: true } : null,
    });
  }, [clearLogoutTimer, navigate, queryClient]);

  const scheduleLogoutFromStoredExpiry = useCallback(() => {
    clearLogoutTimer();
    // auth_expires_at is an absolute timestamp in ms.
    const raw = localStorage.getItem(AUTH_EXPIRES_AT_KEY);
    if (!raw) {
      return;
    }

    const expiresAt = Number(raw);
    if (!Number.isFinite(expiresAt) || expiresAt <= 0) {
      localStorage.removeItem(AUTH_EXPIRES_AT_KEY);
      return;
    }

    const token = Cookies.get("auth_token");
    if (!token) {
      return;
    }

    const delay = expiresAt - Date.now();
    if (delay <= 0) {
      // Expired while app was rehydrating or idle in background.
      logout({ sessionExpired: true, reason: "sessionExpired" });
      return;
    }

    logoutTimerRef.current = window.setTimeout(() => {
      logout({ sessionExpired: true, reason: "sessionExpired" });
    }, delay);
  }, [clearLogoutTimer, logout]);

  // Initial check on component mount
  useEffect(() => {
    checkAuthStatus();
    scheduleLogoutFromStoredExpiry();

    const handleForceLogout = (event: Event) => {
      const customEvent = event as CustomEvent<ForceLogoutDetail>;
      const sessionExpired = !!customEvent.detail?.sessionExpired;
      logout({
        sessionExpired,
        reason: sessionExpired ? "sessionExpired" : "manual",
      });
    };

    const handleSyncPayload = (payloadValue: unknown) => {
      const payload = parseAuthSyncEvent(payloadValue);
      if (!payload || payload.sourceId === tabSourceIdRef.current) {
        return;
      }
      if (lastHandledSyncIdRef.current === payload.id) {
        return;
      }
      lastHandledSyncIdRef.current = payload.id;

      if (payload.type === "logout") {
        // skipSync prevents sync loops between tabs.
        logout({
          sessionExpired: payload.reason === "sessionExpired",
          reason: payload.reason ?? "manual",
          skipSync: true,
        });
        return;
      }

      if (payload.type === "login") {
        // Another tab logged in: refresh local auth state + timer.
        checkAuthStatus();
        scheduleLogoutFromStoredExpiry();
      }
    };

    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key !== AUTH_SYNC_EVENT_KEY || !event.newValue) {
        return;
      }
      handleSyncPayload(event.newValue);
    };

    if (typeof BroadcastChannel !== "undefined") {
      // Prefer BroadcastChannel for realtime sync.
      syncChannelRef.current = new BroadcastChannel(AUTH_SYNC_CHANNEL);
      syncChannelRef.current.onmessage = (event: MessageEvent<unknown>) => {
        handleSyncPayload(event.data);
      };
    }

    window.addEventListener("forceLogout", handleForceLogout);
    window.addEventListener("storage", handleStorageEvent);
    return () => {
      window.removeEventListener("forceLogout", handleForceLogout);
      window.removeEventListener("storage", handleStorageEvent);
      syncChannelRef.current?.close();
      syncChannelRef.current = null;
      clearLogoutTimer();
    };
  }, [checkAuthStatus, clearLogoutTimer, logout, scheduleLogoutFromStoredExpiry]);

  useEffect(() => {
    if (isLoggedIn) {
      // Re-schedule when auth flips to logged-in (e.g. after login or tab sync).
      scheduleLogoutFromStoredExpiry();
      return;
    }
    clearLogoutTimer();
  }, [clearLogoutTimer, isLoggedIn, scheduleLogoutFromStoredExpiry]);

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, setIsLoggedIn, checkAuthStatus, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
