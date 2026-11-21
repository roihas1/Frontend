import {
  MatchupCategory,
  PlayerMatchupType,
} from "../../types";
import { remapHeaders, type SheetRow } from "./sheetImport";

export type BulkMatchupBetPayload = {
  seriesId: string;
  typeOfMatchup: PlayerMatchupType;
  categories: MatchupCategory[];
  fantasyPoints: number;
  player1: string;
  player2: string;
  differential: number;
};

export type BulkSpontaneousBetPayload = BulkMatchupBetPayload & {
  gameNumber: number;
  startTime: string;
};

export type ParsedBetRow =
  | {
      ok: true;
      kind: "matchup";
      rowNumber: number;
      payload: BulkMatchupBetPayload;
    }
  | {
      ok: true;
      kind: "spontaneous";
      rowNumber: number;
      payload: BulkSpontaneousBetPayload;
    }
  | { ok: false; rowNumber: number; error: string };

const BET_ALIASES: Record<string, string[]> = {
  player1: ["player1", "player 1", "p1"],
  player2: ["player2", "player 2", "p2"],
  categories: ["categories", "category", "cats"],
  typeOfMatchup: ["typeofmatchup", "type", "matchuptype", "type of matchup"],
  fantasyPoints: ["fantasypoints", "fantasy", "points", "fp"],
  differential: ["differential", "diff", "line"],
  gameNumber: ["gamenumber", "game", "game number", "g"],
  startTime: ["starttime", "start", "start_time", "datetime"],
  startDate: ["startdate", "date", "start_date"],
  startClock: ["startclock", "time", "start_clock", "timeofstart"],
};

const CATEGORY_VALUES = new Set(Object.values(MatchupCategory));
const TYPE_VALUES = new Set(Object.values(PlayerMatchupType));

const CATEGORY_ALIASES: Record<string, MatchupCategory> = {
  points: MatchupCategory.POINTS,
  pts: MatchupCategory.POINTS,
  rebounds: MatchupCategory.REBOUNDS,
  reb: MatchupCategory.REBOUNDS,
  assists: MatchupCategory.ASSISTS,
  ast: MatchupCategory.ASSISTS,
  steals: MatchupCategory.STEALS,
  stl: MatchupCategory.STEALS,
  blocks: MatchupCategory.BLOCKS,
  blk: MatchupCategory.BLOCKS,
  "3-point shots made": MatchupCategory.THREE_POINT_SHOTS_MADE,
  "3pm": MatchupCategory.THREE_POINT_SHOTS_MADE,
  threes: MatchupCategory.THREE_POINT_SHOTS_MADE,
  turnovers: MatchupCategory.TURNOVERS,
  to: MatchupCategory.TURNOVERS,
  "field goal percentage": MatchupCategory.FIELD_GOAL_PERCENTAGE,
  fg: MatchupCategory.FIELD_GOAL_PERCENTAGE,
  "fg%": MatchupCategory.FIELD_GOAL_PERCENTAGE,
  "free throw percentage": MatchupCategory.FREE_THROW_PERCENTAGE,
  ft: MatchupCategory.FREE_THROW_PERCENTAGE,
  "ft%": MatchupCategory.FREE_THROW_PERCENTAGE,
  "minutes played": MatchupCategory.MINUTES_PLAYED,
  minutes: MatchupCategory.MINUTES_PLAYED,
  min: MatchupCategory.MINUTES_PLAYED,
  "double double": MatchupCategory.DOUBLE_DOUBLE,
  "triple double": MatchupCategory.TRIPLE_DOUBLE,
};

const TYPE_ALIASES: Record<string, PlayerMatchupType> = {
  "under/over": PlayerMatchupType.UNDEROVER,
  underover: PlayerMatchupType.UNDEROVER,
  uo: PlayerMatchupType.UNDEROVER,
  playermatchup: PlayerMatchupType.PLAYERMATCHUP,
  matchup: PlayerMatchupType.PLAYERMATCHUP,
  "team matchup": PlayerMatchupType.TEAM_MATCHUP,
  teammatchup: PlayerMatchupType.TEAM_MATCHUP,
  overall: PlayerMatchupType.OVERALL,
};

