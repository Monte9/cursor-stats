"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { CursorUsageRow } from "@/lib/csv-parser";
import { computeStats } from "@/lib/stats";
import { formatCost, formatTokens, formatNumber } from "@/lib/format";
import { StatCard } from "./stat-card";
import { ModelBreakdownChart } from "./charts/model-breakdown";
import { CostTimelineChart } from "./charts/cost-timeline";
import { HourlyUsageChart } from "./charts/hourly-usage";
import { TokenBreakdownChart } from "./charts/token-breakdown";
import { DayOfWeekChart } from "./charts/day-of-week";

interface DashboardProps {
  data: CursorUsageRow[];
  warnings: string[];
  skippedRows: number;
  isDemo: boolean;
  onReset: () => void;
}

export function Dashboard({
  data,
  warnings,
  skippedRows,
  isDemo,
  onReset,
}: DashboardProps) {
  const stats = useMemo(() => computeStats(data), [data]);

  const dateRangeStr = `${stats.dateRange.start.toLocaleDateString()} — ${stats.dateRange.end.toLocaleDateString()}`;

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl text-zinc-50">
              Your Usage
            </h1>
            <p className="text-zinc-400 text-sm mt-1">{dateRangeStr}</p>
          </div>
          {!isDemo && (
            <button
              onClick={onReset}
              className="mt-4 sm:mt-0 text-zinc-400 hover:text-zinc-50 text-sm transition-colors"
            >
              ← Upload new file
            </button>
          )}
        </div>

        {/* Warnings */}
        {(warnings.length > 0 || skippedRows > 0) && (
          <div className="mb-6 px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg">
            {warnings.map((w, i) => (
              <p key={i} className="text-zinc-400 text-sm">
                ⚠️ {w}
              </p>
            ))}
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Cost"
            value={formatCost(stats.totalCost)}
            accent
          />
          <StatCard
            label="Total Requests"
            value={formatNumber(stats.totalRequests)}
          />
          <StatCard
            label="Total Tokens"
            value={formatTokens(stats.totalTokens)}
          />
          <StatCard
            label="Session Duration"
            value={stats.dateRangeDuration}
          />
        </div>

        {/* Charts */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Row 1: Model + Cost */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ModelBreakdownChart data={stats.byModel} />
            <CostTimelineChart byDay={stats.byDay} />
          </div>

          {/* Row 2: Hourly + Tokens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HourlyUsageChart data={stats.byHour} />
            <TokenBreakdownChart data={stats.tokenBreakdown} />
          </div>

          {/* Row 3: Day of Week */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DayOfWeekChart data={stats.byDayOfWeek} />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
