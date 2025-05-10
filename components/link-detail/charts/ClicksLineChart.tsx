import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { type DailyClicks } from "@/types/types";

/**
 * Line chart for displaying click trends over time
 */
const ClicksLineChart = ({
  data,
  height = 300,
  showLegend = true,
}: {
  data: DailyClicks[];
  height?: number;
  showLegend?: boolean;
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center bg-secondary/10 rounded-md">
        <p className="text-muted-foreground">No click data available yet</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        {showLegend && <Legend />}
        <Line
          type="monotone"
          dataKey="clicks"
          name="Clicks"
          stroke="#8884d8"
          strokeWidth={2}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ClicksLineChart;
