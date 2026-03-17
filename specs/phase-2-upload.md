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
3. Validates expected columns exist (all 11 from the schema above)
4. Parses numeric fields from strings to numbers
5. Handles Cost = `-` → `null` or `0`
6. Returns a typed array of `CursorUsageRow[]` or a validation error

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
  cost: number | null; // null for errored/aborted
}

export interface ParseResult {
  success: true;
  data: CursorUsageRow[];
  warnings: string[]; // e.g. "3 rows had no cost data"
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
  sessionDuration: string; // e.g. "11h 23m"
  uniqueModels: number;
  
  // Breakdowns
  byModel: { model: string; requests: number; cost: number; tokens: number }[];
  byDay: { date: string; requests: number; cost: number }[];
  byHour: { hour: number; requests: number }[];
  byKind: { kind: string; count: number }[];
  
  // Derived insights
  avgCostPerRequest: number;
  mostUsedModel: string;
  peakHour: number;
  cacheHitRate: number; // cacheRead / (cacheRead + inputWithoutCache)
  errorRate: number; // errored+aborted / total
}
```

### 2.4 — Sample/Demo Data (`src/lib/demo-data.ts`)

Bundle the sample CSV data Monte provided as a TypeScript constant. When `?demo=true`, skip the upload step and load this directly.

- Copy a representative subset (or all 157 rows) as pre-parsed `CursorUsageRow[]`
- Stored as a static import (no runtime parsing needed for demo)

### 2.5 — Upload Component (`src/components/app/upload-zone.tsx`)

Replace the current placeholder drop zone with a functional one:

- **Drag & drop** with visual feedback (border color change, background highlight)
- **Click to browse** file picker (accept `.csv`)
- **Drop state animations** with Framer Motion
- Upload icon (SVG, not emoji)
- File size display after selection
- Error state: red border + error message if validation fails
- Loading state: brief spinner/progress while parsing (even though it's instant, provides feedback)
- On successful parse: transition to dashboard view

**States:**
1. **Idle** — dashed border, "Drag and drop your CSV" + "or click to browse"
2. **Drag over** — orange border, orange bg tint, "Drop to upload"
3. **Parsing** — spinner + "Analyzing your data..."
4. **Error** — red border + error message + "Try again" link
5. **Success** — brief green check → transition to dashboard

### 2.6 — Dashboard Layout (`src/components/app/dashboard.tsx`)

The main dashboard view that appears after successful upload:

**Header area:**
- "Your Usage" heading with date range
- Summary stat cards in a row (4 cards):
  - Total Cost (large number, dollar formatted)
  - Total Requests
  - Total Tokens (formatted with K/M suffixes)
  - Session Duration
- "Upload new file" link to reset

**Charts area (below stats):**
1. **Model Breakdown** — horizontal bar chart (same style as landing page but with real data)
2. **Cost Over Time** — line chart by day (if multi-day data) or by hour (if single-day)
3. **Usage by Hour** — bar chart showing request distribution by hour of day
4. **Token Breakdown** — stacked bar or pie chart: input vs cache vs output tokens
5. **Request Types** — small donut/pie showing On-Demand vs Errored vs Aborted

**Layout:**
- 4 stat cards in a row (2x2 on mobile)
- Charts in a responsive grid: 2 columns on desktop, 1 on mobile
- All charts use the same tooltip styling from Phase 1
- All charts use orange-500 as primary color, with zinc-600/zinc-500 for secondary data

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

### 2.8 — Nav Integration

The sticky nav from Phase 1 should also appear on `/app`:
- Import and render `<Nav />` in the app page
- Or move `<Nav />` to the root layout so it appears everywhere

---

## File Structure (New/Modified)

```
src/
├── app/
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
│   │       ├── token-breakdown.tsx  # NEW: stacked bar or pie
│   │       └── request-types.tsx    # NEW: donut chart
│   ├── landing/                # Unchanged
│   └── charts/
│       └── mock-data.ts        # Unchanged (landing page only)
├── lib/
│   ├── csv-parser.ts           # NEW: parse + validate CSV
│   ├── stats.ts                # NEW: compute summary stats
│   ├── demo-data.ts            # NEW: bundled sample data
│   └── format.ts               # NEW: number formatting utilities
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

**Required columns** (all 11 must be present):
`Date, User, Kind, Model, Max Mode, Input (w/ Cache Write), Input (w/o Cache Write), Cache Read, Output Tokens, Total Tokens, Cost`

**Validation errors:**
- Missing required column → `"Missing required column: {name}"`
- No data rows → `"CSV file is empty"`
- Unparseable date → warning (skip row, don't fail)
- Non-numeric token value → warning (treat as 0)

**Warnings** (don't block, just inform):
- `"3 rows had no cost data (errored/aborted requests)"`
- `"2 rows had unparseable dates and were skipped"`

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
- [ ] CSV parsed client-side with papaparse
- [ ] Validation: rejects non-CSV, missing columns, empty files
- [ ] Error states shown clearly in UI
- [ ] Summary dashboard renders with 4 stat cards + 5 charts
- [ ] All charts interactive (tooltips)
- [ ] Demo mode (`?demo=true`) loads sample data and shows dashboard
- [ ] Demo banner with link to upload own data
- [ ] "Upload new file" resets to upload view
- [ ] Nav bar present on `/app`
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

*Status: Spec Written — Awaiting Review*
