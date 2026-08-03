## 1. Database migration

- [x] 1.1 Add a new migration (e.g. `016_activities_require_boq_link.sql`) that: drops `activities.trade`, drops `activities.wbs_code`, and replaces the `activities: insert` RLS policy with one that also requires `boq_item_id is not null` (mirroring `daily_progress_entries: insert` from migration 007 — policy-enforced, not a `NOT NULL` column constraint, so existing null-`boq_item_id` rows aren't broken). File authored at `supabase/migrations/016_activities_require_boq_link.sql`; not yet applied to any live database — see verification tasks.
- [x] 1.2 Confirm the `activities: update` policy does not need the same `boq_item_id is not null` check — editing an existing (possibly legacy BOQ-less) activity's other fields should still be allowed per design.md's accepted trade-off; only decide otherwise if this is explicitly revisited. Confirmed: `activities: update` left untouched in the migration.

## 2. Types and API

- [x] 2.1 In `packages/app/src/types/index.ts`, update the `Activity` interface: remove `wbs_code`/`trade`, make `boq_item_id` non-nullable (`string`, not `string | null`).
- [x] 2.2 In `packages/app/src/api/activities.ts`, update `CreateActivityInput` (and any update input type): remove `wbs_code`/`trade`, make `boq_item_id` required.

## 3. ActivityDialog UI

- [x] 3.1 In `packages/app/src/pages/ActivitySchedulePage.tsx`, replace the WBS Code input, Trade select, and BOQ Item select in `ActivityDialog` with a single BOQ item selection control. **Deviation from the task as written**: `BoqCodePicker` resolves a `boq_code_catalog` code (chapter→line_item walk), but `activities.boq_item_id` is an FK to `boq_items` — an actual priced/quantified project row, not a catalog code directly. Reusing `BoqCodePicker` verbatim would let a user pick a catalog code with no corresponding `boq_items` row in this project, which can't satisfy the FK. Built a new local `BoqItemPicker` component instead (same searchable-typeahead UX as `BoqCodePicker`'s steps, styled identically) over the project's existing `boqItems` array, resolving `boq_item_id` directly. Also added `boqItemById` lookup map in the page and threaded it into `GanttView`/`TableView` to replace the old `a.wbs_code`/`a.trade` displays with the linked BOQ item's `wbs_code`/`chapter` (per the "Chapter and section displayed from the linked BOQ item" spec requirement) — this was a necessary consequence of dropping those columns from `Activity`, not called out as a separate task originally.
- [x] 3.2 Remove the manual Progress `<input>` branch; Progress is always rendered as the read-only auto-calculated display, since `boqItemId` is now always set.
- [x] 3.3 Update `handleSubmit`: drop `wbs_code`/`trade` from the submitted payload; `progress` is never sent (always auto-computed).
- [x] 3.4 Remove the `TRADES` constant and the page-level `tradeFilter` state/dropdown/derived `trades` list, since the `trade` field no longer exists.
- [x] 3.5 Submit button is disabled (with an explanatory `title`) until `canSubmit` (`boqItemId && name && plannedStart && plannedEnd`) is satisfied, consistent with the new mandatory-link requirement.

## 4. Spec sync prep

- [x] 4.1 Verify the new delta spec at `openspec/changes/require-activity-boq-link/specs/activity-entry/spec.md` and the modified `boq-item-entry` delta match implemented behavior once code changes land. Caught one gap during verification: the "chapter and section" requirement wasn't fully met (only chapter was surfaced) — fixed by showing `chapter / section` in both `TableView` and `GanttView`.

## 5. Verification

- [x] 5.1 Run `tsc --noEmit` for `packages/app` — confirm no type errors from the `Activity`/`CreateActivityInput` changes. Passes clean.
- [ ] 5.2 Manually verify (real project, same caution as prior BOQ changes — needs explicit go-ahead before writing real data): creating an activity requires picking a BOQ item; submitting without one is blocked; after creation, progress reflects logged Quantity Consumed with no manual override available; existing BOQ-less activities (if any) still load and can still be edited for non-link fields.
- [ ] 5.3 Verify via direct DB check (matching the approach used for `require-boq-catalog-match`): attempt an insert into `activities` with `boq_item_id` null through the REST API using a real session token — confirm it's rejected by the updated RLS policy, not just blocked client-side.
