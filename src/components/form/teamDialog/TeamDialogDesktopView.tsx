import React from "react";
import { Dialog } from "@headlessui/react";
import { Box, CircularProgress, Tab, Tabs } from "@mui/material";
import SubmitButton from "../../common/SubmitButton";
import BetsDisplay from "../../forPages/BetsDisplay";
import { HorizontalBar } from "./HorizontalBar";
import { TeamDialogModel } from "./useTeamDialogModel";

const TeamDialogDesktopView: React.FC<TeamDialogModel> = ({
  isOpen,
  series,
  closeDialog,
  userPoints,
  selectedTeam,
  selectedPlayerForBet,
  selectedPlayerForBetSpontaneous,
  selectedNumberOfGames,
  loading,
  guessPercentage,
  selectedTab,
  setSelectedTab,
  validationError,
  numOfSpontaneousBets,
  gamesTab,
  setGamesTab,
  seriesStart,
  isStartDatePassed,
  spontaneousExpiration,
  currentSpontaneousBet,
  validGamesTab,
  handleTeamSelection,
  handlePlayerSelectionForSeries,
  handlePlayerSelectionForSpontaneous,
  handleNumberOfGamesSelection,
  handleSubmit,
  handleRemoveGuessFromBet,
}) => {
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-100 bg-opacity-80 flex justify-center items-center">
        <CircularProgress />
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onClose={closeDialog} className="relative z-30">
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        aria-hidden="true"
      />

      <div className="fixed inset-0 flex items-center justify-center ">
        <Dialog.Panel className="bg-white rounded-3xl w-full max-w-lg sm:max-w-5xl p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto">
          <button
            type="button"
            onClick={closeDialog}
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-10 h-10 sm:w-8 sm:h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white absolute top-4 right-4"
          >
            <svg
              className="w-4 h-4 sm:w-3 sm:h-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
            <span className="sr-only">Close modal</span>
          </button>

          <Dialog.Title
            as="h3"
            className="text-2xl font-bold flex justify-center mb-4"
          >
            Series bets
          </Dialog.Title>

          <div className="flex flex-row items-center space-x-4 sm:flex-row sm:justify-center sm:items-center mb-4 sm:space-x-10 space-y-4 sm:space-y-0">
            <img
              src={series.logo1}
              alt={series.team1 ?? "Team 1"}
              className="h-16 w-1/5 sm:h-20 sm:w-1/5 object-contain"
            />

            {isStartDatePassed && (
              <div
                className="text-center text-gray-700 bg-colors-nba-blue bg-opacity-40 px-4 py-2 rounded-lg shadow-md 
        text-sm sm:text-lg leading-snug sm:leading-normal w-full sm:w-auto"
              >
                <p className="font-semibold">The series has started!</p>

                {numOfSpontaneousBets === 0 ? (
                  <p className="text-xs sm:text-base">Bets are now closed.</p>
                ) : (
                  <p className="text-xs sm:text-base">Check spontaneous bets</p>
                )}

                <p className="text-xs sm:text-base mt-1">
                  <span className="font-semibold">Last update:</span>{" "}
                  {new Date(series.lastUpdate).toLocaleString("he-IL", {
                    timeZone: "Asia/Jerusalem",
                  })}
                </p>

                <p className="text-xs sm:text-base mt-1">
                  <span className="font-semibold">Points Earned:</span>{" "}
                  {userPoints}
                </p>
              </div>
            )}

            {!isStartDatePassed && (
              <p className="text-xs sm:text-sm font-medium text-gray-600 text-center sm:text-left">
                <strong>Series start date:</strong>{" "}
                {seriesStart.toLocaleString("he-IL", {
                  timeZone: "Asia/Jerusalem",
                })}
              </p>
            )}

            <img
              src={series.logo2}
              alt={series.team2 ?? "Team 2"}
              className="h-16 w-1/5 sm:h-20 sm:w-1/5 object-contain"
            />
          </div>

          <div className="mt-4 ">
            <h4 className="text-lg font-semibold mb-2 flex justify-center">
              Select the number of games
            </h4>
            <div className="flex justify-center mb-4">
              <select
                className="p-3 sm:p-2 border w-full max-w-[120px] sm:w-1/5 text-colors-nba-blue border-colors-nba-blue rounded-lg text-base sm:text-sm"
                value={selectedNumberOfGames}
                onChange={handleNumberOfGamesSelection}
                disabled={isStartDatePassed}
              >
                <option value="">Games</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
              </select>
            </div>

            <h4 className="text-lg font-semibold mb-2 text-center">
              Select the winner of the series
            </h4>

            <ul className="space-y-4">
              <li className="flex flex-col sm:flex-row items-center bg-white p-3 rounded-lg shadow-md border border-gray-200">
                <div className="relative w-full">
                  <input
                    type="radio"
                    id="team1"
                    name="team"
                    value={1}
                    className="hidden peer"
                    onChange={handleTeamSelection}
                    checked={selectedTeam === 1}
                    disabled={isStartDatePassed}
                  />
                  <label
                    htmlFor="team1"
                    className={`block p-3 border rounded-lg text-center transition-all duration-200 w-full sm:w-full
          peer-checked:bg-colors-selected-bet peer-checked:border-colors-nba-blue hover:cursor-pointer
          ${
            selectedTeam === 1
              ? "bg-colors-select-bet border-colors-nba-blue text-gray-900"
              : "border-gray-300 bg-gray-100 text-gray-900"
          }  relative`}
                  >
                    <p className="font-semibold">{series.team1}</p>
                    <p className="text-sm">Seed #{series.seed1}</p>

                    {isStartDatePassed &&
                      series.bestOf7BetId?.seriesScore &&
                      series.bestOf7BetId.seriesScore[0] >
                        series.bestOf7BetId.seriesScore[1] && (
                        <span className="absolute top-1/2 right-2 transform -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full" />
                      )}
                  </label>
                </div>

                <div className="relative w-full">
                  <input
                    type="radio"
                    id="team2"
                    name="team"
                    value={2}
                    className="hidden peer"
                    onChange={handleTeamSelection}
                    checked={selectedTeam === 2}
                    disabled={isStartDatePassed}
                  />
                  <label
                    htmlFor="team2"
                    className={`block p-3 border rounded-lg text-center transition-all duration-200 w-full sm:w-full
          peer-checked:bg-colors-selected-bet peer-checked:border-colors-nba-blue hover:cursor-pointer
          ${
            selectedTeam === 2
              ? "bg-colors-select-bet border-colors-nba-blue text-gray-900"
              : "border-gray-300 bg-gray-100 text-gray-900"
          }  relative`}
                  >
                    <p className="font-semibold">{series.team2}</p>
                    <p className="text-sm">Seed #{series.seed2}</p>

                    {isStartDatePassed &&
                      series.bestOf7BetId?.seriesScore &&
                      series.bestOf7BetId.seriesScore[0] <
                        series.bestOf7BetId.seriesScore[1] && (
                        <span className="absolute top-1/2 right-2 transform -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full" />
                      )}
                  </label>
                </div>
              </li>

              {isStartDatePassed && (
                <div className="w-full flex justify-center mt-2">
                  <HorizontalBar
                    first={guessPercentage?.teamWin["1"]}
                    second={guessPercentage?.teamWin["2"]}
                    option1={series.team1 ?? ""}
                    option2={series.team2 ?? ""}
                  />
                </div>
              )}
            </ul>
          </div>

          <Box
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Tabs
              value={selectedTab}
              onChange={(e, newValue) => {
                e.preventDefault();
                setSelectedTab(newValue);
              }}
            >
              <Tab label="Series Bets" />
              {numOfSpontaneousBets > 0 && <Tab label="Spontaneous Bets" />}
            </Tabs>
          </Box>
          {selectedTab === 0 && (
            <BetsDisplay
              bets={series.playerMatchupBets ?? []}
              selectedPlayerForBet={selectedPlayerForBet}
              handlePlayerSelection={handlePlayerSelectionForSeries}
              handleRemoveGuessFromBet={handleRemoveGuessFromBet}
              isStartDatePassed={isStartDatePassed}
              guessPercentage={guessPercentage.playerMatchup}
            />
          )}
          {selectedTab === 1 && (
            <div>
              <Box
                sx={{
                  borderBottom: 1,
                  borderColor: "divider",
                  display: "flex",
                  justifyContent: "center",
                  overflowX: "auto",
                  whiteSpace: "nowrap",
                }}
              >
                <Tabs
                  value={validGamesTab}
                  onChange={(e, newValue) => {
                    e.preventDefault();
                    setGamesTab(newValue + 1);
                  }}
                  variant="scrollable"
                  scrollButtons="auto"
                  allowScrollButtonsMobile
                >
                  {numOfSpontaneousBets > 0 &&
                    Array.from(
                      { length: numOfSpontaneousBets },
                      (_, i) => i + 1
                    ).map((game) => <Tab key={game} label={game} />)}
                </Tabs>
              </Box>

              <p className="bg-colors-nba-blue bg-opacity-40 shadow-md rounded-lg text-center mx-auto my-4 p-2 w-fit text-sm font-medium text-gray-800">
                Game start:{" "}
                {(() => {
                  const startTime = series.spontaneousBets?.find(
                    (bet) => bet.gameNumber === gamesTab
                  )?.startTime;
                  return startTime
                    ? new Date(startTime).toLocaleString("he-IL", {
                        timeZone: "Asia/Jerusalem",
                      })
                    : "No time available";
                })()}
              </p>

              <BetsDisplay
                bets={
                  series.spontaneousBets?.filter(
                    (bet) => bet.gameNumber === gamesTab
                  ) ?? []
                }
                selectedPlayerForBet={selectedPlayerForBetSpontaneous}
                handlePlayerSelection={handlePlayerSelectionForSpontaneous}
                handleRemoveGuessFromBet={handleRemoveGuessFromBet}
                isStartDatePassed={
                  spontaneousExpiration[currentSpontaneousBet?.id ?? ""] ?? true
                }
                guessPercentage={guessPercentage.spontaneousMacthups}
              />
            </div>
          )}
          {validationError && (
            <div className="text-red-600 font-medium text-center my-2">
              {validationError}
            </div>
          )}

          {(!isStartDatePassed ||
            (selectedTab === 1 &&
              !spontaneousExpiration[currentSpontaneousBet?.id ?? ""])) && (
            <div className="m-4 flex justify-center p-4">
              <SubmitButton
                text={loading ? "Updating.." : "Update"}
                onClick={handleSubmit}
                loading={false}
                disabled={
                  selectedTab === 0
                    ? isStartDatePassed
                    : spontaneousExpiration[currentSpontaneousBet?.id ?? ""] ??
                      true
                }
              />
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default TeamDialogDesktopView;
