import React from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@mui/material";
import axiosInstance from "../../api/axiosInstance";
import { serializeQueryParamsWithNull } from "../../api/serializeQueryParams";

export interface StandingsMePayload {
  tournamentId: string;
  leagueId: string | null;
  position: number;
  fantasyPoints: number;
  championPoints: number;
  totalPoints: number;
}

type StandingsMeResult =
  | { kind: "success"; data: StandingsMePayload }
  | { kind: "forbidden" }
  | { kind: "not_found" };

function unwrapStandingsMe(response: { data: unknown }): StandingsMePayload {
  const raw = response.data;
  if (raw && typeof raw === "object" && raw !== null) {
    const obj = raw as Record<string, unknown>;
    if (
      "data" in obj &&
      obj.data &&
      typeof obj.data === "object" &&
      obj.data !== null
    ) {
      return obj.data as StandingsMePayload;
    }
  }
  return raw as StandingsMePayload;
}

export interface LeagueStandingsMyPlaceProps {
  /** Private league id, or `null` for overall (tournament-wide) standings. */
  leagueId: string | null;
  tournamentId?: string | null;
}

const LeagueStandingsMyPlace: React.FC<LeagueStandingsMyPlaceProps> = ({
  leagueId,
  tournamentId,
}) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["auth-standings-me", leagueId ?? "overall", tournamentId ?? "ctx"],
    enabled: !!tournamentId,
    queryFn: async (): Promise<StandingsMeResult> => {
      try {
        const res = await axiosInstance.get("/auth/standings/me", {
          params: {
            leagueId,
            ...(tournamentId ? { tournamentId } : {}),
          },
          paramsSerializer: serializeQueryParamsWithNull,
        });
        return { kind: "success", data: unwrapStandingsMe(res) };
      } catch (e) {
        if (axios.isAxiosError(e)) {
          const s = e.response?.status;
          if (s === 403) return { kind: "forbidden" };
          if (s === 404) return { kind: "not_found" };
        }
        throw e;
      }
    },
  });

  if (!tournamentId) {
    return null;
  }

  if (isLoading) {
    return (
      <div
        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 mb-4 min-h-[3.25rem] flex items-center"
        aria-busy="true"
        aria-label="Loading your league rank"
      >
        <Skeleton variant="text" width="75%" height={28} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 mb-4 text-sm text-amber-900">
        Couldn&apos;t load your rank. Try again later.
      </div>
    );
  }

  if (!data) {
    return null;
  }

  if (data.kind === "forbidden") {
    return (
      <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 mb-4 text-sm text-gray-600">
        You don&apos;t have access to this league&apos;s standings.
      </div>
    );
  }

  if (data.kind === "not_found") {
    return (
      <div className="w-full rounded-lg border border-gray-100 bg-gray-50/80 px-4 py-2 mb-4 text-sm text-gray-500">
        Rank isn&apos;t available for this league right now.
      </div>
    );
  }

  const { position, totalPoints } = data.data;

  return (
    <div className="w-full rounded-lg border border-indigo-200 bg-indigo-50/90 px-4 py-3 mb-4 shadow-sm">
      <p className="text-lg font-semibold flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="text-colors-nba-blue">Your place: #{position}</span>
        <span className="text-gray-800 font-medium">Total: {totalPoints}</span>
      </p>
    </div>
  );
};

export default LeagueStandingsMyPlace;
