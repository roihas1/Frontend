import {
  Accordion,
  AccordionSummary,
  Typography,
  AccordionDetails,
  Divider,
  Box,
  Modal,
  Tooltip,
} from "@mui/material";
// import betsExample from "../assets/Examples/Example.png";
import afterBetsClosed from "../assets/Examples/ClosedBets.png";
import beforeSeriesStart from "../assets/Examples/OpenBets.png";
import React, { useState } from "react";
import champExample from "../assets/Examples/Champ example.png";
interface ImgModalProps {
  imgSource: string;
  open: boolean;
  handleClose: () => void;
}
const HowToPlayPage: React.FC = () => {
  const [openImgBeforeStart, setOpenImgBeforeStart] = useState<boolean>(false);
  const [openImgChamp, setOpenImgChamp] = useState<boolean>(false);
  const [openImgClosedBets, setOpenImgClosedBets] = useState<boolean>(false);
  const handleOpenImgClosedBets = () => setOpenImgClosedBets(true);
  const handleCloseImgClosedBets = () => setOpenImgClosedBets(false);
  const handleOpenImgChamp = () => setOpenImgChamp(true);
  const handleCloseImgChamp = () => setOpenImgChamp(false);
  const handleOpenImgBeforeStart = () => setOpenImgBeforeStart(true);
  const handleCloseImgBeforeStart = () => setOpenImgBeforeStart(false);

  const ImgModal: React.FC<ImgModalProps> = ({
    imgSource,
    open,
    handleClose,
  }) => {
    if (!imgSource) return null; // Ensure the image source exists

    return (
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "white",
            boxShadow: 24,
            p: 2,
            borderRadius: "8px",
            outline: "none",
            maxWidth: "80%",
            maxHeight: "80%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={imgSource} // Image source from prop
            alt="Series Bets Explanation"
            className="max-w-full max-h-full rounded-md"
          />
        </Box>
      </Modal>
    );
  };
  return (
    <div className="flex flex-col justify-start  bg-gray-100 space-y-2 pt-4 pb-4">
      <div className="flex justify-center text-2xl font-semibold mb-8">
        <h1>Beyond the Bracket - How to play?</h1>
      </div>
      <div className="max-w-3xl mx-auto px-4 pb-6 text-center">
        <h2 className="text-2xl font-bold text-black mb-4">Introduction</h2>
        <p className="text-gray-700 text-lg leading-relaxed">
          Welcome to <strong>"Beyond the Bracket"</strong> — our NBA Playoffs
          competition! With five years of history behind it, it's now available
          on a web platform for the first time.
          <br />
          <br />
          This game goes deeper than just picking winners — you'll also bet on
          player stats and matchups throughout the playoffs. Test your NBA
          knowledge against friends by predicting not only which teams advance,
          but also how players perform head-to-head.
        </p>
      </div>

      <div className="flex justify-center mx-auto w-full max-w-screen-lg">
        <Accordion key="How to Play" className="mb-4 w-full">
          <AccordionSummary
            expandIcon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m19.5 8.25-7.5 7.5-7.5-7.5"
                />
              </svg>
            }
            aria-controls="panel-1-content"
            id="panel-1-header"
            className="hover:bg-colors-nba-yellow"
          >
            <Typography component="span">
              Your Journey Through the Playoffs
            </Typography>
          </AccordionSummary>

          <AccordionDetails>
            <div className="mb-8">
              <div className="flex justify-between items-start flex-col md:flex-row gap-4">
                <p className="m-6">
                  In <strong>"Beyond the Bracket"</strong>, you'll compete at
                  every stage of the NBA Playoffs. Start by picking conference
                  finalists, the champion, and Finals MVP before the playoffs
                  begin. Then for each playoff series, predict the winner,
                  number of games, and which players will have better stats.
                  After the first & second rounds, you will pick the champion
                  and MVP again. During the Conference and NBA Finals, you'll
                  also make bets on individual games. You earn points for each
                  correct prediction, with bigger rewards for tougher picks like
                  the champion. Your points add up throughout the playoffs until
                  a winner is crowned.
                </p>

                {/* <h1 className="text-2xl font-semibold mb-4">Champions bets</h1> */}
              </div>

              <h2 className="text-lg font-semibold mb-2 ml-8">
                <strong>How to play</strong> - Our game has three main betting
                categories:
              </h2>

              <ul className="list-disc pl-5 ml-16 space-y-4 mb-4">
                <li>
                  <div className="flex items-center gap-2">
                    <span>
                      <strong>Champions Bets</strong> – Predict conference
                      finalists, NBA champion, and Finals MVP
                    </span>
                    <Tooltip title="Champion bets" arrow placement="top">
                      <div className="shadow-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-8 h-8 cursor-pointer text-gray-700 bg-gray-100 p-1 rounded-md"
                          onClick={handleOpenImgChamp}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                          />
                        </svg>
                      </div>
                    </Tooltip>
                  </div>
                </li>

                <li>
                  <div className="flex items-center gap-2">
                    <span>
                      <strong>Series Bets</strong> – Predict each series winner,
                      number of games, and player matchup stats
                    </span>
                    <div className=" flex space-x-6 shadow-md">
                      <Tooltip
                        title="Before Series starts"
                        arrow
                        placement="top"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-8 h-8 cursor-pointer text-gray-700 bg-gray-100 p-1 rounded-md"
                          onClick={handleOpenImgBeforeStart}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                          />
                        </svg>
                      </Tooltip>
                      <Tooltip
                        title="After bets closed"
                        arrow
                        placement="right"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-8 h-8 cursor-pointer text-gray-700 bg-gray-100 p-1 rounded-md"
                          onClick={handleOpenImgClosedBets}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                          />
                        </svg>
                      </Tooltip>
                    </div>
                  </div>
                </li>

                <li>
                  <strong>Single Game Bets</strong> – Special bets during the
                  Conference and NBA Finals on player performance per game
                </li>
              </ul>

              <h2 className="text-lg font-bold mb-2 ml-8">
                Player Matchups Explained
              </h2>
              <p className="ml-8">
                In Player Matchups, we compare the averages of key stats like
                Points, Rebounds, and Assists between individual players (e.g.,
                LeBron vs. AD) or pairs of players (e.g., Jokic & Murray vs. AD
                & LeBron). It's important to note that missed games do not
                affect the players' averages, ensuring the comparison reflects
                their contributions only in the games they played.
              </p>
              <ImgModal
                imgSource={beforeSeriesStart}
                handleClose={handleCloseImgBeforeStart}
                open={openImgBeforeStart}
              />
              <ImgModal
                handleClose={handleCloseImgClosedBets}
                open={openImgClosedBets}
                imgSource={afterBetsClosed}
              />

              <ImgModal
                imgSource={champExample}
                open={openImgChamp}
                handleClose={handleCloseImgChamp}
              />
              {/*
        <h2 className="mb-2 ml-8">
          There are 3 stages for the champions bets, below are the bets in each one:
        </h2>
        <h3 className="text-lg font-semibold mb-2 ml-8">Before Playoffs:</h3>
        <ul className="list-disc pl-5 ml-16 space-y-3">
          <li>Which teams will reach the Eastern Finals?</li>
          <li>Which teams will reach the Western Finals?</li>
          <li>Which teams will reach the NBA Finals?</li>
          <li>Which team will win the championship?</li>
          <li>Who will be the finals MVP?</li>
        </ul> */}

              {/* <div className="mb-8 ml-8">
          <h2 className="text-lg font-semibold mb-4">After Round 1 (Conference Semi Finals):</h2>
          <ul className="list-disc pl-5 space-y-3 ml-8">
            <li>Which team will win the championship?</li>
            <li>Who will be the finals MVP?</li>
          </ul>
        </div> */}

              {/* <div className="mb-8 ml-8">
          <h2 className="text-lg font-semibold mb-4">After Round 2 (Conference Finals):</h2>
          <ul className="list-disc pl-5 space-y-3 ml-8">
            <li>Same as "After Round 1".</li>
          </ul>
        </div>
        <Divider sx={{ borderWidth: 1 }} /> */}

              {/* <div className="mb-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold mb-4 mt-2">Series Bets:</h2>
            <div className="shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-10 cursor-pointer text-gray-700 bg-gray-100 p-1 rounded-md"
                onClick={handleOpenImgSeries}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
            </div>
          </div>
          <ImgModal
            imgSource={betsExample}
            handleClose={handleCloseImgSeries}
            open={openImgSeries}
          />
          <ul className="list-disc pl-5 space-y-3 ml-8">
            <li>For each playoff series, you can bet on:</li>
            <ul className="list-inside list-disc pl-5 space-y-2">
              <li>The winning team in a 7-games series</li>
              <li>Number of games in the series (4-7)</li>
              <li>
                Pick a player to win a matchup:
                <ul className="list-[square] pl-5 ml-8 space-y-2">
                  <li className="mt-2">Matchups will be based on different <strong>types</strong> of stats (Points, Rebounds, Assists, etc.).</li>
                  <li>Matchups will be based on different players/number of players (e.g., AD VS LBJ or Jokic & Murray VS AD & LBJ).</li>
                  <li>The winning side will be based on the <strong>Average Stats by the end of the series</strong>.</li>
                  <li>(If a player did not play in a game during a series, it will not affect his AVG stats).</li>
                </ul>
              </li>
            </ul>
          </ul>
        </div> */}

              {/* <Divider sx={{ borderWidth: 1 }} /> */}

              {/* <div className="mb-8 mt-4">
          <h2 className="text-2xl font-semibold mb-4">Single Game Bets:</h2>
          <ul className="list-disc pl-5 space-y-3 ml-8">
            <li>Bets that appear only on Finals Series (East Con./West Con./Finals)</li>
            <li>These bets are <strong>aiming</strong> to a specific game.</li>
            <li>These bets are win/lose situation – Look on the Scoring part for more details.</li>
            <li>These bets can include any type of bet (winning team, player matchup, etc.)</li>
          </ul>
        </div> */}
            </div>
          </AccordionDetails>
        </Accordion>
      </div>

      <div className="flex justify-center mx-auto w-full max-w-screen-lg">
        <Accordion key={"Scoring"} className="mb-4 w-full  ">
          <AccordionSummary
            expandIcon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m19.5 8.25-7.5 7.5-7.5-7.5"
                />
              </svg>
            }
            aria-controls={`panel-${1}-content`}
            id={`panel-${1}-header`}
            className="hover:bg-colors-nba-yellow"
          >
            <Typography component="span">Scoring</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div>
              <div className="mb-4">
                <h1 className="text-2xl font-semibold underline mb-4">
                  {" "}
                  Champions bets
                </h1>
                <ul className=" pl-5 space-y-2">
                  <li>
                    <span className="underline font-semibold">
                      Pre-Playoffs:
                    </span>
                    <ul className="list-disc pl-10 space-y-2">
                      <li>
                        <span className="font-medium">
                          Conference Finals Teams:
                        </span>
                        <ul className="list-none pl-6">
                          <li>
                            - 4 points per correct team, 10 points for both
                            teams correct
                          </li>
                        </ul>
                      </li>
                      <li>
                        <span className="font-medium">Finals Teams:</span>
                        <ul className="list-none pl-6">
                          <li>
                            - 5 points per correct team, 12 points for both
                            teams correct
                          </li>
                        </ul>
                      </li>
                      <li>
                        <span className="font-medium">Champion and MVP:</span>
                        <ul className="list-none pl-6">
                          <li>
                            - 15 points for correct champion, 5 points for
                            correct Finals MVP
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </li>

                  <li>
                    <span className="underline font-semibold">
                      Mid-Playoffs (Both After Round 1 & 2):
                    </span>
                    <ul className="list-disc pl-10 space-y-2">
                      <li>
                        <span className="font-medium">Champion and MVP:</span>
                        <ul className="list-none pl-6">
                          <li>
                            - 4 points for correct champion, 2 points for
                            correct Finals MVP
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>
              <Divider sx={{ borderWidth: 1 }} />
              <div>
                <h1 className="text-2xl underline font-semibold mb-4 mt-4">
                  Series Bets
                </h1>
                <ul className="list-disc pl-5 ml-10 space-y-2 mb-4">
                  <li>6 points for correctly predicting the winning team</li>
                  <li>
                    4 points for correctly predicting the number of games
                    (Additional only if the correctly predicting the winning
                    team)
                  </li>
                  <li>2 points for each correct player matchup prediction</li>
                </ul>
              </div>
              <Divider sx={{ borderWidth: 1 }} />
              <div>
                <h1 className="text-2xl underline font-semibold mb-4 mt-4">
                  Single Game Bets
                </h1>
                <ul className="list-disc pl-5 ml-10 space-y-2 mb-2">
                  <li>Costs 1 point to place each bet</li>
                  <li>Earn 3 points for correct predictions</li>
                  <li>Result: +2 points for wins, -1 point for losses</li>
                </ul>
              </div>
              {/*
                <h3 className="text-lg font-semibold mb-2 ml-8">
                  East/West Conference Finals Teams
                </h3>
                <ul className="list-disc pl-5 ml-16 space-y-2 ">
                  <li>4 points for each correct team prediction</li>
                  <li>10 points total if both teams are correct</li>
                </ul>
                <h3 className="text-lg font-semibold mb-2 ml-8">
                  Finals Teams
                </h3>
                <ul className="list-disc pl-5 ml-16 space-y-2">
                  <li>5 points for each correct team prediction</li>
                  <li>12 points total if both teams are correct</li>
                </ul>

                <h3 className="text-lg font-semibold mb-2 ml-8">
                  Tournament Champion
                </h3>
                <ul className="list-disc pl-5 ml-16 space-y-2 mb-4">
                  <li>15 points for correctly predicting the champion</li>
                  <li>5 points for correctly predicting the Finals MVP</li>
                </ul>
              </div>
              <Divider sx={{ borderWidth: 1 }} />

              <div>
                <h1 className="text-2xl font-semibold mb-4 mt-4">
                  Series Bets
                </h1>
                <ul className="list-disc pl-5 ml-16 space-y-2 mb-4">
                  <li>6 points for correctly predicting the winning team</li>
                  <li>
                    4 points for correctly predicting the number of games
                    (Additional only if the correctly predicting the winning
                    team)
                  </li>
                  <li>2 points for each correct player matchup prediction</li>
                </ul>
              </div>
              <Divider sx={{ borderWidth: 1 }} />
              <div>
                <h1 className="text-2xl font-semibold mb-4 mt-4">
                  Single Game Bets (Veterans knows it as “Spontaneous Bets” )
                </h1>
                <ul className="list-disc pl-5 ml-16 space-y-2 mb-2">
                  <li>
                    You can win or lose when betting. When you win in a bet you
                    will receive 2 points. But, if you lose, 1 point will be
                    deducted.{" "}
                  </li>
                  <li>(-1) point deduction for placing a bet.</li>
                  <li>(+3) points for each correct prediction.</li>
                </ul>*/}
            </div>
          </AccordionDetails>
        </Accordion>
      </div>

      <div className="flex justify-center mx-auto w-full max-w-screen-lg">
        <Accordion key={"Deadlines"} className="mb-4 w-full">
          <AccordionSummary
            expandIcon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m19.5 8.25-7.5 7.5-7.5-7.5"
                />
              </svg>
            }
            aria-controls={`panel-${1}-content`}
            id={`panel-${1}-header`}
            className="hover:bg-colors-nba-yellow"
          >
            <Typography component="span">Deadlines</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div>
              <ul className="pl-5 ml-8 space-y-2 mb-4">
                <li>
                  <span className="font-semibold">Champions Bets</span> - All
                  champion bets due before any series in the playoffs starts
                </li>
                <li>
                  <span className="font-semibold">Series Bets </span> - All
                  series bets due before Game 1 of that specific series
                </li>
                <li>
                  <span className="font-semibold">Single Game Bets </span> - All
                  single game bets due before the specific game scheduled start
                  time
                </li>
                <li className="font-bold">
                  Note: All deadlines are based on scheduled game times. No
                  changes allowed after deadlines pass!
                </li>
              </ul>
              {/* <h1 className="text-2xl font-semibold mb-4 mt-4">
                  Champions Bets Deadlines
                </h1>
                <h3 className="text-md font-semibold mb-2 ml-8">
                  Place your bets before the deadline - once the deadline has
                  passed, no changes are allowed. Each series starts by the NBA
                  time scheduled, Not by tip-off time!
                </h3>
                <ul className="list-disc pl-5 ml-16 space-y-2 mb-4">
                  <li>
                    <span className="underline">East/West Finals</span> - Must
                    place bet before conference playoffs series begin
                  </li>
                  <li>
                    <span className="underline">Finals Winner</span> - Must
                    place bet before playoffs begin
                  </li>
                  <li>
                    <span className="underline">Tournament Champion</span> -
                    Must place bet before playoffs begin
                  </li>
                </ul>
              </div>
              <Divider sx={{ borderWidth: 1 }} />

              <div>
                <h1 className="text-2xl font-semibold mb-4 mt-4">
                  Series Bets Deadlines
                </h1>
                <h3 className="text-md font-semibold mb-2 ml-8">
                  All bets for a series must be placed before Game 1 schedualed
                  time. Each series has its own deadline.
                </h3>
              </div>

              <Divider sx={{ borderWidth: 1 }} />

              <div>
                <h1 className="text-2xl font-semibold mb-4 mt-4">
                  Single Game Bets Deadlines
                </h1>
                <h3 className="text-md font-semibold mb-2 ml-8">
                  Must place bets before the game begins.
                </h3> */}
            </div>
          </AccordionDetails>
        </Accordion>
      </div>
    </div>
  );
};

export default HowToPlayPage;
