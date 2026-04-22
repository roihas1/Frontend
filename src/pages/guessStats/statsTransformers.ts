import {
  DistributionRow,
  GuessStatsChampionSnapshot,
  GuessStatsDataSnapshot,
  GuessStatsInsightItem,
  GuessStatsKpiSummary,
  GuessStatsSeriesSnapshot,
} from "../../types/guessStats";

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

export function computeMissingRate(option1Pct: number, option2Pct: number): number {
  return Math.max(0, round(100 - option1Pct - option2Pct));
}

export function computeConsensusScore(option1Pct: number, option2Pct: number): number {
  return round(Math.max(option1Pct, option2Pct));
}

export function computeDivergenceEntropy(option1Pct: number, option2Pct: number): number {
  const nonePct = computeMissingRate(option1Pct, option2Pct);
  const probs = [option1Pct, option2Pct, nonePct]
    .map((v) => v / 100)
    .filter((p) => p > 0);
  if (probs.length === 0) return 0;
  const entropy = -probs.reduce((sum, p) => sum + p * Math.log2(p), 0);
  const maxEntropy = Math.log2(3);
  return maxEntropy === 0 ? 0 : round((entropy / maxEntropy) * 100);
}

export function computeBestOf7Histogram(bestOf7Votes: Record<string, number>): Array<{
  games: string;
  votes: number;
}> {
  const labels = ["4", "5", "6", "7"];
  return labels.map((games) => ({
    games,
    votes: bestOf7Votes[games] ?? 0,
  }));
}

export function toSeriesDistributionRows(
  series: GuessStatsSeriesSnapshot,
): DistributionRow[] {
  const rows: DistributionRow[] = [];
  rows.push({
    id: `${series.seriesId}-teamWin`,
    label: `${series.seriesLabel} - Team Winner`,
    category: "teamWin",
    option1Label: series.team1,
    option2Label: series.team2,
    option1Pct: series.teamWin[1],
    option2Pct: series.teamWin[2],
    nonePct: computeMissingRate(series.teamWin[1], series.teamWin[2]),
    seriesId: series.seriesId,
  });

  Object.entries(series.playerMatchup).forEach(([betId, value]) => {
    const playerNamesOnly = value.label.includes(" (")
      ? value.label.split(" (")[0]
      : value.label;
    const [left = "Option 1", right = "Option 2"] = playerNamesOnly
      .split(" vs ")
      .map((v) => v.trim());
    rows.push({
      id: `${series.seriesId}-pm-${betId}`,
      label: `${series.seriesLabel} - ${value.label}`,
      category: "playerMatchup",
      option1Label: left,
      option2Label: right,
      option1Pct: value[1],
      option2Pct: value[2],
      nonePct: computeMissingRate(value[1], value[2]),
      seriesId: series.seriesId,
    });
  });

  Object.entries(series.spontaneous).forEach(([betId, value]) => {
    const afterPrefix = value.label.includes(":")
      ? value.label.split(":")[1]
      : value.label;
    const [left = "Option 1", right = "Option 2"] = afterPrefix
      .split(" vs ")
      .map((v) => v.trim());
    rows.push({
      id: `${series.seriesId}-sp-${betId}`,
      label: `${series.seriesLabel} - ${value.label}`,
      category: "spontaneous",
      option1Label: left,
      option2Label: right,
      option1Pct: value[1],
      option2Pct: value[2],
      nonePct: computeMissingRate(value[1], value[2]),
      seriesId: series.seriesId,
    });
  });

  return rows;
}

export function computeChampionStageDistributions(
  snapshot: GuessStatsChampionSnapshot,
): DistributionRow[] {
  const collapseRows = (
    rows: Array<{ id: string; label: string; votes: number }>,
    category: DistributionRow["category"],
    metricLabel: string,
  ): DistributionRow[] => {
    const total = rows.reduce((sum, r) => sum + r.votes, 0);
    if (rows.length === 0 || total === 0) return [];
    const sorted = [...rows].sort((a, b) => b.votes - a.votes);
    const top = sorted[0];
    const second = sorted[1] ?? { label: "Other", votes: 0 };
    const topPct = (top.votes / total) * 100;
    const secondPct = (second.votes / total) * 100;
    return [
      {
        id: `${snapshot.stage}-${category}-${top.id}`,
        label: `${snapshot.stage} - ${metricLabel}`,
        category,
        option1Label: top.label,
        option2Label: second.label,
        option1Pct: round(topPct),
        option2Pct: round(secondPct),
        nonePct: computeMissingRate(round(topPct), round(secondPct)),
        totalVotes: total,
        stage: snapshot.stage,
      },
    ];
  };

  return [
    ...collapseRows(snapshot.championRows, "champion", "Champion Team"),
    ...collapseRows(snapshot.mvpRows, "champion", "MVP"),
    ...collapseRows(
      snapshot.conferenceFinalRows,
      "champion",
      "Conference Finals",
    ),
  ];
}

export function computeKpis(rows: DistributionRow[]): GuessStatsKpiSummary {
  if (rows.length === 0) {
    return {
      totalDistributions: 0,
      avgMissingRate: 0,
      avgConsensusScore: 0,
      avgDivergenceScore: 0,
    };
  }
  const total = rows.length;
  const missing = rows.reduce((sum, row) => sum + row.nonePct, 0) / total;
  const consensus =
    rows.reduce((sum, row) => sum + computeConsensusScore(row.option1Pct, row.option2Pct), 0) /
    total;
  const divergence =
    rows.reduce((sum, row) => sum + computeDivergenceEntropy(row.option1Pct, row.option2Pct), 0) /
    total;
  return {
    totalDistributions: rows.length,
    avgMissingRate: round(missing),
    avgConsensusScore: round(consensus),
    avgDivergenceScore: round(divergence),
  };
}

export function buildInsights(rows: DistributionRow[]): GuessStatsInsightItem[] {
  if (rows.length === 0) return [];
  const byConsensus = [...rows].sort(
    (a, b) =>
      computeConsensusScore(b.option1Pct, b.option2Pct) -
      computeConsensusScore(a.option1Pct, a.option2Pct),
  );
  const byDivergence = [...rows].sort(
    (a, b) =>
      computeDivergenceEntropy(b.option1Pct, b.option2Pct) -
      computeDivergenceEntropy(a.option1Pct, a.option2Pct),
  );
  const topConsensus = byConsensus[0];
  const topDivergence = byDivergence[0];
  return [
    {
      id: "most-consensus",
      title: "Most Consensus",
      value: `${computeConsensusScore(topConsensus.option1Pct, topConsensus.option2Pct)}%`,
      subtitle: topConsensus.label,
    },
    {
      id: "most-divergent",
      title: "Most Divergent",
      value: `${computeDivergenceEntropy(topDivergence.option1Pct, topDivergence.option2Pct)}%`,
      subtitle: topDivergence.label,
    },
  ];
}

export function flattenSnapshot(snapshot: GuessStatsDataSnapshot): {
  rows: DistributionRow[];
  championRows: DistributionRow[];
} {
  const rows = snapshot.series.flatMap(toSeriesDistributionRows);
  const championRows = snapshot.championByStage.flatMap(computeChampionStageDistributions);
  return { rows, championRows };
}

