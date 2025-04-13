import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import SubmitButton from "../common/SubmitButton";
import { Series } from "../../pages/HomePage";
import axiosInstance from "../../api/axiosInstance";
import { useError } from "../providers&context/ErrorProvider";
import { useSuccessMessage } from "../providers&context/successMassageProvider";
import { Box, CircularProgress, Tab, Tabs, Tooltip } from "@mui/material";
import BetsDisplay from "../forPages/BetsDisplay";
import { useMissingBets } from "../providers&context/MissingBetsContext";

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
interface HorizontalBarProps {
  first: number;
  second: number;
  option1: string;
  option2: string;
}
export const HorizontalBar: React.FC<HorizontalBarProps> = ({
  first,
  second,
  option1,
  option2,
}) => {
  // Ensure values are valid percentages and sum up correctly
  const leftWidth = Math.max(0, Math.min(first, 100));
  const rightWidth = Math.max(0, Math.min(second, 100 - leftWidth));
  const noneWidth = 100 - leftWidth - rightWidth;
  const leftPercetangeDisplay =
    leftWidth >= rightWidth && leftWidth >= noneWidth;
  const rightPercetangeDisplay =
    rightWidth > leftWidth && rightWidth > noneWidth;

  return (
    <div className="flex flex-col sm:flex-row items-center w-full">
      <div className="flex w-full border border-gray-200 rounded-lg p-0.5 h-8">
        {/* First Section */}
        <Tooltip title={option1} arrow>
          <div
            className={`flex items-center justify-center truncate bg-colors-nba-blue 
              ${
                rightWidth < 1 && noneWidth < 1
                  ? "rounded-e-md rounded-s-md"
                  : "rounded-s-md"
              }`}
            style={{ width: `${leftWidth}%`, color: "white" }}
          >
            {leftPercetangeDisplay && (
              <span className=" hidden sm:inline text-s">
                {leftWidth.toFixed(1)}%
              </span>
            )}
            {leftPercetangeDisplay && (
              <span className="sm:hidden">
                {option1} ({leftWidth.toFixed(1)}%)
              </span>
            )}
          </div>
        </Tooltip>

        {/* Second Section */}
        <Tooltip title={option2} arrow>
          <div
            className={`flex items-center justify-center truncate bg-[#539dc9]
              ${leftWidth < 1 ? "rounded-s-md" : ""} 
              ${noneWidth < 1 ? "rounded-e-md" : ""}`}
            style={{ width: `${rightWidth}%`, color: "white" }}
          >
            {rightPercetangeDisplay && (
              <span className="hidden sm:inline text-s ">
                {rightWidth.toFixed(1)}%
              </span>
            )}
            {rightPercetangeDisplay && (
              <span className=" sm:hidden ">
                {option2} ({rightWidth.toFixed(1)}%)
              </span>
            )}
          </div>
        </Tooltip>

        {/* None Section (Remaining Space) */}
        {noneWidth > 0 && (
          <Tooltip title="None" arrow>
            <div
              className={`flex items-center justify-center truncate bg-[#c8f7ff] rounded-e-md
                ${leftWidth < 1 && rightWidth < 1 ? "rounded-s-md" : ""}`}
              style={{ width: `${noneWidth}%`, color: "black" }}
            >
              {!rightPercetangeDisplay &&
                !leftPercetangeDisplay &&
                `${noneWidth.toFixed(1)}%`}
            </div>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

interface TeamDialogProps {
  isOpen: boolean;
  series: Series;
  closeDialog: () => void;
  userPoints: number;
  intialSelectedTab?: number;
  intialGamesTab?: number;
  fetchData?: () => void;
}

const TeamDialog: React.FC<TeamDialogProps> = ({
  isOpen,
  series,
  closeDialog,
  userPoints,
  intialSelectedTab,
  intialGamesTab,
  fetchData = () => {},
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
  const { triggerRefresh } = useMissingBets();

  const time = series.timeOfStart.split(":");
  series.dateOfStart.setHours(parseInt(time[0]));
  series.dateOfStart.setMinutes(parseInt(time[1]));
  const isStartDatePassed = new Date() > new Date(series.dateOfStart);
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [numOfSpontaneousBets, setNumOfSpontaneousBets] = useState<number>(0);

  const createDateExpiration = () => {
    const dateExpiration: { [key: string]: boolean } = {};
    const spontaneousBets = series.spontaneousBets;

    spontaneousBets?.forEach((bet) => {
      if (bet.startTime) {
        dateExpiration[bet.id] = new Date(bet.startTime) < new Date();
      } else {
        dateExpiration[bet.id] = false; // Default to false if no start time is set
      }
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
  useEffect(() => {
    if (validationError) {
      const timer = setTimeout(() => {
        setValidationError(null);
      }, 5000); // 🕐 Clear error after 5 seconds

      return () => clearTimeout(timer); // Cleanup if the component unmounts
    }
  }, [validationError]);
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
  const formValidation = () => {
    if (selectedTeam === -1 || selectedNumberOfGames === 0) {
      setValidationError(
        "For update bets, first fill games selection and winner team"
      );
      return false;
    }
    return true;
  };
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const handleSubmit = async () => {
    // Validate input
    setValidationError(null);
    if (formValidation()) {
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
          await delay(500);
          await axiosInstance.patch(`user-missing-bets/user/updateBets`);
          showSuccessMessage("Guesses were updated.");
          setLoading(false);
          setSelectedTeam(-1); // Reset selected team
          setSelectedPlayerForBet({}); // Reset selected players for bets
          setSelectedPlayerForBetSpontaneous({});
          setSelectedNumberOfGames(0); // Reset number of games
          setHasGuesses(false);

          closeDialog(); // Close the dialog if submission is successful
          triggerRefresh();
          fetchData();
        } catch {
          showError("An unexpected error occurred.");
        }
      }
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
    const fetchAllGuessesAndStats = async () => {
      if (!isOpen || !series) return;

      setLoading(true);
      try {
        const response = await axiosInstance.get(
          `/series/${series.id}/full-data`
        );

        const {
          guesses: userGuesses,
          spontaneousGuesses,
          percentages,
        } = response.data;
        if (userGuesses["teamWinGuess"]) {
          // setHasGuesses(true);
          setSelectedTeam(userGuesses["teamWinGuess"]["guess"]);
        }
        if (userGuesses["playerMatchupGuess"].length > 0) {
          userGuesses["playerMatchupGuess"].forEach((element: any) => {
            handlePlayerSelection(element["betId"], element["guess"]);
          });
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

        if (spontaneousGuesses?.length > 0) {
          spontaneousGuesses.forEach((element: any) => {
            setSelectedPlayerForBetSpontaneous((prevState) => ({
              ...prevState,
              [element["betId"]]: element["guess"],
            }));
          });
        }

        if (percentages) {
          setGuessPercentage(percentages);
        }

        setNumOfSpontaneousBets(checkNumOfgames());
      } catch (error) {
        console.log(error)
        showError("Failed to fetch guesses and stats.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllGuessesAndStats();
  }, [isOpen, series]);

  // const getUserGuesses = async () => {
  //   setLoading(true);
  //   try {
  //     const response = await axiosInstance.get(
  //       `series/${series.id}/getGuesses`
  //     );
  //     return response.data;
  //   } catch (error) {
  //     showError(`Failed to get guesses ${error}`);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   if (isOpen && series) {
  //     const fetchGuesses = async () => {
  //       const userGuesses = await getUserGuesses();

  //       if (userGuesses["teamWinGuess"]) {
  //         // setHasGuesses(true);
  //         setSelectedTeam(userGuesses["teamWinGuess"]["guess"]);
  //       }
  //       if (userGuesses["playerMatchupGuess"].length > 0) {
  //         userGuesses["playerMatchupGuess"].forEach((element: any) => {
  //           handlePlayerSelection(element["bet"]["id"], element["guess"]);
  //         });
  //         // setHasGuesses(true);
  //       }
  //       if (userGuesses["bestOf7Guess"]) {
  //         setSelectedNumberOfGames(userGuesses["bestOf7Guess"]["guess"]);
  //         // setHasGuesses(true);
  //       } else {
  //         setSelectedTeam(-1); // Reset selected team
  //         setSelectedPlayerForBet({}); // Reset selected players for bets
  //         setSelectedPlayerForBetSpontaneous({});
  //         setSelectedNumberOfGames(0); // Reset number of games
  //         setHasGuesses(false);
  //       }
  //     };
  //     const fetchGuessesSpontaneous = async () => {
  //       setLoading(true);
  //       try {
  //         const response = await axiosInstance.get(
  //           `series/${series.id}/getSpontaneousGuesses`
  //         );
  //         if (response.data.length > 0) {
  //           response.data.forEach((element: any) => {
  //             setSelectedPlayerForBetSpontaneous((prevState) => ({
  //               ...prevState,
  //               [element["betId"]]: element["guess"],
  //             }));
  //           });
  //         }
  //       } catch (error) {
  //         showError(`Failed to get guesses ${error}`);
  //       } finally {
  //         setLoading(false);
  //       }
  //     };
  //     fetchGuesses();
  //     fetchGuessesSpontaneous();
  //     setNumOfSpontaneousBets(checkNumOfgames());
  //   }
  // }, [isOpen, series]);

  // useEffect(() => {
  //   if (isOpen && series) {
  //     const fetchGuessPercentage = async () => {
  //       setLoading(true);
  //       try {

  //         console.log(new Date(`${series.dateOfStart}T${series.timeOfStart}`) )
  //         console.log(new Date())
  //         if (isStartDatePassed) {
  //           const response = await axiosInstance.get(
  //             `/series/${series.id}/getPercentages`
  //           );
  //           setGuessPercentage(response.data);
  //         }
  //       } catch {
  //         showError(`Failed to get percentage.`);
  //       } finally {
  //         setLoading(false);
  //       }
  //     };
  //     fetchGuessPercentage();
  //   }
  // }, [isOpen, series]);

  useEffect(() => {
    if (isOpen) {
      setGamesTab(intialGamesTab ?? 1);
      setSelectedTab(intialSelectedTab ?? 0);
    }
  }, [isOpen, intialGamesTab, intialSelectedTab]);

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
  const currentSpontaneousBet =
    series.spontaneousBets?.filter((bet) => bet.gameNumber === gamesTab)[0] ??
    null;
  // const maxTabIndex = numOfSpontaneousBets - 1;
  const validGamesTab =
    gamesTab > 0 && gamesTab <= numOfSpontaneousBets ? gamesTab - 1 : 0;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-100 bg-opacity-80 flex justify-center items-center">
        <CircularProgress />
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onClose={closeDialog} className="relative z-30">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        aria-hidden="true"
      />

      {/* Centered Panel */}
      <div className="fixed inset-0 flex items-center justify-center ">
        <Dialog.Panel className="bg-white rounded-3xl w-full max-w-lg sm:max-w-5xl p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto">
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

          <div className="flex flex-col sm:flex-row justify-center items-center mb-4 space-y-4 sm:space-y-0 sm:space-x-10">
            {/* Team 1 Logo */}
            <img
              src={series.logo1}
              alt={`${series.logo1} logo`}
              className="h-16 sm:h-20 object-contain"
            />
            {!isStartDatePassed && (
              <p className=" hidden text-xs sm:inline sm:text-sm font-medium text-gray-600 text-center sm:text-left">
                <strong>Series start date:</strong>{" "}
                {new Date(series.dateOfStart).toLocaleString("he-IL", {
                  timeZone: "Asia/Jerusalem",
                })}
              </p>
            )}

            {isStartDatePassed && (
              <div
                className="text-center text-gray-700 bg-colors-nba-blue bg-opacity-40 px-4 py-2 rounded-lg shadow-md 
                 text-sm sm:text-lg leading-snug sm:leading-normal order-1 sm:order-none w-full sm:w-auto"
              >
                <p className="font-semibold">The series has started!</p>

                {numOfSpontaneousBets === 0 ? (
                  <p className="text-xs sm:text-base">Bets are now closed.</p>
                ) : (
                  <p className="text-xs sm:text-base">Check spontaneous bets</p>
                )}

                <p className="text-xs sm:text-base mt-1">
                  <span className="font-semibold">Last update:</span>{" "}
                  {new Date(series.lastUpdate).toLocaleString("he-IL", {
                    timeZone: "Asia/Jerusalem",
                  })}
                </p>

                <p className="text-xs sm:text-base mt-1">
                  <span className="font-semibold">Points gained:</span>{" "}
                  {userPoints}
                </p>
              </div>
            )}

            {/* Team 2 Logo */}
            <img
              src={series.logo2}
              alt={`${series.logo2} logo`}
              className="h-16 sm:h-20 object-contain"
            />
          </div>

          <div className="mt-4 ">
            {/* Dropdown for selecting number of games */}
            <h4 className="text-lg font-semibold mb-2 flex justify-center">
              Select the number of games
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
            <h4 className="text-lg font-semibold mb-2 text-center">
              Select the winner of the series
            </h4>

            <ul className="space-y-4">
              <li className="flex flex-col sm:flex-row items-center bg-white p-3 rounded-lg shadow-md border border-gray-200">
                {/* Team 1 Selection */}
                <div className="relative w-full">
                  <input
                    type="radio"
                    id="team1"
                    name="team"
                    value={1}
                    className="hidden peer"
                    onChange={handleTeamSelection}
                    checked={selectedTeam === 1}
                    disabled={isStartDatePassed}
                  />
                  <label
                    htmlFor="team1"
                    className={`block p-3 border rounded-lg text-center transition-all duration-200 w-full sm:w-full
          peer-checked:bg-colors-selected-bet peer-checked:border-colors-nba-blue hover:cursor-pointer
          ${
            selectedTeam === 1
              ? "bg-colors-select-bet border-colors-nba-blue text-gray-900"
              : "border-gray-300 bg-gray-100 text-gray-900"
          }  relative`}
                  >
                    <p className="font-semibold">{series.team1}</p>
                    <p className="text-sm">Seed #{series.seed1}</p>

                    {/* Green Dot if Team 1 is Leading */}
                    {isStartDatePassed &&
                      guessPercentage?.teamWin["1"] >
                        guessPercentage?.teamWin["2"] && (
                        <span className="absolute top-1/2 right-2 transform -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full" />
                      )}
                  </label>
                </div>

                {/* Team 2 Selection */}
                <div className="relative w-full">
                  <input
                    type="radio"
                    id="team2"
                    name="team"
                    value={2}
                    className="hidden peer"
                    onChange={handleTeamSelection}
                    checked={selectedTeam === 2}
                    disabled={isStartDatePassed}
                  />
                  <label
                    htmlFor="team2"
                    className={`block p-3 border rounded-lg text-center transition-all duration-200 w-full sm:w-full
          peer-checked:bg-colors-selected-bet peer-checked:border-colors-nba-blue hover:cursor-pointer
          ${
            selectedTeam === 2
              ? "bg-colors-select-bet border-colors-nba-blue text-gray-900"
              : "border-gray-300 bg-gray-100 text-gray-900"
          }  relative`}
                  >
                    <p className="font-semibold">{series.team2}</p>
                    <p className="text-sm">Seed #{series.seed2}</p>

                    {/* Green Dot if Team 2 is Leading */}
                    {isStartDatePassed &&
                      guessPercentage?.teamWin["1"] <
                        guessPercentage?.teamWin["2"] && (
                        <span className="absolute top-1/2 right-2 transform -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full" />
                      )}
                  </label>
                </div>
              </li>

              {/* Guess Percentage Bar - Now Below Team Selection */}
              {isStartDatePassed && (
                <div className="w-full flex justify-center mt-2">
                  <HorizontalBar
                    first={guessPercentage?.teamWin["1"]}
                    second={guessPercentage?.teamWin["2"]}
                    option1={series.team1}
                    option2={series.team2}
                  />
                </div>
              )}
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
              onChange={(e, newValue) => {
                e.preventDefault();
                setSelectedTab(newValue);
              }}
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
                  value={validGamesTab}
                  onChange={(e, newValue) => {
                    e.preventDefault();
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

              <p className="bg-colors-nba-blue bg-opacity-40 shadow-md rounded-lg text-center mx-auto my-4 p-2 w-fit text-sm font-medium text-gray-800">
                Game start:{" "}
                {(() => {
                  const startTime = series.spontaneousBets?.find(
                    (bet) => bet.gameNumber === gamesTab
                  )?.startTime;
                  return startTime
                    ? new Date(startTime).toLocaleString("he-IL", {
                        timeZone: "Asia/Jerusalem",
                      })
                    : "No time available";
                })()}
              </p>

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
                  spontaneousExpiration[currentSpontaneousBet?.id ?? ""] ?? true
                }
                guessPercentage={guessPercentage.spontaneousMacthups}
              />
            </div>
          )}
          {validationError && (
            <div className="text-red-600 font-medium text-center my-2">
              {validationError}
            </div>
          )}

          {/* Update Button */}
          {(!isStartDatePassed ||
            (selectedTab === 1 &&
              !spontaneousExpiration[currentSpontaneousBet?.id ?? ""])) && (
            <div className="m-4 flex justify-center p-4">
              <SubmitButton
                text={loading ? "Updating.." : "Update"}
                onClick={handleSubmit}
                loading={false}
                disabled={
                  selectedTab === 0
                    ? isStartDatePassed
                    : spontaneousExpiration[currentSpontaneousBet?.id ?? ""] ??
                      true
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
