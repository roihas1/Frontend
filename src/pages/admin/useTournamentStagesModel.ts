import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "../../api/getErrorMessage";
import { notify } from "../../components/common/notify";
import {
  useError,
  useSuccessMessage,
} from "../../components/providers&context/NotificationProvider";
import { useTournament } from "../../components/providers&context/TournamentContext";
import { CreateTournamentDto, nbaTeamsList } from "../../types";
import { Series } from "../HomePage";
import {
  adminQueryKeys,
  bulkCreateSeries,
  type BulkCreateSeriesPayload,
  createPlayoffsStage,
  createSeries,
  createTournament,
  fetchAdminSeries,
} from "./adminApi";
import {
  dateOfStartToInputValue,
  seriesTeam1Name,
  seriesTeam2Name,
} from "./adminNormalize";

type SetupPanel = "tournament" | "stage" | "series" | null;

const emptySeries = (): Series => ({
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

export function useTournamentStagesModel() {
  const queryClient = useQueryClient();
  const { showError } = useError();
  const { showSuccessMessage } = useSuccessMessage();
  const {
    selectedTournamentId,
    tournaments,
    refreshTournaments,
    setSelectedTournamentId,
  } = useTournament();

  const [activePanel, setActivePanel] = useState<SetupPanel>(null);
  const [stageName, setStageName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [stageTime, setStageTime] = useState("");
  const [newTournamentName, setNewTournamentName] = useState("");
  const [newTournamentYear, setNewTournamentYear] = useState(() =>
    String(new Date().getFullYear()),
  );
  const [newTournamentSportType, setNewTournamentSportType] = useState("NBA");
  const [newSeries, setNewSeries] = useState<Series>(emptySeries);
  const [createSeriesTournamentId, setCreateSeriesTournamentId] = useState("");
  const [teamsList, setTeamsList] = useState<
    { name: string; seed: number; conference: string }[]
  >([]);

  useEffect(() => {
    if (activePanel !== "series") {
      setCreateSeriesTournamentId("");
      return;
    }
    setCreateSeriesTournamentId(selectedTournamentId ?? "");
  }, [activePanel, selectedTournamentId]);

  const invalidateSeries = async () => {
    await queryClient.invalidateQueries({
      queryKey: adminQueryKeys.series(selectedTournamentId),
    });
  };

  const tournamentMutation = useMutation({
    mutationFn: (payload: CreateTournamentDto) => createTournament(payload),
    onSuccess: async (created) => {
      if (created?.id) {
        setSelectedTournamentId(created.id);
      }
      await refreshTournaments();
      showSuccessMessage("Tournament created.");
      setNewTournamentName("");
      setNewTournamentYear(String(new Date().getFullYear()));
      setNewTournamentSportType("NBA");
      setActivePanel(null);
    },
    onError: (error) => {
      const message = getErrorMessage(
        error,
        "Couldn't create the tournament. Try again.",
      );
      if (message) showError(message);
    },
  });

  const stageMutation = useMutation({
    mutationFn: () => {
      if (!selectedTournamentId) {
        throw new Error("Select a tournament first.");
      }
      return createPlayoffsStage({
        name: stageName,
        startDate,
        timeOfStart: stageTime,
        tournamentId: selectedTournamentId,
      });
    },
    onSuccess: () => {
      showSuccessMessage("Stage created.");
      setStageName("");
      setStartDate("");
      setStageTime("");
      setActivePanel(null);
    },
    onError: (error) => {
      if (error instanceof Error && error.message === "Select a tournament first.") {
        notify.warning(error.message);
        return;
      }
      const message = getErrorMessage(
        error,
        "Couldn't create the stage. Try again.",
      );
      if (message) showError(message);
    },
  });

  const seriesMutation = useMutation({
    mutationFn: () => {
      const formattedDate = new Date(newSeries.dateOfStart)
        .toISOString()
        .split("T")[0];
      return createSeries({
        team1: newSeries.team1 ?? "",
        team2: newSeries.team2 ?? "",
        seed1: newSeries.seed1,
        seed2: newSeries.seed2,
        round: newSeries.round,
        conference: newSeries.conference ?? "West",
        dateOfStart: formattedDate,
        timeOfStart: newSeries.timeOfStart,
        ...(createSeriesTournamentId
          ? { tournamentId: createSeriesTournamentId }
          : {}),
      });
    },
    onSuccess: async () => {
      showSuccessMessage("Series created.");
      setNewSeries(emptySeries());
      setCreateSeriesTournamentId("");
      setActivePanel(null);
      await invalidateSeries();
    },
    onError: (error) => {
      const message = getErrorMessage(
        error,
        "Couldn't create the series. Try again.",
      );
      if (message) showError(message);
    },
  });

  const bulkSeriesMutation = useMutation({
    mutationFn: (payload: BulkCreateSeriesPayload) => bulkCreateSeries(payload),
    onSuccess: async (created) => {
      showSuccessMessage(`Created ${created.length} series.`);
      await invalidateSeries();
    },
    onError: (error) => {
      const message = getErrorMessage(
        error,
        "Couldn't bulk create series. Fix the rows and try again.",
      );
      if (message) showError(message);
    },
  });

  const isMutating =
    tournamentMutation.isPending ||
    stageMutation.isPending ||
    seriesMutation.isPending ||
    bulkSeriesMutation.isPending;

  const handleBulkCreateSeries = async (payload: BulkCreateSeriesPayload) => {
    await bulkSeriesMutation.mutateAsync(payload);
  };

  const handleOpenSeriesPanel = async () => {
    let seriesData =
      queryClient.getQueryData<Series[]>(
        adminQueryKeys.series(selectedTournamentId),
      ) ?? [];

    if (selectedTournamentId && seriesData.length === 0) {
      try {
        seriesData = await queryClient.fetchQuery({
          queryKey: adminQueryKeys.series(selectedTournamentId),
          queryFn: fetchAdminSeries,
          staleTime: 2 * 60 * 1000,
        });
      } catch (error) {
        const message = getErrorMessage(
          error,
          "Couldn't load series for team list. Try again.",
        );
        if (message) showError(message);
      }
    }

    const teamList: { name: string; seed: number; conference: string }[] = [];
    if (seriesData.length > 7) {
      seriesData.forEach((series) => {
        const n1 = seriesTeam1Name(series);
        const n2 = seriesTeam2Name(series);
        if (n1 && !teamList.some((team) => team.name === n1)) {
          teamList.push({
            name: n1,
            seed: series.seed1,
            conference: series.conference ?? "",
          });
        }
        if (n2 && !teamList.some((team) => team.name === n2)) {
          teamList.push({
            name: n2,
            seed: series.seed2,
            conference: series.conference ?? "",
          });
        }
      });
    }
    setTeamsList(teamList);
    setActivePanel("series");
  };

  const handleInputNewSeriesChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    if (name === "dateOfStart" && value) {
      setNewSeries((prev) => ({ ...prev, dateOfStart: new Date(value) }));
    } else if (name === "team1" || name === "team2") {
      const selectedTeam = teamsList.find((team) => team.name === value);
      if (selectedTeam) {
        setNewSeries((prev) => ({
          ...prev,
          [name]: selectedTeam.name,
          [`seed${name === "team1" ? "1" : "2"}`]: selectedTeam.seed,
        }));
      } else {
        setNewSeries((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setNewSeries((prev) => ({
        ...prev,
        [name]:
          type === "select-one" && name.includes("seed")
            ? parseInt(value, 10)
            : value,
      }));
    }
  };

  const handleSubmitTournament = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newTournamentName.trim();
    const year = parseInt(newTournamentYear, 10);
    if (!name) {
      notify.warning("Enter a tournament name.");
      return;
    }
    if (!Number.isFinite(year) || year < 1900 || year > 2100) {
      notify.warning("Enter a year between 1900 and 2100.");
      return;
    }
    tournamentMutation.mutate({
      sportType: newTournamentSportType,
      year,
      name,
    });
  };

  const handleSubmitStage = (e: React.FormEvent) => {
    e.preventDefault();
    stageMutation.mutate();
  };

  const handleSubmitSeries = (e: React.FormEvent) => {
    e.preventDefault();
    seriesMutation.mutate();
  };

  return {
    activePanel,
    isMutating,
    tournaments,
    selectedTournamentId,
    stageName,
    startDate,
    stageTime,
    newTournamentName,
    newTournamentYear,
    newTournamentSportType,
    newSeries,
    createSeriesTournamentId,
    teamsList,
    nbaTeamsList,
    dateOfStartToInputValue,
    setActivePanel,
    setStageName,
    setStartDate,
    setStageTime,
    setNewTournamentName,
    setNewTournamentYear,
    setNewTournamentSportType,
    setCreateSeriesTournamentId,
    handleOpenSeriesPanel,
    handleInputNewSeriesChange,
    handleSubmitTournament,
    handleSubmitStage,
    handleSubmitSeries,
    handleBulkCreateSeries,
    isBulkImporting: bulkSeriesMutation.isPending,
  };
}

export type TournamentStagesModel = ReturnType<typeof useTournamentStagesModel>;
