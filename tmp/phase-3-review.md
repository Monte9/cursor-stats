# Phase 3 Spec Review — Prompt-to-Chart Engine

> Reviewer: Monte (via Cursor session)
> Date: 2026-03-17
> Spec: [specs/phase-3-prompt-engine.md](../specs/phase-3-prompt-engine.md)
> Codebase reviewed: `stats.ts`, `csv-parser.ts`, `dashboard.tsx`, `chart-card.tsx`, both page routes

---

## Critical Bugs (Must Fix Before Building)

### 1. In-memory rate limiting is a no-op on Vercel serverless

The spec proposes `const rateLimits = new Map()` in the API route. Vercel serverless functions are **stateless** — each invocation can spin up a fresh instance. The Map will be empty on cold starts and won't be shared across instances. The rate limiter will effectively never trigger.

**Fix:** Skip rate limiting for launch. Monitor spend via the Anthropic dashboard instead. If needed later, add a lightweight client-side counter in `sessionStorage` as a soft limit, or swap in Upstash Redis (`@upstash/ratelimit`) for real server-side enforcement.

### 2. Sample rows contradict the privacy model

The spec says "NOT the full CSV (privacy + token cost)" but then sends 5 raw CSV rows in `sampleRows`. These contain the user's actual data (dates, models, costs). Meanwhile `PLAN.md` states: "Only aggregated stats + schema sent to LLM (Phase 3, never raw rows)." Direct contradiction.

**Fix:** Remove `sampleRows` from `ChartRequestPayload`. The schema (column names) + `UsageSummary` stats are sufficient context for the LLM. The LLM doesn't need raw rows — it needs to know what aggregated data is available.

### 3. Missing Zod schema — `generateObject()` requires one

The spec says to use `generateObject()` from Vercel AI SDK but never defines a Zod schema. `generateObject()` **requires** a Zod schema as its `schema` parameter — that's how it constrains the LLM output. Without it, you'd fall back to `generateText()` + manual JSON parsing, which is less reliable.

**Fix:** Define a Zod schema for `ChartSpec` in `types.ts`. Add `zod` to the dependency list (currently missing). Example:

```typescript
import { z } from "zod";

export const chartSpecSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  insight: z.string().optional(),
  chartType: z.enum(["bar", "horizontalBar", "line", "pie", "stat"]),
  dataSource: z.string(),
  xKey: z.string(),
  yKey: z.string(),
  yLabel: z.string().optional(),
  color: z.string().optional(),
  sortBy: z.string().optional(),
  limit: z.number().optional(),
});
```

---

## Architecture Weaknesses (Rethink Before Building)

### 4. The LLM should SELECT existing data, not GENERATE new data

**This is the biggest issue.** The spec has the LLM returning `data: Record<string, string | number>[]` — an arbitrary array of data points the LLM fabricates from the summary. This is the #1 source of hallucination in LLM-powered data tools.

`UsageSummary` already contains pre-computed aggregations: `byModel`, `byDay`, `byHour`, `byDayOfWeek`, `byKind`. These cover the vast majority of questions users will ask. The LLM doesn't need to **generate** data — it needs to **select and configure** which existing data to display.

**Fix:** Replace the `data` field with a `dataSource` reference:

```typescript
interface ChartSpec {
  title: string;
  subtitle?: string;
  insight?: string;
  chartType: "bar" | "horizontalBar" | "line" | "pie" | "stat";
  dataSource: "byModel" | "byDay" | "byHour" | "byDayOfWeek" | "byKind";
  xKey: string;      // which field in the data source for x-axis
  yKey: string;      // which field for y-axis
  yLabel?: string;
  sortBy?: string;   // optional: re-sort the data
  limit?: number;    // optional: top N items
}
```

The client resolves `dataSource` against the actual `UsageSummary` and passes real data to Recharts. Zero hallucination risk for the data itself. The LLM's job becomes: "given this question and these available data sources, pick the right one and configure the chart."

For `stat` type, add a `statValue` field referencing a specific summary key (`totalCost`, `cacheHitRate`, `avgCostPerRequest`, etc.) so the number displayed is always real.

### 5. System prompt needs concrete examples

The draft system prompt is too vague. "Use ONLY the data provided in the summary" doesn't tell the LLM HOW to construct a response.

**Fix:** Include 2-3 few-shot examples in the system prompt showing: (a) the user question, (b) which `dataSource` to pick, (c) the resulting `ChartSpec`. This dramatically improves reliability with `generateObject()`. Example:

