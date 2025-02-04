import React from "react";

interface ButtonGroupProps {
  showCreateSeriesForm: boolean;
  showPlayoffsStageCreation: boolean;
  showCloseChampionsBets: boolean;
  isInEdit: boolean;
  handleCreateNewSeries: () => void;
  handleCloseChampionsBets: () => void;
  handlePlayoffsStageCreation: () => void;
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({
  showCreateSeriesForm,
  showPlayoffsStageCreation,
  showCloseChampionsBets,
  isInEdit,
  handleCreateNewSeries,
  handleCloseChampionsBets,
  handlePlayoffsStageCreation,
}) => (
  <div className="w-full flex justify-center gap-4 my-8">
    {!showCreateSeriesForm && (
      <button
        onClick={handleCreateNewSeries}
        className="bg-colors-nba-blue text-white p-2 mb-4 rounded-xl hover:opacity-80 w-1/3"
        disabled={isInEdit}
      >
        Create New Series
      </button>
    )}

    {!showPlayoffsStageCreation && (
      <button
        onClick={handlePlayoffsStageCreation}
        className="bg-colors-nba-blue text-white p-2 mb-4 rounded-xl hover:opacity-80 w-1/3"
        disabled={isInEdit}
      >
        Create New Champion Bets
      </button>
    )}

    {!showCloseChampionsBets && (
      <button
        onClick={handleCloseChampionsBets}
        className="bg-colors-nba-blue text-white p-2 mb-4 rounded-xl hover:opacity-80 w-1/3"
        disabled={isInEdit}
      >
        Close Champions Bets
      </button>
    )}
  </div>
);

export default ButtonGroup;
