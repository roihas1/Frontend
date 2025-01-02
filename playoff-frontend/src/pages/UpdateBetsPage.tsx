import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance"; // Adjust the import to your axios instance
import { useError } from "../components/ErrorProvider";
import { useSuccessMessage } from "../components/successMassageProvider";
import { PlayerMatchupBet, Series } from "./HomePage"; // Make sure this import path is correct
// import { Bet } from '../components/form/TeamDialog';  // Make sure this import path is correct
export enum MatchupCategory {
  POINTS = "Points",
  REBOUNDS = "Rebounds",
  ASSISTS = "Assists",
  THREE_POINT_SHOTS_MADE = "3-Point Shots Made",
  STEALS = "Steals",
  BLOCKS = "Blocks",
  TURNOVERS = "Turnovers",
  FIELD_GOAL_PERCENTAGE = "Field Goal Percentage",
  FREE_THROW_PERCENTAGE = "Free Throw Percentage",
  MINUTES_PLAYED = "Minutes Played",
}
const UpdateBetsPage: React.FC = () => {
  const [seriesList, setSeriesList] = useState<Series[]>([]); // Store series data
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null); // Track selected series
  const [bets, setBets] = useState<PlayerMatchupBet[]>([]); // Store bets associated with selected series
  const [selectedBet, setSelectedBet] = useState<PlayerMatchupBet | null>(null); // Track selected bet details
  const [loading, setLoading] = useState(false);
  const { showError } = useError();
  const { showSuccessMessage } = useSuccessMessage();

  // Fetch all series on initial render
  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const response = await axiosInstance.get("/series"); // Adjust the API endpoint
        setSeriesList(response.data); // Store fetched series in state
      } catch (error) {
        showError("Failed to fetch series.");
      }
    };
    fetchSeries();
  }, []);

  // Fetch bets for the selected series
  useEffect(() => {
    if (selectedSeries) {
      // const fetchBets = async () => {
      //   try {
      //     const response = await axiosInstance.get(`/series/${selectedSeriesId}/bets`);  // Adjust API endpoint
      //     setBets(response.data);  // Store bets for the selected series
      //   } catch (error) {
      //     showError('Failed to fetch bets.');
      //   }
      // };
      // fetchBets();
    }
  }, [selectedSeries]);

  // Handle form field changes for the selected bet
  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (selectedBet) {
      const { name, options } = e.target;
      console.log(name, options);
      const selectedCategories = Array.from(options)
        .filter((option) => option.selected)
        .map((option) => option.value as MatchupCategory); // Get the selected categories
      setSelectedBet({
        ...selectedBet,
        [name]: selectedCategories,
      });
    }
  };

  // Handle bet selection for editing
  const handleBetSelection = (bet: PlayerMatchupBet) => {
    setSelectedBet(bet); // Set selected bet details for editing
  };

  // Handle form submission (either add or update bet)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBet) return;

    setLoading(true);

    try {
      if (selectedBet) {
        // Update existing bet
        // API call logic to update bet
        showSuccessMessage("Bet updated successfully!");
      } else {
        // Add new bet
        // API call logic to add new bet
        showSuccessMessage("New bet created successfully!");
      }
      setSelectedBet(null); // Clear selected bet after submission
    } catch (error) {
      showError("Failed to submit the bet.");
    } finally {
      setLoading(false);
    }
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
          value={selectedSeries}
          onChange={(e) => {
            const series = seriesList.find((s) => s.id === e.target.value); // Find the series object based on the selected ID
            setSelectedSeries(series || null); // Store the entire series object
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

      {/* Bet Update Form */}
      {selectedBet && (
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="block text-lg font-semibold">Categories</label>
            <select
              multiple
              name="category"
              value={selectedBet?.categories[0]} // Bind selected categories
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg mt-2"
            >
              {Object.values(MatchupCategory).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-center mt-4">
            <button
              type="submit"
              className={`px-4 py-2 text-white ${
                loading ? "bg-gray-500" : "bg-blue-600"
              } rounded-lg`}
              disabled={loading}
            >
              {loading
                ? "Submitting..."
                : selectedBet
                ? "Update Bet"
                : "Create Bet"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UpdateBetsPage;
