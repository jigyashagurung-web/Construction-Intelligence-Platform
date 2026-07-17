## 1. Database migration

- [x] 1.1 Create `supabase/migrations/009_reporting.sql`: `daily_progress_photos` table (`id`, `entry_id -> daily_progress_entries`, `project_id`, `storage_path`, `caption`, `created_by`, `created_at`) with RLS mirroring `daily_progress_entries` (read: project org members; insert/delete: admin, project_manager, site_engineer)
- [x] 1.2 Add `on delete cascade` from `daily_progress_photos.entry_id` to `daily_progress_entries` so deleting an entry removes its photo rows
- [x] 1.3 Create Supabase Storage bucket `progress-photos` with storage policies scoping read/write to the entry's project organisation, matching the `daily_progress_photos` RLS
- [x] 1.4 Create view `v_daily_progress_rollup` (project_id, entry_date, sum(quantity_consumed), sum(labour_count), sum(equipment_count), count(*) entries)
- [x] 1.5 Create view `v_activity_progress_daily` computing per-project cumulative planned-% (BOQ-`amount`-weighted, equal-weight fallback for unlinked activities) and cumulative actual-% by date, for the S-curve
- [x] 1.6 Apply the migration to the Supabase project and confirm both views return correct rows against existing seeded/test project data

## 2. Types & API

- [x] 2.1 Add `DailyProgressPhoto` type to `packages/app/src/types/index.ts`; add optional `photos?: DailyProgressPhoto[]` to `DailyProgressEntry`
- [x] 2.2 Add `uploadDailyProgressPhoto`/`deleteDailyProgressPhoto` functions to `packages/app/src/api/dailyProgress.ts` (Storage upload + `daily_progress_photos` row insert/delete)
- [x] 2.3 Create `packages/app/src/api/reports.ts`: `fetchDailyRollup(projectId, dateRange)`, `fetchProgressCurve(projectId)`, `fetchProgressPhotos(projectId, filters)` reading from the new views/table

## 3. Dependencies

- [x] 3.1 Add a charting library (Recharts) to `packages/app/package.json`

## 4. Reports page

- [x] 4.1 Create `packages/app/src/pages/ReportsPage.tsx` with Summary / S-curve / Photos tabs (mirroring the Gantt/Table tab pattern in `ActivitySchedulePage.tsx`)
- [x] 4.2 Add route `projects/:projectId/reports` in `routes/index.tsx` and enable the existing (previously disabled) Reports `ModuleCard` on `ProjectDetailPage.tsx`
- [x] 4.3 Summary tab: date-range picker + day/week/month granularity toggle, rollup table/bars from `fetchDailyRollup` (client-side bucketing for week/month from the daily view)
- [x] 4.4 S-curve tab: line/area chart of cumulative planned-% vs actual-% from `fetchProgressCurve`, with a note showing count of activities not weighted by a BOQ link
- [x] 4.5 Photos tab: gallery grid from `fetchProgressPhotos`, filterable by date range and by activity, each photo linking back to its diary entry
- [x] 4.6 Empty states for all three tabs when there is no data in range/at all

## 5. Daily Progress photo capture

- [x] 5.1 Add photo upload control (multi-file) to the `EntryDialog` in `DailyProgressPage.tsx`, gated by the same role check already used for creating entries
- [x] 5.2 Display photo thumbnails in the Daily Progress table row for entries that have attachments
- [x] 5.3 Confirm deleting a diary entry removes its attached photos (DB cascade) and their Storage objects

## 6. Verification

- [x] 6.1 `tsc --noEmit` and `vite build` pass
- [x] 6.2 Manually log entries across at least two weeks/months for a BOQ-linked and a non-BOQ-linked activity; confirm the Summary rollup and S-curve reflect them correctly, including the unweighted-activities note
- [x] 6.3 Manually attach a photo while logging an entry, confirm it appears in both the Daily Progress table and the Reports Photos gallery, and disappears from both after deleting the entry — found and fixed a bug: `deleteDailyProgressEntry` (`api/dailyProgress.ts`) only deleted the `daily_progress_entries` row, never calling `storage.remove()` for that entry's photos, leaving orphaned Storage objects after the DB row cascaded away. Fixed by fetching the entry's photo `storage_path`s and removing them from the `progress-photos` bucket before deleting the entry. Re-verified end-to-end: entry + photo disappear from the Daily Progress table and Reports Photos gallery, and the Storage object is confirmed gone via a direct Storage API listing (pre-existing unrelated photos untouched).
- [x] 6.4 Confirm a user from a different organisation cannot read another project's rollup, S-curve, or photos (RLS/storage policy check) — tested by creating a second organisation and moving the test account's `profiles.org_id` to it; the reporting-specific data (rollup, S-curve, photo gallery, and the underlying Daily Progress table) was correctly empty for the other org. While testing this, found a separate, unrelated, and more severe bug: `projects`, `boq_items`, `materials`, `project_materials`, and `material_transactions` each carried an untracked `"<table>: all"` RLS policy (`auth.role() = 'authenticated'`, no org scoping) not present in any prior migration, which let any authenticated user read/insert/update/delete any org's rows in those five tables — bypassing the correctly org-scoped policies already sitting next to it. Fixed in `supabase/migrations/010_fix_cross_org_rls_leak.sql` (drops the leaky policies, restores proper org-scoped `read` policies) and verified both directions: cross-org access is now blocked and same-org access is unaffected. `daily_progress_entries`, `daily_progress_photos`, and `activities` were not affected by this bug.
