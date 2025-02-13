import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import SubmitButton from "../common/SubmitButton";
import { Series } from "../../pages/HomePage";
import axiosInstance from "../../api/axiosInstance";
import { useError } from "../providers&context/ErrorProvider";
import { useSuccessMessage } from "../providers&context/successMassageProvider";
import { Box, Tab, Tabs, Tooltip } from "@mui/material";
import BetsDisplay from "../forPages/BetsDisplay";

export interface Team {
  image: string;
  seed: number;
  name: string;
}

export interface Bet {
  player1: string;
  player2: string;
  category: string[];
  differential: number;
}
export const HorizontalBar = ({ first, second, option1, option2 }) => {
  // Ensure values are valid percentages and sum up correctly
  const leftWidth = Math.max(0, Math.min(first, 100));
  const rightWidth = Math.max(0, Math.min(second, 100 - leftWidth));
  const noneWidth = 100 - leftWidth - rightWidth;

  return (
    <div className="flex w-full border border-gray-200 rounded-lg p-0.5 h-8">
      {/* First Section */}
      <Tooltip title={option1} arrow>
        <div
          className={`flex bg-colors-nba-blue items-center justify-center truncate 
            ${
              rightWidth === 0 && noneWidth === 0
                ? "rounded-e-md rounded-s-md"
                : "rounded-s-md"
            }`}
          style={{ width: `${leftWidth}%` }}
        >
          {leftWidth}%
        </div>
      </Tooltip>

      {/* Second Section */}
      <Tooltip title={option2} arrow>
        <div
          className={`flex items-center justify-center truncate 
            ${leftWidth === 0 ? "rounded-s-md" : ""} 
            ${noneWidth === 0 ? "rounded-e-md" : ""}`}
          style={{
            width: `${rightWidth}%`,
            backgroundColor: "#539dc9",
          }}
        >
          {rightWidth}%
        </div>
      </Tooltip>

      {/* None Section (Remaining Space) */}
      {noneWidth > 0 && (
        <Tooltip title="None" arrow>
          <div
            className={`flex items-center justify-center truncate rounded-e-md 
              ${leftWidth === 0 && rightWidth === 0 ? "rounded-s-md" : ""}`}
            style={{
              width: `${noneWidth}%`,
              backgroundColor: "#c8f7ff",
            }}
          >
            {noneWidth}%
          </div>
        </Tooltip>
      )}
    </div>
  );
};
interface TeamDialogProps {
  isOpen: boolean;
  series: Series;
  closeDialog: () => void;
  userPoints: number;
}

