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
    badge: "bg-colors-nba-green/20 text-colors-nba-green",
    Icon: CheckCircleRounded,
  },
  error: {
    stripe: "bg-colors-nba-red",
    badge: "bg-colors-nba-red/25 text-red-300",
    Icon: ErrorRounded,
  },
  warning: {
    stripe: "bg-colors-nba-yellow",
    badge: "bg-colors-nba-yellow/20 text-colors-nba-yellow",
    Icon: WarningAmberRounded,
  },
  info: {
    stripe: "bg-colors-nba-sky",
    badge: "bg-colors-nba-sky/20 text-colors-nba-sky",
    Icon: InfoRounded,
  },
};

const ToastContent: React.FC<ToastContentProps> = ({ type, title, message }) => {
  const tone = tones[type];
  const Icon = tone.Icon;

  return (
    <div className="relative flex w-full items-start gap-3 py-3 pl-4 pr-8">
      <span
        className={`absolute inset-y-0 left-0 w-1.5 ${tone.stripe}`}
        aria-hidden
      />
      <span
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tone.badge}`}
      >
        <Icon fontSize="small" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold leading-5 text-white">{title}</p>
        {message ? (
          <p className="mt-0.5 text-sm leading-5 text-white/75">{message}</p>
        ) : null}
      </div>
    </div>
  );
};

export default ToastContent;
