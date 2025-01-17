import React, { useEffect, useState } from "react";
import { Series } from "../pages/HomePage"; // Assuming `Series` type is correctly imported
import { InputLabel, FormControl, CircularProgress } from "@mui/material";
import axiosInstance from "../api/axiosInstance";
import { useSuccessMessage } from "./successMassageProvider";
import { useError } from "./ErrorProvider";
import SubmitButton from "./form/SubmitButton";
import CustomSelectInput from "./form/CustomSelectInput";
import ChampionGuessSummary from "./ChampionGuessSummary";

interface ChampionsInputProps {
  west: Series[];
  east: Series[];
  startDate: string;
  stage: string;
  setShowInput: () => void;
}
const nbaTeamsNicknames: { [key: string]: string } = {
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
    "Lebron James",
    "Steph Curry",
    "SGA",
    "Nikola Jokic",
    "Jason Tatum",
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent the default form submission

    // Validate the fields before submitting
    if (validateFields()) {
      showError("Please fill in all the required fields.");
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
              team1: selectedEasternTeam1,
              team2: selectedEasternTeam2,
              conference: "East",
            },
            {
              team1: selectedWesternTeam1,
              team2: selectedWesternTeam2,
              conference: "West",
            },
            {
              team1: selectedFinalsTeam1,
              team2: selectedFinalsTeam2,
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
      console.log(stage);
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
              setSelectedEasternTeam1(guess.team1);
              setSelectedEasternTeam2(guess.team2);
              setGuessesFilled(true);
              break;
            case "West":
              setSelectedWesternTeam1(guess.team1);
              setSelectedWesternTeam2(guess.team2);
              setGuessesFilled(true);
              break;
            case "Finals":
              setSelectedFinalsTeam1(guess.team1);
              setSelectedFinalsTeam2(guess.team2);
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
      <h3 className="text-lg font-bold text-center text-gray-800">{`Champions Betting - ${
        stage === "Round 1" || stage === "Round 2" ? `After ${stage}` : stage
      }`}</h3>
      <ChampionGuessSummary stage={stage} />
      <div className="text-center text-gray-600 text-sm mt-4">
        <p>
          You have until <span className="font-semibold">{startDate}</span> to
          make your guesses.
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
                  onChange={(e) => {
                    console.log(e.target.name);
                    setSelectedEasternTeam1(nbaTeamsNicknames[e.target.value]);
                  }}
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
                    setSelectedEasternTeam2(nbaTeamsNicknames[e.target.value])
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
                    setSelectedWesternTeam1(nbaTeamsNicknames[e.target.value])
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
                    setSelectedWesternTeam2(nbaTeamsNicknames[e.target.value])
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
                  onChange={(e) =>
                    setSelectedFinalsTeam1(nbaTeamsNicknames[e.target.value])
                  }
                  options={finalsTeams}
                />
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Team 2</InputLabel>
                <CustomSelectInput
                  id="FinalsTeam2"
                  value={selectedFinalsTeam2}
                  label="Team 2"
                  onChange={(e) =>
                    setSelectedFinalsTeam2(nbaTeamsNicknames[e.target.value])
                  }
                  options={finalsTeams}
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
                  label="MVP's name"
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
