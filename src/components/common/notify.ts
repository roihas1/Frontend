import { createElement } from "react";
import { toast, type TypeOptions } from "react-toastify";
import ToastContent, { type ToastType } from "./ToastContent";

const autoCloseMs: Record<ToastType, number> = {
  success: 3500,
  info: 4000,
  warning: 5000,
  error: 6000,
};

const show = (type: ToastType, title: string, message?: string) => {
  toast(createElement(ToastContent, { type, title, message }), {
    type: type as TypeOptions,
    autoClose: autoCloseMs[type],
    toastId: `${type}:${title}:${message ?? ""}`,
    icon: false,
  });
};

export const notify = {
  success: (title: string, message?: string) => show("success", title, message),
  error: (title: string, message?: string) => show("error", title, message),
  warning: (title: string, message?: string) => show("warning", title, message),
  info: (title: string, message?: string) => show("info", title, message),
};
