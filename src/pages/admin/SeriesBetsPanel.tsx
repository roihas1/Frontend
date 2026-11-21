import React, { useEffect, useMemo, useState } from "react";
import { Skeleton, Typography } from "@mui/material";
import BetForm from "../../components/forPages/BetForm";
import { PlayerMatchupBet, SpontaneousBet } from "../../types";
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
import BulkImportPanel from "./BulkImportPanel";
import {
  MATCHUP_BET_TEMPLATE_HEADERS,
  MATCHUP_BET_TEMPLATE_SAMPLE,
  parseBetSheetRows,
  SPONTANEOUS_BET_TEMPLATE_HEADERS,
  SPONTANEOUS_BET_TEMPLATE_SAMPLE,
  type BulkMatchupBetPayload,
  type BulkSpontaneousBetPayload,
} from "./betBulkImport";
import type { SeriesWorkbenchModel } from "./useSeriesWorkbenchModel";

type SeriesBetsPanelProps = Pick<
  SeriesWorkbenchModel,
  | "selectedSeries"
  | "bets"
  | "spontaneousBets"
  | "isMutating"
  | "isSeriesLoading"
  | "selectedBet"
  | "isSpontaneousBet"
  | "createNewBet"
  | "updateResultSelected"
  | "player1Stat"
  | "player2Stat"
  | "startDateSpontaneous"
  | "startTimeSpontaneous"
  | "handleBetSelection"
  | "handleBetSelectionForUpdateResult"
  | "handleRequestDeleteBet"
  | "handleCreateNewBet"
  | "handleCreateNewSpontaneousBet"
  | "handleCloseEditBet"
  | "handleCloseUpdateResult"
  | "handleSubmitBet"
  | "handleUpdateCurrentStats"
  | "handleInputChange"
  | "handleCategoriesSelection"
  | "handleGameNumberSelection"
  | "handleDateAndTimeSelection"
  | "handleUpdateMissingBets"
  | "handleBulkCreateBets"
  | "isBulkImporting"
> & {
  mode: "matchup" | "spontaneous";
};

interface AdminBetCardProps {
  bet: PlayerMatchupBet | SpontaneousBet;
  isSpontaneous: boolean;
  disabled: boolean;
  onEdit: (bet: PlayerMatchupBet | SpontaneousBet) => void;
  onUpdateResult: (bet: PlayerMatchupBet) => void;
  onDelete: (bet: PlayerMatchupBet | SpontaneousBet, isSpontaneous: boolean) => void;
}

const AdminBetCard: React.FC<AdminBetCardProps> = ({
  bet,
  isSpontaneous,
  disabled,
  onEdit,
  onUpdateResult,
  onDelete,
}) => (
  <div className="mb-3 rounded-lg border border-gray-300 p-4">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <span>
        {bet.player1} vs {bet.player2} ({bet.categories.join(" & ")})
        {"gameNumber" in bet && bet.gameNumber != null
          ? ` · Game ${bet.gameNumber}`
          : ""}
      </span>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onEdit(bet)}
          className={adminSecondaryBtnClass}
        >
          Edit
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onUpdateResult(bet)}
          className={adminSecondaryBtnClass}
        >
          Update result
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onDelete(bet, isSpontaneous)}
          className={adminDangerBtnClass}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

