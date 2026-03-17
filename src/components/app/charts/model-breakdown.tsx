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

interface Props {
  data: { model: string; requests: number; cost: number }[];
}

export function ModelBreakdownChart({ data }: Props) {
  return (
    <div className="bg-zinc-900 border border-zinc-600 rounded-xl p-6 shadow-lg shadow-black/20">
      <h3 className="text-lg font-semibold text-zinc-50 mb-4">
        Model Breakdown
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#3f3f46"
              horizontal={false}
              vertical={true}
            />
            <XAxis type="number" stroke="#71717a" fontSize={12} />
            <YAxis
              type="category"
              dataKey="model"
              stroke="#a1a1aa"
              fontSize={11}
              width={210}
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
              formatter={(value, name) => {
                if (name === "cost") return [`$${Number(value).toFixed(2)}`, "Cost"];
                return [value, "Requests"];
              }}
            />
            <Bar
              dataKey="requests"
              fill="#f97316"
              radius={[0, 4, 4, 0]}
              animationDuration={1500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
