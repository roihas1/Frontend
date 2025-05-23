import React, { useEffect, useState } from "react";
import NBASeedCard from "../components/forPages/NBASeedCard";
// import { Team } from "../components/form/TeamDialog";
import bostonCelticsLogo from "../assets/logos/boston_logo.png";
import losAngelesLakersLogo from "../assets/logos/los_angeles_lakers_logo.png";
import memphisGrizzliesLogo from "../assets/logos/memphis_grizzlies_logo.png";
import goldenStateWarriorsLogo from "../assets/logos/golden_state_warriors_logo.png";
import portlandTrailBlazersLogo from "../assets/logos/portland_trail_blazers_logo.png";
import phoenixSunsLogo from "../assets/logos/phoenix_suns_logo.png";
import utahJazzLogo from "../assets/logos/utah_jazz_logo.png";
import dallasMavericksLogo from "../assets/logos/dallas_mavericks_logo.png";
import denverNuggetsLogo from "../assets/logos/denver_nuggets_logo.png";
import washingtonWizardsLogo from "../assets/logos/washington_wizards_logo.png";
import miamiHeatLogo from "../assets/logos/miami_heat_logo.gif";
import brooklynNetsLogo from "../assets/logos/brooklyn_nets_logo.png";
import milwaukeeBucksLogo from "../assets/logos/milwaukee_bucks_logo.png";
import chicagoBullsLogo from "../assets/logos/chicago_bulls_logo.png";
import torontoRaptorsLogo from "../assets/logos/toronto_raptors_logo.png";
import philadelphia76ersLogo from "../assets/logos/philadelphia_76ers_logo.png";
import indianaPacersLogo from "../assets/logos/indiana_pacers_logo.png";
import newYorkKnicksLogo from "../assets/logos/new_york_knicks_logo.png";
import atlantaHawksLogo from "../assets/logos/atlanta_hawks_logo.png";
import charlotteHornetsLogo from "../assets/logos/charlotte__hornets_logo.png";
import clevelandCavaliersLogo from "../assets/logos/cleveland_cavaliers_logo.png";
import detroitPistonsLogo from "../assets/logos/detroit_pistons_logo.png";
import minnesotaTimberwolvesLogo from "../assets/logos/minnesota_timberwolves_logo.png";
import oklahomaCityThunderLogo from "../assets/logos/okc_logo.png";
import sacramentoKingsLogo from "../assets/logos/sacramento_kings_logo.png";
import losAngelesClippersLogo from "../assets/logos/los_angeles_clippers_logo.png";
import orlandoMagicLogo from "../assets/logos/orlando_magic_logo.png";
import sanAntonioSpursLogo from "../assets/logos/san_antonio_spurs_logo.png";
import houstonRocketsLogo from "../assets/logos/houston_rockets_logo.png";
import newOrleansPelicansLogo from "../assets/logos/new_orleans_pelicans_logo.png";
import Logo from "../assets/siteLogo/logo_color_trans.png";
import axiosInstance from "../api/axiosInstance";
import { BestOf7Bet, PlayerMatchupBet, SpontaneousBet } from "../types/index";
import ChampionsInput from "../components/forPages/ChampionsInput";
import { useError } from "../components/providers&context/ErrorProvider";
import Tooltip from "@mui/material/Tooltip";
import defaultLogo from "../assets/logos/defaultLogoTBD.png";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  CircularProgress,
  Modal,
  Zoom,
} from "@mui/material";

