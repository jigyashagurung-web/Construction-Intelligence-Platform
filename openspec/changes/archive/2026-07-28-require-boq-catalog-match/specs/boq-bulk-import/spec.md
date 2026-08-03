## MODIFIED Requirements

### Requirement: Downloadable import template
The system SHALL provide a downloadable CSV template with columns WBS Code, Description, Quantity, Unit, Unit Rate, Status.

#### Scenario: Downloading the template
- **WHEN** a user clicks the template download control in the import dialog
- **THEN** a CSV file is downloaded containing a header row with exactly those columns in that order

### Requirement: Row validation against the BOQ code catalog
The system SHALL validate each parsed row's WBS Code against `boq_code_catalog` and classify the row as matched or invalid. A row whose WBS Code does not resolve to a `line_item`-level catalog entry SHALL be invalid and SHALL NOT be imported as free text.

#### Scenario: WBS code matches a line-item catalog entry
- **WHEN** a row's WBS Code equals a `boq_code_catalog` code whose level is `line_item`
- **THEN** the row is marked as matched, and the row's Description/Unit are pre-filled from the catalog entry's values

#### Scenario: WBS code matches a non-line-item catalog entry
- **WHEN** a row's WBS Code equals a `boq_code_catalog` code whose level is `chapter`, `sub_chapter`, or `section`
- **THEN** the row is marked invalid with a reason indicating the code is not a line-item code

#### Scenario: WBS code does not match any catalog entry
- **WHEN** a row's WBS Code does not match any `boq_code_catalog` code
- **THEN** the row is marked invalid with a reason indicating the code does not match any catalog entry, and the row is not eligible for import

### Requirement: Row validation of required fields and numeric values
The system SHALL mark a row invalid if it is missing a required field or has a non-numeric or negative value in a numeric field, mirroring the database's own constraints.

#### Scenario: Missing required field
- **WHEN** a row is missing WBS Code, Description, Quantity, or Unit Rate
- **THEN** the row is marked invalid with a reason naming the missing field

#### Scenario: Non-numeric quantity or rate
- **WHEN** a row's Quantity or Unit Rate cannot be parsed as a non-negative number
- **THEN** the row is marked invalid with a reason indicating the invalid number

### Requirement: Preview step with per-row status and correction
Before any data is written, the system SHALL show a preview table listing every parsed row with its validation status, and SHALL let the user edit or exclude individual rows.

#### Scenario: Reviewing the preview table
- **WHEN** parsing and validation complete
- **THEN** the system displays every row with a status (matched or invalid) and, for invalid rows, the specific reason(s)

#### Scenario: Correcting an invalid row
- **WHEN** a user edits a field on an invalid row so it now satisfies validation and its WBS Code now resolves to a line-item catalog entry
- **THEN** the row's status updates to matched and it becomes eligible for import

#### Scenario: Excluding a row from import
- **WHEN** a user marks a row to be skipped
- **THEN** that row is excluded from the import regardless of its validation status
