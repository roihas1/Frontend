import React, { useEffect, useState } from "react";
import { Series } from "../../pages/HomePage"; // Assuming `Series` type is correctly imported
import {
  InputLabel,
  FormControl,
  CircularProgress,
  Autocomplete,
  TextField,
} from "@mui/material";
import axiosInstance from "../../api/axiosInstance";
import { useSuccessMessage } from "../providers&context/successMassageProvider";
import { useError } from "../providers&context/ErrorProvider";
import SubmitButton from "../common/SubmitButton";
import CustomSelectInput from "../form/CustomSelectInput";
import ChampionGuessSummary from "../forPages/ChampionGuessSummary";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTournament } from "../providers&context/TournamentContext";

interface ChampionsInputProps {
  west: Series[];
  east: Series[];
  startDate: Date;
  stage: string;
  setShowInput: (arg0: string) => void;
}
interface UserGuessesResponse {
  conferenceFinalGuesses: {
    team1?: string;
    team2?: string;
    team1Relation?: { name: string } | null;
    team2Relation?: { name: string } | null;
    conference: string;
    stage?: {
      startDate?: string;
      timeOfStart?: string;
    };
  }[];
  championTeamGuesses: {
    team?: string;
    teamRelation?: { name: string } | null;
    stage?: {
      startDate?: string;
      timeOfStart?: string;
    };
  }[];
  mvpGuesses: {
    player: string;
    stage?: {
      startDate?: string;
      timeOfStart?: string;
    };
  }[];
}

