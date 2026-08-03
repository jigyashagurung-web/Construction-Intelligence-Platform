## MODIFIED Requirements

### Requirement: Trade field removed from BOQ item entry
The Trade field SHALL NOT appear on the "Add BOQ Item" form, the "Edit BOQ Item" form, the BOQ items table, its filter control, or the bulk-import template/preview.

#### Scenario: Adding or editing a BOQ item
- **WHEN** a user opens the Add or Edit BOQ Item form
- **THEN** no Trade field is present

#### Scenario: Bulk import template and preview
- **WHEN** a user downloads the bulk-import CSV template or views the import preview table
- **THEN** no Trade column is present

#### Scenario: Activities also have no Trade field
- **WHEN** a user opens the Add/Edit Activity form on the Activity Schedule page
- **THEN** no Trade field is present there either, since `activities.trade` was removed by the `activity-entry` capability
