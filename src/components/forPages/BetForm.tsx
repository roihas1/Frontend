import React from "react";
import {
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";

import SubmitButton from "../common/SubmitButton";
import { PlayerMatchupBet, SpontaneousBet } from "../../types/index";
import { MatchupCategory, PlayerMatchupType } from "../../types/index";

interface BetFormProps {
  selectedBet: PlayerMatchupBet|SpontaneousBet;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handleCategoriesSelection: (e: SelectChangeEvent<MatchupCategory[]>) => void;
  handleGameNumberSelection: (e: SelectChangeEvent<string>) => void;
  handleCloseEditBet: () => void;
  handleDateAndTimeSelection: (e:React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  isSpontaneous: boolean;
  startDate: string;
  startTime: string;
}

const BetForm: React.FC<BetFormProps> = ({
  selectedBet,
  handleInputChange,
  handleCategoriesSelection,
  handleGameNumberSelection,
  handleCloseEditBet,
  handleSubmit,
  handleDateAndTimeSelection,
  loading,
  isSpontaneous,
  startDate,
  startTime,
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Matchup Type */}
      <div>
        <label className="block text-lg font-semibold">Matchup Type</label>
        <select
          name="typeOfMatchup"
          value={selectedBet?.typeOfMatchup}
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-300 rounded-lg mt-2"
        >
          {Object.values(PlayerMatchupType).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Player 1 */}
      <div>
        <label className="block text-lg font-semibold">Player 1</label>
        <input
          type="text"
          name="player1"
          value={selectedBet?.player1}
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-300 rounded-lg mt-2"
        />
      </div>

      {/* Player 2 */}
      <div>
        <label className="block text-lg font-semibold">Player 2</label>
        <input
          type="text"
          name="player2"
          value={selectedBet.player2}
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-300 rounded-lg mt-2"
        />
      </div>

      {/* Differential */}
      <div>
        <label className="block text-lg font-semibold">
          Differential (On player 2)
        </label>
        <input
          type="number"
          name="differential"
          value={selectedBet.differential}
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-300 rounded-lg mt-2"
          step="any"
        />
      </div>

      {/* Fantasy Points */}
      <div>
        <label className="block text-lg font-semibold">Fantasy Points</label>
        <input
          type="number"
          name="fantasyPoints"
          value={selectedBet.fantasyPoints}
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-300 rounded-lg mt-2"
        />
      </div>

      {/* Categories */}
      <div>
        <FormControl fullWidth>
          <InputLabel id="categories">Categories</InputLabel>
          <Select
            labelId="categories"
            id="categoriesSelection"
            multiple
            value={selectedBet.categories}
            onChange={handleCategoriesSelection}
            sx={{
              backgroundColor: "white",
              borderRadius: "0.5rem",
              "& .MuiOutlinedInput-root": {
                backgroundColor: "white", // Ensure that the dropdown input also has a white background
              },
            }}
          >
            {Object.values(MatchupCategory).map((category) => (
              <MenuItem
                key={category}
                value={category}
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: "#ccffcc",
                    color: "black", // Customize the color of the selected item text
                  },
                  "&.Mui-selected:hover": {
                    backgroundColor: "#ccffcc",
                  },
                }}
              >
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      {isSpontaneous && (
        <div>
          <div>
          <label className="block text-lg font-semibold" > Game Number</label>
            <FormControl fullWidth>
              <InputLabel id="gameNumber">Game Number</InputLabel>
              <Select
                labelId="Game Number"
                id="gameNumber"
                value={
                  "gameNumber" in selectedBet && selectedBet.gameNumber
                    ? selectedBet.gameNumber.toString()
                    : "1"
                }
                onChange={handleGameNumberSelection}
                sx={{
                  backgroundColor: "white",
                  borderRadius: "0.5rem",
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "white", // Ensure that the dropdown input also has a white background
                  },
                }}
              >
                {Array.from([1, 2, 3, 4, 5, 6, 7]).map((num) => (
                  <MenuItem
                    key={num}
                    value={num}
                    sx={{
                      "&.Mui-selected": {
                        backgroundColor: "#ccffcc",
                        color: "black", // Customize the color of the selected item text
                      },
                      "&.Mui-selected:hover": {
                        backgroundColor: "#ccffcc",
                      },
                    }}
                  >
                    {num}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <div className="mt-2">
            <label className="block text-lg font-semibold" > Start Date</label>
            <input
              type="date"
              name="dateOfStart"
              value={startDate}
              onChange={handleDateAndTimeSelection}
              className="w-full p-3 border border-gray-300 rounded-lg mt-2 bg-white"
            />
            <label className="block text-lg font-semibold">Start Time</label>
            <input
              type="time"
              name="startTime"
              value={startTime}
              onChange={ handleDateAndTimeSelection}
              className="w-full p-3 border border-gray-300 rounded-lg mt-2 bg-white"
            />
          </div>
        </div>
      )}

      {/* Submit and Close Buttons */}
      <div className="flex justify-between mt-4">
        <button
          type="button"
          onClick={handleCloseEditBet}
          className="text-colors-nba-red hover:scale-110 transition-transform"
        >
          Close Edit Bet
        </button>
        <SubmitButton
          loading={loading}
          text={loading ? "Updating" : "Update"}
          onClick={handleSubmit}
        />
      </div>
    </form>
  );
};

export default BetForm;
