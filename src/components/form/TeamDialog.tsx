import React from "react";
import { useMediaQuery, useTheme } from "@mui/material";
import TeamDialogDesktopView from "./teamDialog/TeamDialogDesktopView";
import TeamDialogMobileView from "./teamDialog/TeamDialogMobileView";
import {
  useTeamDialogModel,
  type TeamDialogProps,
} from "./teamDialog/useTeamDialogModel";

export type { TeamDialogProps };
export { HorizontalBar } from "./teamDialog/HorizontalBar";

export interface Team {
  image: string;
  seed: number;
  name: string;
}

export interface Bet {
  player1: string;
  player2: string;
  category: string[];
  differential: number;
}

const TeamDialog: React.FC<TeamDialogProps> = (props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"), {
    noSsr: true,
  });
  const model = useTeamDialogModel(props);

  if (isMobile) {
    return <TeamDialogMobileView {...model} />;
  }

  return <TeamDialogDesktopView {...model} />;
};

export default TeamDialog;
