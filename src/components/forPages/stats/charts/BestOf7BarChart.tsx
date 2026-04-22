import React from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface BestOf7BarChartProps {
  data: Array<{ games: string; votes: number }>;
}

const BestOf7BarChart: React.FC<BestOf7BarChartProps> = ({ data }) => {
  if (data.length === 0) {
    return <p className="text-sm text-gray-500">No Best-of-7 votes available.</p>;
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="games" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="votes" fill="#1D428A" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BestOf7BarChart;

