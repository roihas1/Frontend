import React from "react";
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Legend } from "recharts";

interface TeamWinPieChartProps {
  data: Array<{ name: string; value: number }>;
}

const COLORS = ["#1D428A", "#C8102E", "#9CA3AF"];

const TeamWinPieChart: React.FC<TeamWinPieChartProps> = ({ data }) => {
  if (data.length === 0) {
    return <p className="text-sm text-gray-500">No team winner distribution available.</p>;
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            label={({ value }) => Number(value ?? 0).toFixed(2)}
          >
            {data.map((entry, idx) => (
              <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${Number(value ?? 0).toFixed(2)}%`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TeamWinPieChart;

