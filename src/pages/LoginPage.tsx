import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axiosInstance, { resetSessionExpiryHandling } from "../api/axiosInstance";
import { useError } from "../components/providers&context/ErrorProvider";
import AuthCard from "../components/Layout/AuthCard";
import FormInput from "../components/form/FormInput";
import SubmitButton from "../components/common/SubmitButton";
import { useSuccessMessage } from "../components/providers&context/successMassageProvider";
import { useUser } from "../components/providers&context/userContext";
import Cookies from "js-cookie";
import Logo from "../assets/siteLogo/gray_trans.png"; // ✅ Logo added back
import { Divider } from "@mui/material";
import googleLogo from "../assets/logos/search.png";
import { useAuth } from "../components/providers&context/AuthContext";
import {
  AUTH_EXPIRES_AT_KEY,
  getOrCreateAuthTabId,
  publishAuthSyncEvent,
} from "../auth/sessionSync";

const decodeJwtExpMs = (token: string): number | null => {
  try {
    // Read JWT expiry directly when available, so timer matches server token.
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

const parseExpiresInMs = (expiresIn: string): number => {
  // Fallback for APIs that return relative expiry strings (e.g. "7d", "12h").
  const trimmed = expiresIn.trim().toLowerCase();
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
  const numeric = Number(trimmed);
  if (Number.isFinite(numeric)) {
    return numeric * 1000;
  }
  return 0;
};

const LoginPage: React.FC = () => {
  // Typed state variables
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const { showError } = useError();
  const navigate = useNavigate();
  const { showSuccessMessage } = useSuccessMessage();
  const { setRole } = useUser();
  const { setIsLoggedIn, checkAuthStatus } = useAuth();
  const location = useLocation();

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  useEffect(() => {
    if (location.state && (location.state as { sessionExpired?: boolean }).sessionExpired) {
      // Show expiry message once, then clear navigation state to avoid repeats.
      showError("Session expired, please log in again.");
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate, showError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axiosInstance.post("/auth/signin", {
        username,
        password,
      });
      const { accessToken, expiresIn, userRole } = response.data;
      // Prefer JWT exp; fallback to expiresIn so auto-logout always has a deadline.
      const expiresInMs = parseExpiresInMs(expiresIn);
      const expiresAt = decodeJwtExpMs(accessToken) ?? Date.now() + expiresInMs;
      const expiresInSeconds = Math.max(
        1,
        Math.ceil((expiresAt - Date.now()) / 1000)
      );

      Cookies.set("auth_token", accessToken, { expires: expiresInSeconds / (24 * 60 * 60) });
      // Persist absolute expiry for timer-based logout in AuthContext.
      localStorage.setItem(AUTH_EXPIRES_AT_KEY, String(expiresAt));
      localStorage.setItem("username", username);
      localStorage.setItem("role", userRole);
      await Promise.all([
        axiosInstance.patch(`/user-missing-bets/user/updateBets`),
        axiosInstance.patch(`/user-series-points/user/updatePoints`),
      ]);
      setRole(userRole);
      setIsLoggedIn(true);
      resetSessionExpiryHandling();
      // Tell other tabs to refresh auth state and reschedule their timers.
      publishAuthSyncEvent("login", getOrCreateAuthTabId());
      checkAuthStatus();
      showSuccessMessage("Logged in successfully!");
      navigate("/home");
    } catch (err) {
      if (err instanceof Error) {
        showError("Failed to login: " + err.message);
      } else {
        showError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const baseUrl = window?.RUNTIME_CONFIG?.VITE_BASE_URL ? window.RUNTIME_CONFIG.VITE_BASE_URL : import.meta.env.VITE_BASE_URL
      window.location.href = `${baseUrl}auth/google/login`;
    } catch {
      showError(`Failed to login with Google. Try again later.`);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center  w-full bg-gray-100 p-4 sm:p-8">
      {/* Left Side: Login Form */}
      <div className="w-full md:w-3/5 flex flex-col items-center justify-center">
        <AuthCard title="Login" description="Welcome back! Please log in.">
          <form onSubmit={handleSubmit} className="space-y-4 mb-4 w-full">
            <FormInput
              id="username"
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              
            />
            <FormInput
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            
            />
            <div className="flex justify-center">
              <SubmitButton loading={loading} text="Login" onClick={() => {}} className="w-full sm:w-auto" />
            </div>
          </form>

          <div className="my-4 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/signup" className="text-colors-nba-blue hover:text-colors-nba-red">
                Sign Up
              </Link>
            </p>
          </div>
          <Divider className="text-gray-400 text-xs">or continue with</Divider>
          <div className="flex justify-center mt-4">
            <button onClick={handleGoogleLogin} className="w-12 h-12 flex items-center justify-center border border-gray-300 rounded-xl p-2 hover:opacity-80">
              <img src={googleLogo} alt="Google Login" className="w-8 h-8" />
            </button>
          </div>
        </AuthCard>
      </div>

      {/* Right Side: Logo (Hidden on Mobile) */}
      <div className="hidden sm:flex w-3/5 items-center justify-center">
        <img src={Logo} alt="app logo" className="w-4/5 max-w-xs md:max-w-2xl" />
      </div>
    </div>
  );
};

export default LoginPage;
