import React from "react";
import { LinearProgress } from "@mui/material";

interface PickProgressProps {
  stageLabel: string;
  deadlineLabel: string;
  pickedCount: number;
  totalPicks: number;
}

const PickProgress: React.FC<PickProgressProps> = ({
  stageLabel,
  deadlineLabel,
  pickedCount,
  totalPicks,
}) => {
  const progress = totalPicks === 0 ? 0 : (pickedCount / totalPicks) * 100;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-3 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-colors-nba-blue/10 px-2.5 py-1 text-xs font-semibold text-colors-nba-blue">
          {stageLabel}
        </span>
        <span className="text-xs font-medium text-gray-500">
          {pickedCount} of {totalPicks} picked
        </span>
      </div>
      <p className="mt-2 text-sm text-gray-600">
        Closes <span className="font-semibold text-gray-800">{deadlineLabel}</span>
      </p>
      <LinearProgress
        variant="determinate"
        value={progress}
        aria-label={`${pickedCount} of ${totalPicks} picks complete`}
        sx={{
          mt: 1.5,
          height: 8,
          borderRadius: 999,
          bgcolor: "grey.200",
          "& .MuiLinearProgress-bar": {
            borderRadius: 999,
            bgcolor: "#1D428A",
          },
        }}
      />
    </div>
  );
};

export default PickProgress;
