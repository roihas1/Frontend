import React from "react";
import { Paper, Tooltip, Typography } from "@mui/material";
import { nbaTeamsNicknamesReversed } from "./ChampionsInput";

interface TeamGuess {
  conference: string;
  team1: string;
  team2: string;
}

interface GuessData {
  championTeamGuesses: { team: string }[];
  mvpGuesses: { player: string }[];
  conferenceFinalGuesses: TeamGuess[];
}

interface ChampGuessColumnProps {
  guessData: GuessData | null;
}

// Reusable Component for Guess Rows (Eastern, Western, Finals)
const TeamGuessRow = ({ team1, team2 }: { team1?: string; team2?: string }) => {
  return (
    <div className="flex w-full">
      <GuessPaper
        text={
          team1 ? nbaTeamsNicknamesReversed[team1] : "- Looser didn't guess -"
        }
      />
      <GuessPaper
        text={
          team2 ? nbaTeamsNicknamesReversed[team2] : "- Looser didn't guess -"
        }
      />
    </div>
  );
};

// Reusable Component for Individual Guesses (Paper with Tooltip)
const GuessPaper = ({ text }: { text: string }) => {
  return (
    <Tooltip
      title={<Typography className="text-xs">{text}</Typography>}
      arrow
      placement="top"
    >
      <Paper
        sx={{
          padding: 1,
          backgroundColor: "rgba(0,0,0,0)",
          width: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        <Typography className="flex truncate justify-center text-xs">
          {text}
        </Typography>
      </Paper>
    </Tooltip>
  );
};

// Main Component
const ChampGuessColumn: React.FC<ChampGuessColumnProps> = ({ guessData }) => {
  if (!guessData) return null;

  // Extracting teams from guesses
  const getTeamsByConference = (conference: string) => {
    const guess = guessData.conferenceFinalGuesses.find(
      (g) => g.conference === conference
    );
    return guess ? { team1: guess.team1, team2: guess.team2 } : null;
  };

  const eastTeams = getTeamsByConference("East");
  const westTeams = getTeamsByConference("West");
  const finalsTeams = getTeamsByConference("Finals");

  return (
    <div className="flex flex-col space-y-2">
      {/* Champion Team Guess */}
      {guessData.championTeamGuesses.length > 0 ? (
        <GuessPaper text={guessData.championTeamGuesses[0].team} />
      ) : (
        <GuessPaper text="-Looser didn't guess-" />
      )}

      {/* MVP Guess */}
      {guessData.mvpGuesses.length > 0 ? (
        <GuessPaper text={guessData.mvpGuesses[0].player} />
      ) : (
        <GuessPaper text="-Looser didn't guess-" />
      )}

      {/* Conference Finals Guesses */}
      <TeamGuessRow {...eastTeams} />
      <TeamGuessRow {...westTeams} />
      <TeamGuessRow {...finalsTeams} />
    </div>
  );
};

export default ChampGuessColumn;
