"use client";

import { useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { CursorUsageRow } from "@/lib/csv-parser";
import { computeStats } from "@/lib/stats";
import { formatCost, formatTokens, formatNumber, formatHour, formatPercent } from "@/lib/format";
import { ChartCard } from "./chart-card";
import { PromptInput } from "./prompt-input";
import { DynamicChart } from "./dynamic-chart";
import { ChartSpec, SerializedSummary } from "@/lib/types";
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

interface DashboardProps {
  data: CursorUsageRow[];
  warnings: string[];
  skippedRows: number;
  isDemo: boolean;
  onReset: () => void;
  fileName?: string;
}

function formatDateLong(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// Add ordinal suffix (1st, 2nd, 3rd, etc)
function formatDateOrdinal(date: Date): string {
  const month = date.toLocaleDateString("en-US", { month: "long" });
  const day = date.getDate();
  const year = date.getFullYear();
  const suffix = day === 1 || day === 21 || day === 31 ? "st"
    : day === 2 || day === 22 ? "nd"
    : day === 3 || day === 23 ? "rd"
    : "th";
  return `${month} ${day}${suffix}, ${year}`;
}

export function Dashboard({
  data,
  warnings,
  skippedRows,
  isDemo,
  onReset,
  fileName,
}: DashboardProps) {
  const stats = useMemo(() => computeStats(data), [data]);
  const [showWarnings, setShowWarnings] = useState(false);
  const [generatedChart, setGeneratedChart] = useState<{
    prompt: string;
    spec: ChartSpec;
  } | null>(null);
  const [isPromptLoading, setIsPromptLoading] = useState(false);
  const [promptError, setPromptError] = useState<string | null>(null);

  const monthlyProjection = stats.totalCost * (30 / Math.max(1, stats.byDay.length));

  // Serialize summary for API (inline — just convert Dates to strings)
  const serializedSummary = useMemo((): SerializedSummary => ({
    totalRequests: stats.totalRequests,
    totalCost: stats.totalCost,
    totalTokens: stats.totalTokens,
    dateRange: {
      start: stats.dateRange.start.toISOString(),
      end: stats.dateRange.end.toISOString(),
    },
    uniqueModels: stats.uniqueModels,
    byModel: stats.byModel,
    byDay: stats.byDay,
    byHour: stats.byHour,
    byDayOfWeek: stats.byDayOfWeek,
    byKind: stats.byKind,
    cacheHitRate: stats.cacheHitRate,
    errorRate: stats.errorRate,
    avgCostPerRequest: stats.avgCostPerRequest,
    mostExpensiveRequest: stats.mostExpensiveRequest
      ? {
          ...stats.mostExpensiveRequest,
          date: stats.mostExpensiveRequest.date.toISOString(),
        }
      : null,
    longestCodingStreak: stats.longestCodingStreak,
    busiestDay: stats.busiestDay,
  }), [stats]);

  const handlePromptSubmit = useCallback(async (prompt: string) => {
    setIsPromptLoading(true);
    setPromptError(null);

    try {
      const res = await fetch("/api/chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, summary: serializedSummary }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to generate chart.");
      }

      const spec = (await res.json()) as ChartSpec;
      setGeneratedChart({ prompt, spec });
    } catch (err) {
      setPromptError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setIsPromptLoading(false);
    }
  }, [serializedSummary]);

  return (
    <motion.div
      className="min-h-screen bg-zinc-950 px-4 py-8 pb-20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-6xl mx-auto pt-14">
        {/* Demo banner */}
        {isDemo && (
          <div className="mb-6 px-4 py-3 bg-orange-500/10 border border-orange-500/30 rounded-lg text-center">
            <span className="text-orange-400 text-sm">
              Viewing demo data —{" "}
              <button
                onClick={onReset}
                className="underline hover:text-orange-300"
              >
                Upload your own CSV
              </button>
            </span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-3xl sm:text-4xl text-zinc-50">
                Your Dashboard
              </h1>
              {/* Warning indicator */}
              {warnings.length > 0 && (
                <button
                  onClick={() => setShowWarnings((p) => !p)}
                  className="flex items-center justify-center w-7 h-7 rounded-full bg-orange-500/10 hover:bg-orange-500/20 transition-colors"
                >
                  <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </button>
              )}
            </div>
            <p className="text-zinc-400 text-sm mt-1">
              {formatDateOrdinal(stats.dateRange.start)} to {formatDateOrdinal(stats.dateRange.end)}
            </p>
            {/* File reference + upload new */}
            {!isDemo && (
              <div className="flex items-center gap-2 mt-1">
                {fileName && (
                  <span className="text-zinc-600 text-xs font-mono">
                    📄 {fileName}
                  </span>
                )}
                <span className="text-zinc-700 text-xs">·</span>
                <button
                  onClick={onReset}
                  className="text-orange-500/70 hover:text-orange-400 text-xs transition-colors"
                >
                  change file
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Warning toast */}
        {showWarnings && warnings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 px-4 py-3 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-start justify-between"
          >
            <div>
              {warnings.map((w, i) => (
                <p key={i} className="text-orange-300/80 text-sm">
                  {w}
                </p>
              ))}
            </div>
            <button
              onClick={() => setShowWarnings(false)}
              className="text-orange-400/50 hover:text-orange-400 ml-4 text-lg leading-none"
            >
              ×
            </button>
          </motion.div>
        )}

        {/* Prompt input */}
        <PromptInput
          onSubmit={handlePromptSubmit}
          isLoading={isPromptLoading}
          error={promptError}
        />

        {/* Generated chart (single slot) */}
        {generatedChart && (
          <DynamicChart
            prompt={generatedChart.prompt}
            spec={generatedChart.spec}
            stats={stats}
            onDismiss={() => setGeneratedChart(null)}
          />
        )}

        {/* Loading skeleton */}
        {isPromptLoading && (
          <div className="mb-6">
            <div className="bg-zinc-900/80 border border-zinc-700/50 rounded-2xl p-6 animate-pulse">
              <div className="h-4 bg-zinc-800 rounded w-1/3 mx-auto mb-4" />
              <div className="h-48 bg-zinc-800/50 rounded" />
            </div>
          </div>
        )}

        {/* Static cards grid */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Row 1: AI Usage + Cost Over Time */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 1: Your AI Usage — cost + model breakdown */}
            <ChartCard>
              <div className="text-center mb-6">
                <p className="text-zinc-400 text-sm">Your AI Usage</p>
                <p className="mt-1">
                  <span className="text-4xl font-bold text-orange-500">
                    {formatCost(stats.totalCost)}
                  </span>
                  <span className="text-zinc-400 ml-2 text-sm">
                    across {formatNumber(stats.totalRequests)} requests
                  </span>
                </p>
                <p className="text-zinc-500 text-xs mt-1">
                  ~{formatCost(monthlyProjection)}/mo projected
                </p>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.byModel.slice(0, 6)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" horizontal={false} vertical={true} />
                    <XAxis type="number" stroke="#71717a" fontSize={11} tickFormatter={(v) => `$${v}`} />
                    <YAxis type="category" dataKey="model" stroke="#a1a1aa" fontSize={11} width={180} tickLine={false} axisLine={false} />
                    <Tooltip
                      {...tooltipStyle}
                      cursor={{ fill: "rgba(249, 115, 22, 0.08)" }}
                      formatter={(value) => [`$${Number(value).toFixed(2)}`, "Cost"]}
                    />
                    <Bar dataKey="cost" fill="#f97316" radius={[0, 4, 4, 0]} animationDuration={1500} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Card 2: Cost Over Time — date range + daily bars */}
            <ChartCard>
              <div className="text-center mb-6">
                <p className="text-zinc-400 text-sm">Cost Over Time</p>
                <p className="mt-1">
                  <span className="text-4xl font-bold text-zinc-50">
                    {stats.byDay.length}
                  </span>
                  <span className="text-zinc-400 ml-2 text-sm">
                    active days
                  </span>
                </p>
                <p className="text-zinc-500 text-xs mt-1">
                  {formatCost(stats.totalCost / Math.max(1, stats.byDay.length))}/day avg
                </p>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.byDay.map(d => ({ ...d, cost: Number(d.cost.toFixed(2)) }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                    <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip {...tooltipStyle} formatter={(value) => [`$${value}`, "Cost"]} cursor={{ fill: "rgba(249, 115, 22, 0.08)" }} />
                    <Bar dataKey="cost" fill="#f97316" radius={[4, 4, 0, 0]} animationDuration={1500} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          {/* Row 2: When You Code + Token Efficiency */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 3: When You Code — peak hour + hourly bars */}
            <ChartCard>
              <div className="text-center mb-6">
                <p className="text-zinc-400 text-sm">When You Code</p>
                <p className="mt-1">
                  <span className="text-4xl font-bold text-zinc-50">
                    {formatHour(stats.peakHour)}
                  </span>
                  <span className="text-zinc-400 ml-2 text-sm">
                    peak hour
                  </span>
                </p>
                <p className="text-zinc-500 text-xs mt-1">
                  Aggregated across {stats.byDay.length} days
                </p>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.byHour.filter(h => h.requests > 0).map(h => ({ label: formatHour(h.hour), requests: h.requests }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                    <XAxis dataKey="label" stroke="#71717a" fontSize={9} tickLine={false} axisLine={false} />
                    <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip {...tooltipStyle} cursor={{ fill: "rgba(249, 115, 22, 0.08)" }} />
                    <Bar dataKey="requests" fill="#f97316" radius={[4, 4, 0, 0]} animationDuration={1500} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Card 4: Cost per Model — avg $/request efficiency */}
            <ChartCard>
              <div className="text-center mb-6">
                <p className="text-zinc-400 text-sm">Cost per Request</p>
                <p className="mt-1">
                  <span className="text-4xl font-bold text-zinc-50">
                    {formatCost(stats.avgCostPerRequest)}
                  </span>
                  <span className="text-zinc-400 ml-2 text-sm">
                    avg across all models
                  </span>
                </p>
                <p className="text-zinc-500 text-xs mt-1">
                  {formatPercent(stats.cacheHitRate)} cache hit rate · {formatTokens(stats.totalTokens)} tokens
                </p>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.byModel.filter(m => m.avgCostPerReq > 0).slice(0, 6)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" horizontal={false} vertical={true} />
                    <XAxis type="number" stroke="#71717a" fontSize={11} tickFormatter={(v) => `$${v}`} />
                    <YAxis type="category" dataKey="model" stroke="#a1a1aa" fontSize={11} width={180} tickLine={false} axisLine={false} />
                    <Tooltip
                      {...tooltipStyle}
                      cursor={{ fill: "rgba(249, 115, 22, 0.08)" }}
                      formatter={(value) => [`$${Number(value).toFixed(2)}/req`, "Avg Cost"]}
                    />
                    <Bar dataKey="avgCostPerReq" fill="#fb923c" radius={[0, 4, 4, 0]} animationDuration={1500} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          {/* Row 3: Fun Stats — 3 horizontal cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Most Expensive Request */}
            {stats.mostExpensiveRequest && (
              <ChartCard>
                <div className="text-center py-4">
                  <p className="text-zinc-400 text-sm">Priciest Request</p>
                  <p className="mt-2">
                    <span className="text-4xl font-bold text-orange-500">
                      {formatCost(stats.mostExpensiveRequest.cost)}
                    </span>
                  </p>
                  <p className="text-zinc-500 text-xs mt-2">
                    {stats.mostExpensiveRequest.model}
                  </p>
                  <p className="text-zinc-600 text-xs mt-0.5">
                    {stats.mostExpensiveRequest.date.toLocaleDateString()}
                  </p>
                </div>
              </ChartCard>
            )}

            {/* Longest Coding Streak */}
            <ChartCard>
              <div className="text-center py-4">
                <p className="text-zinc-400 text-sm">Longest Coding Streak</p>
                <p className="mt-2">
                  <span className="text-4xl font-bold text-zinc-50">
                    {stats.longestCodingStreak}h
                  </span>
                </p>
                <p className="text-zinc-500 text-xs mt-2">
                  consecutive hours
                </p>
                <p className="text-zinc-600 text-xs mt-0.5">
                  without a break
                </p>
              </div>
            </ChartCard>

            {/* Busiest Day */}
            {stats.busiestDay && (
              <ChartCard>
                <div className="text-center py-4">
                  <p className="text-zinc-400 text-sm">Busiest Day</p>
                  <p className="mt-2">
                    <span className="text-4xl font-bold text-zinc-50">
                      {formatNumber(stats.busiestDay.requests)}
                    </span>
                  </p>
                  <p className="text-zinc-500 text-xs mt-2">
                    requests in one day
                  </p>
                  <p className="text-zinc-600 text-xs mt-0.5">
                    {stats.busiestDay.date}
                  </p>
                </div>
              </ChartCard>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
