# Phase 1: Landing Page (Marketing Website)

> Goal: A modern, polished marketing page that sells the product and directs users to `/app`.

---

## Design System

### Palette: "Ember"
```
--bg:          #09090b  (zinc-950)
--surface:     #18181b  (zinc-900)
--surface-2:   #27272a  (zinc-800)
--border:      #3f3f46  (zinc-700)
--text:        #fafafa  (zinc-50)
--text-muted:  #a1a1aa  (zinc-400)
--accent:      #f97316  (orange-500)
--accent-hover:#fb923c  (orange-400)
--accent-glow: #f97316/15 (for radial bg glows)
```

### Typography
- **Headlines:** Serif font via `next/font` (Instrument Serif or Playfair Display — TBD, test both)
- **Body/UI:** Geist (already configured from Phase 0)

### Logo
- Locked: rounded square with line chart icon (v2c variant)
- File: `public/logo.png`

---

## Sections

### 1. Hero
- **Headline:** Bold, large, serif — core value prop
  - e.g. "See what your AI usage really looks like"
- **Subheadline:** Includes privacy signal
  - e.g. "Upload your Cursor CSV. Ask questions. Get interactive charts. Your data never leaves your browser."
- **Two CTAs side by side:**
  - **"Get Started"** → `/app` (primary, orange)
  - **"Try Demo"** → `/app?demo=true` (secondary, outlined) — loads mock data so visitors can explore without their own CSV
- **Hero chart (required, not optional):** An animated Recharts component with mock data that renders on page load. Shows a real chart (e.g. model usage breakdown) to prove the product works immediately.
- **Background:** Subtle orange radial glow centered behind the hero content

### 2. How It Works (3-Step Visual)
Three cards/columns with icons:
1. **Upload** — "Export your usage CSV from Cursor Settings"
2. **Ask** — "Ask questions in plain English about your usage"
3. **Visualize** — "Get interactive, animated charts instantly"

Stagger-reveal animation on scroll via Framer Motion `useInView`.

### 3. Example Charts (Product Preview)
- 2-3 animated Recharts components with mock data
- Shows what kind of insights users get:
  - Model usage breakdown (bar chart)
  - Cost over time (line chart)
  - Usage by hour of day (bar/heatmap)
- Animate in on scroll

### 4. Trust / Privacy Badge
- Prominent callout: "🔒 Your data never leaves your browser"
- Brief explanation: CSV is parsed client-side, only aggregated stats sent to AI
- Positioned between the charts and footer for trust reinforcement

### 5. Footer
- "Built by [Nexus Labs](https://github.com/ashokosnexus)" (brand-consistent)
- Link to GitHub repo
- Link to `/app`

---

## /app Placeholder Page

The "Get Started" and "Try Demo" CTAs need a destination. Phase 1 includes a minimal `/app` page:

- Centered layout on dark background
- CursorStats logo + "Upload your CSV" heading
- Disabled/static drop zone (visual only, no functionality yet — that's Phase 2)
- Collapsible "How to export from Cursor" guide (moved here from landing page — users need it at the moment of action, not while browsing)
- If `?demo=true` query param: show "Demo mode coming soon" badge

---

## Technical Implementation

### Dependencies (new in Phase 1)
```bash
pnpm add framer-motion recharts
pnpm dlx shadcn@latest init  # then add: button, card, collapsible
```

### Font Setup
```tsx
// layout.tsx — add serif font
import { Instrument_Serif } from 'next/font/google'

const serif = Instrument_Serif({
  variable: '--font-serif',
  subsets: ['latin'],
  weight: '400',
})
```

### Meta Tags (ship now, not Phase 5)
```tsx
export const metadata: Metadata = {
  title: 'CursorStats — Visualize Your Cursor AI Usage',
  description: 'Upload your Cursor usage CSV, ask questions in plain English, get interactive charts. Privacy-first — your data never leaves your browser.',
  // OG image deferred to Phase 5, but title/description/favicon ship now
}
```

### File Structure
```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Updated: serif font, meta tags
│   └── app/
│       └── page.tsx          # /app placeholder (upload zone + export guide)
├── components/
│   ├── landing/
│   │   ├── hero.tsx          # Hero + animated chart + dual CTAs
│   │   ├── how-it-works.tsx  # 3-step visual
│   │   ├── example-charts.tsx # Mock data chart previews
│   │   ├── trust-badge.tsx   # Privacy callout
│   │   └── footer.tsx
│   ├── charts/
│   │   └── mock-data.ts     # Shared mock data for landing page charts
│   └── ui/                   # shadcn components
├── lib/
│   └── fonts.ts             # Font configuration
public/
├── logo.png                  # Locked logo
├── favicon.ico              # Updated from logo (replace default Next.js)
```

### Animations
- Hero: fade-in + slide-up on load
- Hero chart: animate data points in with Recharts `animationDuration`
- How It Works: stagger reveal on scroll (Framer Motion `useInView`)
- Example Charts: animate in on scroll
- Smooth scroll between sections

### Responsive
- Mobile-first
- Hero: stack chart below CTAs on mobile
- How It Works: 3 columns → stacked on mobile
- Charts: full width on mobile

---

## Cleanup from Phase 0
- [x] Logo saved to `public/logo.png`
- [ ] Remove default Next.js SVGs from `public/` (next.svg, vercel.svg, globe.svg, file.svg, window.svg)
- [ ] Replace favicon with CursorStats logo derivative
- [ ] Update meta tags in layout.tsx

---

## Definition of Done
- [ ] Landing page renders at `/` with all 5 sections
- [ ] Hero includes animated Recharts component with mock data
- [ ] "Get Started" + "Try Demo" dual CTAs present
- [ ] Privacy message visible on landing page
- [ ] `/app` placeholder page renders with disabled upload zone + export guide
- [ ] Serif font configured and rendering for headlines
- [ ] Meta tags (title, description) updated
- [ ] Favicon updated
- [ ] Responsive (mobile + desktop)
- [ ] Scroll animations working
- [ ] Default Next.js assets cleaned up
- [ ] Deployed + live at cursorstats.vercel.app
- [ ] Committed with clean git history

---

## Estimated Effort
1-2 focused sessions

## Next Phase
→ Phase 2: CSV Upload + Summary Dashboard

---

*Status: Spec Complete — Ready to Build*
