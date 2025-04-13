import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Typography,
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
  Checkbox,
  CircularProgress,
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
import { League } from "./LeagueSelectionPage";
import debounce from "lodash/debounce";
import BetColumn from "../components/forPages/BetColumn";
import GuessColumn from "../components/forPages/GuessColumn";

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
  const [isLoadingBets, setIsLoadingBets] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingStages, setIsLoadingStages] = useState(true);
  const [isLoadingInitial, setIsLoadingInitial] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const location = useLocation();
  const [secondUserId] = useState<string>(location.state?.secondUserId);

  const league = location.state?.league;
  const [currentUser, setCurrentUser] = useState<User>();
  const [usersGuesses, setUsersGuesses] = useState<{
    [key: string]: {
      bestOf7: Guess;
      teamWon: Guess;
      playerMatchups: object[];
      spontaneousGuesses: object[];
    };
  }>();

  const [open, setOpen] = useState<boolean>(false);
  const [showSeriesSelection, setShowSeriesSelection] = useState<boolean>(true);
  const [showChampSelection, setShowChampSelection] = useState<boolean>(false);
  const [comparisonType, setComparisonType] = useState<string>("Series");
  const [betsType, setBetsType] = useState<string>("Regular");
  const [passedStages, setPassedStages] = useState<string[]>([]);
  const [selectedStage, setSelectedStage] = useState<string>("");
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<League>();
  const [userChampGuessses, setUserChampGuesses] = useState<{
    [key: string]: {
      conferenceFinalGuesses: [];
      championTeamGuesses: [];
      mvpGuesses: [];
    };
  }>();
  // const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const isCurrentUserSelected = useRef<boolean>(false);
  // useEffect(() => {
  //   if (location.state?.league) {
  //     setSelectedLeague(location.state.league);
  //   }
  // }, [location.state?.league]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {
    if (!isCurrentUserSelected && allSeriesBets) {
      handleUserSelection(currentUser?.id ?? "");
    }
  }, [isCurrentUserSelected, currentUser?.id]);

  const debouncedSearch = useMemo(
    () =>
      debounce(async (query: string) => {
        try {
          if (query.trim().length < 2) {
            setSearchResults([]);
            return;
          }
          const response = await axiosInstance.get(`/auth/search`, {
            params: { query },
          });
          setSearchResults(response.data); // Only update searchResults
          console.log(response.data);
          // setUsers
          console.log(users);
          const newUsers = response.data.reduce(
            (acc: { [key: string]: User }, user: User) => {
              acc[user.id] = user;
              return acc;
            },
            {} as { [key: string]: User }
          );

          // Merge new users with existing users in state
          setUsers((prevUsers) => ({
            ...prevUsers,
            ...newUsers,
          }));
        } catch (error) {
          showError(`Failed to search users.`);
          setLoading(false);
        }
      }, 800),
    [showError]
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);
  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const query = event.target.value;
      debouncedSearch(query);
    },
    [debouncedSearch]
  );

  // const fetchUsers = async () => {
  //   setIsLoadingUsers(true);
  //   try {
  //     const response = await axiosInstance.get("/auth");
  //     const responseUser = await (await axiosInstance.get("/auth/user")).data;
  //     setCurrentUser(responseUser);

  //     if (league !== undefined && league?.name !== "Overall") {
  //       const response = await axiosInstance.get(
  //         `/private-league/${league?.id}/users`
  //       );
  //       const allUsers: { [key: string]: User } = {};
  //       response.data.map((user: User) => {
  //         allUsers[user.id] = user;
  //       });

  //       setUsers(allUsers);
  //     } else if (league !== undefined) {
  //       const allUsers: { [key: string]: User } = {};
  //       response.data.map((user: User) => {
  //         allUsers[user.id] = user;
  //       });

  //       setLeagues((prevState) =>
  //         prevState.some((state) => state.name === "Overall")
  //           ? prevState
  //           : [...prevState, league]
  //       );

  //       setUsers(allUsers);
  //     }
  //     // setSelectedLeague(league);
  //   } catch (error) {
  //     console.error("Error fetching users:", error);
  //   } finally {
  //     setIsLoadingUsers(false);
  //   }
  // };
  // const getAllBetsBySeries = useCallback(async () => {
  //   setIsLoadingBets(true);
  //   try {
  //     const response = await axiosInstance.get("/series/getAll/bets");
  //     setAllSeriesBets(response.data);

  //     const res: { [key: string]: string } = {};
  //     Object.keys(response.data).forEach((key) => {
  //       if (new Date(response.data[key].startDate) < new Date()) {
  //         res[
  //           key
  //         ] = `${response.data[key].team1} vs ${response.data[key].team2} (${response.data[key].round})`;
  //       }
  //     });
  //     setSeries(res);
  //   } catch (error) {
  //     showError("Failed.");
  //   } finally {
  //     setIsLoadingBets(false);
  //   }
  // }, [showError]);

  // const fetchStages = async () => {
  //   setIsLoadingStages(true);
  //   try {
  //     const response = await axiosInstance.get(`playoffs-stage/passedStages`);
  //     setPassedStages(response.data);
  //   } catch (error) {
  //     showError(`server error.`);
  //   } finally {
  //     setIsLoadingStages(false);
  //   }
  // };

  // const fetchLeagues = async () => {
  //   try {
  //     setLeagues([]);
  //     const response = await axiosInstance.get(`/private-league`);
  //     const newLeagues = [...response.data, { name: "Overall", users: [] }];

  //     setLeagues(newLeagues);
  //   } catch (error) {
  //     showError(`Failed to fetch Leagues`);
  //   }
  // };

  const setInitialsComprison = async () => {
    setIsLoadingInitial(true);
    let seriesKey = "";
    let name = "";
    if (!series) {
      showError(`No Series has Ended`);
      return;
    }
    for (const key of Object.keys(allSeriesBets)) {
      if (new Date(allSeriesBets[key].startDate) < new Date()) {
        name = `${allSeriesBets[key].team1} vs ${allSeriesBets[key].team2} (${allSeriesBets[key].round})`;
        seriesKey = key;
        setSelectedSeries(key);
        setSelectedSeriesName(name);
        setShowSeriesSelection(true);
        break;
      }
    }
    if (allSeriesBets && users) {
      await Promise.all([
        handleUserSelection(currentUser?.id ?? "", seriesKey),
        handleUserSelection(secondUserId, seriesKey),
      ]);
      // await handleUserSelection(currentUser?.id, seriesKey);
      // await handleUserSelection(secondUserId, seriesKey);
    }
    setSelectedLeague(league);
    setIsLoadingInitial(false);
  };
  // checkTokenExpiration();
  // useLayoutEffect(() => {
  //   console.log("location.state?.secondUserId:", location.state?.secondUserId);
  //   setSecondUserId(location.state?.secondUserId);
  //   console.log("Updated secondUserId:", secondUserId);
  // }, [location.state?.secondUserId, secondUserId]);

  useEffect(() => {
    if (
      !isLoadingStages &&
      !isLoadingBets &&
      !isLoadingUsers &&
      allSeriesBets &&
      Object.keys(allSeriesBets).length > 0 &&
      secondUserId
    ) {
      console.log("Triggering setInitialsComprison with:", secondUserId);
      setInitialsComprison();
    }
  }, [
    isLoadingStages,
    isLoadingBets,
    isLoadingUsers,
    allSeriesBets,
    secondUserId,
  ]);
  useEffect(() => {
    const fetchComparisonPageData = async () => {
      try {
        setIsLoadingUsers(true);
        setIsLoadingBets(true);
        setIsLoadingStages(true);
  
        const response = await axiosInstance.get("/comparison-page/load");
        const {
          currentUser,
          allUsers,
          allBets,
          passedStages,
          userLeagues,
        } = response.data;
  
        // Set current user
        setCurrentUser(currentUser);
  
        // Prepare and set all users map
        const userMap: { [key: string]: User } = {};
        allUsers.forEach((user: User) => {
          userMap[user.id] = user;
        });
        setUsers(userMap);
  
        // Prepare and set series bets
        setAllSeriesBets(allBets);
        const res: { [key: string]: string } = {};
        Object.keys(allBets).forEach((key) => {
          if (new Date(allBets[key].startDate) < new Date()) {
            res[key] = `${allBets[key].team1} vs ${allBets[key].team2} (${allBets[key].round})`;
          }
        });
        setSeries(res);
  
        // Prepare and set passed stages
        setPassedStages(passedStages);
  
        // Set leagues (add "Overall" manually)
        const withOverall = [...userLeagues, { name: "Overall", users: [] }];
        setLeagues(withOverall);
  
      } catch (error) {
        showError("Failed to load comparison page data.");
      } finally {
        setIsLoadingUsers(false);
        setIsLoadingBets(false);
        setIsLoadingStages(false);
      }
    };
  
    fetchComparisonPageData();
  }, []);
  
  // useEffect(() => {
  //   const fetchAllData = async () => {
  //     try {
  //       await Promise.all([
  //         getAllBetsBySeries(),
  //         fetchLeagues(),
  //         fetchUsers(),
  //         fetchStages(),
  //       ]);
  //     } catch (error) {
  //       showError("Failed to fetch data.");
  //     }
  //   };
  //   // getAllBetsBySeries();
  //   // fetchLeagues();
  //   // fetchUsers();
  //   // fetchStages();

  //   fetchAllData();
  // }, []);

  const handleOpenModal = () => {
    setOpen(true);
  };
  const handleCloseModal = () => {
    setOpen(false);
  };
  const handleUserSelection = async (userId: string, seriesId?: string) => {
    if (!allSeriesBets || Object.keys(allSeriesBets).length === 0) {
      showError(`No series bets available yet.`);
      return;
    }
    if (Object.keys(selectedUsers).length === 5) {
      showError(
        `Max participents in comparison is 5! Remove at least one user.`
      );
      return;
    }
    setIsLoadingUser(true);
    try {
      const user = users[userId];
      const name = `${user?.firstName} ${user?.lastName}`;
      if (!(userId in selectedUsers)) {
        if (showSeriesSelection) {
          const id = seriesId ? seriesId : selectedSeries;
          // const seriesBets = allSeriesBets[id];
          const userWithGuesses = (
            await axiosInstance.get(`/series/${id}/getAllGuesses`)
          ).data;

          setUsersGuesses((prevUsersGuesses) => ({
            ...prevUsersGuesses,
            [userId]: {
              bestOf7: userWithGuesses.bestOf7,
              teamWon: userWithGuesses.teamWon,
              playerMatchups: userWithGuesses.playerMatchups,
              spontaneousGuesses: userWithGuesses.spontaneousGuesses,
            },
          }));
        } else if (showChampSelection) {
          const response = await axiosInstance.get(
            `playoffs-stage/getUserGuesses/${selectedStage}/${userId}`
          );

          setUserChampGuesses((prevUserChampGuesses) => ({
            ...prevUserChampGuesses,
            [userId]: {
              conferenceFinalGuesses: response.data.conferenceFinalGuesses,
              championTeamGuesses: response.data.championTeamGuesses,
              mvpGuesses: response.data.mvpGuesses,
            },
          }));
        }

        if (!isCurrentUserSelected.current && userId === currentUser?.id) {
          setSelectedUsers((prevSelectedUsers) => ({
            [userId]: name,
            ...prevSelectedUsers,
          }));
          isCurrentUserSelected.current = true;
        } else {
          setSelectedUsers((prevSelectedUsers) => ({
            ...prevSelectedUsers,
            [userId]: name,
          }));
        }
      }
      setIsLoadingUser(false);
      return false;
    } catch (error) {
      console.log(error);
      showError(`Failed to select user`);
    }
  };
  const removeUser = (obj: { [key: string]: string }, keyToRemove: string) => {
    const { [keyToRemove]: _, ...newObj } = obj;
    return newObj;
  };
  const handleRemoveUser = (userId: string) => {
    isCurrentUserSelected.current =
      userId === currentUser?.id ? false : isCurrentUserSelected.current;
    setSelectedUsers((prevSelectedUser) =>
      removeUser(prevSelectedUser, userId)
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
  // useEffect(() => {
  //   if (!showSeriesSelection) {
  //     // This code will run after showSeriesSelection becomes false
  //     if (selectedStage && !isCurrentUserSelected.current) {
  //       isCurrentUserSelected.current = true;
  //       handleUserSelection(currentUser?.id);
  //     } else {
  //       setSelectedUsers({});
  //     }
  //   }
  // }, [showSeriesSelection]);

  // useEffect(() => {
  //   if (!loading && showSeriesSelection) {
  //     // This code will run after showSeriesSelection becomes true
  //     if (selectedSeries) {
  //       handleUserSelection(currentUser?.id);
  //     } else {
  //       setSelectedUsers({});
  //     }
  //   }
  // }, [showSeriesSelection]);
  const handleChangeType = (event: React.ChangeEvent<HTMLInputElement>) => {
    setComparisonType(event.target.value);
    setSelectedUsers({});
    isCurrentUserSelected.current = false;
    setSelectedLeague(undefined);

    switch (event.target.value) {
      case "Champ":
        setShowSeriesSelection(false);
        setShowChampSelection(true);
        setSelectedSeries("");
        setSelectedSeriesName("");
        break;
      case "Series":
        setShowSeriesSelection(true);
        setShowChampSelection(false);
        setSelectedStage("");

        break;
    }
  };
  const handleBetsType = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBetsType(event.target.value);
  };
  // useEffect(() => {
  //   if (selectedStage && !isCurrentUserSelected.current) {
  //     isCurrentUserSelected.current = true;
  //     handleUserSelection(currentUser?.id);
  //   }
  // }, [selectedStage]);
  const handleStageSelection = (event: SelectChangeEvent<string>) => {
    setSelectedStage(event.target.value);
  };
  const handleClearSelectedUsers = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    setSelectedUsers({});
    isCurrentUserSelected.current = false;
  };
  const handleSelectionUsers = (users: Array<User>) => {
    const ids = users.map((user) => user.id);

    if (ids.length > Object.keys(selectedUsers).length) {
      if (!ids.includes(currentUser?.id ?? "")) {
        handleUserSelection(currentUser?.id ?? "");
      }

      for (const id of ids) {
        if (!(id in selectedUsers)) {
          if (selectedSeries || selectedStage) {
            handleUserSelection(id);
          } else {
            showError(`Choose Series or Stage First!`);
          }
        }
      }
    } else {
      for (const id of Object.keys(selectedUsers)) {
        if (!ids.includes(id)) {
          handleRemoveUser(id);
        }
      }
    }
  };

  useEffect(() => {
    if (selectedLeague) {
      const validSelectedUsers = Object.keys(selectedUsers).reduce(
        (acc, userId) => {
          if (users[userId]) {
            acc[userId] = selectedUsers[userId];
          }
          return acc;
        },
        {} as { [key: string]: string }
      );

      setSelectedUsers(validSelectedUsers);

      // Ensure the current user is selected
      if (!isCurrentUserSelected.current) {
        isCurrentUserSelected.current = true;
        handleUserSelection(currentUser?.id ?? "");
      }
    }
  }, [selectedLeague, users]);

  const handleLeagueSelection = async (event: SelectChangeEvent<string>) => {
    setSelectedUsers({});
    isCurrentUserSelected.current = false;
    const foundLeague = leagues.filter((l) => l.name === event.target.value);
    // handleUserSelection(currentUser?.id);
    setSelectedLeague(foundLeague[0]);
    try {
      if (foundLeague[0].name !== "Overall") {
        const response = await axiosInstance.get(
          `/private-league/${foundLeague[0].id}/users`
        );
        const allUsers: { [key: string]: User } = {};
        response.data.map((user: User) => {
          allUsers[user.id] = user;
        });

        setUsers(allUsers);
      } else {
        if (currentUser?.id) {
          setUsers({ [currentUser.id]: currentUser });
        } else {
          setUsers({});
        }
      }
    } catch (error) {
      showError(`Server error.`);
    }
  };
  // useEffect(() => {
  //   if (Object.keys(selectedUsers).length === 0) {
  //     isCurrentUserSelected.current = false;
  //   }
  // }, [isCurrentUserSelected, selectedUsers]);

  // useEffect(() => {
  //   // Only run if selectedUsers is empty and selectedSeries is set
  //   if (
  //     Object.keys(selectedUsers).length === 0 &&
  //     selectedSeries &&
  //     !isCurrentUserSelected.current
  //   ) {
  //     isCurrentUserSelected.current = true;
  //     handleUserSelection(currentUser?.id ?? "", selectedSeries);
  //   }
  // }, [selectedUsers, selectedSeries, currentUser]);

  const handleSeriesSelection = (seriesId: string) => {
    setBetsType("Regular");
    setSelectedSeries(seriesId);
    setSelectedSeriesName(series?.[seriesId] ?? "");
    setSelectedUsers({});
    isCurrentUserSelected.current = false;
  };
  if (
    loading ||
    isLoadingBets ||
    isLoadingInitial ||
    isLoadingStages ||
    isLoadingUsers
  ) {
    return (
      <div className="fixed inset-0 flex justify-center items-center  z-50">
        <CircularProgress />
      </div>
    );
  }
  if (isMobile) {
    return (
      <p className="text-center text-gray-700 mt-4">
        🛑 User comparison is only available on desktop.
      </p>
    );
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
          <div className="w-1/5 truncate mb-4 ml-8 mt-2 pt-2 ">
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
                      handleSeriesSelection(key);
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
          <div className="w-1/5 truncate mb-4 ml-8 mt-2 pt-2 ">
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
        {leagues.length > 0 && (
          <div className="w-1/5 truncate mb-4 mx-8 mt-2 pt-2 ">
            <FormControl fullWidth>
              <InputLabel>Select League</InputLabel>
              <CustomSelectInput
                id="league"
                value={selectedLeague?.name ?? ""}
                label={leagues.length === 0 ? "- No Leagues -" : "Leagues"}
                onChange={handleLeagueSelection}
                options={leagues.map((league) => league.name)}
              />
            </FormControl>
          </div>
        )}
        {users && (
          <div className="flex space-x-5 w-2/5  items-center mb-2 mr-6">
            <div className="w-3/4 items-start ">
              {selectedLeague?.name !== "Overall" && (
                <Autocomplete
                  multiple
                  options={Object.values(users)}
                  disableCloseOnSelect
                  getOptionLabel={(option) =>
                    `${option.firstName} ${option.lastName}`
                  }
                  value={Object.keys(selectedUsers)
                    .map(
                      (id) =>
                        Object.values(users).find((user) => user.id === id)!
                    )
                    .filter(Boolean)}
                  onChange={(event, newValues) => {
                    event.preventDefault();
                    handleSelectionUsers(newValues);
                  }}
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
              )}
              {selectedLeague?.name === "Overall" && (
                <Autocomplete
                  multiple
                  options={searchResults}
                  disableCloseOnSelect
                  getOptionLabel={(option) =>
                    `${option.firstName} ${option.lastName}`
                  }
                  value={Object.keys(selectedUsers)
                    .map(
                      (id) =>
                        Object.values(users).find((user) => user.id === id)!
                    )
                    .filter(Boolean)}
                  onChange={(event, newValues) => {
                    event.preventDefault();
                    handleSelectionUsers(newValues);
                  }}
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
                        onChange={handleSearchChange}
                        label="Search Users"
                        margin="normal"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "1rem",
                          },
                        }}
                      />
                      <SearchIcon />
                    </div>
                  )}
                />
              )}
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
      {isLoadingInitial && <CircularProgress />}
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
                {allSeriesBets[selectedSeries].spontaneousBets.length > 0 && (
                  <FormControlLabel
                    value="Spontaneous"
                    control={<Radio size="small" color="default" />}
                    label="Spontaneous"
                  />
                )}
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
          {/* {Object.keys(users).map((id)=> <p>{id}</p>)} */}
          {Object.keys(users).length > 0 &&
            Object.keys(selectedUsers).map((userId, index) => {
              console.log(users);
              const userName = `${users?.[userId].firstName} ${users?.[userId].lastName}`;
              const firstName = users?.[userId].firstName;
              const lastName = users?.[userId].lastName;
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
                        allSeriesBets={allSeriesBets}
                        selectedSeries={selectedSeries}
                        isLoading={isLoadingUser}
                      />
                    ) : userChampGuessses?.[userId] ? (
                      <ChampGuessColumn guessData={userChampGuessses[userId]} />
                    ) : (
                      <p> No guess data available</p> // Placeholder for undefined data
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
