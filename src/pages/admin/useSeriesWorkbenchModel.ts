import { useCallback, useEffect, useMemo, useState } from "react";
import { SelectChangeEvent } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getErrorMessage } from "../../api/getErrorMessage";
import { notify } from "../../components/common/notify";
import {
  useError,
  useSuccessMessage,
} from "../../components/providers&context/NotificationProvider";
import { useMissingBets } from "../../components/providers&context/MissingBetsContext";
import { useTournament } from "../../components/providers&context/TournamentContext";
import {
  MatchupCategory,
  PlayerMatchupBet,
  PlayerMatchupType,
  SpontaneousBet,
} from "../../types";
import { Series } from "../HomePage";
import {
  adminQueryKeys,
  bulkCreateBets,
  type BulkCreateBetsPayload,
  closeSeriesBets,
  createPlayerMatchupBet,
  createSpontaneousBet,
  deletePlayerMatchupBet,
  deleteSeries,
  deleteSpontaneousBet,
  fetchAdminSeries,
  updateMissingBetsForAllUsers,
  updatePlayerMatchupBet,
  updateSeriesGame,
  updateSeriesTime,
  updateSpontaneousBet,
} from "./adminApi";
import {
  dateOfStartToInputValue,
  flattenPlayerMatchupBets,
  groupSeriesByRound,
  parseDateAndTimeToIso,
  seriesDisplayLabel,
  seriesTeam1Name,
  seriesTeam2Name,
  startTimeToDateInput,
  toApiDateString,
} from "./adminNormalize";

export type SeriesDetailTab = "overview" | "matchup" | "spontaneous";

const VALID_TABS: SeriesDetailTab[] = ["overview", "matchup", "spontaneous"];

function emptyBet(seriesId: string): PlayerMatchupBet {
  return {
    id: "",
    seriesId,
    typeOfMatchup: PlayerMatchupType.PLAYERMATCHUP,
    categories: [],
    fantasyPoints: 2,
    player1: "",
    player2: "",
    differential: 0,
    result: 0,
    currentStats: [0, 0],
    playerGames: [0, 0],
  };
}

type ConfirmAction =
  | { type: "closeBets" }
  | { type: "deleteSeries" }
  | { type: "deleteBet"; bet: PlayerMatchupBet | SpontaneousBet; isSpontaneous: boolean }
  | null;

