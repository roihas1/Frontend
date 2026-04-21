import React from "react";
import { Skeleton } from "@mui/material";
import { useComparingPageModel } from "./comparing/useComparingPageModel";
import ComparingPageDesktopView from "./comparing/ComparingPageDesktopView";
import ComparingPageMobileView from "./comparing/ComparingPageMobileView";

const ComparingPage: React.FC = () => {
  const model = useComparingPageModel();

  if (model.pageLoading) {
    return (
      <div className="w-full px-2 md:px-8 py-3 space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <Skeleton variant="rounded" width={180} height={40} />
          <Skeleton variant="rounded" width={220} height={40} />
          <Skeleton variant="rounded" width={260} height={40} />
        </div>
        <Skeleton variant="rounded" width="32%" height={34} />
        <div className="flex gap-4 overflow-hidden">
          <div className="hidden md:block w-1/5 min-w-[180px] space-y-2">
            <Skeleton variant="rounded" height={44} />
            {Array.from({ length: 8 }).map((_, idx) => (
              <Skeleton key={idx} variant="rounded" height={34} />
            ))}
          </div>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton key={idx} variant="rounded" height={180} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return model.isMobile ? (
    <ComparingPageMobileView {...model} />
  ) : (
    <ComparingPageDesktopView {...model} />
  );
};

export default ComparingPage;
