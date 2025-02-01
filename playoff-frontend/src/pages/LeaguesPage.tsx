import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { Tooltip, Zoom } from "@mui/material";

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
  const navigate = useNavigate();

  // Fetch user data
  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get("/auth");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
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
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (user: User) => {
    navigate("/comparing", { state: { secondUserId: user.id } });
  };

  // Sort users by totalPoints and assign ranks
  const sortedUsers = [...users].sort(
    (a, b) => b.fantasyPoints - a.fantasyPoints
  );

  // Assign ranks
  const usersWithRank = sortedUsers.map((user, index) => ({
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
                          className={`text-colors-nba-blue  ${user.id != currentUser?.id ? "cursor-pointer hover:underline transition-all duration-300": ""}`}
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
        )}
      </div>
    </div>
  );
};

export default LeaguesPage;
