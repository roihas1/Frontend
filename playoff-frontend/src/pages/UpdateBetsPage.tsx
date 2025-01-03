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
  const [isInEdit, setIsInEdit] = useState<boolean>(false);
  const [showCreateSeriesForm, setShowCreateSeriesForm] =
    useState<boolean>(false);
  const [newSeries, setNewSeries] = useState<Series>({
    team1: "", // Default empty string for team1
    team2: "", // Default empty string for team2
    seed1: 0, // Default seed for team1
    seed2: 0, // Default seed for team2
    conference: "West", // Default conference
    round: "First Round", // Default round
    dateOfStart: new Date(), // Default to current date
  });

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
  const handleCloseEditBet = () => {
    setIsInEdit(false);
    setSelectedBet(null); // Reset the selected bet when closing
  };

  // Handle form field changes for the selected bet
  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (selectedBet) {
      const { name, options, type, value } = e.target;
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
    setIsInEdit(true);
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
            bet.id === selectedBet.id ? { ...bet, ...selectedBet } : bet
          )
        );
        showSuccessMessage("Bet updated successfully!");
      } else {
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
      setIsInEdit(false);
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
  const handleDeleteBet = async (bet: PlayerMatchupBet) => {
    if (window.confirm("Are you sure you want to delete this bet?")) {
      try {
        await axiosInstance.delete(`/player-matchup-bet/${bet.id}/delete`);
        setBets(bets.filter((b) => b.id !== bet.id));
        showSuccessMessage("Bet deleted successfully!");
      } catch (error) {
        showError("Failed to delete the bet.");
      }
    }
  };
  const handleSubmitNewSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedDate = new Date(newSeries.dateOfStart)
      .toISOString()
      .split("T")[0];

    try {
      const response = await axiosInstance.post("/series", {
        team1: newSeries.team1,
        team2: newSeries.team2,
        seed1: newSeries.seed1,
        seed2: newSeries.seed2,
        round: newSeries.round,
        conference: newSeries.conference,
        dateOfStart: formattedDate,
      });
      setSeriesList((prevState) => [...prevState, response.data]); // Update the series list
      showSuccessMessage("New series created successfully!");
      setShowCreateSeriesForm(false); // Close the form
    } catch (error) {
      showError("Failed to create the new series." + error);
      console.log(error.stack);
    }
  };
  const handleInputNewSeriesChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    // If the field is 'dateOfStart', convert the value to a Date object
    if (name === "dateOfStart") {
      const newDate = new Date(value);
      setNewSeries((prevState) => ({
        ...prevState,
        [name]: newDate, // Store the Date object
      }));
    } else {
      // For other fields, just update the state with the value directly
      setNewSeries((prevState) => ({
        ...prevState,
        [name]: type === "number" ? parseInt(value) : value,
      }));
    }
  };
  const handleCloseSeriesCreation = () => {
    setShowCreateSeriesForm(false);
  };
  const handleDeleteSeries = async () => {
    if (selectedSeries) {
      const confirmed = window.confirm(`Are you sure you want to delete the series: ${selectedSeries.team1} vs ${selectedSeries.team2}?`);
      if (confirmed) {
        try {
          await axiosInstance.delete(`/series/${selectedSeries.id}`);
          setSeriesList((prevState) => prevState.filter(series => series.id !== selectedSeries.id)); // Remove the deleted series from the list
          setSelectedSeries(null); // Clear the selected series
          showSuccessMessage("Series deleted successfully!");
        } catch (error) {
          showError("Failed to delete the series.");
          console.error(error);
        }
      }
    }
  };


  return (
    <div className="p-4 max-w-screen-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Update Bets</h1>
      {/* Button to show the create series form */}
      {!showCreateSeriesForm && <div className="flex justify-center mb-6">
        <SubmitButton
          loading={loading}
          text="Create New Series"
          onClick={() => setShowCreateSeriesForm(true)}
          disabled={isInEdit === true}
        />
      </div>
}

      {/* Create New Series Form */}
      {showCreateSeriesForm && (
        <form onSubmit={handleSubmitNewSeries} className="space-y-4 mb-6">
          <div>
            <label className="block text-lg font-semibold">Team 1</label>
            <input
              type="text"
              name="team1"
              value={newSeries.team1}
              onChange={handleInputNewSeriesChange}
              className="w-full p-3 border border-gray-300 rounded-lg mt-2"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold">Team 2</label>
            <input
              type="text"
              name="team2"
              value={newSeries.team2}
              onChange={handleInputNewSeriesChange}
              className="w-full p-3 border border-gray-300 rounded-lg mt-2"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold">Seed 1</label>
            <input
              type="number"
              name="seed1"
              value={newSeries.seed1}
              onChange={handleInputNewSeriesChange}
              className="w-full p-3 border border-gray-300 rounded-lg mt-2"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold">Seed 2</label>
            <input
              type="number"
              name="seed2"
              value={newSeries.seed2}
              onChange={handleInputNewSeriesChange}
              className="w-full p-3 border border-gray-300 rounded-lg mt-2"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold">Conference</label>
            <select
              name="conference"
              value={newSeries.conference}
              onChange={handleInputNewSeriesChange}
              className="w-full p-3 border border-gray-300 rounded-lg mt-2"
            >
              <option value="West">West</option>
              <option value="East">East</option>
            </select>
          </div>

          <div>
            <label className="block text-lg font-semibold">Round</label>
            <select
              name="round"
              value={newSeries.round}
              onChange={handleInputNewSeriesChange}
              className="w-full p-3 border border-gray-300 rounded-lg mt-2"
            >
              <option value="First Round">First Round</option>
              <option value="Conference Semifinals">
                Conference Semifinals
              </option>
              <option value="Conference Finals">Conference Finals</option>
              <option value="Finals">Finals</option>
            </select>
          </div>

          <div>
            <label className="block text-lg font-semibold">Date of Start</label>
            <input
              type="date"
              name="dateOfStart"
              value={
                newSeries.dateOfStart
                  ? newSeries.dateOfStart.toISOString().split("T")[0]
                  : ""
              }
              onChange={handleInputNewSeriesChange}
              className="w-full p-3 border border-gray-300 rounded-lg mt-2"
            />
          </div>

          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={handleCloseSeriesCreation}
              className="text-colors-nba-red hover:scale-110 transition-transform"
            >
              Close Edit Series
            </button>
            <SubmitButton
              text="Create Series"
              loading={loading}
              onClick={handleSubmitNewSeries}
            />
          </div>
        </form>
      )}
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
      {selectedSeries && (
        <div className="flex justify-center mt-4">
          <button
            onClick={handleDeleteSeries}
            className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-700"
          >
            Delete Series
          </button>
        </div>
      )}

      {/* Show existing bets for selected series */}
      {selectedSeries && (
        <>
          <h2 className="text-2xl font-semibold mb-4">
            Bets for the selected series
          </h2>
          {bets.map((bet) => (
            <div
              key={bet.differential}
              className="mb-4 p-4 border border-gray-300 rounded-lg w-full max-w-full mx-auto"
            >
              <div className="flex  justify-between">
                <span>
                  {bet.player1} vs {bet.player2}
                </span>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handleBetSelection(bet)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Edit Bet
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteBet(bet)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete Bet
                  </button>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Create New Bet */}
      {!showCreateSeriesForm && selectedSeries && !isInEdit && (
        <div className="flex justify-center mt-4">
          <SubmitButton
            loading={loading}
            text="Create New Bet"
            onClick={handleCreateNewBet}
            disabled={bets.length >= 6}
          />
        </div>
      )}

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
                    className="text-colors-nba-red hover:scale-125 transition-transform"
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
      )}
    </div>
  );
};

export default UpdateBetsPage;