export interface Series {
  id?: string;
  team1: string;
  team2: string;
  dateOfStart: Date;
  bestOf7BetId?: BestOf7Bet;
  teamWinBetId?: string;
  conference: "West" | "East" | "Finals";
  round: string;
  seed1: number;
  seed2: number;
  logo1?: string;
  logo2?: string;
  playerMatchupBets?: PlayerMatchupBet[];
  spontaneousBets?: SpontaneousBet[];
  numOfGames: number;
  timeOfStart: string;
  lastUpdate: Date;
}
interface ChampionTeamGuess {
  id: string;
  fantasyPoints: number;
  team: string;
}
interface ConferenceFinalGuess {
  id: string;
  fantasyPoints: number;
  team1: string;
  team2: string;
  conference: "West" | "East" | "Finals";
}
interface MVPGuess {
  id: string;
  fantasyPoints: number;
  player: string;
}
interface Stage {
  championTeamGuess: ChampionTeamGuess;
  conferenceFinalGuess: ConferenceFinalGuess;
  mvpGuess: MVPGuess;
  name: string;
  startDate: Date;
  timeOfStart: string;
}
const nbaTeams: { [key: string]: string } = {
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
export const logos: Record<string, string> = {
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
  const [expanded, setExpanded] = useState<string | false>(false);
  const [showMobileChampInput, setShowMobileChampInput] =
    useState<boolean>(false);
  const [hasGuessedChampions, setHasGuessedChampions] = useState<boolean>(true);

  const checkIfGuessed = async () => {
    try {
      const response = await axiosInstance.get(`/playoffs-stage/checkGuess/`, {
        params: {
          stage: stage,
        },
      });

      setShowInput(response.data);
      setHasGuessedChampions(!response.data);
    } catch (error) {
      console.log(error);
      showError("Server Error.");
    }
  };
  const hideInputAfterSubmit = () => {
    setShowInput(false);
  };

  const checkIfGuessSeriesBetting = async () => {
    try {
      const response = await axiosInstance.get(`series/isUserGuessed/All`);
      setIspartialGuess(response.data);
    } catch (error) {
      showError(`Failed to check guesses ${error}`);
    }
  };
  // checkTokenExpiration();
  useEffect(() => {
    if (stage && stage != "Finish") {
      checkIfGuessed();
    }
  }, [stage]);

  useEffect(() => {
    const fetchHomepageData = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("/home-page/load");
        const { userGuessedAll, seriesList, playoffsStages, userPoints } =
          response.data;

        // Organize series by conference
        const updatedSeries: {
          west: Series[];
          east: Series[];
          finals: Series[];
        } = { west: [], east: [], finals: [] };

        seriesList.forEach((element: Series) => {
          updatedSeries[
            element.conference.toLowerCase() as keyof typeof updatedSeries
          ].push({
            ...element,
            dateOfStart: new Date(element.dateOfStart),
            logo1:
              logos[element.team1.toLowerCase().replace(/ /g, "_")] ||
              defaultLogo,
            logo2:
              logos[element.team2.toLowerCase().replace(/ /g, "_")] ||
              defaultLogo,
            team1: nbaTeams[element.team1],
            team2: nbaTeams[element.team2],
          });
        });

        setSeries(updatedSeries);
        setUserPointsPerSeries(userPoints);
        setIspartialGuess(userGuessedAll);

        const upcomingStage = playoffsStages.find((round: Stage) => {
          const startDate = new Date(round.startDate);
          const time = round.timeOfStart.split(":");
          startDate.setHours(parseInt(time[0]));
          startDate.setMinutes(parseInt(time[1]));
          return startDate > new Date();
        });

        if (upcomingStage) {
          const startDate = new Date(upcomingStage.startDate);
          const time = upcomingStage.timeOfStart.split(":");
          startDate.setHours(parseInt(time[0]));
          startDate.setMinutes(parseInt(time[1]));

          setStage(upcomingStage.name);
          setStageStartDate(startDate); // ✅ Now includes time as well
        } else {
          setStage("Finish");
        }

        setLoading(false);
      } catch (error) {
        showError("Failed to load homepage data.");
        setLoading(false);
      }
    };

    fetchHomepageData();
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
    const positionToPlace =
      sortedMatchups[0]?.seed1 === 1 || sortedMatchups[0]?.seed1 === 8;
    // check where to position the placeholder in case there is one series only in semi finals

    const placeholders = Array.from({ length: placeholderCount }, (_, idx) => (
      <div
        key={idx}
        className={`bg-white shadow-lg rounded-lg p-4 m-2 max-w-xs mx-auto ${
          positionToPlace
            ? "mt-40"
            : roundName === "Conference Semifinals" &&
              placeholderCount === 1 &&
              idx === 0
            ? "mt-2 mb-40"
            : roundName === "Conference Semifinals" &&
              placeholderCount === 2 &&
              idx === 1
            ? "mt-48"
            : "mt-6"
        }`}
      >
        <div className="flex flex-col items-center justify-center rounded-md">
          <div className="relative">
            <img
              src={Logo}
              alt="NBA Logo"
              className="w-20 h-16 object-contain rounded-2xl"
              loading="lazy"
            />
          </div>
          <p className="text-xs font-bold text-gray-700 mt-2 text-center">
            Waiting for Matchup
          </p>
        </div>
      </div>
    ));

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
                  className={`mb-6 relative
                  ${
                    roundName === "Conference Semifinals" &&
                    sortedMatchups.length === 2 &&
                    idx === 1
                      ? "mt-40"
                      : ""
                  }
                 `}
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
                        {userPointsPerSeries[matchup.id ?? ""]}
                      </div>
                    </Tooltip>
                  )}

                  {!isPartialGuess[matchup.id ?? ""] ? (
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
                  ) : (
                    <div className="absolute top-[-24px] transform mb-4">
                      <Tooltip
                        title="Guessed all"
                        slots={{
                          transition: Zoom,
                        }}
                        arrow
                        placement="left"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className="size-6"
                        >
                          <circle cx="12" cy="12" r="9" fill="green" />
                          <path
                            d="M9 12.75L11.25 15L15 9.75"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                          />
                        </svg>
                      </Tooltip>
                    </div>
                  )}

                  {/* Matchup Container with Border */}
                  <div
                    className={`${
                      new Date() > matchup.dateOfStart
                        ? "border-4 border-colors-nba-red"
                        : "border-4 border-colors-select-bet"
                    } rounded-xl mb-2 `}
                  >
                    {/* NBASeedCard */}
                    <NBASeedCard
                      series={matchup}
                      userPoints={userPointsPerSeries?.[matchup.id ?? ""] ?? 0}
                      fetchData={checkIfGuessSeriesBetting}
                    />
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
  const setHasGuessedAndInput = (functionName: string) => {
    if (functionName === "Submit") {
      setHasGuessedChampions(true);
    }
    setShowMobileChampInput(false);
  };
  const handleAccordionChange =
    (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="relative z-10  bg-gray-100 p-4">
      {/* Mobile View */}

      <div className="md:hidden">
        <div className="flex justify-center">
          <button
            className={`px-6 py-2.5 text-base font-semibold rounded-md shadow-md transition-all duration-300 mb-4 tracking-wide
      ${
        hasGuessedChampions
          ? "bg-gray-300 text-gray-800 hover:bg-gray-300"
          : "bg-colors-nba-yellow text-black ring-2 animate-scale-pulse ring-yellow-500 hover:bg-yellow-400 scale-105"
      }
    `}
            style={{
              transform: !hasGuessedChampions ? "translateY(0)" : undefined,
            }}
            onClick={() => setShowMobileChampInput(true)}
          >
            {hasGuessedChampions
              ? "Open Champions Bets"
              : "Guess the Champions"}
          </button>
        </div>

        <Modal
          open={showMobileChampInput}
          onClose={() => setShowMobileChampInput(false)}
        >
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100dvh",
              bgcolor: "background.paper",
              overflowY: "auto",
              padding: 2,
              paddingBottom: 6,
              boxSizing: "border-box",
              WebkitOverflowScrolling: "touch", // smooth scrolling on iOS
            }}
          >
            <ChampionsInput
              west={series.west}
              east={series.east}
              startDate={stageStartDate}
              stage={stage}
              setShowInput={setHasGuessedAndInput}
            />
          </Box>
        </Modal>
        {[
          "NBA Finals",
          "Conference Finals",
          "Conference Semifinals",
          "First Round",
        ].map((round) => {
          // Filter conferences that have matchups in this round
          const conferencesWithMatchups = ["finals", "west", "east"].filter(
            (conference) =>
              series[conference as keyof typeof series].some(
                (matchup) => matchup.round === round
              )
          );

          if (conferencesWithMatchups.length === 0) return null; // Skip if no matchups in this round

          return (
            <div key={round} className="mb-6">
              {/* Round Title (Skip "NBA Finals" title) */}

              <h3 className="text-lg font-bold text-center bg-gray-300 p-2 rounded-md mb-2">
                {round}
              </h3>

              {/* Loop through conferences that have matchups in this round */}
              {conferencesWithMatchups.map((conference) => {
                const matchupsInRound = series[
                  conference as keyof typeof series
                ].filter((matchup) => matchup.round === round);

                if (matchupsInRound.length === 0) return null; // Skip empty conferences

                const conferenceName =
                  conference === "west"
                    ? "Western Conference"
                    : conference === "east"
                    ? "Eastern Conference"
                    : "NBA Finals";

                return (
                  <div key={conference} className="mb-4">
                    {/* Conference Title (Skip if it's the NBA Finals) */}
                    {conference !== "finals" && (
                      <h4 className="text-md font-semibold text-center bg-gray-200 p-1 rounded-md mb-2">
                        {conferenceName}
                      </h4>
                    )}

                    {matchupsInRound.map((matchup) => (
                      <Accordion
                        key={matchup.id}
                        expanded={expanded === matchup.id}
                        onChange={handleAccordionChange(matchup.id ?? "")}
                        className="mb-2"
                      >
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
                          className="bg-gray-200 p-2 rounded-lg"
                        >
                          <div className="flex items-center justify-between w-full gap-2">
                            {/* Logos + Names container */}
                            <div className="grid grid-cols-[48px_auto_48px] items-center w-full">
                              {/* Left Logo */}
                              <div className="w-12 aspect-square flex items-center justify-center">
                                <img
                                  src={matchup.logo1}
                                  alt={matchup.team1}
                                  className="object-contain max-w-full max-h-full"
                                  loading="lazy"
                                />
                              </div>

                              {/* Team Names stacked */}
                              <div className="flex flex-col items-center justify-center">
                                <div className="whitespace-nowrap flex items-center justify-center gap-1">
                                  <span className="text-md font-semibold">
                                    {matchup.team1}
                                  </span>
                                  <span className="text-sm font-normal p-2 text-gray-600">
                                    vs
                                  </span>
                                  <span className="text-md font-semibold">
                                    {matchup.team2}
                                  </span>
                                </div>
                              </div>

                              {/* Right Logo */}
                              <div className="w-12 aspect-square flex items-center justify-center">
                                <img
                                  src={matchup.logo2}
                                  alt={matchup.team2}
                                  className="object-contain max-w-full max-h-full"
                                  loading="lazy"
                                />
                              </div>
                            </div>

                            {/* Reserve space for icon regardless */}
                            <div className="w-10 mr-4 flex justify-end">
                              {typeof isPartialGuess[matchup.id ?? ""] !==
                                "undefined" && (
                                <Tooltip
                                  title={
                                    isPartialGuess[matchup.id ?? ""]
                                      ? "Guessed all"
                                      : "Missing guesses"
                                  }
                                  arrow
                                  placement="bottom"
                                  enterTouchDelay={0}
                                  leaveTouchDelay={2000}
                                  slots={{ transition: Zoom }}
                                >
                                  <div
                                    className="p-1 rounded-full cursor-default"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {isPartialGuess[matchup.id ?? ""] ? (
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        className="w-6 h-6"
                                      >
                                        <circle
                                          cx="12"
                                          cy="12"
                                          r="9"
                                          fill="green"
                                        />
                                        <path
                                          d="M9 12.75L11.25 15L15 9.75"
                                          stroke="white"
                                          strokeWidth="1.5"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          fill="none"
                                        />
                                      </svg>
                                    ) : (
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="w-6 h-6 text-yellow-500"
                                      >
                                        <circle
                                          cx="12"
                                          cy="12"
                                          r="9"
                                          fill="#FDB927"
                                        />
                                        <path
                                          fill="white"
                                          d="M12 7.5C12.4142 7.5 12.75 7.83579 12.75 8.25V14.25C12.75 14.6642 12.4142 15 12 15C11.5858 15 11.25 14.6642 11.25 14.25V8.25C11.25 7.83579 11.5858 7.5 12 7.5ZM12 17.25C12.4142 17.25 12.75 17.5858 12.75 18C12.75 18.4142 12.4142 18.75 12 18.75C11.5858 18.75 11.25 18.4142 11.25 18C11.25 17.5858 11.5858 17.25 12 17.25Z"
                                        />
                                      </svg>
                                    )}
                                  </div>
                                </Tooltip>
                              )}
                            </div>
                          </div>
                        </AccordionSummary>

                        <AccordionDetails
                          className="bg-white"
                          sx={{ padding: "0px 16px 16px" }}
                        >
                          {/* Matchup Details */}
                          <div className="ml-3 text-sm text-gray-700">
                            <div className="flex flex-wrap items-center gap-4 mb-1">
                              {new Date(matchup.dateOfStart) > new Date() ? (
                                <span>
                                  <span className="font-semibold">
                                    The series starts on:{" "}
                                  </span>
                                  {new Date(matchup.dateOfStart).toLocaleString(
                                    "he-IL",
                                    {
                                      timeZone: "Asia/Jerusalem",
                                    }
                                  )}
                                </span>
                              ) : (
                                <>
                                  <span className="font-semibold text-gray  -700">
                                    The series has started!
                                  </span>
                                  <span className="font-semibold">
                                    Points Earned:{" "}
                                    <span className="text-black">
                                      {userPointsPerSeries?.[
                                        matchup.id ?? ""
                                      ] ?? 0}
                                    </span>
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <NBASeedCard
                            series={matchup}
                            userPoints={
                              userPointsPerSeries?.[matchup.id ?? ""] ?? 0
                            }
                            fetchData={checkIfGuessSeriesBetting}
                          />
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Desktop View */}

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
                className="h-[450px]"
              />
              <Round
                matchups={series.west.filter(
                  (elem) => elem.round === "Conference Semifinals"
                )}
                roundName="Conference Semifinals"
                className="h-[450px] mt-20"
              />
              <Round
                matchups={series.west.filter(
                  (elem) => elem.round === "Conference Finals"
                )}
                roundName="Conference Finals"
                className="h-[450px] mt-52"
              />
            </div>
          </div>

          {/* NBA Finals */}
          <div className="flex flex-col items-center justify-center mt-64 relative z-10">
            <h2 className="text-lg font-semibold mb-4">NBA Finals</h2>

            <Round
              matchups={series.finals}
              roundName="Finals"
              className="h-[450px] mt-2"
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
                className="h-[450px] mt-52"
              />
              <Round
                matchups={series.east.filter(
                  (elem) => elem.round === "Conference Semifinals"
                )}
                roundName="Conference Semifinals"
                className="h-[450px] mt-20"
              />
              <Round
                matchups={series.east.filter(
                  (elem) => elem.round === "First Round"
                )}
                roundName="First Round"
                className="h-[450px]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
