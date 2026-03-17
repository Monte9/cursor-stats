# Phase 2: CSV Upload + Summary Dashboard

> Goal: Users can upload a Cursor usage CSV and instantly see a rich summary dashboard with interactive charts. All processing client-side.

---

## Context

Phase 1 shipped: landing page at `/` with marketing content, and a placeholder `/app` page with a disabled drop zone and "How to export" guide. Phase 2 replaces the placeholder with a functional upload + dashboard experience.

**What exists at `/app` today:**
- Static drop zone (visual only, `cursor-not-allowed`)
- Collapsible "How to export from Cursor" guide
- Demo mode detection (`?demo=true` shows badge)
- "Upload coming soon" copy

**What Phase 2 delivers:**
- Working drag-and-drop + file picker upload
- Client-side CSV parsing and validation
- Instant summary dashboard with 5+ interactive charts
- Demo mode loads bundled sample data
- Smooth transition from upload → dashboard

---

## CSV Schema (Cursor Export Format)

Cursor exports a CSV with these columns:

| Column | Type | Notes |
|--------|------|-------|
| Date | ISO 8601 string | `2026-03-17T05:57:09.986Z` |
| User | string (email) | `manthan.thakkar@gmail.com` |
| Kind | string enum | `On-Demand`, `Errored, No Charge`, `Aborted, Not Charged` |
| Model | string | `claude-4.6-opus-high-thinking`, `gpt-5.4-medium`, etc. |
| Max Mode | string | `No` / `Yes` (whether max/premium mode was used) |
| Input (w/ Cache Write) | number | Input tokens including cache writes |
| Input (w/o Cache Write) | number | Input tokens excluding cache writes |
| Cache Read | number | Tokens read from cache |
| Output Tokens | number | Output tokens generated |
| Total Tokens | number | Sum of all token columns |
| Cost | number or `-` | Cost in USD; `-` for errored/aborted requests |

**Edge cases to handle:**
- Cost can be `-` (errored/aborted) — treat as 0 for aggregation
- Cost can be `0.00` (aborted, not charged) — valid
- Rows with Kind = `Errored` or `Aborted` should still count in request totals but flag in UI
- All numeric columns are quoted strings in the CSV — parse to numbers
- Dates are UTC — display in user's local timezone

---

## Tasks

### 2.1 — Install papaparse
```bash
pnpm add papaparse
pnpm add -D @types/papaparse
```

### 2.2 — CSV Parser + Validator (`src/lib/csv-parser.ts`)

Create a typed parser that:
1. Accepts a `File` object
2. Parses with papaparse (`header: true`, `skipEmptyLines: true`)
3. Validates expected columns exist against `REQUIRED_COLUMNS` constant
4. Parses numeric fields from strings to numbers
5. Handles Cost = `-` → `null`
6. Skips rows with unparseable dates (increment `skippedRows` counter)
7. Returns a typed array of `CursorUsageRow[]` or a validation error

**Required columns constant** — single source of truth for validation. If Cursor changes their export format in the future, update this list and the `CursorUsageRow` type:

```ts
export const REQUIRED_COLUMNS = [
  'Date',
  'User',
  'Kind',
  'Model',
  'Max Mode',
  'Input (w/ Cache Write)',
  'Input (w/o Cache Write)',
  'Cache Read',
  'Output Tokens',
  'Total Tokens',
  'Cost',
] as const;
```

**Types:**

```ts
export interface CursorUsageRow {
  date: Date;
  user: string;
  kind: 'On-Demand' | 'Errored, No Charge' | 'Aborted, Not Charged' | string;
  model: string;
  maxMode: boolean;
  inputWithCache: number;
  inputWithoutCache: number;
  cacheRead: number;
  outputTokens: number;
  totalTokens: number;
  cost: number | null; // null for errored/aborted (Cost = "-")
}

export interface ParseResult {
  success: true;
  data: CursorUsageRow[];
  warnings: string[]; // e.g. "3 rows had no cost data"
  skippedRows: number; // rows dropped due to unparseable dates or other issues
}

export interface ParseError {
  success: false;
  error: string; // e.g. "Missing required column: Model"
}
```

### 2.3 — Summary Stats Calculator (`src/lib/stats.ts`)

Compute aggregated stats from parsed data:

```ts
export interface UsageSummary {
  // Overview
  totalRequests: number;
  totalCost: number;
  totalTokens: number;
  dateRange: { start: Date; end: Date };
  dateRangeDuration: string; // Time between first and last request (e.g. "11h 23m")
  uniqueModels: number;
  
  // Breakdowns
  byModel: { model: string; requests: number; cost: number; tokens: number }[];
  byDay: { date: string; requests: number; cost: number }[];
  byHour: { hour: number; requests: number }[]; // hour-of-day aggregated across all days (0-23)
  byHourInDay?: { hour: number; requests: number; cost: number }[]; // present only for single-day data
  byKind: { kind: string; count: number }[];
  
  // Token breakdown (for stacked chart)
  tokenBreakdown: {
    cacheRead: number;
    inputExclCache: number; // inputWithoutCache summed
    output: number;         // outputTokens summed
  };
  
  // Derived insights
  avgCostPerRequest: number;
  mostUsedModel: string;
  peakHour: number;
  cacheHitRate: number; // cacheRead / (cacheRead + inputWithoutCache). When denominator is 0, use 0.
  errorRate: number;    // (errored + aborted) / totalRequests. When totalRequests is 0, use 0.
}
```

