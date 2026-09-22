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
  isCurrentUserRow,
} from "./standingsUiUtils";

const LeaguesPageDesktopView: React.FC<LeaguesPageModel> = (model) => {
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
    <div className="flex flex-col">
      <div className="p-4 md:p-8 max-w-full md:max-w-7xl mx-auto bg-white rounded-lg shadow-lg w-full">
        <div className="pb-4 mb-4 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={handleBackToLeagues}
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
            <h1 className="text-2xl md:text-3xl font-semibold text-colors-nba-blue">
              {headerTitle}
            </h1>
          </div>
        </div>

        {selectedTournamentId && (
          <LeagueStandingsMyPlace
            leagueId={standingsLeagueId}
            tournamentId={selectedTournamentId}
            variant="desktop"
          />
        )}

        <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1">
            {standingsLoading ? (
              <div className="w-full space-y-2">
                <div className="grid grid-cols-[80px_1fr_120px] gap-2">
                  <Skeleton variant="rounded" height={42} />
                  <Skeleton variant="rounded" height={42} />
                  <Skeleton variant="rounded" height={42} />
                </div>
                {Array.from({ length: 10 }).map((_, idx) => (
                  <Skeleton key={idx} variant="rounded" height={52} />
                ))}
              </div>
            ) : usersWithRank.length === 0 ? (
              <div className="w-full py-12 text-center text-gray-600">
                <p className="text-lg font-medium">
                  No standings yet in this league.
                </p>
              </div>
            ) : (
              <>
                <div className="w-full overflow-x-auto rounded-xl border border-gray-200">
                  <table className="min-w-full table-auto border-separate border-spacing-0">
                    <thead className="sticky top-0 z-10 bg-colors-nba-blue text-white">
                      <tr>
                        <th className="px-4 py-3 text-center w-24">Rank</th>
                        <th className="px-4 py-3 text-left">Player</th>
                        <th className="px-4 py-3 text-center w-28">Pts</th>
                        <th className="px-4 py-3 text-center w-36 hidden sm:table-cell">
                          Breakdown
                        </th>
                        <th className="px-4 py-3 text-right w-28">Compare</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersWithRank.map((user) => {
                        const isMe = isCurrentUserRow(
                          user.id,
                          currentUser?.id,
                        );
                        const total = getDisplayTotalPoints(user);
                        return (
                          <tr
                            key={user.id}
                            className={
                              isMe
                                ? "bg-indigo-50 text-indigo-950"
                                : "hover:bg-gray-50"
                            }
                          >
                            <td className="border-t border-gray-100 px-4 py-3 text-center">
                              <span
                                className={`inline-flex min-w-[2rem] justify-center rounded-lg px-2 py-0.5 text-sm font-bold tabular-nums ${getRankBadgeClass(user.rank)}`}
                              >
                                {user.rank}
                              </span>
                            </td>
                            <td className="border-t border-gray-100 px-4 py-3 max-w-[240px]">
                              <strong
                                className={`block truncate ${
                                  isMe
                                    ? "text-indigo-900"
                                    : "text-colors-nba-blue"
                                }`}
                              >
                                {user.username}
                              </strong>
                              <span className="text-sm text-gray-600 block truncate">
                                {user.firstName} {user.lastName}
                              </span>
                            </td>
                            <td className="border-t border-gray-100 px-4 py-3 text-center text-lg font-semibold tabular-nums">
                              {total}
                            </td>
                            <td className="border-t border-gray-100 px-4 py-3 text-center text-sm text-gray-600 tabular-nums hidden sm:table-cell">
                              {formatPointsBreakdown(user)}
                            </td>
                            <td className="border-t border-gray-100 px-4 py-3 text-right">
                              {isMe ? (
                                <span className="text-xs font-medium text-indigo-700">
                                  You
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleUserClick(user)}
                                  className="text-sm font-semibold text-colors-nba-blue hover:underline"
                                >
                                  Compare
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
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
      </div>
    </div>
  );
};

export default LeaguesPageDesktopView;
