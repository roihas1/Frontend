import React from "react";
import {
  InputLabel,
  FormControl,
  CircularProgress,
  Autocomplete,
  TextField,
} from "@mui/material";
import SubmitButton from "../../common/SubmitButton";
import CustomSelectInput from "../../form/CustomSelectInput";
import ChampionGuessSummary from "../ChampionGuessSummary";
import type { ChampionsInputModel } from "./useChampionsInputModel";

const ChampionsInputDesktopView: React.FC<ChampionsInputModel> = ({
  stage,
  setShowInput,
  selectedEasternTeam1,
  selectedEasternTeam2,
  selectedWesternTeam1,
  selectedWesternTeam2,
  selectedFinalsTeam1,
  selectedFinalsTeam2,
  selectedMvp,
  selectedChampion,
  guessesFilled,
  validationError,
  isLoading,
  easternTeams,
  westernTeams,
  finalsTeams,
  mvpOptions,
  lastDate,
  handleEastFinalsTeamSelection,
  handleWestFinalsTeamSelection,
  handleFinalsTeam1Change,
  handleFinalsTeam2Change,
  handleMvpChange,
  handleChampionChange,
  handleSubmit,
}) => {
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
                  onChange={(e) => handleFinalsTeam1Change(e.target.value)}
                  options={westernTeams}
                />
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Team 2</InputLabel>
                <CustomSelectInput
                  id="FinalsTeam2"
                  value={selectedFinalsTeam2}
                  label="Team 2"
                  onChange={(e) => handleFinalsTeam2Change(e.target.value)}
                  options={easternTeams}
                />
              </FormControl>
            </div>
          </div>
        )}

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
                  onChange={(_, newValue) => handleMvpChange(newValue ?? "")}
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
                  onChange={(e) => handleChampionChange(e.target.value)}
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

export default ChampionsInputDesktopView;
