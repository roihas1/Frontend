import React from "react";
import {
  Typography,
  InputLabel,
  FormControl,
  Autocomplete,
  TextField,
  Tooltip,
  Modal,
  Box,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
} from "@mui/material";
import { User } from "../../types";
import CustomSelectInput from "../../components/form/CustomSelectInput";
import ChampColumn from "../../components/forPages/ChampColumn";
import ChampGuessColumn from "../../components/forPages/ChampGuessColumn";
import InstructionPaper from "../../components/forPages/ComparisonInstruction";
import ClearUsersButton from "../../components/forPages/ClearUsersButton";
import BetColumn from "../../components/forPages/BetColumn";
import GuessColumn from "../../components/forPages/GuessColumn";
import { useComparingPageModel } from "./useComparingPageModel";

export type ComparingPageDesktopViewProps = ReturnType<
  typeof useComparingPageModel
>;

const ComparingPageDesktopView: React.FC<ComparingPageDesktopViewProps> = (
  model,
) => {
  const {
    allSeriesBets,
    currentUser,
    users,
    series,
    passedStages,
    leagues,
    selectedSeries,
    selectedSeriesName,
    selectedUsers,
    selectedStage,
    selectedLeague,
    usersGuesses,
    userChampGuesses,
    comparisonType,
    betsType,
    showSeriesSelection,
    showChampSelection,
    open,
    isLoadingInitial,
    isLoadingUser,
    handleOpenModal,
    handleCloseModal,
    handleChangeType,
    handleBetsType,
    handleStageSelection,
    handleLeagueSelection,
    handleSeriesSelection,
    handleSelectionUsers,
    handleClearSelectedUsers,
    handleRemoveUser,
    getFantasyPoints,
  } = model;
  const selectedUsersCount = Object.keys(selectedUsers).length;

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="sticky top-2 z-20 w-full bg-gray-100/95 backdrop-blur-sm border-b border-gray-200 pb-2">
        <div className="flex w-full justify-between items-center px-8">
          <div className="flex justify-start">
            <FormControl>
              <FormLabel>Comparison type</FormLabel>
              <RadioGroup row value={comparisonType} onChange={handleChangeType}>
                <FormControlLabel
                  value="Series"
                  control={<Radio size="small" color="default" />}
                  label="Series"
                />
                <FormControlLabel
                  value="Champ"
                  control={<Radio size="small" color="default" />}
                  label="Champ"
                />
              </RadioGroup>
            </FormControl>
          </div>
          <div className="flex items-center mx-auto space-x-2">
            <h1 className="text-2xl font-semibold underline mb-2">
              Users comparison
            </h1>
            <Tooltip
              title={
                <Typography className="flex justify-center text-xs">
                  Instruction
                </Typography>
              }
              arrow
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="size-6 ml-12 hover:cursor-pointer "
                onClick={handleOpenModal}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                />
              </svg>
            </Tooltip>
            <div className="w-32" />
          </div>
          <Modal open={open} onClose={handleCloseModal}>
            <Box
              sx={{
                width: { xs: "92%", sm: "70%", md: "50%" },
                maxWidth: 720,
                height: "auto",
                margin: "auto",
                marginTop: 10,
                backgroundColor: "white",
                padding: 3,
                borderRadius: "8px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: 24,
              }}
            >
              <InstructionPaper />
            </Box>
          </Modal>
        </div>
        <div className="flex justify-between items-center mb-4 w-full ">
          {showSeriesSelection && series && (
            <div className="w-1/5 truncate mb-4 ml-8 mt-2 pt-2 ">
              <FormControl fullWidth>
                <InputLabel>Select Series</InputLabel>
                <CustomSelectInput
                  id="1"
                  value={selectedSeries}
                  label={
                    Object.values(series).length === 0
                      ? "- No Series has Ended -"
                      : "Series"
                  }
                  onChange={(e) => {
                    handleSeriesSelection(e.target.value);
                  }}
                  optionsForCompare={Object.entries(series).map(([id, name]) => ({
                    id,
                    name,
                  }))}
                />
              </FormControl>
            </div>
          )}
          {showChampSelection && passedStages && (
            <div className="w-1/5 truncate mb-4 ml-8 mt-2 pt-2 ">
              <FormControl fullWidth variant="outlined">
                <InputLabel className="px-2">Select Champ Stage</InputLabel>
                <CustomSelectInput
                  id="1"
                  value={selectedStage}
                  label="Select Champ Stage"
                  onChange={handleStageSelection}
                  options={passedStages}
                />
              </FormControl>
            </div>
          )}
          {leagues.length > 0 && (
            <div className="w-1/5 truncate mb-4 mx-8 mt-2 pt-2 ">
              <FormControl fullWidth>
                <InputLabel>Select League</InputLabel>
                <CustomSelectInput
                  id="league"
                  value={selectedLeague?.name ?? ""}
                  label={leagues.length === 0 ? "- No Leagues -" : "Leagues"}
                  onChange={handleLeagueSelection}
                  options={leagues.map((league) => league.name)}
                />
              </FormControl>
            </div>
          )}
          {users && (
            <div className="flex space-x-5 w-2/5  items-center mb-2 mr-6">
              <div className="w-3/4 items-start ">
                {selectedLeague?.name !== "Overall" && (
                  <Autocomplete
                    multiple
                    options={Object.values(users)}
                    disableCloseOnSelect
                    getOptionLabel={(option) =>
                      `${option.firstName} ${option.lastName}`
                    }
                    value={Object.keys(selectedUsers)
                      .map(
                        (id) =>
                          Object.values(users).find((user) => user.id === id)!,
                      )
                      .filter(Boolean)}
                    onChange={(event, newValues) => {
                      event.preventDefault();
                      handleSelectionUsers(newValues);
                    }}
                    renderOption={(props, option, { selected }) => (
                      <li {...props} key={option.id}>
                        <Checkbox checked={selected} />
                        {`${option.firstName} ${option.lastName}`}
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        margin="normal"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "1rem",
                          },
                        }}
                        label="Search Users"
                      />
                    )}
                  />
                )}
                {selectedLeague?.name === "Overall" && (
                  <Autocomplete
                    multiple
                    options={Object.values(users)}
                    disableCloseOnSelect
                    getOptionLabel={(option) =>
                      `${option.firstName} ${option.lastName}`
                    }
                    value={Object.keys(selectedUsers)
                      .map(
                        (id) =>
                          Object.values(users).find((user) => user.id === id)!,
                      )
                      .filter(Boolean)}
                    onChange={(event, newValues) => {
                      event.preventDefault();
                      handleSelectionUsers(newValues as User[]);
                    }}
                    renderOption={(props, option, { selected }) => (
                      <li {...props} key={option.id}>
                        <Checkbox checked={selected} />
                        {`${option.firstName} ${option.lastName}`}
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Search Users"
                        margin="normal"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "1rem",
                          },
                        }}
                      />
                    )}
                  />
                )}
              </div>
              {selectedUsersCount > 0 && (
                <div className="flex items-center ">
                  <ClearUsersButton onClick={handleClearSelectedUsers} />
                </div>
              )}
            </div>
          )}
        </div>
        <div className="px-8 pb-1 text-sm text-gray-600">
          {selectedLeague?.name ?? "No league"} · {selectedUsersCount} users ·{" "}
          {comparisonType}
        </div>
      </div>
      {!selectedSeries && !selectedSeriesName && !selectedStage && (
        <InstructionPaper />
      )}
      {isLoadingInitial && (
        <Typography variant="body2" color="text.secondary">
          Loading…
        </Typography>
      )}
      {showSeriesSelection && selectedSeriesName && (
        <div className="relative flex w-full justify-between items-center mb-10 px-8">
          <div className="flex">
            <FormControl>
              <FormLabel>Bets type</FormLabel>
              <RadioGroup row value={betsType} onChange={handleBetsType}>
                <FormControlLabel
                  value="Regular"
                  control={<Radio size="small" color="default" />}
                  label="Regular"
                />
                {(allSeriesBets[selectedSeries]?.spontaneousBets?.length ?? 0) >
                  0 && (
                  <FormControlLabel
                    value="Spontaneous"
                    control={<Radio size="small" color="default" />}
                    label="Spontaneous"
                  />
                )}
              </RadioGroup>
            </FormControl>
          </div>

          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h1 className="text-2xl font-semibold text-black text-center shadow-md p-4 rounded-2xl">
              {selectedSeriesName}
            </h1>
          </div>
        </div>
      )}

      <div className="flex w-full pl-8">
        <div className="w-1/5  mt-12">
          {showSeriesSelection &&
          allSeriesBets &&
          allSeriesBets[selectedSeries] ? (
            <BetColumn
              betsData={allSeriesBets[selectedSeries]}
              isSpontaneous={betsType === "Spontaneous"}
            />
          ) : showChampSelection && selectedStage ? (
            <ChampColumn selectedStage={selectedStage} />
          ) : (
            <div />
          )}
        </div>

        <div className="flex flex-row flex-1 min-w-0 space-x-6 mx-8 justify-start">
          {Object.keys(users).length > 0 &&
            Object.keys(selectedUsers).map((userId) => {
              const userName = `${users?.[userId].firstName} ${users?.[userId].lastName}`;
              const firstName = users?.[userId].firstName;
              const lastName = users?.[userId].lastName;
              return (
                <div
                  key={userId}
                  className="flex-1 min-w-0 max-w-[220px]"
                >
                  <div className={`flex justify-between mb-2`}>
                    <Tooltip
                      title={<Typography>{userName}</Typography>}
                      arrow
                      placement="top"
                    >
                      <div
                        className={`truncate ${
                          userId === currentUser?.id
                            ? "bg-colors-select-bet border-colors-select-bet"
                            : "border-slate-200"
                        } rounded-2xl p-1 text-black opacity-1 w-32 border-2 justify-center`}
                      >
                        {userId === currentUser?.id && <span>You</span>}
                        {userId !== currentUser?.id && (
                          <div className="flex row-span-1">
                            <span className="hidden xl:block">{firstName}</span>
                            <span className="hidden truncate md:block">
                              &nbsp;{lastName}
                            </span>
                          </div>
                        )}
                      </div>
                    </Tooltip>
                    <p className="p-2">{getFantasyPoints(userId)}Pts</p>

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="black"
                      className="size-4 cursor-pointer mt-3"
                      onClick={() => handleRemoveUser(userId)}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18 18 6M6 6l12 12"
                      />
                    </svg>
                  </div>

                  <div className="flex flex-col">
                    {showSeriesSelection && usersGuesses?.[userId] ? (
                      <GuessColumn
                        guessData={usersGuesses[userId]}
                        isSpontaneous={betsType === "Spontaneous"}
                        allSeriesBets={allSeriesBets}
                        selectedSeries={selectedSeries}
                        isLoading={isLoadingUser}
                      />
                    ) : userChampGuesses?.[userId] ? (
                      <ChampGuessColumn
                        guessData={userChampGuesses[userId]}
                        stage={selectedStage}
                      />
                    ) : (
                      <p> No guess data available</p>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default ComparingPageDesktopView;
