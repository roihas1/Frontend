import React from "react";

const actionButtonClass =
  "bg-colors-nba-blue text-white p-2 mb-4 rounded-xl hover:opacity-80 min-w-[180px] flex-1 max-w-[280px]";

interface ButtonGroupProps {
  showCreateSeriesForm: boolean;
  showPlayoffsStageCreation: boolean;
  showCloseChampionsBets: boolean;
  showCreateTournamentForm: boolean;
  isInEdit: boolean;
  handleCreateNewSeries: () => void;
  handleCloseChampionsBets: () => void;
  handlePlayoffsStageCreation: () => void;
  handleCreateTournament: () => void;
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({
  showCreateSeriesForm,
  showPlayoffsStageCreation,
  showCloseChampionsBets,
  showCreateTournamentForm,
  isInEdit,
  handleCreateNewSeries,
  handleCloseChampionsBets,
  handlePlayoffsStageCreation,
  handleCreateTournament,
}) => (
  <div className="w-full flex flex-wrap justify-center gap-4 my-8">
    {!showCreateSeriesForm && (
      <button
        type="button"
        onClick={handleCreateNewSeries}
        className={actionButtonClass}
        disabled={isInEdit}
      >
        Create New Series
      </button>
    )}

    {!showPlayoffsStageCreation && (
      <button
        type="button"
        onClick={handlePlayoffsStageCreation}
        className={actionButtonClass}
        disabled={isInEdit}
      >
        Create New Champion Bets
      </button>
    )}

    {!showCloseChampionsBets && (
      <button
        type="button"
        onClick={handleCloseChampionsBets}
        className={actionButtonClass}
        disabled={isInEdit}
      >
        Close Champions Bets
      </button>
    )}

    {!showCreateTournamentForm && (
      <button
        type="button"
        onClick={handleCreateTournament}
        className={actionButtonClass}
        disabled={isInEdit}
      >
        Create Tournament
      </button>
    )}
  </div>
);

export default ButtonGroup;
