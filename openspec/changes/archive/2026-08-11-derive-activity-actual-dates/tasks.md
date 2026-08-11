## 1. Database migration

- [x] 1.1 Create `supabase/migrations/018_activity_actual_dates_derived.sql`
- [x] 1.2 Extend the `recompute_activity_progress` function (from `007_quantity_consumed.sql`) to also compute, for BOQ-linked activities: `actual_start = MIN(entry_date)` and `actual_end` = the `entry_date` (ordered chronologically, not by insertion) at which cumulative `quantity_consumed` first reaches the linked BOQ item's `quantity`; leave `actual_end` unset if the cumulative total hasn't reached the quantity
- [x] 1.3 For activities with no `boq_item_id`, compute `actual_start` the same way (`MIN(entry_date)` over their diary entries) but leave `actual_end` derivation out of this trigger (handled by the completion fallback in 1.5)
- [x] 1.4 Ensure the trigger recalculates correctly on insert, update, and delete of `daily_progress_entries`, including when a backfilled entry changes which `entry_date` is the one crossing the 100% threshold
- [x] 1.5 Add a trigger/policy path on `activities` that, when `status` is updated to `complete` and `actual_end` is not already derived from logs (no BOQ link, or logged quantity below 100%), stamps `actual_end` with the current date and records that it was set manually (e.g. a new `actual_end_source` column or equivalent flag: `'derived' | 'manual'`)
- [x] 1.6 Ensure `actual_start`, `actual_end`, and the new source flag aren't set directly by client update requests — done at the API layer (task 2.1) rather than a DB-level grant, since Postgres RLS is row-level only and this codebase has no column-level GRANT/REVOKE precedent (same convention already used for `progress` on BOQ-linked activities)
- [x] 1.7 Backfill existing activities: run the derivation logic once over current `daily_progress_entries` to populate `actual_start`/`actual_end`/source for activities that already have diary history, so the migration doesn't blank out existing data

## 2. API layer

- [x] 2.1 Remove `actual_start`/`actual_end` from `CreateActivityInput`/`UpdateActivityInput` in `packages/app/src/api/activities.ts`
- [x] 2.2 Confirm `fetchActivities` continues to select `actual_start`, `actual_end`, and the new source flag for display
- [x] 2.3 Update `Activity` type in `packages/app/src/types/index.ts` to include the actual-date source flag and mark `actual_start`/`actual_end` as read-only in comments/typing where relevant

## 3. Activity Schedule UI

- [x] 3.1 Remove the Actual Start / Actual End input fields from the Add/Edit Activity dialog in `packages/app/src/pages/ActivitySchedulePage.tsx`
- [x] 3.2 Add read-only Actual Start / Actual End display on the Activity table (and Gantt tooltip/detail, if shown there) with a label distinguishing "derived from logs" vs. "set manually on completion"
- [x] 3.3 Add a note next to derived Actual End values indicating the date may adjust if diary entries are added or edited later
- [x] 3.4 Verify Planned Start / Planned End inputs are unaffected

## 4. Daily Log UI

- [x] 4.1 Add tooltip/helper text to the Date field on the Log Daily Progress form in `packages/app/src/pages/DailyProgressPage.tsx` clarifying it represents the day the work happened, to support backdating a missed day's entry

## 5. Verification

- [x] 5.1 Manually verify: creating diary entries for a BOQ-linked activity sets `actual_start`/`actual_end` per the spec scenarios (single entry reaches full quantity, cumulative entries, backfilled entry shifts the date, quantity below threshold leaves `actual_end` unset, late entry after completion doesn't push it out)
- [x] 5.2 Manually verify: marking a no-BOQ-link activity complete stamps `actual_end` as manual; marking a BOQ-linked activity complete early (before 100%) also stamps it as manual without altering diary history
- [x] 5.3 Manually verify: Activity Schedule form no longer accepts actual-date input, and the table displays the correct derived/manual label
- [x] 5.4 Confirm `earned-value-tracking` PV/EV outputs are unchanged before/after this migration (spot-check one project)
