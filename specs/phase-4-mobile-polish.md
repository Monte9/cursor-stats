# Phase 4: Mobile & Responsive Polish

> Goal: Fix all mobile/tablet layout issues so the site is shareable and looks professional on every device. This is the launch blocker.

---

## Context

Desktop experience is solid (Phases 0-3 complete). But mobile is broken — horizontal overflow, text clipping, charts unreadable, dashboard nearly blank on small screens. Since Diego already shared the Slack link (people will tap on phones), this must be fixed before any public launch.

**Screenshots:** `~/Projects/tmp/cursor-stats-research/cs-mobile-*.png`, `cs-tablet-*.png`

**Viewports tested:**
- iPhone SE (375×667)
- iPhone 14 Pro (393×852)
- iPad (768×1024)
- Desktop (1440×900) — works fine

---

## Critical Issues (P0)

### 1. Root horizontal overflow
**Affects:** All pages on mobile
**Symptom:** Multiple elements clip on the right edge — nav button, banner text, suggestion chips, chart cards
**Root cause:** No global overflow-x constraint. Individual elements (chart cards, hero preview, nav) exceed viewport width.

**Fix:**
```css
/* src/app/globals.css */
html, body {
  overflow-x: hidden;
}
```
Plus audit individual components for fixed widths that exceed mobile viewport.

### 2. Hero chart preview card overflows on mobile
**Affects:** Landing page (`/`)
**Symptom:** The glassmorphism hero card with model breakdown chart bleeds off the right edge. Y-axis labels (`claude-4.6-opus-high-thinking`) are too wide for mobile.
**File:** `src/components/landing/hero-chart.tsx`

**Fix:**
- Reduce Y-axis width from 180px on mobile (e.g. `width={typeof window !== 'undefined' && window.innerWidth < 640 ? 100 : 180}` or use a responsive hook)
- Truncate long model names on mobile (e.g. show "claude-4.6-opus" instead of full name)
- Add `overflow-hidden` to the card wrapper
- Consider hiding the hero chart entirely on very small screens (`hidden sm:block`) and showing just the CTAs

### 3. Dashboard charts unreadable on mobile
**Affects:** `/demo` and `/app` dashboard
**Symptom:** Chart cards are tiny and compressed. Y-axis labels in Model Breakdown overflow. Cost per Request chart is nearly invisible.
**Files:** `src/components/app/dashboard.tsx`

**Fix:**
- Chart cards should be full-width single-column on mobile (already `grid-cols-1 lg:grid-cols-2` — verify this works)
- Reduce Y-axis `width` on Model Breakdown for mobile (180px is too wide on a 375px screen)
- Consider truncating model names in stats.ts or in the chart component (e.g. `claude-4.6-opus-high-thinking` → `opus-high-thinking`)
- Ensure `ResponsiveContainer` has proper parent height constraints

### 4. Landing page subtitle text clipping
**Affects:** Landing hero
**Symptom:** "Your data never leaves your bro..." truncates mid-word
**File:** `src/components/landing/hero.tsx`

**Fix:**
- Ensure the subtitle `<p>` has no `whitespace-nowrap` or constrained width
- Add `px-6` (or increase from `px-4`) on the hero section for more breathing room on mobile
- Test that `max-w-2xl` doesn't clip at 375px viewport

---

## High Priority (P1)

### 5. Excessive top whitespace on landing (mobile)
**Symptom:** ~40% of the mobile viewport is empty dark space above the hero content
**Cause:** `min-h-screen` + `justify-center` pushes content to vertical center, but the nav is hidden on initial load (scroll-triggered), creating dead space above.

**Fix:**
- On mobile, reduce hero `py-20` to `py-12` or `pt-16 pb-12`
- Consider `min-h-[80vh]` instead of `min-h-screen` on mobile to pull content up

### 6. Hero headline orphan word
**Symptom:** "See what your AI usage really looks like" wraps so "like" is alone on a line at tablet width
**File:** `src/components/landing/hero.tsx`

**Fix:**
- Reduce headline font size at `md` breakpoint (e.g. `md:text-5xl` instead of jumping to `md:text-6xl`)
- Or add `text-balance` (Tailwind v4 has this) to distribute words more evenly

### 7. Prompt suggestion pills overflow on mobile
**Affects:** Dashboard prompt input
**Symptom:** Pills wrap but the last one clips at the edge
**File:** `src/components/app/prompt-input.tsx`

