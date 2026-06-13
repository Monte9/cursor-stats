# CLAUDE.md

Guidance for Claude Code (and agents) working in this repo.

## Build & run

- Node >= 20 (see `.nvmrc`). Use `pnpm` — there's a `pnpm-lock.yaml`.
- `pnpm install`, then `pnpm dev` (dev server) or `pnpm build` + `pnpm start` (production).
- The build needs **no environment variables**. The `/api/chart` route calls the
  Anthropic API at runtime, so only the prompt → chart feature needs
  `ANTHROPIC_API_KEY` (put it in `.env.local` for local dev).
- **Cloud sessions:** `NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1` (set in
  `.claude/settings.json`) is required so Turbopack can fetch Google Fonts through
  the TLS-intercepting proxy. Without it, `next build` fails on `next/font` with
  "Failed to fetch `Geist` from Google Fonts". (`pnpm build --webpack` is an
  alternative escape hatch, but the env var fixes the default Turbopack path.)

## Taking screenshots (e.g. for the README)

Playwright is **intentionally not a project dependency** — it's only needed for the
occasional screenshot, and the cloud container is ephemeral, so install it ad hoc
each time rather than bloating `package.json`.

1. Serve the **production** build, not `pnpm dev` (dev mode renders the Next.js dev
   overlay button into the shot):
   ```bash
   pnpm build && PORT=3000 pnpm start &
   ```
2. Install Playwright + Chromium in a throwaway dir:
   ```bash
   mkdir -p /tmp/pw && cd /tmp/pw && npm init -y && npm i playwright && npx playwright install chromium
   ```
3. Capture with a small script run from `/tmp/pw` (so `import ... from "playwright"`
   resolves). The `/demo` route renders the full dashboard with sample data and needs
   **no API key**. Wait ~2.5s after `networkidle` for Recharts + Framer Motion to
   settle before capturing. Use `viewport: 1280x800`, `deviceScaleFactor: 2`.
4. When done, stop the server (`kill` the `next-server` process — it can outlive its
   parent shell).

Committed screenshots live in `docs/screenshots/`.
