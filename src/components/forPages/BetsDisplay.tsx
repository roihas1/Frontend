import React from "react";
import { HorizontalBar } from "../form/TeamDialog";
import { PlayerMatchupBet, SpontaneousBet } from "../../types";
interface BetsDisplayProps {
  bets: PlayerMatchupBet[] | SpontaneousBet[];
  selectedPlayerForBet: { [key: string]: number };
  handlePlayerSelection: (id: string, player: number) => void;
  handleRemoveGuessFromBet: (id: string, idx: number) => void;
  isStartDatePassed: boolean;
  guessPercentage: {
     [key: string]: { 1: number; 2: number } ;
  };
}

const BetsDisplay: React.FC<BetsDisplayProps> = ({
  bets,
  selectedPlayerForBet,
  handlePlayerSelection,
  handleRemoveGuessFromBet,
  isStartDatePassed,
  guessPercentage,
}) => {
  return (
    <div className="mt-4">
      <h4 className="text-lg font-semibold mb-2">Select the winner</h4>
      <ul className="space-y-4">
        {bets.map((bet, index) => (
          <li key={index} className="flex justify-between">
            <div className="flex items-center space-x-2 w-1/2 pl-4">
              <label
                htmlFor={`bet-label-${index}`}
                className="inline-flex items-center justify-between w-full p-3 text-black bg-white"
              >
                <div className="w-full text-lg font-semibold">
                  {bet.categories.join(" & ")}
                </div>
              </label>
            </div>
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
                className={`relative inline-flex items-center justify-between w-full p-3 text-black bg-white border border-gray-200 rounded-lg ${!isStartDatePassed ?'cursor-pointer': ""} dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:bg-colors-select-bet peer-checked:border-colors-nba-blue peer-checked:text-colors-nba-blue hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700 ${
                    bet.currentStats[0] >
                    bet.currentStats[1] + bet.differential && isStartDatePassed
                      ? ' after:content-[""] after:w-3 after:h-3 after:bg-green-500 after:rounded-full after:absolute after:right-2 after:top-1/2 after:transform after:translate-y-[-50%]'
                      : ""
                  }`}
              >
                <div className="flex justify-between w-1/2">
                  <div className="w-full text-lg font-semibold">
                    {bet.player1}
                  </div>
                  <div className="text-lg font-semibold">
                    {bet.playerGames[0] === 0
                      ? 0
                      : parseFloat(
                          (bet.currentStats[0] / bet.playerGames[0]).toFixed(2)
                        )}
                  </div>
                </div>
              </label>
            </div>
            <div className="flex items-center space-x-2 w-full relative">
              <input
                type="radio"
                id={`bet-player2-${index}`}
                name={`bet-${index}`}
                value={2}
                className="hidden peer"
                onChange={() => handlePlayerSelection(bet.id, 2)}
                onClick={() => handleRemoveGuessFromBet(bet.id, 2)}
                checked={selectedPlayerForBet[bet.id] == 2}
                disabled={isStartDatePassed}
              />
              <label
                htmlFor={`bet-player2-${index}`}
                className={`relative inline-flex items-center justify-between w-full p-3 text-black bg-white border border-gray-200 rounded-lg ${!isStartDatePassed ?'cursor-pointer': ""} dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:bg-colors-select-bet peer-checked:border-colors-nba-blue peer-checked:text-colors-nba-blue hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700 ${
                    bet.currentStats[0] <
                    bet.currentStats[1] + bet.differential && isStartDatePassed
                      ? ' after:content-[""] after:w-3 after:h-3 after:bg-green-500 after:rounded-full after:absolute after:right-2 after:top-1/2 after:transform after:translate-y-[-50%]'
                      : ""
                  }`}
              >
                <div className="flex justify-between w-1/2">
                  <div className="w-full text-lg font-semibold">
                    {bet.player2}
                  </div>
                  <div className="text-lg font-semibold flex items-center">
                    {bet.playerGames[1] === 0
                      ? 0
                      : parseFloat(
                          (bet.currentStats[1] / bet.playerGames[1]).toFixed(2)
                        )}
                    <span className="ml-1 text-lg font-semibold">
                      (+{bet.differential})
                    </span>
                  </div>
                </div>
              </label>
            </div>
            <div className="flex justify-center items-center space-x-2 w-1/3 relative">
              {isStartDatePassed &&
                guessPercentage[bet.id] !== undefined && (
                  <HorizontalBar
                    first={guessPercentage?.[bet.id]["1"]}
                    second={guessPercentage?.[bet.id]["2"]}
                    option1={bet.player1}
                    option2={bet.player2}
                  />
                )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default BetsDisplay;
