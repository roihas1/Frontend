import axiosInstance from "../../api/axiosInstance";
import {
  CreateTournamentDto,
  PlayerMatchupBet,
  SpontaneousBet,
} from "../../types";
import { Series } from "../HomePage";

export const adminQueryKeys = {
  all: ["admin"] as const,
  series: (tournamentId: string | null | undefined) =>
    [...adminQueryKeys.all, "series", tournamentId ?? "none"] as const,
  seriesDetail: (
    tournamentId: string | null | undefined,
    seriesId: string | null | undefined,
  ) =>
    [
      ...adminQueryKeys.all,
      "series-detail",
      tournamentId ?? "none",
      seriesId ?? "none",
    ] as const,
};

export async function fetchAdminSeries(): Promise<Series[]> {
  const response = await axiosInstance.get<Series[]>("/series");
  return response.data;
}

export async function fetchAdminSeriesById(seriesId: string): Promise<Series> {
  const response = await axiosInstance.get<Series>(`/series/${seriesId}`);
  return response.data;
}

export async function createSeries(payload: {
  team1: string;
  team2: string;
  seed1: number;
  seed2: number;
  round: string;
  conference: string;
  dateOfStart: string;
  timeOfStart: string;
  tournamentId?: string;
}): Promise<Series> {
  const response = await axiosInstance.post<Series>("/series", payload);
  return response.data;
}

export async function deleteSeries(seriesId: string): Promise<void> {
  await axiosInstance.delete(`/series/${seriesId}`);
}

export async function closeSeriesBets(seriesId: string): Promise<void> {
  await axiosInstance.patch(`/series/${seriesId}/closeBets`);
}

export async function updateSeriesGame(
  seriesId: string,
  teamWon: number,
): Promise<void> {
  await axiosInstance.patch(`/series/${seriesId}/updateGame`, { teamWon });
}

export async function updateSeriesTime(
  seriesId: string,
  payload: { dateOfStart?: string; timeOfStart?: string },
): Promise<void> {
  await axiosInstance.patch(`series/${seriesId}/updateTime`, payload);
}

export async function createPlayerMatchupBet(payload: {
  categories: PlayerMatchupBet["categories"];
  fantasyPoints: number;
  player1: string;
  player2: string;
  differential: number;
  typeOfMatchup: string;
  seriesId: string | undefined;
}): Promise<PlayerMatchupBet> {
  const response = await axiosInstance.post<PlayerMatchupBet>(
    "/player-matchup-bet",
    payload,
  );
  return response.data;
}

export async function updatePlayerMatchupBet(
  betId: string,
  payload: Partial<PlayerMatchupBet>,
): Promise<void> {
  await axiosInstance.patch(`/player-matchup-bet/${betId}/update`, payload);
}

export async function deletePlayerMatchupBet(betId: string): Promise<void> {
  await axiosInstance.delete(`/player-matchup-bet/${betId}/delete`);
}

export async function createSpontaneousBet(payload: {
  categories: SpontaneousBet["categories"];
  fantasyPoints: number;
  player1: string;
  player2: string;
  differential: number;
  typeOfMatchup: string;
  seriesId: string | undefined;
  startTime: Date;
  gameNumber: number;
}): Promise<SpontaneousBet> {
  const response = await axiosInstance.post<SpontaneousBet>(
    `/spontaneous-bet`,
    payload,
  );
  return response.data;
}

export async function updateSpontaneousBet(
  betId: string,
  payload: Partial<SpontaneousBet> & { startTime?: Date; gameNumber?: number },
): Promise<void> {
  await axiosInstance.patch(`/spontaneous-bet/${betId}/update`, payload);
}

export async function deleteSpontaneousBet(betId: string): Promise<void> {
  await axiosInstance.delete(`/spontaneous-bet/${betId}/delete`);
}

export async function createTournament(
  payload: CreateTournamentDto,
): Promise<{ id?: string }> {
  const response = await axiosInstance.post<{ id?: string }>(
    "/tournaments",
    payload,
  );
  return response.data;
}

export async function createPlayoffsStage(payload: {
  name: string;
  startDate: string;
  timeOfStart: string;
  tournamentId: string;
}): Promise<void> {
  await axiosInstance.post("/playoffs-stage", payload);
}

export async function closeChampionsGuess(payload: {
  tournamentId: string;
  westernConferenceFinal: string[];
  easternConferenceFinal: string[];
  finals: string[];
  championTeamId: string;
  mvp: string;
}): Promise<void> {
  await axiosInstance.patch("/playoffs-stage/closeGuess", payload);
}

export async function updateMissingBetsForAllUsers(): Promise<void> {
  await axiosInstance.patch(`/user-missing-bets/user/updateAllUsers`);
}

export type BulkCreateBetsPayload = {
  playerMatchupBets?: Array<{
    seriesId: string;
    typeOfMatchup: string;
    categories: PlayerMatchupBet["categories"];
    fantasyPoints: number;
    player1: string;
    player2: string;
    differential: number;
  }>;
  spontaneousBets?: Array<{
    seriesId: string;
    typeOfMatchup: string;
    categories: SpontaneousBet["categories"];
    fantasyPoints: number;
    player1: string;
    player2: string;
    differential: number;
    gameNumber: number;
    startTime: string;
  }>;
};

export async function bulkCreateBets(
  payload: BulkCreateBetsPayload,
): Promise<{
  playerMatchupBets: PlayerMatchupBet[];
  spontaneousBets: SpontaneousBet[];
}> {
  const response = await axiosInstance.post<{
    playerMatchupBets: PlayerMatchupBet[];
    spontaneousBets: SpontaneousBet[];
  }>("/admin/bets/bulk", payload);
  return response.data;
}

export type BulkCreateSeriesPayload = {
  series: Array<{
    team1: string;
    team2: string;
    seed1: number;
    seed2: number;
    round: string;
    conference: string;
    dateOfStart: string;
    timeOfStart: string;
    tournamentId?: string;
  }>;
};

export async function bulkCreateSeries(
  payload: BulkCreateSeriesPayload,
): Promise<Series[]> {
  const response = await axiosInstance.post<Series[]>(
    "/admin/series/bulk",
    payload,
  );
  return response.data;
}

export type AdminTeam = {
  id: string;
  name: string;
  abbreviation: string;
  conference: string;
  isActive?: boolean;
};

export async function fetchActiveTeams(): Promise<AdminTeam[]> {
  const response = await axiosInstance.get<AdminTeam[]>("/teams");
  return response.data;
}
