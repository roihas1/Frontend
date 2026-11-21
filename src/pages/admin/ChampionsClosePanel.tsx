import React from "react";
import { Skeleton } from "@mui/material";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import {
  AdminField,
  AdminFormActions,
  AdminFormCard,
  adminControlClass,
} from "./AdminFormPrimitives";
import type { ChampionsCloseModel } from "./useChampionsCloseModel";

interface ChampionsClosePanelProps {
  model: ChampionsCloseModel;
}

const ChampionsClosePanel: React.FC<ChampionsClosePanelProps> = ({ model }) => {
  if (!model.selectedTournamentId) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Select a tournament from the navbar to close champions bets.
      </p>
    );
  }

  if (model.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton variant="rounded" height={48} />
        <Skeleton variant="rounded" height={56} />
        <Skeleton variant="rounded" height={56} />
      </div>
    );
  }

  return (
    <>
      <AdminFormCard
        as="form"
        title="Close champions bets"
        description="Locks the tournament champions guess after you set MVP and champion."
        onSubmit={(e) => {
          e.preventDefault();
          model.handleRequestClose();
        }}
        className="max-w-xl"
      >
        <AdminField label="MVP player" htmlFor="mvp-player" required>
          <input
            id="mvp-player"
            type="text"
            value={model.mvpPlayer}
            onChange={(e) => model.setMvpPlayer(e.target.value)}
            disabled={model.isMutating}
            placeholder="e.g. Nikola Jokic"
            className={adminControlClass}
            required
          />
        </AdminField>

        <AdminField label="Champion team" htmlFor="champion-team" required>
          <select
            id="champion-team"
            value={model.championTeam || ""}
            onChange={(e) => model.setChampionTeam(e.target.value)}
            disabled={model.isMutating}
            className={adminControlClass}
            required
          >
            <option value="">Select finals team…</option>
            {model.finalsTeams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </AdminField>

        <AdminFormActions
          cancelLabel="Clear"
          submitLabel="Close champions bets"
          onCancel={() => {
            model.setMvpPlayer("");
            model.setChampionTeam("");
          }}
          loading={model.isMutating}
          disabled={!model.mvpPlayer.trim() || !model.championTeam}
        />
      </AdminFormCard>

      <ConfirmDialog
        open={model.confirmOpen}
        title="Close champions bets"
        message="Are you sure you want to close champions bets?"
        confirmLabel="Close bets"
        confirmColor="warning"
        loading={model.isMutating}
        onConfirm={model.handleConfirmClose}
        onCancel={model.handleCancelConfirm}
      />
    </>
  );
};

export default ChampionsClosePanel;
