import React, { useEffect, useMemo, useState } from "react";
import { Skeleton } from "@mui/material";
import { Series } from "../HomePage";
import {
  getSeriesScore,
  getSeriesStatus,
  seriesDisplayLabel,
  seriesStatusLabel,
  SeriesStatus,
} from "./adminNormalize";

interface SeriesListPanelProps {
  groupedSeries: { round: string; series: Series[] }[];
  selectedSeriesId?: string | null;
  isLoading: boolean;
  onSelectSeries: (series: Series) => void;
  /** When true, only the selected series' round starts expanded. */
  compact?: boolean;
}

const statusClass: Record<SeriesStatus, string> = {
  upcoming: "bg-sky-100 text-sky-800",
  in_progress: "bg-amber-100 text-amber-900",
  finished: "bg-emerald-100 text-emerald-800",
  no_bets: "bg-gray-100 text-gray-600",
};

const SeriesListPanel: React.FC<SeriesListPanelProps> = ({
  groupedSeries,
  selectedSeriesId,
  isLoading,
  onSelectSeries,
  compact = false,
}) => {
  const roundWithSelection = useMemo(() => {
    if (!selectedSeriesId) return groupedSeries[0]?.round ?? null;
    for (const group of groupedSeries) {
      if (group.series.some((s) => s.id === selectedSeriesId)) {
        return group.round;
      }
    }
    return groupedSeries[0]?.round ?? null;
  }, [groupedSeries, selectedSeriesId]);

  const [expandedRounds, setExpandedRounds] = useState<Set<string>>(() => {
    if (compact) {
      return new Set(roundWithSelection ? [roundWithSelection] : []);
    }
    return new Set(groupedSeries.map((g) => g.round));
  });

  useEffect(() => {
    if (!compact) {
      setExpandedRounds(new Set(groupedSeries.map((g) => g.round)));
      return;
    }
    if (roundWithSelection) {
      setExpandedRounds(new Set([roundWithSelection]));
    }
  }, [compact, groupedSeries, roundWithSelection]);

  const toggleRound = (round: string) => {
    setExpandedRounds((prev) => {
      const next = new Set(prev);
      if (next.has(round)) {
        next.delete(round);
      } else {
        next.add(round);
      }
      return next;
    });
  };

  if (isLoading && groupedSeries.length === 0) {
    return (
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton variant="text" width={160} height={28} />
            <Skeleton variant="rounded" height={56} />
            <Skeleton variant="rounded" height={56} />
          </div>
        ))}
      </div>
    );
  }

  if (groupedSeries.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-gray-500">
        No series for this tournament yet. Create some in Setup.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {groupedSeries.map(({ round, series }) => {
        const isOpen = expandedRounds.has(round);
        return (
          <section
            key={round}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white"
          >
            <button
              type="button"
              onClick={() => toggleRound(round)}
              className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left hover:bg-gray-50"
              aria-expanded={isOpen}
            >
              <span className="text-sm font-semibold text-gray-800">
                {round}
              </span>
              <span className="flex items-center gap-2 text-xs text-gray-500">
                {series.length}
                <span
                  className={`inline-block transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden
                >
                  ▾
                </span>
              </span>
            </button>

            {isOpen && (
              <div className="space-y-1.5 border-t border-gray-100 p-2">
                {series.map((item) => {
                  const status = getSeriesStatus(item);
                  const [s1, s2] = getSeriesScore(item);
                  const isSelected = item.id === selectedSeriesId;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectSeries(item)}
                      className={`w-full rounded-lg border px-3 py-2.5 text-left transition ${
                        isSelected
                          ? "border-colors-nba-blue bg-blue-50 shadow-sm"
                          : "border-transparent bg-gray-50 hover:border-gray-200 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900">
                            {seriesDisplayLabel(item)}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-500">
                            {item.conference ?? "—"} · {s1}-{s2}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium ${statusClass[status]}`}
                        >
                          {seriesStatusLabel(status)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
};

export default SeriesListPanel;