function parseNumber(raw: string, label: string): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) {
    throw new Error(`${label} must be a number (got "${raw}")`);
  }
  return n;
}

function parseCategories(raw: string): MatchupCategory[] {
  const parts = raw
    .split(/[|;,/]/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) {
    throw new Error("categories is required");
  }
  return parts.map((part) => {
    if (CATEGORY_VALUES.has(part as MatchupCategory)) {
      return part as MatchupCategory;
    }
    const mapped = CATEGORY_ALIASES[part.toLowerCase()];
    if (!mapped) {
      throw new Error(`Unknown category "${part}"`);
    }
    return mapped;
  });
}

function parseType(raw: string): PlayerMatchupType {
  if (TYPE_VALUES.has(raw as PlayerMatchupType)) {
    return raw as PlayerMatchupType;
  }
  const mapped = TYPE_ALIASES[raw.toLowerCase()];
  if (!mapped) {
    throw new Error(`Unknown typeOfMatchup "${raw}"`);
  }
  return mapped;
}

function parseStartTime(mapped: SheetRow): string {
  if (mapped.startTime) {
    const d = new Date(mapped.startTime);
    if (Number.isNaN(d.getTime())) {
      throw new Error(`Invalid startTime "${mapped.startTime}"`);
    }
    return d.toISOString();
  }
  if (mapped.startDate && mapped.startClock) {
    const combined = `${mapped.startDate}T${mapped.startClock}`;
    const d = new Date(combined);
    if (Number.isNaN(d.getTime())) {
      throw new Error(`Invalid start date/time "${combined}"`);
    }
    return d.toISOString();
  }
  throw new Error("startTime (or startDate + time) is required for spontaneous bets");
}

export function parseBetSheetRows(
  rows: SheetRow[],
  options: { seriesId: string; mode: "matchup" | "spontaneous" },
): ParsedBetRow[] {
  return rows.map((raw, index) => {
    const rowNumber = index + 2; // header is row 1
    try {
      const mapped = remapHeaders(raw, BET_ALIASES);
      if (!mapped.player1 || !mapped.player2) {
        throw new Error("player1 and player2 are required");
      }
      const payloadBase: BulkMatchupBetPayload = {
        seriesId: options.seriesId,
        player1: mapped.player1,
        player2: mapped.player2,
        categories: parseCategories(mapped.categories ?? ""),
        typeOfMatchup: parseType(mapped.typeOfMatchup || "PLAYERMATCHUP"),
        fantasyPoints: parseNumber(mapped.fantasyPoints || "2", "fantasyPoints"),
        differential: parseNumber(mapped.differential || "0", "differential"),
      };

      if (options.mode === "matchup") {
        return {
          ok: true as const,
          kind: "matchup" as const,
          rowNumber,
          payload: payloadBase,
        };
      }

      if (!mapped.gameNumber) {
        throw new Error("gameNumber is required for spontaneous bets");
      }
      return {
        ok: true as const,
        kind: "spontaneous" as const,
        rowNumber,
        payload: {
          ...payloadBase,
          gameNumber: parseNumber(mapped.gameNumber, "gameNumber"),
          startTime: parseStartTime(mapped),
        },
      };
    } catch (error) {
      return {
        ok: false as const,
        rowNumber,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  });
}

export const MATCHUP_BET_TEMPLATE_HEADERS = [
  "player1",
  "player2",
  "categories",
  "typeOfMatchup",
  "fantasyPoints",
  "differential",
];

export const MATCHUP_BET_TEMPLATE_SAMPLE = [
  [
    "LeBron James",
    "Jayson Tatum",
    "Points|Rebounds",
    "PLAYERMATCHUP",
    "2",
    "0",
  ],
];

export const SPONTANEOUS_BET_TEMPLATE_HEADERS = [
  "player1",
  "player2",
  "categories",
  "typeOfMatchup",
  "fantasyPoints",
  "differential",
  "gameNumber",
  "startTime",
];

export const SPONTANEOUS_BET_TEMPLATE_SAMPLE = [
  [
    "LeBron James",
    "Jayson Tatum",
    "Points",
    "UNDER/OVER",
    "2",
    "25.5",
    "1",
    "2026-04-20T19:30:00",
  ],
];
