"use client";

import { motion } from "framer-motion";
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
import { ChartSpec } from "@/lib/types";
import { UsageSummary } from "@/lib/stats";
import {
  formatCost,
  formatTokens,
  formatNumber,
  formatPercent,
  formatHour,
} from "@/lib/format";
import { ChartCard } from "./chart-card";

const tooltipStyle = {
  contentStyle: {
    background: "#18181b",
    border: "1px solid #3f3f46",
    borderRadius: "8px",
  },
  labelStyle: { color: "#fafafa" },
  itemStyle: { color: "#f97316" },
};

interface DynamicChartProps {
  prompt: string;
  spec: ChartSpec;
  stats: UsageSummary;
  onDismiss: () => void;
}

// Format a stat value based on its key
function formatStatValue(key: string, value: number): string {
  if (key === "totalCost" || key === "avgCostPerRequest") return formatCost(value);
  if (key === "cacheHitRate" || key === "errorRate") return formatPercent(value);
  if (key === "totalTokens") return formatTokens(value);
  return formatNumber(value);
}

// Format Y axis tick based on yLabel hint
function yTickFormatter(yLabel?: string) {
  if (yLabel === "$") return (v: number) => `$${v}`;
  if (yLabel === "tokens") return (v: number) => formatTokens(v);
  return (v: number) => String(v);
}

// Format tooltip value based on yLabel hint
function tooltipFormatter(yLabel?: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (value: any) => {
    const v = Number(value);
    if (yLabel === "$") return [`$${v.toFixed(2)}`, ""];
    if (yLabel === "tokens") return [formatTokens(v), ""];
    return [formatNumber(v), ""];
  };
}

// Format X values (e.g. hours)
function formatXValue(
  data: Record<string, unknown>[],
  xKey: string
): Record<string, unknown>[] {
  if (xKey === "hour") {
    return data.map((d) => ({
      ...d,
      hour: formatHour(d.hour as number),
    }));
  }
  return data;
}

// Resolve dataSource from UsageSummary
function resolveData(
  dataSource: string,
  stats: UsageSummary
): Record<string, unknown>[] | null {
  const map: Record<string, unknown[]> = {
    byModel: stats.byModel,
    byDay: stats.byDay,
    byHour: stats.byHour,
    byDayOfWeek: stats.byDayOfWeek,
    byKind: stats.byKind,
  };
  return (map[dataSource] as Record<string, unknown>[]) || null;
}

