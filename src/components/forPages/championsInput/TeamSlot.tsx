import React from "react";
import defaultLogo from "../../../assets/logos/defaultLogoTBD.png";

interface TeamSlotProps {
  label: string;
  team: string;
  logo?: string;
  onPress: () => void;
  invalid?: boolean;
  layout?: "stack" | "row";
}

const TeamSlot: React.FC<TeamSlotProps> = ({
  label,
  team,
  logo,
  onPress,
  invalid = false,
  layout = "stack",
}) => {
  const filled = Boolean(team);
  const borderClass = invalid
    ? "border-colors-nba-red bg-red-50"
    : filled
      ? "border-gray-200 bg-white"
      : "border-dashed border-gray-300 bg-gray-50";

  return (
    <button
      type="button"
      onClick={onPress}
      aria-label={filled ? `${label}: ${team}` : `Select ${label}`}
      className={`min-h-14 w-full rounded-xl border px-2 py-2 text-left active:bg-gray-100 ${borderClass} ${
        layout === "row"
          ? "flex items-center gap-3"
          : "flex flex-col items-center justify-center gap-1"
      }`}
    >
      <img
        src={filled ? logo || defaultLogo : defaultLogo}
        alt=""
        className={`object-contain ${
          layout === "row" ? "size-14 shrink-0" : "size-12"
        } ${filled ? "" : "opacity-40"}`}
      />
      <span className={`min-w-0 ${layout === "row" ? "flex flex-col" : "text-center"}`}>
        <span className="block text-[10px] font-semibold uppercase tracking-wide text-gray-500">
          {label}
        </span>
        <span
          className={`block truncate text-sm font-semibold ${
            filled ? "text-gray-900" : "text-gray-400"
          }`}
        >
          {filled ? team : "Select"}
        </span>
      </span>
    </button>
  );
};

export default TeamSlot;
