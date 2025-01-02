import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { useError } from "../components/ErrorProvider";
import { useSuccessMessage } from "../components/successMassageProvider";
import SubmitButton from "../components/form/SubmitButton";
import { Series, PlayerMatchupBet } from "./HomePage";

// Enum for matchup type
export enum PlayerMatchupType {
  UNDEROVER = "UNDER/OVER",
  PLAYERMATCHUP = "PLAYERMATCHUP",
}

// Enum for matchup categories
export enum MatchupCategory {
  ASSISTS = "Assists",
  BLOCKS = "Blocks",
  FIELD_GOAL_PERCENTAGE = "Field Goal Percentage",
  FREE_THROW_PERCENTAGE = "Free Throw Percentage",
  MINUTES_PLAYED = "Minutes Played",
  POINTS = "Points",
  REBOUNDS = "Rebounds",
  STEALS = "Steals",
  THREE_POINT_SHOTS_MADE = "3-Point Shots Made",
  TURNOVERS = "Turnovers",
}

const UpdateBetsPage: React.FC = () => {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [bets, setBets] = useState<PlayerMatchupBet[]>([]);
  const [selectedBet, setSelectedBet] = useState<PlayerMatchupBet | null>(null);
  const [loading, setLoading] = useState(false);
  const { showError } = useError();
  const { showSuccessMessage } = useSuccessMessage();

  // Fetch all series
  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const response = await axiosInstance.get("/series");
        setSeriesList(response.data);
      } catch (error) {
        showError("Failed to fetch series.");
      }
    };
    fetchSeries();
  }, []);

  // Fetch bets for the selected series
  useEffect(() => {
    if (selectedSeries) {
      setBets(selectedSeries.playerMatchupBets);
      setSelectedBet(null);
    }
  }, [selectedSeries]);

  // Handle form field changes for the selected bet
  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (selectedBet) {
      const { name, options, type, value } = e.target;
      console.log(name, options);
      if (name === "categories") {
        const selectedCategories = Array.from(options)
          .filter((option) => option.selected)
          .map((option) => option.value as MatchupCategory); // Get the selected categories

        setSelectedBet({
          ...selectedBet,
          categories: [
            ...new Set([...selectedBet.categories, selectedCategories[0]]),
          ],
        });
      } else if (name === "typeOfMatchup") {
        setSelectedBet({
          ...selectedBet,
          typeOfMatchup: Array.from(options)
            .filter((option) => option.selected)
            .map((option) => option.value as PlayerMatchupType)[0],
        });
      } else {
        console.log(typeof e.target.value);
        setSelectedBet({
          ...selectedBet,
          [name]: type === "number" ? parseInt(value) : value,
        });
      }
    }
  };
  const handleRemoveCategory = (category: MatchupCategory) => {
    if (selectedBet) {
      setSelectedBet({
        ...selectedBet,
        categories: selectedBet.categories.filter((cat) => cat !== category), // Remove category from the array
      });
    }
  };
  // Handle bet selection for editing
  const handleBetSelection = (bet: PlayerMatchupBet) => {
    setSelectedBet(bet);
  };

  // Handle form submission for new or updated bet
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBet) return;

    setLoading(true);
    try {
      if (selectedBet.id) {
        const response = await axiosInstance.patch(
          `/player-matchup-bet/${selectedBet.id}/update`,
          {
            categories: selectedBet.categories,
            fantasyPoints: selectedBet.fantasyPoints,
            player1: selectedBet.player1,
            player2: selectedBet.player2,
            differential: selectedBet.differential,
            typeOfMatchup: selectedBet.typeOfMatchup,
          }
        );
        setBets((prevBets) =>
          prevBets.map((bet) =>
            bet.betId === selectedBet.betId ? { ...bet, ...selectedBet } : bet
          )
        );
        showSuccessMessage("Bet updated successfully!");
      } else{
        const response = await axiosInstance.post("/player-matchup-bet", {
          categories: selectedBet.categories,
          fantasyPoints: selectedBet.fantasyPoints,
          player1: selectedBet.player1,
          player2: selectedBet.player2,
          differential: selectedBet.differential,
          typeOfMatchup: selectedBet.typeOfMatchup,
          seriesId: selectedSeries?.id,
        });
        setBets((prevBets) => [...prevBets, response.data]);
        showSuccessMessage("Bet created successfully!");
      }
    
      setSelectedBet(null); // Clear selected bet after submission
    } catch (error) {
      console.error(error.response ? error.response.data : error.message);
      showError("Failed to submit the bet.");
    } finally {
      setLoading(false);
    }
  };

  // Handle creating a new bet
  const handleCreateNewBet = () => {
    setSelectedBet({
      betId: "", // Temporary value for betId
      seriesId: selectedSeries?.id || "",
      typeOfMatchup: PlayerMatchupType.PLAYERMATCHUP,
      categories: [],
      fantasyPoints: 0,
      player1: "",
      player2: "",
      differential: 0,
    });
  };
  

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Update Bets</h1>

      {/* Select Series */}
      <div className="mb-4">
        <label htmlFor="selectSeries" className="block text-lg font-semibold">
          Select a Series
        </label>
        <select
          id="selectSeries"
          value={selectedSeries?.id || ""}
          onChange={(e) => {
            const series = seriesList.find((s) => s.id === e.target.value);
            setSelectedSeries(series || null);
            setBets(series?.playerMatchupBets || []);
          }}
          className="w-full p-3 border border-gray-300 rounded-lg mt-2"
        >
          <option value="">-- Select Series --</option>
          {seriesList.map((series) => (
            <option key={series.id} value={series.id}>
              {series.team1} vs {series.team2}
            </option>
          ))}
        </select>
      </div>

      {/* Show existing bets for selected series */}
      {selectedSeries && (
        <>
          <h2 className="text-2xl font-semibold mb-4">
            Bets for the selected series
          </h2>
          {bets.map((bet) => (
            <div
              key={bet.differential}
              className="mb-4 p-4 border border-gray-300 rounded-lg"
            >
              <div className="flex justify-between">
                <span>
                  {bet.player1} vs {bet.player2}
                </span>
                <button
                  type="button"
                  onClick={() => handleBetSelection(bet)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  Edit Bet
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Create New Bet */}
      <div className="flex justify-center mt-4">
        <SubmitButton
          loading={loading}
          text="Create New Bet"
          onClick={handleCreateNewBet}
        />
      </div>

      {/* Bet Update Form */}
      {selectedBet && (
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <label className="block text-lg font-semibold">Player 1</label>
            <input
              type="text"
              name="player1"
              value={selectedBet.player1}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg mt-2"
            />
          </div>

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

          <div>
            <label className="block text-lg font-semibold">Differential</label>
            <input
              type="number"
              name="differential"
              value={selectedBet.differential}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg mt-2"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold">
              Fantasy Points
            </label>
            <input
              type="number"
              name="fantasyPoints"
              value={selectedBet.fantasyPoints}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg mt-2"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold">Categories</label>
            <select
              multiple
              name="categories"
              value={selectedBet?.categories}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 h-[150px] rounded-lg mt-2"
            >
              {Object.values(MatchupCategory).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-semibold">Selected Categories:</h3>
            <ul className="list-disc pl-6">
              {selectedBet.categories.map((category) => (
                <li key={category} className="flex justify-between">
                  <span>{category}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(category)}
                    className="text-colors-nba-red hover:text-red-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-center mt-4">
            <SubmitButton
              loading={loading}
              text={loading ? "Updating" : "Update"}
              onClick={handleSubmit}
            />
          </div>
        </form>
      )}
    </div>
  );
};

export default UpdateBetsPage;
