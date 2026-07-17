## Context

Every Phase 1 data-entry module (BOQ, Activity Schedule, Daily Progress, Materials) is built and live; nothing rolls the data up into a project-health view. All the source data already exists:

- `activities` — `progress`, `status`, `planned_start`/`planned_end`, `boq_item_id`
- `daily_progress_entries` — `entry_date`, `quantity_consumed`, `labour_count`, `equipment_count`, `activity_id`
- `boq_items` — `quantity`, `unit_rate`, `amount` (generated column)

A project's `daily_progress_entries` and `activities` row counts are small (site-diary cadence, months not years of history per project), so this doesn't need a data-warehouse-grade pipeline — but the S-curve specifically needs a cumulative-over-time computation that's awkward to get right doing ad-hoc client-side reduces on every page load, and will only get slower as project history grows.

## Goals / Non-Goals

**Goals:**
- One Reports page per project: date-ranged rollup (day/week/month), an S-curve chart, and a photo gallery.
- Correct, RLS-respecting, read-only aggregation — no new write workflows other than attaching a photo to a diary entry.
- Reuse the existing role model unchanged; no new roles or permission tiers.

**Non-Goals:**
- No PDF/CSV export (future iteration, not blocking Phase 1 sign-off).
- No cross-project portfolio reporting — this is single-project, matching every other module's scope.
- No forecasting/prediction on top of the S-curve (that's Phase 2 — Delay Prediction, out of scope here).
- No video or annotation on progress photos — plain image capture/display only.

## Decisions

### 1. Aggregate in SQL views, not client-side reduces
Add two Postgres views (`009_reporting.sql`):
- `v_activity_progress_daily` — one row per project/activity/day already covered by an entry, with a running planned-% and actual-% for the S-curve.
- `v_daily_progress_rollup` — one row per project/day with summed `quantity_consumed`, `labour_count`, `equipment_count`, and entry count.

The client buckets `v_daily_progress_rollup` into week/month client-side (simple date-truncation grouping, no extra views needed) rather than adding `_weekly`/`_monthly` view variants — three near-duplicate views is more surface area than one view plus a `date-fns` groupBy.

**Alternative considered**: fetch raw `activities` + `daily_progress_entries` and reduce entirely in the browser (like every other page does today). Rejected for the S-curve specifically — cumulative planned-vs-actual is a running sum across all of a project's activities and dates, and computing it correctly (especially the planned-baseline curve, independent of when diary entries exist) is meaningfully simpler as a SQL window function than as hand-rolled JS state. The rollup queries could go either way; kept them as views for consistency with the S-curve view and to avoid two data-fetching patterns on one page.

### 2. Planned-vs-actual weighting uses BOQ `amount`, falls back to equal weight
The planned curve needs a way to say "this activity is worth X% of the project." Use each activity's linked BOQ item's `amount` (`quantity * unit_rate`, already a generated column) as its weight; activities with no BOQ link split the remaining weight equally. This mirrors how the rest of the platform already treats BOQ-linked activities as the source of truth for quantity-driven progress (see `daily-progress-quantity-tracking`).

**Alternative considered**: weight by planned duration (days). Rejected — duration says nothing about cost/effort share, and a 1-day critical task would round to near-zero weight, distorting the curve for exactly the activities most worth watching.

**Open question**: this is a reasonable v1 proxy, not a real earned-value baseline (Phase 2's Delay Prediction module owns proper EVA/PV/EV/AC). Flagged here so it isn't mistaken for that later.

### 3. Progress photos: a separate `daily_progress_photos` table, not a single column
A diary entry can have more than one site photo (before/after, multiple angles). Add:
```
daily_progress_photos (
  id, entry_id -> daily_progress_entries, project_id, storage_path, caption, created_by, created_at
)
```
plus a Supabase Storage bucket `progress-photos`, path convention `{project_id}/{entry_id}/{uuid}-{filename}`, with storage policies mirroring the existing project-org-scoped RLS pattern (read: any org member on the project; write: same roles as `daily_progress: insert`).

**Alternative considered**: a single nullable `photo_url` column on `daily_progress_entries`. Simpler, but caps entries at one photo and would need a breaking migration to widen later — not worth it for the marginal complexity of one small child table.

### 4. Charting library: Recharts
No chart library exists in `packages/app/package.json` yet. Recharts is the pragmatic choice — React-native API, no D3 boilerplate, sufficient for a line/area S-curve and simple bar rollups. Apply the project's `dataviz` design conventions (palette, axis/legend rules) when building the actual chart components.

### 5. Reports page structure: tabs, not separate routes
One route `projects/:projectId/reports` with an internal tab switcher (Summary / S-curve / Photos), matching the existing `ActivitySchedulePage` Gantt/Table toggle pattern — avoids three new routes and three new nav entries for what is one conceptual "Reports" destination.

## Risks / Trade-offs

- **[Risk]** SQL views add a new class of migration (views vs. tables) the codebase hasn't used yet → **Mitigation**: keep both views narrow and single-purpose; document them inline in the migration like the existing trigger functions are documented.
- **[Risk]** BOQ-`amount`-weighted planned curve can look wrong for projects where most activities aren't BOQ-linked (falls back to equal weight, which is a rough approximation) → **Mitigation**: surface a small "N of M activities have no BOQ link" note on the S-curve so the weighting caveat is visible, not silent.
- **[Trade-off]** Storing photos as Storage objects + a metadata table (vs. a simpler base64/URL-only approach) adds one more moving part (bucket policies) → accepted, since it's the same pattern Supabase-based apps use everywhere and keeps large binary data out of Postgres rows.

## Migration Plan

1. `009_reporting.sql`: `daily_progress_photos` table + RLS, `progress-photos` storage bucket + storage policies, `v_activity_progress_daily` and `v_daily_progress_rollup` views.
2. Ship `api/reports.ts` and `ReportsPage.tsx` reading the new views; no changes required to existing pages except the photo-upload addition to the Daily Progress entry dialog.
3. Rollback: drop the two views and the `daily_progress_photos` table/bucket; no existing table is altered, so rollback has zero blast radius on other modules.
