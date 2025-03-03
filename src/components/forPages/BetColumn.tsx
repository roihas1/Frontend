import { Paper, Typography, Tooltip } from "@mui/material";

const BetColumn = ({
  betsData,
  isSpontaneous,
}: {
  betsData: any;
  isSpontaneous: boolean;
}) => {
  const opacity = 0.218;
  console.log(betsData);
  return (
    <div className="flex flex-col space-y-2">
      {!isSpontaneous && (
        // {/* BestOf7Bet */}
        <>
          <div>
            <Paper
              sx={{
                padding: 1,
                backgroundColor: `rgba(107, 144, 225,${opacity})`,
              }}
            >
              <Typography
                className="text-md truncate"
                sx={{ fontSize: "14px" }}
              >
                Number Of Games <strong>({betsData.bestOf7Bet.result})</strong>
              </Typography>
            </Paper>
          </div>

          <div>
            <Tooltip
              title={
                <Typography className="text-md truncate">
                  Series Winner{" "}
                  <strong>
                    (
                    {betsData.teamWinBet.result === 1
                      ? betsData.team1
                      : betsData.teamWinBet.result === 0
                      ? "Tie"
                      : betsData.team2}
                    )
                  </strong>
                </Typography>
              }
              arrow
              placement="top"
            >
              <Paper
                sx={{
                  padding: 1,
                  backgroundColor: `rgba(107, 144, 225,${opacity})`,
                }}
              >
                <Typography
                  className="text-md truncate"
                  sx={{ fontSize: "14px" }}
                >
                  Series Winner{" "}
                  <strong>
                    (
                    {betsData.teamWinBet.result === 1
                      ? betsData.team1
                      : betsData.teamWinBet.result === 0
                      ? "Tie"
                      : betsData.team2}
                    )
                  </strong>
                </Typography>
              </Paper>
            </Tooltip>
          </div>
        </>
      )}

      {/* PlayerMatchupBets */}
      <div>
        <Typography className="text-md" gutterBottom sx={{ fontSize: "14px" }}>
          Player Matchup Bets
        </Typography>
        {((!isSpontaneous && betsData.playerMatchupBets.length === 0) ||
          (isSpontaneous && betsData.spontaneousBets.length === 0)) && (
          <Typography sx={{ fontSize: "14px", color: "gray" }}>
            No bets available.
          </Typography>
        )}
        {(isSpontaneous
          ? betsData.spontaneousBets
          : betsData.playerMatchupBets
        ).map((matchup: any, index: number) => (
          <Paper
            key={index}
            sx={{
              padding: 1,
              marginBottom: 1,
              backgroundColor: `rgba(107, 144, 225,${opacity + 0.5})`,
            }}
          >
            <Tooltip
              title={
                <Typography className="text-xs ">
                  {matchup.player1} vs {matchup.player2} (
                  {matchup.categories.join(" & ")}){" "}
                  <strong>
                    (
                    {matchup.result === null
                      ? `[${matchup.currentStats[0]}, ${
                          matchup.currentStats[1] + matchup.differential
                        }]`
                      : matchup.result === 1
                      ? matchup.player1
                      : matchup.player2}
                    )
                  </strong>
                </Typography>
              }
              placement="top"
              arrow
            >
              <Typography
                className="text-xs truncate"
                sx={{ fontSize: "14px" }}
              >
                {matchup.player1} vs {matchup.player2} (
                {matchup.categories.join(" & ")}){" "}
                <strong>
                  (
                  {matchup.result === null
                    ? `[${matchup.currentStats[0]}, ${
                        matchup.currentStats[1] + matchup.differential
                      }]`
                    : matchup.result === 1
                    ? matchup.player1
                    : matchup.player2}
                  )
                </strong>
              </Typography>
            </Tooltip>
          </Paper>
        ))}
      </div>
    </div>
  );
};
export default BetColumn;
