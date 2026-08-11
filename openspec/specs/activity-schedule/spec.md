# activity-schedule

## Purpose

Defines the Activity Schedule screen's date fields: Planned Start/End are manually entered; Actual Start/End are read-only and either derived from Daily Log entries or, in the no-BOQ/manual-completion fallback, stamped from the completion action, with the UI distinguishing the two.

## Requirements

### Requirement: Planned dates are manually entered
The Activity Schedule form SHALL accept `planned_start` and `planned_end` as user-entered date inputs on create and edit.

#### Scenario: Creating an activity with planned dates
- **WHEN** a user submits the Add Activity form with Planned Start and Planned End filled in
- **THEN** the activity SHALL be created with those values stored as `planned_start`/`planned_end`

### Requirement: Actual dates are read-only and system-derived
The Activity Schedule form SHALL NOT present "Actual Start" or "Actual End" as editable inputs. `activities.actual_start` and `activities.actual_end` SHALL only be written by the system, never accepted from a client create/update request.

#### Scenario: Add/edit form has no actual date inputs
- **WHEN** a user opens the Add or Edit Activity dialog
- **THEN** the dialog SHALL show Planned Start and Planned End as editable fields and SHALL NOT show editable Actual Start/Actual End inputs

#### Scenario: Client attempts to set actual dates directly
- **WHEN** an API request to create or update an activity includes `actual_start` or `actual_end`
- **THEN** the system SHALL ignore those values rather than writing them from the request

### Requirement: Actual dates display their derivation source
Wherever Actual Start/Actual End are shown (table, Gantt), the UI SHALL indicate whether the value was derived from Daily Log entries or set manually on completion.

#### Scenario: Actual end derived from logged quantity
- **WHEN** an activity's `actual_end` was computed from diary entries reaching 100% of the linked BOQ quantity
- **THEN** the UI SHALL label it as derived from logs

#### Scenario: Actual end set via manual completion
- **WHEN** an activity's `actual_end` was stamped because its status was manually changed to complete without the logged quantity reaching 100% (or because it has no BOQ link)
- **THEN** the UI SHALL label it as set manually on completion, distinct from the derived-from-logs label

#### Scenario: Derived actual end may still change
- **WHEN** an activity's `actual_end` is shown as derived from logs
- **THEN** the UI SHALL display a note that the date may adjust if a diary entry is later added or edited

### Requirement: Manually completing an activity stamps an actual end date
When a user changes an activity's status to `complete` and the activity has no derivable actual end (no BOQ link, or logged quantity has not yet reached 100%), the system SHALL stamp `actual_end` with the date of that status change.

#### Scenario: Completing a no-BOQ-link activity
- **WHEN** a user sets the status of an activity with no `boq_item_id` to `complete`
- **THEN** the system SHALL set `actual_end` to the current date and label it as set manually on completion

#### Scenario: Completing a BOQ-linked activity ahead of logged quantity
- **WHEN** a user sets the status of a BOQ-linked activity to `complete` while its logged quantity is below 100% of the BOQ quantity
- **THEN** the system SHALL set `actual_end` to the current date and label it as set manually on completion, without altering the logged `quantity_consumed` history
