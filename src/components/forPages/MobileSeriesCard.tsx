import React, { useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import { Zoom } from "@mui/material";
import TeamDialog from "../form/TeamDialog";
import { Series, getSeriesStartAt } from "../../pages/HomePage";

export type SeriesGuessStatus = "complete" | "missing" | "no_bets";

interface MobileSeriesCardProps {
  series: Series;
  userPoints: number;
  guessStatus: SeriesGuessStatus;
  fetchData: () => void;
}

const GuessStatusIcon: React.FC<{
  guessStatus: SeriesGuessStatus;
  className?: string;
}> = ({ guessStatus, className = "w-5 h-5" }) => {
  if (guessStatus === "complete") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className={className}
      >
        <circle cx="12" cy="12" r="9" fill="green" />
        <path
          d="M9 12.75L11.25 15L15 9.75"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    );
  }

  if (guessStatus === "no_bets") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className={className}
      >
        <circle cx="12" cy="12" r="9" fill="#9CA3AF" />
        <path
          fill="white"
          d="M12 7.5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0112 7.5zm0 9a.75.75 0 100-1.5.75.75 0 000 1.5z"
        />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <circle cx="12" cy="12" r="9" fill="#FDB927" />
      <path
        fill="white"
        d="M12 7.5C12.4142 7.5 12.75 7.83579 12.75 8.25V14.25C12.75 14.6642 12.4142 15 12 15C11.5858 15 11.25 14.6642 11.25 14.25V8.25C11.25 7.83579 11.5858 7.5 12 7.5ZM12 17.25C12.4142 17.25 12.75 17.5858 12.75 18C12.75 18.4142 12.4142 18.75 12 18.75C11.5858 18.75 11.25 18.4142 11.25 18C11.25 17.5858 11.5858 17.25 12 17.25Z"
      />
    </svg>
  );
};

const statusMeta: Record<
  SeriesGuessStatus,
  { title: string; label: string; className: string }
> = {
  complete: {
    title: "Guessed all open picks",
    label: "Complete",
    className: "bg-green-50 text-green-700",
  },
  missing: {
    title: "Missing open picks",
    label: "Missing picks",
    className: "bg-yellow-50 text-yellow-800",
  },
  no_bets: {
    title: "No open picks for this series yet",
    label: "No open picks",
    className: "bg-gray-100 text-gray-600",
  },
};

const MobileSeriesCard: React.FC<MobileSeriesCardProps> = ({
  series,
  userPoints,
  guessStatus,
  fetchData,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const seriesScore = series.bestOf7BetId?.seriesScore ?? [0, 0];
  const [score1, score2] = seriesScore;
  const hasStarted = getSeriesStartAt(series) <= new Date();
  const isSeriesOver = (score1 ?? 0) >= 4 || (score2 ?? 0) >= 4;
  const winnerName = (score1 ?? 0) > (score2 ?? 0) ? series.team1 : series.team2;
  const isTied = (score1 ?? 0) === (score2 ?? 0);
  const leaderName =
    (score1 ?? 0) > (score2 ?? 0) ? series.team1 : series.team2;
  const startDateLabel = getSeriesStartAt(series).toLocaleString("he-IL", {
    timeZone: "Asia/Jerusalem",
  });

  const statusText = hasStarted
    ? isSeriesOver
      ? `${winnerName} WINS ${score1 ?? 0}-${score2 ?? 0}`
      : isTied
        ? `Tied ${score1 ?? 0}-${score2 ?? 0}`
        : `${leaderName} leads ${Math.max(score1 ?? 0, score2 ?? 0)}-${Math.min(
            score1 ?? 0,
            score2 ?? 0,
          )}`
    : `Starts ${startDateLabel}`;

  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => setIsDialogOpen(false);
  const meta = statusMeta[guessStatus] ?? statusMeta.no_bets;

  return (
    <>
      <div
        className="relative mb-2 rounded-xl overflow-hidden border border-gray-200 shadow-sm cursor-pointer transition active:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-colors-nba-blue"
        onClick={openDialog}
        role="button"
        tabIndex={0}
        aria-label={`${series.team1} vs ${series.team2}, ${statusText}${
          hasStarted ? `, ${userPoints} points earned` : ""
        }, ${meta.label}, tap to place bets`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openDialog();
          }
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="absolute right-2 top-1/2 -translate-y-1/2 size-4 text-gray-300 pointer-events-none"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m8.25 4.5 7.5 7.5-7.5 7.5"
          />
        </svg>

        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 px-3 py-4 pr-7">
          <div className="flex flex-col items-center gap-0.5 min-w-0">
            <img
              src={series.logo1}
              alt={series.team1}
              className="w-12 h-12 object-contain"
              loading="lazy"
            />
            <span className="text-sm font-bold text-gray-900 truncate max-w-full">
              {series.team1}
            </span>
            <span className="text-xs text-gray-500">#{series.seed1}</span>
          </div>

          <div className="flex flex-col items-center justify-center gap-1 text-center shrink-0 px-1">
            <span
              className={`font-extrabold leading-tight ${
                hasStarted
                  ? isSeriesOver
                    ? "text-sm uppercase text-colors-nba-blue"
                    : "text-sm text-gray-900"
                  : "text-xs font-semibold text-gray-600"
              }`}
            >
              {statusText}
            </span>

            {hasStarted ? (
              <span className="bg-colors-nba-blue/10 text-colors-nba-blue text-xs font-bold rounded-full px-2 py-0.5">
                +{userPoints} pts
              </span>
            ) : (
              <>
                <span className="text-xs text-gray-400">Tap to set picks</span>
                <Tooltip
                  title={meta.title}
                  arrow
                  placement="bottom"
                  enterTouchDelay={0}
                  leaveTouchDelay={2000}
                  slots={{ transition: Zoom }}
                >
                  <div
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold cursor-default ${meta.className}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <GuessStatusIcon
                      guessStatus={guessStatus}
                      className="w-3.5 h-3.5"
                    />
                    {meta.label}
                  </div>
                </Tooltip>
              </>
            )}
          </div>

          <div className="flex flex-col items-center gap-0.5 min-w-0">
            <img
              src={series.logo2}
              alt={series.team2}
              className="w-12 h-12 object-contain"
              loading="lazy"
            />
            <span className="text-sm font-bold text-gray-900 truncate max-w-full">
              {series.team2}
            </span>
            <span className="text-xs text-gray-500">#{series.seed2}</span>
          </div>
        </div>
      </div>

      <TeamDialog
        isOpen={isDialogOpen}
        series={series}
        userPoints={userPoints}
        closeDialog={closeDialog}
        fetchData={fetchData}
      />
    </>
  );
};

export default MobileSeriesCard;
