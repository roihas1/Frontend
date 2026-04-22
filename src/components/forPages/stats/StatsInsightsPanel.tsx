import React from "react";
import { GuessStatsInsightItem } from "../../../types/guessStats";

interface StatsInsightsPanelProps {
  insights: GuessStatsInsightItem[];
}

const StatsInsightsPanel: React.FC<StatsInsightsPanelProps> = ({ insights }) => {
  if (insights.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="text-lg font-semibold text-colors-nba-blue">Insights</h3>
        <p className="text-xs text-gray-600 mt-1">
          Quick highlights from what is shown now.
        </p>
        <p className="text-sm text-gray-500 mt-2">No insights available yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="text-lg font-semibold text-colors-nba-blue mb-3">Insights</h3>
      <p className="text-xs text-gray-600 mb-3">
        These cards show the main patterns, like highest agreement and biggest split.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {insights.map((item) => (
          <article key={item.id} className="rounded-lg bg-gray-50 border border-gray-200 p-3">
            <p className="text-xs uppercase text-gray-500">{item.title}</p>
            <p className="text-xl font-semibold text-colors-nba-blue">{item.value}</p>
            <p className="text-sm text-gray-600">{item.subtitle}</p>
          </article>
        ))}
      </div>
    </div>
  );
};

export default StatsInsightsPanel;

