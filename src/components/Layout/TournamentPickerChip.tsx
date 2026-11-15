import React, { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { PlayoffTournament } from "../../types";

interface TournamentPickerChipProps {
  tournaments: PlayoffTournament[];
  selectedTournamentId: string | null;
  onSelect: (tournamentId: string) => void;
  size?: "mobile" | "desktop";
}

const TournamentPickerChip: React.FC<TournamentPickerChipProps> = ({
  tournaments,
  selectedTournamentId,
  onSelect,
  size = "mobile",
}) => {
  const isDesktop = size === "desktop";
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedTournament =
    tournaments.find((tournament) => tournament.id === selectedTournamentId) ??
    tournaments[0];

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!selectedTournament) {
    return null;
  }

  const handleSelect = (tournamentId: string) => {
    setIsOpen(false);
    if (tournamentId !== selectedTournamentId) {
      onSelect(tournamentId);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Tournament picker"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-1 rounded-full border border-gray-200/80 bg-white/90 px-2.5 py-1.5 text-left shadow-sm transition-colors hover:border-colors-nba-blue/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-colors-nba-blue ${
          isDesktop ? "max-w-[14rem]" : "max-w-[9.5rem]"
        }`}
      >
        <span
          className={`min-w-0 truncate font-semibold text-colors-nba-blue ${
            isDesktop ? "text-sm" : "text-xs"
          }`}
        >
          {selectedTournament.name}
        </span>
        <ChevronDownIcon
          className={`h-3.5 w-3.5 shrink-0 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>

      {isOpen && (
        <ul
          role="listbox"
          aria-label="Tournaments"
          className={`absolute right-0 z-50 mt-1.5 overflow-hidden rounded-xl border border-gray-200/80 bg-white/95 py-1 shadow-lg supports-[backdrop-filter]:bg-white/80 supports-[backdrop-filter]:backdrop-blur-xl ${
            isDesktop
              ? "min-w-[14rem] max-w-[18rem]"
              : "min-w-[12rem] max-w-[16rem]"
          }`}
        >
          {tournaments.map((tournament) => {
            const isSelected = tournament.id === selectedTournament.id;
            return (
              <li key={tournament.id} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => handleSelect(tournament.id)}
                  className={`flex w-full items-center px-3 py-2.5 text-left text-sm transition-colors hover:bg-gray-50 active:bg-gray-100 ${
                    isSelected
                      ? "font-semibold text-colors-nba-blue"
                      : "text-gray-800"
                  }`}
                >
                  <span className="truncate">{tournament.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default TournamentPickerChip;
