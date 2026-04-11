import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axiosInstance from "../../api/axiosInstance";
import { clearTournamentId, setTournamentId } from "../../api/tournamentScope";
import { PlayoffTournament } from "../../types";
import { useAuth } from "./AuthContext";

const TOURNAMENT_STORAGE_KEY = "selectedTournamentId";

interface TournamentContextType {
  tournaments: PlayoffTournament[];
  selectedTournamentId: string | null;
  setSelectedTournamentId: (tournamentId: string) => void;
  isLoadingTournaments: boolean;
  refreshTournaments: () => Promise<void>;
}

const TournamentContext = createContext<TournamentContextType | undefined>(
  undefined
);

export const TournamentProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { isLoggedIn } = useAuth();
  const [tournaments, setTournaments] = useState<PlayoffTournament[]>([]);
  const [selectedTournamentId, setSelectedTournamentIdState] = useState<
    string | null
  >(null);
  const [isLoadingTournaments, setIsLoadingTournaments] = useState(false);

  const setSelectedTournamentId = useCallback((tournamentId: string) => {
    setSelectedTournamentIdState(tournamentId);
    setTournamentId(tournamentId);
    localStorage.setItem(TOURNAMENT_STORAGE_KEY, tournamentId);
  }, []);

  const refreshTournaments = useCallback(async () => {
    setIsLoadingTournaments(true);
    try {
      const response = await axiosInstance.get("/tournaments");
      const items = (response.data ?? []) as PlayoffTournament[];

      setTournaments(items);

      if (!items.length) {
        setSelectedTournamentIdState(null);
        clearTournamentId();
        localStorage.removeItem(TOURNAMENT_STORAGE_KEY);
        return;
      }

      const storedId = localStorage.getItem(TOURNAMENT_STORAGE_KEY);
      const hasStored = !!storedId && items.some((t) => t.id === storedId);
      const nextId = hasStored ? (storedId as string) : items[0].id;

      setSelectedTournamentIdState(nextId);
      setTournamentId(nextId);
      localStorage.setItem(TOURNAMENT_STORAGE_KEY, nextId);
    } catch {
      setTournaments([]);
      setSelectedTournamentIdState(null);
      clearTournamentId();
    } finally {
      setIsLoadingTournaments(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      setTournaments([]);
      setSelectedTournamentIdState(null);
      localStorage.removeItem(TOURNAMENT_STORAGE_KEY);
      clearTournamentId();
      return;
    }

    void refreshTournaments();
  }, [isLoggedIn, refreshTournaments]);

  const value = useMemo(
    () => ({
      tournaments,
      selectedTournamentId,
      setSelectedTournamentId,
      isLoadingTournaments,
      refreshTournaments,
    }),
    [
      tournaments,
      selectedTournamentId,
      setSelectedTournamentId,
      isLoadingTournaments,
      refreshTournaments,
    ]
  );

  return (
    <TournamentContext.Provider value={value}>
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournament = (): TournamentContextType => {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error("useTournament must be used within TournamentProvider");
  }
  return context;
};
