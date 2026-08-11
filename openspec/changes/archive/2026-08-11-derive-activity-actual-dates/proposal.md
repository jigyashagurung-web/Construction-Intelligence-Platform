## Why

`activities.actual_start` and `activities.actual_end` are currently manual, free-text date fields entered on the Activity Schedule form, with no connection to the Daily Log (site diary). This lets the two data sources drift apart — a Project Manager can forget to update actual dates, or type a value that contradicts what the diary shows — and was flagged as a known data-integrity gap during the earned-value-tracking design work. Since the Daily Log already records, per activity, the dates work happened and (for BOQ-linked activities) the quantity consumed each day, the same data can derive actual start/end automatically, removing the double bookkeeping and the drift.

## What Changes

- **BREAKING**: Remove the "Actual Start" and "Actual End" input fields from the Activity Schedule add/edit form. They become read-only, system-derived values displayed on the Activity table/Gantt, not user-entered fields on `CreateActivityInput`/`UpdateActivityInput`.
- Derive `activities.actual_start` as the earliest `entry_date` across that activity's daily progress entries.
- Derive `activities.actual_end`, for BOQ-linked activities, as the `entry_date` of the diary entry that — when entries are ordered chronologically by `entry_date` — first brings the running total of `quantity_consumed` to 100% of the linked BOQ item's quantity. Recompute on every insert/update/delete of a diary entry for that activity, including recompute when a backfilled entry changes which entry is the one that crosses 100%.
- For activities with no BOQ link, or when a Project Manager/Admin manually marks an activity `complete` before the logged quantity reaches 100% (e.g. remaining quantity waived), there is no derivable crossing event: `actual_end` is stamped with the date the status changed to `complete`, and the UI labels it as manually set rather than derived.
- Display derived actual dates on the Activity Schedule screen with a short label distinguishing "derived from logs" vs. "set manually on completion," and a note that a derived Actual End can shift if a backfilled diary entry is added later.
- Add a tooltip/helper text on the Daily Log's Date field clarifying it represents the day the work happened (not the day the entry was typed in), so users know they can backdate a missed day's log.
- No changes to Planned Start/Planned End, which remain manually entered on the Activity Schedule form.

## Capabilities

### New Capabilities
- `activity-schedule`: Requirements for the Activity Schedule screen's date fields — planned dates remain manual inputs; actual dates are read-only and either derived from Daily Log data or, in the no-BOQ/manual-completion fallback, stamped from the completion action, with the UI distinguishing the two.

### Modified Capabilities
- `daily-progress-quantity-tracking`: Extends the existing progress-recalculation trigger to also derive and stamp the linked activity's `actual_start`/`actual_end` from diary entries (same recompute-on-insert/update/delete mechanism already used for `progress`), and adds a UI requirement for the Date field tooltip.

## Impact

- **DB**: `supabase/migrations` — new migration to drop manual write access to `actual_start`/`actual_end` via the activities update policy (or make them application-read-only) and extend the `recompute_activity_progress` trigger/function (from `007_quantity_consumed.sql`) to also compute `actual_start`/`actual_end`, plus a new path for stamping `actual_end` when status is manually set to `complete`.
- **API**: `packages/app/src/api/activities.ts` — remove `actual_start`/`actual_end` from `CreateActivityInput`/`UpdateActivityInput`.
- **Types**: `packages/app/src/types/index.ts` — `Activity.actual_start`/`actual_end` become derived/read-only fields (still present on the read model).
- **UI**: `packages/app/src/pages/ActivitySchedulePage.tsx` — remove Actual Start/End inputs from the add/edit dialog; add read-only derived-date display with source label on the table/Gantt. `packages/app/src/pages/DailyProgressPage.tsx` — add tooltip/helper text on the Date field.
- **Unaffected**: `earned-value-tracking` spec/formulas — PV and EV already use only `planned_start`/`planned_end` and `progress`, not `actual_start`/`actual_end`.
