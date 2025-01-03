import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

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
  const fetchUser= async () =>{
    setLoading(true);
    try {
        const response = await axiosInstance.get("/auth/user");
        setCurrentUser(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
  }

  // Sort users by totalPoints and assign ranks
  const sortedUsers = [...users].sort((a, b) => b.fantasyPoints - a.fantasyPoints);

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
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Leagues Ranking</h1>
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <table className="min-w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-colors-nba-blue text-white">
              <th className="border px-6 py-3 text-center" title="The user's rank in the league">Rank</th>
              <th className="border px-6 py-3" title="Player's username and full name">Player</th>
              <th className="border px-6 py-3 text-center" title="Total points accumulated by the player">TOT</th>
            </tr>
          </thead>
          <tbody>
            {usersWithRank.map((user) => (
              <tr
                key={user.id}
                className={`hover:bg-gray-100 ${user.id === currentUser?.id ? 'bg-colors-select-bet text-black' : ''}`}
              >
                <td className="border px-6 py-4 text-center">{user.rank}</td>
                <td className="border px-6 py-4">
                  <strong>{user.username}</strong>
                  <br />
                  {user.firstName} {user.lastName}
                </td>
                <td className="border px-6 py-4 text-center">{user.fantasyPoints.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LeaguesPage;
