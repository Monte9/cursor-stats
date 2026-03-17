# Phase 0: Project Setup

> Goal: Next.js app running locally + deployed to Vercel with a hello world page.

---

## Tasks

### 0.1 — Initialize Next.js App
- `pnpm create next-app@latest` with:
  - App Router (not Pages)
  - TypeScript
  - Tailwind CSS
  - ESLint
  - `src/` directory
  - Import alias `@/`
- **No shadcn/ui yet** — deferred to Phase 1 when we need components

### 0.2 — Node Version
- Add `.nvmrc` with `20` (LTS)
- Add `engines` field to `package.json`: `"node": ">=20"`
- Vercel auto-detects `.nvmrc`

### 0.3 — Git Setup
- ✅ Repo created: `ashokosnexus/cursor-stats`
- ✅ Git initialized in `~/Projects/cursor-stats/`
- Initial commit with Next.js boilerplate
- Push to `main`

### 0.4 — Deploy to Vercel
- `vercel link` or `vercel` to create project
- Target: `cursorstats.vercel.app` (or closest available)
- Verify hello world page loads at production URL

### 0.5 — Hello World Page
- Clean the default Next.js boilerplate
- Simple centered page:
  - "CursorStats" heading
  - "Coming soon" subtext
  - Dark background
- This confirms the full pipeline works: code → git → Vercel → live

---

## Definition of Done

- [ ] Next.js app runs locally (`pnpm dev`)
- [ ] `.nvmrc` present with Node 20
- [ ] Pushed to `ashokosnexus/cursor-stats` on GitHub
- [ ] Deployed to Vercel (production URL live)
- [ ] Hello world page renders at production URL
- [ ] Tailwind + TypeScript working
- [ ] Clean git history (no boilerplate noise)

---

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| App Router vs Pages | App Router | Modern Next.js, server components |
| src/ directory | Yes | Clean separation |
| Package manager | pnpm | Fast, disk efficient, consistent w/ Rosebud |
| Node version | 20+ (LTS) | Enforced via `.nvmrc` + `engines` |
| shadcn/ui | Deferred to Phase 1 | Premature in setup phase |

---

*Status: In Progress*
