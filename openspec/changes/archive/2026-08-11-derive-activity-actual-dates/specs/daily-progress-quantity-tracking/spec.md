## ADDED Requirements

### Requirement: Activity actual start is derived from diary entries
For any activity with at least one diary entry, `activities.actual_start` SHALL be set to the earliest `entry_date` among that activity's diary entries, recalculated whenever a diary entry for that activity is inserted, updated, or deleted.

#### Scenario: First diary entry sets actual start
- **WHEN** the first diary entry for an activity is created with `entry_date = 2026-08-03`
- **THEN** the activity's `actual_start` SHALL become `2026-08-03`

#### Scenario: Backfilled earlier entry moves actual start back
- **WHEN** an activity already has diary entries starting `2026-08-05`, and a new entry is logged with `entry_date = 2026-08-03`
- **THEN** the activity's `actual_start` SHALL become `2026-08-03`

#### Scenario: Deleting the earliest entry recalculates actual start
- **WHEN** the diary entry holding an activity's current earliest `entry_date` is deleted
- **THEN** the activity's `actual_start` SHALL be recalculated to the next-earliest remaining `entry_date`, or cleared if no entries remain

### Requirement: Activity actual end is derived from cumulative logged quantity for BOQ-linked activities
For an activity linked to a BOQ item, `activities.actual_end` SHALL be set to the `entry_date` of the diary entry which, when that activity's diary entries are ordered chronologically by `entry_date`, first brings the running total of `quantity_consumed` to or above the linked BOQ item's `quantity`. This SHALL be recalculated whenever a diary entry for that activity is inserted, updated, or deleted, using `entry_date` order rather than insertion order.

#### Scenario: Single entry reaches full quantity
- **WHEN** a BOQ-linked activity has a BOQ quantity of `100` and a diary entry with `entry_date = 2026-08-10` and `quantity_consumed = 100` is logged
- **THEN** the activity's `actual_end` SHALL become `2026-08-10`

#### Scenario: Cumulative entries reach full quantity
- **WHEN** a BOQ-linked activity has a BOQ quantity of `100`, with entries `entry_date = 2026-08-08, quantity_consumed = 60` and `entry_date = 2026-08-09, quantity_consumed = 40`
- **THEN** the activity's `actual_end` SHALL become `2026-08-09`

#### Scenario: Backfilled entry changes which date crosses the threshold
- **WHEN** a BOQ-linked activity's diary entries currently show cumulative quantity reaching 100% on `entry_date = 2026-08-12`, and a previously missing entry is then logged with `entry_date = 2026-08-11` that, once entries are reordered by `entry_date`, causes the cumulative total to reach 100% on `2026-08-11` instead
- **THEN** the activity's `actual_end` SHALL be recalculated to `2026-08-11`

#### Scenario: Quantity below threshold has no actual end
- **WHEN** a BOQ-linked activity's diary entries sum to less than 100% of the linked BOQ quantity
- **THEN** the activity's `actual_end` SHALL remain unset

#### Scenario: Entry logged after completion does not push actual end later
- **WHEN** a BOQ-linked activity's cumulative quantity already reached 100% on `entry_date = 2026-08-09`, and an additional diary entry is later logged with `entry_date = 2026-08-15`
- **THEN** the activity's `actual_end` SHALL remain `2026-08-09`

### Requirement: Diary Date field indicates it records the day work happened
The Log Daily Progress form's Date field SHALL display a tooltip or helper text clarifying that the date represents the day the work took place, not the day the entry is being filled in, so that a missed day can be logged later against its correct date.

#### Scenario: Viewing the Date field
- **WHEN** a user views or focuses the Date field on the Log Daily Progress form
- **THEN** the form SHALL show helper text or a tooltip indicating the date should reflect when the work happened

#### Scenario: Logging a prior day's work today
- **WHEN** a user creates a diary entry today with `entry_date` set to an earlier date
- **THEN** the entry SHALL be created successfully with that earlier `entry_date`, and downstream derivations (activity progress, actual start/end) SHALL use that `entry_date`, not the date the entry was created
