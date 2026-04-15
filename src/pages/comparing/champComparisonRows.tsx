import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import { nbaTeamsNicknamesReversed } from "../../components/forPages/ChampionsInput";
import { UserChampGuessesMap } from "./useComparingPageModel";

type TeamGuess = {
  conference: string;
  team1: string;
  team2: string;
};

type ChampGuess = {
  conferenceFinalGuesses: TeamGuess[];
  championTeamGuesses: { team: string }[];
  mvpGuesses: { player: string }[];
};

function nick(team?: string) {
  if (!team) return "- No guess -";
  return nbaTeamsNicknamesReversed[team] ?? team;
}

function getTeamsByConference(
  guessData: ChampGuess | undefined,
  conference: string,
) {
  const g = guessData?.conferenceFinalGuesses?.find(
    (x) => x.conference === conference,
  );
  return g ? { team1: g.team1, team2: g.team2 } : null;
}

type RowDef = {
  label: string;
  actual: string;
  getUserCell: (
    guessData: ChampGuess | undefined,
  ) => { text: string; highlight: boolean };
};

function rowsForStage(stage: string): RowDef[] {
  const base: RowDef[] = [
    {
      label: "Champion",
      actual: "—",
      getUserCell: (g) => {
        const guesses = g?.championTeamGuesses;
        return {
          text:
            guesses && guesses.length > 0
              ? guesses[0].team
              : "- No guess -",
          highlight: false,
        };
      },
    },
    {
      label: "MVP",
      actual: "—",
      getUserCell: (g) => {
        const guesses = g?.mvpGuesses;
        return {
          text:
            guesses && guesses.length > 0
              ? guesses[0].player
              : "- No guess -",
          highlight: false,
        };
      },
    },
  ];

  if (stage !== "Before playoffs") {
    return base;
  }

  return [
    ...base,
    {
      label: "East (T1 / T2)",
      actual: "—",
      getUserCell: (g) => {
        const t = getTeamsByConference(g, "East");
        return {
          text: t
            ? `${nick(t.team1)} / ${nick(t.team2)}`
            : "- No guess -",
          highlight: false,
        };
      },
    },
    {
      label: "West (T1 / T2)",
      actual: "—",
      getUserCell: (g) => {
        const t = getTeamsByConference(g, "West");
        return {
          text: t
            ? `${nick(t.team1)} / ${nick(t.team2)}`
            : "- No guess -",
          highlight: false,
        };
      },
    },
    {
      label: "Finals (T1 / T2)",
      actual: "—",
      getUserCell: (g) => {
        const t = getTeamsByConference(g, "Finals");
        return {
          text: t
            ? `${nick(t.team1)} / ${nick(t.team2)}`
            : "- No guess -",
          highlight: false,
        };
      },
    },
  ];
}

export function ChampComparisonRows({
  stage,
  userChampGuesses,
  selectedUserIds,
  userShortNames,
}: {
  stage: string;
  userChampGuesses: UserChampGuessesMap | undefined;
  selectedUserIds: string[];
  userShortNames: Record<string, string>;
}) {
  const rows = rowsForStage(stage);

  return (
    <Box sx={{ px: 1, pb: 4 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `minmax(80px,1fr) minmax(48px,0.5fr) repeat(${Math.max(
            selectedUserIds.length,
            1,
          )}, minmax(0,1fr))`,
          gap: 0.5,
          alignItems: "stretch",
        }}
      >
        <Typography variant="caption" fontWeight={600} sx={{ p: 0.5 }}>
          Prop
        </Typography>
        <Typography variant="caption" fontWeight={600} sx={{ p: 0.5 }}>
          Key
        </Typography>
        {selectedUserIds.map((id) => (
          <Typography
            key={id}
            variant="caption"
            fontWeight={600}
            sx={{ p: 0.5, textAlign: "center" }}
            noWrap
          >
            {userShortNames[id] ?? id}
          </Typography>
        ))}

        {rows.map((row, i) => (
          <React.Fragment key={`champ-${i}`}>
            <Paper
              variant="outlined"
              sx={{ p: 0.75, display: "flex", alignItems: "center" }}
            >
              <Typography variant="caption" sx={{ lineHeight: 1.2 }}>
                {row.label}
              </Typography>
            </Paper>
            <Paper
              variant="outlined"
              sx={{
                p: 0.75,
                bgcolor: "rgba(107, 144, 225, 0.22)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="caption" textAlign="center">
                {row.actual}
              </Typography>
            </Paper>
            {selectedUserIds.map((uid) => {
              const g = userChampGuesses?.[uid] as ChampGuess | undefined;
              const cell = row.getUserCell(g);
              return (
                <Paper
                  key={uid}
                  variant="outlined"
                  sx={{
                    p: 0.75,
                    bgcolor: cell.highlight ? "#ccffcc" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="caption" textAlign="center">
                    {cell.text}
                  </Typography>
                </Paper>
              );
            })}
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
}
