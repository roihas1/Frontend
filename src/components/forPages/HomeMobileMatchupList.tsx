import React, { useMemo } from "react";
import MobileSeriesCard from "./MobileSeriesCard";
import { Series } from "../../pages/HomePage";

type ConferenceKey = "west" | "east" | "finals";

interface HomeMobileMatchupListProps {
  west: Series[];
  east: Series[];
  finals: Series[];
  userPointsPerSeries: { [key: string]: number } | null;
  isSeriesGuessComplete: (id?: string) => boolean;
  fetchData: () => void;
}

const ROUND_ORDER = [
  "NBA Finals",
  "Conference Finals",
  "Conference Semifinals",
  "First Round",
] as const;

const CONFERENCE_ORDER: {
  key: ConferenceKey;
  label: string;
  seriesKey: "west" | "east" | "finals";
}[] = [
  { key: "finals", label: "NBA Finals", seriesKey: "finals" },
  { key: "west", label: "Western Conference", seriesKey: "west" },
  { key: "east", label: "Eastern Conference", seriesKey: "east" },
];

const HomeMobileMatchupList: React.FC<HomeMobileMatchupListProps> = ({
  west,
  east,
  finals,
  userPointsPerSeries,
  isSeriesGuessComplete,
  fetchData,
}) => {
  const byConference = useMemo(
    () => ({ west, east, finals }),
    [west, east, finals],
  );

  const totalMatchups = west.length + east.length + finals.length;

  const roundsWithMatchups = useMemo(() => {
    return ROUND_ORDER.map((round) => {
      const conferences = CONFERENCE_ORDER.map(({ key, label, seriesKey }) => {
        const matchups = byConference[seriesKey].filter(
          (matchup) => matchup.round === round,
        );
        return { key, label, matchups };
      }).filter((conference) => conference.matchups.length > 0);

      return { round, conferences };
    }).filter((section) => section.conferences.length > 0);
  }, [byConference]);

  if (totalMatchups === 0) {
    return (
      <div className="mb-4 rounded-2xl border border-dashed border-gray-300 bg-white/80 px-4 py-5 text-center text-sm text-gray-600">
        <p className="mb-1 font-semibold text-gray-800">No series yet</p>
        <p>Playoff matchups will appear here once they are created.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {roundsWithMatchups.map(({ round, conferences }) => (
        <section key={round} aria-labelledby={`round-${round}`}>
          <h3
            id={`round-${round}`}
            className="mb-3 border-b border-colors-nba-blue/20 pb-2 text-center text-base font-bold text-colors-nba-blue"
          >
            {round}
          </h3>

          <div className="space-y-4">
            {conferences.map(({ key, label, matchups }) => (
              <div key={`${round}-${key}`}>
                {key !== "finals" && (
                  <h4 className="mb-2 px-1 text-center text-sm font-medium text-gray-600">
                    {label}
                  </h4>
                )}
                <div className="space-y-2">
                  {matchups.map((matchup) => (
                    <MobileSeriesCard
                      key={matchup.id}
                      series={matchup}
                      userPoints={
                        userPointsPerSeries?.[matchup.id ?? ""] ?? 0
                      }
                      isGuessComplete={isSeriesGuessComplete(matchup.id)}
                      fetchData={fetchData}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default HomeMobileMatchupList;
