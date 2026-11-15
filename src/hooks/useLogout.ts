import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../components/providers&context/AuthContext";
import {
  useError,
  useSuccessMessage,
} from "../components/providers&context/NotificationProvider";
import { useUser } from "../components/providers&context/userContext";

export const useLogout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { setRole } = useUser();
  const { showError } = useError();
  const { showSuccessMessage } = useSuccessMessage();

  const handleLogout = async () => {
    try {
      await axiosInstance.patch("/auth/logout", {
        username: localStorage.getItem("username"),
      });
    } catch (error) {
      const status = (error as AxiosError)?.response?.status;
      if (status !== 401) {
        showError("Couldn't log you out.", "Try again in a moment.");
        return;
      }
      // 401 means token is already invalid; continue local logout for clean UX.
    }
    showSuccessMessage("Logged out.", "See you at tip-off!");
    logout({ reason: "manual" });
    setRole("");
    navigate("/");
  };

  return { handleLogout };
};
