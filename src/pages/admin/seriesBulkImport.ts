import { remapHeaders, type SheetRow } from "./sheetImport";

export type BulkSeriesPayload = {
  team1: string;
  team2: string;
  seed1: number;
  seed2: number;
  round: string;
  conference: string;
  dateOfStart: string;
  timeOfStart: string;
  tournamentId?: string;
};

export type ParsedSeriesRow =
  | { ok: true; rowNumber: number; payload: BulkSeriesPayload }
  | { ok: false; rowNumber: number; error: string };

const SERIES_ALIASES: Record<string, string[]> = {
  team1: ["team1", "team 1", "home", "higherseed"],
  team2: ["team2", "team 2", "away", "lowerseed"],
  seed1: ["seed1", "seed 1"],
  seed2: ["seed2", "seed 2"],
  round: ["round"],
  conference: ["conference", "conf"],
  dateOfStart: ["dateofstart", "date", "startDate", "start_date"],
  timeOfStart: ["timeofstart", "time", "startTime", "start_time"],
  tournamentId: ["tournamentid", "tournament", "tournament_id"],
};

const ROUNDS = new Set([
  "First Round",
  "Conference Semifinals",
  "Conference Finals",
  "NBA Finals",
]);

const CONFERENCES = new Set(["East", "West", "Finals"]);

const ROUND_ALIASES: Record<string, string> = {
  "first round": "First Round",
  r1: "First Round",
  "conference semifinals": "Conference Semifinals",
  semis: "Conference Semifinals",
  "conference finals": "Conference Finals",
  "nba finals": "NBA Finals",
  finals: "NBA Finals",
};

const CONF_ALIASES: Record<string, string> = {
  east: "East",
  west: "West",
  finals: "Finals",
};

function parseNumber(raw: string, label: string): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) {
    throw new Error(`${label} must be a number (got "${raw}")`);
  }
  return n;
}

function parseRound(raw: string): string {
  if (ROUNDS.has(raw)) return raw;
  const mapped = ROUND_ALIASES[raw.toLowerCase()];
  if (!mapped) throw new Error(`Unknown round "${raw}"`);
  return mapped;
}

function parseConference(raw: string): string {
  if (CONFERENCES.has(raw)) return raw;
  const mapped = CONF_ALIASES[raw.toLowerCase()];
  if (!mapped) throw new Error(`Unknown conference "${raw}"`);
  return mapped;
}

function parseDate(raw: string): string {
  // Excel may give serials already stringified by sheetjs with raw:false as locale dates.
  const asDate = new Date(raw);
  if (!Number.isNaN(asDate.getTime()) && /^\d{4}-\d{2}-\d{2}/.test(raw) === false) {
    // Accept MM/DD/YYYY etc. from Excel export
    return asDate.toISOString().split("T")[0];
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    return raw.slice(0, 10);
  }
  if (!Number.isNaN(asDate.getTime())) {
    return asDate.toISOString().split("T")[0];
  }
  throw new Error(`Invalid dateOfStart "${raw}"`);
}

export function parseSeriesSheetRows(
  rows: SheetRow[],
  options: { defaultTournamentId?: string | null },
): ParsedSeriesRow[] {
  return rows.map((raw, index) => {
    const rowNumber = index + 2;
    try {
      const mapped = remapHeaders(raw, SERIES_ALIASES);
      if (!mapped.team1 || !mapped.team2) {
        throw new Error("team1 and team2 are required (name or abbreviation)");
      }
      const tournamentId =
        mapped.tournamentId || options.defaultTournamentId || undefined;
      const payload: BulkSeriesPayload = {
        team1: mapped.team1,
        team2: mapped.team2,
        seed1: parseNumber(mapped.seed1 || "0", "seed1"),
        seed2: parseNumber(mapped.seed2 || "0", "seed2"),
        round: parseRound(mapped.round || "First Round"),
        conference: parseConference(mapped.conference || "West"),
        dateOfStart: parseDate(mapped.dateOfStart || ""),
        timeOfStart: mapped.timeOfStart || "19:00",
        ...(tournamentId ? { tournamentId } : {}),
      };
      if (payload.seed1 < 1 || payload.seed1 > 8) {
        throw new Error("seed1 must be 1–8");
      }
      return { ok: true as const, rowNumber, payload };
    } catch (error) {
      return {
        ok: false as const,
        rowNumber,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  });
}

export const SERIES_TEMPLATE_HEADERS = [
  "team1",
  "team2",
  "seed1",
  "seed2",
  "round",
  "conference",
  "dateOfStart",
  "timeOfStart",
  "tournamentId",
];

export const SERIES_TEMPLATE_SAMPLE = [
  [
    "LAL",
    "BOS",
    "1",
    "8",
    "First Round",
    "West",
    "2026-04-18",
    "19:30",
    "",
  ],
  [
    "Denver Nuggets",
    "Minnesota Timberwolves",
    "2",
    "7",
    "First Round",
    "West",
    "2026-04-19",
    "21:00",
    "",
  ],
];
