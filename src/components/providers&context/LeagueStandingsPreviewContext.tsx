import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { LeagueStandingsPreviewData } from "../../types";

type LeagueStandingsPreviewContextValue = {
  standingsPreview: LeagueStandingsPreviewData | null;
  standingsPreviewLoading: boolean;
  setStandingsPreviewFromHomeLoad: (payload: {
    data: LeagueStandingsPreviewData | null;
    loading: boolean;
  }) => void;
};

const LeagueStandingsPreviewContext =
  createContext<LeagueStandingsPreviewContextValue | null>(null);

export const LeagueStandingsPreviewProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [standingsPreview, setStandingsPreview] =
    useState<LeagueStandingsPreviewData | null>(null);
  /** Start true so first paint on / home shows skeleton until /home-page/load resolves. */
  const [standingsPreviewLoading, setStandingsPreviewLoading] = useState(true);

  const setStandingsPreviewFromHomeLoad = useCallback(
    (payload: { data: LeagueStandingsPreviewData | null; loading: boolean }) => {
      setStandingsPreview(payload.data);
      setStandingsPreviewLoading(payload.loading);
    },
    [],
  );

  const value = useMemo(
    () => ({
      standingsPreview,
      standingsPreviewLoading,
      setStandingsPreviewFromHomeLoad,
    }),
    [standingsPreview, standingsPreviewLoading, setStandingsPreviewFromHomeLoad],
  );

  return (
    <LeagueStandingsPreviewContext.Provider value={value}>
      {children}
    </LeagueStandingsPreviewContext.Provider>
  );
};

export function useLeagueStandingsPreview(): LeagueStandingsPreviewContextValue {
  const ctx = useContext(LeagueStandingsPreviewContext);
  if (!ctx) {
    throw new Error(
      "useLeagueStandingsPreview must be used within LeagueStandingsPreviewProvider",
    );
  }
  return ctx;
}
