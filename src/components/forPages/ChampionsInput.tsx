import React, { useEffect, useState } from "react";
import { Series } from "../../pages/HomePage"; // Assuming `Series` type is correctly imported
import { InputLabel, FormControl, CircularProgress } from "@mui/material";
import axiosInstance from "../../api/axiosInstance";
import { useSuccessMessage } from "../providers&context/successMassageProvider";
import { useError } from "../providers&context/ErrorProvider";
import SubmitButton from "../common/SubmitButton";
import CustomSelectInput from "../form/CustomSelectInput";
import ChampionGuessSummary from "../forPages/ChampionGuessSummary";

interface ChampionsInputProps {
  west: Series[];
  east: Series[];
  startDate: Date;
  stage: string;
  setShowInput: () => void;
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
  "Minnesota Timberwolves": "Timberwolves",
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
  Timberwolves: "Minnesota Timberwolves",
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
  const [loading, setLoading] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { showSuccessMessage } = useSuccessMessage();
  const { showError } = useError();

  // Function to get teams from the selected round
  const getTeamsForRound = (round: "east" | "west" | "finals") => {
    switch (round) {
      case "east":
        return [
          ...new Set(east.flatMap((series) => [series.team1, series.team2])),
        ];
      case "west":
        return [
          ...new Set(west.flatMap((series) => [series.team1, series.team2])),
        ];
      case "finals":
        return [
          ...new Set([
            ...west.flatMap((series) => [series.team1, series.team2]),
            ...east.flatMap((series) => [series.team1, series.team2]),
          ]),
        ];
      default:
        return [];
    }
  };
  const playersList = [
    "LeBron James",
    "Stephen Curry",
    "Shai Gilgeous-Alexander",
    "Nikola Jokic",
    "Jayson Tatum",
    "Giannis Antetokounmpo",
    "Kevin Durant",
    "Kawhi Leonard",
    "Anthony Edwards",
    "Luka Doncic",
    "Devin Booker",
    "Jaylen Brown",
    "Jimmy Butler",
    "Jamal Murray",
    "Tyrese Haliburton",
    "Donovan Mitchell",
    "Jalen Brunson",
    "Cade Cunningham",
    "James Harden",
    "Amen Thompson",
  ];
  
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
    console.log(team, numTeam);
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
    console.log(team, numTeam);
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

    try {
      if (stage === "Before playoffs") {
        await axiosInstance.post("/champions-guess/update/beforePlayoffs", {
          champTeamGuess: {
            team: selectedChampion,
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
          champTeamGuess: {
            team: selectedChampion,
          },
          mvpGuess: {
            player: selectedMvp,
          },
          stage,
        });
      }
    } catch (error) {
      console.log(error);
      showError(`Failed to update champion guess ${error}`);
    } finally {
      setShowInput();
      showSuccessMessage("Your guesses updated!");
    }
  };
  const fetchUserGuesses = async (stage: string) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/playoffs-stage/userGuesses/${stage}`
      );
      const guesses = response.data;

      if (
        guesses.conferenceFinalGuesses.length > 0 &&
        stage === "Before playoffs"
      ) {
        for (const guess of guesses.conferenceFinalGuesses) {
          switch (guess.conference) {
            case "East":
              setSelectedEasternTeam1(nbaTeamsNicknamesReversed[guess.team1]);
              setSelectedEasternTeam2(nbaTeamsNicknamesReversed[guess.team2]);
              setGuessesFilled(true);
              break;
            case "West":
              setSelectedWesternTeam1(nbaTeamsNicknamesReversed[guess.team1]);
              setSelectedWesternTeam2(nbaTeamsNicknamesReversed[guess.team2]);
              setGuessesFilled(true);
              break;
            case "Finals":
              setSelectedFinalsTeam1(nbaTeamsNicknamesReversed[guess.team1]);
              setSelectedFinalsTeam2(nbaTeamsNicknamesReversed[guess.team2]);
              setGuessesFilled(true);
              break;
          }
        }
      }
      if (guesses.championTeamGuesses.length > 0) {
        setSelectedChampion(guesses.championTeamGuesses[0].team);
        setGuessesFilled(true);
      }
      if (guesses.mvpGuesses.length > 0) {
        setSelectedMvp(guesses.mvpGuesses[0].player);
        setGuessesFilled(true);
      }
    } catch (error) {
      showError(`Failed to get your guesses.`);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (stage !== "Finish") {
      fetchUserGuesses(stage);
    }
  }, [stage]);

  // Get the teams for each round
  const easternTeams = getTeamsForRound("east");
  const westernTeams = getTeamsForRound("west");
  const finalsTeams = getTeamsForRound("finals");
  if (stage === "Finish") {
    return (
      <div className="bg-white p-6 mx-auto shadow-lg rounded-lg">
        <h3 className="text-lg font-bold text-center text-gray-800 mb-4">
          Champions Betting - Previous Guesses
        </h3>
        <ChampionGuessSummary stage={stage} />
        <button
          type="button"
          onClick={() => setShowInput()}
          className="text-colors-nba-red hover:scale-110 transition-transform mt-6"
        >
          Collapse Previous Guesses
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg space-y-6">
      {stage !== "Before playoffs" && (
        <h3 className="text-md font-bold text-center text-gray-800">
          Previous Guesses
        </h3>
      )}
      <ChampionGuessSummary stage={stage} />
      <h3 className="text-lg font-bold text-center text-gray-800">{`Champions Betting - ${
        stage === "Round 1" || stage === "Round 2" ? `After ${stage}` : stage
      }`}</h3>
      <div className="text-center text-gray-600 text-sm mt-4">
        <p>
          You have until{" "}
          <span className="font-semibold">
            {new Date(startDate).toLocaleString("he-IL", {
              timeZone: "Asia/Jerusalem",
            })}
          </span>{" "}
          to make your guesses.
        </p>
        {guessesFilled && (
          <p className="font-bold text-colors-nba-blue">
            *** Your previous guesses already filled in. ***
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {loading && (
          <div className="flex justify-center">
            <CircularProgress />
          </div>
        )}
        {/* Eastern Conference Finals */}
        {!loading && stage === "Before playoffs" && (
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
        {!loading && stage === "Before playoffs" && (
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
        {!loading && stage === "Before playoffs" && (
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
          !loading && (
            <div className="space-y-4">
              <h3 className="text-xl mt-2 font-semibold text-gray-700">MVP</h3>
              <FormControl fullWidth required>
                <InputLabel>MVP</InputLabel>
                <CustomSelectInput
                  id="MVP choice"
                  label="MVP"
                  value={selectedMvp}
                  options={playersList}
                  onChange={(e) => setSelectedMvp(e.target.value)}
                />
              </FormControl>
            </div>
          )}

        {/* Champion */}
        {(stage === "Before playoffs" ||
          stage === "Round 1" ||
          stage === "Round 2") &&
          !loading && (
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
          <div className="text-red-600 font-medium text-center my-2">
            {validationError}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-center mt-6 space-x-10">
          <button
            type="button"
            onClick={() => setShowInput()}
            className="text-colors-nba-red hover:scale-110 transition-transform"
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
