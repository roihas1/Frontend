import React from "react";
import ChampionsClosePanel from "./ChampionsClosePanel";
import { useChampionsCloseModel } from "./useChampionsCloseModel";

const ChampionsClosePage: React.FC = () => {
  const model = useChampionsCloseModel();
  return <ChampionsClosePanel model={model} />;
};

export default ChampionsClosePage;
