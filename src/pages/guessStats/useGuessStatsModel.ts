import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTournament } from "../../components/providers&context/TournamentContext";
import { useError } from "../../components/providers&context/ErrorProvider";
import {
  GuessStatsBetFamily,
  GuessStatsChampionSnapshot,
  GuessStatsFilters,
  GuessStatsSeriesSnapshot,
} from "../../types/guessStats";
import {
  loadGuessStatsDataFromExisting,
} from "./guessStatsDataAdapter";
import {
  buildInsights,
  computeBestOf7Histogram,
  computeKpis,
  flattenSnapshot,
} from "./statsTransformers";

const defaultFilters: GuessStatsFilters = {
  leagueName: "Overall",
  selectedStage: "All",
  selectedSeriesId: "All",
  betFamily: "all",
};

export function useGuessStatsModel() {
  const { selectedTournamentId } = useTournament();
  const { showError } = useError();
  const [filters, setFilters] = useState<GuessStatsFilters>(defaultFilters);

  const query = useQuery({
    queryKey: ["guess-stats", selectedTournamentId, "existing"],
    queryFn: async () => loadGuessStatsDataFromExisting(selectedTournamentId ?? undefined),
    enabled: Boolean(selectedTournamentId),
    staleTime: 3 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    // Keep API load low on failures: only one retry, no automatic refetch loops.
    retry: 1,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (query.isError) {
      showError("Failed to load guess statistics.");
    }
  }, [query.isError, showError]);

  const snapshot = query.data;

  const allSeries = useMemo(() => snapshot?.series ?? [], [snapshot]);

  const selectedSeries = useMemo<GuessStatsSeriesSnapshot | null>(() => {
    if (!snapshot) return null;
    if (filters.selectedSeriesId === "All") return null;
    return (
      snapshot.series.find((series) => series.seriesId === filters.selectedSeriesId) ?? null
    );
  }, [snapshot, filters.selectedSeriesId]);

  const { rows, championRows } = useMemo(() => {
    if (!snapshot) return { rows: [], championRows: [] };
    return flattenSnapshot(snapshot);
  }, [snapshot]);

  const filteredRows = useMemo(() => {
    let next = rows;
    if (filters.selectedSeriesId !== "All") {
      next = next.filter((row) => row.seriesId === filters.selectedSeriesId);
    }
    if (filters.betFamily !== "all") {
      next = next.filter((row) => row.category === filters.betFamily);
    }
    return next;
  }, [rows, filters.selectedSeriesId, filters.betFamily]);

  const filteredChampionRows = useMemo(() => {
    if (filters.selectedStage === "All") return championRows;
    return championRows.filter((row) => row.stage === filters.selectedStage);
  }, [championRows, filters.selectedStage]);

  const filteredChampionByStage = useMemo<GuessStatsChampionSnapshot[]>(() => {
    const all = snapshot?.championByStage ?? [];
    if (filters.selectedStage === "All") return all;
    return all.filter((stageEntry) => stageEntry.stage === filters.selectedStage);
  }, [snapshot, filters.selectedStage]);

  const kpis = useMemo(() => computeKpis([...filteredRows, ...filteredChampionRows]), [
    filteredRows,
    filteredChampionRows,
  ]);

  const insights = useMemo(
    () => buildInsights([...filteredRows, ...filteredChampionRows]),
    [filteredRows, filteredChampionRows],
  );

  const bestOf7Chart = useMemo(() => {
    if (!selectedSeries) return [];
    return computeBestOf7Histogram(selectedSeries.bestOf7Votes);
  }, [selectedSeries]);

  const teamWinPie = useMemo(() => {
    if (!selectedSeries) return [];
    const first = selectedSeries.teamWin[1];
    const second = selectedSeries.teamWin[2];
    const none = Math.max(0, 100 - first - second);
    return [
      { name: selectedSeries.team1, value: first },
      { name: selectedSeries.team2, value: second },
      { name: "No Guess", value: none },
    ];
  }, [selectedSeries]);

  const setBetFamily = (betFamily: GuessStatsBetFamily) => {
    setFilters((prev) => ({ ...prev, betFamily }));
  };

  return {
    filters,
    setFilters,
    setBetFamily,
    loading: query.isLoading,
    snapshot,
    allSeries,
    selectedSeries,
    rows: filteredRows,
    championRows: filteredChampionRows,
    championByStage: filteredChampionByStage,
    kpis,
    insights,
    bestOf7Chart,
    teamWinPie,
    availableStages: snapshot?.availableStages ?? [],
  };
}

