export type GuessStatsSource = "existing" | "aggregated";

export type GuessStatsBetFamily =
  | "all"
  | "teamWin"
  | "bestOf7"
  | "playerMatchup"
  | "spontaneous"
  | "champion";

export interface DistributionRow {
  id: string;
  label: string;
  category: GuessStatsBetFamily;
  option1Label: string;
  option2Label: string;
  option1Pct: number;
  option2Pct: number;
  nonePct: number;
  totalVotes?: number;
  seriesId?: string;
  stage?: string;
}

export interface GuessStatsSeriesSnapshot {
  seriesId: string;
  seriesLabel: string;
  round: string;
  conference: "West" | "East" | "Finals";
  team1: string;
  team2: string;
  teamWin: { 1: number; 2: number };
  bestOf7Votes: Record<string, number>;
  playerMatchup: Record<string, { 1: number; 2: number; label: string }>;
  spontaneous: Record<string, { 1: number; 2: number; label: string }>;
}

export interface GuessStatsChampionSnapshot {
  stage: string;
  conferenceFinalRows: Array<{ id: string; label: string; votes: number }>;
  championRows: Array<{ id: string; label: string; votes: number }>;
  mvpRows: Array<{ id: string; label: string; votes: number }>;
}

export interface GuessStatsDataSnapshot {
  source: GuessStatsSource;
  series: GuessStatsSeriesSnapshot[];
  championByStage: GuessStatsChampionSnapshot[];
  availableStages: string[];
  fetchedAt: string;
}

export interface GuessStatsFilters {
  leagueName: string;
  selectedStage: string;
  selectedSeriesId: string;
  betFamily: GuessStatsBetFamily;
}

export interface GuessStatsKpiSummary {
  totalDistributions: number;
  avgMissingRate: number;
  avgConsensusScore: number;
  avgDivergenceScore: number;
}

export interface GuessStatsInsightItem {
  id: string;
  title: string;
  value: string;
  subtitle: string;
}

export interface GuessStatsChartPoint {
  name: string;
  value: number;
}