const TeamDialog: React.FC<TeamDialogProps> = ({
  isOpen,
  series,
  closeDialog,
  userPoints,
}) => {
  const [selectedTeam, setSelectedTeam] = useState<number>(-1); // Track selected team
  const [selectedPlayerForBet, setSelectedPlayerForBet] = useState<{
    [key: string]: number;
  }>({}); // Track selected player for each bet
  const [selectedPlayerForBetSpontaneous, setSelectedPlayerForBetSpontaneous] =
    useState<{
      [key: string]: number;
    }>({});
  const [selectedNumberOfGames, setSelectedNumberOfGames] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const { showError } = useError();
  const { showSuccessMessage } = useSuccessMessage();
  const [hasGuesses, setHasGuesses] = useState<boolean>(false);
  const [guessPercentage, setGuessPercentage] = useState<{
    teamWin: { 1: number; 2: number };
    playerMatchup: { [key: string]: { 1: number; 2: number } };
    spontaneousMacthups: { [key: string]: { 1: number; 2: number } };
  }>({ teamWin: { 1: 0, 2: 0 }, playerMatchup: {}, spontaneousMacthups: {} });

  const time = series.timeOfStart.split(":");
  series.dateOfStart.setHours(parseInt(time[0]));
  series.dateOfStart.setMinutes(parseInt(time[1]));
  const isStartDatePassed = new Date() > new Date(series.dateOfStart);
  const [selectedTab, setSelectedTab] = useState<number>(0);

  const [numOfSpontaneousBets, setNumOfSpontaneousBets] = useState<number>(0);

  const createDateExpiration = () => {
    const dateExpiration: { [key: string]: boolean } = {};
    const spontaneousBets = series.spontaneousBets;
    spontaneousBets?.map((bet) => {
      dateExpiration[bet.id] = new Date(bet.startTime) < new Date();
    });

    return dateExpiration;
  };
  const spontaneousExpiration: { [key: string]: boolean } =
    createDateExpiration();
  const intialTabCheck = (expirations: { [key: string]: boolean }) => {
    for (const key of Object.keys(expirations)) {
      if (!expirations[key]) {
        const game = series?.spontaneousBets?.filter((bet) => bet.id === key);
        return game ? game[0].gameNumber : 1;
      }
    }
  };
  const [gamesTab, setGamesTab] = useState<number>(
    intialTabCheck(spontaneousExpiration) ?? 1
  );
  // Handle team selection
  const handleTeamSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedTeam(parseInt(event.target.value));
  };

  // Handle player selection for each bet
  const handlePlayerSelection = (id: string, player: number) => {
    if (selectedTab === 0) {
      setSelectedPlayerForBet((prevState) => ({
        ...prevState,
        [id]: player,
      }));
    } else {
      setSelectedPlayerForBetSpontaneous((prevState) => ({
        ...prevState,
        [id]: player,
      }));
    }
  };

  const handleNumberOfGamesSelection = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedNumberOfGames(parseInt(event.target.value));
  };
  const handleSubmit = async () => {
    // Validate input
    if (selectedTeam === -1 || selectedNumberOfGames === 0) {
      showError("Please complete all selections before submitting.");
      return;
    }
    setLoading(true);
    if (!hasGuesses) {
      try {
        if (selectedTab === 0) {
          await axiosInstance.post(`/series/${series.id}/createGuesses`, {
            teamWinGuess: selectedTeam,
            bestOf7Guess: selectedNumberOfGames,
            playermatchupGuess: selectedPlayerForBet,
          });
        } else {
          await axiosInstance.post(`spontaneous-guess/update`, {
            spontaneousGuesses: selectedPlayerForBetSpontaneous,
          });
        }
        closeDialog(); // Close the dialog if submission is successful
      } catch (error) {
        if (error.response) {
          showError(
            `Failed to create guesses: ${
              error.response.data.message || error.message
            }`
          );
        } else {
          showError("An unexpected error occurred.");
        }
      } finally {
        showSuccessMessage("Guesses were updated.");
        setLoading(false);
        setSelectedTeam(-1); // Reset selected team
        setSelectedPlayerForBet({}); // Reset selected players for bets
        setSelectedPlayerForBetSpontaneous({});
        setSelectedNumberOfGames(0); // Reset number of games
        setHasGuesses(false);
      }
    } else {
      try {
        console.log("here");
        await axiosInstance.patch(`/series/${series.id}/updateGuesses`, {
          teamWinGuess: selectedTeam,
          bestOf7Guess: selectedNumberOfGames,
          playermatchupGuess: playerMatchupGuesses,
        });
        closeDialog(); // Close the dialog if submission is successful
      } catch (error) {
        if (error.response) {
          showError(
            `Failed to create guesses: ${
              error.response.data.message || error.message
            }`
          );
        } else {
          showError("An unexpected error occurred.");
        }
      } finally {
        showSuccessMessage("Guesses were updated.");
        setLoading(false);
        setSelectedTeam(-1); // Reset selected team
        setSelectedPlayerForBet({}); // Reset selected players for bets
        setSelectedPlayerForBetSpontaneous({});
        setSelectedNumberOfGames(0); // Reset number of games
        setHasGuesses(false);
      }
    }
  };
  const getUserGuesses = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `series/${series.id}/getGuesses`
      );
      return response.data;
    } catch (error) {
      showError(`Failed to get guesses ${error}`);
    } finally {
      setLoading(false);
    }
  };
  const checkNumOfgames = () => {
    let max = 0;
    series.spontaneousBets?.forEach((bet) => {
      if (bet.gameNumber && bet.gameNumber > max) {
        max = bet.gameNumber ?? 0;
      }
    });
    return max;
  };
  useEffect(() => {
    if (isOpen && series) {
      const fetchGuesses = async () => {
        const userGuesses = await getUserGuesses();

        if (userGuesses["teamWinGuess"]) {
          // setHasGuesses(true);
          setSelectedTeam(userGuesses["teamWinGuess"]["guess"]);
        }
        if (userGuesses["playerMatchupGuess"].length > 0) {
          userGuesses["playerMatchupGuess"].forEach(
            (element: any, idx: number) => {
              handlePlayerSelection(element["bet"]["id"], element["guess"]);
            }
          );
          // setHasGuesses(true);
        }
        if (userGuesses["bestOf7Guess"]) {
          setSelectedNumberOfGames(userGuesses["bestOf7Guess"]["guess"]);
          // setHasGuesses(true);
        } else {
          setSelectedTeam(-1); // Reset selected team
          setSelectedPlayerForBet({}); // Reset selected players for bets
          setSelectedPlayerForBetSpontaneous({});
          setSelectedNumberOfGames(0); // Reset number of games
          setHasGuesses(false);
        }
      };
      const fetchGuessesSpontaneous = async () => {
        setLoading(true);
        try {
          const response = await axiosInstance.get(
            `series/${series.id}/getSpontaneousGuesses`
          );
          if (response.data.length > 0) {
            response.data.forEach((element: any) => {
              setSelectedPlayerForBetSpontaneous((prevState) => ({
                ...prevState,
                [element["bet"]["id"]]: element["guess"],
              }));
            });
          }
        } catch (error) {
          showError(`Failed to get guesses ${error}`);
        } finally {
          setLoading(false);
        }
      };
      fetchGuesses();
      fetchGuessesSpontaneous();
      setNumOfSpontaneousBets(checkNumOfgames());
    }
  }, [isOpen, series]);

  useEffect(() => {
    if (isOpen && series) {
      const fetchGuessPercentage = async () => {
        setLoading(true);
        try {
          const response = await axiosInstance.get(
            `/series/${series.id}/getPercentages`
          );
          console.log(response.data);
          setGuessPercentage(response.data);
        } catch (error) {
          showError(`Failed to get percentage.`);
        } finally {
          setLoading(false);
        }
      };
      fetchGuessPercentage();
    }
  }, [isOpen, series]);

  const handleRemoveGuessFromBet = (id: string, idx: number) => {
    if (selectedTab === 0) {
      if (selectedPlayerForBet[id] === idx) {
        const updatedState = { ...selectedPlayerForBet };

        // Delete the property from the copy
        delete updatedState[id];

        // Update the state with the new object
        setSelectedPlayerForBet(updatedState);
      }
    } else {
      if (selectedPlayerForBetSpontaneous[id] === idx) {
        const updatedState = { ...selectedPlayerForBetSpontaneous };

        // Delete the property from the copy
        delete updatedState[id];

        // Update the state with the new object
        setSelectedPlayerForBetSpontaneous(updatedState);
      }
    }
  };
  return (
    <Dialog open={isOpen} onClose={closeDialog} className="relative z-30">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        aria-hidden="true"
      />

      {/* Centered Panel */}
      <div className="fixed inset-0 flex items-center justify-center ">
        <Dialog.Panel className="bg-white rounded-3xl w-full max-w-5xl p-4 relative max-h-[90vh] overflow-y-auto">
          {/* Close Button */}
          <button
            type="button"
            onClick={closeDialog}
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white absolute top-4 right-4"
          >
            <svg
              className="w-3 h-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
            <span className="sr-only">Close modal</span>
          </button>

          {/* Title */}
          <Dialog.Title
            as="h3"
            className="text-2xl font-bold flex justify-center mb-4"
          >
            Series bets
          </Dialog.Title>

          <div className="flex justify-center mb-4 space-x-10 items-center">
            <img
              src={series.logo1}
              alt={`${series.logo1} logo`}
              className="h-20 object-contain"
            />

            {isStartDatePassed && (
              <div className="text-center text-lg font-semibold text-gray-700 bg-colors-nba-blue bg-opacity-40 px-4 py-2 rounded-lg shadow-md ">
                The series has started!{" "}
                {numOfSpontaneousBets === 0 ? (
                  <p>Bets are now closed.</p>
                ) : (
                  <br />
                )}
                Last update:{" "}
                {new Date(series.lastUpdate).toLocaleString("he-IL", {
                  timeZone: "Asia/Jerusalem",
                })}
                <br />
                Points gained: {userPoints}
              </div>
            )}

            <img
              src={series.logo2}
              alt={`${series.logo2} logo`}
              className="h-20 object-contain"
            />
          </div>

          <div className="mt-4 ">
            {/* Dropdown for selecting number of games */}
            <h4 className="text-lg font-semibold mb-2 flex justify-center">
              Choose the number of games
            </h4>
            <div className="flex justify-center mb-4">
              <select
                className="p-2 border w-1/6 text-colors-nba-blue border-colors-nba-blue rounded-lg"
                value={selectedNumberOfGames}
                onChange={handleNumberOfGamesSelection}
                disabled={isStartDatePassed}
              >
                <option value="">Games</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
              </select>
            </div>

            {/* Team Selection with Radio Buttons */}
            <h4 className="text-lg font-semibold mb-2 flex justify-center">
              Choose the winner of the series
            </h4>
            <ul className="space-x-4 w-full ">
              <li className="flex justify-between">
                {/* Team 1 Selection */}
                <div className="flex items-center md:w-full space-x-4">
                  <input
                    type="radio"
                    id="team1"
                    name="team"
                    value={1}
                    className="hidden peer"
                    onChange={handleTeamSelection}
                    onClick={() => setSelectedTeam(-1)}
                    checked={selectedTeam === 1}
                    disabled={isStartDatePassed}
                  />
                  <label
                    htmlFor="team1"
                    className={`inline-flex items-center justify-between w-full p-5 text-black bg-white border border-gray-200 rounded-lg ${
                      !isStartDatePassed ? "cursor-pointer" : ""
                    } dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-colors-nba-blue peer-checked:bg-colors-select-bet peer-checked:text-colors-nba-blue hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700`}
                  >
                    <div className="block">
                      <div className="w-full text-lg font-semibold">
                        {series.team1}
                      </div>
                      <div className="w-full">Seed #{series.seed1}</div>
                    </div>
                  </label>
                </div>

                {/* Team 2 Selection */}
                <div className="flex items-center md:w-full space-x-4">
                  <input
                    type="radio"
                    id="team2"
                    name="team"
                    value={2}
                    className="hidden peer"
                    onChange={handleTeamSelection}
                    onClick={() => setSelectedTeam(-1)}
                    checked={selectedTeam === 2}
                    disabled={isStartDatePassed}
                  />
                  <label
                    htmlFor="team2"
                    className={`inline-flex items-center justify-between w-full p-5 text-black bg-white border border-gray-200 rounded-lg ${
                      !isStartDatePassed ? "cursor-pointer" : ""
                    } dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-colors-nba-blue peer-checked:bg-colors-select-bet peer-checked:text-colors-nba-blue hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700`}
                  >
                    <div className="block">
                      <div className="w-full text-lg font-semibold">
                        {series.team2}
                      </div>
                      <div className="w-full">Seed #{series.seed2}</div>
                    </div>
                  </label>
                </div>
                <div className="items-center ml-2 md:w-1/4 inline-flex justify-end  text-black bg-white  rounded-lg">
                  {isStartDatePassed && (
                    <HorizontalBar
                      first={guessPercentage?.teamWin["1"]}
                      second={guessPercentage?.teamWin["2"]}
                      option1={series.team1}
                      option2={series.team2}
                    />
                  )}
                </div>
              </li>
            </ul>
          </div>

          <Box
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Tabs
              value={selectedTab}
              onChange={(e, newValue) => setSelectedTab(newValue)}
            >
              <Tab label="Series Bets" />
              {numOfSpontaneousBets > 0 && <Tab label="Spontaneous Bets" />}
            </Tabs>
          </Box>
          {selectedTab === 0 && (
            <BetsDisplay
              bets={series.playerMatchupBets ?? []}
              selectedPlayerForBet={selectedPlayerForBet}
              handlePlayerSelection={handlePlayerSelection}
              handleRemoveGuessFromBet={handleRemoveGuessFromBet}
              isStartDatePassed={isStartDatePassed}
              guessPercentage={guessPercentage.playerMatchup}
            />
          )}
          {selectedTab === 1 && (
            <div>
              <Box
                sx={{
                  borderBottom: 1,
                  borderColor: "divider",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Tabs
                  value={gamesTab - 1}
                  onChange={(e, newValue) => {
                    setGamesTab(newValue + 1);
                  }}
                >
                  {numOfSpontaneousBets > 0 &&
                    Array.from(
                      { length: numOfSpontaneousBets },
                      (_, i) => i + 1
                    ).map((game) => <Tab key={game} label={game} />)}
                </Tabs>
              </Box>
              <BetsDisplay
                bets={
                  series.spontaneousBets?.filter(
                    (bet) => bet.gameNumber === gamesTab
                  ) ?? []
                }
                selectedPlayerForBet={selectedPlayerForBetSpontaneous}
                handlePlayerSelection={handlePlayerSelection}
                handleRemoveGuessFromBet={handleRemoveGuessFromBet}
                isStartDatePassed={
                  spontaneousExpiration[
                    series.spontaneousBets?.filter(
                      (bet) => bet.gameNumber === gamesTab
                    )[0].id ?? 0
                  ]
                }
                guessPercentage={guessPercentage.spontaneousMacthups}
              />
            </div>
          )}
          {/* Update Button */}
          {(!isStartDatePassed ||
            (selectedTab === 1 &&
              !spontaneousExpiration[
                series.spontaneousBets?.filter(
                  (bet) => bet.gameNumber === gamesTab
                )[0].id ?? 0
              ])) && (
            <div className="m-4 flex justify-center p-4">
              <SubmitButton
                text={loading ? "Updating.." : "Update"}
                onClick={handleSubmit}
                loading={false}
                disabled={
                  selectedTab === 0
                    ? isStartDatePassed
                    : spontaneousExpiration[
                        series.spontaneousBets?.filter(
                          (bet) => bet.gameNumber === gamesTab
                        )[0].id ?? 0
                      ]
                }
              />
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default TeamDialog;