export function useSeriesWorkbenchModel() {
  const { seriesId: seriesIdParam, tab: tabParam } = useParams<{
    seriesId?: string;
    tab?: string;
  }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showError } = useError();
  const { showSuccessMessage } = useSuccessMessage();
  const { triggerRefresh } = useMissingBets();
  const { selectedTournamentId } = useTournament();

  const activeTab: SeriesDetailTab = VALID_TABS.includes(
    tabParam as SeriesDetailTab,
  )
    ? (tabParam as SeriesDetailTab)
    : "overview";

  const seriesQuery = useQuery({
    queryKey: adminQueryKeys.series(selectedTournamentId),
    queryFn: fetchAdminSeries,
    enabled: Boolean(selectedTournamentId),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const seriesList = useMemo(
    () => seriesQuery.data ?? [],
    [seriesQuery.data],
  );

  const groupedSeries = useMemo(
    () => groupSeriesByRound(seriesList),
    [seriesList],
  );

  const selectedSeries = useMemo(() => {
    if (!seriesIdParam) return null;
    return seriesList.find((s) => s.id === seriesIdParam) ?? null;
  }, [seriesList, seriesIdParam]);

  const bets = useMemo(
    () => flattenPlayerMatchupBets(selectedSeries?.playerMatchupBets),
    [selectedSeries],
  );

  const spontaneousBets = useMemo(() => {
    const bets = [...(selectedSeries?.spontaneousBets ?? [])];
    bets.sort((a, b) => {
      const g = Number(a.gameNumber) - Number(b.gameNumber);
      if (g !== 0) return g;
      const tA = a.startTime ? new Date(a.startTime).getTime() : 0;
      const tB = b.startTime ? new Date(b.startTime).getTime() : 0;
      return tA - tB;
    });
    return bets;
  }, [selectedSeries]);

  const [selectedBet, setSelectedBet] = useState<
    PlayerMatchupBet | SpontaneousBet
  >(emptyBet(""));
  const [isSpontaneousBet, setIsSpontaneousBet] = useState(false);
  const [createNewBet, setCreateNewBet] = useState(false);
  const [updateResultSelected, setUpdateResultSelected] = useState(false);
  const [player1Stat, setPlayer1Stat] = useState(0);
  const [player2Stat, setPlayer2Stat] = useState(0);
  const [startDateSpontaneous, setStartDateSpontaneous] = useState("");
  const [startTimeSpontaneous, setStartTimeSpontaneous] = useState("");

  const [showUpdateSeriesTime, setShowUpdateSeriesTime] = useState(false);
  const [showSeriesResultForm, setShowSeriesResultForm] = useState(false);
  const [wonTeam, setWonTeam] = useState("");
  const [editDateOfStart, setEditDateOfStart] = useState("");
  const [editTimeOfStart, setEditTimeOfStart] = useState("");

  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  useEffect(() => {
    if (seriesIdParam && tabParam && !VALID_TABS.includes(tabParam as SeriesDetailTab)) {
      navigate(`/admin/series/${seriesIdParam}/overview`, { replace: true });
    }
  }, [navigate, seriesIdParam, tabParam]);

  useEffect(() => {
    if (!selectedSeries) {
      setCreateNewBet(false);
      setUpdateResultSelected(false);
      setShowUpdateSeriesTime(false);
      setShowSeriesResultForm(false);
      setSelectedBet(emptyBet(""));
      return;
    }
    setEditDateOfStart(dateOfStartToInputValue(selectedSeries.dateOfStart));
    setEditTimeOfStart(selectedSeries.timeOfStart ?? "");
  }, [selectedSeries]);

  const invalidateSeries = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: adminQueryKeys.series(selectedTournamentId),
    });
  }, [queryClient, selectedTournamentId]);

  const closeBetsMutation = useMutation({
    mutationFn: (id: string) => closeSeriesBets(id),
    onSuccess: async () => {
      showSuccessMessage("Series bets closed.");
      setConfirmAction(null);
      navigate("/admin/series");
      await invalidateSeries();
    },
    onError: (error) => {
      const message = getErrorMessage(
        error,
        "Couldn't close series bets. Try again.",
      );
      if (message) showError(message);
    },
  });

  const deleteSeriesMutation = useMutation({
    mutationFn: (id: string) => deleteSeries(id),
    onSuccess: async () => {
      showSuccessMessage("Series deleted.");
      setConfirmAction(null);
      navigate("/admin/series");
      await invalidateSeries();
    },
    onError: (error) => {
      const message = getErrorMessage(
        error,
        "Couldn't delete the series. Try again.",
      );
      if (message) showError(message);
    },
  });

  const updateTimeMutation = useMutation({
    mutationFn: ({
      id,
      dateOfStart,
      timeOfStart,
    }: {
      id: string;
      dateOfStart?: string;
      timeOfStart?: string;
    }) => updateSeriesTime(id, { dateOfStart, timeOfStart }),
    onSuccess: async () => {
      showSuccessMessage("Date and time updated.");
      setShowUpdateSeriesTime(false);
      await invalidateSeries();
    },
    onError: (error) => {
      const message = getErrorMessage(
        error,
        "Couldn't update the series time. Try again.",
      );
      if (message) showError(message);
    },
  });

  const updateResultMutation = useMutation({
    mutationFn: ({ id, teamWon }: { id: string; teamWon: number }) =>
      updateSeriesGame(id, teamWon),
    onSuccess: async () => {
      showSuccessMessage("Series result updated.");
      setShowSeriesResultForm(false);
      setWonTeam("");
      await invalidateSeries();
    },
    onError: (error) => {
      const message = getErrorMessage(
        error,
        "Couldn't update the series result. Try again.",
      );
      if (message) showError(message);
    },
  });

  const betWriteMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSeries?.id) {
        throw new Error("No series selected");
      }

      if (isSpontaneousBet) {
        if (!("gameNumber" in selectedBet) || !selectedBet.gameNumber) {
          throw new Error("Game number must be at least 1.");
        }
        const startDate = parseDateAndTimeToIso(
          startDateSpontaneous,
          startTimeSpontaneous,
        );
        if (!startDate) {
          throw new Error("Enter a valid start date and time.");
        }

        const sharedFields = {
          categories: selectedBet.categories,
          fantasyPoints: selectedBet.fantasyPoints,
          player1: selectedBet.player1,
          player2: selectedBet.player2,
          differential: selectedBet.differential,
          typeOfMatchup: selectedBet.typeOfMatchup,
          startTime: startDate,
          gameNumber: selectedBet.gameNumber,
        };

        if (selectedBet.id) {
          // Update DTO forbids seriesId (whitelist validation).
          await updateSpontaneousBet(selectedBet.id, sharedFields);
          return { mode: "update" as const };
        }
        await createSpontaneousBet({
          ...sharedFields,
          seriesId: selectedSeries.id,
        });
        return { mode: "create" as const };
      }

      if (selectedBet.id) {
        await updatePlayerMatchupBet(selectedBet.id, {
          categories: selectedBet.categories,
          fantasyPoints: selectedBet.fantasyPoints,
          player1: selectedBet.player1,
          player2: selectedBet.player2,
          differential: selectedBet.differential,
          typeOfMatchup: selectedBet.typeOfMatchup,
        });
        return { mode: "update" as const };
      }

      await createPlayerMatchupBet({
        categories: selectedBet.categories,
        fantasyPoints: selectedBet.fantasyPoints,
        player1: selectedBet.player1,
        player2: selectedBet.player2,
        differential: selectedBet.differential,
        typeOfMatchup: selectedBet.typeOfMatchup,
        seriesId: selectedSeries.id,
      });
      return { mode: "create" as const };
    },
    onSuccess: async (result) => {
      showSuccessMessage(result.mode === "update" ? "Bet updated." : "Bet created.");
      setCreateNewBet(false);
      setSelectedBet(emptyBet(selectedSeries?.id ?? ""));
      setStartDateSpontaneous("");
      setStartTimeSpontaneous("");
      await invalidateSeries();
    },
    onError: (error) => {
      if (
        error instanceof Error &&
        (error.message === "Game number must be at least 1." ||
          error.message === "Enter a valid start date and time.")
      ) {
        notify.warning(error.message);
        return;
      }
      const message = getErrorMessage(
        error,
        "Couldn't save the bet. Try again.",
      );
      if (message) showError(message);
    },
  });

  const deleteBetMutation = useMutation({
    mutationFn: async ({
      bet,
      isSpontaneous,
    }: {
      bet: PlayerMatchupBet | SpontaneousBet;
      isSpontaneous: boolean;
    }) => {
      if (isSpontaneous) {
        await deleteSpontaneousBet(bet.id);
      } else {
        await deletePlayerMatchupBet(bet.id);
      }
    },
    onSuccess: async () => {
      showSuccessMessage("Bet deleted.");
      setConfirmAction(null);
      await invalidateSeries();
    },
    onError: (error) => {
      const message = getErrorMessage(
        error,
        "Couldn't delete the bet. Try again.",
      );
      if (message) showError(message);
    },
  });

  const updateStatsMutation = useMutation({
    mutationFn: async () => {
      const updateStats = [...selectedBet.currentStats];
      updateStats[0] += player1Stat;
      updateStats[1] += player2Stat;
      const isSpontaneous =
        spontaneousBets.some((bet) => bet.id === selectedBet.id);

      if (isSpontaneous) {
        await updateSpontaneousBet(selectedBet.id, { currentStats: updateStats });
      } else {
        await updatePlayerMatchupBet(selectedBet.id, {
          currentStats: updateStats,
        });
      }
    },
    onSuccess: async () => {
      showSuccessMessage("Matchup result updated.");
      setUpdateResultSelected(false);
      setPlayer1Stat(0);
      setPlayer2Stat(0);
      setSelectedBet(emptyBet(selectedSeries?.id ?? ""));
      await invalidateSeries();
    },
    onError: (error) => {
      const message = getErrorMessage(
        error,
        "Couldn't update the matchup result. Try again.",
      );
      if (message) showError(message);
    },
  });

  const bulkBetsMutation = useMutation({
    mutationFn: (payload: BulkCreateBetsPayload) => bulkCreateBets(payload),
    onSuccess: async (result) => {
      const matchups = result.playerMatchupBets?.length ?? 0;
      const spontaneous = result.spontaneousBets?.length ?? 0;
      showSuccessMessage(
        `Created ${matchups + spontaneous} bet(s)${
          matchups && spontaneous
            ? ` (${matchups} matchup, ${spontaneous} spontaneous)`
            : ""
        }.`,
      );
      await invalidateSeries();
    },
    onError: (error) => {
      const message = getErrorMessage(
        error,
        "Couldn't bulk create bets. Fix the rows and try again.",
      );
      if (message) showError(message);
    },
  });

  const missingBetsMutation = useMutation({
    mutationFn: updateMissingBetsForAllUsers,
    onSuccess: () => {
      showSuccessMessage("Missing bets updated for every user.");
      triggerRefresh();
    },
    onError: (error) => {
      const message = getErrorMessage(
        error,
        "Couldn't update missing bets. Try again.",
      );
      if (message) showError(message);
    },
  });

  const isMutating =
    closeBetsMutation.isPending ||
    deleteSeriesMutation.isPending ||
    updateTimeMutation.isPending ||
    updateResultMutation.isPending ||
    betWriteMutation.isPending ||
    deleteBetMutation.isPending ||
    updateStatsMutation.isPending ||
    missingBetsMutation.isPending ||
    bulkBetsMutation.isPending;

  const handleBulkCreateBets = async (payload: BulkCreateBetsPayload) => {
    await bulkBetsMutation.mutateAsync(payload);
  };

  const handleSelectSeries = (series: Series) => {
    if (!series.id) return;
    navigate(`/admin/series/${series.id}/overview`);
  };

  const handleBackToSeriesList = () => {
    navigate("/admin/series");
  };

  const handleTabChange = (tab: SeriesDetailTab) => {
    if (!seriesIdParam) return;
    navigate(`/admin/series/${seriesIdParam}/${tab}`);
  };

  const handleResetSelectedBet = () => {
    setSelectedBet(emptyBet(selectedSeries?.id ?? ""));
  };

  const handleCloseEditBet = () => {
    setCreateNewBet(false);
    handleResetSelectedBet();
    setStartDateSpontaneous("");
    setStartTimeSpontaneous("");
  };

  const handleCloseUpdateResult = () => {
    setUpdateResultSelected(false);
    handleResetSelectedBet();
    setPlayer1Stat(0);
    setPlayer2Stat(0);
  };

  const handleCategoriesSelection = (
    event: SelectChangeEvent<typeof selectedBet.categories>,
  ) => {
    const { value } = event.target;
    const selectedCategories: MatchupCategory[] =
      typeof value === "string"
        ? value.split(",").map((category) => category as MatchupCategory)
        : value;
    setSelectedBet({
      ...selectedBet,
      categories: [...selectedCategories],
    });
  };

  const handleGameNumberSelection = (event: SelectChangeEvent<string>) => {
    setSelectedBet({
      ...selectedBet,
      gameNumber: parseInt(event.target.value, 10),
    });
  };

  const handleDateAndTimeSelection = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    event.preventDefault();
    if (event.target.type === "date") {
      setStartDateSpontaneous(event.target.value);
    } else {
      setStartTimeSpontaneous(event.target.value);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, type, value } = e.target;

    if (name === "categories" && e.target instanceof HTMLSelectElement) {
      const selectElement = e.target;
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
      const selectElement = e.target;
      setSelectedBet({
        ...selectedBet,
        typeOfMatchup: Array.from(selectElement.options)
          .filter((option) => option.selected)
          .map((option) => option.value as PlayerMatchupType)[0],
      });
    } else if (name === "currentStats0") {
      setPlayer1Stat(parseInt(value, 10));
    } else if (name === "currentStats1") {
      setPlayer2Stat(parseInt(value, 10));
    } else {
      setSelectedBet({
        ...selectedBet,
        [name]: type === "text" ? value : parseFloat(value),
      });
    }
  };

  const handleBetSelection = (bet: PlayerMatchupBet | SpontaneousBet) => {
    setSelectedBet(bet);
    setCreateNewBet(true);
    const spontaneous = "gameNumber" in bet && bet.gameNumber != null;
    setIsSpontaneousBet(spontaneous);
    if (spontaneous) {
      const { date, time } = startTimeToDateInput(
        (bet as SpontaneousBet).startTime,
      );
      setStartDateSpontaneous(date);
      setStartTimeSpontaneous(time);
    }
  };

  const handleBetSelectionForUpdateResult = (bet: PlayerMatchupBet) => {
    setUpdateResultSelected(true);
    setSelectedBet(bet);
  };

  const handleCreateNewBet = () => {
    setIsSpontaneousBet(false);
    handleResetSelectedBet();
    setCreateNewBet(true);
  };

  const handleCreateNewSpontaneousBet = () => {
    handleResetSelectedBet();
    setCreateNewBet(true);
    setIsSpontaneousBet(true);
    setStartDateSpontaneous("");
    setStartTimeSpontaneous("");
  };

  const handleSubmitBet = (e: React.FormEvent) => {
    e.preventDefault();
    betWriteMutation.mutate();
  };

  const handleUpdateCurrentStats = (e: React.FormEvent) => {
    e.preventDefault();
    updateStatsMutation.mutate();
  };

  const handleRequestCloseBets = () => {
    if (!selectedSeries) return;
    setConfirmAction({ type: "closeBets" });
  };

  const handleRequestDeleteSeries = () => {
    if (!selectedSeries) return;
    setConfirmAction({ type: "deleteSeries" });
  };

  const handleRequestDeleteBet = (
    bet: PlayerMatchupBet | SpontaneousBet,
    isSpontaneous: boolean,
  ) => {
    setConfirmAction({ type: "deleteBet", bet, isSpontaneous });
  };

  const handleConfirmAction = () => {
    if (!confirmAction || !selectedSeries?.id) return;
    if (confirmAction.type === "closeBets") {
      closeBetsMutation.mutate(selectedSeries.id);
    } else if (confirmAction.type === "deleteSeries") {
      deleteSeriesMutation.mutate(selectedSeries.id);
    } else if (confirmAction.type === "deleteBet") {
      deleteBetMutation.mutate({
        bet: confirmAction.bet,
        isSpontaneous: confirmAction.isSpontaneous,
      });
    }
  };

  const handleCancelConfirm = () => {
    if (isMutating) return;
    setConfirmAction(null);
  };

  const handleOpenUpdateTime = () => {
    if (!selectedSeries) return;
    setEditDateOfStart(dateOfStartToInputValue(selectedSeries.dateOfStart));
    setEditTimeOfStart(selectedSeries.timeOfStart ?? "");
    setShowUpdateSeriesTime(true);
    setShowSeriesResultForm(false);
  };

  const handleOpenUpdateResult = () => {
    setShowSeriesResultForm(true);
    setShowUpdateSeriesTime(false);
  };

  const handleSubmitSeriesTime = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeries?.id) return;
    updateTimeMutation.mutate({
      id: selectedSeries.id,
      dateOfStart: toApiDateString(editDateOfStart),
      timeOfStart: editTimeOfStart,
    });
  };

  const handleSubmitSeriesResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wonTeam) {
      notify.warning("Choose which team won the series.");
      return;
    }
    if (!selectedSeries?.id) return;
    updateResultMutation.mutate({
      id: selectedSeries.id,
      teamWon: parseInt(wonTeam, 10),
    });
  };

  const confirmDialog = useMemo(() => {
    if (!confirmAction || !selectedSeries) {
      return {
        open: false,
        title: "",
        message: "",
        confirmLabel: "Confirm",
        confirmColor: "primary" as const,
      };
    }
    if (confirmAction.type === "closeBets") {
      return {
        open: true,
        title: "Close series bets",
        message: `Close all bets for ${seriesDisplayLabel(selectedSeries)}?`,
        confirmLabel: "Close bets",
        confirmColor: "warning" as const,
      };
    }
    if (confirmAction.type === "deleteSeries") {
      return {
        open: true,
        title: "Delete series",
        message: `Delete series ${seriesDisplayLabel(selectedSeries)}? This cannot be undone.`,
        confirmLabel: "Delete",
        confirmColor: "error" as const,
      };
    }
    return {
      open: true,
      title: "Delete bet",
      message: `Delete bet ${confirmAction.bet.player1} vs ${confirmAction.bet.player2}?`,
      confirmLabel: "Delete",
      confirmColor: "error" as const,
    };
  }, [confirmAction, selectedSeries]);

  return {
    selectedTournamentId,
    seriesList,
    groupedSeries,
    selectedSeries,
    seriesIdParam,
    activeTab,
    isSeriesLoading: seriesQuery.isLoading || seriesQuery.isFetching,
    isSeriesError: seriesQuery.isError,
    isMutating,
    bets,
    spontaneousBets,
    selectedBet,
    isSpontaneousBet,
    createNewBet,
    updateResultSelected,
    player1Stat,
    player2Stat,
    startDateSpontaneous,
    startTimeSpontaneous,
    showUpdateSeriesTime,
    showSeriesResultForm,
    wonTeam,
    editDateOfStart,
    editTimeOfStart,
    confirmDialog,
    team1Name: selectedSeries ? seriesTeam1Name(selectedSeries) : "",
    team2Name: selectedSeries ? seriesTeam2Name(selectedSeries) : "",
    handleSelectSeries,
    handleBackToSeriesList,
    handleTabChange,
    handleCategoriesSelection,
    handleGameNumberSelection,
    handleDateAndTimeSelection,
    handleInputChange,
    handleBetSelection,
    handleBetSelectionForUpdateResult,
    handleCreateNewBet,
    handleCreateNewSpontaneousBet,
    handleCloseEditBet,
    handleCloseUpdateResult,
    handleSubmitBet,
    handleUpdateCurrentStats,
    handleRequestCloseBets,
    handleRequestDeleteSeries,
    handleRequestDeleteBet,
    handleConfirmAction,
    handleCancelConfirm,
    handleOpenUpdateTime,
    handleOpenUpdateResult,
    handleCloseUpdateSeriesTime: () => setShowUpdateSeriesTime(false),
    handleCloseUpdateResultSeries: () => {
      setShowSeriesResultForm(false);
      setWonTeam("");
    },
    handleSubmitSeriesTime,
    handleSubmitSeriesResult,
    setWonTeam,
    setEditDateOfStart,
    setEditTimeOfStart,
    handleUpdateMissingBets: () => missingBetsMutation.mutate(),
    handleBulkCreateBets,
    isBulkImporting: bulkBetsMutation.isPending,
    refetchSeries: () => void seriesQuery.refetch(),
  };
}

export type SeriesWorkbenchModel = ReturnType<typeof useSeriesWorkbenchModel>;
