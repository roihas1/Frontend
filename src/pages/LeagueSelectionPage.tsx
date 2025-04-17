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
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface League {
  id?: string;
  name: string;
  code?: string;
  admin?: User;
  users?: User[];
}

const LeaguesSelectionPage: React.FC = () => {
  const { showError } = useError();
  const { showSuccessMessage } = useSuccessMessage();
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showCreateNewLeague, setShowCreateNewLeague] =
    useState<boolean>(false);
  // const [currentUser, setCurrentUser] = useState<User>();
  const [showJoinLeague, setShowJoinLeague] = useState<boolean>(false);
  const [leagueCode, setLeagueCode] = useState<string>("");
  const [leagueName, setLeagueName] = useState<string>("");
  // const [overallLeague, setOverallLeague] = useState<League | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleOpenModal = (league: League) => {
    setSelectedLeague(league);
    setModalOpen(true);
  };

  const handleLeagueClick = (league: League) => {
    navigate(`/league`, { state: { league: league } });
  };

  const handleManageLeague = (league: League) => {
    navigate(`/manageLeague`, { state: { league: league } });
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedLeague(null);
  };

  const {
    data: privateLeagues,
    isError,
  } = useQuery({
    queryKey: ["private-leagues"],
    queryFn: async () => {
      const response = await axiosInstance.get(`/private-league`);
      return response.data;
    },
    staleTime: 3 * 60 * 1000,
    gcTime: 3 * 60 * 1000,
  });

  useEffect(() => {
    if (isError) {
      showError("Failed to fetch leagues");
    }
  }, [isError]);

  const { data: overallUsers, isError: isOverallError } = useQuery({
    queryKey: ["overall-league"],
    queryFn: async () => {
      const response = await axiosInstance.get("/auth/standings");
      return response.data;
    },
    staleTime: 3 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const overallLeague: League | null = overallUsers
    ? { name: "Overall", users: overallUsers }
    : null;

  useEffect(() => {
    if (isOverallError) {
      showError("Failed to fetch overall league");
    }
  }, [isOverallError]);

  // useEffect(() => {
  //   // fetchOverallLeague();
  //   fetchUser();
  // }, []);
  const handleCreateNewLeague = () => setShowCreateNewLeague(true);
  const handleShowJoinLeague = () => setShowJoinLeague(true);
  const joinLeagueMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await axiosInstance.post(`/private-league/joinLeague`, { code });
      return response.data;
    },
    onSuccess: (data: any) => {
      showSuccessMessage(data.message);
      queryClient.invalidateQueries({ queryKey: ["private-leagues"] });
      setShowJoinLeague(false);
      setLeagueCode("");
    },
    onError: (error: any) => {
      if (axios.isAxiosError(error) && error.response) {
        showError(`Failed to join a league. ${error.response.data.message}`);
      } else {
        showError(`Failed to join a league. Unexpected error occurred.`);
      }
    },
  });
  const handleJoinLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leagueCode) {
      showError(`Must enter a league code`);
      return;
    }
    joinLeagueMutation.mutate(leagueCode);
  };
  
  // const handleJoinLeague = async () => {
  //   if (!leagueCode) return showError(`Must enter a league code`);
  //   try {
  //     const response = await axiosInstance.post(`/private-league/joinLeague`, {
  //       code: leagueCode,
  //     });
  //     showSuccessMessage(response.data.message);
  //     setShowJoinLeague(false);
  //     refetch();
  //   } catch (error) {
  //     if (axios.isAxiosError(error) && error.response) {
  //       showError(`Failed to join a league. ${error.response.data.message}`);
  //     } else {
  //       showError(`Failed to join a league. Unexpected error occurred.`);
  //     }
  //   }
  // };
  const { data: currentUser, isError: isUserError } = useQuery<User>({
    queryKey: ["current-user"],
    queryFn: async () => {
      const response = await axiosInstance.get("/auth/user");
      return response.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes (stays fresh)
    gcTime: 60 * 60 * 1000,    // 1 hour (kept in cache)
  });
  
  useEffect(() => {
    if (isUserError) {
      showError("Failed to fetch user info");
    }
  }, [isUserError]);
  
  // const fetchUser = async () => {
  //   try {
  //     const response = await axiosInstance.get("/auth/user");
  //     setCurrentUser(response.data);
  //   } catch (error) {
  //     showError(`Server error.`);
  //   }
  // };

  const handleSubmitNewLeague = async () => {
    if (!leagueName) return showError(`Must enter a league name`);
    try {
      await axiosInstance.post(`/private-league`, { name: leagueName });
      showSuccessMessage(`${leagueName} created.`);
      setShowCreateNewLeague(false);

      await queryClient.invalidateQueries({ queryKey: ["private-leagues"] });
      await queryClient.refetchQueries({ queryKey: ["private-leagues"] });
    } catch {
      showError(`Failed to create new league.`);
    }
  };

  const handleLeaveLeague = async (league: League) => {
    try {
      await axiosInstance.patch(`/private-league/${league?.id}/leaveLeague`);
      showSuccessMessage(`Leaved the league.`);
      handleCloseModal();
      await queryClient.invalidateQueries({ queryKey: ["private-leagues"] });
      await queryClient.refetchQueries({ queryKey: ["private-leagues"] });
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
        <div className="w-1/2 sm:w-1/5">
          <h3 className="text-center text-xl sm:text-2xl font-semibold mb-4">
            Join League
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
        <div className="w-1/2 sm:w-1/5 ">
          <h3 className="text-center text-xl sm:text-2xl font-semibold mb-4">
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
