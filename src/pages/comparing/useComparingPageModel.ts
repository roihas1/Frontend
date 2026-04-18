import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useMediaQuery, useTheme } from "@mui/material";
import { useError } from "../../components/providers&context/ErrorProvider";
import axiosInstance from "../../api/axiosInstance";
import { Guess, User } from "../../types";
import { useLocation } from "react-router-dom";
import { League } from "../LeagueSelectionPage";
import debounce from "lodash/debounce";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTournament } from "../../components/providers&context/TournamentContext";
import {
  normalizeComparisonBetsEntry,
  SeriesBetsWithSchedule,
} from "./comparisonNormalize";

export type UsersGuessesMap = {
  [key: string]: {
    bestOf7: Guess;
    teamWon: Guess;
    playerMatchups: object[];
    spontaneousGuesses: object[];
  };
};

export type UserChampGuessesMap = {
  [key: string]: {
    conferenceFinalGuesses: [];
    championTeamGuesses: [];
    mvpGuesses: [];
  };
};

export function useComparingPageModel() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const maxSelectedUsers = isMobile ? 3 : 5;

  const { showError } = useError();
  const { selectedTournamentId } = useTournament();
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedSeries, setSelectedSeries] = useState<string>("");
  const [selectedSeriesName, setSelectedSeriesName] = useState<string>("");
  const [selectedUsers, setSelectedUsers] = useState<{ [key: string]: string }>(
    {},
  );
  const [isLoadingInitial, setIsLoadingInitial] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const location = useLocation();
  const [secondUserId] = useState<string | undefined>(
    location.state?.secondUserId,
  );

  const league = location.state?.league as League | undefined;
  const [usersGuesses, setUsersGuesses] = useState<UsersGuessesMap>();

  const [open, setOpen] = useState<boolean>(false);
  const [showSeriesSelection, setShowSeriesSelection] = useState<boolean>(true);
  const [showChampSelection, setShowChampSelection] = useState<boolean>(false);
  const [comparisonType, setComparisonType] = useState<string>("Series");
  const [betsType, setBetsType] = useState<string>("Regular");
  const [selectedStage, setSelectedStage] = useState<string>("");
  const [selectedLeague, setSelectedLeague] = useState<League>();
  const [userChampGuesses, setUserChampGuesses] =
    useState<UserChampGuessesMap>();
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const isCurrentUserSelected = useRef<boolean>(false);
  /** Prevents repeated init + GET /private-league/.../users when callbacks churn after overrideUsers loads. */
  const comparisonSecondUserInitRef = useRef<string | undefined>(undefined);

  const queryClient = useQueryClient();

  const {
    data: comparisonData,
    isLoading: isLoadingComparison,
    isError: isComparisonError,
  } = useQuery({
    queryKey: ["comparison-page", selectedTournamentId],
    queryFn: async () => {
      const response = await axiosInstance.get("/comparison-page/load");
      return response.data;
    },
    enabled: Boolean(selectedTournamentId),
    staleTime: 3 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const allSeriesBets = useMemo((): Record<string, SeriesBetsWithSchedule> => {
    const raw = comparisonData?.allBets as
      | Record<string, Record<string, unknown>>
      | undefined;
    if (!raw) return {};
    return Object.fromEntries(
      Object.entries(raw).map(([id, entry]) => [
        id,
        normalizeComparisonBetsEntry(entry),
      ]),
    ) as Record<string, SeriesBetsWithSchedule>;
  }, [comparisonData]);

  useEffect(() => {
    if (isComparisonError) {
      showError("Failed to load comparison page data.");
    }
  }, [isComparisonError, showError]);

  const currentUser = useMemo(
    () => comparisonData?.currentUser as User | undefined,
    [comparisonData],
  );

  const [overrideUsers, setOverrideUsers] = useState<{
    [key: string]: User;
  } | null>(null);

  const users = useMemo(() => {
    if (overrideUsers) return overrideUsers;
    if (!comparisonData?.allUsers) return {};
    const userMap: { [key: string]: User } = {};
    comparisonData.allUsers.forEach((user: User) => {
      userMap[user.id] = user;
    });
    return userMap;
  }, [comparisonData, overrideUsers]);

  const series = useMemo(() => {
    const result: { [key: string]: string } = {};
    for (const [key, value] of Object.entries(allSeriesBets)) {
      const timeOfStart = value.timeOfStart;
      if (!value.startDate || !timeOfStart) continue;

      const [hours, minutes] = timeOfStart.split(":").map(Number);
      const dateWithTime = new Date(value.startDate);
      dateWithTime.setHours(hours);
      dateWithTime.setMinutes(minutes);
      dateWithTime.setSeconds(0);
      dateWithTime.setMilliseconds(0);

      if (dateWithTime < new Date()) {
        result[key] = `${value.team1} vs ${value.team2} (${value.round})`;
      }
    }
    return result;
  }, [allSeriesBets]);

  const passedStages = useMemo(
    () => comparisonData?.passedStages || [],
    [comparisonData],
  );

  const leagues = useMemo(() => {
    if (!comparisonData) return [];
    const raw = comparisonData as Record<string, unknown>;
    const list =
      (Array.isArray(raw.userLeagues) ? raw.userLeagues : null) ??
      (Array.isArray(raw.user_leagues) ? raw.user_leagues : null) ??
      [];
    return [...(list as League[]), { name: "Overall", users: [] }];
  }, [comparisonData]);

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
          setSearchResults(response.data);

          const newUsers = response.data.reduce(
            (acc: { [key: string]: User }, user: User) => {
              acc[user.id] = user;
              return acc;
            },
            {} as { [key: string]: User },
          );

          setOverrideUsers((prev) => ({
            ...(prev ?? {}),
            ...newUsers,
          }));
        } catch {
          showError(`Failed to search users.`);
          setLoading(false);
        }
      }, 800),
    [showError],
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      debouncedSearch(event.target.value);
    },
    [debouncedSearch],
  );

  const loadLeagueUsers = useCallback(
    async (leagueArg: League) => {
      setSelectedUsers({});
      isCurrentUserSelected.current = false;
      setSelectedLeague(leagueArg);

      try {
        if (leagueArg.name !== "Overall") {
          const response = await axiosInstance.get(
            `/private-league/${leagueArg.id}/users`,
          );
          const allUsers: { [key: string]: User } = {};
          response.data.forEach((user: User) => {
            allUsers[user.id] = user;
          });
          setOverrideUsers(allUsers);
        } else {
          if (secondUserId && currentUser?.id) {
            const secondFromComparison = (
              comparisonData?.allUsers as User[] | undefined
            )?.find((u) => u.id === secondUserId);
            setOverrideUsers({
              [currentUser.id]: currentUser,
              ...(secondFromComparison
                ? { [secondUserId]: secondFromComparison }
                : {}),
            });
          } else if (currentUser?.id) {
            setOverrideUsers({ [currentUser.id]: currentUser });
          } else {
            setOverrideUsers({});
          }
        }
      } catch {
        showError("Server error.");
      }
    },
    [secondUserId, currentUser, comparisonData, showError],
  );

  const handleUserSelection = useCallback(
    async (userId: string, seriesId?: string, forceRefetch = false) => {
      if (!allSeriesBets || Object.keys(allSeriesBets).length === 0) {
        showError(`No series bets available yet.`);
        return;
      }
      const addingNew = !(userId in selectedUsers);
      if (addingNew && Object.keys(selectedUsers).length >= maxSelectedUsers) {
        showError(
          isMobile
            ? `You can compare up to ${maxSelectedUsers} users on mobile. Remove someone to add another.`
            : `Max participents in comparison is ${maxSelectedUsers}! Remove at least one user.`,
        );
        return;
      }

      const effectiveSeriesId = seriesId ?? selectedSeries;
      if (showSeriesSelection && !effectiveSeriesId) {
        return;
      }
      if (showChampSelection && !selectedStage) {
        return;
      }

      setIsLoadingUser(true);
      try {
        const user = users[userId];
        const name = `${user?.firstName} ${user?.lastName}`;
        const shouldForceRefetch = !!seriesId || forceRefetch;

        if (!(userId in selectedUsers) || shouldForceRefetch) {
          const isCurrentUser = userId === currentUser?.id;
          const id = seriesId ? seriesId : selectedSeries;

          if (showSeriesSelection) {
            const queryKey = [
              isCurrentUser ? "seriesGuessesSelf" : "seriesGuesses",
              id,
              userId,
              selectedTournamentId,
            ];

            const data = await queryClient.ensureQueryData({
              queryKey,
              queryFn: async () => {
                const response = await (isCurrentUser
                  ? axiosInstance.get(`/series/${id}/getAllGuesses`)
                  : axiosInstance.get(
                      `/series/${id}/getAllGuessesForUser/${userId}`,
                    ));
                return response.data;
              },
              staleTime: 5 * 60 * 1000,
              gcTime: 10 * 60 * 1000,
            });

            setUsersGuesses((prev) => ({
              ...prev,
              [userId]: data,
            }));
          } else if (showChampSelection) {
            const queryKey = [
              isCurrentUser ? "champGuessesSelf" : "champGuesses",
              selectedStage,
              userId,
              selectedTournamentId,
            ];
            let cached = queryClient.getQueryData(queryKey);

            if (!cached) {
              const { data } = await axiosInstance.get(
                `playoffs-stage/getUserGuesses/${selectedStage}/${userId}`,
              );
              cached = data;
              queryClient.setQueryDefaults(queryKey, {
                staleTime: 5 * 60 * 1000,
                gcTime: 10 * 60 * 1000,
              });
              queryClient.setQueryData(queryKey, cached);
            }

            setUserChampGuesses((prev) => ({
              ...prev,
              [userId]: cached as UserChampGuessesMap[string],
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
      } catch (error) {
        console.log(error);
        showError(`Failed to select user`);
      } finally {
        setIsLoadingUser(false);
      }
    },
    [
      allSeriesBets,
      selectedUsers,
      maxSelectedUsers,
      isMobile,
      showError,
      users,
      currentUser?.id,
      selectedSeries,
      showSeriesSelection,
      showChampSelection,
      selectedStage,
      selectedTournamentId,
      queryClient,
    ],
  );

  useEffect(() => {
    if (
      !isCurrentUserSelected.current &&
      allSeriesBets &&
      Object.keys(allSeriesBets).length > 0 &&
      currentUser?.id
    ) {
      void handleUserSelection(currentUser.id);
    }
  }, [currentUser?.id, allSeriesBets, handleUserSelection]);

  const setInitialsComprison = useCallback(async () => {
    setIsLoadingInitial(true);
    let seriesKey = "";
    if (!series || Object.keys(series).length === 0) {
      showError(`No Series has Ended`);
      setIsLoadingInitial(false);
      return;
    }
    for (const key of Object.keys(allSeriesBets)) {
      const seriesEntry = allSeriesBets[key];
      if (!seriesEntry.startDate || !seriesEntry.timeOfStart) continue;

      const [hours, minutes] = seriesEntry.timeOfStart.split(":").map(Number);
      const dateWithTime = new Date(seriesEntry.startDate);
      dateWithTime.setHours(hours);
      dateWithTime.setMinutes(minutes);
      dateWithTime.setSeconds(0);
      dateWithTime.setMilliseconds(0);

      if (dateWithTime < new Date()) {
        seriesKey = key;
        setSelectedSeries(key);
        setSelectedSeriesName(
          `${seriesEntry.team1} vs ${seriesEntry.team2} (${seriesEntry.round})`,
        );
        setShowSeriesSelection(true);
        break;
      }
    }
    if (league) {
      await loadLeagueUsers(league);
    }

    if (allSeriesBets) {
      await Promise.all([
        handleUserSelection(currentUser?.id ?? "", seriesKey),
        secondUserId
          ? handleUserSelection(secondUserId, seriesKey)
          : Promise.resolve(),
      ]);
    }
    setIsLoadingInitial(false);
  }, [
    series,
    allSeriesBets,
    league,
    loadLeagueUsers,
    handleUserSelection,
    currentUser?.id,
    secondUserId,
    showError,
  ]);

  useEffect(() => {
    comparisonSecondUserInitRef.current = undefined;
  }, [secondUserId, selectedTournamentId]);

  useEffect(() => {
    if (
      !isLoadingComparison &&
      allSeriesBets &&
      Object.keys(allSeriesBets).length > 0 &&
      secondUserId &&
      comparisonSecondUserInitRef.current !== secondUserId
    ) {
      comparisonSecondUserInitRef.current = secondUserId;
      void setInitialsComprison();
    }
  }, [isLoadingComparison, allSeriesBets, secondUserId, setInitialsComprison]);

  const removeUser = (obj: { [key: string]: string }, keyToRemove: string) => {
    const { [keyToRemove]: _, ...newObj } = obj;
    return newObj;
  };

  const handleRemoveUser = useCallback(
    (userId: string) => {
      isCurrentUserSelected.current =
        userId === currentUser?.id ? false : isCurrentUserSelected.current;
      setSelectedUsers((prevSelectedUser) =>
        removeUser(prevSelectedUser, userId),
      );
    },
    [currentUser?.id],
  );

  const getFantasyPoints = useCallback(
    (userId: string) => {
      const user = users[userId];
      return (user?.fantasyPoints ?? 0) + (user?.championPoints ?? 0);
    },
    [users],
  );

  const handleOpenModal = useCallback(() => setOpen(true), []);
  const handleCloseModal = useCallback(() => setOpen(false), []);

  const handleChangeType = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
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
    },
    [],
  );

  const handleBetsType = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setBetsType(event.target.value);
    },
    [],
  );

  useEffect(() => {
    if (selectedStage && showChampSelection) {
      for (const userId of Object.keys(selectedUsers)) {
        void handleUserSelection(userId, undefined, true);
      }
    }
  }, [selectedStage, showChampSelection, selectedUsers, handleUserSelection]);

  const handleStageSelection = useCallback(
    (event: import("@mui/material").SelectChangeEvent<string>) => {
      setSelectedStage(event.target.value);
    },
    [],
  );

  const handleClearSelectedUsers = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      setSelectedUsers({});
      isCurrentUserSelected.current = false;
    },
    [],
  );

  const handleSelectionUsers = useCallback(
    (usersList: User[]) => {
      const ids = usersList.map((user) => user.id);

      if (ids.length > maxSelectedUsers) {
        showError(
          isMobile
            ? `You can compare up to ${maxSelectedUsers} users on mobile.`
            : `Max participents in comparison is ${maxSelectedUsers}!`,
        );
        return;
      }

      if (ids.length > Object.keys(selectedUsers).length) {
        if (!ids.includes(currentUser?.id ?? "")) {
          void handleUserSelection(currentUser?.id ?? "");
        }

        for (const id of ids) {
          if (!(id in selectedUsers)) {
            if (selectedSeries || selectedStage) {
              void handleUserSelection(id);
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
    },
    [
      selectedUsers,
      maxSelectedUsers,
      isMobile,
      currentUser?.id,
      handleUserSelection,
      selectedSeries,
      selectedStage,
      showError,
      handleRemoveUser,
    ],
  );

  useEffect(() => {
    if (selectedLeague) {
      const validSelectedUsers = Object.keys(selectedUsers).reduce(
        (acc, userId) => {
          if (users[userId]) {
            acc[userId] = selectedUsers[userId];
          }
          return acc;
        },
        {} as { [key: string]: string },
      );

      setSelectedUsers(validSelectedUsers);

      if (!isCurrentUserSelected.current && currentUser?.id) {
        void handleUserSelection(currentUser.id);
      }
    }
    // handleUserSelection / selectedUsers: intentional league re-filter only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLeague, users]);

  const handleLeagueSelection = useCallback(
    async (event: import("@mui/material").SelectChangeEvent<string>) => {
      const leagueName = event.target.value;
      const foundLeague = leagues.find((l) => l.name === leagueName);
      if (foundLeague) {
        await loadLeagueUsers(foundLeague);
      }
    },
    [leagues, loadLeagueUsers],
  );

  const handleSeriesSelection = useCallback(
    (seriesId: string) => {
      setBetsType("Regular");
      setSelectedSeries(seriesId);
      setSelectedSeriesName(series[seriesId] ?? "");
      for (const userId of Object.keys(selectedUsers)) {
        void handleUserSelection(userId, seriesId);
      }
    },
    [series, selectedUsers, handleUserSelection],
  );

  const pageLoading = loading || isLoadingComparison;

  return {
    isMobile,
    maxSelectedUsers,
    pageLoading,
    comparisonData,
    allSeriesBets,
    currentUser,
    users,
    series,
    passedStages,
    leagues,
    selectedSeries,
    selectedSeriesName,
    selectedUsers,
    selectedStage,
    selectedLeague,
    usersGuesses,
    userChampGuesses,
    searchResults,
    comparisonType,
    betsType,
    showSeriesSelection,
    showChampSelection,
    open,
    isLoadingInitial,
    isLoadingUser,
    handleOpenModal,
    handleCloseModal,
    handleChangeType,
    handleBetsType,
    handleStageSelection,
    handleLeagueSelection,
    handleSeriesSelection,
    handleSelectionUsers,
    handleSearchChange,
    handleClearSelectedUsers,
    handleRemoveUser,
    getFantasyPoints,
  };
}
