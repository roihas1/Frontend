import axios from "axios";
import Cookies from "js-cookie";
import "react-toastify/dist/ReactToastify.css";

const baseUrl = window?.RUNTIME_CONFIG?.VITE_BASE_URL ? window.RUNTIME_CONFIG.VITE_BASE_URL : import.meta.env.VITE_BASE_URL
const axiosInstance = axios.create({
  baseURL: baseUrl, // Replace with your backend URL
});


const hasValidToken = (): boolean => {
  return !!Cookies.get("auth_token"); // Token is valid as long as it's in cookies
};


const isAuthRequest = (url: string) => {
  try {
    const path = new URL(url, baseUrl).pathname;
    return path.includes("/auth/signin") || path.includes("/auth/signup");
  } catch {
    return false;
  }
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
    if (isAuthRequest(config.url || "")) {
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
