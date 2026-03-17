"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
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

export function TokenBreakdownChart({ data }: Props) {
  const chartData = [
    {
      name: "Tokens",
      "Cache Read": data.cacheRead,
      "Input (excl. cache)": data.inputExclCache,
      Output: data.output,
    },
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-600 rounded-xl p-6 shadow-lg shadow-black/20">
      <h3 className="text-lg font-semibold text-zinc-50 mb-4">
        Token Breakdown
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <XAxis
              type="number"
              stroke="#71717a"
              fontSize={11}
              tickFormatter={(v) => formatTokens(v)}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#71717a"
              fontSize={12}
              hide
            />
            <Tooltip
              contentStyle={{
                background: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#fafafa" }}
              formatter={(value) => [formatTokens(Number(value)), undefined]}
            />
            <Legend
              wrapperStyle={{ fontSize: "12px", color: "#a1a1aa" }}
            />
            <Bar
              dataKey="Cache Read"
              stackId="tokens"
              fill="#f97316"
              animationDuration={1500}
            />
            <Bar
              dataKey="Input (excl. cache)"
              stackId="tokens"
              fill="#fb923c"
              animationDuration={1500}
            />
            <Bar
              dataKey="Output"
              stackId="tokens"
              fill="#71717a"
              radius={[0, 4, 4, 0]}
              animationDuration={1500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
