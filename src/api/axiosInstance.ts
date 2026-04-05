import axios from "axios";
import Cookies from "js-cookie";
import "react-toastify/dist/ReactToastify.css";
import { getTournamentId } from "./tournamentScope";

const baseUrl = window?.RUNTIME_CONFIG?.VITE_BASE_URL ? window.RUNTIME_CONFIG.VITE_BASE_URL : import.meta.env.VITE_BASE_URL
const axiosInstance = axios.create({
  baseURL: baseUrl, // Replace with your backend URL
});


const hasValidToken = (): boolean => {
  return !!Cookies.get("auth_token"); // Token is valid as long as it's in cookies
};


const normalizePath = (path: string): string => {
  if (!path) return "/";
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
};

const resolvePath = (url: string): string => {
  try {
    return normalizePath(new URL(url, baseUrl).pathname);
  } catch {
    return "";
  }
};

const isAuthRequest = (url: string) => {
  const path = resolvePath(url);
  return path === "/auth/signin" || path === "/auth/signup";
};

const isTournamentListGetRequest = (method: string, url: string) => {
  return method === "get" && resolvePath(url) === "/tournaments";
};

const isTournamentScopedGetPath = (path: string) => {
  if (!path) return false;

  if (path === "/auth/user" || path === "/auth/standings" || path === "/auth/search") {
    return true;
  }

  if (path === "/home-page/load" || path === "/series/isUserGuessed/All") {
    return true;
  }

  return (
    path.startsWith("/playoffs-stage") ||
    path.startsWith("/comparison-page") ||
    path.startsWith("/private-league") ||
    path.startsWith("/series") ||
    path.startsWith("/user-series-points") ||
    path.startsWith("/user-missing-bets") ||
    path.startsWith("/spontaneous-guess") ||
    path.startsWith("/champions-guess")
  );
};

const isTournamentScopedMutationPath = (path: string) => {
  if (
    path === "/champions-guess/update/beforePlayoffs" ||
    path === "/champions-guess/update/afterFirstRound"
  ) {
    return true;
  }
  // Playoffs stages: POST /playoffs-stage (create), PATCH closeGuess, etc.
  if (path === "/playoffs-stage" || path.startsWith("/playoffs-stage/")) {
    return true;
  }
  return false;
};

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== "object") {
    return false;
  }
  return Object.getPrototypeOf(value) === Object.prototype;
};


const handleLogout = () => {
  alert("Your session has expired. Please log in again.");
  const username = localStorage.getItem("username");

  // Send logout request to backend
  axios.patch(`${import.meta.env.VITE_BASE_URL}auth/logout`, { username });

  
  window.dispatchEvent(new Event("forceLogout"));
  

};


axiosInstance.interceptors.request.use(
  (config) => {
    const method = (config.method || "get").toLowerCase();
    const url = config.url || "";
    const path = resolvePath(url);

    if (isAuthRequest(url)) {
      return config; // Skip token check for login/signup
    }

   
    if (!hasValidToken()) {
      handleLogout();
      return Promise.reject(new Error("Token expired, logging out..."));
    }

    const token = Cookies.get("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const tournamentId = getTournamentId();
    if (!tournamentId) {
      return config;
    }

    if (isTournamentListGetRequest(method, url)) {
      return config;
    }

    if (method === "get" && isTournamentScopedGetPath(path)) {
      const existingParams = config.params ?? {};
      if (typeof existingParams === "object" && existingParams !== null && !("tournamentId" in existingParams)) {
        config.params = {
          ...existingParams,
          tournamentId,
        };
      }
    }

    if ((method === "post" || method === "patch") && isTournamentScopedMutationPath(path)) {
      if (isPlainObject(config.data) && !("tournamentId" in config.data)) {
        config.data = {
          ...config.data,
          tournamentId,
        };
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);


axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      handleLogout(); // Log out on unauthorized access
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
