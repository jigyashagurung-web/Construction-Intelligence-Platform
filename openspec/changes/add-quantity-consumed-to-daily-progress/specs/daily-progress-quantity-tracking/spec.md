## ADDED Requirements

### Requirement: Quantity Consumed is mandatory on diary entries
Every daily progress entry SHALL record a `quantity_consumed` value (numeric, >= 0) at creation time.

#### Scenario: Submitting an entry without a quantity
- **WHEN** a user submits the Log Daily Progress form with the Quantity Consumed field empty
- **THEN** the form SHALL block submission and show a validation message, and no entry SHALL be created

#### Scenario: Submitting an entry with zero quantity
- **WHEN** a user submits Quantity Consumed as `0` (e.g. to log a day with no measurable progress)
- **THEN** the entry SHALL be created successfully with `quantity_consumed = 0`

### Requirement: Diary entries must be linked to an Activity
Every daily progress entry SHALL be linked to an `activity_id`. Entries with no activity link SHALL be rejected on insert.

#### Scenario: Submitting an entry without selecting an Activity
- **WHEN** a user submits the Log Daily Progress form without choosing an Activity
- **THEN** the form SHALL block submission and show a validation message, and no entry SHALL be created

#### Scenario: Direct API insert without activity_id
- **WHEN** an insert into `daily_progress_entries` is attempted with `activity_id` null
- **THEN** the database SHALL reject the insert

### Requirement: Activity progress is derived from quantity consumed for BOQ-linked activities
For an activity linked to a BOQ item, `progress` SHALL be computed as `sum(quantity_consumed) / boq_items.quantity * 100` across all of that activity's diary entries, clamped to a maximum of 100, recalculated automatically whenever a diary entry for that activity is inserted, updated, or deleted.

#### Scenario: Logging a diary entry updates linked activity progress
- **WHEN** a diary entry with `quantity_consumed = 20` is created for an activity linked to a BOQ item with `quantity = 100`
- **AND** no other entries exist for that activity
- **THEN** the activity's `progress` SHALL become `20`

#### Scenario: Summed quantity exceeds BOQ quantity
- **WHEN** the sum of `quantity_consumed` across an activity's diary entries exceeds its linked BOQ item's `quantity`
- **THEN** the activity's `progress` SHALL be clamped to `100`, not exceed it

#### Scenario: Editing or deleting a diary entry recalculates progress
- **WHEN** a diary entry linked to a BOQ-linked activity is updated or deleted
- **THEN** the activity's `progress` SHALL be recalculated to reflect the remaining/updated entries

#### Scenario: Activity has no linked BOQ item
- **WHEN** a diary entry is logged against an activity that has no `boq_item_id`
- **THEN** the activity's `progress` SHALL remain manually editable and SHALL NOT be overwritten by the trigger

### Requirement: Diary entry form displays the consumption unit
When an Activity is selected in the Log Daily Progress form, the Quantity Consumed field SHALL display the unit of that activity's linked BOQ item (if any) as read-only context next to the input.

#### Scenario: Activity has a linked BOQ item with a unit
- **WHEN** a user selects an Activity that has `boq_item_id` set with unit `m²`
- **THEN** the form SHALL display "m²" next to the Quantity Consumed input

#### Scenario: Activity has no linked BOQ item
- **WHEN** a user selects an Activity with no `boq_item_id`
- **THEN** the form SHALL display the Quantity Consumed input without a unit label