**`byHourInDay`**: Present only when the data spans a single calendar day. Contains 24 buckets (0-23) for that specific day with both `requests` and `cost`. This is used by the Cost Over Time chart as the single-day x-axis.

**`byHour`**: Always present. Aggregates requests by hour-of-day across all days in the dataset. Used by the "Usage by Hour" chart.

### 2.4 — Sample/Demo Data (`src/lib/demo-data.ts`)

Bundle the sample CSV data Monte provided as a TypeScript constant. When `?demo=true`, skip the upload step and load this directly.

- Include all 157 rows from the original export as pre-parsed `CursorUsageRow[]`
- Stored as a static import (no runtime parsing needed for demo)
- Source CSV: `~/Projects/tmp/cursor-stats-research/` or inbound media folder
- Add a comment in `demo-data.ts`: `// Generated from Cursor export on 2026-03-17. Keep in sync with CursorUsageRow type.`
- Optionally commit source CSV to `scripts/sample-usage.csv` for reproducibility

### 2.5 — Upload Component (`src/components/app/upload-zone.tsx`)

Replace the current placeholder drop zone with a functional one:

- **Drag & drop** with visual feedback (border color change, background highlight)
- **Click to browse** file picker (accept `.csv`)
- **Drop state animations** with Framer Motion
- Upload icon (SVG, not emoji)
- File size display after selection
- **File size limit: 10 MB max.** If exceeded, show error: "File is too large (max 10 MB). Try a smaller export or a shorter date range."
- Error state: red border + error message if validation fails
- On successful parse: transition to dashboard view (no artificial spinner delay — show "Analyzing your data…" text during the synchronous parse, then immediately transition)

**States:**
1. **Idle** — dashed border, "Drag and drop your CSV" + "or click to browse"
2. **Drag over** — orange border, orange bg tint, "Drop to upload"
3. **Error** — red border + error message + "Try again" link
4. **Success** → transition to dashboard

### 2.6 — Dashboard Layout (`src/components/app/dashboard.tsx`)

The main dashboard view that appears after successful upload:

**Header area:**
- "Your Usage" heading with date range
- Summary stat cards in a row (4 cards):
  - Total Cost (large number, dollar formatted)
  - Total Requests
  - Total Tokens (formatted with K/M suffixes)
  - Data Span (uses `dateRangeDuration` from stats, displayed as "Session Duration" label)
- "Upload new file" link to reset
- If `skippedRows > 0` or `warnings.length > 0`: show a small muted info bar beneath stats with warnings

**Charts area (below stats):**
1. **Model Breakdown** — horizontal bar chart (same style as landing page but with real data)
2. **Cost Over Time** — line chart. Uses `byDay` when data spans multiple calendar days (date on x-axis). Uses `byHourInDay` when data spans a single calendar day (hour on x-axis, with cost).
3. **Usage by Hour** — bar chart showing request distribution by hour of day (uses `byHour`, always present)
4. **Token Breakdown** — stacked bar chart with three segments: **Cache Read** (`tokenBreakdown.cacheRead`) | **Input (excl. cache)** (`tokenBreakdown.inputExclCache`) | **Output** (`tokenBreakdown.output`). Use orange-500, orange-300, and zinc-500 for the three segments.
5. **Request Types** — small donut/pie showing On-Demand vs Errored vs Aborted (uses `byKind`)

**Layout:**
- 4 stat cards in a row (2x2 on mobile)
- Charts in a responsive grid: 2 columns on desktop, 1 on mobile
- All charts use the same tooltip styling from Phase 1
- All charts use orange-500 as primary color, with orange-300/zinc-500 for secondary data

### 2.7 — App Page Rewrite (`src/app/app/page.tsx`)

Refactor the `/app` page to manage state between upload and dashboard views:

```
/app flow:
├── No data + no demo → Show upload zone + export guide
├── ?demo=true → Load demo data → Show dashboard
├── CSV uploaded → Parse → Validate → Show dashboard
└── Dashboard view → "Upload new" resets to upload zone
```

State management: `useState` with a `CursorUsageRow[] | null`. When null, show upload. When populated, show dashboard.

Keep the "How to export" collapsible guide visible in the upload view (already exists). Hide it in dashboard view.

### 2.8 — Nav in Root Layout

Move `<Nav />` from the landing page to the **root layout** (`src/app/layout.tsx`) so it appears on all pages (`/`, `/app`, and any future routes). Remove the Nav import from `src/app/page.tsx`.

---

## File Structure (New/Modified)

