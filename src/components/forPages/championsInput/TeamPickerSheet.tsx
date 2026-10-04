import React from "react";
import { Drawer } from "@mui/material";
import defaultLogo from "../../../assets/logos/defaultLogoTBD.png";

interface TeamPickerSheetProps {
  open: boolean;
  title: string;
  teams: string[];
  logos: Record<string, string>;
  selectedTeam: string;
  disabledTeams: string[];
  onSelect: (team: string) => void;
  onClose: () => void;
}

const TeamPickerSheet: React.FC<TeamPickerSheetProps> = ({
  open,
  title,
  teams,
  logos,
  selectedTeam,
  disabledTeams,
  onSelect,
  onClose,
}) => {
  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxHeight: "80dvh",
        },
      }}
    >
      <div className="flex max-h-[80dvh] flex-col">
        <div className="shrink-0 px-4 pb-3 pt-2">
          <div
            aria-hidden
            className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-300"
          />
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-colors-nba-blue">
              {title}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] rounded-lg text-sm font-medium text-colors-nba-blue active:bg-gray-100"
            >
              Close
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
          {teams.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">
              No teams available.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {teams.map((team) => {
                const isSelected = team === selectedTeam;
                const isDisabled = disabledTeams.includes(team);
                return (
                  <button
                    key={team}
                    type="button"
                    disabled={isDisabled}
                    aria-pressed={isSelected}
                    onClick={() => onSelect(team)}
                    className={`flex min-h-14 flex-col items-center gap-1 rounded-xl border px-2 py-3 ${
                      isDisabled
                        ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-40"
                        : isSelected
                          ? "border-colors-nba-blue bg-blue-50 ring-2 ring-colors-nba-blue"
                          : "border-gray-200 bg-white active:bg-gray-50"
                    }`}
                  >
                    <img
                      src={logos[team] || defaultLogo}
                      alt=""
                      className="size-12 object-contain"
                    />
                    <span className="max-w-full truncate text-sm font-semibold text-gray-900">
                      {team}
                    </span>
                    {isDisabled && (
                      <span className="text-[10px] font-medium text-gray-500">
                        Already picked
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
};

export default TeamPickerSheet;
