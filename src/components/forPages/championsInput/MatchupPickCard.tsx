import React from "react";
import TeamSlot from "./TeamSlot";

type MatchupAccent = "east" | "west" | "finals";

interface SlotConfig {
  label: string;
  team: string;
  onPress: () => void;
}

interface MatchupPickCardProps {
  id: string;
  title: string;
  accent: MatchupAccent;
  slot1: SlotConfig;
  slot2: SlotConfig;
  logos: Record<string, string>;
  error?: string;
}

const ACCENT: Record<MatchupAccent, { header: string; bar: string }> = {
  east: {
    header: "bg-blue-50/70 text-colors-nba-blue",
    bar: "border-l-colors-nba-blue",
  },
  west: {
    header: "bg-red-50/70 text-colors-nba-red",
    bar: "border-l-colors-nba-red",
  },
  finals: {
    header: "bg-indigo-50/70 text-indigo-700",
    bar: "border-l-indigo-500",
  },
};

function CompleteMark() {
  return (
    <span
      className="inline-flex size-5 items-center justify-center rounded-full bg-colors-nba-green text-white"
      aria-label="Complete"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="size-3.5"
        aria-hidden
      >
        <path
          fillRule="evenodd"
          d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
          clipRule="evenodd"
        />
      </svg>
    </span>
  );
}

const MatchupPickCard: React.FC<MatchupPickCardProps> = ({
  id,
  title,
  accent,
  slot1,
  slot2,
  logos,
  error,
}) => {
  const styles = ACCENT[accent];
  const complete = Boolean(slot1.team && slot2.team && !error);

  return (
    <section
      id={id}
      className={`overflow-hidden rounded-2xl border border-l-4 bg-white shadow-sm ${styles.bar} ${
        error ? "border-colors-nba-red ring-2 ring-colors-nba-red/30" : "border-gray-200"
      }`}
    >
      <header className={`flex items-center justify-between px-3 py-2 ${styles.header}`}>
        <h3 className="text-sm font-semibold">{title}</h3>
        {complete && <CompleteMark />}
      </header>
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-stretch gap-2 p-3">
        <TeamSlot
          label={slot1.label}
          team={slot1.team}
          logo={logos[slot1.team]}
          onPress={slot1.onPress}
          invalid={Boolean(error) && !slot1.team}
        />
        <span
          className="flex size-8 shrink-0 items-center justify-center self-center rounded-full bg-gray-100 text-[10px] font-semibold text-gray-500"
          aria-hidden
        >
          vs
        </span>
        <TeamSlot
          label={slot2.label}
          team={slot2.team}
          logo={logos[slot2.team]}
          onPress={slot2.onPress}
          invalid={Boolean(error) && !slot2.team}
        />
      </div>
      {error && (
        <p role="alert" className="px-3 pb-3 text-sm font-medium text-colors-nba-red">
          {error}
        </p>
      )}
    </section>
  );
};

export default MatchupPickCard;
