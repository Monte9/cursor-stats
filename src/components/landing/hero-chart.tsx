"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const heroPreviewData = [
  { model: "claude-4.6-opus", requests: 1247, cost: 68.17 },
  { model: "gpt-5.4-medium", requests: 892, cost: 28.23 },
  { model: "claude-4.6-sonnet", requests: 634, cost: 24.69 },
  { model: "composer-1.5", requests: 423, cost: 2.70 },
];

export function HeroChart() {
  return (
    <div className="h-auto w-full max-w-3xl mx-auto mt-12">
      <div className="bg-zinc-900/50 backdrop-blur-lg border border-zinc-700/50 rounded-2xl p-6 shadow-2xl shadow-black/30">
        {/* Fake window header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-zinc-700" />
            <div className="w-3 h-3 rounded-full bg-zinc-700" />
            <div className="w-3 h-3 rounded-full bg-zinc-700" />
          </div>
          <span className="text-zinc-500 text-xs font-mono">
            cursorstats.com
          </span>
        </div>

        {/* Card title */}
        <h3 className="text-sm font-medium text-zinc-400 mb-1">
          Your AI Usage This Week
        </h3>
        <p className="text-2xl font-semibold text-zinc-50 mb-4">
          $123.79{" "}
          <span className="text-sm font-normal text-zinc-500">
            across 157 requests
          </span>
        </p>

        {/* Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={heroPreviewData} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#3f3f46"
                horizontal={false}
                vertical={true}
              />
              <XAxis
                type="number"
                stroke="#71717a"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="model"
                stroke="#a1a1aa"
                fontSize={11}
                width={120}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#fafafa" }}
                itemStyle={{ color: "#f97316" }}
                cursor={{ fill: "rgba(249, 115, 22, 0.08)" }}
              />
              <Bar
                dataKey="requests"
                fill="#f97316"
                radius={[0, 4, 4, 0]}
                animationDuration={2000}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
