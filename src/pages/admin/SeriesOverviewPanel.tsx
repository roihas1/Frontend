import React from "react";
import {
  AdminField,
  AdminFieldGrid,
  AdminFormActions,
  AdminFormCard,
  adminControlClass,
  adminDangerBtnClass,
  adminPrimaryBtnClass,
  adminSecondaryBtnClass,
} from "./AdminFormPrimitives";
import {
  dateOfStartToInputValue,
  getSeriesScore,
  getSeriesStatus,
  seriesDisplayLabel,
  seriesStatusLabel,
} from "./adminNormalize";
import type { SeriesWorkbenchModel } from "./useSeriesWorkbenchModel";

type SeriesOverviewPanelProps = Pick<
  SeriesWorkbenchModel,
  | "selectedSeries"
  | "team1Name"
  | "team2Name"
  | "isMutating"
  | "showUpdateSeriesTime"
  | "showSeriesResultForm"
  | "wonTeam"
  | "editDateOfStart"
  | "editTimeOfStart"
  | "handleOpenUpdateTime"
  | "handleOpenUpdateResult"
  | "handleRequestCloseBets"
  | "handleRequestDeleteSeries"
  | "handleCloseUpdateSeriesTime"
  | "handleCloseUpdateResultSeries"
  | "handleSubmitSeriesTime"
  | "handleSubmitSeriesResult"
  | "setWonTeam"
  | "setEditDateOfStart"
  | "setEditTimeOfStart"
>;

const SeriesOverviewPanel: React.FC<SeriesOverviewPanelProps> = ({
  selectedSeries,
  team1Name,
  team2Name,
  isMutating,
  showUpdateSeriesTime,
  showSeriesResultForm,
  wonTeam,
  editDateOfStart,
  editTimeOfStart,
  handleOpenUpdateTime,
  handleOpenUpdateResult,
  handleRequestCloseBets,
  handleRequestDeleteSeries,
  handleCloseUpdateSeriesTime,
  handleCloseUpdateResultSeries,
  handleSubmitSeriesTime,
  handleSubmitSeriesResult,
  setWonTeam,
  setEditDateOfStart,
  setEditTimeOfStart,
}) => {
  if (!selectedSeries) return null;

  const [s1, s2] = getSeriesScore(selectedSeries);
  const status = getSeriesStatus(selectedSeries);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {seriesDisplayLabel(selectedSeries)}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedSeries.round}
              {selectedSeries.conference
                ? ` · ${selectedSeries.conference}`
                : ""}
            </p>
          </div>
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
            {seriesStatusLabel(status)}
          </span>
        </div>

        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-lg bg-gray-50 px-3 py-2">
            <dt className="text-xs text-gray-500">Score</dt>
            <dd className="mt-0.5 text-base font-semibold text-gray-900">
              {s1} – {s2}
            </dd>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2">
            <dt className="text-xs text-gray-500">Start date</dt>
            <dd className="mt-0.5 font-medium text-gray-900">
              {dateOfStartToInputValue(selectedSeries.dateOfStart) || "—"}
            </dd>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2">
            <dt className="text-xs text-gray-500">Tip-off</dt>
            <dd className="mt-0.5 font-medium text-gray-900">
              {selectedSeries.timeOfStart || "—"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleOpenUpdateResult}
          disabled={isMutating}
          className={adminPrimaryBtnClass}
        >
          Update result
        </button>
        <button
          type="button"
          onClick={handleOpenUpdateTime}
          disabled={isMutating}
          className={adminSecondaryBtnClass}
        >
          Edit schedule
        </button>
        <button
          type="button"
          onClick={handleRequestCloseBets}
          disabled={isMutating}
          className={adminSecondaryBtnClass}
        >
          Close all bets
        </button>
        <button
          type="button"
          onClick={handleRequestDeleteSeries}
          disabled={isMutating}
          className={adminDangerBtnClass}
        >
          Delete series
        </button>
      </div>

      {showUpdateSeriesTime && (
        <AdminFormCard
          as="form"
          title="Edit schedule"
          description="Updates tip-off date and time for this series."
          onSubmit={handleSubmitSeriesTime}
        >
          <AdminFieldGrid>
            <AdminField label="Date" htmlFor="edit-series-date" required>
              <input
                id="edit-series-date"
                type="date"
                name="dateOfStart"
                value={editDateOfStart}
                onChange={(e) => setEditDateOfStart(e.target.value)}
                disabled={isMutating}
                className={adminControlClass}
                required
              />
            </AdminField>
            <AdminField label="Time" htmlFor="edit-series-time" required>
              <input
                id="edit-series-time"
                type="time"
                name="timeOfStart"
                value={editTimeOfStart}
                onChange={(e) => setEditTimeOfStart(e.target.value)}
                disabled={isMutating}
                className={adminControlClass}
                required
              />
            </AdminField>
          </AdminFieldGrid>
          <AdminFormActions
            onCancel={handleCloseUpdateSeriesTime}
            submitLabel="Save schedule"
            loading={isMutating}
          />
        </AdminFormCard>
      )}

      {showSeriesResultForm && (
        <AdminFormCard
          as="form"
          title="Update series result"
          description="Credit one win to the team that took the latest game."
          onSubmit={handleSubmitSeriesResult}
        >
          <AdminField label="Winning team" htmlFor="won-team" required>
            <select
              id="won-team"
              name="wonTeam"
              value={wonTeam}
              onChange={(e) => setWonTeam(e.target.value)}
              disabled={isMutating}
              className={adminControlClass}
              required
            >
              <option value="">Select winner…</option>
              <option value={1}>{team1Name}</option>
              <option value={2}>{team2Name}</option>
            </select>
          </AdminField>
          <AdminFormActions
            onCancel={handleCloseUpdateResultSeries}
            submitLabel="Update result"
            loading={isMutating}
            disabled={!wonTeam}
          />
        </AdminFormCard>
      )}
    </div>
  );
};

export default SeriesOverviewPanel;
