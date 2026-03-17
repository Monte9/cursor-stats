# CursorStats — Project Plan

> Visualize your Cursor AI usage patterns. Upload a CSV, ask questions, get interactive charts.

**Repo:** [ashokosnexus/cursor-stats](https://github.com/ashokosnexus/cursor-stats)
**Deploy:** cursorstats.vercel.app
**Stack:** Next.js 15, Tailwind CSS, shadcn/ui, Recharts, Framer Motion, Vercel AI SDK

---

## Phases

### Phase 0: Project Setup
- Init Next.js app via pnpm (App Router, TypeScript, Tailwind)
- `.nvmrc` + `engines` field (Node 20+)
- Deploy hello world to Vercel
- Confirm CI/CD pipeline works (push → deploy)
- **Spec:** [phase-0-setup.md](./phase-0-setup.md)

### Phase 1: Landing Page
- Init shadcn/ui (deferred from Phase 0 — install when needed)
- Hero section with atmospheric gradient + modern serif typography
- Clear value prop: "See what your AI usage really looks like"
- 3-step visual: Upload → Ask → Visualize
- Animated chart preview (static/mock data)
- Collapsible "How to export from Cursor" guide
- CTA: "Get Started" → redirects to `/app`
- Dark mode, responsive
- **Spec:** phase-1-landing.md (TBD)

### Phase 2: CSV Upload + Summary
- Drag & drop upload zone with animation
- Client-side CSV parsing (papaparse)
- Validate Cursor export format (expected columns, data types)
- Instant summary dashboard on upload:
  - Total cost, date range, request count
  - Model breakdown (bar chart)
  - Timeline of activity
- Store parsed data in React state (no server persistence)
- **Spec:** phase-2-upload.md (TBD)

### Phase 3: Prompt → Chart Engine
- Vercel AI SDK + Next.js API route
- LLM: Claude 4.6 Sonnet (primary), Claude 4.6 Opus (fallback for complex queries)
- Rate limiting (per-IP or session-based)
- Pipeline: user prompt + CSV schema + aggregated stats → structured chart spec JSON
- Pre-seeded suggestion prompts as chips
- Chat-style history of past queries in sidebar
- **Spec:** phase-3-prompt-engine.md (TBD)

### Phase 4: Visualization Layer
- Recharts for chart rendering (bar, line, pie, scatter, heatmap, timeline)
- Framer Motion for chart mount/unmount/transition animations
- Interactive: hover tooltips, click-to-drill-down
- LLM picks best chart type per query
- Export chart as image (html2canvas or similar)
- **Spec:** phase-4-visualization.md (TBD)

### Phase 5: Polish & Launch
- OG image / Twitter card for social sharing
- "Share my stats" (anonymized snapshot)
- Mobile responsive pass
- Performance audit (client-side parsing, bundle size)
- Launch on cursorstats.vercel.app

---

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js 15 (App Router) | Vercel-native, API routes, RSC |
| Styling | Tailwind + shadcn/ui | Fast iteration, consistent design system |
| Charts | Recharts | React-native, built-in animation, composable |
| Animations | Framer Motion | Best React animation library, layout animations |
| CSV Parsing | papaparse (client-side) | No data leaves browser, privacy-first |
| LLM | Vercel AI SDK → Anthropic | Streaming, structured output, clean DX |
| Hosting | Vercel | Zero-config deploys, edge functions |

## Privacy Model

- CSV data stays client-side only
- Only aggregated stats + schema sent to LLM (not raw CSV rows)
- No data persistence — refresh = gone
- No analytics/tracking beyond Vercel defaults

---

*Owner: Ash (ashokosnexus) | Collaborator: Monte*
