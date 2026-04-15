import React, { useMemo } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import Close from "@mui/icons-material/Close";
import { User } from "../../types";
import CustomSelectInput from "../../components/form/CustomSelectInput";
import InstructionPaper from "../../components/forPages/ComparisonInstruction";
import { useComparingPageModel } from "./useComparingPageModel";
import { SeriesComparisonRows } from "./seriesComparisonRows";
import { ChampComparisonRows } from "./champComparisonRows";

export type ComparingPageMobileViewProps = ReturnType<
  typeof useComparingPageModel
>;

const ComparingPageMobileView: React.FC<ComparingPageMobileViewProps> = (
  model,
) => {
  const {
    maxSelectedUsers,
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
    searchResults,
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
    handleSearchChange,
    handleClearSelectedUsers,
    handleRemoveUser,
    getFantasyPoints,
  } = model;

  const selectedUserIds = useMemo(
    () => Object.keys(selectedUsers),
    [selectedUsers],
  );

  const userShortNames = useMemo(() => {
    const m: Record<string, string> = {};
    for (const id of selectedUserIds) {
      const u = users[id];
      if (!u) continue;
      const short =
        id === currentUser?.id
          ? "You"
          : `${u.firstName?.[0] ?? ""}.${u.lastName ?? ""}`.trim() ||
            `${u.firstName} ${u.lastName}`;
      m[id] = short;
    }
    return m;
  }, [selectedUserIds, users, currentUser?.id]);

  const handleComparisonMode = (
    _e: React.MouseEvent<HTMLElement>,
    value: string | null,
  ) => {
    if (value === null) return;
    handleChangeType({
      target: { value },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <Box sx={{ pb: 6, px: 1.5, pt: 1, position: "relative" }}>
      {(isLoadingUser || isLoadingInitial) && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            bgcolor: "rgba(255,255,255,0.6)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            pt: 4,
          }}
        >
          <CircularProgress size={36} />
        </Box>
      )}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="h6" component="h1">
          Compare
        </Typography>
        <IconButton
          size="small"
          aria-label="Instructions"
          onClick={handleOpenModal}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            width={22}
            height={22}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
            />
          </svg>
        </IconButton>
      </Box>

      <Dialog
        open={open}
        onClose={handleCloseModal}
        fullScreen
        sx={{
          "& .MuiDialog-paper": {
            m: 0,
            maxHeight: "100%",
          },
        }}
      >
        <DialogTitle sx={{ pr: 6 }}>
          How comparison works
          <IconButton
            aria-label="Close instructions"
            onClick={handleCloseModal}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <InstructionPaper />
        </DialogContent>
      </Dialog>

      <ToggleButtonGroup
        exclusive
        fullWidth
        value={comparisonType}
        onChange={handleComparisonMode}
        size="small"
        sx={{ mb: 2 }}
      >
        <ToggleButton value="Series">Series</ToggleButton>
        <ToggleButton value="Champ">Champ</ToggleButton>
      </ToggleButtonGroup>

      {showSeriesSelection && series && (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="mob-series-label">Series</InputLabel>
          <CustomSelectInput
            id="mob-series"
            value={selectedSeries}
            label={
              Object.values(series).length === 0
                ? "- No Series has Ended -"
                : "Series"
            }
            onChange={(e) => handleSeriesSelection(e.target.value)}
            optionsForCompare={Object.entries(series).map(([id, name]) => ({
              id,
              name,
            }))}
          />
        </FormControl>
      )}

      {showChampSelection && passedStages?.length > 0 && (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel className="px-2">Champ stage</InputLabel>
          <CustomSelectInput
            id="mob-champ"
            value={selectedStage}
            label="Champ stage"
            onChange={handleStageSelection}
            options={passedStages}
          />
        </FormControl>
      )}

      {leagues.length > 0 && (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="mob-league-label">League</InputLabel>
          <CustomSelectInput
            id="mob-league"
            value={selectedLeague?.name ?? ""}
            label="League"
            onChange={handleLeagueSelection}
            options={leagues.map((l) => l.name)}
          />
        </FormControl>
      )}

      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
        Up to {maxSelectedUsers} users
      </Typography>
      {selectedLeague?.name !== "Overall" && (
        <Autocomplete
          multiple
          limitTags={2}
          options={Object.values(users)}
          disableCloseOnSelect
          getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
          value={selectedUserIds
            .map((id) => Object.values(users).find((u) => u.id === id)!)
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
              label="Users"
              margin="normal"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
              }}
            />
          )}
          sx={{ mb: 2 }}
        />
      )}
      {selectedLeague?.name === "Overall" && (
        <Autocomplete
          multiple
          limitTags={2}
          options={searchResults}
          disableCloseOnSelect
          getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
          value={selectedUserIds
            .map((id) => Object.values(users).find((u) => u.id === id)!)
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
              onChange={handleSearchChange}
              label="Search users"
              margin="normal"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
              }}
            />
          )}
          sx={{ mb: 2 }}
        />
      )}

      {selectedUserIds.length > 0 && (
        <Stack spacing={1.5} sx={{ mb: 2 }}>
          <Stack
            direction="row"
            flexWrap="wrap"
            useFlexGap
            spacing={1}
            sx={{ alignItems: "center" }}
          >
            {selectedUserIds.map((id) => {
              const isYou = id === currentUser?.id;
              return (
                <Box
                  key={id}
                  sx={(theme) => ({
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.25,
                    pl: 1,
                    pr: 0.25,
                    py: 0.25,
                    minHeight: 36,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: isYou
                      ? theme.palette.primary.main
                      : theme.palette.divider,
                    bgcolor: isYou
                      ? alpha(theme.palette.primary.main, 0.12)
                      : theme.palette.mode === "light"
                        ? theme.palette.grey[100]
                        : theme.palette.action.hover,
                    maxWidth: "100%",
                  })}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      maxWidth: { xs: 140, sm: 200 },
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      lineHeight: 1.3,
                    }}
                  >
                    {isYou && (
                      <Typography
                        component="span"
                        variant="caption"
                        fontWeight={700}
                        sx={{ mr: 0.5 }}
                      >
                        You ·{" "}
                      </Typography>
                    )}
                    {users[id]
                      ? `${users[id].firstName} ${users[id].lastName}`
                      : id}
                    <Typography
                      component="span"
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 0.5 }}
                    >
                      · {getFantasyPoints(id)} pts
                    </Typography>
                  </Typography>
                  <IconButton
                    size="small"
                    aria-label="Remove user"
                    onClick={() => handleRemoveUser(id)}
                    sx={{ p: 0.5, color: "text.secondary" }}
                  >
                    <Close sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              );
            })}
          </Stack>
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            startIcon={<DeleteOutline sx={{ fontSize: 20 }} />}
            onClick={handleClearSelectedUsers}
            sx={{
              alignSelf: "flex-start",
              borderColor: "divider",
              textTransform: "none",
            }}
          >
            Clear all
          </Button>
        </Stack>
      )}

      {!selectedSeries && !selectedSeriesName && !selectedStage && (
        <Box sx={{ py: 2 }}>
          <InstructionPaper />
        </Box>
      )}

      {showSeriesSelection && selectedSeriesName && (
        <FormControl component="fieldset" sx={{ mb: 2 }}>
          <Typography component="legend" variant="caption" sx={{ mb: 0.5 }}>
            Bets type
          </Typography>
          <RadioGroup row value={betsType} onChange={handleBetsType}>
            <FormControlLabel
              value="Regular"
              control={<Radio size="small" />}
              label="Regular"
            />
            {(allSeriesBets[selectedSeries]?.spontaneousBets?.length ?? 0) >
              0 && (
              <FormControlLabel
                value="Spontaneous"
                control={<Radio size="small" />}
                label="Spontaneous"
              />
            )}
          </RadioGroup>
          <Typography variant="subtitle2" sx={{ mt: 1, textAlign: "center" }}>
            {selectedSeriesName}
          </Typography>
        </FormControl>
      )}

      {showSeriesSelection &&
        selectedSeries &&
        allSeriesBets[selectedSeries] &&
        selectedUserIds.length > 0 && (
          <SeriesComparisonRows
            allSeriesBets={allSeriesBets}
            selectedSeries={selectedSeries}
            usersGuesses={usersGuesses}
            selectedUserIds={selectedUserIds}
            isSpontaneous={betsType === "Spontaneous"}
            userShortNames={userShortNames}
          />
        )}

      {showChampSelection && selectedStage && selectedUserIds.length > 0 && (
        <ChampComparisonRows
          stage={selectedStage}
          userChampGuesses={userChampGuesses}
          selectedUserIds={selectedUserIds}
          userShortNames={userShortNames}
        />
      )}
    </Box>
  );
};

export default ComparingPageMobileView;
