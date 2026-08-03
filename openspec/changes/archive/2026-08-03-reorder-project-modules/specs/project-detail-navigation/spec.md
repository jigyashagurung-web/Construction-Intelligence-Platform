## ADDED Requirements

### Requirement: Module card order reflects project workflow sequence
The Project Detail page SHALL display its module cards in the order: Bill of Quantities, Materials, Activity Schedule, Daily Progress, Reports.

#### Scenario: Viewing a project's module cards
- **WHEN** a user opens a project's detail page
- **THEN** the module cards appear left-to-right, top-to-bottom in the order Bill of Quantities, Materials, Activity Schedule, Daily Progress, Reports

#### Scenario: Reports card stays last
- **WHEN** a user opens a project's detail page
- **THEN** the Reports card is the last module card shown, regardless of the order of the other four
