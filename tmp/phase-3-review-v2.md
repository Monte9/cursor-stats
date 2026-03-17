# Phase 3 Re-Review — Prompt-to-Chart Engine

> Reviewer: Monte (via Cursor session)
> Date: 2026-03-17
> Spec: [specs/phase-3-prompt-engine.md](../specs/phase-3-prompt-engine.md) (revision `604c299`)
> Previous review: [tmp/phase-3-review.md](./phase-3-review.md)

---

## Verdict: GO

All 9 issues from the first review have been addressed. The revised spec is solid, focused, and ready to build.

---

## Original Issues — All Resolved

| # | Issue | Status |
|---|---|---|
| 1 | In-memory rate limiting | Fixed — removed, monitor Anthropic dashboard |
| 2 | Sample rows leak raw data | Fixed — removed from payload entirely |
| 3 | Missing Zod schema | Fixed — full schema with `.describe()` hints |
| 4 | LLM generates data (hallucination risk) | Fixed — `dataSource` enum, client resolves real data |
| 5 | System prompt too vague | Fixed — 3 few-shot examples added |
| 6 | Unvalidated ChartSpec.data | Fixed — eliminated by dataSource approach |
| 7 | Opus fallback | Fixed — Sonnet only |
| 8 | Chart stacking complexity | Fixed — single slot |
| 9 | Separate serialize-summary.ts | Fixed — inline in submit handler |

---

## Implementation Notes (Handle During Build)

These are not spec blockers. They're things to handle in code.

### A. Guard optional fields for non-stat charts

`dataSource`, `xKey`, `yKey` are `.optional()` in the Zod schema to accommodate the `stat` type. But for bar/line charts, they're required — a bar chart with no `dataSource` crashes the renderer.

**Action:** In `dynamic-chart.tsx`, if `chartType !== "stat"` and any of `dataSource`/`xKey`/`yKey` are missing, show the error fallback. 3-4 lines.

### B. Constrain `statKey` to valid keys

`dataSource` uses `z.enum([...])` but `statKey` is just `z.string()`. The LLM could return a key that doesn't exist on the summary.

**Action:** Either change to `z.enum(["totalCost", "totalRequests", "totalTokens", "avgCostPerRequest", "cacheHitRate", "errorRate", "uniqueModels", "longestCodingStreak"])` or add a client guard. Enum is cleaner.

### C. Format stat values client-side, not via LLM subtitle

The few-shot example has the LLM writing `"subtitle": "97.2%"` for `cacheHitRate`. The actual value is `0.972`. If the LLM rounds slightly wrong, the displayed number won't match reality.

**Action:** For stat charts, resolve `statKey` to the real value, format it based on key type (`$` for costs, `%` for rates, plain for counts), and display that. Use LLM `subtitle` only as fallback. This preserves the zero-hallucination guarantee for displayed numbers.

### D. Remove `pie` from Zod enum for launch

Section 3.6 covers bar, horizontalBar, line, stat. `pie` is in the schema but not in the renderer spec. Recharts `PieChart` has different props and needs separate handling.

**Action:** Drop `pie` from `chartType` enum for launch. Bar charts cover comparisons fine. Add pie later.

---

## What the Spec Gets Right

- **Core architecture is clean.** LLM selects from fixed data sources, client resolves real data. Eliminates hallucinated numbers while keeping the LLM useful for chart selection, titling, and insights.
- **Privacy preserved.** No raw rows, no sample rows. Only aggregated stats cross the wire to the API.
- **Scope is right-sized.** Single chart slot, one model, no rate limiting infra. Enough to prove the feature.
- **System prompt is strong.** Three few-shot examples covering bar, stat, and the horizontalBar mapping. Available data sources table gives the LLM clear constraints.
- **File structure is minimal.** 3 new files, 3 modified. Clean delta.
- **`byHourInDay` exclusion is explicitly noted.** Prevents the LLM from referencing a conditionally-populated field.
- **Server-side prompt validation.** 500 char limit enforced on both client and server.

---

## Recommendation

Ship it. The 4 implementation notes (A-D) are quick guards to add during coding. The architecture is sound and the scope is right for a first pass.

---

*Status: Review Complete — GO for build*
