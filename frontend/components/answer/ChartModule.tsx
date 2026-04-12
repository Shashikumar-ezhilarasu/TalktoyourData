"use client";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion } from "framer-motion";

interface ChartModuleProps {
  type: "bar" | "line" | "pie" | "comparison";
  data: {
    labels: string[];
    values: number[];
    secondaryValues?: number[];
  };
}

const COLORS = [
  "#3B82F6",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#A855F7",
  "#06B6D4",
];

export const ChartModule: React.FC<ChartModuleProps> = ({ type, data }) => {
  const chartData = data.labels.map((l, i) => ({
    name: l,
    value: Number(data.values[i] ?? 0),
    secondaryValue: Number(data.secondaryValues?.[i] ?? 0),
  }));

  const renderTooltip = (props: any) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
      return (
        <div className="bg-bg-base border border-bg-border p-3 shadow-xl rounded-sm">
          <p className="mono text-[9px] uppercase font-bold text-text-tertiary mb-1">
            {payload[0].payload.name}
          </p>
          <p className="text-sm font-black italic text-accent-main">
            {payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  const css =
    typeof window !== "undefined"
      ? getComputedStyle(document.documentElement)
      : null;
  const gridColor = css?.getPropertyValue("--bg-border")?.trim() || "#E5E7EB";
  const tickColor =
    css?.getPropertyValue("--text-tertiary")?.trim() || "#9CA3AF";
  const surfaceColor = css?.getPropertyValue("--bg-base")?.trim() || "#FFFFFF";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className="h-[280px] w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        {type === "pie" ? (
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
              animationBegin={0}
              animationDuration={1500}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={renderTooltip} />
          </PieChart>
        ) : type === "comparison" ? (
          <BarChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={gridColor}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 9 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 9 }}
            />
            <Tooltip content={renderTooltip} cursor={{ fill: surfaceColor }} />
            <Bar
              dataKey="value"
              radius={[3, 3, 0, 0]}
              barSize={20}
              fill="#2563EB"
              name="Current"
              animationDuration={1200}
            />
            <Bar
              dataKey="secondaryValue"
              radius={[3, 3, 0, 0]}
              barSize={20}
              fill="#F59E0B"
              name="Baseline"
              animationDuration={1400}
            />
          </BarChart>
        ) : type === "line" ? (
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 9 }}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 9 }}
              tickFormatter={(val) =>
                val > 1000 ? `${(val / 1000).toFixed(1)}k` : val
              }
            />
            <Tooltip content={renderTooltip} cursor={{ stroke: gridColor }} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#2563EB"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorVal)"
              animationDuration={2000}
            />
          </AreaChart>
        ) : (
          <BarChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={gridColor}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 9 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 9 }}
            />
            <Tooltip content={renderTooltip} cursor={{ fill: surfaceColor }} />
            <Bar
              dataKey="value"
              radius={[2, 2, 0, 0]}
              barSize={32}
              animationDuration={1500}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`bar-cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </motion.div>
  );
};
