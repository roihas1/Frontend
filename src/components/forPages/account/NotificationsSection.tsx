import React from "react";
import { Skeleton } from "@mui/material";
import type { PushNotificationState } from "../../../hooks/usePushNotifications";

interface NotificationsSectionProps {
  state: PushNotificationState;
  isBusy: boolean;
  onEnable: () => Promise<void>;
  onDisable: () => Promise<void>;
}

const NotificationsSection: React.FC<NotificationsSectionProps> = ({
  state,
  isBusy,
  onEnable,
  onDisable,
}) => {
  const statusMessage = (() => {
    switch (state) {
      case "needs-install":
        return "On iPhone and iPad, add Beyond The Bracket to your Home Screen, then open it from there to enable notifications.";
      case "unsupported":
        return "Push notifications aren't supported in this browser.";
      case "blocked":
        return "Notifications are blocked for this site. Enable them in your browser or device settings, then try again.";
      case "unavailable":
        return "Nightly notifications aren't available right now.";
      default:
        return null;
    }
  })();

  return (
    <section
      className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white/80 shadow-sm supports-[backdrop-filter]:bg-white/70 supports-[backdrop-filter]:backdrop-blur-xl"
      aria-busy={state === "loading" || isBusy}
    >
      <div className="border-b border-gray-100 px-4 py-3">
        <h2 className="text-base font-semibold text-colors-nba-blue">
          Notifications
        </h2>
        <p className="mt-0.5 text-xs text-gray-500">
          Get a push when last night&apos;s results and standings are ready.
        </p>
      </div>

      <div className="space-y-3 px-4 py-4">
        {state === "loading" ? (
          <Skeleton variant="rounded" height={40} />
        ) : (
          <>
            {statusMessage && (
              <p className="text-sm text-gray-600" role="status">
                {statusMessage}
              </p>
            )}

            {(state === "on" || state === "off") && (
              <p className="text-sm text-gray-600">
                {state === "on"
                  ? "Nightly updates are on for this device. On Mac, also allow banners for Beyond The Bracket in System Settings → Notifications (installed apps are separate from Chrome)."
                  : "You'll only hear from us after a completed slate is graded."}
              </p>
            )}

            {state === "on" && (
              <button
                type="button"
                onClick={() => void onDisable()}
                disabled={isBusy}
                className="w-full min-w-[10rem] rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-6 sm:py-3 sm:text-lg"
              >
                {isBusy ? "Turning off..." : "Turn off on this device"}
              </button>
            )}

            {state === "off" && (
              <button
                type="button"
                onClick={() => void onEnable()}
                disabled={isBusy}
                className="w-full min-w-[10rem] rounded-xl bg-colors-nba-blue px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-colors-nba-red disabled:cursor-not-allowed disabled:bg-gray-400 sm:w-auto sm:px-6 sm:py-3 sm:text-lg"
              >
                {isBusy ? "Enabling..." : "Enable notifications"}
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default NotificationsSection;
