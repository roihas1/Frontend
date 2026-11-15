import React, { createContext, useContext, type ReactNode } from "react";
import { useMediaQuery, useTheme } from "@mui/material";
import CloseRounded from "@mui/icons-material/CloseRounded";
import {
  Slide,
  ToastContainer,
  type CloseButtonProps,
} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { notify } from "../common/notify";

interface NotificationContextType {
  showError: (title: string, message?: string) => void;
  showSuccessMessage: (title: string, message?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

const notificationApi: NotificationContextType = {
  showError: (title, message) => notify.error(title, message),
  showSuccessMessage: (title, message) => notify.success(title, message),
};

const ToastCloseButton: React.FC<CloseButtonProps> = ({
  closeToast,
  ariaLabel,
}) => (
  <button
    type="button"
    aria-label={ariaLabel ?? "Close"}
    onClick={closeToast}
    className="absolute right-2 top-2 rounded-full p-1.5 text-gray-400 hover:bg-black/5 hover:text-gray-700"
  >
    <CloseRounded sx={{ fontSize: 16 }} />
  </button>
);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <NotificationContext.Provider value={notificationApi}>
      {children}
      <ToastContainer
        position={isMobile ? "top-center" : "top-right"}
        newestOnTop
        limit={3}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
        icon={false}
        transition={Slide}
        closeButton={ToastCloseButton}
        aria-label="Notifications"
      />
    </NotificationContext.Provider>
  );
};

export const useError = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useError must be used within a NotificationProvider");
  }
  return { showError: context.showError };
};

export const useSuccessMessage = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useSuccessMessage must be used within a NotificationProvider",
    );
  }
  return { showSuccessMessage: context.showSuccessMessage };
};
