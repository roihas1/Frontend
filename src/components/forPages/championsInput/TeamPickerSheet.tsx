import React from "react";
import { Drawer } from "@mui/material";
import defaultLogo from "../../../assets/logos/defaultLogoTBD.png";
import {
  glassSheetHandleClassName,
  glassSheetPaperSx,
} from "../../common/glassSheet";

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
        sx: glassSheetPaperSx,
      }}
    >
      <div className="flex max-h-[80dvh] flex-col">
        <div className="shrink-0 px-4 pb-3 pt-2">
          <div aria-hidden className={glassSheetHandleClassName} />
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-colors-nba-blue">
              {title}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] rounded-lg text-sm font-medium text-colors-nba-blue active:bg-black/5"
            >
              Close
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
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
                        ? "cursor-not-allowed border-gray-200 bg-gray-50/80 opacity-40"
                        : isSelected
                          ? "border-colors-nba-blue bg-colors-nba-blue/10 ring-2 ring-colors-nba-blue"
                          : "border-gray-200/80 bg-white/70 active:bg-black/5"
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
