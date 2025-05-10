import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { type ReferrerStats } from "@/types/types";
import { COLORS } from "@/constants/data";

/**
 * Bar chart for displaying traffic sources/referrers
 */
const TrafficSourcesChart = ({ data }: { data: ReferrerStats[] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center bg-secondary/10 rounded-md">
        <p className="text-muted-foreground">No referrer data available yet</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" name="Clicks" fill="#8884d8">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TrafficSourcesChart;
