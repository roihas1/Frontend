import React from "react";
import { Skeleton } from "@mui/material";
import ChampionStageStatsSection from "../components/forPages/stats/ChampionStageStatsSection";
import SeriesStatsSection from "../components/forPages/stats/SeriesStatsSection";
import StatsFilters from "../components/forPages/stats/StatsFilters";
import StatsInsightsPanel from "../components/forPages/stats/StatsInsightsPanel";
import StatsOverviewCards from "../components/forPages/stats/StatsOverviewCards";
import { useGuessStatsModel } from "./guessStats/useGuessStatsModel";

const GuessStatsPage: React.FC = () => {
  const model = useGuessStatsModel();

  if (model.loading) {
    return (
      <div className="space-y-3">
        <Skeleton variant="rounded" height={40} />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} variant="rounded" height={110} />
          ))}
        </div>
        <Skeleton variant="rounded" height={300} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold text-colors-nba-blue">Guess Stats</h1>
        <p className="text-sm text-gray-500 mt-1">
          All guess stats in one place.
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Start with the top cards for a quick view. Then check the series and champion sections
          for more details. Each section has a short help text.
        </p>
      </div>

      <StatsFilters
        filters={model.filters}
        setFilters={model.setFilters}
        availableStages={model.availableStages}
        allSeries={model.allSeries}
      />

      <StatsOverviewCards kpis={model.kpis} />
      <StatsInsightsPanel insights={model.insights} />

      <SeriesStatsSection
        selectedSeries={model.selectedSeries}
        allSeries={model.allSeries}
        teamWinPie={model.teamWinPie}
        bestOf7Chart={model.bestOf7Chart}
        rows={model.rows}
      />

      <ChampionStageStatsSection
        championByStage={model.championByStage}
      />
    </div>
  );
};

export default GuessStatsPage;

