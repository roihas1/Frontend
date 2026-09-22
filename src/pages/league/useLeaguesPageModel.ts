import { useCallback, useEffect, useMemo, useState } from "react";
import {
  SelectChangeEvent,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { serializeQueryParamsWithNull } from "../../api/serializeQueryParams";
import { useError } from "../../components/providers&context/ErrorProvider";
import { useTournament } from "../../components/providers&context/TournamentContext";
import { League } from "../LeagueSelectionPage";
import type {
  StandingsPageResponse,
  StandingsPaginationMode,
  StandingsUserRow,
  StandingsUserWithRank,
} from "./leagueStandingsTypes";

function paginationQueryKeyPart(mode: StandingsPaginationMode): string {
  if (mode.type === "first") {
    return "first";
  }
  if (mode.type === "next") {
    return `next:${mode.cursor.totalPoints}:${mode.cursor.id}`;
  }
  return `prev:${mode.prevCursor.totalPoints}:${mode.prevCursor.id}`;
}

export function useLeaguesPageModel() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const navigate = useNavigate();
  const { showError } = useError();
  const { selectedTournamentId } = useTournament();

  const league = location.state?.league as League | undefined;
  const isOverallLeague = league?.name === "Overall";
  const standingsLeagueId: string | null | undefined = league
    ? isOverallLeague
      ? null
      : league.id ?? null
    : undefined;

  const leagueReady =
    !!league &&
    !!selectedTournamentId &&
    (isOverallLeague || !!league.id);

  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState<StandingsPaginationMode>({
    type: "first",
  });
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    setPagination({ type: "first" });
    setOffset(0);
  }, [selectedTournamentId, league?.id, league?.name, isOverallLeague, limit]);

  const standingsQueryKey = useMemo(
    () =>
      [
        "auth-standings",
        selectedTournamentId ?? "none",
        standingsLeagueId === undefined
          ? "none"
          : standingsLeagueId ?? "overall",
        limit,
        paginationQueryKeyPart(pagination),
      ] as const,
    [selectedTournamentId, standingsLeagueId, limit, pagination],
  );

  const {
    data: standingsData,
    isLoading: isStandingsLoading,
    isFetching: isStandingsFetching,
    isError: isStandingsError,
  } = useQuery({
    queryKey: standingsQueryKey,
    enabled: leagueReady,
    placeholderData: (previous) => previous,
    queryFn: async (): Promise<StandingsPageResponse> => {
      const params: Record<string, unknown> = {
        limit,
        leagueId: isOverallLeague ? null : league?.id ?? null,
        tournamentId: selectedTournamentId,
      };
      if (pagination.type === "next") {
        params.cursorPoints = pagination.cursor.totalPoints;
        params.cursorId = pagination.cursor.id;
      } else if (pagination.type === "prev") {
        params.prevCursorPoints = pagination.prevCursor.totalPoints;
        params.prevCursorId = pagination.prevCursor.id;
      }
      const response = await axiosInstance.get("/auth/standings", {
        params,
        paramsSerializer: serializeQueryParamsWithNull,
      });
      return response.data as StandingsPageResponse;
    },
  });

  const { data: currentUser } = useQuery({
    queryKey: ["auth-user"],
    enabled: leagueReady,
    queryFn: async (): Promise<StandingsUserRow> => {
      const response = await axiosInstance.get("/auth/user");
      const raw = response.data as StandingsUserRow & { totalPoints?: number };
      return {
        id: raw.id,
        username: raw.username,
        firstName: raw.firstName,
        lastName: raw.lastName,
        fantasyPoints: raw.fantasyPoints ?? 0,
        championPoints: raw.championPoints ?? 0,
        totalPoints:
          raw.totalPoints ??
          (raw.fantasyPoints ?? 0) + (raw.championPoints ?? 0),
      };
    },
  });

  const users = useMemo(
    () => standingsData?.data ?? [],
    [standingsData?.data],
  );
  const nextCursor = standingsData?.nextCursor ?? null;
  const prevCursor = standingsData?.prevCursor ?? null;

  const usersWithRank: StandingsUserWithRank[] = useMemo(
    () =>
      users.map((user, index) => ({
        ...user,
        rank: offset + index + 1,
        totalPoints:
          user.totalPoints ?? user.fantasyPoints + user.championPoints,
      })),
    [users, offset],
  );

  const pageStart = users.length > 0 ? offset + 1 : 0;
  const pageEnd = users.length > 0 ? offset + users.length : 0;

  const headerTitle = league ? `${league.name} standings` : "Standings";
  const currentUserFullName = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName}`.trim()
    : "";

  const handleBackToLeagues = useCallback(() => {
    navigate("/leagues");
  }, [navigate]);

  const handleUserClick = useCallback(
    (user: StandingsUserRow) => {
      navigate("/comparing", {
        state: {
          secondUserId: user.id,
          secondUser: {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            fantasyPoints: user.fantasyPoints,
            championPoints: user.championPoints,
          },
          league,
        },
      });
    },
    [navigate, league],
  );

  const handlePreviousPage = useCallback(() => {
    if (!prevCursor) {
      return;
    }
    setOffset((prev) => Math.max(prev - limit, 0));
    setPagination({ type: "prev", prevCursor });
  }, [prevCursor, limit]);

  const handleNextPage = useCallback(() => {
    if (!nextCursor) {
      return;
    }
    setOffset((prev) => prev + limit);
    setPagination({ type: "next", cursor: nextCursor });
  }, [nextCursor, limit]);

  const handleLimitSelection = useCallback((e: SelectChangeEvent<number>) => {
    setLimit(Number(e.target.value));
  }, []);

  useEffect(() => {
    if (isStandingsError) {
      showError("Server error.");
    }
  }, [isStandingsError, showError]);

  const standingsLoading =
    leagueReady && (isStandingsLoading || (isStandingsFetching && !users.length));

  return {
    isMobile,
    league,
    isOverallLeague,
    standingsLeagueId: standingsLeagueId ?? null,
    selectedTournamentId,
    leagueReady,
    standingsLoading,
    isStandingsError,
    usersWithRank,
    currentUser,
    currentUserFullName,
    headerTitle,
    pageStart,
    pageEnd,
    limit,
    nextCursor,
    prevCursor,
    handleBackToLeagues,
    handleUserClick,
    handlePreviousPage,
    handleNextPage,
    handleLimitSelection,
  };
}

export type LeaguesPageModel = ReturnType<typeof useLeaguesPageModel>;
