import React from "react";
import { DistributionRow } from "../../../../types/guessStats";
import { HorizontalBar } from "../../../form/TeamDialog";

interface MatchupDistributionGridProps {
  rows: DistributionRow[];
  emptyText: string;
}

const MatchupDistributionGrid: React.FC<MatchupDistributionGridProps> = ({ rows, emptyText }) => {
  if (rows.length === 0) {
    return <p className="text-sm text-gray-500">{emptyText}</p>;
  }

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.id} className="rounded-lg border border-gray-200 bg-white p-3">
          <p className="text-sm font-semibold text-gray-800 mb-2">{row.label}</p>
          <HorizontalBar
            first={row.option1Pct}
            second={row.option2Pct}
            option1={row.option1Label}
            option2={row.option2Label}
          />
        </div>
      ))}
    </div>
  );
};

export default MatchupDistributionGrid;

