import React, { useState } from "react";
import { Series } from "../pages/HomePage"; // Assuming `Series` type is correctly imported
import {
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  TextField,
  FormHelperText,
} from "@mui/material";
import axiosInstance from "../api/axiosInstance";
import { useSuccessMessage } from "./successMassageProvider";
import { useError } from "./ErrorProvider";
import SubmitButton from "./form/SubmitButton";

interface ChampionsInputProps {
  west: Series[];
  east: Series[];
  startDate: string;
  stage: string;
  setShowInput: () => void;
}

const ChampionsInput: React.FC<ChampionsInputProps> = ({
  west,
  east,
  startDate,
  stage,
  setShowInput,
}) => {
  const [selectedEasternTeam1, setSelectedEasternTeam1] = useState<
    string | null
  >(null);
  const [selectedEasternTeam2, setSelectedEasternTeam2] = useState<
    string | null
  >(null);
  const [selectedWesternTeam1, setSelectedWesternTeam1] = useState<
    string | null
  >(null);
  const [selectedWesternTeam2, setSelectedWesternTeam2] = useState<
    string | null
  >(null);
  const [selectedFinalsTeam1, setSelectedFinalsTeam1] = useState<string | null>(
    null
  );
  const [selectedFinalsTeam2, setSelectedFinalsTeam2] = useState<string | null>(
    null
  );
  const [selectedMvp, setSelectedMvp] = useState<string>("");
  const [selectedChampion, setSelectedChampion] = useState<string>("");

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

  // Get the teams for each round
  const easternTeams = getTeamsForRound("east");
  const westernTeams = getTeamsForRound("west");
  const finalsTeams = getTeamsForRound("finals");

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg space-y-6">
      <h3 className="text-lg font-bold text-center text-gray-800">{`Champions Bets - ${
        stage === "Round 1" || stage === "Round 2" ? `After ${stage}` : stage
      }`}</h3>
      <div className="text-center text-gray-600 text-sm mt-4">
        <p>
          You have until <span className="font-semibold">{startDate}</span> to
          make your guesses.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Eastern Conference Finals */}
        {stage === "Before playoffs" && (
          <div className="space-y-4">
            <h3 className="text-xl mt-2 font-semibold text-gray-700">
              Eastern Conference Finals
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormControl fullWidth required>
                <InputLabel>Team 1</InputLabel>
                <Select
                  id="easternTeam1"
                  value={selectedEasternTeam1 || ""}
                  onChange={(e) => setSelectedEasternTeam1(e.target.value)}
                  label="Team 1"
                >
                  <MenuItem value="">Select Team 1</MenuItem>
                  {easternTeams.map((team) => (
                    <MenuItem key={team} value={team}>
                      {team}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Team 2</InputLabel>
                <Select
                  id="easternTeam2"
                  value={selectedEasternTeam2 || ""}
                  onChange={(e) => setSelectedEasternTeam2(e.target.value)}
                  label="Team 2"
                >
                  <MenuItem value="">Select Team 2</MenuItem>
                  {easternTeams.map((team) => (
                    <MenuItem key={team} value={team}>
                      {team}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>
        )}

        {/* Western Conference Finals */}
        {stage === "Before playoffs" && (
          <div className="space-y-4">
            <h3 className="text-xl mt-2 font-semibold text-gray-700">
              Western Conference Finals
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormControl fullWidth required>
                <InputLabel>Team 1</InputLabel>
                <Select
                  id="westernTeam1"
                  value={selectedWesternTeam1 || ""}
                  onChange={(e) => setSelectedWesternTeam1(e.target.value)}
                  label="Team 1"
                >
                  <MenuItem value="">Select Team 1</MenuItem>
                  {westernTeams.map((team) => (
                    <MenuItem key={team} value={team}>
                      {team}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Team 2</InputLabel>
                <Select
                  id="westernTeam2"
                  value={selectedWesternTeam2 || ""}
                  onChange={(e) => setSelectedWesternTeam2(e.target.value)}
                  label="Team 2"
                >
                  <MenuItem value="">Select Team 2</MenuItem>
                  {westernTeams.map((team) => (
                    <MenuItem key={team} value={team}>
                      {team}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>
        )}

        {/* Finals */}
        {stage === "Before playoffs" && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mt-2 text-gray-700">Finals</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormControl fullWidth required>
                <InputLabel>Team 1</InputLabel>
                <Select
                  id="finalsTeam1"
                  value={selectedFinalsTeam1 || ""}
                  onChange={(e) => setSelectedFinalsTeam1(e.target.value)}
                  label="Team 1"
                >
                  <MenuItem value="">Select Team 1</MenuItem>
                  {finalsTeams.map((team) => (
                    <MenuItem key={team} value={team}>
                      {team}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Team 2</InputLabel>
                <Select
                  id="finalsTeam2"
                  value={selectedFinalsTeam2 || ""}
                  onChange={(e) => setSelectedFinalsTeam2(e.target.value)}
                  label="Team 2"
                >
                  <MenuItem value="">Select Team 2</MenuItem>
                  {finalsTeams.map((team) => (
                    <MenuItem key={team} value={team}>
                      {team}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>
        )}

        {/* MVP */}
        {(stage === "Before playoffs" ||
          stage === "Round 1" ||
          stage === "Round 2") && (
          <div className="space-y-4">
            <h3 className="text-xl mt-2 font-semibold text-gray-700">MVP</h3>
            <FormControl fullWidth required>
              <InputLabel>MVP</InputLabel>
              <Select
                onChange={(e) => setSelectedMvp(e.target.value)}
                id="MVP choice"
                label="Enter MVP's name"
                value={selectedMvp}
              >
                <MenuItem disabled>-- Select MVP --</MenuItem>
                {playersList.map((player)=>(
                    <MenuItem key={player} value={player}>
                        {player}
                    </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        )}

        {/* Champion */}
        {(stage === "Before playoffs" ||
          stage === "Round 1" ||
          stage === "Round 2") && (
          <div className="space-y-4">
            <h3 className="text-xl mt-2 font-semibold text-gray-700">
              Champion
            </h3>
            <FormControl fullWidth required>
              <InputLabel>Champion Team</InputLabel>
              <Select
                id="champion"
                value={selectedChampion || ""}
                onChange={(e) => setSelectedChampion(e.target.value)}
                label="Champion Team"
                sx={{
                    borderRadius:"1rem",
                }}
              >
                <MenuItem value="">Select Champion Team</MenuItem>
                {finalsTeams.map((team) => (
                  <MenuItem key={team} value={team}>
                    {team}
                  </MenuItem>
                ))}
              </Select>
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
