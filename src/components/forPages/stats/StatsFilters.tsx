import React from "react";
import { MenuItem, Select } from "@mui/material";
import {
  GuessStatsBetFamily,
  GuessStatsFilters,
  GuessStatsSeriesSnapshot,
} from "../../../types/guessStats";

interface StatsFiltersProps {
  filters: GuessStatsFilters;
  setFilters: React.Dispatch<React.SetStateAction<GuessStatsFilters>>;
  availableStages: string[];
  allSeries: GuessStatsSeriesSnapshot[];
}

const betFamilies: GuessStatsBetFamily[] = [
  "all",
  "teamWin",
  "bestOf7",
  "playerMatchup",
  "spontaneous",
  "champion",
];

const betFamilyLabels: Record<GuessStatsBetFamily, string> = {
  all: "All",
  teamWin: "Team Winner",
  bestOf7: "Best of 7",
  playerMatchup: "Player Matchup",
  spontaneous: "Spontaneous",
  champion: "Champion",
};

const toTeamNickname = (teamName: string): string => {
  const words = teamName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return teamName;
  if (words.length === 1) return words[0];
  const lastWord = words[words.length - 1];
  if (/^\d/.test(lastWord) || lastWord.toLowerCase() === "blazers") {
    return lastWord;
  }
  return lastWord;
};

const shortenSeriesLabel = (label: string): string => {
  const match = label.match(/^(.*?)\s+vs\s+(.*?)\s+\((.*?)\)$/);
  if (!match) return label;
  const [, team1, team2, round] = match;
  return `${toTeamNickname(team1)} vs ${toTeamNickname(team2)} (${round})`;
};

const StatsFilters: React.FC<StatsFiltersProps> = ({
  filters,
  setFilters,
  availableStages,
  allSeries,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
      <Select
        value={filters.betFamily}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, betFamily: e.target.value as GuessStatsBetFamily }))
        }
        size="small"
      >
        {betFamilies.map((family) => (
          <MenuItem key={family} value={family}>
            {betFamilyLabels[family]}
          </MenuItem>
        ))}
      </Select>
      <Select
        value={filters.selectedSeriesId}
        onChange={(e) => setFilters((prev) => ({ ...prev, selectedSeriesId: e.target.value }))}
        size="small"
        displayEmpty
        renderValue={(selected) => {
          if (selected === "All") return "All Series";
          const selectedSeries = allSeries.find((series) => series.seriesId === selected);
          if (!selectedSeries) return "All Series";
          return shortenSeriesLabel(selectedSeries.seriesLabel);
        }}
        sx={{
          minWidth: 0,
          "& .MuiSelect-select": {
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          },
        }}
      >
        <MenuItem value="All">All Series</MenuItem>
        {allSeries.map((series) => (
          <MenuItem
            key={series.seriesId}
            value={series.seriesId}
            title={series.seriesLabel}
          >
            {shortenSeriesLabel(series.seriesLabel)}
          </MenuItem>
        ))}
      </Select>
      <Select
        value={filters.selectedStage}
        onChange={(e) => setFilters((prev) => ({ ...prev, selectedStage: e.target.value }))}
        size="small"
      >
        <MenuItem value="All">All Stages</MenuItem>
        {availableStages.map((stage) => (
          <MenuItem key={stage} value={stage}>
            {stage}
          </MenuItem>
        ))}
      </Select>
      <Select
        value={filters.leagueName}
        onChange={(e) => setFilters((prev) => ({ ...prev, leagueName: e.target.value }))}
        size="small"
      >
        <MenuItem value="Overall">Overall</MenuItem>
      </Select>
    </div>
  );
};

export default StatsFilters;