```
User: "What's my most expensive model?"
→ { chartType: "horizontalBar", dataSource: "byModel", xKey: "model", yKey: "cost", title: "Cost by Model", yLabel: "$", sortBy: "cost", limit: 6 }
```

### 6. `ChartSpec.data` is completely unvalidated

If keeping `data` as a free-form array (recommended against — see #4), there's no validation that:
- `xKey` and `yKey` actually exist in the data objects
- Values are within plausible ranges
- The array isn't empty
- Data types match what Recharts expects

The spec mentions "client-side validation (check if values are plausible)" but never defines what that means.

**Fix:** Adopt the `dataSource` approach and this problem disappears — data comes from real summary, not LLM.

---

## Simplification Opportunities (Cut for Launch)

### 7. Remove Opus fallback

Claude 4.6 Sonnet with `generateObject()` + Zod schema is already very reliable for structured output. Adding an Opus fallback:

- Doubles possible cost on failures (Opus is ~10x more expensive)
- Adds branching logic in the API route
- Won't fix prompt problems (if Sonnet can't do it, the prompt is wrong, not the model)

**Fix:** Use Sonnet only. If it fails after the SDK's built-in retries, return a user-friendly error. Fix prompt issues as they surface.

### 8. Start with single generated chart, not a stacking list

The spec describes a full chat-like stack: UUID tracking, delete buttons per chart, newest-first ordering, scroll management. This is premature complexity for proving the core feature works.

**Fix:** For launch, support **one generated chart at a time**. New query replaces the previous one. Add stacking in a fast follow if users want history. This cuts state management scope significantly.

### 9. Drop `serialize-summary.ts` as a separate file

`UsageSummary` only has two `Date` fields (`dateRange.start`, `dateRange.end`) and one in `mostExpensiveRequest`. That's ~5 lines of `.toISOString()` mapping, not a separate module.

**Fix:** Inline the serialization in the submit handler or colocate with the types file.

---

## Minor Issues

- **`horizontalBar` is not a Recharts chart type.** Recharts uses `BarChart` with `layout="vertical"`. The dynamic renderer needs to map `horizontalBar` to `BarChart layout="vertical"`. Make this explicit in the spec and code.
- **`byHourInDay` is conditionally populated.** Only exists for single-day datasets. The LLM won't know this — could reference it when it doesn't exist. Either exclude it from the available data sources or document the condition.
- **500 char input limit is client-only.** Client-side limits are trivially bypassed. Add server-side validation too.
- **`zod` is not listed as a new dependency.** It's required for `generateObject()` but missing from the dependency install command.
- **Cost estimates assume Sonnet pricing.** If keeping the Opus fallback, worst-case cost per failed+retried query jumps ~10x.

---

## Recommended Simplified Architecture

```
User prompt
    |
    v
Client: POST /api/chart
  payload: { prompt, summary (serialized UsageSummary) }
  NO sample rows, NO raw data
    |
    v
API route (/api/chart/route.ts):
  1. Validate prompt length (<=500) + payload size
  2. generateObject() with Zod schema + Claude 4.6 Sonnet
  3. Return ChartSpec JSON (dataSource reference + chart config, NOT fabricated data)
    |
    v
Client:
  1. Receive ChartSpec
  2. Resolve dataSource against local UsageSummary (e.g. "byModel" → stats.byModel)
  3. Render with Recharts inside existing ChartCard component
  4. Single chart slot (replaces previous, no stacking)
```

**New dependencies:** `ai`, `@ai-sdk/anthropic`, `zod`

---

## Summary Table

| # | Issue | Spec Says | Recommendation |
|---|---|---|---|
| 1 | Rate limiting | In-memory Map | Skip for launch; monitor spend manually |
| 2 | Sample rows | Send 5 raw rows | Remove; schema + summary is sufficient |
| 3 | Zod schema | Not mentioned | Required for `generateObject()` — add it |
| 4 | LLM generates data | Free-form data array | LLM selects `dataSource`; client resolves real data |
| 5 | System prompt | Vague rules | Add 2-3 few-shot examples |
| 6 | Data validation | "check if plausible" | `dataSource` approach eliminates the problem |
| 7 | Opus fallback | Auto-retry with Opus | Sonnet only; fix prompts not models |
| 8 | Chart stacking | UUID list, delete, scroll | Single chart slot for launch |
| 9 | serialize-summary.ts | New file | Inline (~5 lines) |

---

*Status: Review Complete — Ready for spec revision*
