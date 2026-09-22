export interface StandingsCursor {
  totalPoints: number;
  id: string;
}

export interface StandingsUserRow {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  fantasyPoints: number;
  championPoints: number;
  totalPoints: number;
}

export interface StandingsUserWithRank extends StandingsUserRow {
  rank: number;
}

export interface StandingsPageResponse {
  data: StandingsUserRow[];
  nextCursor: StandingsCursor | null;
  prevCursor: StandingsCursor | null;
}

export type StandingsPaginationMode =
  | { type: "first" }
  | { type: "next"; cursor: StandingsCursor }
  | { type: "prev"; prevCursor: StandingsCursor };