**Fix:**
- Add `overflow-x-auto` to the pills container for horizontal scrolling
- Or ensure pills wrap fully with `flex-wrap` (already have this — verify padding)
- Add `pb-1` to prevent the bottom of pills from clipping

### 8. Demo banner text clipping
**Affects:** `/demo` dashboard
**Symptom:** "Viewing demo data — Upload your own CSV" wraps awkwardly or clips
**File:** `src/components/app/dashboard.tsx`

**Fix:**
- Make banner text `text-xs sm:text-sm` so it fits on mobile
- Or stack the text + link vertically on mobile

---

## Medium Priority (P2)

### 9. Nav bar on mobile
**Symptom:** "Launch App" button clips on very small screens
**File:** `src/components/landing/nav.tsx`

**Fix:**
- Reduce button padding on mobile: `px-3 sm:px-4`
- Or abbreviate to "Launch" on small screens

### 10. Chart card labels too small
**Affects:** All chart cards on mobile
**Symptom:** X and Y axis labels, chart titles, and "cursorstats.com" watermark are barely readable

**Fix:**
- Accept that detailed charts aren't ideal on mobile — the numbers matter more than the chart shapes
- Ensure stat card numbers (big text) are readable
- Consider showing a simplified view on mobile (just stat numbers, no charts) as a future enhancement

### 11. Fun stats row (3 cards) on mobile
**Affects:** Dashboard bottom section
**Symptom:** `grid-cols-1 md:grid-cols-3` should stack on mobile — verify it does

**Fix:**
- Verify this works. If the cards are too tall when stacked, reduce padding

### 12. Upload page mobile
**Affects:** `/app`
**Symptom:** Should be mostly fine (simple centered layout), but verify:
- Drop zone touch targets
- Privacy banner wrapping
- Export guide collapsible works on touch

---

## Implementation Plan

### Step 1: Global overflow fix + padding
- Add `overflow-x: hidden` to html/body in globals.css
- Increase base horizontal padding from `px-4` to `px-4 sm:px-6` on main containers

### Step 2: Hero section mobile fixes
- Reduce `py-20` to `py-12 sm:py-20`
- Fix subtitle wrapping
- Hide or simplify hero chart on small screens
- Adjust headline size at md breakpoint

### Step 3: Dashboard chart responsiveness
- Truncate model names for mobile chart labels
- Reduce Y-axis width on mobile
- Verify grid stacking works
- Fix demo banner text wrapping

### Step 4: Prompt input + pills
- Horizontal scroll or better wrapping for suggestion pills
- Verify textarea works well on mobile keyboard

### Step 5: Cross-device QA
- Test iPhone SE (375px), iPhone 14 (393px), iPad (768px)
- Test landscape mode
- Test with keyboard open (mobile input)
- Verify touch targets (buttons, pills, dismiss ✕)

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/app/globals.css` | Add `overflow-x: hidden` on html/body |
| `src/components/landing/hero.tsx` | Mobile padding, heading size, hero chart visibility |
| `src/components/landing/hero-chart.tsx` | Responsive Y-axis width, model name truncation |
| `src/components/landing/nav.tsx` | Mobile button sizing |
| `src/components/app/dashboard.tsx` | Banner text, chart Y-axis, grid verification |
| `src/components/app/prompt-input.tsx` | Pills overflow/wrapping |
| `src/components/app/dynamic-chart.tsx` | Mobile Y-axis width |
| `src/lib/format.ts` | Optional: add `truncateModel()` helper |

---

## Definition of Done

- [ ] No horizontal scrollbar on any page at any viewport (375px → 1440px)
- [ ] Landing page: hero text fully readable, no clipping
- [ ] Landing page: hero chart card contained within viewport (or hidden on very small screens)
- [ ] Dashboard: all chart cards stack single-column on mobile
- [ ] Dashboard: chart labels readable (or gracefully truncated)
- [ ] Dashboard: stat numbers (big text) clearly readable on mobile
- [ ] Prompt input: textarea usable with mobile keyboard
- [ ] Suggestion pills: fully visible or scrollable
- [ ] Demo banner: text wraps cleanly
- [ ] Touch targets: all buttons ≥ 44px tap area
- [ ] Tested on iPhone SE (375px), iPhone 14 (393px), iPad (768px)
- [ ] Build passes, deployed, no console errors

---

## Estimated Effort

1 focused session (~2 hours)

## Next Phase
→ Phase 5: Launch (domain, OG image, social posts)

---

*Status: Spec Written — Awaiting Review*
