import React, { useMemo } from "react";
import { DistributionRow, GuessStatsSeriesSnapshot } from "../../../types/guessStats";
import BestOf7BarChart from "./charts/BestOf7BarChart";
import MatchupDistributionGrid from "./charts/MatchupDistributionGrid";
import TeamWinPieChart from "./charts/TeamWinPieChart";
import { computeBestOf7Histogram } from "../../../pages/guessStats/statsTransformers";

interface SeriesStatsSectionProps {
  selectedSeries: GuessStatsSeriesSnapshot | null;
  allSeries: GuessStatsSeriesSnapshot[];
  teamWinPie: Array<{ name: string; value: number }>;
  bestOf7Chart: Array<{ games: string; votes: number }>;
  rows: DistributionRow[];
}

const SeriesStatsSection: React.FC<SeriesStatsSectionProps> = ({
  selectedSeries,
  allSeries,
  teamWinPie,
  bestOf7Chart,
  rows,
}) => {
  const seriesById = useMemo(
    () => new Map(allSeries.map((series) => [series.seriesId, series])),
    [allSeries],
  );

  const groupedRows = useMemo(() => {
    const grouped = new Map<string, DistributionRow[]>();
    rows.forEach((row) => {
      if (!row.seriesId) return;
      const existing = grouped.get(row.seriesId) ?? [];
      existing.push(row);
      grouped.set(row.seriesId, existing);
    });
    return grouped;
  }, [rows]);

  const playerRows = rows.filter((row) => row.category === "playerMatchup");
  const spontaneousRows = rows.filter((row) => row.category === "spontaneous");

  if (!selectedSeries) {
    return (
      <section className="space-y-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold text-colors-nba-blue">Series Statistics</h2>
          <p className="text-sm text-gray-500">
            All series selected. Click a series to open its bet stats.
          </p>
        </div>

        {[...groupedRows.entries()].map(([seriesId, seriesRows]) => {
          const series = seriesById.get(seriesId);
          if (!series) return null;
          const seriesPrefix = `${series.seriesLabel} - `;
          const normalizeLabels = (items: DistributionRow[]) =>
            items.map((item) => ({
              ...item,
              label: item.label.startsWith(seriesPrefix)
                ? item.label.replace(seriesPrefix, "")
                : item.label,
            }));
          const seriesTeamWin = normalizeLabels(
            seriesRows.filter((row) => row.category === "teamWin"),
          );
          const seriesPlayerRows = normalizeLabels(
            seriesRows.filter((row) => row.category === "playerMatchup"),
          );
          const seriesSpontaneousRows = normalizeLabels(
            seriesRows.filter((row) => row.category === "spontaneous"),
          );
          const bestOf7SeriesChart = computeBestOf7Histogram(series.bestOf7Votes);

          return (
            <details
              key={seriesId}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3"
            >
              <summary className="cursor-pointer font-semibold text-colors-nba-blue">
                {series.seriesLabel}
              </summary>
              <div className="mt-4 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Team Winner</h3>
                  <MatchupDistributionGrid
                    rows={seriesTeamWin}
                    emptyText="No team winner data for this series."
                  />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Best of 7 Votes</h3>
                  <BestOf7BarChart data={bestOf7SeriesChart} />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Player Matchups</h3>
                  <MatchupDistributionGrid
                    rows={seriesPlayerRows}
                    emptyText="No player matchup distributions for this series."
                  />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Spontaneous Bets</h3>
                  <MatchupDistributionGrid
                    rows={seriesSpontaneousRows}
                    emptyText="No spontaneous distributions for this series."
                  />
                </div>
              </div>
            </details>
          );
        })}
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold text-colors-nba-blue">Series Statistics</h2>
        <p className="text-sm text-gray-500">
          {selectedSeries
            ? selectedSeries.seriesLabel
            : "Choose a series to see team winner and best-of-7 charts."}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="font-semibold mb-2">Team Winner Distribution</h3>
          <p className="text-xs text-gray-600 mb-2">
            Pie parts show guess split between Team 1, Team 2, and no guess.
          </p>
          <TeamWinPieChart data={teamWinPie} />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="font-semibold mb-2">Best of 7 Votes</h3>
          <p className="text-xs text-gray-600 mb-2">
            Bar height shows how many users picked 4, 5, 6, or 7 games.
          </p>
          <BestOf7BarChart data={bestOf7Chart} />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="font-semibold mb-2">Player Matchup Distributions</h3>
        <p className="text-xs text-gray-600 mb-2">
          Each row is one matchup bet. The bar shows split between the two players.
        </p>
        <MatchupDistributionGrid
          rows={playerRows}
          emptyText="No player matchup distributions for the active filters."
        />
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="font-semibold mb-2">Spontaneous Distributions</h3>
        <p className="text-xs text-gray-600 mb-2">
          Same as matchup rows, but for spontaneous game bets.
        </p>
        <MatchupDistributionGrid
          rows={spontaneousRows}
          emptyText="No spontaneous distributions for the active filters."
        />
      </div>
    </section>
  );
};

export default SeriesStatsSection;

