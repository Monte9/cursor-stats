# Phase 4: Dashboard Bug Fixes

> Goal: Fix the three real bugs discovered via live mobile testing before public launch. These are the actual blockers — not the hypothetical overflow issues the original spec was based on.

---

## Context

Phase 4 was originally scoped as "Mobile & Responsive Polish" based on static screenshots. Live browser testing at iPhone SE (375px) and iPhone 14 Pro (393px) showed that most of those issues are already fixed. The three real remaining bugs are:

1. Dashboard renders blank on initial load due to Recharts `ResponsiveContainer` width=-1
2. React hydration error #418 on every `/demo` load
3. Y-axis model name clipping (first character cut off on mobile)

**Tested viewports:**
- iPhone SE (375×667) — charts render but Y-axis clips
- iPhone 14 Pro (393×852) — dashboard blank on load, recovers after ~3s
- Desktop (1440×900) — works fine

---

## Bug 1: Recharts `ResponsiveContainer` fires with `width=-1`

**Symptom:** Dashboard is completely blank on initial load at 393px. Recovers after ~3 seconds once the browser completes layout. Console logs:
```
The width(-1) and height(-1) of chart should be greater than 0,
please check the style of container...
```

**Root cause:** Charts sit inside a `grid grid-cols-1 lg:grid-cols-2` layout. Grid items in a flex/grid context don't clamp their intrinsic width by default — without `min-width: 0`, the `ResizeObserver` that `ResponsiveContainer` uses can return -1 on the first paint before layout stabilizes. This is a known Recharts/CSS Grid interaction.

**Affected files:**
- `src/components/app/dashboard.tsx` — four chart wrappers:
  - `<div className="h-64">` (Your AI Usage bar chart)
  - `<div className="h-64">` (Cost Over Time bar chart)
  - `<div className="h-56">` (When You Code hourly chart)
  - `<div className="h-56">` (Cost per Request chart)
- `src/components/app/dynamic-chart.tsx` — `<div className="h-64">` wrapping the dynamic chart

**Fix:**

Add `min-w-0` to every chart height wrapper:

```tsx
// Before
<div className="h-64">
  <ResponsiveContainer width="100%" height="100%">

// After
<div className="h-64 min-w-0">
  <ResponsiveContainer width="100%" height="100%">
```

This forces the grid child to respect its column boundary and gives `ResizeObserver` a real width to measure immediately on first paint.

---

## Bug 2: React hydration error #418

**Symptom:** `Minified React error #418` logged on every `/demo` load. This is a text node mismatch — the server renders one string, the client renders a different one.

**Root cause:** Date formatting in `dashboard.tsx` uses locale- and timezone-sensitive APIs without pinning:

```tsx
// In the "Priciest Request" stat card — no locale or timezone:
stats.mostExpensiveRequest.date.toLocaleDateString()

// In formatDateOrdinal — locale pinned but not timezone:
date.toLocaleDateString("en-US", { month: "long" })
date.getDate()  // uses host timezone
date.getFullYear()  // uses host timezone
```

If Vercel's server timezone differs from the browser's timezone, calendar day/month can differ for dates near midnight, producing different HTML strings between SSR and hydration.

**Affected file:** `src/components/app/dashboard.tsx`

**Fix:**

Pin all `toLocaleDateString` calls with `timeZone: "UTC"` and pin `getDate()` / `getFullYear()` to UTC equivalents:

```tsx
function formatDateOrdinal(date: Date): string {
  const month = date.toLocaleDateString("en-US", { month: "long", timeZone: "UTC" });
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  const suffix = day === 1 || day === 21 || day === 31 ? "st"
    : day === 2 || day === 22 ? "nd"
    : day === 3 || day === 23 ? "rd"
    : "th";
  return `${month} ${day}${suffix}, ${year}`;
}
```

For `mostExpensiveRequest.date.toLocaleDateString()` in the stat card display:

```tsx
// Before
stats.mostExpensiveRequest.date.toLocaleDateString()

// After
stats.mostExpensiveRequest.date.toLocaleDateString("en-US", { timeZone: "UTC" })
```

