import React from "react";
import { GuessStatsKpiSummary } from "../../../types/guessStats";

interface StatsOverviewCardsProps {
  kpis: GuessStatsKpiSummary;
}

const cardClass =
  "rounded-xl border border-gray-200 bg-white shadow-sm p-4 flex flex-col gap-1";

const StatsOverviewCards: React.FC<StatsOverviewCardsProps> = ({ kpis }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
      <article className={cardClass}>
        <span className="text-xs uppercase text-gray-500">Distributions</span>
        <span className="text-2xl font-semibold text-colors-nba-blue">
          {kpis.totalDistributions}
        </span>
        <p className="text-xs text-gray-600">
          How many stat rows are shown with your current filters.
        </p>
      </article>
      <article className={cardClass}>
        <span className="text-xs uppercase text-gray-500">Avg Consensus</span>
        <span className="text-2xl font-semibold text-colors-nba-blue">
          {kpis.avgConsensusScore.toFixed(1)}%
        </span>
        <p className="text-xs text-gray-600">
          Percentage based on all shown bets. High = users mostly pick the same side (for example 80/20).
        </p>
      </article>
      <article className={cardClass}>
        <span className="text-xs uppercase text-gray-500">Avg Divergence</span>
        <span className="text-2xl font-semibold text-colors-nba-blue">
          {kpis.avgDivergenceScore.toFixed(1)}%
        </span>
        <p className="text-xs text-gray-600">
          Percentage based on all shown bets. High = picks are close or mixed (for example 50/50 or many no-guesses).
        </p>
      </article>
    </div>
  );
};

export default StatsOverviewCards;

