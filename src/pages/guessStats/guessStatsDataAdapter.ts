import axiosInstance from "../../api/axiosInstance";
import {
  GuessStatsChampionSnapshot,
  GuessStatsDataSnapshot,
  GuessStatsSeriesSnapshot,
} from "../../types/guessStats";
type GuessStatsEndpointPayload = {
  meta?: {
    generatedAt?: string;
  };
  series?: Array<{
    seriesId?: string;
    seriesLabel?: string;
    round?: string;
    conference?: "West" | "East" | "Finals";
    team1?: string;
    team2?: string;
    percentages?: {
      teamWin?: Record<string, unknown>;
      playerMatchup?: Record<string, Record<string, unknown>>;
      spontaneousMatchups?: Record<string, Record<string, unknown>>;
      spontaneousMacthups?: Record<string, Record<string, unknown>>;
    };
    counts?: {
      bestOf7?: Record<string, unknown>;
    };
    betsMeta?: {
      playerMatchup?: Array<{
        betId?: string;
        player1?: string;
        player2?: string;
        categories?: string[];
      }>;
      spontaneous?: Array<{
        betId?: string;
        gameNumber?: number;
        player1?: string;
        player2?: string;
        categories?: string[];
      }>;
    };
  }>;
  championByStage?: Array<{
    stage?: string;
    championTeam?: { top5?: Array<{ label?: string; votes?: number }> };
    mvp?: { top5?: Array<{ label?: string; votes?: number }> };
    conferenceFinals?: { top5?: Array<{ label?: string; votes?: number }> };
  }>;
};

function safeNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function mapTopRows(
  stage: string,
  prefix: string,
  rows: Array<{ label?: string; votes?: number }> | undefined,
) {
  return (rows ?? []).map((row, index) => ({
    id: `${stage}-${prefix}-${index}-${row.label ?? "unknown"}`,
    label: row.label ?? "—",
    votes: safeNumber(row.votes),
  }));
}

function toSeriesSnapshotFromStatsEndpoint(
  row: NonNullable<GuessStatsEndpointPayload["series"]>[number],
): GuessStatsSeriesSnapshot {
  const percentages = row.percentages ?? {};
  const teamWin = percentages.teamWin ?? {};
  const playerMatchupPct = percentages.playerMatchup ?? {};
  const spontaneousPct =
    percentages.spontaneousMatchups ?? percentages.spontaneousMacthups ?? {};
  const bestOf7Counts = row.counts?.bestOf7 ?? {};

  const playerMatchupMeta = row.betsMeta?.playerMatchup ?? [];
  const spontaneousMeta = row.betsMeta?.spontaneous ?? [];

  const playerMatchup: Record<string, { 1: number; 2: number; label: string }> = {};
  for (const bet of playerMatchupMeta) {
    const betId = bet.betId ?? "";
    if (!betId) continue;
    const pct = playerMatchupPct[betId] ?? {};
    const categoryLabel =
      Array.isArray(bet.categories) && bet.categories.length > 0
        ? bet.categories.join(" / ")
        : "";
    const label =
      `${bet.player1 ?? "Player 1"} vs ${bet.player2 ?? "Player 2"}` +
      (categoryLabel ? ` (${categoryLabel})` : "");
    playerMatchup[betId] = {
      1: safeNumber(pct["1"]),
      2: safeNumber(pct["2"]),
      label,
    };
  }

  const spontaneous: Record<string, { 1: number; 2: number; label: string }> = {};
  for (const bet of spontaneousMeta) {
    const betId = bet.betId ?? "";
    if (!betId) continue;
    const pct = spontaneousPct[betId] ?? {};
    const label = `G${bet.gameNumber ?? "?"}: ${bet.player1 ?? "Player 1"} vs ${
      bet.player2 ?? "Player 2"
    }`;
    spontaneous[betId] = {
      1: safeNumber(pct["1"]),
      2: safeNumber(pct["2"]),
      label,
    };
  }

  return {
    seriesId: row.seriesId ?? "",
    seriesLabel: row.seriesLabel ?? "Unknown Series",
    round: row.round ?? "",
    conference: row.conference ?? "West",
    team1: row.team1 ?? "Team 1",
    team2: row.team2 ?? "Team 2",
    teamWin: {
      1: safeNumber(teamWin["1"]),
      2: safeNumber(teamWin["2"]),
    },
    bestOf7Votes: {
      "4": safeNumber(bestOf7Counts["4"]),
      "5": safeNumber(bestOf7Counts["5"]),
      "6": safeNumber(bestOf7Counts["6"]),
      "7": safeNumber(bestOf7Counts["7"]),
    },
    playerMatchup,
    spontaneous,
  };
}

function toChampionStageSnapshotFromStatsEndpoint(
  row: NonNullable<GuessStatsEndpointPayload["championByStage"]>[number],
): GuessStatsChampionSnapshot {
  const stage = row.stage ?? "Unknown Stage";
  return {
    stage,
    championRows: mapTopRows(stage, "champ", row.championTeam?.top5),
    mvpRows: mapTopRows(stage, "mvp", row.mvp?.top5),
    conferenceFinalRows: mapTopRows(stage, "conf", row.conferenceFinals?.top5),
  };
}

export async function loadGuessStatsDataFromExisting(
  tournamentId?: string,
): Promise<GuessStatsDataSnapshot> {
  const { data } = await axiosInstance.get<GuessStatsEndpointPayload>(
    "/stats/guess-page",
    {
      params: {
        tournamentId: tournamentId ?? undefined,
      },
    },
  );

  const series = (data.series ?? []).map(toSeriesSnapshotFromStatsEndpoint);
  const championByStage = (data.championByStage ?? []).map(
    toChampionStageSnapshotFromStatsEndpoint,
  );

  return {
    source: "existing",
    series,
    championByStage,
    availableStages: championByStage.map((stageEntry) => stageEntry.stage),
    fetchedAt: data.meta?.generatedAt ?? new Date().toISOString(),
  };
}

export async function loadGuessStatsDataFromAggregated(): Promise<GuessStatsDataSnapshot> {
  const existing = await loadGuessStatsDataFromExisting();
  return { ...existing, source: "aggregated" };
}

