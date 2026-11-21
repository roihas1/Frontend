import React from "react";
import TournamentStagesPanel from "./TournamentStagesPanel";
import { useTournamentStagesModel } from "./useTournamentStagesModel";

const AdminSetupPage: React.FC = () => {
  const model = useTournamentStagesModel();
  return <TournamentStagesPanel model={model} />;
};

export default AdminSetupPage;
