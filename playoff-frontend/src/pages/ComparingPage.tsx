import React, { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  InputLabel,
  FormControl,
  Autocomplete,
  TextField,
  InputAdornment,
  Tooltip,
  Modal,
  Box,
} from "@mui/material";
import { useError } from "../components/ErrorProvider";
import axiosInstance from "../api/axiosInstance";
import { AllSeriesBets, checkTokenExpiration, Guess, User } from "../types";
import CustomSelectInput from "../components/form/CustomSelectInput";
import { useLocation } from "react-router-dom";

// Data for companies and their engineering levels
interface ComparingPageProps {
  secondUserId?: string;
}

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
  const location = useLocation();
  const secondUserId = location.state?.secondUserId;
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
  const [open, setOpen] = useState<boolean>(false);

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
    // console.log("Inside initial", secondId);
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
          //   console.log(`key:${key}`)
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
    // console.log(JSON.stringify(allSeriesBets));
    if (secondUserId && currentUser && allSeriesBets) {
      setInitialsComprison(secondUserId);
    }
  }, [allSeriesBets, currentUser, secondUserId]);
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
  const handleOpenModal = () => {
    setOpen(true);
  };
  const handleCloseModal = () => {
    setOpen(false);
  };
  const handleUserSelection = (userId: string, seriesId?: string) => {
    if (Object.keys(selectedUsers).length === 5) {
      showError(
        `Max participents in comparison is 5! Remove at least one user.`
      );
    }
    // Add a new column on the left when a user is selected
    try {
      if (!(userId in selectedUsers)) {
        const id = seriesId ? seriesId : selectedSeries;
        const user = users[userId];
        const name = `${user?.firstName} ${user?.lastName}`;
        //   console.log(`name: ${name} id:${id} bets:${JSON.stringify(allSeriesBets)}`)
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
              backgroundColor: `rgba(107, 144, 225,${opacity})`,
            }}
          >
            <Typography className="text-md truncate">
              Number Of Games <strong>({betsData.bestOf7Bet.result})</strong>
            </Typography>
          </Paper>
        </div>

        {/* TeamWinBet */}
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
            </Paper>
          </Tooltip>
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
                  <Typography className="text-xs truncate">
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
                    : "rgba(0,0,0,0)"
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
              <Typography className="flex truncate justify-center text-xs">
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
                <Typography className="justify-center truncate items-center text-xs">
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
              <Typography className="flex truncate justify-center text-xs">
                - Looser didn't guess -
              </Typography>
            </Paper>
          </Tooltip>
        )}
        {/* PlayerMatchupGuess */}

        <div>
          <Tooltip
            title={<Typography>Player Matchups</Typography>}
            arrow
            placement="left"
          >
            <Typography className="text-md truncate" gutterBottom>
              Player Matchups
            </Typography>
          </Tooltip>
          {guessData.playerMatchups.length > 0 &&
            guessData.playerMatchups.map((matchup: any, index: number) => {
              // Check if guesses is undefined
              if (matchup.guesses.length === 0) {
                return (
                  <Tooltip
                  key={index+10}
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
                      <Typography className="flex truncate justify-center text-xs">
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
                          ? "#ccffcc" // Green if correct
                          : "rgba(0,0,0,0)" // Transparent if not correct
                      }`,
                    }}
                  >
                    <Typography className="flex justify-center text-xs">
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
  const InstructionPaper = () => (
    <Paper
      sx={{
        padding: 3,
        marginBottom: 2,
        backgroundColor: "#f9fafb", // Lighter background for better contrast
        maxWidth: "600px",
        margin: "auto",
        borderRadius: "8px",
        boxShadow: 3, // Adding a subtle shadow to make the Paper pop
      }}
    >
      {/* Title */}
      <Typography
        className="text-2xl font-semibold text-center mb-4"
        sx={{
          fontFamily: '"Inter", sans-serif',
          fontWeight: 700,
          color: "#333", // Slightly darker text color for better readability
        }}
      >
        <strong>Welcome to User Comparison Page!</strong>
      </Typography>

      {/* Instructions Title */}
      <Typography
        className="text-lg text-left mb-5"
        sx={{
          fontFamily: '"Inter", sans-serif',
          fontWeight: 600,
          color: "#4b4b4b", // Slightly lighter than the title
        }}
      >
        Here’s a quick guide to get you started:
      </Typography>

      {/* Instruction List */}
      <ul className="text-sm text-left space-y-4">
        <li>
          <strong>1. Choose a Series:</strong> Start by selecting a series from
          the "Select Series" dropdown. This is where your comparison journey
          begins!
        </li>
        <li>
          <strong>2. Pick Users to Compare:</strong> Once you’ve selected a
          series, it’s time to choose users to compare:
          <ul className="text-sm list-disc pl-6 space-y-2 mt-2">
            <li>
              <strong>Top Users:</strong> You can quickly pick from the
              top-ranked users in the "Top 5" chart.
            </li>
            <li>
              <strong>Search Users:</strong> Want to compare someone else?
              Simply search for their name using the search bar!
            </li>
          </ul>
        </li>
        <li>
          <strong>3. See the Comparison:</strong> After choosing at least one
          user, you’ll see detailed insights into their predictions and
          performance.
        </li>
        <li>
          <strong>4. Remove Users if Needed:</strong> If you want to clean up
          your comparison, just click on the close icon next to any user’s name
          to remove them.
        </li>
      </ul>
    </Paper>
  );

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

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex flex-row items-center ">
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

      {/* Custom Select for Users */}
      <div className="flex justify-between items-center mb-4 w-full ">
        {series && (
          <div className="w-1/4 truncate mb-4 ml-8 mt-2 pt-2 ">
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
          <div className="flex space-x-5 w-3/5  items-center mb-2 mr-6">
            <h3 className="w-12 font-semibold underline">Top 5:</h3>
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
                        onClick={(e) => handleUserSelection(e.target.value)}
                        disabled={!selectedSeries}
                      >
                        {userId === currentUser?.id
                          ? "You"
                          : suggestedUsers[userId]}
                      </button>
                    </Tooltip>
                  </div>
                ))}
            </div>
            <div className="w-1/4 items-start ">
              <Autocomplete
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
                      // slotProps={{
                      //   input: {
                      //     ...params.InputProps,
                      //     endAdornment: (
                      //       <InputAdornment position="end">
                      //         <SearchIcon /> {/* Replace with any icon */}
                      //       </InputAdornment>
                      //     ),
                      //   },
                      // }}
                    />
                    <SearchIcon />
                  </div>
                )}
              ></Autocomplete>
            </div>
          </div>
        )}
      </div>
      {!selectedSeries && !selectedSeriesName && <InstructionPaper />}
      {selectedSeriesName && (
        <h1 className="text-2xl font-semibold text-black mb-10 text-center shadow-md p-4 rounded-2xl ">
          {selectedSeriesName}
        </h1>
      )}
      <div className="flex w-full pl-8">
        {/* BetColumn */}
        <div className="w-1/4  mt-12">
          {allSeriesBets && allSeriesBets[selectedSeries] ? (
            <BetColumn betsData={allSeriesBets[selectedSeries]} />
          ) : (
            <Typography></Typography>
          )}
        </div>

        {/* Column visibility toggling */}
        <div className="flex flex-row space-x-4 w-1/2 mx-8 justify-start">
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
                  <GuessColumn guessData={usersGuesses[userId]} />
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
