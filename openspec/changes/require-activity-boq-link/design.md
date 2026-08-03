## Context

`activities` (migration 004) has three ways to reference a BOQ line that can disagree with each other: a free-text `wbs_code` column, a free-text `trade` column, and an optional `boq_item_id` FK. `ActivityDialog` (`packages/app/src/pages/ActivitySchedulePage.tsx:415-597`) exposes all three as independent form fields. Only `boq_item_id` is real (an FK to `boq_items`, which already carries the catalog-resolved `wbs_code`, `description`, `unit`, `chapter`, `section`, `revit_category`, `family_type`); the other two are unvalidated free text.

`recompute_activity_progress` (migration 007) already computes an activity's `progress` from `daily_progress_entries.quantity_consumed` summed against `boq_items.quantity`, but only fires when `boq_item_id` is set — otherwise the trigger no-ops and `progress` stays whatever was typed manually.

Precedent already exists in this codebase for exactly this kind of tightening without breaking existing rows: migration 007 made `daily_progress_entries.activity_id` mandatory for new rows purely via the insert RLS policy (`activity_id is not null` in the `WITH CHECK` clause), not a `NOT NULL` column constraint, specifically so pre-existing rows with a null `activity_id` wouldn't be broken.

## Goals / Non-Goals

**Goals:**
- Every newly created Activity resolves to exactly one `boq_items` row (and transitively, one `line_item`-level `boq_code_catalog` code).
- Activity entry becomes a single `BoqCodePicker` selection, matching `BOQDialog`'s pattern — no independent WBS Code or Trade input.
- Progress is always auto-computed once BOQ-linked; the manual Progress input is removed from the dialog since manual entry becomes unreachable.
- Existing Activities rows are not broken or deleted by the migration.

**Non-Goals:**
- Not building a backfill UI/flow to retroactively link existing BOQ-less activities — that's a follow-up if needed, out of scope here.
- Not changing `daily_progress_entries` — its `activity_id` requirement is already in place and unaffected.
- Not changing `boq_items` or `boq_code_catalog` themselves.

## Decisions

- **Enforce the mandatory link via the `activities: insert` RLS policy, not a `NOT NULL` column constraint** — identical mechanism to migration 007's `daily_progress_entries.activity_id`. Alternative considered: `alter table activities alter column boq_item_id set not null`, rejected because it would require a backfill-or-reject decision for any pre-existing null-`boq_item_id` rows at migration time, which is exactly the kind of live-data risk this project treats carefully (see `require-boq-catalog-match`'s own live-verification caution). The policy-only approach makes new rows comply while leaving old rows exactly as they are.
- **Drop `activities.trade` and `activities.wbs_code` entirely, rather than repurposing either as trigger-populated.** `boq_items` already stores the resolved `wbs_code`/`chapter`/`section`/`revit_category`/`family_type` for the linked row; duplicating that onto `activities` via a second trigger (mirroring `boq_items_sync_catalog_fields`) would be redundant denormalization with no read-path benefit, since every activity now always has a `boq_item_id` to join through. The app fetches chapter/section for display by joining `activities.boq_item_id → boq_items` (already the case for `fetchActivities`/`fetchBOQItems` both being queried per-project in `ActivitySchedulePage.tsx`).
- **Remove the manual Progress input from `ActivityDialog` entirely** rather than keeping it as a disabled/dead field — once `boq_item_id` is mandatory, the `initial?.boq_item_id === boqItemId ? initial.progress : 0` branch in the current dialog (line 543-549) is the only reachable path; the manual `<input type="number">` branch (551-555) becomes dead code.
- **Drop the page-level Trade filter** (`tradeFilter` state, `ActivitySchedulePage.tsx:49`, and the `TRADES` constant, lines 32-35) since the column it filters on no longer exists. Not replacing it with a chapter/section filter in this change — that's a UX addition beyond parity, left for a follow-up if wanted.

## Risks / Trade-offs

- [Existing BOQ-less activities remain in a state new activities can no longer be created in] → Acceptable: they keep working exactly as before (manual progress, no BOQ link); only the create/edit path changes. If a project later wants to force-migrate them, that's a separate, explicit change.
- [Removing free-text Trade loses any project-specific trade categorization that didn't map cleanly to a BOQ chapter/section] → Mitigation: `boq_code_catalog`'s chapter/section hierarchy (migration 012 seed) is the same categorization source `boq_items` already committed to; activities inherit whatever granularity that catalog provides. If that's insufficient, it's a catalog-content gap, not something an activity-local free-text field should paper over.
- [Editing an existing BOQ-less activity now forces the user to pick a BOQ item just to save any other field change] → This is an accepted consequence of "mandatory link," per the proposal's explicit decision; flagging here so it's a known, not accidental, UX effect.

## Open Questions

- None blocking — the two items proposal.md flagged as open (existing-row backfill policy, `wbs_code` fate) are resolved above (policy-based enforcement; drop the column). If a project later wants to force-backfill old activities, that's a new change.
