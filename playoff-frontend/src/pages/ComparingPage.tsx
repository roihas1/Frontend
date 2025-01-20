import React, { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  InputLabel,
  FormControl,
  Autocomplete,
  TextField,
  InputAdornment,
} from "@mui/material";
import { useError } from "../components/ErrorProvider";
import axiosInstance from "../api/axiosInstance";
import { AllSeriesBets, Guess, User } from "../types";
import CustomSelectInput from "../components/form/CustomSelectInput";
import { useLocation } from "react-router-dom";

// Data for companies and their engineering levels
interface ComparingPageProps {
  secondUserId?: string;
}

const ComparingPage: React.FC = () => {
  const { showError } = useError();
  const [allSeriesBets, setAllSeriesBets] = useState<AllSeriesBets>({});
  const [users, setUsers] = useState<User[]>();
  const [loading, setLoading] = useState<boolean>(false);
  const [series, setSeries] = useState<{ [key: string]: string }>();
  const [selectedSeries, setSelectedSeries] = useState<string>("");
  const [selectedSeriesName, setSelectedSeriesName] = useState<string>("");
  const [selectedUsers, setSelectedUsers] = useState<{ [key: string]: string }>(
    {}
  );
  const location = useLocation();
  const secondUserId = location.state.secondUserId;
  const [currentUser, setCurrentUser] = useState<User>();
  const [usersGuesses, setUsersGuesses] = useState<{
    [key: string]: {
      bestOf7: Guess;
      teamWon: Guess;
      playerMatchups: object[];
    };
  }>();
  const [suggestedUsers, setSuggestedUsers] = useState<{
    [key: string]: string;
  }>({});

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/auth");
      const responseUser = await (await axiosInstance.get("/auth/user")).data;
      //   const id = responseUser.id;
      //   const userObj = {
      //     [id]: `${responseUser.firstName} ${responseUser.lastName}`,
      //   };
      //   setSelectedUsers(userObj);
      setCurrentUser(responseUser);
      const sortedUsers = response.data.sort(
        (a, b) => b.fantasyPoints - a.fantasyPoints
      );
      const users = {};
      sortedUsers.slice(0, 5).map((user: User) => {
        users[user.id] = `${user.firstName} ${user.lastName}`;
      });
      setSuggestedUsers(users);
      //   const index = sortedUsers.findIndex(
      //     (user) => user.username === responseUser.username
      //   );
      //   const indices =
      //     index === sortedUsers.length - 1
      //       ? [sortedUsers.length - 3, sortedUsers.length - 2]
      //       : index === 0
      //       ? [1, 2]
      //       : [index - 1, index + 1];

      //   const initialselectedUsers = {
      //     [responseUser.id]: `${responseUser?.firstName} ${responseUser?.lastName}`,
      //   };
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };
  //   const getUsersGuesses = async () => {
  //     try {
  //       const response = await axiosInstance.get("/auth/getUserGuesses");
  //       console.log(response.data);
  //       setUser(response.data);
  //     } catch (error) {
  //       showError(`Failed.`);
  //     }
  //   };
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
  const setInitialsComprison = (secondId: string) => {
    console.log("Inside initial", secondId);
    let series = "";
    let name = "";
    for (const key of Object.keys(allSeriesBets)) {
      if (new Date(allSeriesBets[key].startDate) < new Date()) {
        if (
          allSeriesBets[key].playerMatchupBets.some(
            (bet) => bet.guesses.length > 0
          )
        ) {
          name = `${allSeriesBets[key].team1} vs ${allSeriesBets[key].team2} (${allSeriesBets[key].round})`;
          series = key;
          console.log(`key:${key}`)
          setSelectedSeries(key);
          setSelectedSeriesName(name);
          
          break;
        }
      }
    }
    handleUserSelection(currentUser?.id, series);
    handleUserSelection(secondUserId, series);
  };

  useEffect(() => {
    if (secondUserId && currentUser) {
      setInitialsComprison(secondUserId);
    }
  }, [currentUser, secondUserId]);
  useEffect(() => {
    getAllBetsBySeries();
    fetchUsers();
  }, []);
  {
    /* rgba(4,163,239,0.31)
      rgba(0,113,197,0.29)
      rgb(22,106,234,0.57)
      rgb(107, 144, 225)
      rgb(1,130,202,0.318) */
  }
  const opacity = 0.218;
  const [columnsVisible, setColumnsVisible] = useState([true]);

  const handleUserSelection = (userId: string, seriesId?: string) => {
    // Add a new column on the left when a user is selected
    
    if (!(userId in selectedUsers)) {
      const id = seriesId ? seriesId : selectedSeries;
      const user = users?.find((user) => user.id === userId);
      const name = `${user?.firstName} ${user?.lastName}`;
      const series = allSeriesBets[id];
      const bestOf7Guess = series.bestOf7Bet.guesses.filter(
        (guess) => guess.createdById === userId
      );
      const team = series.teamWinBet.guesses.filter(
        (guess) => guess.createdById === userId
      );
      const playerMatchups = series.playerMatchupBets.flatMap((bet) => {
        const matchingGuesses = bet.guesses.filter(
          (guess) => guess.createdById === userId
        );
        const player1 = bet.player1;
        const player2 = bet.player2;
        return { guesses: matchingGuesses, player1, player2 };
      });
      console.log(bestOf7Guess, team, playerMatchups);
      setUsersGuesses({
        ...usersGuesses,
        [userId]: {
          bestOf7: bestOf7Guess[0],
          teamWon: team[0],
          playerMatchups,
        },
      });
      setSelectedUsers({ ...selectedUsers, [userId]: name });
      setColumnsVisible([true, ...columnsVisible]);
    }
  };
  const removeUser = (obj: { [key: string]: string }, keyToRemove: string) => {
    const { [keyToRemove]: _, ...newObj } = obj;
    return newObj;
  };
  const handleClose = (userId: string) => {
    setSelectedUsers(removeUser(selectedUsers, userId));
  };

  // Rows for each column
  const BetColumn = ({ betsData }: { betsData: any }) => {
    return (
      <div className="flex flex-col space-y-2">
        {/* BestOf7Bet */}
        <div>
          <Paper
            sx={{
              padding: 1,
              backgroundColor: `rgba(107, 144, 225,${opacity - 0.15})`,
            }}
          >
            <Typography className="text-md">Number Of Games</Typography>
            {/* <Typography variant="body1">
              Result - {betsData.bestOf7Bet.result}
            </Typography> */}
          </Paper>
        </div>

        {/* TeamWinBet */}
        <div>
          <Paper
            sx={{
              padding: 1,
              backgroundColor: `rgba(107, 144, 225,${opacity - 0.1})`,
            }}
          >
            <Typography className="text-md">Series Winner</Typography>
            {/* <Typography variant="body1">
              Result -{" "}
              {betsData.teamWinBet.result === 1
                ? betsData.team1
                : betsData.team2}
            </Typography> */}
          </Paper>
        </div>

        {/* PlayerMatchupBets */}
        <div>
          <Typography className="text-md" gutterBottom>
            Player Matchup Bets
          </Typography>
          {betsData.playerMatchupBets.length > 0 &&
            betsData.playerMatchupBets.map((matchup: any, index: number) => (
              <Paper
                key={index}
                sx={{
                  padding: 1,
                  marginBottom: 1,
                  backgroundColor: `rgba(107, 144, 225,${
                    opacity + index * 0.15
                  })`,
                }}
              >
                <Typography className="text-xs">
                  {matchup.player1} vs {matchup.player2} (
                  {matchup.categories.join(" & ")})
                </Typography>
              </Paper>
            ))}
        </div>
      </div>
    );
  };

  const GuessColumn = ({ guessData }: { guessData: any }) => {
    return (
      <div className="flex flex-col space-y-2">
        {/* BestOf7Bet */}
        {guessData.bestOf7 && (
          <div>
            <Paper
              sx={{
                padding: 1,
                backgroundColor: `${
                  allSeriesBets[selectedSeries].bestOf7Bet.result ===
                  guessData.bestOf7.guess
                    ? "#ccffcc"
                    : "#ff8080"
                }`,
              }}
            >
              {/* <Typography className="text-md" gutterBottom>
              Number Of Games
            </Typography> */}
              <Typography className={`flex justify-center `} variant="body1">
                {guessData.bestOf7.guess}
              </Typography>
            </Paper>
          </div>
        )}

        {/* TeamWinBet */}
        <div>
          <Paper
            sx={{
              padding: 1,
              backgroundColor: `${
                allSeriesBets[selectedSeries].teamWinBet.result ===
                guessData.teamWon.guess
                  ? "#ccffcc"
                  : "#ff8080"
              }`,
            }}
          >
            <Typography className="flex justify-center text-xs">
              {guessData.teamWon.guess === 1
                ? allSeriesBets[selectedSeries].team1
                : allSeriesBets[selectedSeries].team2}
            </Typography>
          </Paper>
        </div>

        {/* PlayerMatchupGuess */}
        <div>
          <Typography className="text-md" gutterBottom>
            Player Matchups
          </Typography>
          {guessData.playerMatchups.length > 0 &&
            guessData.playerMatchups.map((matchup: any, index: number) => (
              <Paper
                key={index}
                sx={{
                  padding: 1,
                  marginBottom: 1,
                  backgroundColor: `${
                    allSeriesBets[selectedSeries].playerMatchupBets[index]
                      .result == matchup.guesses[0].guess
                      ? "#ccffcc"
                      : "#ff8080"
                  }`,
                }}
              >
                <Typography className="flex justify-center text-xs">
                  {matchup.guesses[0].guess === 1
                    ? matchup.player1
                    : matchup.player2}
                </Typography>
              </Paper>
            ))}
        </div>
      </div>
    );
  };
  const getFantasyPoints = (userId: string) => {
    const user = users?.find((user) => user.id === userId);
    return user?.fantasyPoints;
  };
  const SearchIcon = () => (
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
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      />
    </svg>
  );

  return (
    <div className="flex flex-col items-center space-y-4">
      <h1 className="text-2xl font-semibold underline mb-2">
        Users comparison
      </h1>
      {/* Custom Select for Users */}
      <div className="flex justify-evenly  space-x-4 mb-4 w-full ">
        {series && (
          <div className="w-1/3 mr-4">
            <FormControl fullWidth>
              <InputLabel>Select Series</InputLabel>
              <CustomSelectInput
                id="1"
                value={selectedSeriesName}
                label="select series"
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
        {users && (
          <div className="flex justify-between  w-1/2 space-x-4 items-center mb-2">
            <div className="grid grid-cols-3 w-1/2 gap-1">
              {suggestedUsers &&
                Object.keys(suggestedUsers).map((userId) => (
                  <div className="flex flex-row">
                    <button
                      value={userId}
                      className="rounded-2xl p-1 truncate border-slate-200 text-black opacity-1 border-2 hover:bg-slate-200"
                      onClick={(e) => handleUserSelection(e.target.value)}
                    >
                      {userId === currentUser?.id
                        ? "You"
                        : suggestedUsers[userId]}
                    </button>
                  </div>
                ))}
            </div>
            <div className="w-1/4 ">
              <Autocomplete
                freeSolo
                onChange={(event, newValue) => {
                  handleUserSelection(newValue.id);
                }}
                options={users}
                getOptionLabel={(option) =>
                  `${option.firstName} ${option.lastName}`
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "1rem", // Round the border of the input field
                      },
                    }}
                    label="Search Users"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <InputAdornment position="end">
                          <SearchIcon /> {/* Replace with any icon */}
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              ></Autocomplete>
              {/* <FormControl fullWidth>
                <InputLabel> Add User</InputLabel>
                <CustomSelectInput
                  id="select-user"
                  value={""}
                  label="User to compare"
                  onChange={(e) => handleUserSelection(e.target.value)}
                  optionsForCompare={users.map((user) => ({
                    id: user.id, // Set the user id as value
                    name: `${user.firstName} ${user.lastName}`, // Display full name as label
                  }))}
                  searchBar={true}
                  isDisabled={selectedSeries === ""}
                />
              </FormControl> */}
            </div>
          </div>
        )}
      </div>

      <div className="flex  w-full">
        {/* BetColumn */}
        <div className="w-1/4 mt-10 ">
          {allSeriesBets && allSeriesBets[selectedSeries] ? (
            <BetColumn betsData={allSeriesBets[selectedSeries]} />
          ) : (
            <Typography></Typography>
          )}
        </div>

        {/* Column visibility toggling */}
        <div className="flex flex-row space-x-4 w-1/2 mx-auto justify-start">
          {Object.keys(selectedUsers).map((userId, index) => (
            <div
              key={index}
              className={`w-1/${Object.keys(selectedUsers).length}`}
            >
              {/* Title and Close Button Above the Column */}
              <div className="flex justify-between mb-2">
                <p className={`${userId === currentUser?.id ? "bg-colors-select-bet border-colors-select-bet": "border-slate-200"} rounded-2xl p-1  text-black opacity-1 border-2`}>
                  {userId === currentUser?.id
                        ? "You"
                        : suggestedUsers[userId]}
                </p>
                <p className="p-2">{getFantasyPoints(userId)}Pts</p>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="black"
                  className="size-4 cursor-pointer mt-3"
                  onClick={() => handleClose(userId)}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </div>

              <div className="flex flex-col">
                <GuessColumn guessData={usersGuesses[userId]} />
                {/* {usersGuesses[userId].map((row, rowIndex) => (
                      <div key={rowIndex}>
                        <Paper
                          className="flex justify-center p-2 hover:opacity-80 text-sm"
                          sx={{
                            backgroundColor: `rgb(1,130,202,${
                              opacity + (1 / rows.length) * rowIndex
                            })`,
                            borderRadius: "4px",
                          }}
                        >
                          {row}
                        </Paper>
                      </div>
                    ))} */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComparingPage;