```
src/
├── app/
│   ├── layout.tsx              # MODIFIED: add Nav here (remove from page.tsx)
│   ├── page.tsx                # MODIFIED: remove Nav import
│   ├── app/
│   │   └── page.tsx            # REWRITE: upload → dashboard state machine
│   └── ...
├── components/
│   ├── app/
│   │   ├── upload-zone.tsx     # NEW: drag-drop upload with states
│   │   ├── dashboard.tsx       # NEW: summary dashboard layout
│   │   ├── stat-card.tsx       # NEW: reusable stat card component
│   │   └── charts/
│   │       ├── model-breakdown.tsx  # NEW: horizontal bar (real data)
│   │       ├── cost-timeline.tsx    # NEW: line chart by day/hour
│   │       ├── hourly-usage.tsx     # NEW: bar chart by hour
│   │       ├── token-breakdown.tsx  # NEW: stacked bar (3 segments)
│   │       └── request-types.tsx    # NEW: donut chart
│   ├── landing/                # Unchanged
│   └── charts/
│       └── mock-data.ts        # Unchanged (landing page only)
├── lib/
│   ├── csv-parser.ts           # NEW: parse + validate CSV (REQUIRED_COLUMNS constant)
│   ├── stats.ts                # NEW: compute UsageSummary
│   ├── demo-data.ts            # NEW: bundled sample data (157 rows)
│   └── format.ts               # NEW: number formatting utilities
scripts/
│   └── sample-usage.csv        # OPTIONAL: source CSV for demo data reproducibility
```

---

## Design Details

### Stat Cards
- `bg-zinc-900 border border-zinc-700 rounded-xl p-6`
- Label: `text-zinc-400 text-sm`
- Value: `text-zinc-50 text-3xl font-semibold`
- Accent value (cost): `text-orange-500`

### Chart Cards
- Same styling as landing page charts: `bg-zinc-900 border border-zinc-600 rounded-xl p-6 shadow-lg shadow-black/20`
- Title in `text-lg font-semibold text-zinc-50`
- Tooltips: dark theme, same as Phase 1

### Transitions
- Upload → Dashboard: Framer Motion `AnimatePresence` with fade + slide
- Charts: stagger animation on mount (same pattern as landing page)

---

## Demo Mode

When `/app?demo=true`:
1. Skip upload zone entirely
2. Load pre-parsed demo data from `demo-data.ts`
3. Show dashboard with a small orange banner at top: "Viewing demo data — [Upload your own CSV](#)"
4. The link in the banner resets to upload view

This fulfills the "Try Demo" CTA from the landing page.

---

## Validation Rules

**Required columns** — validated against `REQUIRED_COLUMNS` constant in `csv-parser.ts`:
`Date, User, Kind, Model, Max Mode, Input (w/ Cache Write), Input (w/o Cache Write), Cache Read, Output Tokens, Total Tokens, Cost`

**File-level validation:**
- File size > 10 MB → `"File is too large (max 10 MB). Try a smaller export or a shorter date range."`
- Not a .csv file → `"Please upload a CSV file"`

**Schema validation errors** (block upload):
- Missing required column → `"Missing required column: {name}"`
- No data rows → `"CSV file is empty"`

**Row-level warnings** (skip row, don't block):
- Unparseable date → skip row, add to `skippedRows`, add warning: `"N rows had unparseable dates and were skipped"`
- Non-numeric token value → treat as 0, add warning
- Cost = `-` → set `cost: null`, add warning: `"N rows had no cost data (errored/aborted requests)"`

---

## Dependencies (New)

```bash
pnpm add papaparse
pnpm add -D @types/papaparse
```

No other new deps needed — Recharts and Framer Motion already installed.

---

## Definition of Done

- [ ] Drag & drop upload works (file picker + drag events)
- [ ] File size limit enforced (10 MB)
- [ ] CSV parsed client-side with papaparse
- [ ] Validation: rejects non-CSV, missing columns, empty files
- [ ] Skipped rows tracked and displayed in warnings
- [ ] Error states shown clearly in UI
- [ ] Summary dashboard renders with 4 stat cards + 5 charts
- [ ] Cost Over Time uses `byDay` for multi-day and `byHourInDay` for single-day
- [ ] Token Breakdown shows 3 segments: Cache Read, Input (excl. cache), Output
- [ ] All charts interactive (tooltips)
- [ ] Demo mode (`?demo=true`) loads sample data and shows dashboard
- [ ] Demo banner with link to upload own data
- [ ] "Upload new file" resets to upload view
- [ ] Nav bar present on all pages (moved to root layout)
- [ ] Responsive (mobile + desktop)
- [ ] Animations: upload → dashboard transition, chart stagger
- [ ] Build passes, deployed, no console errors

---

## Privacy Reminder

- CSV never leaves the browser
- No data sent to any server in Phase 2
- All parsing, stats computation, and rendering is client-side
- The LLM integration (Phase 3) will send only aggregated stats, never raw rows

---

## Estimated Effort

1-2 focused sessions (parser + dashboard are the bulk of the work)

## Next Phase
→ Phase 3: Prompt → Chart Engine (LLM integration)

---

*Status: Spec Updated — Ready for Final Review*
