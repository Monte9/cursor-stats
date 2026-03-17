# Phase 3 — QA Findings and Polish

> QA session: browser testing of prompt-to-chart at https://cursorstats.vercel.app/demo  
> Date: 2026-03-17  
> For: Ash (implementation polish)

---

## Scope

Tested the live demo: prompt input, suggestion pills, generated charts (horizontalBar, stat, bar), dismiss, and off-topic handling. Findings apply to the deployed behavior.

---

## What Works

- **Pills:** Clicking a suggestion pill fills the input, auto-submits, and disables input + all pills during loading.
- **Charts:** "What's my most expensive model?" returns a horizontalBar (Cost by Model) with correct insight. "What's my cache hit rate?" returns a stat card with 97.2% (matches static card). "When am I most active?" returns Requests by Hour with sensible insight. Data is consistent with the static dashboard.
- **Single slot:** New query replaces the previous chart; no stacking.
- **Dismiss:** The ✕ button removes the generated chart and returns to prompt-only view.
- **Empty submit:** Submit button stays disabled when the textbox is empty, so empty Enter does nothing.
- **Off-topic:** "what's the weather in LA?" produced a stat card with insight "This is your Cursor AI usage data, not weather information" — correct scope handling.

---

## UX Improvements

### 1. Loading state: add a visible skeleton

During the 4–5 second LLM round-trip, the only feedback is disabled input and pills. The spec calls for a "Skeleton chart card pulses below input while LLM responds." If that exists but is not visible (e.g. no pulse, or placed off-screen), make it obvious. If it was cut, add a compact skeleton (e.g. ChartCard-shaped placeholder with pulse animation) so users on slow networks know a chart is being generated.

### 2. Submit button accessibility

The submit control (arrow/send) has no accessible name in the snapshot (`role: button`, no text). Add `aria-label="Submit"` (or equivalent) so screen readers announce it correctly.

### 3. Off-topic stat value is confusing

For "what's the weather in LA?" the app showed a big number **574** (totalRequests) with the insight "This is your Cursor AI usage data, not weather information." The number is irrelevant to the question and can confuse. **Recommendation:** For clearly off-topic or out-of-scope prompts, either (a) show a stat card with no numeric subtitle (e.g. "—" or "N/A") and only the explanatory insight, or (b) use a single-line error-style message below the input instead of a chart (e.g. "I can only answer questions about your Cursor usage. Try costs, models, or activity."). Option (b) keeps the single-slot chart for real answers only.

### 4. 500-character limit visibility

Spec says prompt is limited to 500 chars (client + server). If the UI does not show a counter or truncation, users may not know why a long paste was rejected. Consider a small "X/500" near the input or disabling submit when length > 500, with a short hint on focus or when they hit the limit.

### 5. Error and retry

Spec: "Network error: Show retry button below input." Not tested (no simulated failure). Recommend verifying: on API failure or network error, an inline error message and a "Try again" (or "Retry") button appear below the input and that retry re-sends the last prompt without requiring the user to re-type.

---

## Edge Cases to Validate

| Case | What to check |
|------|----------------|
| **Very short query** | e.g. "cost" or "models" — LLM should still return a valid ChartSpec (e.g. byModel + cost). |
| **Exactly 500 chars** | Submit allowed; 501st character either rejected or truncated with clear feedback. |
| **Rapid double-submit** | Pills/input disabled on first submit; second click does not send duplicate request. |
| **API returns 500** | User sees friendly message + retry, not raw error or blank state. |
| **API returns invalid JSON / bad spec** | Client shows fallback message ("Couldn't generate that chart. Try a different question.") and does not crash. |
| **Missing dataSource for non-stat** | If LLM omits `dataSource` for a bar chart, dynamic renderer shows error fallback (per review v2 note A). |
| **Invalid statKey** | If LLM returns a statKey not on summary, client shows error fallback or ignores and uses insight only (per review v2 note B). |

---

## Suggested Order of Work

1. **Loading skeleton** — Ensure a visible pulse/skeleton below the prompt while the API is in flight.
2. **Submit button** — Add `aria-label="Submit"` (or visible "Submit" text).
3. **Off-topic handling** — Prefer no number for off-topic stat cards, or a short inline message instead of a chart.
4. **500-char UX** — Add "X/500" or equivalent so the limit is discoverable.
5. **Error + retry** — Confirm error message and retry button on network/API failure; document in spec if not already.
6. **Edge-case tests** — Manually run the table above and fix any client or prompt gaps.

---

*Status: QA complete — polish items above for Ash*
