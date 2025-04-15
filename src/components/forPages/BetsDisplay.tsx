import React from "react";
import { HorizontalBar } from "../form/TeamDialog";
import { PlayerMatchupBet, SpontaneousBet } from "../../types";

interface BetsDisplayProps {
  bets: PlayerMatchupBet[] | SpontaneousBet[];
  selectedPlayerForBet: { [key: string]: number };
  handlePlayerSelection: (id: string, player: number) => void;
  handleRemoveGuessFromBet: (id: string, idx: number) => void;
  isStartDatePassed: boolean;
  guessPercentage: { [key: string]: { 1: number; 2: number } };
}

const BetsDisplay: React.FC<BetsDisplayProps> = ({
  bets,
  selectedPlayerForBet,
  handlePlayerSelection,
  handleRemoveGuessFromBet,
  isStartDatePassed,
  guessPercentage,
}) => {
  const isPlayerLeading = (
    games1: number,
    stats1: number,
    games2: number,
    stats2: number,
    differential: number
  ): 1 | 2 | null => {
    const avg1 = games1 === 0 ? 0 : stats1 / games1;
    const avg2 = games2 === 0 ? 0 : stats2 / games2;
    const adjustedAvg2 = avg2 + differential;

    if (avg1 > adjustedAvg2) return 1;
    if (avg1 < adjustedAvg2) return 2;
    return null;
  };

  return (
    <div className="mt-4">
      <h4 className="text-lg font-semibold mb-2 text-center">
        Select the winner
      </h4>

      <ul className="space-y-4">
        {bets.map((bet, index) => (
          <li
            key={index}
            className="flex flex-col sm:flex-row items-center bg-white p-3 rounded-lg shadow-md border border-gray-200"
          >
            {/* Bet Category - Now Centered */}
            <div className="w-full sm:w-1/3 text-center font-semibold text-gray-800 text-sm sm:text-base">
              {bet.categories.join(" & ")}
            </div>

            <div className="flex flex-col sm:flex-row w-full sm:w-2/3 justify-between gap-2 mt-2 sm:mt-0">
              {/* Player 1 Selection */}
              <div className="relative w-full">
                <input
                  type="radio"
                  id={`bet-player1-${index}`}
                  name={`bet-${index}`}
                  value={1}
                  className="hidden peer"
                  onChange={() => handlePlayerSelection(bet.id, 1)}
                  onClick={() => handleRemoveGuessFromBet(bet.id, 1)}
                  checked={selectedPlayerForBet[bet.id] === 1}
                  disabled={isStartDatePassed}
                />
                <label
                  htmlFor={`bet-player1-${index}`}
                  className={`block p-3 border rounded-lg text-center transition-all duration-300 w-full sm:w-full
                    peer-checked:bg-colors-selected-bet peer-checked:border-colors-nba-blue hover:cursor-pointer
                    ${
                      selectedPlayerForBet[bet.id] === 1
                        ? "bg-colors-select-bet border-colors-nba-blue text-gray-900"
                        : "border-gray-300 bg-gray-100 text-gray-900"
                    } hover:bg-gray-200 relative`}
                >
                  <p className="font-semibold">{bet.player1}</p>
                  <p className="text-sm">
                    {bet.playerGames[0] === 0
                      ? 0
                      : (bet.currentStats[0] / bet.playerGames[0]).toFixed(2)}
                  </p>

                  {/* Green Dot if Player 1 is Leading */}
                  {isStartDatePassed &&
                    isPlayerLeading(
                      bet.playerGames?.[0] ?? 0,
                      bet.currentStats?.[0] ?? 0,
                      bet.playerGames?.[1] ?? 0,
                      bet.currentStats?.[1] ?? 0,
                      bet.differential ?? 0
                    ) === 1 && (
                      <span className="absolute top-1/2 right-2 transform -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full" />
                    )}
                </label>
              </div>

              {/* Player 2 Selection */}
              <div className="relative w-full">
                <input
                  type="radio"
                  id={`bet-player2-${index}`}
                  name={`bet-${index}`}
                  value={2}
                  className="hidden peer"
                  onChange={() => handlePlayerSelection(bet.id, 2)}
                  onClick={() => handleRemoveGuessFromBet(bet.id, 2)}
                  checked={selectedPlayerForBet[bet.id] === 2}
                  disabled={isStartDatePassed}
                />
                <label
                  htmlFor={`bet-player2-${index}`}
                  className={`block p-3 border rounded-lg text-center transition-all duration-300 w-full sm:w-full
                    peer-checked:bg-colors-selected-bet peer-checked:border-colors-nba-blue hover:cursor-pointer
                    ${
                      selectedPlayerForBet[bet.id] === 2
                        ? "bg-colors-select-bet border-colors-nba-blue text-gray-900"
                        : "border-gray-300 bg-gray-100 text-gray-900"
                    } hover:bg-gray-200 relative`}
                >
                  <p className="font-semibold">{bet.player2}</p>
                  <p className="text-sm">
                    {bet.playerGames[1] === 0
                      ? 0
                      : (bet.currentStats[1] / bet.playerGames[1]).toFixed(2)}
                    <span className="ml-1 text-base font-semibold">(+{bet.differential})</span>
                  </p>

                  {/* Green Dot if Player 2 is Leading */}
                  {isStartDatePassed &&
                    isPlayerLeading(
                      bet.playerGames?.[0] ?? 0,
                      bet.currentStats?.[0] ?? 0,
                      bet.playerGames?.[1] ?? 0,
                      bet.currentStats?.[1] ?? 0,
                      bet.differential ?? 0
                    ) === 2 && (
                      <span className="absolute top-1/2 right-2 transform -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full" />
                    )}
                </label>
              </div>
            </div>

            {/* Guess Percentage Bar - Now Centered in Desktop */}
            {isStartDatePassed && guessPercentage[bet.id] && (
              <div className="w-full sm:w-1/5 flex justify-center mt-2 sm:mt-0 sm:flex sm:justify-center">
                <HorizontalBar
                  first={guessPercentage[bet.id]["1"]}
                  second={guessPercentage[bet.id]["2"]}
                  option1={bet.player1}
                  option2={bet.player2}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BetsDisplay;
