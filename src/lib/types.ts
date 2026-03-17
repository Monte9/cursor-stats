import { z } from "zod/v4";

// Zod schema for generateObject() — what the LLM returns
export const chartSpecSchema = z.object({
  title: z.string().describe("Short chart title, 5-8 words"),
  subtitle: z.string().optional().describe("Key stat or date range"),
  insight: z.string().optional().describe("One surprising or actionable sentence"),
  chartType: z.enum(["bar", "horizontalBar", "line", "stat"])
    .describe("horizontalBar = Recharts BarChart with layout='vertical'"),
  // For chart types (bar, horizontalBar, line):
  dataSource: z
    .enum(["byModel", "byDay", "byHour", "byDayOfWeek", "byKind", "byMonth"])
    .optional()
    .describe("Which UsageSummary breakdown to visualize"),
  xKey: z.string().optional().describe("Field name for x-axis / labels"),
  yKey: z.string().optional().describe("Field name for y-axis / values"),
  yLabel: z
    .string()
    .optional()
    .describe("Y-axis format hint: '$' or 'requests' or 'tokens'"),
  sortBy: z.string().optional().describe("Optional: re-sort data by this field"),
  limit: z.number().optional().describe("Optional: show only top N items"),
  // For stat type:
  statKey: z
    .enum([
      "totalCost",
      "totalRequests",
      "totalTokens",
      "avgCostPerRequest",
      "cacheHitRate",
      "errorRate",
      "uniqueModels",
      "longestCodingStreak",
    ])
    .optional()
    .describe("For stat charts: key from top-level summary"),
});

export type ChartSpec = z.infer<typeof chartSpecSchema>;

// Serialized UsageSummary (Dates → strings)
export interface SerializedSummary {
  totalRequests: number;
  totalCost: number;
  totalTokens: number;
  dateRange: { start: string; end: string };
  uniqueModels: number;
  byModel: {
    model: string;
    requests: number;
    cost: number;
    tokens: number;
    avgCostPerReq: number;
  }[];
  byDay: { date: string; requests: number; cost: number }[];
  byHour: { hour: number; requests: number }[];
  byDayOfWeek: { day: string; requests: number; cost: number }[];
  byMonth: { month: string; requests: number; cost: number }[];
  byKind: { kind: string; count: number }[];
  cacheHitRate: number;
  errorRate: number;
  avgCostPerRequest: number;
  mostExpensiveRequest: {
    cost: number;
    model: string;
    date: string;
  } | null;
  longestCodingStreak: number;
  busiestDay: { date: string; requests: number } | null;
}

// What we POST to /api/chart
export interface ChartRequestPayload {
  prompt: string;
  summary: SerializedSummary;
}
