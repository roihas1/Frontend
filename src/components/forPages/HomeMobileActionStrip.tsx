import React from "react";
import { Skeleton } from "@mui/material";
import { useLeagueStandingsPreview } from "../providers&context/LeagueStandingsPreviewContext";

interface HomeMobileActionStripProps {
  hasPlayoffStages: boolean;
  hasGuessedChampions: boolean | null;
  stage: string;
  totalSeriesPoints: number;
  nextSeriesMatchupLabel: string | null;
  nextSeriesStartLabel: string | null;
  onOpenStandings: () => void;
  onOpenChampions: () => void;
}

const cellClassName =
  "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-2 py-3 text-center active:bg-black/5";

const HomeMobileActionStrip: React.FC<HomeMobileActionStripProps> = ({
  hasPlayoffStages,
  hasGuessedChampions,
  stage,
  totalSeriesPoints,
  nextSeriesMatchupLabel,
  nextSeriesStartLabel,
  onOpenStandings,
  onOpenChampions,
}) => {
  const { standingsPreview, standingsPreviewLoading } =
    useLeagueStandingsPreview();

  const privateLeagues = standingsPreview?.privateLeagues ?? [];
  const hasPrivateLeagues = privateLeagues.length > 0;
  const globalLabel = standingsPreview?.global.label?.trim() || "Global";

  const rankLabel = !standingsPreview
    ? "—"
    : hasPrivateLeagues
      ? privateLeagues.map((league) => `#${league.position}`).join(" · ")
      : `#${standingsPreview.global.position}`;

  const rankSubtitle = !standingsPreview
    ? `${totalSeriesPoints} pts`
    : hasPrivateLeagues
      ? privateLeagues.length === 1
        ? privateLeagues[0].name
        : `${privateLeagues.length} private leagues`
      : `${globalLabel} · ${standingsPreview.global.totalPoints} pts`;

  const championsNeedsGuess = hasGuessedChampions === false;
  const championsLoading =
    hasPlayoffStages && stage !== "Finish" && hasGuessedChampions === null;

  return (
    <section
      aria-label="Home overview"
      className="mb-3 overflow-hidden rounded-2xl border border-gray-200/80 bg-white/80 shadow-sm supports-[backdrop-filter]:bg-white/70 supports-[backdrop-filter]:backdrop-blur-xl"
    >
      <div className="grid grid-cols-2 divide-x divide-gray-200/80">
        <button
          type="button"
          onClick={onOpenStandings}
          className={cellClassName}
          aria-label="Open your standings"
        >
          <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            {hasPrivateLeagues ? "Private" : "Rank"}
          </span>
          {standingsPreviewLoading ? (
            <Skeleton variant="text" width={48} height={22} />
          ) : (
            <span className="max-w-full truncate text-base font-bold tabular-nums text-colors-nba-blue">
              {rankLabel}
            </span>
          )}
          <span className="max-w-full truncate text-[11px] text-gray-500">
            {standingsPreviewLoading ? "…" : rankSubtitle}
          </span>
        </button>

        {hasPlayoffStages ? (
          championsLoading ? (
            <div className={cellClassName} aria-busy="true">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                Champions
              </span>
              <Skeleton variant="rounded" width={56} height={22} />
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenChampions}
              className={`${cellClassName} ${
                championsNeedsGuess ? "bg-colors-nba-yellow/25" : ""
              }`}
              aria-label={
                championsNeedsGuess
                  ? "Guess the champions"
                  : "View my champion picks"
              }
            >
              <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                Champions
              </span>
              <span
                className={`text-sm font-bold leading-tight ${
                  championsNeedsGuess
                    ? "text-gray-900"
                    : "text-colors-nba-blue"
                }`}
              >
                {championsNeedsGuess ? "Guess now" : "My picks"}
              </span>
              <span className="text-[11px] text-gray-500">
                {championsNeedsGuess ? "Tap to enter" : "Review / edit"}
              </span>
            </button>
          )
        ) : (
          <div className={cellClassName}>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
              Champions
            </span>
            <span className="text-sm font-semibold text-gray-400">Soon</span>
            <span className="text-[11px] text-gray-400">Stages pending</span>
          </div>
        )}
      </div>

      <div
        className="flex items-center justify-between gap-3 border-t border-gray-200/80 px-3 py-2.5"
        aria-label="Next series to start"
      >
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            Next tip-off
          </p>
          <p
            className={`truncate text-sm font-semibold ${
              nextSeriesMatchupLabel ? "text-gray-900" : "text-gray-400"
            }`}
          >
            {nextSeriesMatchupLabel ?? "No upcoming series"}
          </p>
        </div>
        {nextSeriesStartLabel ? (
          <p className="shrink-0 text-right text-xs font-medium tabular-nums text-colors-nba-blue">
            {nextSeriesStartLabel}
          </p>
        ) : null}
      </div>
    </section>
  );
};

export default HomeMobileActionStrip;
