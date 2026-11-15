import React from "react";
import { Link } from "react-router-dom";
import { Skeleton } from "@mui/material";
import { useLeagueStandingsPreview } from "../providers&context/LeagueStandingsPreviewContext";
import type { LeagueStandingsPreviewData } from "../../types";

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={className}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m8.25 4.5 7.5 7.5-7.5 7.5"
      />
    </svg>
  );
}

export type HomeLeagueStandingsVariant = "mobile" | "desktop" | "sheet";

interface HomeLeagueStandingsPreviewProps {
  variant: HomeLeagueStandingsVariant;
  onNavigate?: () => void;
}

function StandingsDetailBody({
  data,
  onNavigate,
}: {
  data: LeagueStandingsPreviewData;
  onNavigate?: () => void;
}) {
  const globalLabel = data.global.label?.trim() || "Global";
  const { global, privateLeagues } = data;

  return (
    <div className="px-4 pb-4">
      <div className="mb-3 rounded-xl border border-indigo-200 bg-indigo-50/90 px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase text-indigo-900/80">
            {globalLabel}
          </span>
          <span className="text-lg font-semibold tabular-nums text-colors-nba-blue">
            #{global.position}
          </span>
        </div>
        <p className="mt-0.5 text-sm text-gray-800">
          Total:{" "}
          <span className="font-medium tabular-nums">{global.totalPoints}</span>
        </p>
      </div>

      <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500">
        Private
      </h3>
      <ul className="flex flex-col gap-2">
        {privateLeagues.length === 0 ? (
          <li className="rounded-lg border border-dashed border-gray-200 bg-gray-50/80 px-3 py-2.5 text-sm text-gray-600">
            No private leagues yet
          </li>
        ) : (
          privateLeagues.map((league) => (
            <li key={league.id}>
              <Link
                to="/league"
                state={{ league: { id: league.id, name: league.name } }}
                onClick={onNavigate}
                className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2.5 active:bg-gray-100"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {league.name}
                  </p>
                  <p className="text-xs text-gray-600">
                    <span className="tabular-nums">{league.totalPoints}</span>{" "}
                    pts
                  </p>
                </div>
                <span className="shrink-0 text-base font-semibold tabular-nums text-colors-nba-blue">
                  #{league.position}
                </span>
                <ChevronRightIcon className="size-4 shrink-0 text-gray-400" />
              </Link>
            </li>
          ))
        )}
      </ul>
      <Link
        to="/leagues"
        onClick={onNavigate}
        className="mt-3 block text-center text-sm font-medium text-colors-nba-blue"
      >
        All leagues
      </Link>
    </div>
  );
}

function PreviewBody({
  data,
  variant,
  onNavigate,
}: {
  data: LeagueStandingsPreviewData;
  variant: HomeLeagueStandingsVariant;
  onNavigate?: () => void;
}) {
  if (variant === "sheet" || variant === "mobile") {
    return (
      <section aria-label="Your league standings">
        <StandingsDetailBody data={data} onNavigate={onNavigate} />
      </section>
    );
  }

  const globalLabel = data.global.label?.trim() || "Global";
  const { global, privateLeagues } = data;

  return (
    <aside
      className="w-full max-w-[220px] xl:max-w-[240px] shrink-0 flex flex-col gap-3"
      aria-label="Your league standings"
    >
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-0.5">
        Your standings
      </h2>

      <div className="rounded-xl border border-indigo-200 bg-indigo-50/90 px-3 py-3 shadow-sm">
        <span className="text-xs font-semibold uppercase text-indigo-900/80 block mb-1">
          {globalLabel}
        </span>
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-2xl font-bold text-colors-nba-blue leading-none tabular-nums">
            #{global.position}
          </span>
          <span className="text-sm text-gray-800 font-medium tabular-nums">
            {global.totalPoints} pts
          </span>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 px-0.5">
          Private
        </h3>
        <ul className="flex flex-col gap-2 max-h-[min(40vh,320px)] overflow-y-auto pr-0.5">
          {privateLeagues.length === 0 ? (
            <li className="rounded-lg border border-dashed border-gray-200 bg-gray-50/80 px-2.5 py-2 text-xs text-gray-600">
              No private leagues yet
            </li>
          ) : (
            privateLeagues.map((league) => (
              <li key={league.id}>
                <Link
                  to="/league"
                  state={{ league: { id: league.id, name: league.name } }}
                  className="block rounded-lg border border-gray-200 bg-white px-2.5 py-2 shadow-sm hover:border-gray-300 hover:bg-gray-50/90 transition-colors"
                >
                  <div className="flex items-start justify-between gap-1">
                    <p className="font-medium text-gray-900 text-xs leading-snug line-clamp-2 flex-1 min-w-0">
                      {league.name}
                    </p>
                    <ChevronRightIcon className="size-3.5 text-gray-400 shrink-0 mt-0.5" />
                  </div>
                  <div className="mt-1 flex items-baseline justify-between gap-2">
                    <span className="text-lg font-semibold text-colors-nba-blue tabular-nums leading-none">
                      #{league.position}
                    </span>
                    <span className="text-xs text-gray-600 tabular-nums">
                      {league.totalPoints} pts
                    </span>
                  </div>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>

      <Link
        to="/leagues"
        className="text-xs font-medium text-colors-nba-blue text-center hover:underline px-1"
      >
        All leagues →
      </Link>
    </aside>
  );
}

/**
 * Summary of the user’s rank in global + private leagues from GET /home-page/load → leagueStandingsPreview.
 */
const HomeLeagueStandingsPreview: React.FC<HomeLeagueStandingsPreviewProps> = ({
  variant,
  onNavigate,
}) => {
  const { standingsPreview, standingsPreviewLoading } =
    useLeagueStandingsPreview();

  const isSheet = variant === "sheet" || variant === "mobile";

  if (standingsPreviewLoading) {
    return (
      <div
        className={
          isSheet ? "px-4 pb-4" : "w-full max-w-[220px] xl:max-w-[240px] shrink-0"
        }
        aria-busy="true"
        aria-label="Loading your league standings"
      >
        <Skeleton variant="rounded" height={isSheet ? 160 : 120} />
      </div>
    );
  }

  if (!standingsPreview) {
    return (
      <div className={isSheet ? "px-4 pb-4" : "w-full max-w-[220px] xl:max-w-[240px] shrink-0"}>
        <div
          className={
            isSheet
              ? "rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-600"
              : "rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-3 text-xs text-gray-600"
          }
        >
          Standings aren&apos;t available right now.
        </div>
      </div>
    );
  }

  return (
    <PreviewBody
      data={standingsPreview}
      variant={variant}
      onNavigate={onNavigate}
    />
  );
};

export default HomeLeagueStandingsPreview;
