import React from "react";
import { Paper, Tooltip, Typography } from "@mui/material";
import { nbaTeamsNicknamesReversed } from "./ChampionsInput";

interface TeamGuess {
  conference: string;
  team1?: string;
  team2?: string;
  team1Relation?: { name?: string | null } | null;
  team2Relation?: { name?: string | null } | null;
}

interface GuessData {
  championTeamGuesses: {
    team?: string;
    teamRelation?: { name?: string | null } | null;
  }[];
  mvpGuesses: { player: string }[];
  conferenceFinalGuesses: TeamGuess[];
}

interface ChampGuessColumnProps {
  guessData: GuessData | null;
  stage: string;
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

const resolveTeamName = (
  team?: string,
  relation?: { name?: string | null } | null,
) => relation?.name ?? team;

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
const ChampGuessColumn: React.FC<ChampGuessColumnProps> = ({
  guessData,
  stage,
}) => {
  if (!guessData) return null;

  // Extracting teams from guesses
  const getTeamsByConference = (conference: string) => {
    const guess = guessData.conferenceFinalGuesses.find(
      (g) => g.conference === conference
    );
    return guess
      ? {
          team1: resolveTeamName(guess.team1, guess.team1Relation),
          team2: resolveTeamName(guess.team2, guess.team2Relation),
        }
      : null;
  };

  const eastTeams = getTeamsByConference("East");
  const westTeams = getTeamsByConference("West");
  const finalsTeams = getTeamsByConference("Finals");
  return (
    <div className="flex flex-col space-y-2">
      {/* Champion Team Guess */}
      {guessData.championTeamGuesses.length > 0 ? (
        <GuessPaper
          text={
            resolveTeamName(
              guessData.championTeamGuesses[0].team,
              guessData.championTeamGuesses[0].teamRelation,
            ) ?? "-Looser didn't guess-"
          }
        />
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
      {stage == "Before playoffs" && (
        <>
          <TeamGuessRow {...eastTeams} />
          <TeamGuessRow {...westTeams} />
          <TeamGuessRow {...finalsTeams} />
        </>
      )}
    </div>
  );
};

export default ChampGuessColumn;
