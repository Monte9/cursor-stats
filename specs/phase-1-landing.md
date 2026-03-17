# Phase 1: Landing Page (Marketing Website)

> Goal: A modern, polished marketing page that sells the product and directs users to `/app`.

---

## Design Direction

Inspired by Base44, Vercel v0, Linear — warm atmospheric minimalism:
- Atmospheric gradient background (cool → warm, or dark with accent glows)
- Modern serif headline + clean sans-serif body (Geist for body, serif TBD)
- Generous whitespace, single-column centered layout
- Dark mode default (developer audience)
- Smooth scroll animations (Framer Motion)
- No navigation clutter — single-purpose page

---

## Sections

### 1. Hero
- **Headline:** Bold, large, serif — communicates the core value
  - e.g. "See what your AI usage really looks like"
  - or "Your Cursor usage, visualized"
- **Subheadline:** One line, lighter weight — expands on the promise
  - e.g. "Upload your CSV. Ask questions. Get interactive charts."
- **CTA Button:** "Get Started" → links to `/app`
- **Background:** Atmospheric gradient or subtle animated mesh
- **Optional:** Animated mock chart that renders on page load (shows the product in action)

### 2. How It Works (3-Step Visual)
Three cards/columns with icons or illustrations:
1. **Upload** — "Export your usage CSV from Cursor Settings"
2. **Ask** — "Ask questions in plain English about your usage"
3. **Visualize** — "Get interactive, animated charts instantly"

Each step can have a subtle animation on scroll-into-view.

### 3. Example Charts (Social Proof / Product Preview)
- 2-3 static or lightly animated chart previews using mock data
- Shows what kind of insights users will get:
  - Model usage breakdown (bar chart)
  - Cost over time (line chart)
  - Usage by hour of day (heatmap or bar)
- These build trust: "oh, this actually looks useful"

### 4. How to Export (Collapsible)
- Expandable section: "How do I get my CSV?"
- Step-by-step with screenshots or description:
  1. Open Cursor Settings
  2. Go to Usage tab
  3. Click "Export" or "Download CSV"
- Keep it short, scannable

### 5. Footer
- Minimal: "Built by Ash" or similar
- Link to GitHub repo
- Link to `/app`

---

## Technical Implementation

### Dependencies (new in Phase 1)
```
pnpm add framer-motion
pnpm dlx shadcn@latest init  (then add: button, card, collapsible)
```

### File Structure
```
src/
├── app/
│   ├── page.tsx           # Landing page (this phase)
│   └── app/
│       └── page.tsx       # Main app (Phase 2, placeholder for now)
├── components/
│   ├── landing/
│   │   ├── hero.tsx
│   │   ├── how-it-works.tsx
│   │   ├── example-charts.tsx
│   │   ├── export-guide.tsx
│   │   └── footer.tsx
│   └── ui/                # shadcn components
```

### Animations
- Hero: fade-in + slide-up on load
- How It Works: stagger reveal on scroll (Framer Motion `useInView`)
- Example Charts: animate in with Framer Motion (mock data, Recharts)
- Smooth scroll between sections

### Responsive
- Mobile-first
- Hero stacks vertically on mobile
- How It Works: 3 columns → stacked on mobile
- Charts: full width on mobile

---

## Cleanup from Phase 0
- [ ] Remove default Next.js SVGs from `public/`
- [ ] Replace favicon with CursorStats branding (simple "CS" or chart icon)

---

## Design Open Questions (Waiting on Monte's Input)
- [ ] Color palette: dark with colored accents? Gradient direction?
- [ ] Serif font choice for headlines (Playfair Display? Fraunces? Instrument Serif?)
- [ ] Hero: include animated chart preview or keep text-only?
- [ ] Tone of copy: technical/dev-focused or broader/playful?

---

## Definition of Done
- [ ] Landing page renders at `/` with all 5 sections
- [ ] Responsive (mobile + desktop)
- [ ] Scroll animations working
- [ ] "Get Started" CTA links to `/app` (placeholder page)
- [ ] Default Next.js assets cleaned up
- [ ] Favicon updated
- [ ] Deployed + live at cursorstats.vercel.app
- [ ] Committed with clean git history

---

## Estimated Effort
1-2 focused sessions

## Next Phase
→ Phase 2: CSV Upload + Summary Dashboard

---

*Status: Spec Written — Awaiting Monte's design inspiration + feedback before building*
