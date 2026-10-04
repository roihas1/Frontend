import React from "react";
import { PlayerMatchupBet, SpontaneousBet } from "../../../types";
import {
  getBetOptionLabel,
  isPlayerLeading,
} from "../../forPages/betDisplayHelpers";
import MobileGuessSplit from "./MobileGuessSplit";

interface MobileBetCardProps {
  bet: PlayerMatchupBet | SpontaneousBet;
  selectedPlayer?: number;
  isLocked: boolean;
  isBusy?: boolean;
  onSelect: (player: number) => void;
  onClear: (player: number) => void;
  guessPercentage?: { 1: number; 2: number };
}

const formatAverage = (
  stats: number[] | undefined,
  games: number[] | undefined,
  index: 0 | 1
) => {
  const played = games?.[index] ?? 0;
  if (played === 0) return "0";
  return ((stats?.[index] ?? 0) / played).toFixed(2);
};

const CheckIcon: React.FC = () => (
  <svg
    viewBox="0 0 20 20"
    className="h-4 w-4 shrink-0 text-colors-nba-blue"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.2 7.2a1 1 0 0 1-1.4 0L3.3 9.1a1 1 0 1 1 1.4-1.4l4.1 4.1 6.5-6.5a1 1 0 0 1 1.4 0Z"
      clipRule="evenodd"
    />
  </svg>
);

const MobileBetCard: React.FC<MobileBetCardProps> = ({
  bet,
  selectedPlayer,
  isLocked,
  isBusy = false,
  onSelect,
  onClear,
  guessPercentage,
}) => {
  const isDisabled = isLocked || isBusy;
  const leading = isPlayerLeading(
    bet.playerGames?.[0] ?? 0,
    bet.currentStats?.[0] ?? 0,
    bet.playerGames?.[1] ?? 0,
    bet.currentStats?.[1] ?? 0,
    bet.differential ?? 0,
    bet.typeOfMatchup
  );

  const handlePick = (player: 1 | 2) => {
    if (isDisabled) return;
    if (selectedPlayer === player) {
      onClear(player);
      return;
    }
    onSelect(player);
  };

  const option = (player: 1 | 2) => {
    const selected = selectedPlayer === player;
    const name = player === 1 ? bet.player1 : bet.player2;
    const label = getBetOptionLabel(
      name,
      bet.typeOfMatchup,
      player,
      bet.differential
    );
    const statIndex = player === 1 ? 0 : 1;

    return (
      <button
        type="button"
        aria-pressed={selected}
        disabled={isDisabled}
        onClick={() => handlePick(player)}
        className={`flex min-h-[4.5rem] min-w-0 flex-col items-center justify-center rounded-xl border px-2 py-2.5 text-center ${
          selected
            ? "border-colors-nba-blue bg-colors-select-bet text-gray-900"
            : "border-gray-300 bg-gray-50 text-gray-900"
        } ${isDisabled ? "cursor-not-allowed opacity-60" : "active:scale-[0.98]"}`}
      >
        <span className="flex max-w-full items-start justify-center gap-1">
          {selected && <CheckIcon />}
          <span className="line-clamp-3 text-sm font-semibold leading-snug">
            {label}
          </span>
        </span>
        <span className="mt-1 text-xs text-gray-600">
          {formatAverage(bet.currentStats, bet.playerGames, statIndex)}
          {player === 2 && bet.typeOfMatchup === "PLAYERMATCHUP" && (
            <span className="ml-1 font-semibold">(+{bet.differential})</span>
          )}
        </span>
        {isLocked && leading === player && (
          <span className="mt-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">
            Leading
          </span>
        )}
      </button>
    );
  };

  return (
    <li className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
      <p className="mb-2 text-center text-sm font-semibold text-gray-800">
        {bet.categories.join(" & ")}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {option(1)}
        {option(2)}
      </div>
      {isLocked && guessPercentage && (
        <div className="mt-2">
          <MobileGuessSplit
            first={guessPercentage[1] ?? 0}
            second={guessPercentage[2] ?? 0}
            option1={getBetOptionLabel(
              bet.player1,
              bet.typeOfMatchup,
              1,
              bet.differential
            )}
            option2={getBetOptionLabel(
              bet.player2,
              bet.typeOfMatchup,
              2,
              bet.differential
            )}
          />
        </div>
      )}
    </li>
  );
};

export default MobileBetCard;
