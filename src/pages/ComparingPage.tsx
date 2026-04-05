import React from "react";
import { CircularProgress } from "@mui/material";
import { useComparingPageModel } from "./comparing/useComparingPageModel";
import ComparingPageDesktopView from "./comparing/ComparingPageDesktopView";
import ComparingPageMobileView from "./comparing/ComparingPageMobileView";

const ComparingPage: React.FC = () => {
  const model = useComparingPageModel();

  if (model.pageLoading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center  z-50">
        <CircularProgress />
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
