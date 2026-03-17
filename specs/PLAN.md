# CursorStats — Project Plan

> Visualize your Cursor AI usage patterns. Upload a CSV, ask questions, get interactive charts.

**Repo:** [ashokosnexus/cursor-stats](https://github.com/ashokosnexus/cursor-stats) (private)
**Live:** https://cursorstats.vercel.app
**Stack:** Next.js 16, Tailwind CSS 4, Recharts, Framer Motion, Vercel AI SDK, pnpm
**Domain:** cursorstats.com (pending purchase)

---

## Completed Phases

### Phase 0: Project Setup ✅
Next.js 16 + TypeScript + Tailwind 4, Vercel deploy, CI/CD pipeline.
**Spec:** [phase-0-setup.md](./phase-0-setup.md)

### Phase 1: Landing Page ✅
Hero with orange glow, How It Works, example charts, trust badge, sticky nav, `/app` upload page, `/demo` route. Two design review rounds applied.
**Spec:** [phase-1-landing.md](./phase-1-landing.md)

### Phase 2: CSV Upload + Summary Dashboard ✅
Client-side CSV parsing (papaparse), 20+ computed stats, 5 interactive chart cards (glassmorphism, macOS dots, watermark), demo mode with 20,888-row all-time sample data. Cost-focused insights: model breakdown by spend, cost per request efficiency, priciest request, longest coding streak, busiest day.
**Spec:** [phase-2-upload.md](./phase-2-upload.md)

### Phase 3: Prompt → Chart Engine ✅
Natural language questions → dynamic charts via LLM. Claude 4.6 Sonnet via Vercel AI SDK `generateObject()` with Zod schema. LLM selects `dataSource` reference (byModel, byDay, byHour, byMonth, byDayOfWeek, byKind), client resolves against real `UsageSummary` data — zero hallucination. Single chart slot, 5 suggestion pills, skeleton loading, error + retry, off-topic handling. No rate limiting (monitoring Anthropic dashboard). No Opus fallback. Privacy preserved (only aggregated stats sent to API).
**Spec:** [phase-3-prompt-engine.md](./phase-3-prompt-engine.md)

---

## Upcoming Phases

### Phase 4: Chart Export + Sharing (Viral Loop)
Make the glassmorphism chart cards downloadable and shareable.

**What this means:**
- Small download icon on each chart card → saves as PNG (html2canvas or dom-to-image)
- The watermark (`cursorstats.com`) is already there — becomes a viral loop
- "Share your stats" — generates a shareable link or image collage
- OG image generation for social cards (dynamic, showing key stats)

**Why this matters:** Every shared chart card is free marketing. The macOS dots + watermark design was built for this.

**Spec:** phase-4-export.md (TBD)

### Phase 5: Polish & Launch
- OG image / Twitter card (dynamic stats preview)
- Mobile responsive audit (dashboard on phone)
- Performance audit (bundle size, lazy loading charts)
- SEO: sitemap, robots.txt, structured data
- Buy + connect cursorstats.com domain
- Launch post: share on X, Reddit r/cursor, HN Show

---

## Architecture

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Next.js 16 (App Router) | Vercel-native, API routes, RSC |
| Styling | Tailwind CSS 4 | No shadcn — custom components |
| Charts | Recharts | React-native, animation, composable |
| Animations | Framer Motion | Scroll reveal, transitions, chart mount |
| CSV Parsing | papaparse (client-side) | Privacy-first, no data leaves browser |
| LLM | Vercel AI SDK → Claude Sonnet | `generateObject()` + Zod, structured output |
| Hosting | Vercel | Auto-deploy from GitHub |
| Package Manager | pnpm | Fast, disk efficient |

## Privacy Model
- CSV data stays client-side only
- Only aggregated stats sent to LLM (never raw rows)
- No data persistence by default
- No analytics/tracking beyond Vercel defaults

## Routes
| Route | Purpose |
|-------|---------|
| `/` | Landing page (marketing) |
| `/app` | Upload CSV → dashboard |
| `/demo` | Demo dashboard with sample data |
| `/api/chart` | LLM chart generation endpoint |

---

### Nice to Have (Post-Launch)
- **Multi-series charts:** Add cross-dimensional data sources (e.g. `byModelByMonth`) to enable "compare model X vs model Y over time" stacked/grouped bar charts. Current architecture only supports single-series per chart.
- **Data Persistence:** Store parsed CSV in `sessionStorage` so page refresh keeps data within same tab
- **Multi-file comparison:** Upload two CSVs (e.g. week-over-week) and see diff
- **Team view:** Multi-user CSV with per-user breakdowns
- **Community Leaderboard:** Opt-in public leaderboard — users upload CSV, see their dashboard, then choose to share stats under a display name. Ranked by total spend, token usage, streak length, etc. Requires accounts (auth TBD). Viral loop: "I'm in the top 10 Cursor spenders" shareable badges.
- **Accounts + chart history:** Login-backed persistence so prompt-generated charts stack or are saved; revisit multiple LLM charts per session instead of single-slot UX.

*Owner: Ash (ashokosnexus) · Collaborator: Monte*
*Last updated: 2026-03-17*
