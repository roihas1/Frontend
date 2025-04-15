import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tooltip,
  Zoom,
} from "@mui/material";
import { useError } from "../components/providers&context/ErrorProvider";

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
  const [loading, setLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<User>();
  const [offset, setOffset] = useState<number>(0);
  const location = useLocation();
  const league = location.state?.league;
  const [nextCursor, setNextCursor] = useState<
    { totalPoints: number; id: string } | undefined
  >(undefined);
  const [prevCursor, setPrevCursor] = useState<
    { totalPoints: number; id: string } | undefined
  >(undefined);

  const navigate = useNavigate();
  const { showError } = useError();
  const [limit, setLimit] = useState<number>(5);

  const fetchUsers = async (
    cursor?: { totalPoints: number; id: string },
    prevCursor?: { totalPoints: number; id: string },
    newLimit?: number
  ) => {
    try {
      const response = await axiosInstance.get("/auth/standings", {
        params: {
          cursorPoints: cursor?.totalPoints,
          cursorId: cursor?.id,
          prevCursorPoints: prevCursor?.totalPoints,
          prevCursorId: prevCursor?.id,
          limit: newLimit ?? limit,
          leagueId: league.id,
        },
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
      setLoading(false);
    }
  };

  const handleLimitSelection = async (e: SelectChangeEvent<number>) => {
    setLimit(Number(e.target.value));
    fetchUsers(undefined, undefined, Number(e.target.value));
  };

  const fetchUser = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/auth/user");
      setCurrentUser(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      showError(`Server error.`);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (user: User) => {
    navigate("/comparing", {
      state: { secondUserId: user.id, league: league },
    });
  };

  // Assign ranks
  const usersWithRank = users.map((user, index) => ({
    ...user,
    rank: offset + index + 1,
  }));

  // Fetch data when the page loads
  useEffect(() => {
    fetchUsers();
    fetchUser();
  }, []);

  return (
    <div className="flex flex-col ">
      <div className="p-8 max-w-7xl mx-auto  bg-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-semibold mb-8 text-center text-colors-nba-blue">
          Ranking
        </h1>
        {loading ? (
          <div className="text-center text-lg text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <div className="max-h-screen overflow-y-auto">
              <table className="min-w-full table-auto border-separate border-spacing-0.5">
                <thead className="bg-colors-nba-blue text-white">
                  <tr>
                    <th
                      className="px-6 py-3 text-center"
                      title="The user's rank in the league"
                    >
                      Rank
                    </th>
                    <th
                      className="px-6 py-3"
                      title="Player's username and full name"
                    >
                      Player
                    </th>
                    <th
                      className="px-6 py-3 text-center"
                      title="Total points accumulated by the player"
                    >
                      TOT
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {usersWithRank.map((user) => (
                    <tr
                      key={user.id}
                      className={`${
                        user.id === currentUser?.id
                          ? "bg-indigo-100 text-indigo-800"
                          : "hover:bg-gray-100"
                      } transition-all duration-300`}
                    >
                      <td className="border-t px-6 py-4 text-center text-lg font-semibold">
                        {user.rank}
                      </td>
                      <td className="border-t px-6 py-4">
                        <Tooltip
                          title="Click to compare"
                          slots={{
                            transition: Zoom,
                          }}
                          arrow
                          placement="right"
                          disableHoverListener={user.id === currentUser?.id}
                        >
                          <strong
                            className={`text-colors-nba-blue  ${
                              user.id != currentUser?.id
                                ? "cursor-pointer hover:underline transition-all duration-300"
                                : ""
                            }`}
                            onClick={() => {
                              if (user.id != currentUser?.id) {
                                handleUserClick(user);
                              }
                            }}
                          >
                            {user.username}
                          </strong>
                        </Tooltip>
                        <br />
                        <span className="text-gray-700">
                          {user.firstName} {user.lastName}
                        </span>
                      </td>
                      <td className="border-t px-6 py-4 text-center text-lg">
                        {user.fantasyPoints + user.championPoints}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between mt-4">
              <button
                className=" flex gap-2  items-center px-4 py-2 bg-colors-nba-blue opacity-90 text-white rounded-md disabled:opacity-50"
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
                Previous
              </button>
              <FormControl>
                <Select
                  labelId="limit"
                  id="limitSelection"
                  value={limit}
                  onChange={handleLimitSelection}
                  sx={{
                    borderRadius: "1rem",
                  }}
                >
                  <MenuItem key={5} value={5}>
                    5
                  </MenuItem>
                  <MenuItem key={10} value={10}>
                    10
                  </MenuItem>
                  <MenuItem key={20} value={20}>
                    20
                  </MenuItem>
                  <MenuItem key={50} value={50}>
                    50
                  </MenuItem>
                </Select>
              </FormControl>
              <button
                className="flex gap-2 items-center px-4 py-2 bg-colors-nba-blue text-white rounded-md disabled:opacity-50"
                onClick={() => fetchUsers(nextCursor)}
                disabled={!nextCursor}
              >
                Next
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
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaguesPage;
