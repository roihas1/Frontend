import React, { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  InputLabel,
  FormControl,
  Autocomplete,
  TextField,
  Tooltip,
  Modal,
  Box,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  SelectChangeEvent,
  Popover,
  Checkbox,
} from "@mui/material";
import { useError } from "../components/providers&context/ErrorProvider";
import axiosInstance from "../api/axiosInstance";
import { AllSeriesBets, checkTokenExpiration, Guess, User } from "../types";
import CustomSelectInput from "../components/form/CustomSelectInput";
import { useLocation } from "react-router-dom";
import ChampColumn from "../components/forPages/ChampColumn";
import ChampGuessColumn from "../components/forPages/ChampGuessColumn";
import InstructionPaper from "../components/forPages/ComparisonInstruction";
import ClearUsersButton from "../components/forPages/ClearUsersButton";

const ComparingPage: React.FC = () => {
  const { showError } = useError();
  const [allSeriesBets, setAllSeriesBets] = useState<AllSeriesBets>({});
  const [users, setUsers] = useState<{ [key: string]: User }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [series, setSeries] = useState<{ [key: string]: string }>();
  const [selectedSeries, setSelectedSeries] = useState<string>("");
  const [selectedSeriesName, setSelectedSeriesName] = useState<string>("");
  const [selectedUsers, setSelectedUsers] = useState<{ [key: string]: string }>(
    {}
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDisabledClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!selectedSeries && !selectedStage) {
      setAnchorEl(event.currentTarget); // Set the clicked button as the anchor element
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const location = useLocation();
  const secondUserId = location.state?.secondUserId;
  const [currentUser, setCurrentUser] = useState<User>();
  const [usersGuesses, setUsersGuesses] = useState<{
    [key: string]: {
      bestOf7: Guess;
      teamWon: Guess;
      playerMatchups: object[];
      spontaneousGuesses: object[];
    };
  }>();
  const [suggestedUsers, setSuggestedUsers] = useState<{
    [key: string]: string;
  }>({});
  const [open, setOpen] = useState<boolean>(false);
  const [showSeriesSelection, setShowSeriesSelection] = useState<boolean>(true);
  const [showChampSelection, setShowChampSelection] = useState<boolean>(false);
  const [comparisonType, setComparisonType] = useState<string>("Series");
  const [betsType, setBetsType] = useState<string>("Regular");
  const [passedStages, setPassedStages] = useState<string[]>([]);
  const [selectedStage, setSelectedStage] = useState<string>("");
  const [userChampGuessses, setUserChampGuesses] = useState<{
    [key: string]: {
      conferenceFinalGuesses: [];
      championTeamGuesses: [];
      mvpGuesses: [];
    };
  }>();
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/auth");
      const responseUser = await (await axiosInstance.get("/auth/user")).data;
      setCurrentUser(responseUser);
      const sortedUsers = response.data.sort(
        (a, b) => b.fantasyPoints - a.fantasyPoints
      );
      const users: { [key: string]: string } = {};
      sortedUsers.slice(0, 5).map((user: User) => {
        users[user.id] = `${user.firstName} ${user.lastName}`;
      });
      setSuggestedUsers(users);
      const allUsers: { [key: string]: User } = {};
      response.data.map((user: User) => {
        allUsers[user.id] = user;
      });

      setUsers(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };
  const getAllBetsBySeries = async () => {
    try {
      const response = await axiosInstance.get("/series/getAll/bets");

      setAllSeriesBets(response.data);
      const res: { [key: string]: string } = {};
      Object.keys(response.data).forEach((key) => {
        if (new Date(response.data[key].startDate) < new Date()) {
          res[
            key
          ] = `${response.data[key].team1} vs ${response.data[key].team2} (${response.data[key].round})`;
        }
      });
      setSeries(res);
    } catch (error) {
      showError(`Failed.`);
    }
  };
  const fetchStages = async () => {
    try {
      const response = await axiosInstance.get(`playoffs-stage/passedStages`);
      setPassedStages(response.data);
    } catch (error) {
      showError(`server error.`);
    }
  };
  const setInitialsComprison = (secondId: string) => {
    let series = "";
    let name = "";
    if (!series) {
      showError(`No Series has Ended`);
      return;
    }
    for (const key of Object.keys(allSeriesBets)) {
      if (new Date(allSeriesBets[key].startDate) < new Date()) {
        if (
          allSeriesBets[key].playerMatchupBets.some(
            (bet) => bet.guesses.length > 0
          )
        ) {
          name = `${allSeriesBets[key].team1} vs ${allSeriesBets[key].team2} (${allSeriesBets[key].round})`;
          series = key;
          setSelectedSeries(key);
          setSelectedSeriesName(name);
          break;
        }
      }
    }
    handleUserSelection(currentUser?.id, series);
    handleUserSelection(secondUserId, series);
  };
  checkTokenExpiration();
  useEffect(() => {
    if (secondUserId && currentUser && allSeriesBets) {
      setInitialsComprison(secondUserId);
    }
  }, [allSeriesBets, currentUser, secondUserId]);

  useEffect(() => {
    getAllBetsBySeries();
    fetchUsers();
    fetchStages();
  }, []);

  const opacity = 0.218;
  const handleOpenModal = () => {
    setOpen(true);
  };
  const handleCloseModal = () => {
    setOpen(false);
  };
  const handleUserSelection = async (userId: string, seriesId?: string) => {
    if (Object.keys(selectedUsers).length === 5) {
      showError(
        `Max participents in comparison is 5! Remove at least one user.`
      );
      return;
    }
    try {
      const user = users[userId];
      const name = `${user?.firstName} ${user?.lastName}`;
      if (!(userId in selectedUsers)) {
        if (showSeriesSelection) {
          const id = seriesId ? seriesId : selectedSeries;
          const series = allSeriesBets[id];
          const bestOf7Guess = series.bestOf7Bet.guesses.filter(
            (guess) => guess.createdById === userId
          );
          const team = series.teamWinBet.guesses.filter(
            (guess) => guess.createdById === userId
          );
          const playerMatchups = series.playerMatchupBets.flatMap((bet) => {
            const matchingGuesses = bet?.guesses.filter(
              (guess) => guess.createdById === userId
            );
            const player1 = bet.player1;
            const player2 = bet.player2;
            return { guesses: matchingGuesses, player1, player2 };
          });
          const spontaneousGuesses = series.spontaneousBets.flatMap((bet) => {
            const matchingGuesses = bet?.guesses.filter(
              (guess) => guess.createdById === userId
            );
            const player1 = bet.player1;
            const player2 = bet.player2;
            return { guesses: matchingGuesses, player1, player2 };
          });
          setUsersGuesses({
            ...usersGuesses,
            [userId]: {
              bestOf7: bestOf7Guess[0],
              teamWon: team[0],
              playerMatchups,
              spontaneousGuesses,
            },
          });
          setSelectedUsers({ ...selectedUsers, [userId]: name });
        } else if (showChampSelection) {
          const response = await axiosInstance.get(
            `playoffs-stage/getUserGuesses/${selectedStage}/${userId}`
          );

          setUserChampGuesses({
            ...userChampGuessses,
            [userId]: {
              conferenceFinalGuesses: response.data.conferenceFinalGuesses,
              championTeamGuesses: response.data.championTeamGuesses,
              mvpGuesses: response.data.mvpGuesses,
            },
          });
          setSelectedUsers({ ...selectedUsers, [userId]: name });
        }
      }
      return false;
    } catch (error) {
      console.log(error);
      // showError(`Failed to to select user`)
    }
  };
  const removeUser = (obj: { [key: string]: string }, keyToRemove: string) => {
    const { [keyToRemove]: _, ...newObj } = obj;
    return newObj;
  };
  const handleRemoveUser = (userId: string) => {
    setSelectedUsers((prevSelectedUser) => removeUser(prevSelectedUser, userId));
  };

  // Rows for each column
  const BetColumn = ({
    betsData,
    isSpontaneous,
  }: {
    betsData: any;
    isSpontaneous: boolean;
  }) => {
    return (
      <div className="flex flex-col space-y-2">
        {!isSpontaneous && (
          // {/* BestOf7Bet */}
          <>
            <div>
              <Paper
                sx={{
                  padding: 1,
                  backgroundColor: `rgba(107, 144, 225,${opacity})`,
                }}
              >
                <Typography
                  className="text-md truncate"
                  sx={{ fontSize: "14px" }}
                >
                  Number Of Games{" "}
                  <strong>({betsData.bestOf7Bet.result})</strong>
                </Typography>
              </Paper>
            </div>

            <div>
              <Tooltip
                title={
                  <Typography className="text-md truncate">
                    Series Winner{" "}
                    <strong>
                      (
                      {betsData.teamWinBet.result === 1
                        ? betsData.team1
                        : betsData.team2}
                      )
                    </strong>
                  </Typography>
                }
                arrow
                placement="top"
              >
                <Paper
                  sx={{
                    padding: 1,
                    backgroundColor: `rgba(107, 144, 225,${opacity})`,
                  }}
                >
                  <Typography
                    className="text-md truncate"
                    sx={{ fontSize: "14px" }}
                  >
                    Series Winner{" "}
                    <strong>
                      (
                      {betsData.teamWinBet.result === 1
                        ? betsData.team1
                        : betsData.team2}
                      )
                    </strong>
                  </Typography>
                </Paper>
              </Tooltip>
            </div>
          </>
        )}

        {/* PlayerMatchupBets */}
        <div>
          <Typography
            className="text-md"
            gutterBottom
            sx={{ fontSize: "14px" }}
          >
            Player Matchup Bets
          </Typography>
          {((!isSpontaneous && betsData.playerMatchupBets.length === 0) ||
            (isSpontaneous && betsData.spontaneousBets.length === 0)) && (
            <Typography sx={{ fontSize: "14px", color: "gray" }}>
              No bets available.
            </Typography>
          )}
          {(isSpontaneous
            ? betsData.spontaneousBets
            : betsData.playerMatchupBets
          ).map((matchup: any, index: number) => (
            <Paper
              key={index}
              sx={{
                padding: 1,
                marginBottom: 1,
                backgroundColor: `rgba(107, 144, 225,${opacity + 0.5})`,
              }}
            >
              <Tooltip
                title={
                  <Typography className="text-xs ">
                    {matchup.player1} vs {matchup.player2} (
                    {matchup.categories.join(" & ")}){" "}
                    <strong>
                      (
                      {matchup.result === null
                        ? `[${matchup.currentStats[0]}, ${
                            matchup.currentStats[1] + matchup.differential
                          }]`
                        : matchup.result === 1
                        ? matchup.player1
                        : matchup.player2}
                      )
                    </strong>
                  </Typography>
                }
                placement="top"
                arrow
              >
                <Typography
                  className="text-xs truncate"
                  sx={{ fontSize: "14px" }}
                >
                  {matchup.player1} vs {matchup.player2} (
                  {matchup.categories.join(" & ")}){" "}
                  <strong>
                    (
                    {matchup.result === null
                      ? `[${matchup.currentStats[0]}, ${
                          matchup.currentStats[1] + matchup.differential
                        }]`
                      : matchup.result === 1
                      ? matchup.player1
                      : matchup.player2}
                    )
                  </strong>
                </Typography>
              </Tooltip>
            </Paper>
          ))}
        </div>
      </div>
    );
  };

  const GuessColumn = ({
    guessData,
    isSpontaneous,
  }: {
    guessData: any;
    isSpontaneous: boolean;
  }) => {
    return (
      <div className="flex flex-col space-y-2">
        {/* BestOf7Bet */}
        {!isSpontaneous && (
          <>
            {guessData.bestOf7 && (
              <div>
                <Paper
                  sx={{
                    padding: 1,
                    backgroundColor: `${
                      allSeriesBets[selectedSeries].bestOf7Bet.result ===
                      guessData.bestOf7.guess
                        ? "#ccffcc"
                        : "rgba(0,0,0,0)"
                    }`,
                  }}
                >
                  {/* <Typography className="text-md" gutterBottom>
              Number Of Games
            </Typography> */}
                  <Typography
                    className={`flex justify-center`}
                    variant="body1"
                    sx={{ fontSize: "14px" }}
                  >
                    {guessData.bestOf7.guess}
                  </Typography>
                </Paper>
              </div>
            )}
            {!guessData.bestOf7 && (
              <Tooltip
                title={
                  <Typography className="flex justify-center text-xs">
                    - Looser didn't guess -
                  </Typography>
                }
                arrow
                placement="bottom"
              >
                <Paper
                  sx={{
                    padding: 1,
                    backgroundColor: "rgba(0,0,0,0)", // Transparent background
                  }}
                >
                  <Typography
                    className="flex truncate justify-center text-xs"
                    sx={{ fontSize: "14px" }}
                  >
                    - Looser didn't guess -
                  </Typography>
                </Paper>
              </Tooltip>
            )}

            {/* TeamWinBet */}
            {guessData.teamWon && (
              <div>
                <Tooltip
                  title={
                    <Typography className="items-center text-xs">
                      {guessData.teamWon.guess === 1
                        ? allSeriesBets[selectedSeries].team1
                        : allSeriesBets[selectedSeries].team2}
                    </Typography>
                  }
                  placement="top"
                  arrow
                >
                  <Paper
                    sx={{
                      padding: 1,
                      backgroundColor: `${
                        allSeriesBets[selectedSeries].teamWinBet.result ===
                        guessData.teamWon.guess
                          ? "#ccffcc"
                          : "rgba(0,0,0,0)"
                      }`,
                      display: "flex", // Enable flexbox
                      justifyContent: "center", // Horizontally center content
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      className="justify-center truncate items-center text-xs"
                      sx={{ fontSize: "14px" }}
                    >
                      {guessData.teamWon.guess === 1
                        ? allSeriesBets[selectedSeries].team1
                        : allSeriesBets[selectedSeries].team2}
                    </Typography>
                  </Paper>
                </Tooltip>
              </div>
            )}
            {!guessData.teamWon && (
              <Tooltip
                title={
                  <Typography className="flex justify-center text-xs">
                    - Looser didn't guess -
                  </Typography>
                }
                arrow
                placement="bottom"
              >
                <Paper
                  sx={{
                    padding: 1,
                    backgroundColor: "rgba(0,0,0,0)", // Transparent background
                  }}
                >
                  <Typography
                    className="flex truncate justify-center text-xs"
                    sx={{ fontSize: "14px" }}
                  >
                    - Looser didn't guess -
                  </Typography>
                </Paper>
              </Tooltip>
            )}
          </>
        )}
        {/* PlayerMatchupGuess */}

        <div>
          <Tooltip
            title={<Typography>Player Matchups</Typography>}
            arrow
            placement="left"
          >
            <Typography
              className="text-md truncate"
              gutterBottom
              sx={{ fontSize: "14px" }}
            >
              Player Matchups
            </Typography>
          </Tooltip>
          {((!isSpontaneous && guessData.playerMatchups.length === 0) ||
            (isSpontaneous && guessData.spontaneousGuesses.length === 0)) && (
            <Typography sx={{ fontSize: "14px", color: "gray" }}>
              No bets available.
            </Typography>
          )}

          {/* Determine which list to render */}
          {(isSpontaneous
            ? guessData.spontaneousGuesses
            : guessData.playerMatchups
          ).map((matchup: any, index: number) => {
            // Check if guesses is undefined
            if (matchup.guesses.length === 0) {
              return (
                <Tooltip
                  key={index + 10}
                  title={
                    <Typography className="flex justify-center text-xs">
                      - Looser didn't guess -
                    </Typography>
                  }
                  arrow
                  placement="bottom"
                >
                  <Paper
                    key={index}
                    sx={{
                      padding: 1,
                      marginBottom: 1,
                      backgroundColor: "rgba(0,0,0,0)", // Transparent background
                    }}
                  >
                    <Typography
                      className="flex truncate justify-center text-xs"
                      sx={{ fontSize: "14px" }}
                    >
                      - Looser didn't guess -
                    </Typography>
                  </Paper>
                </Tooltip>
              );
            }

            // Render Paper for matchups with guesses
            return (
              <Tooltip
                key={index}
                title={
                  <Typography className="flex justify-center text-xs">
                    {matchup.guesses[0].guess === 1
                      ? matchup.player1
                      : matchup.player2}
                  </Typography>
                }
                arrow
                placement="top"
              >
                <Paper
                  key={index}
                  sx={{
                    padding: 1,
                    marginBottom: 1,
                    backgroundColor: `${
                      allSeriesBets[selectedSeries].playerMatchupBets[index]
                        .result === matchup.guesses[0].guess
                        ? "#ccffcc"
                        : "rgba(0,0,0,0)"
                    }`,
                  }}
                >
                  <Typography
                    className="flex justify-center text-xs"
                    sx={{ fontSize: "14px" }}
                  >
                    {matchup.guesses[0].guess === 1
                      ? matchup.player1
                      : matchup.player2}
                  </Typography>
                </Paper>
              </Tooltip>
            );
          })}
        </div>
      </div>
    );
  };

  const getFantasyPoints = (userId: string) => {
    const user = users[userId];
    return user?.fantasyPoints;
  };
  const SearchIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="#737373"
      className="size-8 mt-1"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      />
    </svg>
  );
  const handleChangeType = (event: React.ChangeEvent<HTMLInputElement>) => {
    setComparisonType(event.target.value);
    switch (event.target.value) {
      case "Champ":
        setShowChampSelection(true);
        setSelectedUsers({});
        setShowSeriesSelection(false);
        break;
      case "Series":
        setShowSeriesSelection(true);
        setSelectedUsers({});
        setShowChampSelection(false);
        break;
    }
  };
  const handleBetsType = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBetsType(event.target.value);
  };
  const handleStageSelection = async (event: SelectChangeEvent<string>) => {
    setSelectedStage(event.target.value);
  };
  const handleClearSelectedUsers = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    setSelectedUsers({});
  };
  const handleSelectionUsers = (users: Array<User>)=>{
    const ids = users.map((user)=> user.id);
    console.log(ids)

    if ( ids.length > Object.keys(selectedUsers).length){
      for (const id of ids){
        if(!(id in selectedUsers)){
          if(selectedSeries || selectedStage){
          handleUserSelection(id);
          }
          else{
            showError(`Choose Series or Stage First!`)
          }
        }
      }
    }
    else {
      for( const id of Object.keys(selectedUsers)){
        if (!ids.includes(id)){
          handleRemoveUser(id)
          console.log(id)
        }
        
      }
    }
    // for( const id of ids){
      
    //   if ( !(id in selectedUsers) && ids.length > Object.keys(selectedUsers).length){
    //     handleUserSelection(id);
    //   }
    //   else if( !(id in selectedUsers) && ids.length < Object.keys(selectedUsers).length){
    //     console.log(id)
    //     console.log(users)
    //     handleRemoveUser(id);
    //   }
    // }
    
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex w-full justify-between items-center px-8">
        <div className="flex justify-start">
          <FormControl>
            <FormLabel>Comparison type</FormLabel>
            <RadioGroup row value={comparisonType} onChange={handleChangeType}>
              <FormControlLabel
                value="Series"
                control={<Radio size="small" color="default" />}
                label="Series"
              />
              <FormControlLabel
                value="Champ"
                control={<Radio size="small" color="default" />}
                label="Champ"
              />
            </RadioGroup>
          </FormControl>
        </div>
        <div className="flex items-center mx-auto space-x-2">
          <h1 className="text-2xl font-semibold underline mb-2">
            Users comparison
          </h1>
          <Tooltip
            title={
              <Typography className="flex justify-center text-xs">
                Instruction
              </Typography>
            }
            arrow
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="size-6 ml-12 hover:cursor-pointer "
              onClick={handleOpenModal}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
              />
            </svg>
          </Tooltip>
          <div className="w-32" />
        </div>
        <Modal open={open} onClose={handleCloseModal}>
          <Box
            sx={{
              width: "50%",
              height: "auto",
              margin: "auto",
              marginTop: 10,
              backgroundColor: "white",
              padding: 3,
              borderRadius: "8px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: 24,
            }}
          >
            <InstructionPaper />
          </Box>
        </Modal>
      </div>

      <div className="flex justify-between items-center mb-4 w-full ">
        {showSeriesSelection && series && (
          <div className="w-1/4 truncate mb-4 ml-8 mt-2 pt-2 ">
            <FormControl fullWidth>
              <InputLabel>Select Series</InputLabel>
              <CustomSelectInput
                id="1"
                value={selectedSeriesName}
                label={
                  Object.values(series).length === 0
                    ? "- No Series has Ended -"
                    : "Series"
                }
                onChange={(e) => {
                  for (const key in series) {
                    if (series[key] === e.target.value) {
                      setSelectedSeries(key);
                      setSelectedSeriesName(e.target.value);
                      break;
                    }
                  }
                }}
                options={Object.values(series)}
              />
            </FormControl>
          </div>
        )}
        {showChampSelection && passedStages && (
          <div className="w-1/4 truncate mb-4 ml-8 mt-2 pt-2 ">
            <FormControl fullWidth variant="outlined">
              <InputLabel className="px-2">Select Champ Stage</InputLabel>
              <CustomSelectInput
                id="1"
                value={selectedStage}
                label="Select Champ Stage"
                onChange={handleStageSelection}
                options={passedStages}
              />
            </FormControl>
          </div>
        )}
        {users && (
          <div className="flex space-x-5 w-3/5  items-center mb-2 mr-6">
            {/* <h3 className="w-12 font-semibold underline">Top 5:</h3>
            <div className="grid grid-cols-3 w-1/2 gap-1">
              {suggestedUsers &&
                Object.keys(suggestedUsers).map((userId) => (
                  <div key={userId} className="flex flex-row">
                    <Tooltip
                      title={
                        <Typography>
                          {userId === currentUser?.id
                            ? "You"
                            : suggestedUsers[userId]}
                        </Typography>
                      }
                      arrow
                      placement="right"
                    >
                      <button
                        value={userId}
                        className="rounded-2xl p-1 w-32  text-md truncate border-slate-200 text-black opacity-1 border-2 hover:bg-slate-200"
                        onClick={(e) => {
                          if (!selectedSeries && !selectedStage) {
                            handleDisabledClick(e);
                          } else {
                            handleUserSelection(e.currentTarget.value);
                          }
                        }}
                      >
                        {userId === currentUser?.id
                          ? "You"
                          : suggestedUsers[userId]}
                      </button>
                    </Tooltip>
                    <Popover
                      open={Boolean(anchorEl)}
                      anchorEl={anchorEl}
                      onClose={handleClose}
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "center",
                      }}
                      transformOrigin={{
                        vertical: "top",
                        horizontal: "center",
                      }}
                    >
                      <Typography sx={{ p: 2, fontSize: "16px" }}>
                        Please select a series or stage first!
                      </Typography>
                    </Popover>
                  </div>
                ))}
            </div> */}
            <div className="w-3/4 items-start ">
              <Autocomplete
                multiple 
                options={Object.values(users)}
                disableCloseOnSelect
                getOptionLabel={(option) =>
                  `${option.firstName} ${option.lastName}`
                }
                value={Object.keys(selectedUsers).map((id) => Object.values(users).find((user) => user.id === id)!).filter(Boolean)}
                onChange={(event, newValues) => handleSelectionUsers(newValues)}
                renderOption={(props, option, { selected }) => (
                  <li {...props} key={option.id}>
                    <Checkbox checked={selected} />
                    {`${option.firstName} ${option.lastName}`}
                  </li>
                )}
                renderInput={(params) => (
                  <div className="flex justify-center items-center">
                    <TextField
                      {...params}
                      margin="normal"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "1rem",
                        },
                      }}
                      label="Search Users"
                    />
                    <SearchIcon />
                  </div>
                )}
              />
              {/* <Autocomplete
                freeSolo
                onChange={(event, newValue) => {
                  handleUserSelection(newValue.id);
                }}
                options={Object.values(users)}
                getOptionLabel={(option) =>
                  `${option.firstName} ${option.lastName}`
                }
                selectOnFocus
                renderInput={(params) => (
                  <div className="flex justify-center items-center">
                    <TextField
                      {...params}
                      margin="normal"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "1rem",
                        },
                      }}
                      label="Search Users"
                    />
                    <SearchIcon />
                  </div>
                )}
              ></Autocomplete> */}
            </div>
            {Object.keys(selectedUsers).length > 0 && (
              <div className="flex items-center ">
                <ClearUsersButton onClick={handleClearSelectedUsers} />
              </div>
            )}
          </div>
        )}
      </div>
      {!selectedSeries && !selectedSeriesName && !selectedStage && (
        <InstructionPaper />
      )}
      {showSeriesSelection && selectedSeriesName && (
        <div className="relative flex w-full justify-between items-center mb-10 px-8">
          {/* Left-aligned FormControl */}
          <div className="flex">
            <FormControl>
              <FormLabel>Bets type</FormLabel>
              <RadioGroup row value={betsType} onChange={handleBetsType}>
                <FormControlLabel
                  value="Regular"
                  control={<Radio size="small" color="default" />}
                  label="Regular"
                />
                <FormControlLabel
                  value="Spontaneous"
                  control={<Radio size="small" color="default" />}
                  label="Spontaneous"
                />
              </RadioGroup>
            </FormControl>
          </div>

          {/* Centered Title */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h1 className="text-2xl font-semibold text-black text-center shadow-md p-4 rounded-2xl">
              {selectedSeriesName}
            </h1>
          </div>
        </div>
      )}

      <div className="flex w-full pl-8">
        {/* BetColumn */}
        <div className="w-1/5  mt-12">
          {showSeriesSelection &&
          allSeriesBets &&
          allSeriesBets[selectedSeries] ? (
            <BetColumn
              betsData={allSeriesBets[selectedSeries]}
              isSpontaneous={betsType === "Spontaneous"}
            />
          ) : showChampSelection && selectedStage ? (
            <ChampColumn />
          ) : (
            <div />
          )}
        </div>

        {/* Guesses column */}
        <div className="flex flex-row space-x-6 w-3/5 mx-8 justify-start">
          {Object.keys(selectedUsers).map((userId, index) => {
            const userName = `${users[userId].firstName} ${users[userId].lastName}`;
            const firstName = users[userId].firstName;
            const lastName = users[userId].lastName;
            return (
              <div
                key={index}
                className={`w-1/${Object.keys(selectedUsers).length} `}
              >
                {/* Title and Close Button Above the Column */}
                <div className={`flex justify-between mb-2`}>
                  <Tooltip
                    title={<Typography>{userName}</Typography>}
                    arrow
                    placement="top"
                  >
                    <div
                      className={`truncate ${
                        userId === currentUser?.id
                          ? "bg-colors-select-bet border-colors-select-bet"
                          : "border-slate-200"
                      } rounded-2xl p-1 text-black opacity-1 w-32 border-2 justify-center`}
                    >
                      {userId === currentUser?.id && <span>You</span>}
                      {userId !== currentUser?.id && (
                        <div className="flex row-span-1">
                          <span className="hidden xl:block">{firstName}</span>
                          <span className="hidden truncate md:block">
                            &nbsp;{lastName}
                          </span>
                        </div>
                      )}
                    </div>
                  </Tooltip>
                  <p className="p-2">{getFantasyPoints(userId)}Pts</p>

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="black"
                    className="size-4 cursor-pointer mt-3"
                    onClick={() => handleRemoveUser(userId)}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </div>

                <div className="flex flex-col">
                  {showSeriesSelection && usersGuesses?.[userId] ? (
                    <GuessColumn
                      guessData={usersGuesses[userId]}
                      isSpontaneous={betsType === "Spontaneous"}
                    />
                  ) : userChampGuessses?.[userId] ? (
                    <ChampGuessColumn guessData={userChampGuessses[userId]} />
                  ) : (
                    <p>No champion guess data available</p> // Placeholder for undefined data
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ComparingPage;
