import React from "react";
import { SelectChangeEvent } from "@mui/material";
import {
  MatchupCategory,
  PlayerMatchupBet,
  PlayerMatchupType,
  SpontaneousBet,
} from "../../types/index";
import {
  AdminChipGroup,
  AdminChoiceGroup,
  AdminField,
  AdminFieldGrid,
  AdminFormActions,
  AdminFormCard,
  adminControlClass,
} from "../../pages/admin/AdminFormPrimitives";

interface BetFormProps {
  selectedBet: PlayerMatchupBet | SpontaneousBet;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  handleCategoriesSelection: (e: SelectChangeEvent<MatchupCategory[]>) => void;
  handleGameNumberSelection: (e: SelectChangeEvent<string>) => void;
  handleCloseEditBet: () => void;
  handleDateAndTimeSelection: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  isSpontaneous: boolean;
  startDate: string;
  startTime: string;
}

const BetForm: React.FC<BetFormProps> = ({
  selectedBet,
  handleInputChange,
  handleCategoriesSelection,
  handleGameNumberSelection,
  handleCloseEditBet,
  handleSubmit,
  handleDateAndTimeSelection,
  loading,
  isSpontaneous,
  startDate,
  startTime,
}) => {
  const isEditing = Boolean(selectedBet.id);
  const title = isSpontaneous
    ? isEditing
      ? "Edit spontaneous bet"
      : "Create spontaneous bet"
    : isEditing
      ? "Edit matchup bet"
      : "Create matchup bet";

  const toggleCategory = (category: string) => {
    const current = selectedBet.categories ?? [];
    const next = current.includes(category as MatchupCategory)
      ? current.filter((c) => c !== category)
      : [...current, category as MatchupCategory];
    handleCategoriesSelection({
      target: { value: next },
    } as SelectChangeEvent<MatchupCategory[]>);
  };

  return (
    <AdminFormCard
      as="form"
      onSubmit={handleSubmit}
      title={title}
      description={
        isSpontaneous
          ? "Tied to a single game tip-off. Set the game number and start time."
          : "Series-long player matchup. Differential is applied to player 2."
      }
    >
      <section className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Players
        </h4>
        <AdminFieldGrid>
          <AdminField label="Player 1" htmlFor="bet-player1" required>
            <input
              id="bet-player1"
              type="text"
              name="player1"
              value={selectedBet.player1}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="e.g. LeBron James"
              className={adminControlClass}
              required
            />
          </AdminField>
          <AdminField label="Player 2" htmlFor="bet-player2" required>
            <input
              id="bet-player2"
              type="text"
              name="player2"
              value={selectedBet.player2}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="e.g. Jayson Tatum"
              className={adminControlClass}
              required
            />
          </AdminField>
        </AdminFieldGrid>
      </section>

      <section className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Scoring
        </h4>
        <AdminField label="Matchup type" htmlFor="bet-type" required>
          <select
            id="bet-type"
            name="typeOfMatchup"
            value={selectedBet.typeOfMatchup}
            onChange={handleInputChange}
            disabled={loading}
            className={adminControlClass}
          >
            {Object.values(PlayerMatchupType).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </AdminField>

        <AdminField
          label="Categories"
          hint="Tap to toggle. Use one or more stats."
          required
        >
          <AdminChipGroup
            options={Object.values(MatchupCategory)}
            selected={selectedBet.categories ?? []}
            onToggle={toggleCategory}
            disabled={loading}
          />
        </AdminField>

        <AdminFieldGrid>
          <AdminField
            label="Differential (on player 2)"
            htmlFor="bet-diff"
            hint="Added to player 2 before comparing."
          >
            <input
              id="bet-diff"
              type="number"
              name="differential"
              value={selectedBet.differential}
              onChange={handleInputChange}
              disabled={loading}
              step="any"
              className={adminControlClass}
            />
          </AdminField>
          <AdminField label="Fantasy points" htmlFor="bet-fp" required>
            <input
              id="bet-fp"
              type="number"
              name="fantasyPoints"
              value={selectedBet.fantasyPoints}
              onChange={handleInputChange}
              disabled={loading}
              min={0}
              className={adminControlClass}
              required
            />
          </AdminField>
        </AdminFieldGrid>
      </section>

      {isSpontaneous && (
        <section className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Game schedule
          </h4>
          <AdminField label="Game number" required>
            <AdminChoiceGroup
              options={[1, 2, 3, 4, 5, 6, 7].map((n) => ({
                value: String(n),
                label: String(n),
              }))}
              value={
                "gameNumber" in selectedBet && selectedBet.gameNumber
                  ? String(selectedBet.gameNumber)
                  : ""
              }
              onChange={(value) =>
                handleGameNumberSelection({
                  target: { value },
                } as SelectChangeEvent<string>)
              }
              disabled={loading}
            />
          </AdminField>
          <AdminFieldGrid>
            <AdminField label="Start date" htmlFor="bet-start-date" required>
              <input
                id="bet-start-date"
                type="date"
                name="dateOfStart"
                value={startDate}
                onChange={handleDateAndTimeSelection}
                disabled={loading}
                className={adminControlClass}
                required
              />
            </AdminField>
            <AdminField label="Start time" htmlFor="bet-start-time" required>
              <input
                id="bet-start-time"
                type="time"
                name="startTime"
                value={startTime}
                onChange={handleDateAndTimeSelection}
                disabled={loading}
                className={adminControlClass}
                required
              />
            </AdminField>
          </AdminFieldGrid>
        </section>
      )}

      <AdminFormActions
        cancelLabel="Cancel"
        submitLabel={isEditing ? "Save changes" : "Create bet"}
        onCancel={handleCloseEditBet}
        loading={loading}
      />
    </AdminFormCard>
  );
};

export default BetForm;
