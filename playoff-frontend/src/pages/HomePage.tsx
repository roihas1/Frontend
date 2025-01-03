import React, { useEffect, useState } from "react";
import NBASeedCard from "../components/NBASeedCard";
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
import PageBackground from "../components/Layout/PageBackground";
import NBALogo from "../assets/NBALogo.jpg";
import axiosInstance from "../api/axiosInstance";
import MobileMatchupList from "../components/MobileHomePage";
import { MatchupCategory, PlayerMatchupType } from "./UpdateBetsPage";
export interface PlayerMatchupBet {
  betId: string;
  seriesId: string;
  typeOfMatchup: PlayerMatchupType;
  categories: MatchupCategory[];
  fantasyPoints: number;
  player1: string;
  player2: string;
  differential: number;
}
export interface Series {
  id?: string;
  team1: string;
  team2: string;
  dateOfStart: Date;
  bestOf7BetId?: string;
  teamWinBetId?: string;
  conference: "West" | "East";
  round: string;
  seed1: number;
  seed2: number;
  logo1?: string;
  logo2?: string;
  playerMatchupBets?: PlayerMatchupBet[];
}
const HomePage: React.FC = () => {
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

  const [series, setSeries] = useState<{
    west: Series[];
    east: Series[];
    finals: Series[];
  }>({
    west: [],
    east: [],
    finals: [],
  });
  const getSeries = async () => {
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

      const response = await axiosInstance.get("/series");
      const seriesData = response.data; // Assuming the response is an array of series
      // console.log(seriesData)
      seriesData.forEach((element: Series) => {
        // console.log(element);
        const team1Logo = logos[element.team1.toLowerCase().replace(/ /g, "_")];
        const team2Logo = logos[element.team2.toLowerCase().replace(/ /g, "_")];
        const series: Series = {
          id: element.id,
          team1: element.team1.split(" ").pop(),
          team2: element.team2.split(" ").pop(),
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
        };
        // console.log(series);
        // Push series into the correct conference array based on the "conference" field
        if (series.conference === "West") {
          updatedSeries.west.push(series);
        } else if (series.conference === "East") {
          updatedSeries.east.push(series);
        } else {
          updatedSeries.finals.push(series);
        }
      });

      // Set the series state with the updated data
      setSeries(updatedSeries);
    } catch (err) {
      console.error("Error fetching series data:", err);
    }
  };
  useEffect(() => {
    getSeries();
  }, []);

  const sortMatchups = (matchups: Series[]) => {
    return matchups.sort((a, b) => {
      if (a.seed1 === 1 || b.seed1 === 1) return a.seed1 === 1 ? -1 : 1;
      if (a.seed1 === 8 || b.seed1 === 8) return a.seed1 === 8 ? -1 : 1;
      if (a.seed1 === 2 || b.seed1 === 2) return a.seed1 === 2 ? -1 : 1;
      if (a.seed1 === 7 || b.seed1 === 7) return a.seed1 === 7 ? -1 : 1;
      if (a.seed1 === 3 || b.seed1 === 3) return a.seed1 === 3 ? -1 : 1;
      if (a.seed1 === 6 || b.seed1 === 6) return a.seed1 === 6 ? -1 : 1;
      if (a.seed1 === 4 || b.seed1 === 4) return a.seed1 === 4 ? -1 : 1;
      if (a.seed1 === 5 || b.seed1 === 5) return a.seed1 === 5 ? -1 : 1;
      return 0;
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

    // Check if there are no matchups
    const placeholderCount =
      roundName === "Conference Semifinals"
        ? 2
        : roundName === "Conference Finals" || roundName === "Finals"
        ? 1
        : 0;

    // If there are matchups, render them
    if (sortedMatchups.length > 0) {
      return (
        <div className={`flex flex-col ${className}`}>
          <h3 className="text-sm font-semibold text-gray-500 mb-2 text-center break-words">
            {roundName}
          </h3>
          <div className="flex flex-col justify-around">
            {sortedMatchups.map((matchup, idx) => (
              <div key={idx} className="mb-6">
                <NBASeedCard series={matchup} />
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Otherwise, show placeholders for the current round
    const placeholders = Array.from({ length: placeholderCount }, (_, idx) => (
      <div
        key={idx}
        className={`bg-white shadow-lg rounded-lg p-2 m-2 max-w-xs mx-auto ${
          idx == 1 ? "mt-72" : ""
        }`}
      >
        <div className="flex flex-col items-center justify-center rounded-md">
          <div className="relative">
            <img
              src={NBALogo}
              alt="NBA Logo"
              className="w-14 h-14 object-contain rounded-2xl"
            />
          </div>
          <p className="text-sm font-bold text-gray-700 mt-2">
            Waiting for Matchup
          </p>
        </div>
      </div>
    ));

    return (
      <div className={`flex flex-col ${className}`}>
        <h3 className="text-sm font-semibold text-gray-500 mb-2 text-center break-words">
          {roundName}
        </h3>
        {placeholders}
      </div>
    );
  };

  // const createRoundMatchups = (
  //   conference: Series[],
  //   round: number
  // ): Series[] => {
  //   const matchups: Series[] = [];
  //   switch (round) {
  //     case 1:
  //       conference.forEach((elem) => {
  //         if (elem.round === "First Round") {
  //           matchups.push(elem);
  //         }
  //       });
  //       break;
  //     case 2:
  //       conference.forEach((elem) => {
  //         if (elem.round === "Conference Semifinals") {
  //           matchups.push(elem);
  //         }
  //       });
  //       break;
  //     case 3:
  //       conference.forEach((elem) => {
  //         if (elem.round === "Conference Finals") {
  //           matchups.push(elem);
  //         }
  //       });
  //       break;
  //       case 4:
  //         conference.forEach((elem) => {
  //           if (elem.round === "Finals") {
  //             matchups.push(elem);
  //           }
  //         });
  //         break;

  //   }
  //   return matchups;
  // };

  return (
    <div className="relative z-10 min-h-screen bg-gray-100 p-4">
      
      <h1 className="text-2xl font-bold text-center z-10 mb-8">
        NBA Playoffs Bracket
      </h1>

      {/* Mobile View */}
      {/* <MobileMatchupList series={series} /> */}

      {/* Desktop View */}
      <div className="hidden md:flex justify-center">
        <div className="flex gap-8">
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
                className="h-[600px] mt-48"
              />
              <Round
                matchups={series.west.filter(
                  (elem) => elem.round === "Conference Finals"
                )}
                roundName="Conference Finals"
                className="h-[600px] mt-96"
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
                className="h-[600px] mt-96"
              />
              <Round
                matchups={series.east.filter(
                  (elem) => elem.round === "Conference Semifinals"
                )}
                roundName="Conference Semifinals"
                className="h-[600px] mt-48"
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
    </div>
  );
};

export default HomePage;
