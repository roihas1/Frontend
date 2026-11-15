import { createElement } from "react";
import { toast, type TypeOptions } from "react-toastify";
import ToastContent, { type ToastType } from "./ToastContent";

const autoCloseMs: Record<ToastType, number> = {
  success: 2000,
  info: 2000,
  warning: 3000,
  error: 4000,
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
