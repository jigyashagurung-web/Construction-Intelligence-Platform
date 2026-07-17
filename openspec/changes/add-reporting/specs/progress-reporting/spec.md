## ADDED Requirements

### Requirement: Project Reports page
Every project SHALL have a Reports page, reachable from project navigation, containing a Summary rollup, an S-curve, and a Progress Photos gallery, visible to any user with read access to that project.

#### Scenario: Any project member can view Reports
- **WHEN** a user with any role (admin, project_manager, qty_surveyor, site_engineer, viewer) who is a member of the project's organisation navigates to a project's Reports page
- **THEN** the page SHALL load and display the Summary, S-curve, and Photos tabs

#### Scenario: User outside the project's organisation cannot view Reports
- **WHEN** a user who is not a member of the project's organisation attempts to load the project's Reports page or its underlying data
- **THEN** the request SHALL return no rows (RLS-enforced), consistent with every other project-scoped page

### Requirement: Daily/weekly/monthly progress rollup
The Reports Summary view SHALL aggregate, for a selected date range, the sum of `quantity_consumed`, `labour_count`, and `equipment_count`, and the count of diary entries logged, bucketed by day, week, or month at the user's choice.

#### Scenario: Selecting a bucket size
- **WHEN** a user selects "Weekly" as the rollup granularity for a project with diary entries spanning several weeks
- **THEN** the Summary view SHALL display one row/bar per calendar week with the summed quantity consumed, labour, equipment, and entry count for that week

#### Scenario: No entries in the selected range
- **WHEN** a user selects a date range with no diary entries
- **THEN** the Summary view SHALL display an empty state rather than an error

### Requirement: S-curve of planned vs actual progress
The Reports S-curve view SHALL plot, per project, a cumulative planned-% and cumulative actual-% line over the project's activity date range. Actual-% SHALL be derived from `activities.progress` as of each date; planned-% SHALL be derived from each activity's `planned_start`/`planned_end` window, weighted by its linked BOQ item's `amount` where a link exists, and by an equal share of remaining weight where it does not.

#### Scenario: Project with all activities BOQ-linked
- **WHEN** every activity in a project has a `boq_item_id`
- **THEN** each activity's contribution to the planned and actual curves SHALL be weighted by its BOQ item's `amount` (`quantity * unit_rate`)

#### Scenario: Project with some activities unlinked to BOQ
- **WHEN** a project has activities both with and without a `boq_item_id`
- **THEN** the S-curve SHALL still render using BOQ-`amount` weighting for linked activities and equal-share weighting for unlinked ones, and SHALL display a note indicating how many activities are unweighted by BOQ

#### Scenario: Project with no activities
- **WHEN** a project has zero activities
- **THEN** the S-curve view SHALL display an empty state rather than an error

### Requirement: Progress photo gallery
The Reports Photos view SHALL display all photos attached to the project's daily progress entries, filterable by date range and by activity, each linked back to its originating diary entry.

#### Scenario: Filtering photos by activity
- **WHEN** a user filters the Photos gallery by a specific activity
- **THEN** only photos attached to diary entries linked to that activity SHALL be shown

#### Scenario: No photos exist yet
- **WHEN** a project has no diary entries with attached photos
- **THEN** the Photos gallery SHALL display an empty state rather than an error
