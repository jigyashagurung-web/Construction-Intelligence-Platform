## 1. Database migration

- [x] 1.1 Create `supabase/migrations/007_quantity_consumed.sql`: add `quantity_consumed numeric(18,4) not null default 0` to `daily_progress_entries` with `check (quantity_consumed >= 0)`
- [x] 1.2 Add insert-check requiring `activity_id is not null` for new `daily_progress_entries` rows (update the existing `daily_progress: insert` policy)
- [x] 1.3 Add `set_activity_progress()` trigger function: recompute `activities.progress` from `sum(quantity_consumed) / boq_items.quantity * 100` (clamped to 100) for the affected activity, only when it has a `boq_item_id`
- [x] 1.4 Add `after insert or update or delete on daily_progress_entries` trigger calling `set_activity_progress()`
- [x] 1.5 Apply the migration to the Supabase project and confirm existing rows keep `quantity_consumed = 0` without error

## 2. Types & API

- [x] 2.1 Update `packages/app/src/types/index.ts`: `DailyProgressEntry.quantity_consumed: number`, `activity_id: string` (no longer optional/nullable)
- [x] 2.2 Update `packages/app/src/api/dailyProgress.ts` create/update payload types to require `quantity_consumed` and `activity_id`

## 3. Log Daily Progress form

- [x] 3.1 Add mandatory "Quantity Consumed" number input to `EntryDialog` in `DailyProgressPage.tsx`, required and `min="0"`
- [x] 3.2 Make the Activity select required in `EntryDialog` (remove "— None —" option, add `required`)
- [x] 3.3 Resolve and display the selected activity's linked BOQ item unit as read-only text next to the Quantity Consumed input (fetch/derive from `activities` + `boq_items`); show no unit label when the activity has no linked BOQ item
- [x] 3.4 Add "Qty Consumed" column to the Daily Progress table (with unit where available)

## 4. Activity Schedule progress display

- [x] 4.0 Add a "BOQ Item" selector to the Add/Edit Activity dialog in `ActivitySchedulePage.tsx` (optional, populated from `fetchBOQItems(projectId)`) so activities can actually be linked and exercise the derived-progress trigger
- [x] 4.1 In `ActivitySchedulePage.tsx`, make the `progress` value read-only (derived) for activities with a `boq_item_id` in both Gantt and Table views; keep it editable for activities without a BOQ item link
- [x] 4.2 Add a tooltip/label clarifying that progress is auto-calculated from logged Quantity Consumed for BOQ-linked activities

## 5. Verification

- [x] 5.1 `tsc --noEmit` and `vite build` pass
- [x] 5.2 Manually log a diary entry with quantity consumed against a BOQ-linked activity and confirm the activity's progress updates correctly (including the 100% clamp case)
- [x] 5.3 Confirmed activities without a BOQ item link are untouched by the trigger (stayed at 0%/16% respectively while the linked activity updated). Could NOT confirm manual progress *editing* still works end-to-end — blocked by an unrelated pre-existing bug (see note below), verified correct by code inspection instead.
- [x] 5.4 Confirmed submitting the diary form without quantity or without an activity is blocked client-side (dialog stays open, no request sent), and a direct insert without `activity_id` is rejected by the DB (403, RLS policy violation)
