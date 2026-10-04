import React, { useEffect, useState } from "react";
import { Autocomplete, TextField } from "@mui/material";
import SubmitButton from "../../common/SubmitButton";
import ChampionGuessSummary from "../ChampionGuessSummary";
import ChampionsInputMobileSkeleton from "./ChampionsInputMobileSkeleton";
import HighlightPickCard from "./HighlightPickCard";
import MatchupPickCard from "./MatchupPickCard";
import PickProgress from "./PickProgress";
import TeamPickerSheet from "./TeamPickerSheet";
import TeamSlot from "./TeamSlot";
import type {
  ChampPickField,
  ChampionsInputModel,
} from "./useChampionsInputModel";

const CARD_ID: Record<ChampPickField, string> = {
  easternTeam1: "champ-card-east",
  easternTeam2: "champ-card-east",
  westernTeam1: "champ-card-west",
  westernTeam2: "champ-card-west",
  finalsTeam1: "champ-card-finals",
  finalsTeam2: "champ-card-finals",
  mvp: "champ-card-mvp",
  champion: "champ-card-champion",
};

function matchupError(first?: string, second?: string): string | undefined {
  if (first && second) return "Select both teams";
  return first || second;
}

const ChampionsInputMobileView: React.FC<ChampionsInputModel> = ({
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
  fieldErrors,
  scrollTarget,
  scrollNonce,
  isSubmitting,
  isLoading,
  easternTeams,
  westernTeams,
  finalsTeams,
  mvpOptions,
  teamLogos,
  pickedCount,
  totalPicks,
  lastDate,
  stageLabel,
  handleEastFinalsTeamSelection,
  handleWestFinalsTeamSelection,
  handleFinalsTeam1Change,
  handleFinalsTeam2Change,
  handleMvpChange,
  handleChampionChange,
  handleSubmit,
}) => {
  const [openField, setOpenField] = useState<ChampPickField | null>(null);
  const showMatchups = stage === "Before playoffs";
  const showAwards =
    stage === "Before playoffs" || stage === "Round 1" || stage === "Round 2";

  useEffect(() => {
    if (!scrollTarget) return;
    const card = document.getElementById(CARD_ID[scrollTarget]);
    const container = card?.closest("[data-champ-scroll]");
    if (!card || !(container instanceof HTMLElement)) return;
    const cardTop = card.getBoundingClientRect().top;
    const containerTop = container.getBoundingClientRect().top;
    container.scrollTo({
      top: container.scrollTop + (cardTop - containerTop) - 12,
      behavior: "smooth",
    });
  }, [scrollNonce, scrollTarget]);

  if (isLoading) {
    return <ChampionsInputMobileSkeleton showMatchups={showMatchups} />;
  }

  const picker = (() => {
    switch (openField) {
      case "easternTeam1":
        return {
          title: "Eastern Conference Finals",
          teams: easternTeams,
          selectedTeam: selectedEasternTeam1,
          disabledTeams: selectedEasternTeam2 ? [selectedEasternTeam2] : [],
          onSelect: (team: string) => handleEastFinalsTeamSelection(team, 1),
        };
      case "easternTeam2":
        return {
          title: "Eastern Conference Finals",
          teams: easternTeams,
          selectedTeam: selectedEasternTeam2,
          disabledTeams: selectedEasternTeam1 ? [selectedEasternTeam1] : [],
          onSelect: (team: string) => handleEastFinalsTeamSelection(team, 2),
        };
      case "westernTeam1":
        return {
          title: "Western Conference Finals",
          teams: westernTeams,
          selectedTeam: selectedWesternTeam1,
          disabledTeams: selectedWesternTeam2 ? [selectedWesternTeam2] : [],
          onSelect: (team: string) => handleWestFinalsTeamSelection(team, 1),
        };
      case "westernTeam2":
        return {
          title: "Western Conference Finals",
          teams: westernTeams,
          selectedTeam: selectedWesternTeam2,
          disabledTeams: selectedWesternTeam1 ? [selectedWesternTeam1] : [],
          onSelect: (team: string) => handleWestFinalsTeamSelection(team, 2),
        };
      case "finalsTeam1":
        return {
          title: "West champion",
          teams: westernTeams,
          selectedTeam: selectedFinalsTeam1,
          disabledTeams: [],
          onSelect: handleFinalsTeam1Change,
        };
      case "finalsTeam2":
        return {
          title: "East champion",
          teams: easternTeams,
          selectedTeam: selectedFinalsTeam2,
          disabledTeams: [],
          onSelect: handleFinalsTeam2Change,
        };
      case "champion":
        return {
          title: "Champion",
          teams: finalsTeams,
          selectedTeam: selectedChampion,
          disabledTeams: [],
          onSelect: handleChampionChange,
        };
      default:
        return null;
    }
  })();

  return (
    <form
      onSubmit={handleSubmit}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div
        data-champ-scroll
        className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3"
      >
        <PickProgress
          stageLabel={stageLabel}
          deadlineLabel={lastDate}
          pickedCount={pickedCount}
          totalPicks={totalPicks}
        />

        {guessesFilled && (
          <div className="rounded-xl border border-colors-nba-blue/20 bg-blue-50 px-3 py-2 text-sm text-colors-nba-blue">
            Your saved picks were loaded. You can edit them until the deadline.
          </div>
        )}

        {stage !== "Before playoffs" && (
          <ChampionGuessSummary stage={stage} startCollapsed />
        )}

        {showMatchups && (
          <>
            <MatchupPickCard
              id="champ-card-east"
              title="Eastern Conference Finals"
              accent="east"
              logos={teamLogos}
              error={matchupError(fieldErrors.easternTeam1, fieldErrors.easternTeam2)}
              slot1={{
                label: "Team 1",
                team: selectedEasternTeam1,
                onPress: () => setOpenField("easternTeam1"),
              }}
              slot2={{
                label: "Team 2",
                team: selectedEasternTeam2,
                onPress: () => setOpenField("easternTeam2"),
              }}
            />
            <MatchupPickCard
              id="champ-card-west"
              title="Western Conference Finals"
              accent="west"
              logos={teamLogos}
              error={matchupError(fieldErrors.westernTeam1, fieldErrors.westernTeam2)}
              slot1={{
                label: "Team 1",
                team: selectedWesternTeam1,
                onPress: () => setOpenField("westernTeam1"),
              }}
              slot2={{
                label: "Team 2",
                team: selectedWesternTeam2,
                onPress: () => setOpenField("westernTeam2"),
              }}
            />
            <MatchupPickCard
              id="champ-card-finals"
              title="Finals"
              accent="finals"
              logos={teamLogos}
              error={matchupError(fieldErrors.finalsTeam1, fieldErrors.finalsTeam2)}
              slot1={{
                label: "West champion",
                team: selectedFinalsTeam1,
                onPress: () => setOpenField("finalsTeam1"),
              }}
              slot2={{
                label: "East champion",
                team: selectedFinalsTeam2,
                onPress: () => setOpenField("finalsTeam2"),
              }}
            />
          </>
        )}

        {showAwards && (
          <>
            <HighlightPickCard
              id="champ-card-mvp"
              title="MVP"
              accent="mvp"
              complete={Boolean(selectedMvp) && !fieldErrors.mvp}
              error={fieldErrors.mvp}
            >
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
                    error={Boolean(fieldErrors.mvp)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "1rem",
                      },
                    }}
                  />
                )}
              />
            </HighlightPickCard>
            <HighlightPickCard
              id="champ-card-champion"
              title="Champion"
              accent="champion"
              complete={Boolean(selectedChampion) && !fieldErrors.champion}
              error={fieldErrors.champion}
            >
              <TeamSlot
                label="Champion team"
                team={selectedChampion}
                logo={teamLogos[selectedChampion]}
                layout="row"
                invalid={Boolean(fieldErrors.champion) && !selectedChampion}
                onPress={() => setOpenField("champion")}
              />
            </HighlightPickCard>
          </>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-3 border-t border-gray-200 bg-white px-4 py-3">
        <button
          type="button"
          onClick={() => setShowInput("Close")}
          className="min-h-[48px] shrink-0 rounded-xl px-3 text-sm font-medium text-colors-nba-blue active:bg-gray-100"
        >
          Close
        </button>
        <SubmitButton
          text="Submit"
          loading={isSubmitting}
          disabled={isSubmitting}
          className="min-h-[48px] w-full flex-1"
        />
      </div>

      <TeamPickerSheet
        open={picker !== null}
        title={picker?.title ?? ""}
        teams={picker?.teams ?? []}
        logos={teamLogos}
        selectedTeam={picker?.selectedTeam ?? ""}
        disabledTeams={picker?.disabledTeams ?? []}
        onSelect={(team) => {
          picker?.onSelect(team);
          setOpenField(null);
        }}
        onClose={() => setOpenField(null)}
      />
    </form>
  );
};

export default ChampionsInputMobileView;