const SeriesBetsPanel: React.FC<SeriesBetsPanelProps> = ({
  selectedSeries,
  bets,
  spontaneousBets,
  isMutating,
  isSeriesLoading,
  selectedBet,
  isSpontaneousBet,
  createNewBet,
  updateResultSelected,
  player1Stat,
  player2Stat,
  startDateSpontaneous,
  startTimeSpontaneous,
  handleBetSelection,
  handleBetSelectionForUpdateResult,
  handleRequestDeleteBet,
  handleCreateNewBet,
  handleCreateNewSpontaneousBet,
  handleCloseEditBet,
  handleCloseUpdateResult,
  handleSubmitBet,
  handleUpdateCurrentStats,
  handleInputChange,
  handleCategoriesSelection,
  handleGameNumberSelection,
  handleDateAndTimeSelection,
  handleUpdateMissingBets,
  handleBulkCreateBets,
  isBulkImporting,
  mode,
}) => {
  const [selectedGameNumber, setSelectedGameNumber] = useState<number | null>(
    null,
  );
  const [pendingMatchups, setPendingMatchups] = useState<BulkMatchupBetPayload[]>(
    [],
  );
  const [pendingSpontaneous, setPendingSpontaneous] = useState<
    BulkSpontaneousBetPayload[]
  >([]);
  const [importKey, setImportKey] = useState(0);

  const gameNumbers = useMemo(() => {
    const nums = [
      ...new Set(
        spontaneousBets
          .map((bet) => Number(bet.gameNumber))
          .filter((n) => Number.isFinite(n) && n > 0),
      ),
    ];
    return nums.sort((a, b) => a - b);
  }, [spontaneousBets]);

  const betsByGame = useMemo(() => {
    const map = new Map<number, SpontaneousBet[]>();
    for (const bet of spontaneousBets) {
      const game = Number(bet.gameNumber);
      if (!Number.isFinite(game) || game <= 0) continue;
      const list = map.get(game) ?? [];
      list.push(bet);
      map.set(game, list);
    }
    for (const [game, list] of map) {
      list.sort((a, b) => {
        const tA = a.startTime ? new Date(a.startTime).getTime() : 0;
        const tB = b.startTime ? new Date(b.startTime).getTime() : 0;
        if (tA !== tB) return tA - tB;
        return `${a.player1}${a.player2}`.localeCompare(
          `${b.player1}${b.player2}`,
        );
      });
      map.set(game, list);
    }
    return map;
  }, [spontaneousBets]);

  useEffect(() => {
    if (gameNumbers.length === 0) {
      setSelectedGameNumber(null);
      return;
    }
    setSelectedGameNumber((prev) =>
      prev != null && gameNumbers.includes(prev) ? prev : gameNumbers[0],
    );
  }, [gameNumbers, selectedSeries?.id]);

  const activeGameBets =
    selectedGameNumber != null
      ? (betsByGame.get(selectedGameNumber) ?? [])
      : [];

  if (!selectedSeries) return null;

  if (isSeriesLoading && bets.length === 0 && spontaneousBets.length === 0) {
    return (
      <div className="space-y-3">
        <Skeleton variant="rounded" height={48} />
        <Skeleton variant="rounded" height={88} />
        <Skeleton variant="rounded" height={88} />
      </div>
    );
  }

  const showCreateControls = !createNewBet && !updateResultSelected;

  return (
    <div className="space-y-4">
      {mode === "matchup" && (
        <div>
          {bets.length > 0 ? (
            bets.map((bet) => (
              <AdminBetCard
                key={bet.id}
                bet={bet}
                isSpontaneous={false}
                disabled={isMutating}
                onEdit={handleBetSelection}
                onUpdateResult={handleBetSelectionForUpdateResult}
                onDelete={handleRequestDeleteBet}
              />
            ))
          ) : (
            <Typography className="mt-4 text-center text-gray-500">
              No matchup bets yet
            </Typography>
          )}
        </div>
      )}

      {mode === "spontaneous" && (
        <div className="space-y-3">
          {spontaneousBets.length > 0 ? (
            <>
              <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Games
                  </p>
                  <p className="text-xs text-gray-500">
                    {spontaneousBets.length} bet
                    {spontaneousBets.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
                  {gameNumbers.map((gameNum) => {
                    const count = betsByGame.get(gameNum)?.length ?? 0;
                    const active = selectedGameNumber === gameNum;
                    return (
                      <button
                        key={gameNum}
                        type="button"
                        onClick={() => setSelectedGameNumber(gameNum)}
                        className={`shrink-0 rounded-lg px-3 py-2 text-left transition ${
                          active
                            ? "bg-colors-nba-blue text-white shadow-sm"
                            : "border border-gray-200 bg-gray-50 text-gray-800 hover:bg-white"
                        }`}
                      >
                        <span className="block text-sm font-semibold">
                          Game {gameNum}
                        </span>
                        <span
                          className={`block text-[11px] ${
                            active ? "text-blue-100" : "text-gray-500"
                          }`}
                        >
                          {count} bet{count === 1 ? "" : "s"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedGameNumber != null && (
                <p className="text-sm text-gray-600">
                  Showing{" "}
                  <span className="font-medium text-gray-900">
                    Game {selectedGameNumber}
                  </span>{" "}
                  · {activeGameBets.length} bet
                  {activeGameBets.length === 1 ? "" : "s"}
                </p>
              )}

              {activeGameBets.length > 0 ? (
                activeGameBets.map((bet) => (
                  <AdminBetCard
                    key={bet.id}
                    bet={bet}
                    isSpontaneous
                    disabled={isMutating}
                    onEdit={handleBetSelection}
                    onUpdateResult={handleBetSelectionForUpdateResult}
                    onDelete={handleRequestDeleteBet}
                  />
                ))
              ) : (
                <Typography className="text-center text-gray-500">
                  No bets for this game
                </Typography>
              )}
            </>
          ) : (
            <Typography className="mt-4 text-center text-gray-500">
              No spontaneous bets yet
            </Typography>
          )}
        </div>
      )}

      {showCreateControls && (
        <div className="flex flex-wrap gap-2">
          {mode === "matchup" ? (
            <button
              type="button"
              className={adminPrimaryBtnClass}
              onClick={handleCreateNewBet}
              disabled={isMutating || bets.length >= 6}
            >
              Create matchup bet
            </button>
          ) : (
            <button
              type="button"
              className={adminPrimaryBtnClass}
              onClick={handleCreateNewSpontaneousBet}
              disabled={isMutating}
            >
              Create spontaneous bet
            </button>
          )}
          <button
            type="button"
            className={adminSecondaryBtnClass}
            onClick={handleUpdateMissingBets}
            disabled={isMutating}
          >
            Sync missing bets
          </button>
        </div>
      )}

      {showCreateControls && selectedSeries.id && (
        <BulkImportPanel
          key={`${mode}-${importKey}`}
          title={
            mode === "matchup"
              ? "Bulk import matchup bets"
              : "Bulk import spontaneous bets"
          }
          description={
            mode === "matchup"
              ? "Upload CSV/Excel or paste rows. Categories can be pipe-separated (Points|Rebounds). seriesId is filled from the selected series."
              : "Include gameNumber and startTime (ISO) or startDate + time columns."
          }
          templateFilename={
            mode === "matchup"
              ? "matchup-bets-template.csv"
              : "spontaneous-bets-template.csv"
          }
          templateHeaders={
            mode === "matchup"
              ? MATCHUP_BET_TEMPLATE_HEADERS
              : SPONTANEOUS_BET_TEMPLATE_HEADERS
          }
          templateSample={
            mode === "matchup"
              ? MATCHUP_BET_TEMPLATE_SAMPLE
              : SPONTANEOUS_BET_TEMPLATE_SAMPLE
          }
          disabled={isMutating}
          submitting={isBulkImporting}
          onParseRows={(rows) => {
            const parsed = parseBetSheetRows(rows, {
              seriesId: selectedSeries.id!,
              mode,
            });
            const errors = parsed
              .filter((row) => !row.ok)
              .map((row) => ({
                rowNumber: row.rowNumber,
                error: row.ok ? "" : row.error,
              }));
            if (mode === "matchup") {
              const valid = parsed.filter(
                (row): row is Extract<typeof row, { ok: true; kind: "matchup" }> =>
                  row.ok && row.kind === "matchup",
              );
              setPendingMatchups(valid.map((row) => row.payload));
              setPendingSpontaneous([]);
              return {
                validCount: valid.length,
                errorCount: errors.length,
                errors,
                preview: valid
                  .slice(0, 5)
                  .map(
                    (row) =>
                      `${row.payload.player1} vs ${row.payload.player2} (${row.payload.categories.join(" + ")})`,
                  ),
              };
            }
            const valid = parsed.filter(
              (
                row,
              ): row is Extract<typeof row, { ok: true; kind: "spontaneous" }> =>
                row.ok && row.kind === "spontaneous",
            );
            setPendingSpontaneous(valid.map((row) => row.payload));
            setPendingMatchups([]);
            return {
              validCount: valid.length,
              errorCount: errors.length,
              errors,
              preview: valid
                .slice(0, 5)
                .map(
                  (row) =>
                    `G${row.payload.gameNumber}: ${row.payload.player1} vs ${row.payload.player2}`,
                ),
            };
          }}
          onSubmitValid={async () => {
            if (mode === "matchup") {
              await handleBulkCreateBets({ playerMatchupBets: pendingMatchups });
              setPendingMatchups([]);
            } else {
              await handleBulkCreateBets({ spontaneousBets: pendingSpontaneous });
              setPendingSpontaneous([]);
            }
            setImportKey((k) => k + 1);
          }}
        />
      )}

      {updateResultSelected && selectedBet.player1 !== "" && (
        <AdminFormCard
          as="form"
          title="Update matchup stats"
          description="Add tonight’s production to the running totals."
          onSubmit={handleUpdateCurrentStats}
        >
          <AdminFieldGrid>
            <AdminField
              label={`${selectedBet.player1} (total ${selectedBet.currentStats[0]})`}
              htmlFor="stat-p1"
            >
              <input
                id="stat-p1"
                type="number"
                name="currentStats0"
                value={player1Stat || ""}
                onChange={handleInputChange}
                disabled={isMutating}
                placeholder="Add tonight"
                className={adminControlClass}
              />
            </AdminField>
            <AdminField
              label={`${selectedBet.player2} (total ${selectedBet.currentStats[1]})`}
              htmlFor="stat-p2"
            >
              <input
                id="stat-p2"
                type="number"
                name="currentStats1"
                value={player2Stat || ""}
                onChange={handleInputChange}
                disabled={isMutating}
                placeholder="Add tonight"
                className={adminControlClass}
              />
            </AdminField>
          </AdminFieldGrid>
          <AdminFormActions
            onCancel={handleCloseUpdateResult}
            submitLabel="Apply stats"
            loading={isMutating}
          />
        </AdminFormCard>
      )}

      {createNewBet &&
        !updateResultSelected &&
        ((mode === "matchup" && !isSpontaneousBet) ||
          (mode === "spontaneous" && isSpontaneousBet)) && (
          <BetForm
            selectedBet={selectedBet}
            handleInputChange={handleInputChange}
            handleCategoriesSelection={handleCategoriesSelection}
            handleCloseEditBet={handleCloseEditBet}
            handleSubmit={handleSubmitBet}
            handleGameNumberSelection={handleGameNumberSelection}
            loading={isMutating}
            isSpontaneous={isSpontaneousBet}
            startDate={startDateSpontaneous}
            startTime={startTimeSpontaneous}
            handleDateAndTimeSelection={handleDateAndTimeSelection}
          />
        )}
    </div>
  );
};

export default SeriesBetsPanel;
