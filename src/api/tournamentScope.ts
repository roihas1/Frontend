let currentTournamentId: string | null = null;

export const getTournamentId = (): string | null => currentTournamentId;

export const setTournamentId = (tournamentId: string | null): void => {
  currentTournamentId = tournamentId;
};

export const clearTournamentId = (): void => {
  currentTournamentId = null;
};
