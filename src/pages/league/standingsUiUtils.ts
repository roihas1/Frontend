import type { StandingsUserWithRank } from "./leagueStandingsTypes";

export function getDisplayTotalPoints(user: {
  totalPoints?: number;
  fantasyPoints: number;
  championPoints: number;
}): number {
  return (
    user.totalPoints ?? user.fantasyPoints + user.championPoints
  );
}

export function getUserInitials(user: {
  username: string;
  firstName: string;
  lastName: string;
}): string {
  const fromName = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.trim();
  if (fromName.length >= 2) {
    return fromName.toUpperCase();
  }
  return user.username.slice(0, 2).toUpperCase();
}

export function getRankBadgeClass(rank: number): string {
  if (rank === 1) {
    return "bg-amber-100 text-amber-900 ring-1 ring-amber-300";
  }
  if (rank === 2) {
    return "bg-gray-200 text-gray-800 ring-1 ring-gray-300";
  }
  if (rank === 3) {
    return "bg-orange-100 text-orange-900 ring-1 ring-orange-300";
  }
  return "bg-gray-100 text-gray-700";
}

export function isCurrentUserRow(
  userId: string,
  currentUserId: string | undefined,
): boolean {
  return !!currentUserId && userId === currentUserId;
}

export function formatPointsBreakdown(user: StandingsUserWithRank): string {
  return `${user.fantasyPoints} · ${user.championPoints}`;
}
