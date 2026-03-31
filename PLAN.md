# CursorStats — Plan

Visualize your Cursor AI usage patterns. Upload a CSV, ask questions, get interactive charts.

---

## Vision

The best way to understand your Cursor AI usage. Upload your export, get a beautiful dashboard with cost breakdowns, model usage, and streaks. Ask natural language questions and get instant charts. Shareable, fast, privacy-first (data never leaves your browser).

---

## Current State

**Live at [cursorstats.vercel.app](https://cursorstats.vercel.app).** Auto-deploys from `nexuslabsx/cursor-stats` on push.

- Phase 0-3 shipped in ~18 hours (Mar 17, 2026)
- Landing page: hero with orange glow, How It Works section, example charts, trust badges, sticky nav
- Upload page (`/app`): client-side CSV parsing via papaparse, 20+ computed stats, 5 interactive chart cards
- Demo mode (`/demo`): 20,888-row sample dataset, full dashboard experience without upload
- Prompt → Chart engine: natural language questions generate dynamic charts via Claude Sonnet + Vercel AI SDK
- Zero-hallucination architecture: LLM selects a `dataSource` reference, client resolves against real data
- Ember design system: dark theme, glassmorphism chart cards, macOS-style dots, watermark
- Cost-focused insights: model breakdown by spend, cost per request, priciest request, longest streak, busiest day
- 5 suggestion pills for quick chart generation, skeleton loading, error + retry
- Privacy-first: CSV parsed client-side only, only aggregated stats sent to LLM
- Stack: Next.js 16, Tailwind 4, Recharts, Framer Motion, Vercel AI SDK, pnpm

---

## Phases

### Phase 1: Mobile & Responsive Polish
- Fix horizontal overflow, text clipping, chart sizing on mobile/tablet
- Touch target improvements for interactive elements
- Responsive chart card layout adjustments
- Launch blocker — links are already being shared on Slack/mobile
- Spec: `specs/phase-4-mobile-polish.md`

### Phase 2: Launch
- Buy + connect cursorstats.com domain
- OG image / Twitter card (dynamic stats preview)
- SEO: sitemap, robots.txt, meta descriptions
- Launch posts: X, Reddit r/cursor, HN Show, Cursor Discord

---

## Backlog

- **Chart export** — download icon on each chart card → PNG. Watermark already in place for viral loop
- **Share your stats** — shareable image collage of key stats for social posting
- **Data persistence** — `sessionStorage` so page refresh keeps data within same tab
- **Multi-series charts** — cross-dimensional data sources (e.g. model X vs Y over time). Architecture currently single-series only
- **Multi-file comparison** — upload two CSVs for week-over-week or month-over-month diff
- **Community leaderboard** — opt-in public rankings by spend, tokens, streaks. Requires auth (TBD)
- **Accounts + chart history** — login-backed persistence for saving prompt-generated charts
- **Make repo public** — audit for any hardcoded values first

---

*Updated: 2026-03-31*
