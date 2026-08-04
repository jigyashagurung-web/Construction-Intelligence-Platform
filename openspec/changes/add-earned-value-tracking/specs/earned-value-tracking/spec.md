## ADDED Requirements

### Requirement: Budget at Completion is computed from BOQ-linked activities only
The system SHALL compute a project's Budget at Completion (BAC) as the sum of `amount` across active BOQ items that have at least one linked activity. Active BOQ items with no linked activity SHALL NOT be included in BAC and SHALL instead be reported as unscheduled budget (their summed amount, separately).

#### Scenario: BOQ item with a linked activity counts toward BAC
- **WHEN** an active BOQ item has at least one activity referencing it via `boq_item_id`
- **THEN** its `amount` is included in the project's BAC

#### Scenario: BOQ item with no linked activity is excluded from BAC
- **WHEN** an active BOQ item has no activity referencing it
- **THEN** its `amount` is excluded from BAC and included in the project's unscheduled budget total instead

### Requirement: Planned Value uses linear time-phased completion per activity
The system SHALL compute Planned Value (PV) as of the current date as the sum, across BOQ-linked activities, of each activity's linked BOQ item's `amount` multiplied by a linear planned-completion fraction: 0 before `planned_start`, 1 after `planned_end`, and a linear ramp between the two dates.

#### Scenario: Activity partway through its planned window
- **WHEN** the current date falls between an activity's `planned_start` and `planned_end`
- **THEN** that activity's contribution to PV is its BOQ amount multiplied by the fraction of elapsed time between those two dates

#### Scenario: Activity not yet started
- **WHEN** the current date is before an activity's `planned_start`
- **THEN** that activity contributes zero to PV

#### Scenario: Activity past its planned end date
- **WHEN** the current date is after an activity's `planned_end`
- **THEN** that activity contributes its full BOQ amount to PV, regardless of its actual progress

### Requirement: Earned Value uses each activity's measured progress
The system SHALL compute Earned Value (EV) as the sum, across BOQ-linked activities, of each activity's linked BOQ item's `amount` multiplied by that activity's current `progress` (as a fraction of 100).

#### Scenario: Activity with logged progress
- **WHEN** an activity's `progress` is 60
- **THEN** that activity contributes 60% of its linked BOQ item's `amount` to EV

### Requirement: Actual Cost reflects material procurement cost only, at project level
The system SHALL compute Actual Cost (AC) as the sum of `unit_cost x quantity` across all `grn`-type material transactions for the project, to date. `issue`, `return`, and `adjustment` transactions SHALL NOT affect AC. AC SHALL be computed at the whole-project level only; the system SHALL NOT attempt to attribute Actual Cost to individual activities.

#### Scenario: GRN transaction counts toward Actual Cost
- **WHEN** a `grn` material transaction is recorded for a project with a given `unit_cost` and `quantity`
- **THEN** its cost is included in that project's AC

#### Scenario: Issue transaction does not affect Actual Cost
- **WHEN** an `issue` material transaction is recorded for a project
- **THEN** it does not change the project's AC

### Requirement: Derived schedule and cost variance metrics
Given BAC, PV, EV, and AC, the system SHALL compute: Schedule Variance (SV = EV - PV), Schedule Performance Index (SPI = EV / PV), Cost Variance (CV = EV - AC), Cost Performance Index (CPI = EV / AC), Estimate at Completion (EAC = BAC / CPI), and Variance at Completion (VAC = BAC - EAC).

#### Scenario: Project behind schedule
- **WHEN** a project's EV is less than its PV
- **THEN** SV is negative and SPI is less than 1.0

#### Scenario: Project over budget
- **WHEN** a project's EV is less than its AC
- **THEN** CV is negative and CPI is less than 1.0

#### Scenario: PV is zero
- **WHEN** a project's PV is 0 (no activity's planned window has started yet)
- **THEN** SPI is displayed as not-available rather than as an error or an infinite value

#### Scenario: AC is zero
- **WHEN** a project has recorded no `grn` material transactions
- **THEN** CPI and EAC are displayed as not-available rather than as an error or an infinite value

### Requirement: Cost metrics are labeled as material-cost-only
Anywhere Actual Cost, Cost Variance, or Cost Performance Index is displayed, the system SHALL present them as a materials-only measure (e.g. labeled "Cost Performance (materials only)"), and SHALL NOT present them as a measure of total project cost.

#### Scenario: Viewing cost performance
- **WHEN** a user views the Cost Performance / Cost Variance figures
- **THEN** the display includes text clarifying the figures reflect material costs only, not labour or equipment costs

### Requirement: Unlinked legacy activities are surfaced, not silently dropped
The system SHALL report the count of activities with no linked BOQ item (`boq_item_id` is null) for a project, so their exclusion from BAC/PV/EV is visible rather than silent.

#### Scenario: Project has legacy unlinked activities
- **WHEN** one or more activities in a project have a null `boq_item_id`
- **THEN** their count is shown alongside the project's EVM figures

### Requirement: Earned value summary is available on the Reports page and Project Detail page
The system SHALL show BAC, PV, EV, AC, SV, SPI, CV, CPI, EAC, and VAC in a dedicated section of the project's Reports page, with clear on-track/behind-schedule and on-budget/over-budget indicators. The system SHALL also show a compact schedule/cost status badge on the Project Detail page.

#### Scenario: Viewing the Reports page
- **WHEN** a user opens a project's Reports page
- **THEN** an Earned Value section shows all of BAC, PV, EV, AC, SV, SPI, CV, CPI, EAC, and VAC with schedule and cost status indicators

#### Scenario: Viewing the Project Detail page
- **WHEN** a user opens a project's detail page
- **THEN** a compact status badge indicates whether the project is on schedule (or behind) and on budget (or over), based on SPI and CPI
