import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import { PlayerMatchupBet } from "../../types";
import { AllSeriesBets } from "../../types";
import { UsersGuessesMap } from "./useComparingPageModel";

const GREEN = "#ccffcc";

type GuessBlock = {
  label: string;
  actual: string;
  users: { userId: string; text: string; highlight: boolean }[];
};

function teamWinResultLabel(
  bets: AllSeriesBets[string],
): string {
  const r = bets.teamWinBet.result;
  if (r === 1) return bets.team1;
  if (r === 0) return "Tie";
  return bets.team2;
}

function matchupResultLabel(matchup: PlayerMatchupBet): string {
  if (matchup.result === null) {
    return `[${matchup.currentStats[0]}, ${
      matchup.currentStats[1] + matchup.differential
    }]`;
  }
  return matchup.result === 1 ? matchup.player1 : matchup.player2;
}

function buildGuessBlocks(
  allSeriesBets: AllSeriesBets,
  selectedSeries: string,
  usersGuesses: UsersGuessesMap | undefined,
  selectedUserIds: string[],
  isSpontaneous: boolean,
): GuessBlock[] {
  const bets = allSeriesBets[selectedSeries];
  if (!bets) return [];

  const blocks: GuessBlock[] = [];

  if (!isSpontaneous) {
    blocks.push({
      label: "Games",
      actual: String(bets.bestOf7Bet.result),
      users: selectedUserIds.map((userId) => {
        const g = usersGuesses?.[userId];
        const text =
          g?.bestOf7 != null ? String(g.bestOf7.guess) : "- No guess -";
        const highlight =
          !!g?.teamWon &&
          !!g?.bestOf7 &&
          bets.teamWinBet.result === g.teamWon.guess &&
          bets.bestOf7Bet.seriesScore.includes(4) &&
          bets.bestOf7Bet.result === g.bestOf7.guess;
        return { userId, text, highlight };
      }),
    });

    blocks.push({
      label: "Winner",
      actual: teamWinResultLabel(bets),
      users: selectedUserIds.map((userId) => {
        const g = usersGuesses?.[userId];
        const text = g?.teamWon
          ? g.teamWon.guess === 1
            ? bets.team1
            : bets.team2
          : "- No guess -";
        const highlight =
          !!g?.teamWon && bets.teamWinBet.result === g.teamWon.guess;
        return { userId, text, highlight };
      }),
    });
  }

  const matchupsList = isSpontaneous
    ? bets.spontaneousBets
    : bets.playerMatchupBets;

  matchupsList.forEach((matchup, index) => {
    const label = `${matchup.player1} vs ${matchup.player2} (${matchup.categories.join(" & ")})`;
    blocks.push({
      label,
      actual: matchupResultLabel(matchup),
      users: selectedUserIds.map((userId) => {
        const g = usersGuesses?.[userId];
        const list = isSpontaneous
          ? g?.spontaneousGuesses
          : g?.playerMatchups;
        const row = list?.[index] as
          | { guesses?: { guess: number }[]; player1: string; player2: string }
          | undefined;

        const notYet =
          isSpontaneous &&
          new Date(
            (bets.spontaneousBets[index]?.startTime as Date | string | undefined) ??
              0,
          ).getTime() > Date.now();

        if (
          !row?.guesses?.length ||
          (isSpontaneous && notYet)
        ) {
          return { userId, text: "- No guess -", highlight: false };
        }

        const pick = row.guesses[0].guess === 1 ? row.player1 : row.player2;
        let highlight = false;
        if (isSpontaneous) {
          const sb = bets.spontaneousBets[index];
          highlight =
            !!sb && sb.result === row.guesses[0].guess;
        } else {
          const pm = bets.playerMatchupBets[index];
          highlight =
            bets.playerMatchupBets.length > 0 &&
            !!pm &&
            pm.result === row.guesses[0].guess;
        }

        return { userId, text: pick, highlight };
      }),
    });
  });

  return blocks;
}

export function SeriesComparisonRows({
  allSeriesBets,
  selectedSeries,
  usersGuesses,
  selectedUserIds,
  isSpontaneous,
  userShortNames,
}: {
  allSeriesBets: AllSeriesBets;
  selectedSeries: string;
  usersGuesses: UsersGuessesMap | undefined;
  selectedUserIds: string[];
  isSpontaneous: boolean;
  userShortNames: Record<string, string>;
}) {
  const blocks = buildGuessBlocks(
    allSeriesBets,
    selectedSeries,
    usersGuesses,
    selectedUserIds,
    isSpontaneous,
  );

  if (blocks.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ px: 2, py: 2 }}>
        Select a series and users to compare.
      </Typography>
    );
  }

  return (
    <Box sx={{ px: 1, pb: 4 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `minmax(72px,0.9fr) minmax(64px,0.85fr) repeat(${Math.max(
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
          Actual
        </Typography>
        {selectedUserIds.map((id) => (
          <Typography
            key={id}
            variant="caption"
            fontWeight={600}
            sx={{ p: 0.5, textAlign: "center", overflow: "hidden" }}
            noWrap
          >
            {userShortNames[id] ?? id}
          </Typography>
        ))}

        {blocks.map((row, i) => (
          <React.Fragment key={`row-${i}`}>
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
            {row.users.map((u) => (
              <Paper
                key={u.userId}
                variant="outlined"
                sx={{
                  p: 0.75,
                  bgcolor: u.highlight ? GREEN : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="caption" textAlign="center">
                  {u.text}
                </Typography>
              </Paper>
            ))}
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
}