export function DynamicChart({
  prompt,
  spec,
  stats,
  onDismiss,
}: DynamicChartProps) {
  // Stat type — resolve real value from stats
  if (spec.chartType === "stat") {
    const statKey = spec.statKey;

    // Off-topic / no statKey — show insight only, no number
    if (!statKey || !(statKey in stats)) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-zinc-500 text-sm italic">&ldquo;{prompt}&rdquo;</p>
            <button onClick={onDismiss} className="text-zinc-600 hover:text-zinc-400 text-lg leading-none">✕</button>
          </div>
          <ChartCard>
            <div className="text-center py-6">
              <p className="text-zinc-400 text-sm">{spec.title || "Hmm..."}</p>
              {spec.insight && (
                <p className="text-zinc-400 text-sm mt-3">{spec.insight}</p>
              )}
            </div>
          </ChartCard>
        </motion.div>
      );
    }

    const rawValue = stats[statKey as keyof UsageSummary] as number;
    const formattedValue = formatStatValue(statKey, rawValue);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-zinc-500 text-sm italic">&ldquo;{prompt}&rdquo;</p>
          <button
            onClick={onDismiss}
            className="text-zinc-600 hover:text-zinc-400 text-lg leading-none"
          >
            ✕
          </button>
        </div>
        <ChartCard>
          <div className="text-center py-6">
            <p className="text-zinc-400 text-sm">{spec.title}</p>
            <p className="mt-2">
              <span className="text-5xl font-bold text-orange-500">
                {formattedValue}
              </span>
            </p>
            {spec.insight && (
              <p className="text-zinc-400 text-sm mt-3">{spec.insight}</p>
            )}
          </div>
        </ChartCard>
      </motion.div>
    );
  }

  // Chart types — guard required fields
  if (!spec.dataSource || !spec.xKey || !spec.yKey) {
    return (
      <ErrorCard
        prompt={prompt}
        onDismiss={onDismiss}
        message="Couldn't generate that chart. Try a different question."
      />
    );
  }

  // Resolve data
  let data = resolveData(spec.dataSource, stats);
  if (!data || data.length === 0) {
    return (
      <ErrorCard
        prompt={prompt}
        onDismiss={onDismiss}
        message="No data available for that query."
      />
    );
  }

  // Sort if specified
  if (spec.sortBy) {
    const key = spec.sortBy;
    data = [...data].sort(
      (a, b) => (Number(b[key]) || 0) - (Number(a[key]) || 0)
    );
  }

  // Limit if specified
  if (spec.limit && spec.limit > 0) {
    data = data.slice(0, spec.limit);
  }

  // Format x values
  data = formatXValue(data, spec.xKey);

  const yFmt = yTickFormatter(spec.yLabel);
  const tFmt = tooltipFormatter(spec.yLabel);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-zinc-500 text-sm italic">&ldquo;{prompt}&rdquo;</p>
        <button
          onClick={onDismiss}
          className="text-zinc-600 hover:text-zinc-400 text-lg leading-none"
        >
          ✕
        </button>
      </div>
      <ChartCard>
        <div className="text-center mb-4">
          <p className="text-lg font-semibold text-zinc-50">{spec.title}</p>
          {spec.subtitle && (
            <p className="text-zinc-400 text-sm mt-1">{spec.subtitle}</p>
          )}
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {spec.chartType === "horizontalBar" ? (
              <BarChart data={data} layout="vertical">
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
                  tickFormatter={yFmt}
                />
                <YAxis
                  type="category"
                  dataKey={spec.xKey}
                  stroke="#a1a1aa"
                  fontSize={11}
                  width={180}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  {...tooltipStyle}
                  cursor={{ fill: "rgba(249, 115, 22, 0.08)" }}
                  formatter={tFmt}
                />
                <Bar
                  dataKey={spec.yKey}
                  fill={"#f97316"}
                  radius={[0, 4, 4, 0]}
                  animationDuration={1500}
                />
              </BarChart>
            ) : spec.chartType === "line" ? (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis
                  dataKey={spec.xKey}
                  stroke="#71717a"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={yFmt}
                />
                <Tooltip {...tooltipStyle} formatter={tFmt} />
                <Line
                  type="monotone"
                  dataKey={spec.yKey}
                  stroke={"#f97316"}
                  strokeWidth={2}
                  dot={{
                    fill: "#f97316",
                    strokeWidth: 0,
                    r: 4,
                  }}
                  animationDuration={1500}
                />
              </LineChart>
            ) : (
              // Default: vertical bar chart
              <BarChart data={data}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#3f3f46"
                  vertical={false}
                />
                <XAxis
                  dataKey={spec.xKey}
                  stroke="#71717a"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={yFmt}
                />
                <Tooltip
                  {...tooltipStyle}
                  cursor={{ fill: "rgba(249, 115, 22, 0.08)" }}
                  formatter={tFmt}
                />
                <Bar
                  dataKey={spec.yKey}
                  fill={"#f97316"}
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
        {spec.insight && (
          <p className="text-zinc-400 text-sm text-center mt-4">
            {spec.insight}
          </p>
        )}
      </ChartCard>
    </motion.div>
  );
}

function ErrorCard({
  prompt,
  onDismiss,
  message,
}: {
  prompt: string;
  onDismiss: () => void;
  message: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-zinc-500 text-sm italic">&ldquo;{prompt}&rdquo;</p>
        <button
          onClick={onDismiss}
          className="text-zinc-600 hover:text-zinc-400 text-lg leading-none"
        >
          ✕
        </button>
      </div>
      <div className="bg-zinc-900/80 border border-zinc-700/50 rounded-2xl p-6 text-center">
        <p className="text-zinc-400 text-sm">{message}</p>
      </div>
    </motion.div>
  );
}
