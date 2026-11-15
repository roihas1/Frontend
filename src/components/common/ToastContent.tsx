import React from "react";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import ErrorRounded from "@mui/icons-material/ErrorRounded";
import InfoRounded from "@mui/icons-material/InfoRounded";
import WarningAmberRounded from "@mui/icons-material/WarningAmberRounded";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastContentProps {
  type: ToastType;
  title: string;
  message?: string;
}

const tones: Record<
  ToastType,
  { stripe: string; badge: string; Icon: typeof CheckCircleRounded }
> = {
  success: {
    stripe: "bg-colors-nba-green",
    badge: "bg-colors-nba-green/10 text-colors-nba-green",
    Icon: CheckCircleRounded,
  },
  error: {
    stripe: "bg-colors-nba-red",
    badge: "bg-colors-nba-red/10 text-colors-nba-red",
    Icon: ErrorRounded,
  },
  warning: {
    stripe: "bg-colors-nba-yellow",
    badge: "bg-colors-nba-yellow/15 text-amber-700",
    Icon: WarningAmberRounded,
  },
  info: {
    stripe: "bg-colors-nba-blue",
    badge: "bg-colors-nba-blue/10 text-colors-nba-blue",
    Icon: InfoRounded,
  },
};

const ToastContent: React.FC<ToastContentProps> = ({ type, title, message }) => {
  const tone = tones[type];
  const Icon = tone.Icon;

  return (
    <div className="relative flex w-full items-start gap-3 py-3.5 pl-4 pr-9">
      <span
        className={`absolute inset-y-2.5 left-2 w-1 rounded-full ${tone.stripe}`}
        aria-hidden
      />
      <span
        className={`mt-0.5 ml-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${tone.badge}`}
      >
        <Icon fontSize="small" />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm font-semibold leading-5 text-gray-900">{title}</p>
        {message ? (
          <p className="mt-0.5 text-sm leading-5 text-gray-600">{message}</p>
        ) : null}
      </div>
    </div>
  );
};

export default ToastContent;
