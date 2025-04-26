import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { useError } from "../components/providers&context/ErrorProvider";
import { useSuccessMessage } from "../components/providers&context/successMassageProvider";
import SubmitButton from "../components/common/SubmitButton";
import { Series } from "./HomePage";
import CustomSelectInput from "../components/form/CustomSelectInput";
import {
  CircularProgress,
  FormControl,
  Input,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tooltip,
  Zoom,
} from "@mui/material";
import {
  MatchupCategory,
  nbaTeamsList,
  PlayerMatchupBet,
  PlayerMatchupType,
  SpontaneousBet,
} from "../types";
import SelectSeriesDropdown from "../components/forPages/SelectSeriesDropdown";
import ButtonGroup from "../components/forPages/ButtonGroup";
import BetForm from "../components/forPages/BetForm";
import ActionButtons from "../components/forPages/ActionButtons";
import BetsTabs from "../components/forPages/betsTabs";

// Enum for matchup type

const UpdateBetsPage: React.FC = () => {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [bets, setBets] = useState<PlayerMatchupBet[]>([]);
  const [spontaneousBets, setSpontaneousBets] = useState<SpontaneousBet[]>([]);
  const [isSpontaneousBet, setIsSpontaneousBet] = useState<boolean>(false);
  const [selectedBet, setSelectedBet] = useState<
    PlayerMatchupBet | SpontaneousBet
  >({
    id: "", // Temporary value for betId
    seriesId: selectedSeries?.id || "",
    typeOfMatchup: PlayerMatchupType.PLAYERMATCHUP,
    categories: [],
    fantasyPoints: 2,
    player1: "",
    player2: "",
    differential: 0,
    result: 0,
    currentStats: [0, 0],
    playerGames: [0, 0],
    startTime: "",
    gameNumber: 0,
  });
  const [player1Stat, setPlayer1Stat] = useState<number>(0);
  const [player2Stat, setPlayer2Stat] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [isInEdit, setIsInEdit] = useState<boolean>(false);
  const [showCreateSeriesForm, setShowCreateSeriesForm] =
    useState<boolean>(false);
  const [showPlayoffsStageCreation, setShowPlayoffsStageCreation] =
    useState<boolean>(false);
  const [stageName, setStageName] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [stageTime, setStageTime] = useState<string>("");
  const [teamsList, setTeamList] = useState<
    { name: string; seed: number; conference: string }[]
  >([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement | SVGSVGElement>(
    null
  );
  const [filteredSeriesList, setFilteredSeriesList] = useState<Series[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("");

  const [startDateSpontaneous, setStartDateSpontaneous] = useState<string>("");
  const [startTimeSpontaneous, setStartTimeSpontaneous] = useState<string>("");

  const handleFilterClick = (event: React.MouseEvent<SVGSVGElement>) => {
    setAnchorEl(event.currentTarget); // Opens the dropdown
  };

  const handleCloseFilter = () => {
    setAnchorEl(null); // Closes the dropdown
  };
  const handleFilterSeries = (filterSelected: string) => {
    setSelectedFilter(filterSelected);
    if (filterSelected === "All Series") {
      setFilteredSeriesList(seriesList);
    } else {
      setFilteredSeriesList(
        seriesList.filter((series) => series.round === filterSelected)
      );
    }
    handleCloseFilter();
  };

  const [createNewBet, setCreateNewBet] = useState<boolean>(false);
  const [updateResultSelected, setUpdateResultSelected] =
    useState<boolean>(false);
  const [showCloseChampionsBets, setShowCloseChampionsBets] =
    useState<boolean>(false);
  const [mvpPlayer, setMvpPlayer] = useState<string>("");
  const [championTeam, setChampionTeam] = useState<string>("");
  const [finalsTeams, setFinalsTeams] = useState<string[]>([]);
  const [showUpdateSeriesTime, setShowUpdateSeriesTime] =
    useState<boolean>(false);
  const [newSeries, setNewSeries] = useState<Series>({
    team1: "", // Default empty string for team1
    team2: "", // Default empty string for team2
    seed1: 0, // Default seed for team1
    seed2: 0, // Default seed for team2
    conference: "West", // Default conference
    round: "First Round", // Default round
    dateOfStart: new Date(), // Default to current date
    numOfGames: 0,
    timeOfStart: "",
    lastUpdate: new Date(),
  });
  const [showSeriesResultForm, setshowSeriesResultForm] =
    useState<boolean>(false);
  const [wonTeam, setWonTeam] = useState<string>("");

  const { showError } = useError();
  const { showSuccessMessage } = useSuccessMessage();
  // checkTokenExpiration();
  // Fetch all series
  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const response = await axiosInstance.get("/series");
        setSeriesList(response.data);
        setFilteredSeriesList(response.data);
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
      setBets(selectedSeries?.playerMatchupBets ?? []);
      setSpontaneousBets(selectedSeries?.spontaneousBets ?? []);
      handleResetSelectedBet();
    }
    const temporaryList = seriesList
      .filter((series) => series.conference === "Finals")
      .map((series) => [series.team1, series.team2])
      .flat();
    setFinalsTeams(temporaryList);
  }, [selectedSeries, seriesList]);

  const handleCloseEditBet = () => {
    setIsInEdit(false);
    handleResetSelectedBet();
    setCreateNewBet(false);
  };

  const handleCloseUpdateResult = () => {
    setUpdateResultSelected(false);
    handleResetSelectedBet();
  };
  const handleCategoriesSelection = (
    event: SelectChangeEvent<typeof selectedBet.categories>
  ) => {
    const { value } = event.target;

    const selectedCategories: MatchupCategory[] =
      typeof value === "string"
        ? value.split(",").map((category) => category as MatchupCategory)
        : value;
    setSelectedBet({
      ...selectedBet,
      categories: [...selectedCategories], // Prevent duplicates
    });
  };
  const handleGameNumberSelection = (event: SelectChangeEvent<string>) => {
    const { value } = event.target;

    setSelectedBet({
      ...selectedBet,
      gameNumber: parseInt(value),
    });
  };
  const handleDateAndTimeSelection = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    event.preventDefault();
    if (event.target.type === "date") {
      setStartDateSpontaneous(event.target.value);
    } else {
      setStartTimeSpontaneous(event.target.value);
    }
  };

  // Handle form field changes for the selected bet
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (selectedBet) {
      const { name, type, value } = e.target;

      // If the input is a select element, cast e.target to HTMLSelectElement
      if (name === "categories" && e.target instanceof HTMLSelectElement) {
        const selectElement = e.target as HTMLSelectElement; // Explicit cast
        const selectedCategories = Array.from(selectElement.options)
          .filter((option) => option.selected)
          .map((option) => option.value as MatchupCategory);

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
        const selectElement = e.target as HTMLSelectElement; // Explicit cast
        setSelectedBet({
          ...selectedBet,
          typeOfMatchup: Array.from(selectElement.options)
            .filter((option) => option.selected)
            .map((option) => option.value as PlayerMatchupType)[0],
        });
      } else if (name === "currentStats0") {
        setPlayer1Stat(parseInt(value));
      } else if (name === "currentStats1") {
        setPlayer2Stat(parseInt(value));
      } else {
        setSelectedBet({
          ...selectedBet,
          [name]: type === "text" ? value : parseFloat(value),
        });
      }
    }
  };

  // Handle bet selection for editing
  const handleBetSelection = (bet: PlayerMatchupBet | SpontaneousBet) => {
    setSelectedBet(bet);
    setIsInEdit(true);
    setCreateNewBet(true);
    if ("gameNumber" in bet) {
      setIsSpontaneousBet(true);
    } else {
      setIsSpontaneousBet(false);
    }
  };

  const handleResetSelectedBet = () => {
    setSelectedBet({
      id: "", // Temporary value for betId
      seriesId: selectedSeries?.id || "",
      typeOfMatchup: PlayerMatchupType.PLAYERMATCHUP,
      categories: [],
      fantasyPoints: 2,
      player1: "",
      player2: "",
      differential: 0,
      result: 0,
      currentStats: [0, 0],
      playerGames: [0, 0],
    });
  };

  // Handle form submission for new or updated bet
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBet) return;

    setLoading(true);
    try {
      if (isSpontaneousBet) {
        const time = startTimeSpontaneous.split(":");
        const startDate = new Date(startDateSpontaneous);
        startDate.setHours(parseInt(time[0]));
        startDate.setMinutes(parseInt(time[1]));
        if (!("gameNumber" in selectedBet)) {
          showError("Select game number bigger then 0!");
          return;
        }
        const response = await axiosInstance.post(`/spontaneous-bet`, {
          categories: selectedBet.categories,
          fantasyPoints: selectedBet.fantasyPoints,
          player1: selectedBet.player1,
          player2: selectedBet.player2,
          differential: selectedBet.differential,
          typeOfMatchup: selectedBet.typeOfMatchup,
          seriesId: selectedSeries?.id,
          startTime: startDate,
          gameNumber: "gameNumber" in selectedBet ? selectedBet.gameNumber : 0,
        });
        if (selectedBet.id) {
          setSpontaneousBets((prevBets) =>
            prevBets.map((bet) =>
              bet.id === response.data.id ? { ...bet, ...selectedBet } : bet
            )
          );
        } else {
          setSpontaneousBets((prevBets) => [...prevBets, response.data]);
        }
        showSuccessMessage("Bet created successfully!");
      } else if (selectedBet.id) {
        await axiosInstance.patch(
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

      handleResetSelectedBet(); // Clear selected bet after submission
    } catch {
      // console.error(error.response ? error.response.data : error.message);
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
        await axiosInstance.patch(`/series/${selectedSeries?.id}/closeBets`);
        // await axiosInstance.patch(`/user-series-points/user/updatePoints/all`);
        showSuccessMessage("Bets closed successfully!");
        setSelectedSeries(null);
      } catch {
        // console.error(error.response ? error.response.data : error.message);
        showError("Failed to close all bets.");
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  // Handle creating a new bet
  const handleCreateNewBet = () => {
    setIsSpontaneousBet(false);
    handleResetSelectedBet();
    setCreateNewBet(true);
  };
  const handleUpdateMissingBets = async ()=>{
    try{
      await axiosInstance.patch(`/user-missing-bets/user/updateAllUsers`)
      showSuccessMessage(`Update all missing bets to all users!`)
    }catch(error){
      showError(`Failed to update Missing Bets ${error}`)
    }
  }
  const handleCreateNewSpontaneousBet = () => {
    handleResetSelectedBet();
    setCreateNewBet(true);
    setIsSpontaneousBet(true);
  };
  const handleDeleteBet = async (
    bet: PlayerMatchupBet | SpontaneousBet,
    isSpontaneous: boolean
  ) => {
    if (window.confirm("Are you sure you want to delete this bet?")) {
      try {
        if (isSpontaneous) {
          await axiosInstance.delete(`/spontaneous-bet/${bet.id}/delete`);
          setSpontaneousBets(spontaneousBets.filter((b) => b.id != bet.id));
        } else {
          await axiosInstance.delete(`/player-matchup-bet/${bet.id}/delete`);
          setBets(bets.filter((b) => b.id !== bet.id));
        }
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
        timeOfStart: newSeries.timeOfStart,
      });
      setSeriesList((prevState) => [...prevState, response.data]); // Update the series list
      setFilteredSeriesList((prevState) => [...prevState, response.data]);
      setNewSeries({
        team1: "",
        team2: "",
        seed1: 0,
        seed2: 0,
        conference: "West",
        round: "First Round",
        dateOfStart: new Date(),
        numOfGames: 0,
        timeOfStart: "",
        lastUpdate: new Date(),
      });

      showSuccessMessage("New series created successfully!");
      setShowCreateSeriesForm(false); // Close the form
      setIsInEdit(false);
    } catch (error) {
      showError("Failed to create the new series." + error);
      console.log(error);
    }
  };
  const CheckIcon: React.FC = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="2.5"
      stroke="currentColor"
      className="size-4 mr-2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  );

  const handleInputNewSeriesChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    // If the field is 'dateOfStart', convert the value to a Date object
    if (name === "dateOfStart" && value) {
      const newDate = new Date(value);
      setNewSeries((prevState) => ({
        ...prevState,
        [name]: newDate, // Store the Date object
      }));
    } else if (name === "team1" || name === "team2") {
      const selectedTeam = teamsList?.find((team) => team.name === value);
      if (selectedTeam) {
        setNewSeries((prevState) => ({
          ...prevState,
          [name]: selectedTeam.name,
          [`seed${name === "team1" ? "1" : "2"}`]: selectedTeam.seed,
        }));
      } else {
        setNewSeries((prevState) => ({
          ...prevState,
          [name]: value,
        }));
      }
    } else {
      // For other fields, just update the state with the value directly
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
    setIsInEdit(false);
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
          setFilteredSeriesList((prevState) =>
            prevState.filter((series) => series.id !== selectedSeries.id)
          );
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
    setUpdateResultSelected(true);
    setSelectedBet(bet);
  };

  const handleUpdateCurrentStats = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const updateStats = [...selectedBet.currentStats];
    updateStats[0] += player1Stat === 100 ? 0: player1Stat;
    updateStats[1] += player2Stat === 100 ? 0: player2Stat;
    const spontaneous =
      spontaneousBets.filter((bet) => bet.id === selectedBet.id).length > 0
        ? true
        : false;
  
    try {
      if (spontaneous) {
        await axiosInstance.patch(`spontaneous-bet/${selectedBet?.id}/update`, {
          currentStats: updateStats,
        });
        setSpontaneousBets((prevBets) =>
          prevBets.map((bet) =>
            bet.id === selectedBet.id
              ? { ...bet, currentStats: updateStats } // Update the selected bet's currentStats
              : bet
          )
        );
      } else {
        await axiosInstance.patch(
          `/player-matchup-bet/${selectedBet?.id}/update`,
          {
            currentStats: updateStats,
          }
        );

        setBets((prevBets) =>
          prevBets.map(
            (bet) =>
              bet.id === selectedBet.id
                ? { ...bet, currentStats: updateStats } // Update the selected bet's currentStats
                : bet // Keep other bets unchanged
          )
        );
      }
      setUpdateResultSelected(false);
      setPlayer1Stat(0);
      setPlayer2Stat(0);
      handleResetSelectedBet();
      showSuccessMessage("Matchup Result updated successfully!");
      setSelectedSeries((prev) => prev);
    } catch (error) {
      showError("Failed to update match result.");
    }
    setLoading(false);
  };
  const handleUpdateSeriesResult = () => {
    setshowSeriesResultForm(true);
  };
  const handleUpdateSeriesTime = () => {
    setShowUpdateSeriesTime(true);
  };
  const handleCloseUpdateSeriesTime = () => {
    setShowUpdateSeriesTime(false);
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
  const handleCloseChampionsBets = async (e: React.FormEvent) => {
    e.preventDefault();

    if (window.confirm("Are you sure you want to close Champions Bets?")) {
      setLoading(true);
      const easternFinalsTeams = seriesList
        .filter(
          (series) =>
            series.conference === "East" && series.round === "Conference Finals"
        )
        .map((series) => [series.team1, series.team2])
        .flat();
      const westernFinalsTeams = seriesList
        .filter(
          (series) =>
            series.conference === "West" && series.round === "Conference Finals"
        )
        .map((series) => [series.team1, series.team2])
        .flat();
      try {
        await axiosInstance.patch("/playoffs-stage/closeGuess", {
          westernConferenceFinal: westernFinalsTeams,
          easternConferenceFinal: easternFinalsTeams,
          finals: finalsTeams,
          championTeam,
          mvp: mvpPlayer,
        });
        setShowCloseChampionsBets(false);
        setChampionTeam("");
        setMvpPlayer("");
        setLoading(false);
        setIsInEdit(false);
        showSuccessMessage("Champions bets closed.");
      } catch (error) {
        showError("Failed to close champions bets");
      }
    }
  };
  const handleCreateNewSeries = () => {
    const teamList: { name: string; seed: number; conference: string }[] = [];
    if (seriesList.length > 7) {
      seriesList.forEach((series) => {
        if (!teamList.some((team) => team.name === series.team1)) {
          teamList.push({
            name: series.team1,
            seed: series.seed1,
            conference: series.conference,
          });
        }

        // Check if team2 is already in the list
        if (!teamList.some((team) => team.name === series.team2)) {
          teamList.push({
            name: series.team2,
            seed: series.seed2,
            conference: series.conference,
          });
        }
      });
      setTeamList(teamList);
    }
    setIsInEdit(true);
    setShowCreateSeriesForm(true);
  };
  const handleSeriesSelection = (e: React.ChangeEvent<{ value: unknown }>) => {
    const series = seriesList.find((s) => s.id === e.target.value);
    setSelectedSeries(series || null);
    setBets(series?.playerMatchupBets || []);
  };
  const hadnleSubmitUpdateSeriesTime = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.patch(`series/${selectedSeries?.id}/updateTime`, {
        dateOfStart: selectedSeries?.dateOfStart,
        timeOfStart: selectedSeries?.timeOfStart,
      });
      showSuccessMessage(`Date and Time updated!`);
      setShowUpdateSeriesTime(false);
    } catch (error) {
      showError(`Failed to Update Series Time.`);
    } finally {
      setLoading(false);
    }
  };
  const handleCreateNewStage = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axiosInstance.post("/playoffs-stage", {
        name: stageName,
        startDate,
        timeOfStart: stageTime,
      });

      showSuccessMessage("Stage created.");

      setStageName("");
      setStartDate("");
      setShowPlayoffsStageCreation(false);
    } catch (error) {
      showError("Failed to create new stage.");
    } finally {
      setLoading(false);
      setIsInEdit(false);
    }
  };
    if (loading) {
      return (
        <div className="fixed inset-0 z-50 bg-gray-100 bg-opacity-80 flex justify-center items-center">
          <CircularProgress />
        </div>
      );
    }

  return (
    <div className="flex flex-col  ">
      <div className="p-4 max-w-screen-2xl mx-auto flex-1">
        <h1 className="flex text-3xl font-bold mb-6 justify-center">
          Update Bets
        </h1>
        {/* Button to show the create series form */}
        <ButtonGroup
          showCreateSeriesForm={showCreateSeriesForm}
          showPlayoffsStageCreation={showPlayoffsStageCreation}
          showCloseChampionsBets={showCloseChampionsBets}
          isInEdit={isInEdit}
          handleCreateNewSeries={handleCreateNewSeries}
          handleCloseChampionsBets={() => {
            setIsInEdit(true);
            setShowCloseChampionsBets(true);
          }}
          handlePlayoffsStageCreation={() => {
            setIsInEdit(true);
            setShowPlayoffsStageCreation(true);
          }}
        />
        {showCloseChampionsBets && (
          <form onSubmit={handleCloseChampionsBets}>
            <div className="space-y-4">
              <InputLabel> MVP player</InputLabel>
              <Input
                type="text"
                name="mvp player"
                value={mvpPlayer}
                onChange={(e) => setMvpPlayer(e.target.value)}
                placeholder="MVP Player"
                className="w-full p-3 border border-gray-300 rounded-2xl mt-2 bg-white"
              />
              <InputLabel> Champion Team</InputLabel>
              <FormControl fullWidth required>
                <InputLabel>Select Champion Team</InputLabel>
                <Select
                  id="championTeam"
                  value={championTeam || ""}
                  label="Select Champion Team"
                  name="Champion Team"
                  onChange={(e) => setChampionTeam(e.target.value)}
                  className="bg-white"
                  sx={{
                    borderRadius: "1rem",
                  }}
                >
                  <MenuItem key={finalsTeams[0]} value={finalsTeams[0]}>
                    {finalsTeams[0]}
                  </MenuItem>
                  <MenuItem key={finalsTeams[1]} value={finalsTeams[1]}>
                    {finalsTeams[1]}
                  </MenuItem>
                </Select>
              </FormControl>
              <ActionButtons
                text1="Close Edit"
                text2="Submit"
                onClick1={() => {
                  setIsInEdit(false);
                  setShowCloseChampionsBets(false);
                }}
                loading={loading}
              />
            </div>
          </form>
        )}
        {showPlayoffsStageCreation && (
          <form onSubmit={handleCreateNewStage}>
            <FormControl fullWidth required>
              <InputLabel>Stage</InputLabel>
              <CustomSelectInput
                id="playoffs Stage"
                label="Stage"
                value={stageName}
                options={["Before playoffs", "Round 1", "Round 2"]}
                onChange={(e) => setStageName(e.target.value)}
              />

              <input
                type="date"
                name="dateOfStart"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg mt-2 bg-transparent"
              />
              <input
                type="time"
                name="startTime"
                value={stageTime}
                onChange={(e) => setStageTime(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg mt-2 bg-transparent"
              />
            </FormControl>
            <ActionButtons
              text1="Close Edit"
              text2="Submit"
              onClick1={() => {
                setIsInEdit(false);
                setShowPlayoffsStageCreation(false);
              }}
              loading={loading}
            />
          </form>
        )}

        {/* Create New Series Form */}
        {showCreateSeriesForm && teamsList?.length > 15 && (
          <form onSubmit={handleSubmitNewSeries} className="space-y-4 mb-6">
            <div>
              <label className="block text-lg font-semibold">Conference</label>
              <select
                name="conference"
                value={newSeries.conference}
                onChange={handleInputNewSeriesChange}
                className="w-full p-3 border border-gray-300 rounded-lg mt-2"
                required
              >
                <option value="West">West</option>
                <option value="East">East</option>
                <option value="Finals">Finals</option>
              </select>
            </div>
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
                {newSeries.conference !== "Finals" &&
                  teamsList
                    ?.filter((team) => team.conference === newSeries.conference)
                    .map((team) => (
                      <option key={team.name} value={team.name}>
                        {team.name}
                      </option>
                    ))}
                {newSeries.conference === "Finals" &&
                  teamsList
                    ?.filter((team) => team.conference === "West")
                    .map((team) => (
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
                required
              >
                <option value="">-- Select Second Team --</option>
                {newSeries.conference !== "Finals" &&
                  teamsList
                    ?.filter((team) => team.conference === newSeries.conference)
                    .map((team) => (
                      <option key={team.name} value={team.name}>
                        {team.name}
                      </option>
                    ))}
                {newSeries.conference === "Finals" &&
                  teamsList
                    ?.filter((team) => team.conference === "East")
                    .map((team) => (
                      <option key={team.name} value={team.name}>
                        {team.name}
                      </option>
                    ))}
              </select>
            </div>

            <div>
              <label className="block text-lg font-semibold">Round</label>
              <select
                name="round"
                value={newSeries.round}
                onChange={handleInputNewSeriesChange}
                className="w-full p-3 border border-gray-300 rounded-lg mt-2"
                required
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
                required
              />
            </div>
            <div>
              <label className="block text-lg font-semibold">Time</label>
              <input
                type="time"
                name="timeOfStart"
                value={newSeries.timeOfStart}
                onChange={handleInputNewSeriesChange}
                className="w-full p-3 border border-gray-300 rounded-lg mt-2"
                required
              />
            </div>
            <ActionButtons
              text1="Close Edit Series"
              text2="Create Series"
              onClick1={handleCloseSeriesCreation}
              loading={loading}
            />
          </form>
        )}
        {showCreateSeriesForm && teamsList.length <= 15 && (
          <form onSubmit={handleSubmitNewSeries} className="space-y-4 mb-6">
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
              <label className="block text-lg font-semibold">Team 1</label>
              <select
                name="team1"
                value={newSeries.team1}
                onChange={handleInputNewSeriesChange}
                className="w-full p-3 border border-gray-300 rounded-lg mt-2"
              >
                <option value="">-- Select First Team --</option>
                {nbaTeamsList
                  ?.filter((team) => team.conference === newSeries.conference)
                  .map((team) => (
                    <option key={team.teamName} value={team.teamName}>
                      {team.teamName}
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
                {[...Array(8).keys()].map((index) => (
                  <option key={index + 1} value={index + 1}>
                    {index + 1}
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
                {nbaTeamsList
                  ?.filter((team) => team.conference === newSeries.conference)
                  .map((team) => (
                    <option key={team.teamName} value={team.teamName}>
                      {team.teamName}
                    </option>
                  ))}
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
                {[...Array(8).keys()].map((index) => (
                  <option key={index + 1} value={index + 1}>
                    {index + 1}
                  </option>
                ))}
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
            <div>
              <label className="block text-lg font-semibold">Time</label>
              <input
                type="time"
                name="timeOfStart"
                value={newSeries.timeOfStart}
                onChange={handleInputNewSeriesChange}
                className="w-full p-3 border border-gray-300 rounded-lg mt-2"
                required
              />
            </div>
            <ActionButtons
              text1="Close Edit Series"
              text2="Create Series"
              onClick1={handleCloseSeriesCreation}
              loading={loading}
            />
          </form>
        )}
        {/* Select Series */}
        {!showCloseChampionsBets &&
          !showPlayoffsStageCreation &&
          !showCreateSeriesForm && (
            <div className="flex items-center space-x-4 w-full">
              <SelectSeriesDropdown
                seriesList={filteredSeriesList}
                selectedSeries={selectedSeries}
                handleSeriesSelection={handleSeriesSelection}
              />

              <Tooltip
                title="Filter Series"
                slots={{
                  transition: Zoom,
                }}
                arrow
                placement="right"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-6 cursor-pointer mt-4 transform transition-transform duration-200 hover:scale-125"
                  onClick={handleFilterClick}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
                  />
                </svg>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseFilter}
              >
                {[
                  "First Round",
                  "Conference Semifinals",
                  "Conference Finals",
                  "NBA Finals",
                  "All Series",
                ].map((filter) => (
                  <MenuItem
                    key={filter}
                    selected={selectedFilter === filter}
                    onClick={() => handleFilterSeries(filter)}
                  >
                    {selectedFilter === filter && <CheckIcon />}
                    {filter}
                  </MenuItem>
                ))}
              </Menu>
            </div>
          )}
        {selectedSeries && (
          <div className="flex justify-center mt-4 space-x-4">
            <button
              onClick={handleUpdateSeriesResult}
              className="bg-colors-nba-blue text-white p-2 mb-4 rounded-lg hover:opacity-80"
            >
              Update Series Result
            </button>
            <button
              onClick={handleUpdateSeriesTime}
              className="bg-colors-nba-blue text-white p-2 mb-4 rounded-lg hover:opacity-80"
            >
              Update Series Time and Date
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
        {showUpdateSeriesTime && selectedSeries && (
          <form
            onSubmit={hadnleSubmitUpdateSeriesTime}
            className="space-y-4 mt-6 "
          >
            <h3 className="text-xl font-semibold mb-4">
              Enter Series Time and Date
            </h3>
            <div>
              <label className="block text-lg font-semibold">
                Date of Start
              </label>
              <input
                type="date"
                name="dateOfStart"
                value={
                  selectedSeries.dateOfStart
                    ? new Date(selectedSeries.dateOfStart)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                onChange={(e) => {
                  
                  setSelectedSeries((prevSeries) =>
                    prevSeries
                      ? {
                          ...prevSeries,
                          dateOfStart: new Date(e.target.value),
                        }
                      : null
                  );
                }}
                className="w-full p-3 border border-gray-300 rounded-lg mt-2"
              />
            </div>
            <div>
              <label className="block text-lg font-semibold">Time</label>
              <input
                type="time"
                name="timeOfStart"
                value={selectedSeries.timeOfStart}
                onChange={(e) => {
                  setSelectedSeries((prevSeries) =>
                    prevSeries
                      ? {
                          ...prevSeries,
                          timeOfStart: e.target.value,
                        }
                      : null
                  );
                }}
                className="w-full p-3 border border-gray-300 rounded-lg mt-2"
              />
            </div>
            <ActionButtons
              text1="Close Update Result"
              text2="Update Result"
              onClick1={handleCloseUpdateSeriesTime}
              onClick2={hadnleSubmitUpdateSeriesTime}
              loading={loading}
              disabled={loading}
            />
          </form>
        )}
        {showSeriesResultForm && selectedSeries && (
          <form onSubmit={handleSubmitSeriesResult} className="space-y-4 mt-6">
            <h3 className="text-xl font-semibold mb-4">Enter Series Result</h3>
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
            <ActionButtons
              text1="Close Update Result"
              text2="Update Result"
              onClick1={handleCloseUpdateResultSeries}
              onClick2={handleSubmitSeriesResult}
              loading={loading}
              disabled={loading || !wonTeam}
            />
          </form>
        )}

        {/* Show existing bets for selected series */}
        {selectedSeries && !showSeriesResultForm && !showUpdateSeriesTime && (
          <>
            <h2 className="text-2xl font-semibold mb-4 mt-4">
              Bets for the selected series
            </h2>
            <BetsTabs
              bets={bets}
              spontaneousBets={spontaneousBets}
              handleBetSelection={handleBetSelection}
              handleBetSelectionForUpdateResult={
                handleBetSelectionForUpdateResult
              }
              handleDeleteBet={handleDeleteBet}
            />
          </>
        )}

        {/* Create New Bet */}
        {!showCreateSeriesForm &&
          selectedSeries &&
          !isInEdit &&
          !updateResultSelected &&
          !showSeriesResultForm &&
          !showUpdateSeriesTime && (
            <div className="flex justify-center space-x-2 mt-4">
              <SubmitButton loading={loading} text={"Update Missing Bets"} disabled={false} onClick={handleUpdateMissingBets}/>
              <SubmitButton
                loading={loading}
                text="Create New Bet"
                onClick={handleCreateNewBet}
                disabled={bets.length >= 6}
              />

              <SubmitButton
                loading={loading}
                text="Create New Spontaneous Bet"
                onClick={handleCreateNewSpontaneousBet}
                disabled={false}
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
                {selectedBet?.player1} (Overall: {selectedBet?.currentStats[0]})
              </label>
              <input
                type="number"
                name="currentStats0"
                value={player1Stat || ""}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg mt-2"
              ></input>
              <label className="block text-lg font-semibold">
                {selectedBet?.player2} (Overall: {selectedBet?.currentStats[1]})
              </label>
              <input
                type="number"
                name="currentStats1"
                value={player2Stat || ""}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg mt-2"
              ></input>
            </div>
            <ActionButtons
              text1="Close Update Result Bet"
              text2="Update Result"
              onClick1={handleCloseUpdateResult}
              onClick2={handleUpdateCurrentStats}
              loading={loading}
            />
          </form>
        )}
        {/* Bet Update Form */}
        {createNewBet && !updateResultSelected && (
          <BetForm
            selectedBet={selectedBet}
            handleInputChange={handleInputChange}
            handleCategoriesSelection={handleCategoriesSelection}
            handleCloseEditBet={handleCloseEditBet}
            handleSubmit={handleSubmit}
            handleGameNumberSelection={handleGameNumberSelection}
            loading={loading}
            isSpontaneous={isSpontaneousBet}
            startDate={startDateSpontaneous}
            startTime={startTimeSpontaneous}
            handleDateAndTimeSelection={handleDateAndTimeSelection}
          />
        )}
      </div>
    </div>
  );
};

export default UpdateBetsPage;
