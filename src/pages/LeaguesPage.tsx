import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { serializeQueryParamsWithNull } from "../api/serializeQueryParams";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  Skeleton,
  Tooltip,
  Zoom,
} from "@mui/material";
import { useError } from "../components/providers&context/ErrorProvider";
import { useTournament } from "../components/providers&context/TournamentContext";
import LeagueStandingsMyPlace from "../components/forPages/LeagueStandingsMyPlace";

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  fantasyPoints: number;
  championPoints: number;
}

const LeaguesPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [standingsLoading, setStandingsLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<User>();
  const [offset, setOffset] = useState<number>(0);
  const location = useLocation();
  const league = location.state?.league;
  const isOverallLeague = league?.name === "Overall";
  const [nextCursor, setNextCursor] = useState<
    { totalPoints: number; id: string } | undefined
  >(undefined);
  const [prevCursor, setPrevCursor] = useState<
    { totalPoints: number; id: string } | undefined
  >(undefined);

  const navigate = useNavigate();
  const { showError } = useError();
  const [limit, setLimit] = useState<number>(20);
  const { selectedTournamentId } = useTournament();

  const fetchUsers = async (
    cursor?: { totalPoints: number; id: string },
    prevCursor?: { totalPoints: number; id: string },
    newLimit?: number,
  ) => {
    setStandingsLoading(true);
    try {
      const response = await axiosInstance.get("/auth/standings", {
        params: {
          cursorPoints: cursor?.totalPoints,
          cursorId: cursor?.id,
          prevCursorPoints: prevCursor?.totalPoints,
          prevCursorId: prevCursor?.id,
          limit: newLimit ?? limit,
          leagueId: isOverallLeague ? null : league?.id ?? null,
        },
        paramsSerializer: serializeQueryParamsWithNull,
      });
      setUsers(response.data.data);
      setNextCursor(response.data.nextCursor);
      setPrevCursor(response.data.prevCursor);
      if (cursor) {
        setOffset((prevOffset) => prevOffset + limit);
      } else if (prevCursor) {
        setOffset((prevOffset) => Math.max(prevOffset - limit, 0));
      } else {
        setOffset(0);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      showError(`Server error.`);
    } finally {
      setStandingsLoading(false);
    }
  };

  const handleLimitSelection = async (e: SelectChangeEvent<number>) => {
    setLimit(Number(e.target.value));
    fetchUsers(undefined, undefined, Number(e.target.value));
  };

  const fetchUser = async () => {
    try {
      const response = await axiosInstance.get("/auth/user");
      setCurrentUser(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      showError(`Server error.`);
    }
  };

  const handleUserClick = (user: User) => {
    navigate("/comparing", {
      state: { secondUserId: user.id, league: league },
    });
  };

  const usersWithRank = users.map((user, index) => ({
    ...user,
    rank: offset + index + 1,
  }));
  const pageStart = users.length > 0 ? offset + 1 : 0;
  const pageEnd = users.length > 0 ? offset + users.length : 0;
  const headerTitle = `${league.name} standings`;

  useEffect(() => {
    if (!selectedTournamentId) {
      setStandingsLoading(false);
      return;
    }
    if (!league) {
      setStandingsLoading(false);
      return;
    }
    if (!isOverallLeague && !league.id) {
      setStandingsLoading(false);
      return;
    }
    fetchUsers();
    fetchUser();
  }, [selectedTournamentId, league, isOverallLeague]);

  if (!league) {
    return (
      <div className="flex flex-col">
        <div className="p-4 md:p-8 max-w-full md:max-w-7xl mx-auto bg-white rounded-lg shadow-lg">
          <button
            type="button"
            onClick={() => navigate("/leagues")}
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

  if (!isOverallLeague && !league.id) {
    return (
      <div className="flex flex-col">
        <div className="p-4 md:p-8 max-w-full md:max-w-7xl mx-auto bg-white rounded-lg shadow-lg">
          <button
            type="button"
            onClick={() => navigate("/leagues")}
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

  const standingsLeagueId: string | null = isOverallLeague ? null : league.id;

  return (
    <div className="flex flex-col">
      <div className="p-4 md:p-8 max-w-full md:max-w-7xl mx-auto bg-white rounded-lg shadow-lg">
        <div className="pb-4 mb-6">
          <div className="flex flex-col gap-4 pt-1">
          <button
            type="button"
            onClick={() => navigate("/leagues")}
            className="self-start inline-flex gap-2 items-center px-4 py-2 bg-colors-nba-blue opacity-90 hover:opacity-100 text-white rounded-md transition-opacity"
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
          <h1 className="text-4xl font-semibold text-center text-colors-nba-blue">
            {headerTitle}
          </h1>
          </div>
        </div>
        {selectedTournamentId && (
          <LeagueStandingsMyPlace
            leagueId={standingsLeagueId}
            tournamentId={selectedTournamentId}
          />
        )}
        {standingsLoading ? (
          <div className="w-full overflow-x-auto">
            <div className="min-w-[360px] space-y-2">
              <div className="grid grid-cols-[80px_1fr_100px] gap-2">
                <Skeleton variant="rounded" height={42} />
                <Skeleton variant="rounded" height={42} />
                <Skeleton variant="rounded" height={42} />
              </div>
              {Array.from({ length: 8 }).map((_, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-[80px_1fr_100px] gap-2 items-center"
                >
                  <Skeleton variant="rounded" height={48} />
                  <Skeleton variant="rounded" height={48} />
                  <Skeleton variant="rounded" height={48} />
                </div>
              ))}
              <div className="grid grid-cols-3 gap-2 mt-3">
                <Skeleton variant="rounded" height={38} />
                <Skeleton variant="rounded" height={38} />
                <Skeleton variant="rounded" height={38} />
              </div>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="w-full py-12 text-center text-gray-600">
            <p className="text-lg font-medium">No standings yet in this league.</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <div className="max-h-screen overflow-y-auto min-w-[360px]">
              <table className="min-w-full table-auto border-separate border-spacing-0.5">
                <thead className="sticky top-0 z-10 bg-colors-nba-blue text-white">
                  <tr>
                    <th className="px-4 py-3 text-center">Rank</th>
                    <th className="px-4 py-3">Player</th>
                    <th className="px-4 py-3 text-center">TOT</th>
                  </tr>
                </thead>
                <tbody>
                  {usersWithRank.map((user) => (
                    <tr
                      key={user.id}
                      className={`${
                        user.id === currentUser?.id
                          ? "bg-indigo-100 text-indigo-800 "
                          : "hover:bg-gray-100"
                      } transition-all duration-300`}
                    >
                      <td className="border-t px-4 py-3 text-center text-lg font-semibold">
                        {user.rank}
                      </td>
                      <td className="border-t px-4 py-3 max-w-[200px] truncate whitespace-nowrap">
                        <Tooltip
                          title="Click to compare"
                          slots={{ transition: Zoom }}
                          arrow
                          placement="right"
                          disableHoverListener={user.id === currentUser?.id}
                        >
                          <strong
                            className={`text-colors-nba-blue   ${
                              user.id !== currentUser?.id
                                ? "cursor-pointer hover:underline transition-all duration-300"
                                : ""
                            }`}
                            onClick={() => {
                              if (user.id !== currentUser?.id) {
                                handleUserClick(user);
                              }
                            }}
                          >
                            {user.username}
                          </strong>
                        </Tooltip>
                        <span className="text-gray-700 block truncate">
                          {user.firstName} {user.lastName}
                        </span>
                      </td>
                      <td className="border-t px-4 py-3 text-center text-lg">
                        {user.fantasyPoints + user.championPoints}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              <div className="grid grid-cols-3 items-center gap-2">
                <button
                  className="flex w-full justify-center gap-2 items-center px-3 sm:px-4 py-2 bg-colors-nba-blue opacity-90 text-white rounded-md disabled:opacity-50"
                  onClick={() => fetchUsers(undefined, prevCursor)}
                  disabled={!prevCursor}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                    />
                  </svg>
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Prev</span>
                </button>
                <span className="px-3 py-2 rounded-full bg-gray-100 text-sm font-medium text-gray-700 whitespace-nowrap text-center">
                  Ranks {pageStart}-{pageEnd}
                </span>
                <button
                  className="flex w-full justify-center gap-2 items-center px-3 sm:px-4 py-2 bg-colors-nba-blue text-white rounded-md disabled:opacity-50"
                  onClick={() => fetchUsers(nextCursor)}
                  disabled={!nextCursor}
                >
                  <span className="hidden sm:inline">Next</span>
                  <span className="sm:hidden">Next</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex justify-center">
                <FormControl className="w-full sm:w-auto max-w-[180px]">
                  <Select
                    labelId="limit"
                    id="limitSelection"
                    value={limit}
                    onChange={handleLimitSelection}
                    sx={{
                      borderRadius: "1rem",
                      minWidth: { xs: 96, sm: 88 },
                      "& .MuiSelect-select": { py: { xs: 1, sm: 1.25 } },
                    }}
                  >
                    <MenuItem value={5}>5 users</MenuItem>
                    <MenuItem value={10}>10 users</MenuItem>
                    <MenuItem value={20}>20 users</MenuItem>
                    <MenuItem value={50}>50 users</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaguesPage;
