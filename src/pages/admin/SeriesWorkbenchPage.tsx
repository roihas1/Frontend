import React from "react";
import SeriesWorkbenchView from "./SeriesWorkbenchView";
import { useSeriesWorkbenchModel } from "./useSeriesWorkbenchModel";

const SeriesWorkbenchPage: React.FC = () => {
  const model = useSeriesWorkbenchModel();
  return <SeriesWorkbenchView model={model} />;
};

export default SeriesWorkbenchPage;