export const nbaTeamsNicknamesReversed: { [key: string]: string } = {
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

export const nbaTeamsNicknames: { [key: string]: string } = {
  Hawks: "Atlanta Hawks",
  Celtics: "Boston Celtics",
  Nets: "Brooklyn Nets",
  Hornets: "Charlotte Hornets",
  Bulls: "Chicago Bulls",
  Cavs: "Cleveland Cavaliers",
  Mavs: "Dallas Mavericks",
  Nuggets: "Denver Nuggets",
  Pistons: "Detroit Pistons",
  Warriors: "Golden State Warriors",
  Rockets: "Houston Rockets",
  Pacers: "Indiana Pacers",
  Clippers: "Los Angeles Clippers",
  Lakers: "Los Angeles Lakers",
  Grizzlies: "Memphis Grizzlies",
  Heat: "Miami Heat",
  Bucks: "Milwaukee Bucks",
  Wolves: "Minnesota Timberwolves",
  Pelicans: "New Orleans Pelicans",
  Knicks: "New York Knicks",
  Thunder: "Oklahoma City Thunder",
  Magic: "Orlando Magic",
  Suns: "Phoenix Suns",
  Sixers: "Philadelphia 76ers",
  Blazers: "Portland Trail Blazers",
  Kings: "Sacramento Kings",
  Spurs: "San Antonio Spurs",
  Raptors: "Toronto Raptors",
  Jazz: "Utah Jazz",
  Wizards: "Washington Wizards",
};

const ChampionsInput: React.FC<ChampionsInputProps> = ({
  west,
  east,
  startDate,
  stage,
  setShowInput,
}) => {
  const [selectedEasternTeam1, setSelectedEasternTeam1] = useState<string>("");
  const [selectedEasternTeam2, setSelectedEasternTeam2] = useState<string>("");
  const [selectedWesternTeam1, setSelectedWesternTeam1] = useState<string>("");
  const [selectedWesternTeam2, setSelectedWesternTeam2] = useState<string>("");
  const [selectedFinalsTeam1, setSelectedFinalsTeam1] = useState<string>("");
  const [selectedFinalsTeam2, setSelectedFinalsTeam2] = useState<string>("");
  const [selectedMvp, setSelectedMvp] = useState<string>("");
  const [selectedChampion, setSelectedChampion] = useState<string>("");
  const [guessesFilled, setGuessesFilled] = useState<boolean>(false);
  // const [isLoading, setLoading] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const queryClient = useQueryClient(); 
  const { selectedTournamentId } = useTournament();

  const { showSuccessMessage } = useSuccessMessage();
  const { showError } = useError();

  const getFullTeamName = (team: string): string => {
    return nbaTeamsNicknames[team] ?? team;
  };

  const getGuessTimestamp = (stageInfo?: {
    startDate?: string;
    timeOfStart?: string;
  }): number => {
    if (!stageInfo?.startDate) {
      return 0;
    }
    const datePart = stageInfo.startDate;
    const timePart = stageInfo.timeOfStart ?? "00:00:00";
    const parsed = Date.parse(`${datePart}T${timePart}`);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const getConferenceTeamName = (
    guess: UserGuessesResponse["conferenceFinalGuesses"][number],
    side: "team1" | "team2"
  ): string | undefined => {
    if (side === "team1") {
      return guess.team1Relation?.name ?? guess.team1;
    }
    return guess.team2Relation?.name ?? guess.team2;
  };

  // Function to get teams from the selected round
  const getTeamsForRound = (round: "east" | "west" | "finals"): string[] => {
    const uniqDefined = (items: (string | undefined)[]) =>
      [...new Set(items.filter((t): t is string => Boolean(t)))];
    switch (round) {
      case "east":
        return uniqDefined(east.flatMap((series) => [series.team1, series.team2]));
      case "west":
        return uniqDefined(west.flatMap((series) => [series.team1, series.team2]));
      case "finals":
        return uniqDefined([
          ...west.flatMap((series) => [series.team1, series.team2]),
          ...east.flatMap((series) => [series.team1, series.team2]),
        ]);
      default:
        return [];
    }
  };
  const playersList: string[] = [
    "",
    "Aaron Gordon",
    "Alperen Sengun",
    "Amen Thompson",
    "Anthony Edwards",
    "Austin Reaves",
    "Bam Adebayo",
    "Brandon Ingram",
    "Brandon Miller",
    "Cade Cunningham",
    "Chet Holmgren",
    "Darius Garland",
    "Deni Avdija",
    "Derrick White",
    "Desmond Bane",
    "Devin Booker",
    "Devin Vassell",
    "Dillon Brooks",
    "Donovan Mitchell",
    "Evan Mobley",
    "Franz Wagner",
    "Jalen Brunson",
    "Jalen Duren",
    "Jalen Green",
    "Jalen Johnson",
    "Jalen Williams",
    "James Harden",
    "Jamal Murray",
    "Jayson Tatum",
    "Jaylen Brown",
    "Joel Embiid",
    "Karl-Anthony Towns",
    "Kawhi Leonard",
    "Kevin Durant",
    "LaMelo Ball",
    "LeBron James",
    "Luka Doncic",
    "Nickeil Alexander-Walker",
    "Nikola Jokic",
    "OG Anunoby",
    "Paolo Banchero",
    "Paul George",
    "RJ Barrett",
    "Scottie Barnes",
    "Shai Gilgeous-Alexander",
    "Stephen Curry",
    "Stephon Castle",
    "Tyrese Maxey",
    "Victor Wembanyama",
  ].sort((a, b) => a.localeCompare(b));
  const mvpOptions = playersList.filter(Boolean);

  // Validate fields
  const validateFields = () => {
    return (
      !selectedEasternTeam1 ||
      !selectedEasternTeam2 ||
      !selectedWesternTeam1 ||
      !selectedWesternTeam2 ||
      !selectedFinalsTeam1 ||
      !selectedFinalsTeam2 ||
      !selectedMvp ||
      !selectedChampion
    );
  };
  useEffect(() => {
    if (validationError) {
      const timer = setTimeout(() => {
        setValidationError(null);
      }, 5000); // 🕐 Clear error after 5 seconds

      return () => clearTimeout(timer); // Cleanup if the component unmounts
    }
  }, [validationError]);
  const handleEastFinalsTeamSelection = (team: string, numTeam: number) => {
    if (
      (team === selectedEasternTeam2 && numTeam === 1) ||
      (team === selectedEasternTeam1 && numTeam === 2)
    ) {
      // showError(`Can not Select the Same Team`);
      setValidationError(`Can not Select the Same Team`);
    } else {
      if (numTeam === 1) {
        setSelectedEasternTeam1(team);
      } else {
        setSelectedEasternTeam2(team);
      }
    }
  };
  const handleWestFinalsTeamSelection = (team: string, numTeam: number) => {
    if (
      (team === selectedWesternTeam2 && numTeam === 1) ||
      (team === selectedWesternTeam1 && numTeam === 2)
    ) {
      // showError(`Can not Select the Same Team`);
      setValidationError(`Can not Select the Same Team`);
    } else {
      if (numTeam === 1) {
        setSelectedWesternTeam1(team);
      } else {
        setSelectedWesternTeam2(team);
      }
    }
  };
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent the default form submission
    setValidationError(null);
    // Validate the fields before submitting
    if (stage === "Before playoffs" && validateFields()) {
      // showError("Please fill in all the required fields.");
      setValidationError("Please fill in all the required fields.");
      return;
    }
    if (!selectedTournamentId) {
      showError("Please select a tournament first.");
      return;
    }
    try {
      if (stage === "Before playoffs") {
        await axiosInstance.post("/champions-guess/update/beforePlayoffs", {
          tournamentId: selectedTournamentId,
          champTeamGuess: {
            team: getFullTeamName(selectedChampion),
          },
          conferenceFinalGuess: [
            {
              team1: nbaTeamsNicknames[selectedEasternTeam1],
              team2: nbaTeamsNicknames[selectedEasternTeam2],
              conference: "East",
            },
            {
              team1: nbaTeamsNicknames[selectedWesternTeam1],
              team2: nbaTeamsNicknames[selectedWesternTeam2],
              conference: "West",
            },
            {
              team1: nbaTeamsNicknames[selectedFinalsTeam1],
              team2: nbaTeamsNicknames[selectedFinalsTeam2],
              conference: "Finals",
            },
          ],
          mvpGuess: {
            player: selectedMvp,
          },
          stage: stage,
        });
      } else if (stage === "Round 1" || stage === "Round 2") {
        await axiosInstance.post("/champions-guess/update/afterFirstRound", {
          tournamentId: selectedTournamentId,
          champTeamGuess: {
            team: getFullTeamName(selectedChampion),
          },
          mvpGuess: {
            player: selectedMvp,
          },
          stage,
        });
      }
      await queryClient.invalidateQueries({
        queryKey: ["userGuesses", stage, selectedTournamentId],
      });
    } catch (error) {
      console.log(error);
      showError(`Failed to update champion guess ${error}`);
    } finally {
      setShowInput("Submit");
      showSuccessMessage("Your guesses updated!");
    }
  };

  const {
    data: guesses,
    isSuccess,
    isLoading,
    isError,
  } = useQuery<UserGuessesResponse>({
    queryKey: ["userGuesses", stage, selectedTournamentId],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/playoffs-stage/userGuesses/${stage}`
      );
      return res.data;
    },
    enabled:
      !!stage && stage !== "Finish" && !!selectedTournamentId,
    retry: 1,
    staleTime: 3 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
  useEffect(() => {
      if (isError) {
        showError("Failed to fetch user champions guesses");
      }
    }, [isError]);

  useEffect(() => {
    if (!isSuccess || !guesses) return;

    let hasGuesses = false;

    if (
      guesses.conferenceFinalGuesses.length > 0 &&
      stage === "Before playoffs"
    ) {
      const conferencePriority = guesses.conferenceFinalGuesses
        .slice()
        .sort(
          (a, b) => getGuessTimestamp(b.stage) - getGuessTimestamp(a.stage)
        );

      for (const guess of conferencePriority) {
        const team1Name = getConferenceTeamName(guess, "team1");
        const team2Name = getConferenceTeamName(guess, "team2");

        if (!team1Name || !team2Name) {
          continue;
        }

        const mappedTeam1 = nbaTeamsNicknamesReversed[team1Name] ?? team1Name;
        const mappedTeam2 = nbaTeamsNicknamesReversed[team2Name] ?? team2Name;

        switch (guess.conference) {
          case "East":
            if (!selectedEasternTeam1 && !selectedEasternTeam2) {
              setSelectedEasternTeam1(mappedTeam1);
              setSelectedEasternTeam2(mappedTeam2);
              hasGuesses = true;
            }
            break;
          case "West":
            if (!selectedWesternTeam1 && !selectedWesternTeam2) {
              setSelectedWesternTeam1(mappedTeam1);
              setSelectedWesternTeam2(mappedTeam2);
              hasGuesses = true;
            }
            break;
          case "Finals":
            if (!selectedFinalsTeam1 && !selectedFinalsTeam2) {
              setSelectedFinalsTeam1(mappedTeam1);
              setSelectedFinalsTeam2(mappedTeam2);
              hasGuesses = true;
            }
            break;
        }
      }
    }

    if (guesses.championTeamGuesses.length > 0) {
      const latestChampion = guesses.championTeamGuesses
        .slice()
        .sort(
          (a, b) => getGuessTimestamp(b.stage) - getGuessTimestamp(a.stage)
        )
        .find((guess) => (guess.teamRelation?.name ?? guess.team)?.trim());

      const championTeamName =
        latestChampion?.teamRelation?.name ?? latestChampion?.team ?? "";

      if (championTeamName) {
        setSelectedChampion(
          nbaTeamsNicknamesReversed[championTeamName] ?? championTeamName
        );
      }
      hasGuesses = true;
    }

    if (guesses.mvpGuesses.length > 0) {
      const latestMvp = guesses.mvpGuesses
        .slice()
        .sort(
          (a, b) => getGuessTimestamp(b.stage) - getGuessTimestamp(a.stage)
        )
        .find((guess) => guess.player?.trim());

      if (latestMvp?.player) {
        setSelectedMvp(latestMvp.player);
      }
      hasGuesses = true;
    }

    if (hasGuesses) {
      setGuessesFilled(true);
    }
  }, [
    isSuccess,
    guesses,
    stage,
    selectedEasternTeam1,
    selectedEasternTeam2,
    selectedWesternTeam1,
    selectedWesternTeam2,
    selectedFinalsTeam1,
    selectedFinalsTeam2,
  ]);


  // Get the teams for each round
  const easternTeams = getTeamsForRound("east");
  const westernTeams = getTeamsForRound("west");
  const finalsTeams = getTeamsForRound("finals");
  if (stage === "Finish") {
    return (
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 sm:p-6 mx-auto">
        <h3 className="text-lg sm:text-xl font-semibold text-center text-colors-nba-blue">
          Champions Betting - Previous Guesses
        </h3>
        <p className="text-xs text-gray-500 text-center mt-1 mb-4">
          Your picks from earlier rounds
        </p>
        <ChampionGuessSummary stage={stage} />
        <button
          type="button"
          onClick={() => setShowInput("Close")}
          className="w-full min-h-[48px] flex items-center justify-center gap-1.5 text-sm font-medium text-colors-nba-blue active:bg-gray-50 rounded-lg mt-4 sm:w-auto sm:mx-auto sm:px-4 hover:underline"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="size-4 shrink-0"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 15.75 7.5-7.5 7.5 7.5"
            />
          </svg>
          Collapse Previous Guesses
        </button>
      </div>
    );
  }
  const lastDate = new Date(startDate).toLocaleString("he-IL", {
    timeZone: "Asia/Jerusalem",
  });
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white shadow-lg rounded-xl border border-gray-200 space-y-6">
      {stage !== "Before playoffs" && (
        <div className="text-center">
          <h3 className="text-lg sm:text-xl font-semibold text-colors-nba-blue">
            Previous Guesses
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Your picks from earlier rounds
          </p>
        </div>
      )}
      <ChampionGuessSummary stage={stage} />
      <h3 className="text-lg font-bold text-center text-gray-800">{`Champions Betting - ${
        stage === "Round 1" || stage === "Round 2" ? `After ${stage}` : stage
      }`}</h3>
      <div className="text-center text-gray-600 text-sm mt-4">
        <p>
          You have until <span className="font-semibold">{lastDate}</span> to
          make your guesses.
        </p>
        {guessesFilled && (
          <p className="font-bold text-colors-nba-blue">
            *** Your previous guesses already filled in. ***
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {isLoading && (
          <div className="flex justify-center">
            <CircularProgress />
          </div>
        )}
        {/* Eastern Conference Finals */}
        {!isLoading && stage === "Before playoffs" && (
          <div className="space-y-4">
            <h3 className="text-xl mt-2 font-semibold text-gray-700">
              Eastern Conference Finals
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormControl fullWidth required>
                <InputLabel>Team 1</InputLabel>
                <CustomSelectInput
                  id="easternTeam1"
                  label="Team 1"
                  value={selectedEasternTeam1}
                  options={easternTeams}
                  onChange={(e) =>
                    handleEastFinalsTeamSelection(e.target.value, 1)
                  }
                />
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Team 2</InputLabel>
                <CustomSelectInput
                  id="easternTeam2"
                  value={selectedEasternTeam2}
                  label="Team 2"
                  options={easternTeams}
                  onChange={(e) =>
                    handleEastFinalsTeamSelection(e.target.value, 2)
                  }
                />
              </FormControl>
            </div>
          </div>
        )}

        {/* Western Conference Finals */}
        {!isLoading && stage === "Before playoffs" && (
          <div className="space-y-4">
            <h3 className="text-xl mt-2 font-semibold text-gray-700">
              Western Conference Finals
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormControl fullWidth required>
                <InputLabel>Team 1</InputLabel>
                <CustomSelectInput
                  id="westernTeam1"
                  value={selectedWesternTeam1}
                  label="Team 1"
                  options={westernTeams}
                  onChange={(e) =>
                    handleWestFinalsTeamSelection(e.target.value, 1)
                  }
                />
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Team 2</InputLabel>
                <CustomSelectInput
                  id="westernTeam2"
                  value={selectedWesternTeam2}
                  label="Team 2"
                  options={westernTeams}
                  onChange={(e) =>
                    handleWestFinalsTeamSelection(e.target.value, 2)
                  }
                />
              </FormControl>
            </div>
          </div>
        )}

        {/* Finals */}
        {!isLoading && stage === "Before playoffs" && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mt-2 text-gray-700">Finals</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormControl fullWidth required>
                <InputLabel>Team 1</InputLabel>
                <CustomSelectInput
                  id="FinalsTeam1"
                  value={selectedFinalsTeam1}
                  label="Team 1"
                  onChange={(e) => setSelectedFinalsTeam1(e.target.value)}
                  options={westernTeams}
                />
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Team 2</InputLabel>
                <CustomSelectInput
                  id="FinalsTeam2"
                  value={selectedFinalsTeam2}
                  label="Team 2"
                  onChange={(e) => setSelectedFinalsTeam2(e.target.value)}
                  options={easternTeams}
                />
              </FormControl>
            </div>
          </div>
        )}

        {/* MVP */}
        {(stage === "Before playoffs" ||
          stage === "Round 1" ||
          stage === "Round 2") &&
          !isLoading && (
            <div className="space-y-4">
              <h3 className="text-xl mt-2 font-semibold text-gray-700">MVP</h3>
              <FormControl fullWidth required>
                <Autocomplete
                  id="MVP choice"
                  options={mvpOptions}
                  value={selectedMvp || null}
                  onChange={(_, newValue) => setSelectedMvp(newValue ?? "")}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="MVP"
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "1rem",
                        },
                      }}
                    />
                  )}
                />
              </FormControl>
            </div>
          )}

        {/* Champion */}
        {(stage === "Before playoffs" ||
          stage === "Round 1" ||
          stage === "Round 2") &&
          !isLoading && (
            <div className="space-y-4">
              <h3 className="text-xl mt-2 font-semibold text-gray-700">
                Champion
              </h3>
              <FormControl fullWidth required>
                <InputLabel>Champion Team</InputLabel>
                <CustomSelectInput
                  id="champion"
                  value={selectedChampion}
                  onChange={(e) => setSelectedChampion(e.target.value)}
                  label="Champion Team"
                  options={finalsTeams}
                />
              </FormControl>
            </div>
          )}
        {validationError && (
          <div role="alert" className="text-red-600 font-medium text-center my-2">
            {validationError}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-center mt-6 space-x-10">
          <button
            type="button"
            onClick={() => setShowInput("Close")}
            className="text-colors-nba-blue hover:scale-110 transition-transform"
          >
            Close
          </button>
          <SubmitButton text="Submit" loading={false} onClick={() => ""} />
        </div>
      </form>
    </div>
  );
};

export default ChampionsInput;
