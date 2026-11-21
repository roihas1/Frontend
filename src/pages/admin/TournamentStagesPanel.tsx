import React, { useState } from "react";
import BulkImportPanel from "./BulkImportPanel";
import {
  AdminField,
  AdminFieldGrid,
  AdminFormActions,
  AdminFormCard,
  AdminSegmentedControl,
  adminControlClass,
} from "./AdminFormPrimitives";
import {
  parseSeriesSheetRows,
  SERIES_TEMPLATE_HEADERS,
  SERIES_TEMPLATE_SAMPLE,
  type BulkSeriesPayload,
} from "./seriesBulkImport";
import type { TournamentStagesModel } from "./useTournamentStagesModel";

interface TournamentStagesPanelProps {
  model: TournamentStagesModel;
}

type SetupMode = "tournament" | "stage" | "series";

const ROUNDS = [
  "First Round",
  "Conference Semifinals",
  "Conference Finals",
  "NBA Finals",
] as const;

const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8];

const TournamentStagesPanel: React.FC<TournamentStagesPanelProps> = ({
  model,
}) => {
  const {
    activePanel,
    isMutating,
    tournaments,
    selectedTournamentId,
    stageName,
    startDate,
    stageTime,
    newTournamentName,
    newTournamentYear,
    newTournamentSportType,
    newSeries,
    createSeriesTournamentId,
    teamsList,
    nbaTeamsList,
    dateOfStartToInputValue,
    setActivePanel,
    setStageName,
    setStartDate,
    setStageTime,
    setNewTournamentName,
    setNewTournamentYear,
    setNewTournamentSportType,
    setCreateSeriesTournamentId,
    handleOpenSeriesPanel,
    handleInputNewSeriesChange,
    handleSubmitTournament,
    handleSubmitStage,
    handleSubmitSeries,
    handleBulkCreateSeries,
    isBulkImporting,
  } = model;

  const [pendingSeries, setPendingSeries] = useState<BulkSeriesPayload[]>([]);
  const [importKey, setImportKey] = useState(0);

  const useExistingSeriesTeams = teamsList.length > 15;

  const team1Options = useExistingSeriesTeams
    ? teamsList
        .filter((team) =>
          newSeries.conference === "Finals"
            ? team.conference === "West"
            : team.conference === newSeries.conference,
        )
        .map((team) => ({ value: team.name, label: team.name }))
    : (nbaTeamsList ?? [])
        .filter((team) => team.conference === newSeries.conference)
        .map((team) => ({ value: team.teamName, label: team.teamName }));

  const resolvedTeam2Options = useExistingSeriesTeams
    ? teamsList
        .filter((team) =>
          newSeries.conference === "Finals"
            ? team.conference === "East"
            : team.conference === newSeries.conference,
        )
        .map((team) => ({ value: team.name, label: team.name }))
    : (nbaTeamsList ?? [])
        .filter((team) => team.conference === newSeries.conference)
        .map((team) => ({ value: team.teamName, label: team.teamName }));

  const handleModeChange = (mode: SetupMode) => {
    if (mode === "series") {
      void handleOpenSeriesPanel();
      return;
    }
    setActivePanel(mode);
  };

  return (
    <div className="space-y-6">
      <AdminFormCard
        title="Create one-off"
        description="Tournament, stage, or a single series. Prefer bulk import below when seeding a full round."
      >
        <AdminSegmentedControl<SetupMode>
          value={activePanel}
          disabled={isMutating}
          onChange={handleModeChange}
          options={[
            {
              value: "tournament",
              label: "Tournament",
              description: "New season container",
            },
            {
              value: "stage",
              label: "Stage",
              description: "Champions guess window",
            },
            {
              value: "series",
              label: "Series",
              description: "One matchup pair",
            },
          ]}
        />

        {activePanel === "tournament" && (
          <form onSubmit={handleSubmitTournament} className="space-y-4 pt-2">
            <AdminFieldGrid cols={3}>
              <AdminField label="Sport" htmlFor="tournament-sport">
                <select
                  id="tournament-sport"
                  value={newTournamentSportType}
                  onChange={(e) => setNewTournamentSportType(e.target.value)}
                  disabled={isMutating}
                  className={adminControlClass}
                >
                  <option value="NBA">NBA</option>
                </select>
              </AdminField>
              <AdminField label="Year" htmlFor="tournament-year" required>
                <input
                  id="tournament-year"
                  type="number"
                  min={1900}
                  max={2100}
                  value={newTournamentYear}
                  onChange={(e) => setNewTournamentYear(e.target.value)}
                  disabled={isMutating}
                  className={adminControlClass}
                  required
                />
              </AdminField>
              <AdminField label="Name" htmlFor="tournament-name" required>
                <input
                  id="tournament-name"
                  type="text"
                  value={newTournamentName}
                  onChange={(e) => setNewTournamentName(e.target.value)}
                  disabled={isMutating}
                  placeholder="e.g. NBA Playoffs 2026"
                  className={adminControlClass}
                  required
                />
              </AdminField>
            </AdminFieldGrid>
            <AdminFormActions
              onCancel={() => setActivePanel(null)}
              submitLabel="Create tournament"
              loading={isMutating}
            />
          </form>
        )}

        {activePanel === "stage" && (
          <form onSubmit={handleSubmitStage} className="space-y-4 pt-2">
            <AdminField
              label="Stage"
              htmlFor="stage-name"
              hint={!selectedTournamentId ? "Select a tournament in the nav first." : undefined}
              required
            >
              <select
                id="stage-name"
                value={stageName}
                onChange={(e) => setStageName(e.target.value)}
                disabled={isMutating}
                className={adminControlClass}
                required
              >
                <option value="">Select stage…</option>
                <option value="Before playoffs">Before playoffs</option>
                <option value="Round 1">Round 1</option>
                <option value="Round 2">Round 2</option>
              </select>
            </AdminField>
            <AdminFieldGrid>
              <AdminField label="Opens on" htmlFor="stage-date" required>
                <input
                  id="stage-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={isMutating}
                  className={adminControlClass}
                  required
                />
              </AdminField>
              <AdminField label="Time" htmlFor="stage-time" required>
                <input
                  id="stage-time"
                  type="time"
                  value={stageTime}
                  onChange={(e) => setStageTime(e.target.value)}
                  disabled={isMutating}
                  className={adminControlClass}
                  required
                />
              </AdminField>
            </AdminFieldGrid>
            <AdminFormActions
              onCancel={() => setActivePanel(null)}
              submitLabel="Create stage"
              loading={isMutating}
            />
          </form>
        )}

        {activePanel === "series" && (
          <form onSubmit={handleSubmitSeries} className="space-y-4 pt-2">
            <AdminFieldGrid>
              <AdminField label="Conference" htmlFor="series-conf" required>
                <select
                  id="series-conf"
                  name="conference"
                  value={newSeries.conference}
                  onChange={handleInputNewSeriesChange}
                  disabled={isMutating}
                  className={adminControlClass}
                  required
                >
                  <option value="West">West</option>
                  <option value="East">East</option>
                  {useExistingSeriesTeams && (
                    <option value="Finals">Finals</option>
                  )}
                </select>
              </AdminField>
              <AdminField label="Round" htmlFor="series-round" required>
                <select
                  id="series-round"
                  name="round"
                  value={
                    newSeries.round === "Finals" ? "NBA Finals" : newSeries.round
                  }
                  onChange={handleInputNewSeriesChange}
                  disabled={isMutating}
                  className={adminControlClass}
                  required
                >
                  {ROUNDS.map((round) => (
                    <option key={round} value={round}>
                      {round}
                    </option>
                  ))}
                </select>
              </AdminField>
            </AdminFieldGrid>

            <AdminField label="Tournament" htmlFor="series-tournament" required>
              <select
                id="series-tournament"
                value={createSeriesTournamentId}
                onChange={(e) => setCreateSeriesTournamentId(e.target.value)}
                disabled={isMutating}
                className={adminControlClass}
                required
              >
                <option value="">Select tournament…</option>
                {tournaments.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.year})
                  </option>
                ))}
              </select>
            </AdminField>

            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Matchup
              </p>
              <AdminFieldGrid>
                <AdminField label="Team 1" htmlFor="series-team1" required>
                  <select
                    id="series-team1"
                    name="team1"
                    value={newSeries.team1}
                    onChange={handleInputNewSeriesChange}
                    disabled={isMutating}
                    className={adminControlClass}
                    required
                  >
                    <option value="">Select team…</option>
                    {team1Options.map((team) => (
                      <option key={team.value} value={team.value}>
                        {team.label}
                      </option>
                    ))}
                  </select>
                </AdminField>
                <AdminField label="Seed 1" htmlFor="series-seed1" required>
                  <select
                    id="series-seed1"
                    name="seed1"
                    value={newSeries.seed1 || ""}
                    onChange={handleInputNewSeriesChange}
                    disabled={isMutating || useExistingSeriesTeams}
                    className={adminControlClass}
                    required
                  >
                    <option value="">Seed…</option>
                    {SEEDS.map((seed) => (
                      <option key={seed} value={seed}>
                        {seed}
                      </option>
                    ))}
                  </select>
                </AdminField>
                <AdminField label="Team 2" htmlFor="series-team2" required>
                  <select
                    id="series-team2"
                    name="team2"
                    value={newSeries.team2}
                    onChange={handleInputNewSeriesChange}
                    disabled={isMutating}
                    className={adminControlClass}
                    required
                  >
                    <option value="">Select team…</option>
                    {resolvedTeam2Options.map((team) => (
                      <option key={team.value} value={team.value}>
                        {team.label}
                      </option>
                    ))}
                  </select>
                </AdminField>
                <AdminField label="Seed 2" htmlFor="series-seed2" required>
                  <select
                    id="series-seed2"
                    name="seed2"
                    value={newSeries.seed2 || ""}
                    onChange={handleInputNewSeriesChange}
                    disabled={isMutating || useExistingSeriesTeams}
                    className={adminControlClass}
                    required
                  >
                    <option value="">Seed…</option>
                    {SEEDS.map((seed) => (
                      <option key={seed} value={seed}>
                        {seed}
                      </option>
                    ))}
                  </select>
                </AdminField>
              </AdminFieldGrid>
              {useExistingSeriesTeams && (
                <p className="mt-2 text-xs text-gray-500">
                  Seeds are filled from prior-round series when available.
                </p>
              )}
            </div>

            <AdminFieldGrid>
              <AdminField label="Start date" htmlFor="series-date" required>
                <input
                  id="series-date"
                  type="date"
                  name="dateOfStart"
                  value={dateOfStartToInputValue(newSeries.dateOfStart)}
                  onChange={handleInputNewSeriesChange}
                  disabled={isMutating}
                  className={adminControlClass}
                  required
                />
              </AdminField>
              <AdminField label="Tip-off time" htmlFor="series-time" required>
                <input
                  id="series-time"
                  type="time"
                  name="timeOfStart"
                  value={newSeries.timeOfStart}
                  onChange={handleInputNewSeriesChange}
                  disabled={isMutating}
                  className={adminControlClass}
                  required
                />
              </AdminField>
            </AdminFieldGrid>

            <AdminFormActions
              onCancel={() => setActivePanel(null)}
              submitLabel="Create series"
              loading={isMutating}
            />
          </form>
        )}
      </AdminFormCard>

      <BulkImportPanel
        key={importKey}
        title="Bulk import series"
        description={`CSV or Excel. team1/team2 = full name or abbreviation (LAL, BOS). Empty tournamentId uses the selected tournament${
          selectedTournamentId ? "" : " — pick one in the nav first"
        }.`}
        templateFilename="series-template.csv"
        templateHeaders={SERIES_TEMPLATE_HEADERS}
        templateSample={SERIES_TEMPLATE_SAMPLE}
        disabled={isMutating}
        submitting={isBulkImporting}
        onParseRows={(rows) => {
          const parsed = parseSeriesSheetRows(rows, {
            defaultTournamentId: selectedTournamentId,
          });
          const errors = parsed
            .filter((row) => !row.ok)
            .map((row) => ({
              rowNumber: row.rowNumber,
              error: row.ok ? "" : row.error,
            }));
          const valid = parsed.filter(
            (row): row is Extract<typeof row, { ok: true }> => row.ok,
          );
          setPendingSeries(valid.map((row) => row.payload));
          return {
            validCount: valid.length,
            errorCount: errors.length,
            errors,
            preview: valid
              .slice(0, 5)
              .map(
                (row) =>
                  `${row.payload.team1} vs ${row.payload.team2} · ${row.payload.round} (${row.payload.conference})`,
              ),
          };
        }}
        onSubmitValid={async () => {
          await handleBulkCreateSeries({ series: pendingSeries });
          setPendingSeries([]);
          setImportKey((k) => k + 1);
        }}
      />
    </div>
  );
};

export default TournamentStagesPanel;
