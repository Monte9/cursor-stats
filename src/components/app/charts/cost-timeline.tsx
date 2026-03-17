"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { formatHour } from "@/lib/format";

interface DayData {
  date: string;
  cost: number;
}

interface HourData {
  hour: number;
  cost: number;
}

interface Props {
  byDay: DayData[];
  byHourInDay?: HourData[];
}

export function CostTimelineChart({ byDay, byHourInDay }: Props) {
  const isSingleDay = !!byHourInDay;
  const data = isSingleDay
    ? byHourInDay.filter((d) => d.cost > 0).map((d) => ({
        label: formatHour(d.hour),
        cost: Number(d.cost.toFixed(2)),
      }))
    : byDay.map((d) => ({
        label: d.date,
        cost: Number(d.cost.toFixed(2)),
      }));

  return (
    <div className="bg-zinc-900 border border-zinc-600 rounded-xl p-6 shadow-lg shadow-black/20">
      <h3 className="text-lg font-semibold text-zinc-50 mb-4">
        Cost Over Time
        <span className="text-zinc-500 text-sm font-normal ml-2">
          {isSingleDay ? "(by hour)" : "(by day)"}
        </span>
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
            <XAxis
              dataKey="label"
              stroke="#71717a"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#71717a"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              contentStyle={{
                background: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#fafafa" }}
              itemStyle={{ color: "#f97316" }}
              formatter={(value) => [`$${value}`, "Cost"]}
            />
            <Line
              type="monotone"
              dataKey="cost"
              stroke="#f97316"
              strokeWidth={2}
              dot={{ fill: "#f97316", strokeWidth: 0, r: 4 }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
