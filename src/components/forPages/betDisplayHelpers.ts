export const getBetOptionLabel = (
  playerName: string,
  typeOfMatchup: string,
  playerIndex: 1 | 2,
  differential?: number
) => {
  if (typeOfMatchup === "UNDER/OVER") {
    const threshold = differential ?? 0;
    return `${playerName} (${playerIndex === 1 ? "Under" : "Over"} ${threshold})`;
  }
  return playerName;
};

export const isPlayerLeading = (
  games1: number,
  stats1: number,
  games2: number,
  stats2: number,
  differential: number,
  typeOfMatchup: string
): 1 | 2 | null => {
  const avg1 = games1 === 0 ? 0 : stats1 / games1;
  const avg2 = games2 === 0 ? 0 : stats2 / games2;
  const adjustedAvg2 = avg2 + differential;
  if (typeOfMatchup === "UNDER/OVER") {
    if (avg1 > differential) return 2;
    if (avg1 < differential) return 1;
  }
  if (avg1 > adjustedAvg2) return 1;
  if (avg1 < adjustedAvg2) return 2;
  return null;
};
