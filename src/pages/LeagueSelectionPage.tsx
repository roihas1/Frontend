import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  FormControl,
  IconButton,
  Input,
} from "@mui/material";
import { Close, Settings } from "@mui/icons-material";
import axiosInstance from "../api/axiosInstance";
import { useError } from "../components/providers&context/ErrorProvider";
import { User } from "../types";
import { useNavigate } from "react-router-dom";
import ActionButtons from "../components/forPages/ActionButtons";
import { useSuccessMessage } from "../components/providers&context/successMassageProvider";

export interface League {
  id?: string;
  name: string;
  code?: string;
  admin?: User;
}

const LeaguesSelectionPage: React.FC = () => {
  const { showError } = useError();
  const { showSuccessMessage } = useSuccessMessage();
  const [privateLeagues, setPrivateLeagues] = useState<League[]>();
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showCreateNewLeague, setShowCreateNewLeague] =
    useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User>();
  const [showJoinLeague, setShowJoinLeague] = useState<boolean>(false);
  const [leagueCode, setLeagueCode] = useState<string>("");
  const [leagueName, setLeagueName] = useState<string>("");
  const handleOpenModal = (league: League) => {
    setSelectedLeague(league);
    setModalOpen(true);
  };
  const [overallLeague, setOverallLeague] = useState<League | null>(null);
  const navigate = useNavigate();
  const handleLeagueClick = (league: League) => {
    navigate(`/league`, { state: { league: league } });
  };
  const handleManageLeague = (league: League) => {
    navigate(`/manageLeague`, { state: { league: league } });
  };

  // Close modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedLeague(null);
  };
  const fetchLeagues = async () => {
    try {
      const response = await axiosInstance.get(`/private-league`);
      setPrivateLeagues(response.data);
    } catch (error) {
      showError(`Failed to fetch leagues`);
    }
  };
  const fetchOverallLeague = async () => {
    try {
      const response = await axiosInstance.get("/auth/standings");
      const overall = { name: "Overall", users: response.data };
      setOverallLeague(overall);
    } catch (error) {
      showError(`Failed to fetch overall league`);
    }
  };
  useEffect(() => {
    fetchLeagues();
    fetchOverallLeague();
    fetchUser();
  }, []);
  const handleCreateNewLeague = () => {
    setShowCreateNewLeague(true);
  };
  const handleShowJoinLeague = () => {
    setShowJoinLeague(true);
  };
  const handleJoinLeague = async () => {
    if (!leagueCode) {
      showError(`Must enter a league code`);
      return;
    }
    try {
      const response = await axiosInstance.post(`/private-league/joinLeague`, {
        code: leagueCode,
      });
      showSuccessMessage(response.data.message);
      setShowJoinLeague(false);
      fetchLeagues();
    } catch {
      showError(`Failed to join to a league.`);
    }
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

  const handleSubmitNewLeague = async () => {
    if (!leagueName) {
      showError(`Must enter a league name`);
      return;
    }
    try {
      const response = await axiosInstance.post(`/private-league`, {
        name: leagueName,
      });
      setPrivateLeagues((prevState) => [...(prevState ?? []), response.data]);
      showSuccessMessage(`${leagueName} created.`);
      setShowCreateNewLeague(false);
    } catch {
      showError(`Failed to create new league.`);
    }
  };
  const handleLeaveLeague = async (league: League) => {
    try {
      await axiosInstance.patch(`/private-league/${league?.id}/leaveLeague`);
      setPrivateLeagues((prevState) =>
        prevState?.filter((prev) => prev.id !== league?.id)
      );
      showSuccessMessage(`Leaved the league.`);
      handleCloseModal();
    } catch (error) {
      showError(`Failed to leave league.`);
    }
  };
  return (
    <div className="flex flex-col items-center p-4 bg-gray-100 ">
      {/* Buttons */}
      {!showCreateNewLeague && !showJoinLeague && (
        <div className="flex gap-4 mb-8">
          <button
            className=" text-lg bg-colors-nba-yellow hover:opacity-80 p-2 rounded-lg text-white shadow-md"
            onClick={handleCreateNewLeague}
          >
            Create New Leagues
          </button>
          <button
            className="text-lg bg-colors-nba-yellow hover:opacity-80 p-2 rounded-lg text-white shadow-md"
            onClick={handleShowJoinLeague}
          >
            Join new League
          </button>
        </div>
      )}
      {showJoinLeague && (
        <div className="w-1/3 ">
          <h3 className="flex justify-center text-2xl font-semibold">
            Join Leauge
          </h3>
          <FormControl fullWidth required>
            <Input
              type="text"
              name="leagueCode"
              placeholder="League code"
              value={leagueCode}
              onChange={(e) => setLeagueCode(e.target.value)}
              className="w-full p-3 mb-6 border border-gray-300 rounded-2xl mt-2 bg-white"
            ></Input>
          </FormControl>

          <ActionButtons
            text1="Close"
            text2="Join League"
            onClick1={() => {
              setLeagueCode("");
              setShowJoinLeague(false);
            }}
            onClick2={handleJoinLeague}
            loading={false}
          />
        </div>
      )}
      {showCreateNewLeague && (
        <div className="w-1/3 ">
          <h3 className="flex justify-center text-2xl font-semibold">
            Create New League
          </h3>
          <FormControl fullWidth required>
            <Input
              type="text"
              name="leagueName"
              placeholder="League Name"
              value={leagueName}
              onChange={(e) => setLeagueName(e.target.value)}
              className="w-full p-3 mb-6 border border-gray-300 rounded-2xl mt-2 bg-white"
            ></Input>
          </FormControl>

          <ActionButtons
            text1="Close"
            text2="Create new League"
            onClick1={() => {
              setLeagueName("");
              setShowCreateNewLeague(false);
            }}
            onClick2={handleSubmitNewLeague}
            loading={false}
          />
        </div>
      )}

      {/* League Tables */}
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md">
        {/** Private Leagues */}
        <LeagueSection
          title="Private leagues"
          leagues={privateLeagues ?? []}
          onOpenModal={handleOpenModal}
        />
        {/** Global Leagues */}
        <LeagueSection
          title="Global leagues"
          leagues={overallLeague ? [overallLeague] : []}
          onOpenModal={handleOpenModal}
        />
      </div>
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="league-dialog"
        aria-describedby="league-dialog-description"
        className="flex justify-center items-center w-full"
      >
        <DialogContent className=" sm:max-w-sm md:max-w-md lg:max-w-lg bg-white rounded-lg shadow-lg p-4 sm:p-6 relative">
          {/* Header */}
          <div className="bg-colors-nba-blue text-white px-4 py-3 flex justify-between items-center rounded-t-lg">
            <span className="text-sm md:text-lg font-bold">
              {selectedLeague?.name || "League"}
            </span>
            <IconButton
              onClick={handleCloseModal}
              className="absolute "
              size="large"
            >
              <Close
                sx={{
                  color: "white",
                  backgroundColor: "#C8102E",
                  borderRadius: "50%",
                  padding: "2px",
                }}
                fontSize="inherit"
              />
            </IconButton>
          </div>

          {/* Modal Content */}
          <div className="flex flex-col items-center space-y-4 mt-4">
            {selectedLeague && (
              <button
                className="w-full max-w-xs sm:max-w-sm md:max-w-md text-lg bg-colors-nba-yellow hover:opacity-80 py-2 rounded-lg text-black shadow-md font-semibold"
                onClick={() => handleLeagueClick(selectedLeague)}
              >
                Standings
              </button>
            )}

            {selectedLeague?.admin?.id === currentUser?.id &&
              selectedLeague && (
                <button
                  className="w-full max-w-xs sm:max-w-sm md:max-w-md text-lg bg-colors-nba-yellow hover:opacity-80 py-2 rounded-lg text-black shadow-md font-semibold"
                  onClick={() => handleManageLeague(selectedLeague)}
                >
                  Manage League
                </button>
              )}

            {selectedLeague?.name !== "Overall" &&
              selectedLeague?.admin?.id !== currentUser?.id &&
              selectedLeague && (
                <button
                  className="w-full max-w-xs sm:max-w-sm md:max-w-md text-lg bg-colors-nba-red hover:bg-red-700 py-2 rounded-lg text-white shadow-md font-semibold"
                  onClick={() => handleLeaveLeague(selectedLeague)}
                >
                  Leave League
                </button>
              )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const LeagueSection: React.FC<{
  title: string;
  leagues: League[];
  onOpenModal: (league: League) => void;
}> = ({ title, leagues, onOpenModal }) => {
  const navigate = useNavigate();
  const handleLeagueClick = (league: League) => {
    navigate(`/league`, { state: { league: league } });
  };

  return (
    <div className="mb-2">
      <div className="bg-colors-nba-blue text-white px-6 py-2 text-lg font-semibold">
        {title}
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b">
            <th className="px-6 py-2">League</th>
            <th className="p-2 text-center">Options</th>
          </tr>
        </thead>
        <tbody>
          {leagues.length > 0 ? (
            leagues.map((league, index) => (
              <tr key={index} className="border-b hover:bg-gray-100">
                <td
                  className="px-6 py-2 w-1/2 hover:cursor-pointer hover:underline"
                  onClick={() => handleLeagueClick(league)}
                >
                  {league.name}
                </td>

                <td className="px-6 py-2 text-center">
                  <IconButton
                    onClick={() => {
                      onOpenModal(league);
                    }}
                  >
                    <Settings />
                  </IconButton>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="p-4 text-center text-gray-500">
                No leagues available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LeaguesSelectionPage;
