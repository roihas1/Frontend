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
export const nbaTeamsList = [
  "Atlanta Hawks",
  "Boston Celtics",
  "Brooklyn Nets",
  "Charlotte Hornets",
  "Chicago Bulls",
  "Cleveland Cavaliers",
  "Dallas Mavericks",
  "Denver Nuggets",
  "Detroit Pistons",
  "Golden State Warriors",
  "Houston Rockets",
  "Indiana Pacers",
  "Los Angeles Clippers",
  "Los Angeles Lakers",
  "Memphis Grizzlies",
  "Miami Heat",
  "Milwaukee Bucks",
  "Minnesota Timberwolves",
  "New Orleans Pelicans",
  "New York Knicks",
  "Oklahoma City Thunder",
  "Orlando Magic",
  "Phoenix Suns",
  "Philadelphia 76ers",
  "Portland Trail Blazers",
  "Sacramento Kings",
  "San Antonio Spurs",
  "Toronto Raptors",
  "Utah Jazz",
  "Washington Wizards",
];
const UpdateBetsPage: React.FC = () => {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [bets, setBets] = useState<PlayerMatchupBet[]>([]);
  const [selectedBet, setSelectedBet] = useState<PlayerMatchupBet>({
    betId: "", // Temporary value for betId
    seriesId: selectedSeries?.id || "",
    typeOfMatchup: PlayerMatchupType.PLAYERMATCHUP,
    categories: [],
    fantasyPoints: 2,
    player1: "",
    player2: "",
    differential: 0,
    result: 0,
    currentStats: [0, 0],
  });
  const [player1Stat, setPlayer1Stat] = useState<number>(0);
  const [player2Stat, setPlayer2Stat] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [isInEdit, setIsInEdit] = useState<boolean>(false);
  const [showCreateSeriesForm, setShowCreateSeriesForm] =
    useState<boolean>(false);
  const [teamsList, setTeamList] = useState<{ name: string; seed: number }[]>(
    []
  );
  const [createNewBet, setCreateNewBet] = useState<boolean>(false);
  const [updateResultSelected, setUpdateResultSelected] =
    useState<boolean>(false);

  const [newSeries, setNewSeries] = useState<Series>({
    team1: "", // Default empty string for team1
    team2: "", // Default empty string for team2
    seed1: 0, // Default seed for team1
    seed2: 0, // Default seed for team2
    conference: "West", // Default conference
    round: "First Round", // Default round
    dateOfStart: new Date(), // Default to current date
    winnerTeam: 0,
    numOfGames: 0,
  });
  const [showSeriesResultForm, setshowSeriesResultForm] =
    useState<boolean>(false);
  const [numberOfgames, setNumberOfGames] = useState<number>(0);
  const [wonTeam, setWonTeam] = useState<string>("");

  const { showError } = useError();
  const { showSuccessMessage } = useSuccessMessage();

  // Fetch all series
  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const response = await axiosInstance.get("/series");
        setSeriesList(response.data);
        console.log(response.data);
      } catch (error) {
        showError("Failed to fetch series.");
        console.log(error);
      }
    };
    fetchSeries();
  }, []);

  // Fetch bets for the selected series
  useEffect(() => {
    if (selectedSeries) {
      setBets(selectedSeries.playerMatchupBets);
      setSelectedBet({
        betId: "", // Temporary value for betId
        seriesId: selectedSeries?.id || "",
        typeOfMatchup: PlayerMatchupType.PLAYERMATCHUP,
        categories: [],
        fantasyPoints: 2,
        player1: "",
        player2: "",
        differential: 0,
        result: 0,
        currentStats: [0, 0],
      });
    }
  }, [selectedSeries]);
  const handleCloseEditBet = () => {
    setIsInEdit(false);
    setSelectedBet({
      betId: "", // Temporary value for betId
      seriesId: selectedSeries?.id || "",
      typeOfMatchup: PlayerMatchupType.PLAYERMATCHUP,
      categories: [],
      fantasyPoints: 2,
      player1: "",
      player2: "",
      differential: 0,
      result: 0,
      currentStats: [0, 0],
    }); // Reset the selected bet when closing
    setCreateNewBet(false);
  };

  const handleCloseUpdateResult = () => {
    setUpdateResultSelected(false);
    setSelectedBet({
      betId: "", // Temporary value for betId
      seriesId: selectedSeries?.id || "",
      typeOfMatchup: PlayerMatchupType.PLAYERMATCHUP,
      categories: [],
      fantasyPoints: 2,
      player1: "",
      player2: "",
      differential: 0,
      result: 0,
      currentStats: [0, 0],
    });
  };

  // Handle form field changes for the selected bet
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (selectedBet) {
      const { name, options, type, value } = e.target;
      if (name === "categories" && e.target instanceof HTMLSelectElement) {
        const selectedCategories = Array.from(options)
          .filter((option) => option.selected)
          .map((option) => option.value as MatchupCategory); // Get the selected categories

        setSelectedBet({
          ...selectedBet,
          categories: [
            ...new Set([...selectedBet.categories, selectedCategories[0]]),
          ],
        });
      } else if (
        name === "typeOfMatchup" &&
        e.target instanceof HTMLSelectElement
      ) {
        setSelectedBet({
          ...selectedBet,
          typeOfMatchup: Array.from(options)
            .filter((option) => option.selected)
            .map((option) => option.value as PlayerMatchupType)[0],
        });
      } else if (name === "currentStats0") {
        setPlayer1Stat(parseInt(value));
      } else if (name === "currentStats1") {
        setPlayer2Stat(parseInt(value));
      } else {
        console.log(type, name, typeof value);

        setSelectedBet({
          ...selectedBet,
          [name]: type === "text" ? value : parseInt(value),
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
    setCreateNewBet(true);
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

      setSelectedBet({
        betId: "", // Temporary value for betId
        seriesId: selectedSeries?.id || "",
        typeOfMatchup: PlayerMatchupType.PLAYERMATCHUP,
        categories: [],
        fantasyPoints: 2,
        player1: "",
        player2: "",
        differential: 0,
        result: 0,
        currentStats: [0, 0],
      }); // Clear selected bet after submission
    } catch (error) {
      console.error(error.response ? error.response.data : error.message);
      showError("Failed to submit the bet.");
    } finally {
      setLoading(false);
      setIsInEdit(false);
    }
  };
  const handleCloseAllBets = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (
      window.confirm(
        `Are you sure you want to close this series bets? (${selectedSeries?.team1} vs ${selectedSeries?.team2})`
      )
    ) {
      try {
        await axiosInstance.patch(`/series/${selectedSeries.id}/closeBets`);
        showSuccessMessage("Bets closed successfully!");
        setSelectedSeries(null);
      } catch (error) {
        console.error(error.response ? error.response.data : error.message);
        showError("Failed to close all bets.");
      } finally {
        setLoading(false);
      }
    }
    else{setLoading(false);}
  };

  // Handle creating a new bet
  const handleCreateNewBet = () => {
    setSelectedBet({
      betId: "", // Temporary value for betId
      seriesId: selectedSeries?.id || "",
      typeOfMatchup: PlayerMatchupType.PLAYERMATCHUP,
      categories: [],
      fantasyPoints: 2,
      player1: "",
      player2: "",
      differential: 0,
      result: 0,
      currentStats: [0, 0],
    });
    setCreateNewBet(true);
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
    console.log(newSeries);
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
      setNewSeries({
        team1: "", // Default empty string for team1
        team2: "", // Default empty string for team2
        seed1: 0, // Default seed for team1
        seed2: 0, // Default seed for team2
        conference: "West", // Default conference
        round: "First Round", // Default round
        dateOfStart: new Date(), // Default to current date
        winnerTeam: 0,
        numOfGames: 0,
      });
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
    } else if (name === "team1" || name === "team2") {
      const selectedTeam = teamsList?.find((team) => team.name === value);
      console.log(selectedTeam);
      if (selectedTeam) {
        setNewSeries((prevState) => ({
          ...prevState,
          [name]: selectedTeam.name,
          [`seed${name === "team1" ? "1" : "2"}`]: selectedTeam.seed,
        }));
      }
      setNewSeries((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    } else {
      // For other fields, just update the state with the value directly
      console.log(name, value, type);
      setNewSeries((prevState) => ({
        ...prevState,
        [name]:
          type === "select-one" && name.includes("seed")
            ? parseInt(value)
            : value,
      }));
    }
  };
  const handleCloseSeriesCreation = () => {
    setShowCreateSeriesForm(false);
  };
  const handleDeleteSeries = async () => {
    if (selectedSeries) {
      const confirmed = window.confirm(
        `Are you sure you want to delete the series: ${selectedSeries.team1} vs ${selectedSeries.team2}?`
      );
      if (confirmed) {
        try {
          await axiosInstance.delete(`/series/${selectedSeries.id}`);
          setSeriesList((prevState) =>
            prevState.filter((series) => series.id !== selectedSeries.id)
          ); // Remove the deleted series from the list
          setSelectedSeries(null); // Clear the selected series
          showSuccessMessage("Series deleted successfully!");
        } catch (error) {
          showError("Failed to delete the series.");
          console.error(error);
        }
      }
    }
  };
  const handleBetSelectionForUpdateResult = (bet: PlayerMatchupBet) => {
    console.log(bet.currentStats);
    setUpdateResultSelected(true);
    setSelectedBet(bet);
  };

  const handleUpdateResult = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(selectedBet?.result);
    console.log(typeof selectedBet?.result);
    if (!selectedBet) {
      console.error("No selected bet to update.");
      return;
    }
    try {
      await axiosInstance.patch(
        `/player-matchup-bet/${selectedBet?.id}/result`,
        {
          result: selectedBet?.result,
        }
      );
      setUpdateResultSelected(false);
      setSelectedBet({
        betId: "", // Temporary value for betId
        seriesId: selectedSeries?.id || "",
        typeOfMatchup: PlayerMatchupType.PLAYERMATCHUP,
        categories: [],
        fantasyPoints: 2,
        player1: "",
        player2: "",
        differential: 0,
        result: 0,
        currentStats: [0, 0],
      });
      showSuccessMessage("Matchup Result updated successfully!");
      setSelectedSeries((prev) => prev);
    } catch (error) {
      showError("Failed to update match result.");
    }
  };

  const handleUpdateCurrentStats = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const updateStats = [...selectedBet.currentStats];
    console.log(selectedBet.currentStats)
    updateStats[0] += player1Stat;
    updateStats[1] += player2Stat;
    console.log(updateStats)
    try {
      await axiosInstance.patch(
        `/player-matchup-bet/${selectedBet?.id}/update`,
        {
          currentStats: updateStats,
        }
      );
      setUpdateResultSelected(false);
      setPlayer1Stat(0);
      setPlayer2Stat(0);
      setBets((prevBets) =>
        prevBets.map((bet) =>
          bet.betId === selectedBet.betId
            ? { ...bet, currentStats: updateStats } // Update the selected bet's currentStats
            : bet // Keep other bets unchanged
        )
      );
      setSelectedBet({
        betId: "", // Temporary value for betId
        seriesId: selectedSeries?.id || "",
        typeOfMatchup: PlayerMatchupType.PLAYERMATCHUP,
        categories: [],
        fantasyPoints: 2,
        player1: "",
        player2: "",
        differential: 0,
        result: 0,
        currentStats: [0, 0],
      });
      showSuccessMessage("Matchup Result updated successfully!");
      setSelectedSeries((prev) => prev);
      console.log(bets)
    } catch (error) {
      showError("Failed to update match result.");
    }
    setLoading(false)
  };
  const handleUpdateSeriesResult = () => {
    setshowSeriesResultForm(true);
  };
  const handleCloseUpdateResultSeries = () => {
    setshowSeriesResultForm(false);
  };
  const handleSubmitSeriesResult = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!wonTeam) {
      showError("Please provide valid series result.");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.patch(`/series/${selectedSeries?.id}/updateGame`, {
        teamWon: parseInt(wonTeam),
      });
      showSuccessMessage("Series result updated successfully!");
      setshowSeriesResultForm(false); // Close the form
    } catch (error) {
      showError("Failed to update series result.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const handleCreateNewSeries = () => {
    const teamList: { name: string; seed: number }[] = [];
    if (seriesList.length > 7) {
      seriesList.forEach((series) => {
        if (!teamList.some((team) => team.name === series.team1)) {
          teamList.push({ name: series.team1, seed: series.seed1 });
        }

        // Check if team2 is already in the list
        if (!teamList.some((team) => team.name === series.team2)) {
          teamList.push({ name: series.team2, seed: series.seed2 });
        }
      });
      setTeamList(teamList);
    }

    setShowCreateSeriesForm(true);
  };
  return (
    <div className="flex flex-col min-h-screen">
      <div className="p-4 max-w-screen-xl mx-auto flex-1">
        <h1 className="text-3xl font-bold mb-6">Update Bets</h1>
        {/* Button to show the create series form */}
        {!showCreateSeriesForm && (
          <div className="flex justify-center mb-6">
            <SubmitButton
              loading={loading}
              text="Create New Series"
              onClick={handleCreateNewSeries}
              disabled={isInEdit === true}
            />
          </div>
        )}

        {/* Create New Series Form */}
        {showCreateSeriesForm && teamsList?.length > 15 && (
          <form onSubmit={handleCreateNewSeries} className="space-y-4 mb-6">
            <div>
              <label className="block text-lg font-semibold">Team 1</label>
              <select
                name="team1"
                value={newSeries.team1}
                onChange={handleInputNewSeriesChange}
                className="w-full p-3 border border-gray-300 rounded-lg mt-2"
                required
              >
                <option value="">-- Select First Team --</option>
                {teamsList?.map((team) => (
                  <option key={team.name} value={team.name}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-lg font-semibold">Team 2</label>
              <select
                name="team2"
                value={newSeries.team2}
                onChange={handleInputNewSeriesChange}
                className="w-full p-3 border border-gray-300 rounded-lg mt-2"
              >
                <option value="">-- Select Second Team --</option>
                {teamsList?.map((team) => (
                  <option key={team.name} value={team.name}>
                    {team.name}
                  </option>
                ))}
              </select>
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
                <option value="Finals">Finals</option>
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
                <option value="NBA Finals">NBA Finals</option>
              </select>
            </div>

            <div>
              <label className="block text-lg font-semibold">
                Date of Start
              </label>
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
        {showCreateSeriesForm && teamsList.length < 15 && (
          <form onSubmit={handleSubmitNewSeries} className="space-y-4 mb-6">
            <div>
              <label className="block text-lg font-semibold">Team 1</label>
              <select
                name="team1"
                value={newSeries.team1}
                onChange={handleInputNewSeriesChange}
                className="w-full p-3 border border-gray-300 rounded-lg mt-2"
                
              >
                <option value="">-- Select Second Team --</option>
                {nbaTeamsList?.map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-lg font-semibold">Team 2</label>
              <select
                name="team2"
                value={newSeries.team2}
                onChange={handleInputNewSeriesChange}
                className="w-full p-3 border border-gray-300 rounded-lg mt-2"
              >
                <option value="">-- Select Second Team --</option>
                {nbaTeamsList?.map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-lg font-semibold">Seed 1</label>

              <select
                name="seed1"
                value={newSeries.seed1}
                onChange={handleInputNewSeriesChange}
                className="w-full p-3 border border-gray-300 rounded-lg mt-2"
              >
                <option value="">-- Select First Team Seed --</option>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
                <option value={6}>6</option>
                <option value={7}>7</option>
                <option value={8}>8</option>
              </select>
            </div>

            <div>
              <label className="block text-lg font-semibold">Seed 2</label>
              <select
                name="seed2"
                value={newSeries.seed2}
                onChange={handleInputNewSeriesChange}
                className="w-full p-3 border border-gray-300 rounded-lg mt-2"
              >
                <option value="">-- Select Second Team Seed --</option>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
                <option value={6}>6</option>
                <option value={7}>7</option>
                <option value={8}>8</option>
              </select>
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
              <label className="block text-lg font-semibold">
                Date of Start
              </label>
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
                {series.team1} vs {series.team2} ({series.round})
              </option>
            ))}
          </select>
        </div>
        {selectedSeries && (
          <div className="flex justify-center mt-4 space-x-4">
            <button
              onClick={handleUpdateSeriesResult}
              className="bg-colors-nba-blue text-white p-2 mb-4 rounded-lg hover:opacity-80"
            >
              Update Series Result
            </button>
            <button
              onClick={handleCloseAllBets}
              className="bg-colors-nba-blue text-white p-2 mb-4 rounded-lg hover:opacity-80"
            >
              Close All Series Bets
            </button>
            <button
              onClick={handleDeleteSeries}
              className="bg-colors-nba-red text-white p-2 mb-4 rounded-lg hover:opacity-80"
            >
              Delete Series
            </button>
          </div>
        )}
        {showSeriesResultForm && selectedSeries && (
          <form onSubmit={handleSubmitSeriesResult} className="space-y-4 mt-6">
            <h3 className="text-xl font-semibold mb-4">Enter Series Result</h3>

            {/* Number of Games */}
            {/* <div>
            <label className="block text-lg font-semibold">
              Number of Games
            </label>
            <select
              name="numberOfGames"
              value={numberOfgames}
              onChange={(e) => setNumberOfGames(parseInt(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg mt-2"
            >
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
            </select>
          </div> */}

            {/* Winning Team */}
            <div>
              <label className="block text-lg font-semibold">
                Select Winning Team In Last Game
              </label>
              <select
                name="wonTeam"
                value={wonTeam}
                onChange={(e) => setWonTeam(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg mt-2"
              >
                <option value="">-- Select Winning Team --</option>
                <option value={1}>{selectedSeries.team1}</option>
                <option value={2}>{selectedSeries.team2}</option>
              </select>
            </div>

            {/* Button to Submit the Series Result */}
            <div className="mt-4 mb-4 flex justify-between">
              <button
                type="button"
                onClick={handleCloseUpdateResultSeries}
                className="text-colors-nba-red hover:scale-110 transition-transform"
              >
                Close Update Result
              </button>
              <SubmitButton
                text="Update Result"
                loading={loading}
                onClick={handleSubmitSeriesResult}
                disabled={loading || !wonTeam}
              />
            </div>
          </form>
        )}

        {/* Show existing bets for selected series */}
        {selectedSeries && !showSeriesResultForm && (
          <>
            <h2 className="text-2xl font-semibold mb-4 mt-4">
              Bets for the selected series
            </h2>
            {bets?.map((bet) => (
              <div
                key={bet.differential}
                className="mb-4 p-4 border border-gray-300 rounded-lg w-full max-w-full mx-auto"
              >
                <div className="flex justify-between">
                  <span className="p-4">
                    {bet.player1} vs {bet.player2}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => handleBetSelection(bet)}
                      className="text-colors-nba-blue border-2 border-colors-nba-blue rounded-2xl shadow-lg p-1  hover:text-blue-700 hover:opacity-60"
                    >
                      Edit Bet
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBetSelectionForUpdateResult(bet)}
                      className="text-colors-nba-blue border-2 border-colors-nba-blue rounded-2xl shadow-lg p-1 hover:text-blue-700 hover:opacity-60"
                    >
                      Update Result
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBet(bet)}
                      className="text-red-500 border-2 border-colors-nba-red rounded-2xl shadow-lg p-1 hover:text-red-700 hover:opacity-60"
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
        {!showCreateSeriesForm &&
          selectedSeries &&
          !isInEdit &&
          !updateResultSelected &&
          !showSeriesResultForm && (
            <div className="flex justify-center mt-4">
              <SubmitButton
                loading={loading}
                text="Create New Bet"
                onClick={handleCreateNewBet}
                disabled={bets.length >= 6}
              />
            </div>
          )}
        {updateResultSelected && selectedBet?.player1 !== "" && (
          <form onSubmit={handleUpdateCurrentStats} className="space-y-4">
            <div>
              <label className="block text-lg font-semibold">
                Matchup Result
              </label>
              <label className="block text-lg font-semibold">
                {selectedBet?.player1}
              </label>
              <input
                type="number"
                name="currentStats0"
                value={player1Stat || ""}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg mt-2"
              ></input>
              <label className="block text-lg font-semibold">
                {selectedBet?.player2}
              </label>
              <input
                type="number"
                name="currentStats1"
                value={player2Stat || ""}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg mt-2"
              ></input>
            </div>

            <div className="flex justify-between mt-4">
              <button
                type="button"
                onClick={handleCloseUpdateResult}
                className="text-colors-nba-red hover:scale-110 transition-transform"
              >
                Close Update Result Bet
              </button>
              <SubmitButton
                text="Update Result"
                loading={loading}
                onClick={handleUpdateCurrentStats}
              />
            </div>
          </form>
        )}
        {/* Bet Update Form */}
        {createNewBet && !updateResultSelected && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-lg font-semibold">
                Matchup Type
              </label>
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
                value={selectedBet?.player1}
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
              <label className="block text-lg font-semibold">
                Differential (On player 2)
              </label>
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
    </div>
  );
};

export default UpdateBetsPage;
