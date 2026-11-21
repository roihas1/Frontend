import { PlayerMatchupBet } from "../../types";
import { Series } from "../HomePage";

export type TeamOption = { id: string; name: string };

export type SeriesStatus = "upcoming" | "in_progress" | "finished" | "no_bets";

export const SERIES_ROUND_ORDER = [
  "First Round",
  "Conference Semifinals",
  "Conference Finals",
  "NBA Finals",
  "Finals",
] as const;

export function seriesTeam1Name(s: Series): string {
  return (s.team1?.trim() || s.team1Relation?.name?.trim() || "") as string;
}

export function seriesTeam2Name(s: Series): string {
  return (s.team2?.trim() || s.team2Relation?.name?.trim() || "") as string;
}

export function seriesDisplayLabel(s: Series): string {
  const t1 = seriesTeam1Name(s) || "TBD";
  const t2 = seriesTeam2Name(s) || "TBD";
  return `${t1} vs ${t2}`;
}

function teamOptionFromRelation(
  id: string | undefined,
  name: string | undefined,
): TeamOption | null {
  const trimmedId = id?.trim();
  const trimmedName = name?.trim();
  if (!trimmedId || !trimmedName) {
    return null;
  }
  return { id: trimmedId, name: trimmedName };
}

export function finalsTeamOptionsFromSeries(seriesList: Series[]): TeamOption[] {
  return seriesList
    .filter((series) => series.conference === "Finals")
    .flatMap((series) => [
      teamOptionFromRelation(
        series.team1Relation?.id,
        series.team1Relation?.name ?? series.team1,
      ),
      teamOptionFromRelation(
        series.team2Relation?.id,
        series.team2Relation?.name ?? series.team2,
      ),
    ])
    .filter((team): team is TeamOption => team !== null);
}

export function conferenceFinalTeamIdsFromSeries(
  seriesList: Series[],
  conference: "East" | "West",
): string[] | null {
  const matchingSeries = seriesList.filter(
    (series) =>
      series.conference === conference &&
      series.round === "Conference Finals",
  );

  const teamIds: string[] = [];
  for (const series of matchingSeries) {
    const team1Id = series.team1Relation?.id?.trim();
    const team2Id = series.team2Relation?.id?.trim();
    if (!team1Id || !team2Id) {
      return null;
    }
    teamIds.push(team1Id, team2Id);
  }

  return teamIds;
}

export function flattenPlayerMatchupBets(raw: unknown): PlayerMatchupBet[] {
  if (raw == null || !Array.isArray(raw) || raw.length === 0) return [];
  const first = raw[0];
  if (
    first &&
    typeof first === "object" &&
    "id" in first &&
    typeof (first as PlayerMatchupBet).id === "string"
  ) {
    return raw as PlayerMatchupBet[];
  }
  return (raw as PlayerMatchupBet[][]).flat();
}

/** `YYYY-MM-DD` for date inputs; tolerates Date, ISO string, or calendar date string from API */
export function dateOfStartToInputValue(d: Date | string | undefined): string {
  if (d == null) return "";
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
}

/** Payload for PATCH: preserve plain calendar strings; otherwise normalize to `YYYY-MM-DD` */
export function toApiDateString(d: Date | string | undefined): string | undefined {
  if (d == null) return undefined;
  if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString().split("T")[0];
}

export function getSeriesScore(series: Series): [number, number] {
  const score = series.bestOf7BetId?.seriesScore;
  if (!score || score.length < 2) return [0, 0];
  return [score[0] ?? 0, score[1] ?? 0];
}

export function getSeriesStatus(series: Series): SeriesStatus {
  const [s1, s2] = getSeriesScore(series);
  if (s1 >= 4 || s2 >= 4) return "finished";

  const matchups = flattenPlayerMatchupBets(series.playerMatchupBets);
  const spontaneous = series.spontaneousBets ?? [];
  if (matchups.length === 0 && spontaneous.length === 0) return "no_bets";

  const start = series.dateOfStart ? new Date(series.dateOfStart) : null;
  if (start && !Number.isNaN(start.getTime()) && start.getTime() > Date.now()) {
    return "upcoming";
  }
  return "in_progress";
}

export function seriesStatusLabel(status: SeriesStatus): string {
  switch (status) {
    case "upcoming":
      return "Upcoming";
    case "in_progress":
      return "In progress";
    case "finished":
      return "Finished";
    case "no_bets":
      return "No bets";
  }
}

export function groupSeriesByRound(
  seriesList: Series[],
): { round: string; series: Series[] }[] {
  const groups = new Map<string, Series[]>();
  for (const series of seriesList) {
    const round = series.round || "Other";
    const existing = groups.get(round);
    if (existing) {
      existing.push(series);
    } else {
      groups.set(round, [series]);
    }
  }

  const orderedRounds = [
    ...SERIES_ROUND_ORDER.filter((round) => groups.has(round)),
    ...[...groups.keys()].filter(
      (round) =>
        !(SERIES_ROUND_ORDER as readonly string[]).includes(round),
    ),
  ];

  return orderedRounds.map((round) => ({
    round,
    series: groups.get(round) ?? [],
  }));
}

export function parseDateAndTimeToIso(
  dateStr: string,
  timeStr: string,
): Date | null {
  if (!dateStr || !timeStr) return null;
  const timeParts = timeStr.split(":");
  if (timeParts.length < 2) return null;
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(parseInt(timeParts[0], 10), parseInt(timeParts[1], 10), 0, 0);
  return date;
}

export function startTimeToDateInput(startTime: Date | string | undefined): {
  date: string;
  time: string;
} {
  if (startTime == null) return { date: "", time: "" };
  const date = startTime instanceof Date ? startTime : new Date(startTime);
  if (Number.isNaN(date.getTime())) return { date: "", time: "" };
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return {
    date: date.toISOString().split("T")[0],
    time: `${hours}:${minutes}`,
  };
}