Also check `src/lib/format.ts` for any `toLocaleString` / `toLocaleDateString` calls without pinned locale and timezone.

---

## Bug 3: Y-axis label clips first character

**Symptom:** `claude-4.6-sonnet-medium-thinking` renders as `laude-4.6-sonnet-medium-thinking` on mobile — the "C" is cut off at the left edge of the chart card.

**Root cause:** `YAxis width={180}` on horizontal bar charts. At 375px viewport with `px-4` padding (16px each side), the card content area is ~343px. A 180px Y-axis leaves only ~163px for bars. The label text at `fontSize={11}` overflows the 180px boundary to the left, where the card's `overflow: hidden` clips it.

**Affected files:**
- `src/components/app/dashboard.tsx` — both horizontal bar charts use `width={180}`:
  - Your AI Usage (model breakdown)
  - Cost per Request
- `src/components/app/dynamic-chart.tsx` — `horizontalBar` type uses `width={180}`

**Fix — two-part:**

**Part A:** Add a `truncateModel()` helper to `src/lib/format.ts`:

```ts
// Shorten long model names for chart Y-axis labels
// "claude-4.6-sonnet-medium-thinking" → "claude-4.6-snt-med"
export function truncateModel(model: string, maxLen = 20): string {
  if (model.length <= maxLen) return model;
  return model.slice(0, maxLen - 1) + "…";
}
```

**Part B:** Apply truncation to chart data before rendering, and reduce `YAxis width` from `180` to `140`:

```tsx
// In dashboard.tsx — Your AI Usage and Cost per Request charts:
<BarChart data={stats.byModel.slice(0, 6).map(m => ({ ...m, model: truncateModel(m.model) }))} layout="vertical">
  ...
  <YAxis type="category" dataKey="model" stroke="#a1a1aa" fontSize={11} width={140} ... />
```

Apply the same truncation in `dynamic-chart.tsx` for `horizontalBar` type.

---

## Implementation Plan

### Step 1: Fix Y-axis clipping
- Add `truncateModel()` to `src/lib/format.ts`
- Apply to `byModel` data in `dashboard.tsx` (both horizontal charts)
- Apply to horizontal bar data in `dynamic-chart.tsx`
- Reduce `YAxis width` from `180` → `140` in both files

### Step 2: Fix Recharts `ResponsiveContainer` width=-1
- Add `min-w-0` to all chart height wrappers in `dashboard.tsx` (4 divs)
- Add `min-w-0` to chart wrapper in `dynamic-chart.tsx` (1 div)

### Step 3: Fix hydration error
- Update `formatDateOrdinal` to use `getUTCDate()`, `getUTCFullYear()`, and `timeZone: "UTC"`
- Update `mostExpensiveRequest.date.toLocaleDateString()` to pin locale + timezone
- Audit `src/lib/format.ts` for any unpinned locale/timezone calls

### Step 4: Verify
- Test on iPhone SE (375px) — no character clipping, charts render immediately
- Test on iPhone 14 Pro (393px) — no blank dashboard on load
- Check browser console — no hydration error #418
- Confirm desktop still works (1440px)
- Push to main → auto-deploy to Vercel, verify prod

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/format.ts` | Add `truncateModel()` helper |
| `src/components/app/dashboard.tsx` | Apply `truncateModel()` to model data, `YAxis width={140}`, add `min-w-0` to 4 chart wrappers, fix date timezone pinning |
| `src/components/app/dynamic-chart.tsx` | Apply `truncateModel()` for `horizontalBar`, `YAxis width={140}`, add `min-w-0` to chart wrapper |

---

## Definition of Done

- [ ] No `width=-1` Recharts errors in browser console at any viewport
- [ ] No React hydration error #418 in console on `/demo` load
- [ ] Y-axis labels fully visible on mobile (no character clipping)
- [ ] Dashboard charts render immediately on load at 375px and 393px
- [ ] Desktop (1440px) unchanged — all charts render correctly
- [ ] Build passes, deployed to prod, no console errors

---

## Estimated Effort

1 focused session (~1 hour)

## Next Phase

→ Phase 5: Launch (domain, OG image, SEO, social posts)

---

*Status: Spec Written — Ready to Implement*
