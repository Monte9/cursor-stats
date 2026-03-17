import { CursorUsageRow } from "./csv-parser";

export interface UsageSummary {
  totalRequests: number;
  totalCost: number;
  totalTokens: number;
  dateRange: { start: Date; end: Date };
  dateRangeDuration: string;
  uniqueModels: number;

  byModel: { model: string; requests: number; cost: number; tokens: number }[];
  byDay: { date: string; requests: number; cost: number }[];
  byHour: { hour: number; requests: number }[];
  byHourInDay?: { hour: number; requests: number; cost: number }[];
  byKind: { kind: string; count: number }[];

  tokenBreakdown: {
    cacheRead: number;
    inputExclCache: number;
    output: number;
  };

  avgCostPerRequest: number;
  mostUsedModel: string;
  peakHour: number;
  cacheHitRate: number;
  errorRate: number;
}

function formatDuration(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function computeStats(data: CursorUsageRow[]): UsageSummary {
  const totalRequests = data.length;
  const totalCost = data.reduce((sum, r) => sum + (r.cost ?? 0), 0);
  const totalTokens = data.reduce((sum, r) => sum + r.totalTokens, 0);

  // Date range
  const dates = data.map((r) => r.date.getTime()).sort((a, b) => a - b);
  const start = new Date(dates[0]);
  const end = new Date(dates[dates.length - 1]);
  const dateRangeDuration = formatDuration(end.getTime() - start.getTime());

  // By model
  const modelMap = new Map<
    string,
    { requests: number; cost: number; tokens: number }
  >();
  for (const r of data) {
    const existing = modelMap.get(r.model) || {
      requests: 0,
      cost: 0,
      tokens: 0,
    };
    existing.requests++;
    existing.cost += r.cost ?? 0;
    existing.tokens += r.totalTokens;
    modelMap.set(r.model, existing);
  }
  const byModel = Array.from(modelMap.entries())
    .map(([model, stats]) => ({ model, ...stats }))
    .sort((a, b) => b.requests - a.requests);

  // By day
  const dayMap = new Map<string, { requests: number; cost: number }>();
  for (const r of data) {
    const dayKey = r.date.toLocaleDateString("en-CA"); // YYYY-MM-DD
    const existing = dayMap.get(dayKey) || { requests: 0, cost: 0 };
    existing.requests++;
    existing.cost += r.cost ?? 0;
    dayMap.set(dayKey, existing);
  }
  const byDay = Array.from(dayMap.entries())
    .map(([date, stats]) => ({ date, ...stats }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // By hour (aggregated across all days)
  const hourMap = new Map<number, number>();
  for (let h = 0; h < 24; h++) hourMap.set(h, 0);
  for (const r of data) {
    const h = r.date.getHours();
    hourMap.set(h, (hourMap.get(h) || 0) + 1);
  }
  const byHour = Array.from(hourMap.entries())
    .map(([hour, requests]) => ({ hour, requests }))
    .sort((a, b) => a.hour - b.hour);

  // By hour in day (only for single-day data)
  const singleDay = isSameDay(start, end);
  let byHourInDay: { hour: number; requests: number; cost: number }[] | undefined;
  if (singleDay) {
    const hourDayMap = new Map<
      number,
      { requests: number; cost: number }
    >();
    for (let h = 0; h < 24; h++)
      hourDayMap.set(h, { requests: 0, cost: 0 });
    for (const r of data) {
      const h = r.date.getHours();
      const existing = hourDayMap.get(h)!;
      existing.requests++;
      existing.cost += r.cost ?? 0;
    }
    byHourInDay = Array.from(hourDayMap.entries())
      .map(([hour, stats]) => ({ hour, ...stats }))
      .sort((a, b) => a.hour - b.hour);
  }

  // By kind
  const kindMap = new Map<string, number>();
  for (const r of data) {
    kindMap.set(r.kind, (kindMap.get(r.kind) || 0) + 1);
  }
  const byKind = Array.from(kindMap.entries())
    .map(([kind, count]) => ({ kind, count }))
    .sort((a, b) => b.count - a.count);

  // Token breakdown
  const tokenBreakdown = {
    cacheRead: data.reduce((sum, r) => sum + r.cacheRead, 0),
    inputExclCache: data.reduce((sum, r) => sum + r.inputWithoutCache, 0),
    output: data.reduce((sum, r) => sum + r.outputTokens, 0),
  };

  // Derived
  const uniqueModels = modelMap.size;
  const avgCostPerRequest =
    totalRequests > 0 ? totalCost / totalRequests : 0;
  const mostUsedModel = byModel.length > 0 ? byModel[0].model : "N/A";
  const peakHour = byHour.reduce(
    (max, h) => (h.requests > max.requests ? h : max),
    byHour[0]
  ).hour;

  const cacheDenom =
    tokenBreakdown.cacheRead + tokenBreakdown.inputExclCache;
  const cacheHitRate =
    cacheDenom > 0 ? tokenBreakdown.cacheRead / cacheDenom : 0;

  const errorAborted = data.filter(
    (r) => r.kind !== "On-Demand"
  ).length;
  const errorRate = totalRequests > 0 ? errorAborted / totalRequests : 0;

  return {
    totalRequests,
    totalCost,
    totalTokens,
    dateRange: { start, end },
    dateRangeDuration,
    uniqueModels,
    byModel,
    byDay,
    byHour,
    byHourInDay,
    byKind,
    tokenBreakdown,
    avgCostPerRequest,
    mostUsedModel,
    peakHour,
    cacheHitRate,
    errorRate,
  };
}
