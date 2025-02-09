import React from "react";
import { Tabs, Tab, Box, Typography } from "@mui/material";
import { PlayerMatchupBet } from "../../types";

// Define Bet Type


// Props for BetsTabs Component
interface BetsTabsProps {
  bets: PlayerMatchupBet[];
  spontaneousBets: PlayerMatchupBet[];
  handleBetSelection: (bet: PlayerMatchupBet) => void;
  handleBetSelectionForUpdateResult: (bet: PlayerMatchupBet) => void;
  handleDeleteBet: (bet: PlayerMatchupBet, isSpontaneous:boolean) => void;
}

// BetsTabs Component
const BetsTabs: React.FC<BetsTabsProps> = ({
  bets,
  spontaneousBets,
  handleBetSelection,
  handleBetSelectionForUpdateResult,
  handleDeleteBet,
}) => {
  const [selectedTab, setSelectedTab] = React.useState<number>(0); // 0 for Bets, 1 for Spontaneous Bets

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <Box className="w-full max-w-2xl mx-auto">
      {/* Tabs Header */}
      <Tabs value={selectedTab} onChange={handleChangeTab} centered>
        <Tab label="Bets" />
        <Tab label="Spontaneous Bets" />
      </Tabs>

      {/* Bets Tab Content */}
      {selectedTab === 0 && (
        <Box className="mt-4">
          {bets?.length > 0 ? (
            bets.map((bet) => (
              <BetCard
                key={bet.id}
                bet={bet}
                handleBetSelection={handleBetSelection}
                handleBetSelectionForUpdateResult={handleBetSelectionForUpdateResult}
                handleDeleteBet={handleDeleteBet}
                isSpontaneous={false}
              />
            ))
          ) : (
            <Typography className="text-center text-gray-500 mt-4">No Bets Found</Typography>
          )}
        </Box>
      )}

      {/* Spontaneous Bets Tab Content */}
      {selectedTab === 1 && (
        <Box className="mt-4">
          {spontaneousBets?.length > 0 ? (
            spontaneousBets.map((bet) => (
              <BetCard
                key={bet.id}
                bet={bet}
                handleBetSelection={handleBetSelection}
                handleBetSelectionForUpdateResult={handleBetSelectionForUpdateResult}
                handleDeleteBet={handleDeleteBet}
                isSpontaneous= {true}
              />
            ))
          ) : (
            <Typography className="text-center text-gray-500 mt-4">No Spontaneous Bets Found</Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

// Props for BetCard Component
interface BetCardProps {
  bet: PlayerMatchupBet;
  handleBetSelection: (bet: PlayerMatchupBet) => void;
  handleBetSelectionForUpdateResult: (bet: PlayerMatchupBet) => void;
  handleDeleteBet: (bet: PlayerMatchupBet, isSpontaneous:boolean) => void;
  isSpontaneous:boolean;
}

// Reusable BetCard Component
const BetCard: React.FC<BetCardProps> = ({ bet, handleBetSelection, handleBetSelectionForUpdateResult, handleDeleteBet, isSpontaneous }) => {
  return (
    <div className="mb-4 p-4 border border-gray-300 rounded-lg w-full max-w-full mx-auto">
      <div className="flex justify-between">
        <span className="p-4">
          {bet.player1} vs {bet.player2}
        </span>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => handleBetSelection(bet)}
            className="text-colors-nba-blue border-2 border-colors-nba-blue rounded-2xl shadow-lg p-1 hover:text-blue-700 hover:opacity-60"
          >
            Edit Bet
          </button>
          <button
            type="button"
            onClick={() => handleBetSelectionForUpdateResult(bet)}
            className="text-colors-nba-blue border-2 border-colors-nba-blue rounded-2xl shadow-lg p-1 hover:text-blue-700 hover:opacity-60"
          >
            Update Result
          </button>
          <button
            type="button"
            onClick={() => handleDeleteBet(bet, isSpontaneous)}
            className="text-red-500 border-2 border-colors-nba-red rounded-2xl shadow-lg p-1 hover:text-red-700 hover:opacity-60"
          >
            Delete Bet
          </button>
        </div>
      </div>
    </div>
  );
};

export default BetsTabs;
