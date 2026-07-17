## Why

The platform already captures everything needed to answer "how is this project doing" — activity progress, daily site diary entries with quantities consumed, BOQ quantities, and material transactions — but there is no page that rolls any of it up. Project Setup, BOQ, Activity Schedule, Daily Progress, Materials, and Team are all built (see `openspec/changes/construction-intelligence-platform/tasks.md`); Reporting is the last read-only Phase 1 module standing between the current per-record views and a PM/executive-level picture of project health.

## What Changes

- Add a **Reports** page per project with three views: Daily/Weekly/Monthly summary, S-curve, and a Progress Photos gallery, gated behind project navigation like the other modules.
- Add **rollup views** (daily / weekly / monthly) aggregating `daily_progress_entries` (labour, equipment, quantity consumed, entries logged) and `activities` (status mix, at-risk/delayed count) over a selected date range.
- Add an **S-curve**: cumulative planned % complete (derived from `activities.planned_start`/`planned_end`, weighted by BOQ `amount` where linked) plotted against cumulative actual % complete (derived from `activities.progress` history via `daily_progress_entries.entry_date`), per project.
- Add **progress photo attachments** to daily progress entries: an optional `photo_url` (or small `daily_progress_photos` table for multiple photos per entry — decided in design.md) plus a Supabase Storage bucket, surfaced as a filterable gallery in Reports and inline on the existing Daily Progress log.
- **BREAKING**: none — purely additive; no existing table/column is renamed or removed.

## Capabilities

### New Capabilities
- `progress-reporting`: daily/weekly/monthly progress rollups and a planned-vs-actual S-curve, computed read-only from existing activity, daily progress, and BOQ data, scoped per project and role.

### Modified Capabilities
- `daily-progress-quantity-tracking`: diary entries gain an optional photo attachment captured at log time and surfaced in both the Daily Progress log and the new Reports gallery.

## Impact

- **Database**: new migration `009_reporting.sql` — a Supabase Storage bucket for progress photos, a `photo_url`/photo-table addition to `daily_progress_entries`, and (likely) one or two SQL views or RPCs for the rollup and S-curve aggregations rather than pulling raw rows into the client.
- **API**: new `packages/app/src/api/reports.ts` for rollup/S-curve queries; `api/dailyProgress.ts` create/update payloads gain the photo field.
- **UI**: new `packages/app/src/pages/ReportsPage.tsx` + route `projects/:projectId/reports`, nav entry in `AppLayout.tsx`; `DailyProgressPage.tsx` gains a photo upload control on the entry dialog and a thumbnail in the table.
- **Dependencies**: no charting library is in `packages/app/package.json` today — this change introduces one (e.g. Recharts) for the S-curve.
- **Permissions**: read access follows existing project membership (all roles); photo upload on diary entries follows the existing `daily_progress: insert`/`update` role restrictions (admin, project_manager, site_engineer).
