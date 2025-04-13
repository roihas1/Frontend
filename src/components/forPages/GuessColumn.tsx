import { Paper, Typography, Tooltip, CircularProgress } from "@mui/material";
import { AllSeriesBets } from "../../types";

const GuessColumn = ({
  guessData,
  isSpontaneous,
  allSeriesBets,
  selectedSeries,
  isLoading,
}: {
  guessData: any;
  isSpontaneous: boolean;
  allSeriesBets: AllSeriesBets;
  selectedSeries: string;
  isLoading:boolean
}) => {
  if(isLoading){
  return (
        <div className="fixed inset-0 flex justify-center items-center  z-50">
          <CircularProgress />
        </div>
      );
    }

  return (
    <div className="flex flex-col space-y-2">
      {/* BestOf7Bet */}
      {!isSpontaneous && (
        <>
          {guessData.bestOf7 && (
            <div>
              <Paper
                sx={{
                  padding: 1,
                  backgroundColor: `${
                    allSeriesBets[selectedSeries].bestOf7Bet.result ===
                    guessData.bestOf7.guess
                      ? "#ccffcc"
                      : "rgba(0,0,0,0)"
                  }`,
                }}
              >
                {/* <Typography className="text-md" gutterBottom>
              Number Of Games
            </Typography> */}
                <Typography
                  className={`flex justify-center`}
                  variant="body1"
                  sx={{ fontSize: "14px" }}
                >
                  {guessData.bestOf7.guess}
                </Typography>
              </Paper>
            </div>
          )}
          {!guessData.bestOf7 && (
            <Tooltip
              title={
                <Typography className="flex justify-center text-xs">
                  - Looser didn't guess -
                </Typography>
              }
              arrow
              placement="bottom"
            >
              <Paper
                sx={{
                  padding: 1,
                  backgroundColor: "rgba(0,0,0,0)", // Transparent background
                }}
              >
                <Typography
                  className="flex truncate justify-center text-xs"
                  sx={{ fontSize: "14px" }}
                >
                  - Looser didn't guess -
                </Typography>
              </Paper>
            </Tooltip>
          )}

          {/* TeamWinBet */}
          {guessData.teamWon && (
            <div>
              <Tooltip
                title={
                  <Typography className="items-center text-xs">
                    {guessData.teamWon.guess === 1
                      ? allSeriesBets[selectedSeries].team1
                      : allSeriesBets[selectedSeries].team2}
                  </Typography>
                }
                placement="top"
                arrow
              >
                <Paper
                  sx={{
                    padding: 1,
                    backgroundColor: `${
                      allSeriesBets[selectedSeries].teamWinBet.result ===
                      guessData.teamWon.guess
                        ? "#ccffcc"
                        : "rgba(0,0,0,0)"
                    }`,
                    display: "flex", // Enable flexbox
                    justifyContent: "center", // Horizontally center content
                    alignItems: "center",
                  }}
                >
                  <Typography
                    className="justify-center truncate items-center text-xs"
                    sx={{ fontSize: "14px" }}
                  >
                    {guessData.teamWon.guess === 1
                      ? allSeriesBets[selectedSeries].team1
                      : allSeriesBets[selectedSeries].team2}
                  </Typography>
                </Paper>
              </Tooltip>
            </div>
          )}
          {!guessData.teamWon && (
            <Tooltip
              title={
                <Typography className="flex justify-center text-xs">
                  - Looser didn't guess -
                </Typography>
              }
              arrow
              placement="bottom"
            >
              <Paper
                sx={{
                  padding: 1,
                  backgroundColor: "rgba(0,0,0,0)", // Transparent background
                }}
              >
                <Typography
                  className="flex truncate justify-center text-xs"
                  sx={{ fontSize: "14px" }}
                >
                  - Looser didn't guess -
                </Typography>
              </Paper>
            </Tooltip>
          )}
        </>
      )}
      {/* PlayerMatchupGuess */}

      <div>
        <Tooltip
          title={<Typography>Player Matchups</Typography>}
          arrow
          placement="left"
        >
          <Typography
            className="text-md truncate"
            gutterBottom
            sx={{ fontSize: "14px" }}
          >
            Player Matchups
          </Typography>
        </Tooltip>
        {((!isSpontaneous && guessData.playerMatchups.length === 0) ||
          (isSpontaneous && guessData.spontaneousGuesses.length === 0)) && (
          <Typography sx={{ fontSize: "14px", color: "gray" }}>
            No guesses available.
          </Typography>
        )}

        {/* Determine which list to render */}
        {(isSpontaneous
          ? guessData.spontaneousGuesses
          : guessData.playerMatchups
        ).map((matchup: any, index: number) => {
          // Check if guesses is undefined
          if (matchup.guesses.length === 0) {
            return (
              <Tooltip
                key={index + 10}
                title={
                  <Typography className="flex justify-center text-xs">
                    - Looser didn't guess -
                  </Typography>
                }
                arrow
                placement="bottom"
              >
                <Paper
                  key={index}
                  sx={{
                    padding: 1,
                    marginBottom: 1,
                    backgroundColor: "rgba(0,0,0,0)", // Transparent background
                  }}
                >
                  <Typography
                    className="flex truncate justify-center text-xs"
                    sx={{ fontSize: "14px" }}
                  >
                    - Looser didn't guess -
                  </Typography>
                </Paper>
              </Tooltip>
            );
          }

          // Render Paper for matchups with guesses
          return (
            <Tooltip
              key={index}
              title={
                <Typography className="flex justify-center text-xs">
                  {matchup.guesses[0].guess === 1
                    ? matchup.player1
                    : matchup.player2}
                </Typography>
              }
              arrow
              placement="top"
            >
              <Paper
                key={index}
                sx={{
                  padding: 1,
                  marginBottom: 1,
                  backgroundColor: `${
                    isSpontaneous
                      ? allSeriesBets[selectedSeries].spontaneousBets.length > 0
                        ? allSeriesBets[selectedSeries].spontaneousBets[index]
                            .result === matchup.guesses[0].guess
                          ? "#ccffcc"
                          : "rgba(0,0,0,0)"
                        : "rgba(0,0,0,0)"
                      : allSeriesBets[selectedSeries].playerMatchupBets.length >
                        0
                      ? allSeriesBets[selectedSeries].playerMatchupBets[index]
                          .result === matchup.guesses[0].guess
                        ? "#ccffcc"
                        : "rgba(0,0,0,0)"
                      : "rgba(0,0,0,0)"
                  }`,
                }}
              >
                <Typography
                  className="flex justify-center text-xs"
                  sx={{ fontSize: "14px" }}
                >
                  {matchup.guesses[0].guess === 1
                    ? matchup.player1
                    : matchup.player2}
                </Typography>
              </Paper>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
};
export default GuessColumn;
