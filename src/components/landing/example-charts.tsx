"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { modelUsageData, dailyCostData } from "@/components/charts/mock-data";

function ModelUsageChart() {
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-zinc-50 mb-4">Model Usage</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={modelUsageData} layout="vertical">
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#3f3f46"
              horizontal={true}
              vertical={false}
            />
            <XAxis type="number" stroke="#a1a1aa" fontSize={12} />
            <YAxis
              type="category"
              dataKey="model"
              stroke="#a1a1aa"
              fontSize={11}
              width={110}
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
              animationDuration={1500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function DailyCostChart() {
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-zinc-50 mb-4">Daily Cost</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dailyCostData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
            <XAxis
              dataKey="day"
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
              tickFormatter={(value) => `$${value}`}
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

export function ExampleCharts() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-16 px-4 bg-zinc-950">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-serif text-3xl sm:text-4xl text-zinc-50 text-center mb-4">
          See Your Usage at a Glance
        </h2>
        <p className="text-zinc-400 text-center mb-16 max-w-2xl mx-auto">
          Interactive charts that help you understand your AI usage patterns
        </p>

        <motion.div
          ref={ref}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <ModelUsageChart />
          <DailyCostChart />
        </motion.div>
      </div>
    </section>
  );
}
