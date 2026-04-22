import React from "react";
import { GuessStatsChampionSnapshot } from "../../../types/guessStats";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useMediaQuery, useTheme } from "@mui/material";

interface ChampionStageStatsSectionProps {
  championByStage: GuessStatsChampionSnapshot[];
}

const sortTopVotes = (rows: Array<{ id: string; label: string; votes: number }>) =>
  [...rows].sort((a, b) => b.votes - a.votes).slice(0, 5);

const PIE_COLORS = ["#1D428A", "#C8102E", "#539DC9", "#FDB927", "#6B7280"];

const renderTopFivePie = (
  title: string,
  rows: Array<{ id: string; label: string; votes: number }>,
  isMobile: boolean,
) => {
  const topRows = sortTopVotes(rows);
  const totalVotes = topRows.reduce((sum, row) => sum + row.votes, 0);
  const pieData = topRows.map((row) => ({
    name: row.label,
    value: row.votes,
    share: totalVotes > 0 ? (row.votes / totalVotes) * 100 : 0,
  }));

  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <h4 className="text-sm font-semibold text-gray-800 mb-2">{title}</h4>
      {topRows.length === 0 ? (
        <p className="text-xs text-gray-500">No votes yet.</p>
      ) : (
        <div className="h-72">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={90}
                label={
                  isMobile
                    ? false
                    : ({ percent }) => `${((percent ?? 0) * 100).toFixed(1)}%`
                }
                labelLine={!isMobile}
              >
                {pieData.map((entry, idx) => (
                  <Cell key={entry.name} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                allowEscapeViewBox={{ x: !isMobile, y: !isMobile }}
                wrapperStyle={{ zIndex: 50, pointerEvents: "none" }}
                contentStyle={{
                  maxWidth: isMobile ? "170px" : "280px",
                  fontSize: isMobile ? "12px" : "13px",
                  padding: isMobile ? "6px 8px" : "8px 10px",
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                }}
                formatter={(value, _name, payload) => {
                  const row = payload?.payload as { share?: number } | undefined;
                  return `${Number(value ?? 0)} votes (${Number(row?.share ?? 0).toFixed(1)}%)`;
                }}
              />
              <Legend
                wrapperStyle={{
                  fontSize: isMobile ? "11px" : "13px",
                  lineHeight: isMobile ? "1.2" : "1.4",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

const ChampionStageStatsSection: React.FC<ChampionStageStatsSectionProps> = ({
  championByStage,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mt-5 space-y-4">
        <h3 className="text-lg font-semibold text-colors-nba-blue">
          Top 5 Champion and MVP Picks
        </h3>
        <p className="text-xs text-gray-600">
          Shows top 5 options per stage, with vote count and share.
        </p>
        {championByStage.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4">
            <p className="text-sm text-gray-600">
              No stage guess data found yet. This can happen if no one submitted
              champion/MVP guesses for the selected stage.
            </p>
          </div>
        )}
        {championByStage.map((stageEntry) => (
          <div
            key={stageEntry.stage}
            className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3"
          >
            <h4 className="font-semibold text-colors-nba-blue">{stageEntry.stage}</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {renderTopFivePie("Champion Team (Top 5)", stageEntry.championRows, isMobile)}
              {renderTopFivePie("MVP (Top 5)", stageEntry.mvpRows, isMobile)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ChampionStageStatsSection;

