import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import { type DeviceStats } from "@/types/types";
import { COLORS } from "@/constants/data";

/**
 * Pie chart for displaying device breakdown
 */
const DeviceBreakdownChart = ({ data }: { data: DeviceStats[] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center bg-secondary/10 rounded-md">
        <p className="text-muted-foreground">No device data available yet</p>
      </div>
    );
  }

  const mobileValue = data.find((item) => item.name === "Mobile")?.value || 0;
  const desktopValue = data.find((item) => item.name === "Desktop")?.value || 0;
  const tabletValue = data.find((item) => item.name === "Tablet")?.value || 0;

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 grid grid-cols-3 gap-4 w-full">
        <div className="flex flex-col items-center">
          <div className="rounded-full bg-[#0088FE] p-2 mb-2">
            <Smartphone className="h-5 w-5 text-white" />
          </div>
          <p className="text-sm font-medium">Mobile</p>
          <p className="text-lg font-semibold">{mobileValue}</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="rounded-full bg-[#00C49F] p-2 mb-2">
            <Monitor className="h-5 w-5 text-white" />
          </div>
          <p className="text-sm font-medium">Desktop</p>
          <p className="text-lg font-semibold">{desktopValue}</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="rounded-full bg-[#FFBB28] p-2 mb-2">
            <Tablet className="h-5 w-5 text-white" />
          </div>
          <p className="text-sm font-medium">Tablet</p>
          <p className="text-lg font-semibold">{tabletValue}</p>
        </div>
      </div>
    </div>
  );
};

export default DeviceBreakdownChart;
