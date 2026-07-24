## ADDED Requirements

### Requirement: Bulk import entry point
The BOQ page SHALL provide a "Bulk Import" action alongside the existing "Add Item" action that opens an import dialog for the current project.

#### Scenario: Opening the import dialog
- **WHEN** a user on the BOQ page clicks "Bulk Import"
- **THEN** an import dialog opens scoped to the current project

### Requirement: Downloadable import template
The system SHALL provide a downloadable CSV template with columns WBS Code, Description, Trade, Quantity, Unit, Unit Rate, Status.

#### Scenario: Downloading the template
- **WHEN** a user clicks the template download control in the import dialog
- **THEN** a CSV file is downloaded containing a header row with exactly those columns in that order

### Requirement: File upload and parsing
The system SHALL accept an uploaded CSV or XLSX file and parse it client-side into rows before any data is sent to the server.

#### Scenario: Uploading a valid CSV file
- **WHEN** a user uploads a CSV file matching the template columns
- **THEN** the system parses it into a list of candidate rows and advances to the preview step

#### Scenario: Uploading a valid XLSX file
- **WHEN** a user uploads an XLSX file with a first sheet matching the template columns
- **THEN** the system parses the first sheet into a list of candidate rows and advances to the preview step

#### Scenario: Uploading an unparseable file
- **WHEN** a user uploads a file that is not a valid CSV or XLSX (e.g. corrupt or wrong format)
- **THEN** the system shows an error and does not advance to the preview step

### Requirement: Row validation against the BOQ code catalog
The system SHALL validate each parsed row's WBS Code against `boq_code_catalog` and classify the row as matched, unmatched, or invalid, without blocking rows whose code does not match any catalog entry.

#### Scenario: WBS code matches a line-item catalog entry
- **WHEN** a row's WBS Code equals a `boq_code_catalog` code whose level is `line_item`
- **THEN** the row is marked as matched, and the row's Description/Trade/Unit are pre-filled or checked against the catalog entry's values

#### Scenario: WBS code matches a non-line-item catalog entry
- **WHEN** a row's WBS Code equals a `boq_code_catalog` code whose level is `chapter`, `sub_chapter`, or `section`
- **THEN** the row is marked invalid with a reason indicating the code is not a line-item code

#### Scenario: WBS code does not match any catalog entry
- **WHEN** a row's WBS Code does not match any `boq_code_catalog` code
- **THEN** the row is marked as unmatched (a warning, not a hard error) and remains eligible for import as free-text, consistent with legacy BOQ items

### Requirement: Row validation of required fields and numeric values
The system SHALL mark a row invalid if it is missing a required field or has a non-numeric or negative value in a numeric field, mirroring the database's own constraints.

#### Scenario: Missing required field
- **WHEN** a row is missing Description, Quantity, or Unit Rate
- **THEN** the row is marked invalid with a reason naming the missing field

#### Scenario: Non-numeric quantity or rate
- **WHEN** a row's Quantity or Unit Rate cannot be parsed as a non-negative number
- **THEN** the row is marked invalid with a reason indicating the invalid number

### Requirement: Preview step with per-row status and correction
Before any data is written, the system SHALL show a preview table listing every parsed row with its validation status, and SHALL let the user edit or exclude individual rows.

#### Scenario: Reviewing the preview table
- **WHEN** parsing and validation complete
- **THEN** the system displays every row with a status (matched, unmatched, invalid) and, for invalid rows, the specific reason(s)

#### Scenario: Correcting an invalid row
- **WHEN** a user edits a field on an invalid row so it now satisfies validation
- **THEN** the row's status updates to matched or unmatched and it becomes eligible for import

#### Scenario: Excluding a row from import
- **WHEN** a user marks a row to be skipped
- **THEN** that row is excluded from the import regardless of its validation status

### Requirement: Bulk commit of valid rows
The system SHALL insert only rows that are not invalid and not excluded, as `boq_items` scoped to the current project, in a single batched request.

#### Scenario: Committing an import with a mix of valid and invalid rows
- **WHEN** a user confirms the import and the preview contains both valid and invalid rows
- **THEN** only the valid, non-excluded rows are sent to the server as new `boq_items` for the current project, and invalid rows are not sent

#### Scenario: Import rejected by server-side constraints
- **WHEN** the batched insert is rejected by the database (e.g. an RLS or trigger violation not caught client-side)
- **THEN** no rows from that batch are created, and the system surfaces the error to the user without losing the preview state

### Requirement: Import summary
After a bulk insert attempt, the system SHALL show a summary of how many rows were created and how many were skipped, with reasons for skipped rows.

#### Scenario: Successful import with some rows skipped
- **WHEN** a bulk insert completes and some rows were excluded or were invalid
- **THEN** the summary reports the count of rows created and the count of rows skipped, each skipped row annotated with its reason
