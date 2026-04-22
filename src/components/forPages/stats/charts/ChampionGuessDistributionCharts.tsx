import React from "react";
import { DistributionRow } from "../../../../types/guessStats";
import MatchupDistributionGrid from "./MatchupDistributionGrid";

interface ChampionGuessDistributionChartsProps {
  rows: DistributionRow[];
}

const ChampionGuessDistributionCharts: React.FC<ChampionGuessDistributionChartsProps> = ({
  rows,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-colors-nba-blue">Champion / Stage Overview</h3>
      <p className="text-xs text-gray-600">
        Each row shows the top two picks for that stage stat. The rest is no guess or other picks.
      </p>
      <MatchupDistributionGrid
        rows={rows}
        emptyText="No champion/stage distributions are available for this filter."
      />
    </div>
  );
};

export default ChampionGuessDistributionCharts;

