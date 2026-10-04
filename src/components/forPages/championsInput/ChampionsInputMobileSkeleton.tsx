import React from "react";
import { Skeleton } from "@mui/material";

interface ChampionsInputMobileSkeletonProps {
  showMatchups: boolean;
}

const ChampionsInputMobileSkeleton: React.FC<
  ChampionsInputMobileSkeletonProps
> = ({ showMatchups }) => {
  const cardCount = showMatchups ? 5 : 2;

  return (
    <div
      className="flex min-h-0 flex-1 flex-col"
      aria-busy="true"
      aria-label="Loading champion picks"
    >
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
        <Skeleton variant="rounded" height={88} sx={{ borderRadius: 16 }} />
        {Array.from({ length: cardCount }).map((_, index) => (
          <Skeleton
            key={index}
            variant="rounded"
            height={index < 3 && showMatchups ? 156 : 120}
            sx={{ borderRadius: 16 }}
          />
        ))}
      </div>
    </div>
  );
};

export default ChampionsInputMobileSkeleton;
