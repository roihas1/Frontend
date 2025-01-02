import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import SubmitButton from "./SubmitButton";
import { Series } from "../../pages/HomePage";
import axiosInstance from "../../api/axiosInstance";
import { useError } from "../ErrorProvider";
import { useSuccessMessage } from "../successMassageProvider";
import { useUser } from "../userContext";

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

interface TeamDialogProps {
  isOpen: boolean;
  series: Series;
  closeDialog: () => void;
}

const TeamDialog: React.FC<TeamDialogProps> = ({
  isOpen,
  series,
  closeDialog,
}) => {
  const [selectedTeam, setSelectedTeam] = useState<number>(-1); // Track selected team
  const [selectedPlayerForBet, setSelectedPlayerForBet] = useState<{
    [key: number]: number;
  }>({}); // Track selected player for each bet
  const [selectedNumberOfGames, setSelectedNumberOfGames] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const { showError } = useError();
  const { showSuccessMessage } = useSuccessMessage();
  const [hasGuesses, setHasGuesses] = useState<boolean>(false);
  // const { role } = useUser();
 
  // Handle team selection
  const handleTeamSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedTeam(parseInt(event.target.value));
  };

  // Handle player selection for each bet
  const handlePlayerSelection = (betIndex: number, player: number) => {
    setSelectedPlayerForBet((prevState) => ({
      ...prevState,
      [betIndex]: player,
    }));
  };

  const handleNumberOfGamesSelection = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedNumberOfGames(parseInt(event.target.value));
  };
  const handleSubmit = async () => {
    // Validate input
    if (
      selectedTeam === -1 ||
      selectedNumberOfGames === 0 ||
      Object.keys(selectedPlayerForBet).length === 0
    ) {
      showError("Please complete all selections before submitting.");
      return;
    }

    const playerMatchupGuesses = Object.values(selectedPlayerForBet);
    setLoading(true);
    if (!hasGuesses) {
      try {
        await axiosInstance.post(`/series/${series.id}/createGuesses`, {
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
      }
    } else {
      try {
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
      }
    }
  };
  const getUserGuesses = async () => {
    try {
      const response = await axiosInstance.get(
        `series/${series.id}/getGuesses`
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      showError(`Failed to get guesses ${error}`);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const fetchGuesses = async () => {
        const userGuesses = await getUserGuesses();
        if (userGuesses["playerMatchupGuess"].length > 0) {
          setHasGuesses(true);
          setSelectedTeam(userGuesses["teamWinGuess"]["guess"]);
          setSelectedNumberOfGames(userGuesses["bestOf7Guess"]["guess"]);
          userGuesses["playerMatchupGuess"].forEach(
            (element: any, idx: number) => {
              handlePlayerSelection(idx, element["guess"]);
            }
          );
        } else {
          setSelectedTeam(-1); // Reset selected team
          setSelectedPlayerForBet({}); // Reset selected players for bets
          setSelectedNumberOfGames(0); // Reset number of games
          setHasGuesses(false);
        }
      };
      fetchGuesses();
    }
  }, [isOpen, series.id]);

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
          {/* <div className="absolute top-4 left-4 text-lg font-semibold"> points</div> */}
          {/* Edit Button for Admin */}

          {/* {role === "ADMIN" && (
            <button
              type="button"
              className="absolute top-4 right-16 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="size-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                />
              </svg>
              <span className="sr-only">Edit</span>
            </button>
          )} */}
          {/* Title */}
          <Dialog.Title
            as="h3"
            className="text-2xl font-bold flex justify-center mb-4"
          >
            Series bets
          </Dialog.Title>

          {/* Team Logos */}
          <div className="flex justify-center mb-4 space-x-80">
            <img
              src={series.logo1}
              alt={`${series.logo1} logo`}
              className="h-20 object-contain"
            />
            <img
              src={series.logo2}
              alt={`${series.logo2} logo`}
              className="h-20 object-contain"
            />
          </div>

          {/* Dropdown and Team Names with Radio Buttons */}
          <div className="mt-4">
            {/* Dropdown for selecting number of games */}
            <h4 className="text-lg font-semibold mb-2 flex justify-center">
              Choose the number of games
            </h4>
            <div className="flex justify-center mb-4">
              <select
                className="p-2 border w-1/6 text-colors-nba-blue border-colors-nba-blue rounded-lg"
                value={selectedNumberOfGames}
                onChange={handleNumberOfGamesSelection}
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
            <ul className="grid w-full gap-6 md:grid-cols-2">
              {/* Team 1 Selection */}
              <li className="flex items-center space-x-4">
                <input
                  type="radio"
                  id="team1"
                  name="team"
                  value={1}
                  className="hidden peer"
                  onChange={handleTeamSelection}
                  checked={selectedTeam === 1}
                />
                <label
                  htmlFor="team1"
                  className="inline-flex items-center justify-between w-full p-5 text-black bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-colors-nba-blue peer-checked:bg-colors-select-bet peer-checked:text-colors-nba-blue hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                  <div className="block">
                    <div className="w-full text-lg font-semibold">
                      {series.team1}
                    </div>
                    <div className="w-full">Seed #{series.seed1}</div>
                  </div>
                </label>
              </li>

              {/* Team 2 Selection */}
              <li className="flex items-center space-x-4">
                <input
                  type="radio"
                  id="team2"
                  name="team"
                  value={2}
                  className="hidden peer"
                  onChange={handleTeamSelection}
                  checked={selectedTeam === 2}
                />
                <label
                  htmlFor="team2"
                  className="inline-flex items-center justify-between w-full p-5 text-black bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-colors-nba-blue peer-checked:bg-colors-select-bet peer-checked:text-colors-nba-blue hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                  <div className="block">
                    <div className="w-full text-lg font-semibold">
                      {series.team2}
                    </div>
                    <div className="w-full">Seed #{series.seed2}</div>
                  </div>
                </label>
              </li>
            </ul>
          </div>

          {/* Display Bets */}
          {series.playerMatchupBets.length > 0 && (
            <div className="mt-4">
              <h4 className="text-lg font-semibold mb-2">Select the winner</h4>
              <ul className="space-y-4">
                {series.playerMatchupBets.map((bet, index) => (
                  <li key={index} className="flex justify-between">
                    {/* Player 1 Selection */}
                    <div className="flex items-center space-x-2 w-full">
                      <input
                        type="radio"
                        id={`bet-player1-${index}`}
                        name={`bet-${index}`}
                        value={1}
                        className="hidden peer"
                        onChange={() => handlePlayerSelection(index, 1)}
                        checked={selectedPlayerForBet[index] == 1}
                      />
                      <label
                        htmlFor={`bet-player1-${index}`}
                        className="inline-flex items-center justify-between w-full p-3 text-black bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:bg-colors-select-bet peer-checked:border-colors-nba-blue peer-checked:text-colors-nba-blue hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
                      >
                        <div className="w-full text-lg font-semibold">
                          {bet.player1}
                        </div>
                      </label>
                    </div>

                    {/* Player 2 Selection */}
                    <div className="flex items-center space-x-2 w-full">
                      <input
                        type="radio"
                        id={`bet-player2-${index}`}
                        name={`bet-${index}`}
                        value={2}
                        className="hidden peer"
                        onChange={() => handlePlayerSelection(index, 2)}
                        checked={selectedPlayerForBet[index] == 2}
                      />
                      <label
                        htmlFor={`bet-player2-${index}`}
                        className="inline-flex items-center justify-between w-full p-3 text-black bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:bg-colors-select-bet peer-checked:border-colors-nba-blue peer-checked:text-colors-nba-blue hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
                      >
                        <div className="w-full text-lg font-semibold">
                          {bet.player2}
                        </div>
                      </label>
                    </div>
                    <div className="flex items-center space-x-2 w-1/6">
                      <label
                        htmlFor={`bet-label-${index}`}
                        className="inline-flex items-center justify-between w-full p-3 text-black bg-white "
                      >
                        <div className="w-full text-lg font-semibold">
                          {" "}
                          +{bet.differential}
                        </div>
                      </label>
                    </div>
                    <div className="flex items-center space-x-2 w-1/4 pl-4">
                      <label
                        htmlFor={`bet-label-${index}`}
                        className="inline-flex items-center justify-between w-full p-3 text-black bg-white "
                      >
                        <div className="w-full text-lg font-semibold">
                          {bet.categories.join(" ")}
                        </div>
                      </label>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Update Button */}
          <div className="m-4 flex justify-center p-4">
            <SubmitButton
              text={loading ? "Updating.." : "Update"}
              onClick={handleSubmit}
              loading={false}
            />
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default TeamDialog;