import React from "react";
import { Skeleton } from "@mui/material";
import LeagueStandingsMyPlace from "../../components/forPages/LeagueStandingsMyPlace";
import LeagueWall from "../../components/forPages/LeagueWall";
import LeagueStandingsPagination from "./LeagueStandingsPagination";
import type { LeaguesPageModel } from "./useLeaguesPageModel";
import {
  formatPointsBreakdown,
  getDisplayTotalPoints,
  getRankBadgeClass,
  getUserInitials,
  isCurrentUserRow,
} from "./standingsUiUtils";

function ChevronRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="size-5 text-gray-400 shrink-0"
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

const LeaguesPageMobileView: React.FC<LeaguesPageModel> = (model) => {
  const {
    league,
    standingsLeagueId,
    selectedTournamentId,
    standingsLoading,
    usersWithRank,
    currentUser,
    currentUserFullName,
    headerTitle,
    pageStart,
    pageEnd,
    limit,
    nextCursor,
    prevCursor,
    handleBackToLeagues,
    handleUserClick,
    handlePreviousPage,
    handleNextPage,
    handleLimitSelection,
  } = model;

  if (!league) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-0">
      <div className="px-3 pt-3 pb-2 bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="flex items-center gap-2 min-h-11">
          <button
            type="button"
            onClick={handleBackToLeagues}
            className="inline-flex items-center justify-center size-10 rounded-full text-colors-nba-blue active:bg-gray-100 shrink-0"
            aria-label="All leagues"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-5"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-colors-nba-blue truncate flex-1">
            {headerTitle}
          </h1>
        </div>
      </div>

      <div className="px-3 pt-3 pb-28 max-w-full mx-auto w-full">
        {selectedTournamentId && (
          <div className="sticky top-[3.25rem] z-20 -mx-1 px-1 pb-2 bg-white/95 backdrop-blur-sm">
            <LeagueStandingsMyPlace
              leagueId={standingsLeagueId}
              tournamentId={selectedTournamentId}
              variant="mobile"
            />
          </div>
        )}

        {standingsLoading ? (
          <ul className="flex flex-col gap-2 mt-1" aria-busy="true">
            {Array.from({ length: 8 }).map((_, idx) => (
              <li key={idx}>
                <Skeleton variant="rounded" height={56} />
              </li>
            ))}
          </ul>
        ) : usersWithRank.length === 0 ? (
          <div className="py-12 text-center text-gray-600">
            <p className="text-base font-medium">
              No standings yet in this league.
            </p>
          </div>
        ) : (
          <>
            <ul className="flex flex-col gap-2 mt-1" aria-label="Standings">
              {usersWithRank.map((user) => {
                const isMe = isCurrentUserRow(user.id, currentUser?.id);
                const total = getDisplayTotalPoints(user);
                const rowContent = (
                  <>
                    <span
                      className={`inline-flex min-w-[2.25rem] justify-center rounded-lg px-2 py-1 text-sm font-bold tabular-nums ${getRankBadgeClass(user.rank)}`}
                    >
                      {user.rank}
                    </span>
                    <span
                      className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                        isMe
                          ? "bg-colors-nba-blue text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                      aria-hidden
                    >
                      {getUserInitials(user)}
                    </span>
                    <span className="min-w-0 flex-1 text-left">
                      <span
                        className={`block font-semibold truncate ${
                          isMe ? "text-indigo-900" : "text-colors-nba-blue"
                        }`}
                      >
                        {user.username}
                      </span>
                      <span className="block text-xs text-gray-600 truncate">
                        {user.firstName} {user.lastName}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-base font-bold tabular-nums text-gray-900">
                        {total}
                      </span>
                      <span className="block text-[10px] text-gray-500 tabular-nums">
                        {formatPointsBreakdown(user)}
                      </span>
                    </span>
                    {!isMe && <ChevronRightIcon />}
                  </>
                );

                if (isMe) {
                  return (
                    <li key={user.id}>
                      <div
                        className="flex w-full items-center gap-2.5 rounded-xl border-2 border-colors-nba-blue bg-indigo-50 px-3 py-3 min-h-14"
                        aria-current="true"
                      >
                        {rowContent}
                      </div>
                    </li>
                  );
                }

                return (
                  <li key={user.id}>
                    <button
                      type="button"
                      onClick={() => handleUserClick(user)}
                      className="flex w-full items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-3 py-3 min-h-14 text-left active:bg-gray-50 shadow-sm"
                    >
                      {rowContent}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4">
              <LeagueStandingsPagination
                pageStart={pageStart}
                pageEnd={pageEnd}
                hasPrev={!!prevCursor}
                hasNext={!!nextCursor}
                onPrevious={handlePreviousPage}
                onNext={handleNextPage}
                limit={limit}
                onLimitChange={handleLimitSelection}
                compact
                showPageSize
              />
            </div>
          </>
        )}
      </div>

      <LeagueWall
        leagueName={league.name}
        leagueId={standingsLeagueId}
        currentUserFullName={currentUserFullName}
      />
    </div>
  );
};

export default LeaguesPageMobileView;
