import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { Tooltip, Zoom } from "@mui/material";
import { useError } from "../components/providers&context/ErrorProvider";

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  fantasyPoints: number;
}

const LeaguesPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<User>();
  const [nextCursor, setNextCursor] = useState<
    | {
        points: number;
        id: string;
      }
    | undefined
  >(undefined);
  const [prevCursor, setPrevCursor] = useState<
    | {
        points: number;
        id: string;
      }
    | undefined
  >(undefined);
  const navigate = useNavigate();
  const { showError } = useError();
  const [limit, setLimit] = useState<number>(3);

  // Fetch user data
  const fetchUsers = async (
    cursor?: { points: number; id: string },
    prevCursor?: { points: number; id: string }
  ) => {
    console.log("cursor", cursor);
    console.log("prev", prevCursor);
    try {
      const response = await axiosInstance.get("/auth/standings", {
        params: {
          cursorPoints: cursor?.points,
          cursorId: cursor?.id,
          prevCursorPoints: prevCursor?.points,
          prevCursorId: prevCursor?.id,
          limit,
        },
      });
      // const response = await axiosInstance.get("/auth");
      console.log(response.data);
      setUsers(response.data.data);
      setNextCursor(response.data.nextCursor);
      setPrevCursor(response.data.prevCursor);
    } catch (error) {
      console.error("Error fetching users:", error);
      showError(`Server error.`);
    } finally {
      setLoading(false);
    }
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
    navigate("/comparing", { state: { secondUserId: user.id } });
  };

  // Sort users by totalPoints and assign ranks
  // const sortedUsers = [...users].sort(
  //   (a, b) => b.fantasyPoints - a.fantasyPoints
  // );

  // Assign ranks
  const usersWithRank = users.map((user, index) => ({
    ...user,
    rank: index + 1,
  }));

  // Fetch data when the page loads
  useEffect(() => {
    fetchUsers();
    fetchUser();
  }, []);

  return (
    <div className="flex flex-col min-h-screen ">
      <div className="p-8 max-w-7xl mx-auto flex-1 bg-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-semibold mb-8 text-center text-colors-nba-blue">
          Leagues Ranking
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
                        {user.fantasyPoints}
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
