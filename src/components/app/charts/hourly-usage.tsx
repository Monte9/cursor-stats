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
import { formatHour } from "@/lib/format";

interface Props {
  data: { hour: number; requests: number }[];
}

export function HourlyUsageChart({ data }: Props) {
  const chartData = data.map((d) => ({
    label: formatHour(d.hour),
    requests: d.requests,
  }));

  return (
    <div className="bg-zinc-900 border border-zinc-600 rounded-xl p-6 shadow-lg shadow-black/20">
      <h3 className="text-lg font-semibold text-zinc-50 mb-4">
        Usage by Hour
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#3f3f46"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              stroke="#71717a"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#71717a"
              fontSize={12}
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
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
