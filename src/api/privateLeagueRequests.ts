import type {
  CreateLeagueMessageRequest,
  CreatePrivateLeagueRequest,
  JoinLeagueRequest,
  RemoveUsersRequest,
} from "../types";

export function buildJoinLeagueRequest(
  code: string,
  tournamentId?: string | null,
): JoinLeagueRequest {
  return tournamentId ? { code, tournamentId } : { code };
}

export function buildCreatePrivateLeagueRequest(
  name: string,
  tournamentId?: string | null,
): CreatePrivateLeagueRequest {
  return tournamentId ? { name, tournamentId } : { name };
}

export function buildRemoveUsersRequest(
  userIds: string[],
  tournamentId?: string | null,
): RemoveUsersRequest {
  const payload: RemoveUsersRequest = {
    users: userIds.map((id) => ({ id })),
  };
  if (tournamentId) {
    payload.tournamentId = tournamentId;
  }
  return payload;
}

export function buildCreateLeagueMessageRequest(
  content: string,
  tournamentId?: string | null,
): CreateLeagueMessageRequest {
  return tournamentId ? { content, tournamentId } : { content };
}
