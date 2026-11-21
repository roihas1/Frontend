import React from "react";
import { Tab, Tabs } from "@mui/material";
import SeriesOverviewPanel from "./SeriesOverviewPanel";
import SeriesBetsPanel from "./SeriesBetsPanel";
import type {
  SeriesDetailTab,
  SeriesWorkbenchModel,
} from "./useSeriesWorkbenchModel";

interface SeriesDetailTabsProps {
  model: SeriesWorkbenchModel;
}

const SeriesDetailTabs: React.FC<SeriesDetailTabsProps> = ({ model }) => {
  if (!model.selectedSeries) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
        Select a series to view details.
      </div>
    );
  }

  const tabIndex =
    model.activeTab === "overview"
      ? 0
      : model.activeTab === "matchup"
        ? 1
        : 2;

  const handleTabChange = (_: React.SyntheticEvent, value: number) => {
    const tabs: SeriesDetailTab[] = ["overview", "matchup", "spontaneous"];
    model.handleTabChange(tabs[value] ?? "overview");
  };

  return (
    <div>
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        className="mb-4 border-b border-gray-200"
      >
        <Tab label="Overview" />
        <Tab label="Matchup" />
        <Tab label="Spontaneous" />
      </Tabs>

      {model.activeTab === "overview" && (
        <SeriesOverviewPanel
          selectedSeries={model.selectedSeries}
          team1Name={model.team1Name}
          team2Name={model.team2Name}
          isMutating={model.isMutating}
          showUpdateSeriesTime={model.showUpdateSeriesTime}
          showSeriesResultForm={model.showSeriesResultForm}
          wonTeam={model.wonTeam}
          editDateOfStart={model.editDateOfStart}
          editTimeOfStart={model.editTimeOfStart}
          handleOpenUpdateTime={model.handleOpenUpdateTime}
          handleOpenUpdateResult={model.handleOpenUpdateResult}
          handleRequestCloseBets={model.handleRequestCloseBets}
          handleRequestDeleteSeries={model.handleRequestDeleteSeries}
          handleCloseUpdateSeriesTime={model.handleCloseUpdateSeriesTime}
          handleCloseUpdateResultSeries={model.handleCloseUpdateResultSeries}
          handleSubmitSeriesTime={model.handleSubmitSeriesTime}
          handleSubmitSeriesResult={model.handleSubmitSeriesResult}
          setWonTeam={model.setWonTeam}
          setEditDateOfStart={model.setEditDateOfStart}
          setEditTimeOfStart={model.setEditTimeOfStart}
        />
      )}

      {model.activeTab === "matchup" && (
        <SeriesBetsPanel {...model} mode="matchup" />
      )}

      {model.activeTab === "spontaneous" && (
        <SeriesBetsPanel {...model} mode="spontaneous" />
      )}
    </div>
  );
};

export default SeriesDetailTabs;
