"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { heroChartData } from "@/components/charts/mock-data";

export function HeroChart() {
  return (
    <div className="h-64 w-full max-w-2xl mx-auto mt-12">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={heroChartData}>
          <defs>
            <linearGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="month"
            stroke="#a1a1aa"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#a1a1aa"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            contentStyle={{
              background: "#18181b",
              border: "1px solid #3f3f46",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#fafafa" }}
            itemStyle={{ color: "#f97316" }}
          />
          <Area
            type="monotone"
            dataKey="usage"
            stroke="#f97316"
            strokeWidth={2}
            fill="url(#heroGradient)"
            animationDuration={2000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
