## ADDED Requirements

### Requirement: Hierarchical BOQ code catalog
The system SHALL provide a shared `boq_code_catalog` containing the standard BOQ coding taxonomy as a 4-level hierarchy (chapter, sub-chapter, section, line item), where every level is a row with a code, a parent reference, a level, and a description, and line-item rows additionally carry a unit, a Revit category, and a Revit family type.

#### Scenario: Catalog seeded with the standard taxonomy
- **WHEN** the seed migration runs
- **THEN** `boq_code_catalog` contains a row for every chapter, sub-chapter, section, and line item defined in the standard (e.g. `01.00.00.00` "SITE DEVELOPMENT WORKS" as a chapter, `01.10.10.01` "Clearing and grubbing" as a line item with unit `m²`, Revit category `Site`, family type `Clearing`)

#### Scenario: Resolving a line item's ancestry
- **WHEN** a client looks up the catalog entry for line-item code `02.40.30.01`
- **THEN** the system can resolve its parent chain up through section, sub-chapter, and chapter via `parent_code`

### Requirement: BOQ items reference only line-item codes
`boq_items.wbs_code` SHALL reference an entry in `boq_code_catalog` ("WBS code" and "BOQ code" are the same value; no separate `boq_code` column exists), and the referenced entry MUST be at the `line_item` level.

#### Scenario: Assigning a valid line-item code
- **WHEN** a BOQ item is created or updated with `wbs_code` set to a catalog code whose level is `line_item`
- **THEN** the write succeeds

#### Scenario: Rejecting a non-line-item code
- **WHEN** a BOQ item is created or updated with `wbs_code` set to a catalog code whose level is `chapter`, `sub_chapter`, or `section`
- **THEN** the write is rejected

### Requirement: Catalog is centrally governed, not per-tenant
The `boq_code_catalog` SHALL be readable by any authenticated user across all organizations and projects, and SHALL NOT be writable through project- or organization-scoped application roles.

#### Scenario: Any authenticated user can read the catalog
- **WHEN** an authenticated user from any organization queries `boq_code_catalog`
- **THEN** all catalog rows are visible regardless of the user's organization or project

#### Scenario: Application roles cannot modify the catalog
- **WHEN** a user with a standard project- or org-scoped application role attempts to insert, update, or delete a `boq_code_catalog` row
- **THEN** the operation is rejected by row-level security

### Requirement: Existing BOQ codes remain functional during transition
Existing `boq_items` rows whose `wbs_code` is a legacy free-text value (not yet a valid catalog line-item code) SHALL continue to be readable and editable until backfilled.

#### Scenario: Legacy row with a free-text code
- **WHEN** an existing `boq_items` row has a `wbs_code` value that predates the catalog and does not match any `boq_code_catalog` entry
- **THEN** the row remains valid and fully usable by the application until it is backfilled
