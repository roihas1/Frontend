import React, { useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import { Zoom } from "@mui/material";
import TeamDialog from "../form/TeamDialog";
import { Series } from "../../pages/HomePage";

interface MobileSeriesCardProps {
  series: Series;
  userPoints: number;
  isGuessComplete?: boolean;
  fetchData: () => void;
}

const GuessStatusIcon: React.FC<{
  isGuessComplete: boolean;
  className?: string;
}> = ({ isGuessComplete, className = "w-5 h-5" }) =>
  isGuessComplete ? (
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
  ) : (
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

const MobileSeriesCard: React.FC<MobileSeriesCardProps> = ({
  series,
  userPoints,
  isGuessComplete,
  fetchData,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const seriesScore = series.bestOf7BetId?.seriesScore ?? [0, 0];
  const [score1, score2] = seriesScore;
  const hasStarted = new Date(series.dateOfStart) <= new Date();
  const isSeriesOver = (score1 ?? 0) >= 4 || (score2 ?? 0) >= 4;
  const winnerName = (score1 ?? 0) > (score2 ?? 0) ? series.team1 : series.team2;
  const isTied = (score1 ?? 0) === (score2 ?? 0);
  const leaderName =
    (score1 ?? 0) > (score2 ?? 0) ? series.team1 : series.team2;
  const startDateLabel = new Date(series.dateOfStart).toLocaleString("he-IL", {
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

  return (
    <>
      <div
        className="relative mb-2 rounded-xl overflow-hidden border border-gray-200 shadow-sm cursor-pointer transition active:bg-gray-50"
        onClick={openDialog}
        role="button"
        tabIndex={0}
        aria-label={`${series.team1} vs ${series.team2}, ${statusText}${
          hasStarted ? `, ${userPoints} points earned` : ""
        }, tap to place bets`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openDialog();
          }
        }}
      >
        {/* Tap affordance */}
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
          {/* Team 1 */}
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

          {/* Center: status, points / CTA, guess icon */}
          <div className="flex flex-col items-center justify-center gap-1 text-center shrink-0 px-1">
            <span
              className={`font-extrabold leading-tight whitespace-nowrap ${
                hasStarted
                  ? isSeriesOver
                    ? "text-sm uppercase text-colors-nba-blue"
                    : "text-sm text-gray-900"
                  : "text-[11px] font-semibold text-gray-600"
              }`}
            >
              {statusText}
            </span>

            {hasStarted ? (
              <span className="bg-colors-nba-blue/10 text-colors-nba-blue text-xs font-bold rounded-full px-2 py-0.5">
                +{userPoints} pts
              </span>
            ) : (
              <span className="text-[10px] text-gray-400">Tap to set picks</span>
            )}

            {typeof isGuessComplete !== "undefined" && (
              <Tooltip
                title={isGuessComplete ? "Guessed all" : "Missing guesses"}
                arrow
                placement="bottom"
                enterTouchDelay={0}
                leaveTouchDelay={2000}
                slots={{ transition: Zoom }}
              >
                <div
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold cursor-default ${
                    isGuessComplete
                      ? "bg-green-50 text-green-700"
                      : "bg-yellow-50 text-yellow-800"
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <GuessStatusIcon
                    isGuessComplete={isGuessComplete}
                    className="w-3.5 h-3.5"
                  />
                  {isGuessComplete ? "Complete" : "Missing picks"}
                </div>
              </Tooltip>
            )}
          </div>

          {/* Team 2 */}
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
        closeDialog={closeDialog}
        userPoints={userPoints}
        fetchData={fetchData}
      />
    </>
  );
};

export default React.memo(MobileSeriesCard);
