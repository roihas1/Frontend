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
    [key: string]: number;
  }>({}); // Track selected player for each bet
  const [selectedNumberOfGames, setSelectedNumberOfGames] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const { showError } = useError();
  const { showSuccessMessage } = useSuccessMessage();
  const [hasGuesses, setHasGuesses] = useState<boolean>(false);
  const [guessPercentage, setGuessPercentage] = useState<{
    teamWin: { 1: number; 2: number };
    playerMatchup: { [key: string]: { 1: number; 2: number } };
  }>({ teamWin: { 1: 0, 2: 0 }, playerMatchup: [] });
  const time = series.timeOfStart.split(":");
  series.dateOfStart.setHours(parseInt(time[0]));
  series.dateOfStart.setMinutes(parseInt(time[0]));
  const isStartDatePassed = new Date() > new Date(series.dateOfStart);
  // const { role } = useUser();

  // Handle team selection
  const handleTeamSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedTeam(parseInt(event.target.value));
  };

  // Handle player selection for each bet
  const handlePlayerSelection = (id: string, player: number) => {
    setSelectedPlayerForBet((prevState) => ({
      ...prevState,
      [id]: player,
    }));
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
        await axiosInstance.post(`/series/${series.id}/createGuesses`, {
          teamWinGuess: selectedTeam,
          bestOf7Guess: selectedNumberOfGames,
          playermatchupGuess: selectedPlayerForBet,
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
        setSelectedNumberOfGames(0); // Reset number of games
        setHasGuesses(false);
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
        setSelectedTeam(-1); // Reset selected team
        setSelectedPlayerForBet({}); // Reset selected players for bets
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
          setSelectedNumberOfGames(0); // Reset number of games
          setHasGuesses(false);
        }
      };
      fetchGuesses();
    }
  }, [isOpen, series]);

  useEffect(()=>{
    if(isOpen && series) {
      const fetchGuessPercentage = async ()=>{
        setLoading(true);
        try{
        const response = await axiosInstance.get(`/series/${series.id}/getPercentages`)
        console.log(response)
        setGuessPercentage(response.data)
        }catch(error){
          showError(`Failed to get percentage.`)
        }finally{
          setLoading(false);
        }
      }
      fetchGuessPercentage();
    }

  },[isOpen,series]);

  const HorizontalBar = ({ first, second }) => {
    // Ensure value is between 0 and 100
    const leftWidth = Math.max(0, Math.min(first, 100));
    
    return (
      <div className="flex w-full border-spacing-2 border  border-gray-200 rounded-lg p-0.5 h-8">
        
        <div
          className="flex bg-colors-nba-blue rounded-s-md items-center justify-center truncate"
          style={{ width: `${leftWidth}%` }}
        >
          {first}
        </div>
        
        <div
          className={`flex items-center justify-center truncate ${first + second == 100 ? "rounded-e-md" : ""}`}
          style={{ width: `${second}%` , backgroundColor:'#539dc9'}}
        >
          {second}
        </div>
        {first + second < 100 && (
          <div
          className=" flex items-center rounded-e-md justify-center truncate"
          style={{ width: `${100 - leftWidth-second}%`, backgroundColor:'#c8f7ff' }}

        > {100 - second - first}</div>
        )}
      </div>
    );
  };
  const handleRemoveGuessFromBet = (id: string, idx: number) => {
    if (selectedPlayerForBet[id] === idx) {
      const updatedState = { ...selectedPlayerForBet };

      // Delete the property from the copy
      delete updatedState[id];

      // Update the state with the new object
      setSelectedPlayerForBet(updatedState);
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
                The series has started! <br /> Bets are now closed. <br/>
                Last update: {new Date(series.lastUpdate).toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' })}
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
                  className="inline-flex items-center justify-between w-full p-5 text-black bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-colors-nba-blue peer-checked:bg-colors-select-bet peer-checked:text-colors-nba-blue hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
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
                  className="inline-flex items-center justify-between w-full p-5 text-black bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-colors-nba-blue peer-checked:bg-colors-select-bet peer-checked:text-colors-nba-blue hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
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
              <HorizontalBar first={80} second={20}/>
              </div>
              </li>
            </ul>
          </div>

          {/* Display Bets */}
          {series.playerMatchupBets  && (
            <div className="mt-4">
              <h4 className="text-lg font-semibold mb-2">Select the winner</h4>
              <ul className="space-y-4">
                {series.playerMatchupBets?.map((bet, index) => (
                  <li key={index} className="flex justify-between">
                    <div className="flex items-center space-x-2 w-1/2 pl-4">
                      <label
                        htmlFor={`bet-label-${index}`}
                        className="inline-flex items-center justify-between w-full p-3 text-black bg-white "
                      >
                        <div className="w-full text-lg font-semibold">
                          {bet.categories.join(" & ")}
                        </div>
                      </label>
                    </div>
                    {/* Player 1 Selection */}
                    <div className="flex items-center space-x-2 w-full relative">
                      <input
                        type="radio"
                        id={`bet-player1-${index}`}
                        name={`bet-${index}`}
                        value={1}
                        className="hidden peer"
                        onChange={() => handlePlayerSelection(bet.id, 1)}
                        onClick={() => handleRemoveGuessFromBet(bet.id, 1)}
                        checked={selectedPlayerForBet[bet.id] == 1}
                        disabled={isStartDatePassed}
                      />
                      <label
                        htmlFor={`bet-player1-${index}`}
                        className={`inline-flex items-center justify-between w-full p-3 text-black bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:bg-colors-select-bet peer-checked:border-colors-nba-blue peer-checked:text-colors-nba-blue hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700 ${
                          bet.currentStats[0] >
                          bet.currentStats[1] + bet.differential
                            ? 'after:content-[""] after:w-3 after:h-3 after:bg-green-500 after:rounded-full after:absolute after:right-2 after:top-1/2 after:transform after:translate-y-[-50%]'
                            : ""
                        }`}
                      >
                        <div className="flex justify-between w-1/2">
                          <div className="w-full text-lg font-semibold">
                            {bet.player1}
                          </div>
                          <div className="text-lg font-semibold">
                            { bet.playerGames[0] === 0 ? 0 : parseFloat((bet.currentStats[0] / bet.playerGames[0]).toFixed(2))}
                          </div>
                        </div>
                      </label>
                    </div>

                    {/* Player 2 Selection */}
                    <div className="flex items-center space-x-2 w-full relative">
                      <input
                        type="radio"
                        id={`bet-player2-${index}`}
                        name={`bet-${index}`}
                        value={2}
                        className="hidden peer"
                        onChange={() => handlePlayerSelection(bet.id, 2)}
                        checked={selectedPlayerForBet[bet.id] == 2}
                        onClick={() => handleRemoveGuessFromBet(bet.id, 2)}
                        disabled={isStartDatePassed}
                      />
                      <label
                        htmlFor={`bet-player2-${index}`}
                        className={`flex items-center  w-full p-2 text-black bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:bg-colors-select-bet peer-checked:border-colors-nba-blue peer-checked:text-colors-nba-blue hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700 ${
                          bet.currentStats[0] <
                          bet.currentStats[1] + bet.differential
                            ? 'after:content-[""] after:w-3 after:h-3 after:bg-green-500 after:rounded-full after:absolute after:right-2 after:top-1/2 after:transform after:translate-y-[-50%]'
                            : ""
                        }`}
                      >
                        <div className="flex justify-between w-1/2">
                          <div className="w-full text-lg font-semibold">
                            {bet.player2}
                          </div>
                          <div className="text-lg font-semibold flex items-center">
                            { bet.playerGames[1] === 0 ? 0 : parseFloat((bet.currentStats[1]/bet.playerGames[1]).toFixed(2))}
                            <span className=" ml-1 text-lg font-semibold">
                              (+{bet.differential}) 
                            </span>
                          </div>
                        </div>
                      </label>
                    </div>
                    <div className="flex justify-center items-center space-x-2 w-1/3  relative">
                      {/* <label className={`inline-flex items-center justify-between w-1/2 p-3 text-black bg-white border border-gray-200 rounded-lg  dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:bg-colors-select-bet peer-checked:border-colors-nba-blue peer-checked:text-colors-nba-blue hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700`}>
                          hh
                      </label> */}
                      <div className="inline-flex items-center justify-between w-full ml-2 p-0.5 text-black bg-white  rounded-lg ">
                        {guessPercentage?.playerMatchup[bet.id] === undefined ? "un": "yes"}
                      <HorizontalBar first={80} second={20}/>
                      </div>
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
              disabled={isStartDatePassed}
            />
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default TeamDialog;
