import React, { useEffect, useState } from "react";
import NBASeedCard from "../components/forPages/NBASeedCard";
// import { Team } from "../components/form/TeamDialog";
import bostonCelticsLogo from "../assets/boston_logo.png";
import losAngelesLakersLogo from "../assets/los_angeles_lakers_logo.png";
import memphisGrizzliesLogo from "../assets/memphis_grizzlies_logo.png";
import goldenStateWarriorsLogo from "../assets/golden_state_warriors_logo.png";
import portlandTrailBlazersLogo from "../assets/portland_trail_blazers_logo.png";
import phoenixSunsLogo from "../assets/phoenix_suns_logo.png";
import utahJazzLogo from "../assets/utah_jazz_logo.png";
import dallasMavericksLogo from "../assets/dallas_mavericks_logo.png";
import denverNuggetsLogo from "../assets/denver_nuggets_logo.png";
import washingtonWizardsLogo from "../assets/washington_wizards_logo.png";
import miamiHeatLogo from "../assets/miami_heat_logo.gif";
import brooklynNetsLogo from "../assets/brooklyn_nets_logo.png";
import milwaukeeBucksLogo from "../assets/milwaukee_bucks_logo.png";
import chicagoBullsLogo from "../assets/chicago_bulls_logo.png";
import torontoRaptorsLogo from "../assets/toronto_raptors_logo.png";
import philadelphia76ersLogo from "../assets/philadelphia_76ers_logo.png";
import indianaPacersLogo from "../assets/indiana_pacers_logo.png";
import newYorkKnicksLogo from "../assets/new_york_knicks_logo.png";
import atlantaHawksLogo from "../assets/atlanta_hawks_logo.png";
import charlotteHornetsLogo from "../assets/charlotte__hornets_logo.png";
import clevelandCavaliersLogo from "../assets/cleveland_cavaliers_logo.png";
import detroitPistonsLogo from "../assets/detroit_pistons_logo.png";
import minnesotaTimberwolvesLogo from "../assets/minnesota_timberwolves_logo.png";
import oklahomaCityThunderLogo from "../assets/okc_logo.png";
import sacramentoKingsLogo from "../assets/sacramento_kings_logo.png";
import losAngelesClippersLogo from "../assets/los_angeles_clippers_logo.png";
import orlandoMagicLogo from "../assets/orlando_magic_logo.png";
import sanAntonioSpursLogo from "../assets/san_antonio_spurs_logo.png";
import houstonRocketsLogo from "../assets/houston_rockets_logo.png";
import newOrleansPelicansLogo from "../assets/new_orleans_pelicans_logo.png";
import Logo from "../assets/export/logo_color_trans.png";
import axiosInstance from "../api/axiosInstance";
import { MatchupCategory, PlayerMatchupType } from "../types/index";
import ChampionsInput from "../components/forPages/ChampionsInput";
import { useError } from "../components/providers&context/ErrorProvider";
import Tooltip from "@mui/material/Tooltip";
import { CircularProgress, Zoom } from "@mui/material";
import { checkTokenExpiration } from "../types";
import PageBackground from "../components/common/PageBackground";
import backgroundLogo from "../assets/export/gray_only_ball_trans.png";
export interface PlayerMatchupBet {
  betId: string;
  seriesId: string;
  typeOfMatchup: PlayerMatchupType;
  categories: MatchupCategory[];
  fantasyPoints: number;
  player1: string;
  player2: string;
  differential: number;
  result: number;
  currentStats: number[];
  playerGames: number[];
}
export interface Series {
  id?: string;
  team1: string;
  team2: string;
  dateOfStart: Date;
  bestOf7BetId?: string;
  teamWinBetId?: string;
  conference: "West" | "East" | "Finals";
  round: string;
  seed1: number;
  seed2: number;
  logo1?: string;
  logo2?: string;
  playerMatchupBets?: PlayerMatchupBet[];
  numOfGames: number;
  timeOfStart: string;
  lastUpdate: Date;
}
// interface ChampionTeamGuess {
//   id: string;
//   fantasyPoints: number;
//   team: string;
// }
// interface ConferenceFinalGuess {
//   id: string;
//   fantasyPoints: number;
//   team1: string;
//   team2: string;
//   conference: "West" | "East" | "Finals";
// }
// interface MVPGuess {
//   id: string;
//   fantasyPoints: number;
//   player: string;
// }
// interface Stage {
//   championTeamGuess: ChampionTeamGuess;
//   conferenceFinalGuess: ConferenceFinalGuess;
//   mvpGuess: MVPGuess;
//   name: string;
//   startDate: Date;
// }
const nbaTeams = {
  "Atlanta Hawks": "Hawks",
  "Boston Celtics": "Celtics",
  "Brooklyn Nets": "Nets",
  "Charlotte Hornets": "Hornets",
  "Chicago Bulls": "Bulls",
  "Cleveland Cavaliers": "Cavs",
  "Dallas Mavericks": "Mavs",
  "Denver Nuggets": "Nuggets",
  "Detroit Pistons": "Pistons",
  "Golden State Warriors": "Warriors",
  "Houston Rockets": "Rockets",
  "Indiana Pacers": "Pacers",
  "Los Angeles Clippers": "Clippers",
  "Los Angeles Lakers": "Lakers",
  "Memphis Grizzlies": "Grizzlies",
  "Miami Heat": "Heat",
  "Milwaukee Bucks": "Bucks",
  "Minnesota Timberwolves": "Wolves",
  "New Orleans Pelicans": "Pelicans",
  "New York Knicks": "Knicks",
  "Oklahoma City Thunder": "Thunder",
  "Orlando Magic": "Magic",
  "Phoenix Suns": "Suns",
  "Philadelphia 76ers": "Sixers",
  "Portland Trail Blazers": "Blazers",
  "Sacramento Kings": "Kings",
  "San Antonio Spurs": "Spurs",
  "Toronto Raptors": "Raptors",
  "Utah Jazz": "Jazz",
  "Washington Wizards": "Wizards",
};
const logos: Record<string, string> = {
  atlanta_hawks: atlantaHawksLogo,
  boston_celtics: bostonCelticsLogo,
  brooklyn_nets: brooklynNetsLogo,
  charlotte_hornets: charlotteHornetsLogo,
  chicago_bulls: chicagoBullsLogo,
  cleveland_cavaliers: clevelandCavaliersLogo,
  dallas_mavericks: dallasMavericksLogo,
  denver_nuggets: denverNuggetsLogo,
  detroit_pistons: detroitPistonsLogo,
  golden_state_warriors: goldenStateWarriorsLogo,
  houston_rockets: houstonRocketsLogo,
  indiana_pacers: indianaPacersLogo,
  los_angeles_clippers: losAngelesClippersLogo,
  los_angeles_lakers: losAngelesLakersLogo,
  memphis_grizzlies: memphisGrizzliesLogo,
  miami_heat: miamiHeatLogo,
  milwaukee_bucks: milwaukeeBucksLogo,
  minnesota_timberwolves: minnesotaTimberwolvesLogo,
  new_orleans_pelicans: newOrleansPelicansLogo,
  new_york_knicks: newYorkKnicksLogo,
  oklahoma_city_thunder: oklahomaCityThunderLogo,
  orlando_magic: orlandoMagicLogo,
  phoenix_suns: phoenixSunsLogo,
  philadelphia_76ers: philadelphia76ersLogo,
  portland_trail_blazers: portlandTrailBlazersLogo,
  sacramento_kings: sacramentoKingsLogo,
  san_antonio_spurs: sanAntonioSpursLogo,
  toronto_raptors: torontoRaptorsLogo,
  utah_jazz: utahJazzLogo,
  washington_wizards: washingtonWizardsLogo,
};
const HomePage: React.FC = () => {
  const { showError } = useError();
  const [series, setSeries] = useState<{
    west: Series[];
    east: Series[];
    finals: Series[];
  }>({
    west: [],
    east: [],
    finals: [],
  });
  const [showInput, setShowInput] = useState<boolean>(false);
  const [stage, setStage] = useState<string>("");
  const [stageStartDate, setStageStartDate] = useState<Date>(new Date());
  const [userPointsPerSeries, setUserPointsPerSeries] = useState<{
    [key: string]: number;
  } | null>(null);
  const [isPartialGuess, setIspartialGuess] = useState<{
    [key: string]: boolean;
  }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const getSeries = async () => {
    setLoading(true);
    try {
      const updatedSeries: {
        west: Series[];
        east: Series[];
        finals: Series[];
      } = {
        west: [],
        east: [],
        finals: [],
      };
      const capitalize = (str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      };
      const response = await axiosInstance.get("/series");
      const seriesData = response.data; // Assuming the response is an array of series

      seriesData.forEach((element: Series) => {
        // console.log(element);
        const team1Logo = logos[element.team1.toLowerCase().replace(/ /g, "_")];
        const team2Logo = logos[element.team2.toLowerCase().replace(/ /g, "_")];
        const series: Series = {
          id: element.id,
          team1: nbaTeams[element.team1], //capitalize(element.team1.split(" ").pop()),
          team2: nbaTeams[element.team2], //capitalize(element.team2.split(" ").pop()),
          dateOfStart: new Date(element.dateOfStart), // Convert date string to Date object
          bestOf7BetId: element.bestOf7BetId || "", // If these are optional, use a fallback value
          teamWinBetId: element.teamWinBetId || "",
          conference: element.conference,
          round: element.round,
          seed1: element.seed1,
          seed2: element.seed2,
          logo1: team1Logo, // If you want to fetch logos, you can add logic here
          logo2: team2Logo,
          playerMatchupBets: element.playerMatchupBets || [], // Initialize playerMatchupBets if undefined
          timeOfStart: element.timeOfStart,
          lastUpdate: element.lastUpdate,
        };
        // Push series into the correct conference array based on the "conference" field
        if (series.conference === "West") {
          updatedSeries.west.push(series);
        } else if (series.conference === "East") {
          updatedSeries.east.push(series);
        } else {
          updatedSeries.finals.push(series);
        }
      });

      setSeries(updatedSeries);
    } catch (err) {
      console.error("Error fetching series data:", err);
      showError("Error fetching series data");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };
  const checkIfGuessed = async () => {
    try {
      const response = await axiosInstance.get(`/playoffs-stage/checkGuess/`, {
        params: {
          stage: stage,
        },
      });

      setShowInput(response.data);
    } catch (error) {
      console.log(error);
      showError("Server Error.");
    }
  };
  const hideInputAfterSubmit = () => {
    setShowInput(false);
  };
  const getPlayoffsStage = async () => {
    try {
      const response = await axiosInstance.get("/playoffs-stage");
      let flag = true;
      const stages = response.data;
      for (const round of stages) {
        const startDate = new Date(round.startDate);
        const time = round.timeOfStart.split(":");
        startDate.setHours(parseInt(time[0]));
        startDate.setMinutes(parseInt(time[1]));
        if (new Date(startDate) > new Date()) {
          setStage(round.name);
          setStageStartDate(startDate);
          flag = false;
          break;
        }
      }
      if (flag) {
        setStage("Finish");
      }
    } catch (error) {
      console.log(error);
      showError("Server Error.");
    }
  };
  const checkIfGuessSeriesBetting = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`series/isUserGuessed/All`);
      setIspartialGuess(response.data);
    } catch (error) {
      showError(`Failed to check guesses ${error}`);
    } finally {
      setLoading(false);
    }
  };
  checkTokenExpiration();
  useEffect(() => {
    if (stage && stage != "Finish") {
      checkIfGuessed();
    }
  }, [stage]);
  const getUserPointsPerSeries = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        "series/getOverallPoints/allSeries"
      );
      setUserPointsPerSeries(response.data);
    } catch (error) {
      showError(`Failed to get user's points.`);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getUserPointsPerSeries();
  }, []);
  useEffect(() => {
    getSeries();
    getPlayoffsStage();
    checkIfGuessSeriesBetting();
  }, []);

  const sortMatchups = (matchups: Series[]) => {
    return matchups.sort((a, b) => {
      // Define the seed pairs order
      const seedOrder = [
        [1, 8],
        [4, 5],
        [2, 7],
        [3, 6],
      ];

      // Function to get the position of the pair
      const getSeedPairIndex = (seed: number) => {
        return seedOrder.findIndex((pair) => pair.includes(seed));
      };

      // Get the positions of both seeds in the matchup
      const aIndex = getSeedPairIndex(a.seed1);
      const bIndex = getSeedPairIndex(b.seed1);

      // Compare the positions of the seeds
      if (aIndex !== bIndex) {
        return aIndex - bIndex; // Sort by seed pair order
      }

      // If both matchups are in the same pair, sort by seed number within the pair
      return a.seed1 - b.seed1;
    });
  };

  const Round = ({
    matchups,
    roundName,
    className,
  }: {
    matchups: Series[];
    roundName: string;
    className?: string;
  }) => {
    // Sort matchups by seed
    const sortedMatchups = sortMatchups(matchups);

    let placeholderCount = 0;
    if (roundName === "Conference Semifinals" && sortedMatchups.length === 0) {
      placeholderCount = 2;
    } else if (
      roundName === "Conference Semifinals" &&
      sortedMatchups.length === 1
    ) {
      placeholderCount = 1;
    } else if (
      (roundName === "Conference Finals" && sortedMatchups.length === 0) ||
      (roundName === "Finals" && sortedMatchups.length === 0)
    ) {
      placeholderCount = 1;
    }
    const placeholders = Array.from({ length: placeholderCount }, (_, idx) => (
      <div
        key={idx}
        className={`bg-white shadow-lg rounded-lg p-2 m-2 max-w-xs mx-auto ${
          idx == 1
            ? "mt-56"
            : placeholderCount === 1 && roundName === "Conference Semifinals"
            ? "mt-48"
            : "mt-8"
        }`}
      >
        <div className="flex flex-col items-center justify-center rounded-md">
          <div className="relative">
            <img
              src={Logo}
              alt="NBA Logo"
              className="w-14 h-14 object-contain rounded-2xl"
            />
          </div>
          <p className="text-xs font-bold text-gray-700 mt-2 text-center">
            Waiting for Matchup
          </p>
        </div>
      </div>
    ));

    const positionToPlace =
      sortedMatchups[0]?.seed1 === 1 || sortedMatchups[0]?.seed1 === 8;
    // check where to position the placeholder in case there is one series only in semi finals
    // If there are matchups, render them
    if (sortedMatchups.length > 0) {
      return (
        <div className={`flex flex-col ${className}`}>
          <h3 className="text-sm font-semibold text-gray-500 mb-6 text-center break-words">
            {roundName}
          </h3>
          {placeholderCount === 1 && !positionToPlace && placeholders}
          <div className="flex flex-col justify-around">
            {sortedMatchups.map((matchup, idx) => {
              const time = matchup.timeOfStart.split(":");
              matchup.dateOfStart.setHours(parseInt(time[0]));
              matchup.dateOfStart.setMinutes(parseInt(time[0]));

              return (
                <div
                  key={idx}
                  className={`mb-6 relative ${
                    !positionToPlace && placeholderCount === 1 ? "mt-36" : ""
                  } ${
                    placeholderCount === 0 &&
                    roundName === "Conference Semifinals" &&
                    idx === 1
                      ? "mt-36"
                      : ""
                  }`}
                >
                  {/* Info Icon Outside of the Border */}
                  {new Date() > matchup.dateOfStart && userPointsPerSeries && (
                    <Tooltip
                      title="Points per Series"
                      slots={{
                        transition: Zoom,
                      }}
                      arrow
                      placement="right"
                    >
                      <div className="absolute top-[-22px] left-1/2 transform -translate-x-1/2 w-4 h-4 border-2 border-colors-nba-blue text-colors-nba-blue  p-2 rounded-full flex items-center justify-center text-xs font-semibold">
                        {userPointsPerSeries[matchup.id]}
                      </div>
                    </Tooltip>
                  )}
                  {!isPartialGuess[matchup.id] && (
                    <div className="absolute top-[-24px]  transform mb-4 ">
                      <Tooltip
                        title="Missing guesses"
                        slots={{
                          transition: Zoom,
                        }}
                        arrow
                        placement="left"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="size-6"
                        >
                          <circle cx="12" cy="12" r="9" fill="#FDB927" />
                          <path
                            fill="white"
                            d="M12 7.5C12.4142 7.5 12.75 7.83579 12.75 8.25V14.25C12.75 14.6642 12.4142 15 12 15C11.5858 15 11.25 14.6642 11.25 14.25V8.25C11.25 7.83579 11.5858 7.5 12 7.5ZM12 17.25C12.4142 17.25 12.75 17.5858 12.75 18C12.75 18.4142 12.4142 18.75 12 18.75C11.5858 18.75 11.25 18.4142 11.25 18C11.25 17.5858 11.5858 17.25 12 17.25Z"
                          />
                        </svg>
                      </Tooltip>
                    </div>
                  )}

                  {/* Matchup Container with Border */}
                  <div
                    className={`${
                      new Date() > matchup.dateOfStart
                        ? "border-2 border-colors-nba-red"
                        : "border-4 border-colors-select-bet"
                    } rounded-xl mb-2`}
                  >
                    {/* NBASeedCard */}
                    <NBASeedCard series={matchup} />
                  </div>
                </div>
              );
            })}
            {placeholderCount === 1 && positionToPlace && placeholders}
          </div>
        </div>
      );
    }

    // Otherwise, show placeholders for the current round
    return (
      <div className={`flex flex-col ${className}`}>
        <h3 className="text-sm font-semibold text-gray-500 mb-2 text-center break-words">
          {roundName}
        </h3>
        {placeholders}
      </div>
    );
  };

  return (
    <div className="relative z-10  bg-gray-100 p-4">
      {/* Mobile View */}
      {/* <MobileMatchupList series={series} /> */}
      {loading && (
        <div className="flex justify-center">
          <CircularProgress />
        </div>
      )}
      {/* Desktop View */}
      {!loading && (
        <div className="hidden md:flex justify-center">
          <div className="flex gap-8">
            {showInput && (
              <div className={`flex-none w-full md:w-1/4`}>
                <ChampionsInput
                  west={series.west}
                  east={series.east}
                  startDate={stageStartDate}
                  stage={stage}
                  setShowInput={hideInputAfterSubmit}
                />
              </div>
            )}
            {!showInput && (
              <div
                className="flex-none md:w-10 relative cursor-pointer h-10"
                onClick={() => setShowInput(true)}
              >
                <Tooltip
                  title="Champions betting"
                  slots={{
                    transition: Zoom,
                  }}
                  arrow
                  sx={{
                    "& .MuiTooltip-tooltip": {
                      backgroundColor: "#1D428A", // Tooltip background color
                      color: "rgba(0, 0, 0, 0.87)", // Tooltip text color
                    },
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                    />
                  </svg>
                </Tooltip>
              </div>
            )}
            {/* Western Conference */}
            <div>
              <h2 className="text-lg font-semibold text-center mb-4">
                Western Conference
              </h2>
              <div className="flex gap-16 relative z-10">
                <Round
                  matchups={series.west.filter(
                    (elem) => elem.round === "First Round"
                  )}
                  roundName="First Round"
                  className="h-[600px]"
                />
                <Round
                  matchups={series.west.filter(
                    (elem) => elem.round === "Conference Semifinals"
                  )}
                  roundName="Conference Semifinals"
                  className="h-[600px] mt-20"
                />
                <Round
                  matchups={series.west.filter(
                    (elem) => elem.round === "Conference Finals"
                  )}
                  roundName="Conference Finals"
                  className="h-[600px] mt-52"
                />
              </div>
            </div>

            {/* NBA Finals */}
            <div className="flex flex-col items-center justify-center mt-64 relative z-10">
              <h2 className="text-lg font-semibold mb-4">NBA Finals</h2>

              <Round
                matchups={series.finals}
                roundName="Finals"
                className="h-[600px] mt-2"
              />
            </div>

            {/* Eastern Conference */}
            <div>
              <h2 className="text-lg font-semibold text-center mb-4">
                Eastern Conference
              </h2>
              <div className="flex gap-16 relative z-10">
                <Round
                  matchups={series.east.filter(
                    (elem) => elem.round === "Conference Finals"
                  )}
                  roundName="Conference Finals"
                  className="h-[600px] mt-52"
                />
                <Round
                  matchups={series.east.filter(
                    (elem) => elem.round === "Conference Semifinals"
                  )}
                  roundName="Conference Semifinals"
                  className="h-[600px] mt-20"
                />
                <Round
                  matchups={series.east.filter(
                    (elem) => elem.round === "First Round"
                  )}
                  roundName="First Round"
                  className="h-[600px]"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
