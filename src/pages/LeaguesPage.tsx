import React from "react";
import { Skeleton } from "@mui/material";
import { useLeaguesPageModel } from "./league/useLeaguesPageModel";
import LeaguesPageMobileView from "./league/LeaguesPageMobileView";
import LeaguesPageDesktopView from "./league/LeaguesPageDesktopView";

function LeaguesPageMissingLeague({
  onBack,
}: {
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col">
      <div className="p-4 md:p-8 max-w-full md:max-w-7xl mx-auto bg-white rounded-lg shadow-lg">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex gap-2 items-center px-4 py-2 bg-colors-nba-blue opacity-90 hover:opacity-100 text-white rounded-md transition-opacity"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-4 shrink-0"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
          All leagues
        </button>
        <p className="text-center text-gray-600 mt-6">No league selected.</p>
      </div>
    </div>
  );
}

const LeaguesPage: React.FC = () => {
  const model = useLeaguesPageModel();
  const { league, isOverallLeague, handleBackToLeagues, leagueReady, isMobile } =
    model;

  if (!league) {
    return <LeaguesPageMissingLeague onBack={handleBackToLeagues} />;
  }

  if (!isOverallLeague && !league.id) {
    return <LeaguesPageMissingLeague onBack={handleBackToLeagues} />;
  }

  if (!leagueReady) {
    return (
      <div className="p-4 md:p-8 max-w-full md:max-w-7xl mx-auto">
        <Skeleton variant="rounded" height={48} className="mb-4" />
        <Skeleton variant="rounded" height={120} className="mb-4" />
        {Array.from({ length: 6 }).map((_, idx) => (
          <Skeleton key={idx} variant="rounded" height={52} className="mb-2" />
        ))}
      </div>
    );
  }

  return isMobile ? (
    <LeaguesPageMobileView {...model} />
  ) : (
    <LeaguesPageDesktopView {...model} />
  );
};

export default LeaguesPage;
