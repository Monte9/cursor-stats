"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatTokens } from "@/lib/format";

interface Props {
  data: {
    cacheRead: number;
    inputExclCache: number;
    output: number;
  };
}

const SEGMENTS = [
  { key: "Cache Read", color: "#f97316" },
  { key: "Input (excl. cache)", color: "#fb923c" },
  { key: "Output", color: "#71717a" },
];

export function TokenBreakdownChart({ data }: Props) {
  const chartData = [
    { name: "Cache Read", value: data.cacheRead },
    { name: "Input (excl. cache)", value: data.inputExclCache },
    { name: "Output", value: data.output },
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-600 rounded-xl p-6 shadow-lg shadow-black/20">
      <h3 className="text-lg font-semibold text-zinc-50 mb-4">
        Token Breakdown
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              dataKey="value"
              animationDuration={1500}
            >
              {SEGMENTS.map((seg, index) => (
                <Cell key={`cell-${index}`} fill={seg.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#fafafa" }}
              formatter={(value, name) => [
                formatTokens(Number(value)),
                String(name),
              ]}
            />
            <Legend
              wrapperStyle={{ fontSize: "12px", color: "#a1a1aa" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
