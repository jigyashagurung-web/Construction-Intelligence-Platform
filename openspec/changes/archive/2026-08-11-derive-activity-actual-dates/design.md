## Context

`activities.actual_start`/`actual_end` (added in `004_activities.sql`) are plain date columns, editable on the Activity Schedule form exactly like `planned_start`/`planned_end`. Nothing ties them to reality: a Project Manager types them in, or forgets to. Meanwhile `daily_progress_entries` (added in `005_daily_progress.sql`, made quantity-aware in `007_quantity_consumed.sql`) already records, per activity, a diary entry per day worked with an `entry_date` and `quantity_consumed`, and a trigger (`recompute_activity_progress`) already keeps `activities.progress` in sync with those entries for BOQ-linked activities. This change reuses that same mechanism to also derive `actual_start`/`actual_end`, and removes the manual fields so there's only one source of truth.

## Goals / Non-Goals

**Goals:**
- Make `actual_start`/`actual_end` a reliable, always-current reflection of the diary, not a manually maintained duplicate.
- Handle out-of-order/backfilled diary entries correctly (derive from `entry_date` ordering, not insertion order).
- Provide a sane fallback for activities that have no BOQ link, or whose completion is manually declared ahead of the logged quantity.
- Make the derived-vs-manual distinction visible in the UI so a shifting `actual_end` doesn't look like a bug.

**Non-Goals:**
- Changing `earned-value-tracking` formulas — PV/EV do not read `actual_start`/`actual_end` today and continue not to.
- Building the day-wise diary view for Admin/PM — deferred to a later change.
- Preventing/validating implausible diary dates (e.g. `entry_date` before `planned_start`) — out of scope here.
- Adding a new "Work Completed Date" field to the Daily Log — `entry_date` already serves this purpose; only its label/tooltip changes.

## Decisions

**1. Derive `actual_start` as `MIN(entry_date)` across an activity's diary entries.**
Simple and low-risk: the first logged day is a reasonable proxy for when work actually started. Alternative considered: let users override this — rejected for now, since there's no reported need and it reopens the drift problem this change removes. If a real need for override surfaces later, it can be added as an explicit exception path, same as the completion fallback below.

**2. Derive `actual_end`, for BOQ-linked activities, as the `entry_date` at which cumulative `quantity_consumed` (entries ordered by `entry_date`, not by insertion order) first reaches the BOQ item's `quantity`.**
This mirrors the existing `progress` formula (`sum(quantity_consumed) / boq_items.quantity`) exactly, so it's the same computation with a date attached rather than a new concept. Ordering by `entry_date` (rather than `created_at`) is what makes backfilled entries resolve correctly: if a missed Tuesday entry is logged on Thursday and it's the one that pushes the cumulative sum over 100%, `actual_end` becomes Tuesday's date, not Thursday's. Alternative considered: use `MAX(entry_date)` (the latest logged day) as `actual_end` — rejected because it conflates "last time anyone logged anything" with "the day the work was actually finished"; a diary entry logged after completion (e.g. a cleanup note) would wrongly push the end date out.

**3. Recompute both fields inside the existing `recompute_activity_progress` trigger, on the same insert/update/delete events on `daily_progress_entries`.**
One trigger, one code path, no risk of `progress` and `actual_start`/`actual_end` drifting relative to each other. This does mean `actual_end` can move backward in time after the fact (see Risks).

**4. Fallback for no-BOQ-link activities and manual early completion: stamp `actual_end` with the date `status` is changed to `complete`, labeled in the UI as "set manually on completion."**
There is no quantity-crossing event to anchor to in either case (no-BOQ activities keep manual `progress`; manual early completion means the logged quantity hasn't reached 100% yet). Rather than leaving `actual_end` null indefinitely or blocking the status change, the completion action itself becomes the signal. Alternative considered: require the PM to type a specific date when manually completing — rejected as unnecessary friction; "today" is accurate for the common case (marking complete as it happens), and the label makes clear this value isn't diary-derived.

**5. Remove `actual_start`/`actual_end` as form inputs entirely rather than keeping them editable-with-a-default.**
Keeping them editable would preserve the exact drift problem this change exists to fix. If a genuine need for manual correction emerges (e.g. known start date predates any logging), that's a future exception path, not a reason to keep the field open-ended today.

## Risks / Trade-offs

- **[Risk]** A derived `actual_end` can shift backward when a backfilled diary entry, added after the fact, turns out to be the one that crosses the 100% threshold. → **Mitigation**: label the field as "derived from logs" in the UI with a note that it may adjust as entries are added, so this reads as expected behavior, not a bug.
- **[Risk]** No-BOQ-linked activities lose any actual-date tracking until someone manually marks them complete (no diary-quantity signal exists for them). → **Mitigation**: this is a pre-existing limitation of unlinked activities (they already don't get auto-`progress` either); the manual-completion fallback covers the same activities the same way `progress` already treats them.
- **[Risk]** Removing the manual input is a breaking UI/API change for any existing integration or workflow that relies on setting `actual_start`/`actual_end` directly. → **Mitigation**: none of the current specs (`earned-value-tracking`, `daily-progress-quantity-tracking`) read these fields as inputs; impact is limited to the Activity Schedule form itself.
- **[Trade-off]** Correcting a wrong historical `quantity_consumed` entry after an activity is already complete will silently recompute `actual_end` (and possibly `progress`) again. This is consistent with how `progress` already behaves today, so it's not a new trade-off introduced by this change, but it now also affects a date field a report might have already been generated from.

## Migration Plan

1. Add a migration that extends `recompute_activity_progress` (or adds a companion trigger function) to also compute and write `actual_start`/`actual_end` per the rules above, and add a trigger/policy path that stamps `actual_end` when `status` transitions to `complete` on a not-yet-100%-derived activity.
2. Backfill existing rows once: run the same derivation logic over current `daily_progress_entries` to populate `actual_start`/`actual_end` for existing activities, so historical data isn't blanked out by the cutover.
3. Update the Activity Schedule update policy so `actual_start`/`actual_end` are no longer writable via the client update path (trigger-only).
4. Ship the UI changes (remove form inputs, add derived-date display with source label, add Daily Log Date tooltip) in the same release as the DB migration, since the UI assumes the fields are no longer client-settable.
5. Rollback: revert the trigger extension and policy change; the UI would need to redeploy the manual inputs alongside, since a rolled-back DB with the new UI would show read-only fields that never update.

## Open Questions

- Should there be any way to manually correct `actual_start`/`actual_end` for a BOQ-linked activity if the diary data is known to be wrong (e.g. missing entries from before the app was adopted)? Deferred — no current requirement for this; revisit if it comes up in practice.
