# CursorStats — Project Plan

> Visualize your Cursor AI usage patterns. Upload a CSV, ask questions, get interactive charts.

**Repo:** [ashokosnexus/cursor-stats](https://github.com/ashokosnexus/cursor-stats) (private)
**Live:** https://cursorstats.vercel.app
**Stack:** Next.js 16, Tailwind CSS 4, Recharts, Framer Motion, pnpm
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
Client-side CSV parsing (papaparse), 20+ computed stats, 5 interactive chart cards (glassmorphism, macOS dots, watermark), demo mode with 574-row sample data. Cost-focused insights: model breakdown by spend, cost per request efficiency, priciest request, longest coding streak, busiest day.
**Spec:** [phase-2-upload.md](./phase-2-upload.md)

---

## Upcoming Phases

### Phase 3: Prompt → Chart Engine
The core differentiator — let users ask natural language questions about their data and get dynamic charts.

**What this means:**
- Text input at top of dashboard: "What's my most expensive hour of the day?" → generates a chart
- Vercel AI SDK + Next.js API route → Claude 4.6 Sonnet (primary), Opus (fallback)
- LLM receives: CSV schema + `UsageSummary` stats (never raw rows) → returns structured chart spec JSON
- Recharts renders the spec dynamically (chart type, data mapping, colors, title)
- Pre-seeded suggestion prompts as chips below the input
- Chat-style history: previous queries stack below the input, each with its chart
- Rate limiting (per-IP or session-based) since we're paying for the LLM

**Key design question:** Do prompt-generated charts replace the static dashboard, or supplement it? Recommendation: keep the static dashboard as a "home" view, add a "Ask a question" section above it where dynamic charts appear. The static charts prove the product immediately; the prompt charts show depth.

**New dependencies:** `ai` (Vercel AI SDK), `@ai-sdk/anthropic`
**New files:** API route (`src/app/api/chart/route.ts`), prompt input component, dynamic chart renderer
**Spec:** phase-3-prompt-engine.md (TBD)

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
| LLM | Vercel AI SDK → Anthropic (Phase 3) | Streaming, structured output |
| Hosting | Vercel | Auto-deploy from GitHub |
| Package Manager | pnpm | Fast, disk efficient |

## Privacy Model
- CSV data stays client-side only
- Only aggregated stats + schema sent to LLM (Phase 3, never raw rows)
- No data persistence by default (sessionStorage opt-in in Phase 4.5)
- No analytics/tracking beyond Vercel defaults

## Routes
| Route | Purpose |
|-------|---------|
| `/` | Landing page (marketing) |
| `/app` | Upload CSV → dashboard |
| `/demo` | Demo dashboard with sample data |
| `/api/chart` | LLM chart generation endpoint (Phase 3) |

---

### Nice to Have (Post-Launch)
- **Data Persistence:** Store parsed CSV in `sessionStorage` so page refresh keeps data within same tab
- **Multi-file comparison:** Upload two CSVs (e.g. week-over-week) and see diff
- **Team view:** Multi-user CSV with per-user breakdowns
- **Community Leaderboard:** Opt-in public leaderboard — users upload CSV, see their dashboard, then choose to share stats under a display name. Ranked by total spend, token usage, streak length, etc. Requires accounts (auth TBD). Viral loop: "I'm in the top 10 Cursor spenders" shareable badges.
- **Accounts + chart history:** Login-backed persistence so prompt-generated charts stack or are saved; revisit multiple LLM charts per session instead of single-slot UX.

*Owner: Ash (ashokosnexus) · Collaborator: Monte*
*Last updated: 2026-03-17*
