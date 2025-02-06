import React from "react";
import {
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";

import SubmitButton from "../common/SubmitButton";
import { PlayerMatchupBet } from '../../types/index';
import { MatchupCategory, PlayerMatchupType } from "../../types/index";

interface BetFormProps {
  selectedBet: PlayerMatchupBet;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handleCategoriesSelection: (e: SelectChangeEvent<MatchupCategory[]>) => void;
  handleCloseEditBet: () => void;
  handleSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

const BetForm: React.FC<BetFormProps> = ({
  selectedBet,
  handleInputChange,
  handleCategoriesSelection,
  handleCloseEditBet,
  handleSubmit,
  loading,
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
