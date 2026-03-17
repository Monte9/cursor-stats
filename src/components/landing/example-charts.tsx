"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const tooltipStyle = {
  contentStyle: {
    background: "#18181b",
    border: "1px solid #3f3f46",
    borderRadius: "8px",
  },
  labelStyle: { color: "#fafafa" },
  itemStyle: { color: "#f97316" },
};

// Mock data matching the demo dataset patterns
const modelUsageData = [
  { model: "claude-4.6-opus", requests: 412 },
  { model: "gpt-5.4-medium", requests: 67 },
  { model: "claude-4.6-sonnet", requests: 43 },
  { model: "composer-1.5", requests: 38 },
  { model: "auto", requests: 14 },
];

const hourlyUsageData = [
  { label: "6am", requests: 28 },
  { label: "7am", requests: 52 },
  { label: "8am", requests: 89 },
  { label: "9am", requests: 43 },
  { label: "10am", requests: 12 },
  { label: "11am", requests: 8 },
  { label: "12pm", requests: 15 },
  { label: "1pm", requests: 24 },
  { label: "2pm", requests: 18 },
  { label: "3pm", requests: 35 },
  { label: "4pm", requests: 48 },
  { label: "5pm", requests: 62 },
  { label: "6pm", requests: 74 },
  { label: "7pm", requests: 56 },
  { label: "8pm", requests: 81 },
  { label: "9pm", requests: 67 },
  { label: "10pm", requests: 42 },
  { label: "11pm", requests: 28 },
];

function ModelUsageChart() {
  return (
    <div className="bg-zinc-900 border border-zinc-600 rounded-xl p-6 shadow-lg shadow-black/20">
      <h3 className="text-lg font-semibold text-zinc-50 mb-4">
        Model Breakdown
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={modelUsageData} layout="vertical">
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
              width={120}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              {...tooltipStyle}
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

function HourlyUsageChart() {
  return (
    <div className="bg-zinc-900 border border-zinc-600 rounded-xl p-6 shadow-lg shadow-black/20">
      <h3 className="text-lg font-semibold text-zinc-50 mb-1">
        Usage by Hour
      </h3>
      <p className="text-zinc-500 text-xs mb-4">When you typically code</p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={hourlyUsageData}>
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
              {...tooltipStyle}
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

export function ExampleCharts() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-16 px-4 bg-zinc-950">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-serif text-3xl sm:text-4xl text-zinc-50 text-center mb-4">
          See Your Usage at a Glance
        </h2>
        <p className="text-zinc-400 text-center mb-12 max-w-2xl mx-auto">
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
          <HourlyUsageChart />
        </motion.div>

        {/* CTA to full demo */}
        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 px-8 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 text-zinc-50 font-medium rounded-xl transition-all duration-200"
          >
            See full demo
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <p className="mt-3 text-zinc-500 text-sm">
            Explore all 5 charts with real sample data
          </p>
        </motion.div>
      </div>
    </section>
  );
}
