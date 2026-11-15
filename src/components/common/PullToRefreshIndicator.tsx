import React from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  progress: number;
  isRefreshing: boolean;
}

const PullToRefreshIndicator: React.FC<PullToRefreshIndicatorProps> = ({
  pullDistance,
  progress,
  isRefreshing,
}) => {
  if (pullDistance <= 0 && !isRefreshing) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-[max(4.75rem,calc(env(safe-area-inset-top)+3.5rem))] z-[55] flex justify-center xl:hidden"
      style={{
        transform: `translateY(${Math.max(pullDistance * 0.35, 0)}px)`,
        opacity: Math.max(progress, isRefreshing ? 1 : 0.35),
      }}
      aria-live={isRefreshing ? "polite" : undefined}
    >
      <div className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/95 px-3.5 py-2 text-xs font-semibold text-colors-nba-blue shadow-glass supports-[backdrop-filter]:bg-white/70 supports-[backdrop-filter]:backdrop-blur-xl">
        <ArrowPathIcon
          className={`h-4 w-4 ${isRefreshing || progress >= 1 ? "animate-spin" : ""}`}
          style={
            !isRefreshing
              ? { transform: `rotate(${progress * 220}deg)` }
              : undefined
          }
          aria-hidden
        />
        <span>{isRefreshing ? "Refreshing…" : "Release to refresh"}</span>
      </div>
    </div>
  );
};

export default PullToRefreshIndicator;
