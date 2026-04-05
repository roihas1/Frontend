import { PlayerMatchupBet, SeriesBets } from "../../types";

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

/** Comparison API: `SeriesBets` plus `timeOfStart`; normalizer fills team strings and flat bets */
export type SeriesBetsWithSchedule = SeriesBets & { timeOfStart?: string };

export function normalizeComparisonBetsEntry(
  raw: Record<string, unknown>,
): SeriesBetsWithSchedule {
  const r = raw as Record<string, unknown> & {
    team1?: string;
    team2?: string;
    team1Name?: string;
    team2Name?: string;
    team1name?: string;
    team2name?: string;
    team1Relation?: { name?: string };
    team2Relation?: { name?: string };
    timeOfStart?: string;
  };
  const base = raw as unknown as SeriesBets;
  const team1Name =
    (typeof r.team1Name === "string" && r.team1Name.trim()) ||
    (typeof r.team1name === "string" && r.team1name.trim()) ||
    "";
  const team2Name =
    (typeof r.team2Name === "string" && r.team2Name.trim()) ||
    (typeof r.team2name === "string" && r.team2name.trim()) ||
    "";
  const team1 =
    (typeof r.team1 === "string" && r.team1.trim()) ||
    team1Name ||
    r.team1Relation?.name?.trim() ||
    base.team1 ||
    "";
  const team2 =
    (typeof r.team2 === "string" && r.team2.trim()) ||
    team2Name ||
    r.team2Relation?.name?.trim() ||
    base.team2 ||
    "";
  const startDate = (raw.startDate ??
    raw.dateOfStart ??
    base.startDate) as Date;
  const bestOf7Bet = (raw.bestOf7Bet ??
    raw.bestOf7BetId ??
    base.bestOf7Bet) as SeriesBets["bestOf7Bet"];
  const spontaneousRaw = raw.spontaneousBets;
  const spontaneousBets = Array.isArray(spontaneousRaw)
    ? spontaneousRaw
    : (base.spontaneousBets ?? []);

  return {
    ...base,
    team1,
    team2,
    startDate,
    bestOf7Bet,
    playerMatchupBets: flattenPlayerMatchupBets(raw.playerMatchupBets),
    spontaneousBets: spontaneousBets as SeriesBets["spontaneousBets"],
    timeOfStart: r.timeOfStart,
  } as SeriesBetsWithSchedule;
}
