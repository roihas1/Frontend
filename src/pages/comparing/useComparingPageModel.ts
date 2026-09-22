import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AutocompleteInputChangeReason, useMediaQuery, useTheme } from "@mui/material";
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

export type CompareNavigationUser = Pick<
  User,
  | "id"
  | "username"
  | "firstName"
  | "lastName"
  | "fantasyPoints"
  | "championPoints"
>;

function compareNavUserToUser(partial: CompareNavigationUser): User {
  return {
    ...partial,
    role: "",
    email: "",
    isActive: true,
    bestOf7Guesses: [],
    teamWinGuesses: [],
    playerMatchupGuesses: [],
  };
}

function formatUserDisplayName(user: User | undefined, userId: string): string {
  if (!user) {
    return userId;
  }
  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  return fullName || user.username || userId;
}

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

type ComparisonSeriesCatalogEntry = {
  id: string;
  team1: string;
  team2: string;
  round: string;
  startDate: string;
  timeOfStart: string;
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
  const compareTargetUser = location.state?.secondUser as
    | CompareNavigationUser
    | undefined;
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
  const selectedUsersRef = useRef(selectedUsers);
  /** Prevents repeated init + GET /private-league/.../users when callbacks churn after overrideUsers loads. */
  const comparisonSecondUserInitRef = useRef<string | undefined>(undefined);
  const defaultLeagueInitRef = useRef(false);
  const inFlightChampRefetchesRef = useRef<Set<string>>(new Set());

  const queryClient = useQueryClient();

  useEffect(() => {
    selectedUsersRef.current = selectedUsers;
  }, [selectedUsers]);

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

  const seriesCatalog = useMemo((): ComparisonSeriesCatalogEntry[] => {
    const raw = comparisonData?.seriesCatalog;
    return Array.isArray(raw) ? (raw as ComparisonSeriesCatalogEntry[]) : [];
  }, [comparisonData]);

  const {
    data: selectedSeriesBetsRaw,
    isLoading: isLoadingSeriesBets,
    isFetching: isFetchingSeriesBets,
    isFetched: isSeriesBetsFetched,
  } = useQuery({
    queryKey: ["series-bets", selectedSeries, selectedTournamentId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/series/${selectedSeries}/bets`);
      return response.data;
    },
    enabled: Boolean(selectedSeries) && Boolean(selectedTournamentId),
    staleTime: 3 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const allSeriesBets = useMemo((): Record<string, SeriesBetsWithSchedule> => {
    if (!selectedSeries || !selectedSeriesBetsRaw) {
      return {};
    }
    return {
      [selectedSeries]: normalizeComparisonBetsEntry(
        selectedSeriesBetsRaw as Record<string, unknown>,
      ),
    };
  }, [selectedSeries, selectedSeriesBetsRaw]);

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
    const base: { [key: string]: User } = {};
    if (currentUser) {
      base[currentUser.id] = currentUser;
    }
    if (compareTargetUser) {
      base[compareTargetUser.id] = compareNavUserToUser(compareTargetUser);
    }
    if (overrideUsers) {
      return { ...base, ...overrideUsers };
    }
    return base;
  }, [currentUser, overrideUsers, compareTargetUser]);

  const series = useMemo(() => {
    const result: { [key: string]: string } = {};
    for (const entry of seriesCatalog) {
      result[entry.id] = `${entry.team1} vs ${entry.team2} (${entry.round})`;
    }
    return result;
  }, [seriesCatalog]);

  const overallAutocompleteOptions = useMemo(() => {
    const byId = new Map<string, User>();
    for (const user of searchResults) {
      byId.set(user.id, user);
    }
    for (const userId of Object.keys(selectedUsers)) {
      const user = users[userId];
      if (user && !byId.has(userId)) {
        byId.set(userId, user);
      }
    }
    return Array.from(byId.values());
  }, [searchResults, selectedUsers, users]);

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

  const selectedUserIds = useMemo(
    () => Object.keys(selectedUsers).sort(),
    [selectedUsers],
  );
  const selectedUserIdsKey = useMemo(
    () => selectedUserIds.join("|"),
    [selectedUserIds],
  );

  const debouncedSearch = useMemo(
    () =>
      debounce(async (query: string) => {
        try {
          if (query.trim().length < 2) {
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

  const handleSearchInputChange = useCallback(
    (
      _event: React.SyntheticEvent,
      value: string,
      reason: AutocompleteInputChangeReason,
    ) => {
      if (reason === "reset") {
        return;
      }
      debouncedSearch(value);
    },
    [debouncedSearch],
  );

  const loadLeagueUsers = useCallback(
    async (
      leagueArg: League,
      extraUsers?: Record<string, User>,
    ): Promise<Record<string, User>> => {
      const shouldPreserveSelectedUsers = showChampSelection;
      const previousSelectedUsers = selectedUsers;
      if (!shouldPreserveSelectedUsers) {
        setSelectedUsers({});
        isCurrentUserSelected.current = false;
      }
      setSelectedLeague(leagueArg);

      try {
        let nextUsers: { [key: string]: User } = {};
        if (leagueArg.name !== "Overall") {
          const response = await axiosInstance.get(
            `/private-league/${leagueArg.id}/users`,
          );
          const allUsers: { [key: string]: User } = {};
          response.data.forEach((user: User) => {
            allUsers[user.id] = user;
          });
          nextUsers = allUsers;
        } else {
          nextUsers = currentUser ? { [currentUser.id]: currentUser } : {};
          setSearchResults([]);
        }

        if (extraUsers) {
          nextUsers = { ...nextUsers, ...extraUsers };
        }

        setOverrideUsers(nextUsers);

        if (shouldPreserveSelectedUsers) {
          const nextSelectedUsers = Object.keys(previousSelectedUsers).reduce(
            (acc, userId) => {
              if (nextUsers[userId]) {
                acc[userId] = previousSelectedUsers[userId];
              }
              return acc;
            },
            {} as { [key: string]: string },
          );
          setSelectedUsers(nextSelectedUsers);
          isCurrentUserSelected.current = Boolean(
            currentUser?.id && nextSelectedUsers[currentUser.id],
          );
        }

        return nextUsers;
      } catch {
        showError("Server error.");
        return {};
      }
    },
    [
      showChampSelection,
      selectedUsers,
      currentUser,
      showError,
    ],
  );

  const handleUserSelection = useCallback(
    async (
      userId: string,
      seriesId?: string,
      forceRefetch = false,
      usersLookup?: Record<string, User>,
    ) => {
      const selectedUsersSnapshot = selectedUsersRef.current;
      const effectiveSeriesIdForBets = seriesId ?? selectedSeries;
      if (
        showSeriesSelection &&
        effectiveSeriesIdForBets &&
        !allSeriesBets[effectiveSeriesIdForBets]
      ) {
        // Explicit seriesId (series switch): guess fetch does not need bets in memory yet.
        if (!seriesId) {
          const waitingForSeriesBetsQuery =
            effectiveSeriesIdForBets === selectedSeries &&
            (isLoadingSeriesBets ||
              isFetchingSeriesBets ||
              !isSeriesBetsFetched);
          if (waitingForSeriesBetsQuery) {
            return;
          }
          showError(`No series bets available yet.`);
          return;
        }
      }
      const addingNew = !(userId in selectedUsersSnapshot);
      if (
        addingNew &&
        Object.keys(selectedUsersSnapshot).length >= maxSelectedUsers
      ) {
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

      let champRefetchKey: string | null = null;
      if (showChampSelection && forceRefetch) {
        champRefetchKey = `${selectedStage}:${userId}:${selectedTournamentId ?? "no-tournament"}`;
        if (inFlightChampRefetchesRef.current.has(champRefetchKey)) {
          return;
        }
        inFlightChampRefetchesRef.current.add(champRefetchKey);
      }

      setIsLoadingUser(true);
      try {
        const lookup = usersLookup ?? users;
        const user = lookup[userId];
        const name = formatUserDisplayName(user, userId);
        const shouldForceRefetch = !!seriesId || forceRefetch;

        if (!(userId in selectedUsersSnapshot) || shouldForceRefetch) {
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
              "champComparisonGuesses",
              isCurrentUser ? "self" : "user",
              selectedStage,
              userId,
              selectedTournamentId,
            ];
            const cached = await queryClient.ensureQueryData({
              queryKey,
              queryFn: async () => {
                const response = await axiosInstance.get(
                  `playoffs-stage/getUserGuesses/${selectedStage}/${userId}`,
                );
                return response.data;
              },
              staleTime: 5 * 60 * 1000,
              gcTime: 10 * 60 * 1000,
            });

            setUserChampGuesses((prev) => ({
              ...prev,
              [userId]: cached as UserChampGuessesMap[string],
            }));
          }

          setSelectedUsers((prevSelectedUsers) => {
            if (prevSelectedUsers[userId] === name) {
              if (isCurrentUser) {
                isCurrentUserSelected.current = true;
              }
              return prevSelectedUsers;
            }

            if (!isCurrentUserSelected.current && isCurrentUser) {
              isCurrentUserSelected.current = true;
              return {
                [userId]: name,
                ...prevSelectedUsers,
              };
            }

            if (isCurrentUser) {
              isCurrentUserSelected.current = true;
            }
            return {
              ...prevSelectedUsers,
              [userId]: name,
            };
          });
        }
      } catch (error) {
        console.log(error);
        showError(`Failed to select user`);
      } finally {
        if (champRefetchKey) {
          inFlightChampRefetchesRef.current.delete(champRefetchKey);
        }
        setIsLoadingUser(false);
      }
    },
    [
      allSeriesBets,
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
      isLoadingSeriesBets,
      isFetchingSeriesBets,
      isSeriesBetsFetched,
    ],
  );

  useEffect(() => {
    if (
      !isCurrentUserSelected.current &&
      selectedSeries &&
      allSeriesBets[selectedSeries] &&
      currentUser?.id
    ) {
      void handleUserSelection(currentUser.id);
    }
  }, [currentUser?.id, selectedSeries, allSeriesBets, handleUserSelection]);

  useEffect(() => {
    if (isLoadingComparison || !comparisonData || defaultLeagueInitRef.current) {
      return;
    }
    defaultLeagueInitRef.current = true;
    const targetLeague =
      league ??
      (comparisonData.userLeagues?.[0] as League | undefined);
    if (targetLeague) {
      void loadLeagueUsers(targetLeague);
    }
  }, [isLoadingComparison, comparisonData, league, loadLeagueUsers]);

  useEffect(() => {
    if (!showSeriesSelection || !seriesCatalog.length || selectedSeries) {
      return;
    }
    const first = seriesCatalog[0];
    setSelectedSeries(first.id);
    setSelectedSeriesName(`${first.team1} vs ${first.team2} (${first.round})`);
  }, [showSeriesSelection, seriesCatalog, selectedSeries]);

  const setInitialsComprison = useCallback(async () => {
    setIsLoadingInitial(true);
    const firstCatalog = seriesCatalog[0];
    if (!firstCatalog) {
      showError(`No Series has Ended`);
      setIsLoadingInitial(false);
      return;
    }
    const seriesKey = firstCatalog.id;
    setSelectedSeries(seriesKey);
    setSelectedSeriesName(
      `${firstCatalog.team1} vs ${firstCatalog.team2} (${firstCatalog.round})`,
    );
    setShowSeriesSelection(true);

    const extraUsers =
      compareTargetUser && secondUserId === compareTargetUser.id
        ? { [compareTargetUser.id]: compareNavUserToUser(compareTargetUser) }
        : undefined;

    let usersLookup: Record<string, User> = {};
    if (league) {
      usersLookup = await loadLeagueUsers(league, extraUsers);
    } else if (extraUsers) {
      usersLookup = extraUsers;
      setOverrideUsers(extraUsers);
    }

    await Promise.all([
      handleUserSelection(
        currentUser?.id ?? "",
        seriesKey,
        false,
        usersLookup,
      ),
      secondUserId
        ? handleUserSelection(secondUserId, seriesKey, false, usersLookup)
        : Promise.resolve(),
    ]);
    setIsLoadingInitial(false);
  }, [
    seriesCatalog,
    league,
    loadLeagueUsers,
    handleUserSelection,
    currentUser?.id,
    secondUserId,
    compareTargetUser,
    showError,
  ]);

  useEffect(() => {
    comparisonSecondUserInitRef.current = undefined;
    defaultLeagueInitRef.current = false;
  }, [secondUserId, selectedTournamentId]);

  useEffect(() => {
    if (
      !isLoadingComparison &&
      seriesCatalog.length > 0 &&
      selectedSeries &&
      selectedSeriesBetsRaw &&
      secondUserId &&
      comparisonSecondUserInitRef.current !== secondUserId
    ) {
      comparisonSecondUserInitRef.current = secondUserId;
      void setInitialsComprison();
    }
  }, [
    isLoadingComparison,
    seriesCatalog,
    selectedSeries,
    selectedSeriesBetsRaw,
    secondUserId,
    setInitialsComprison,
  ]);

  const removeUser = (obj: { [key: string]: string }, keyToRemove: string) => {
    const { [keyToRemove]: removedUser, ...newObj } = obj;
    void removedUser;
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
      for (const userId of selectedUserIds) {
        void handleUserSelection(userId, undefined, true);
      }
    }
  }, [
    selectedStage,
    showChampSelection,
    selectedUserIds,
    selectedUserIdsKey,
    handleUserSelection,
  ]);

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

  const pageLoading =
    loading || isLoadingComparison || (Boolean(selectedSeries) && isLoadingSeriesBets);

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
    overallAutocompleteOptions,
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
    handleSearchInputChange,
    handleClearSelectedUsers,
    handleRemoveUser,
    getFantasyPoints,
  };
}
