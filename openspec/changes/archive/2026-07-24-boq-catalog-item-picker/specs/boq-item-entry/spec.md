## ADDED Requirements

### Requirement: Cascading catalog-driven code selection
When adding or editing a BOQ item, the system SHALL let the user select a WBS code by walking `boq_code_catalog` one level at a time, starting from Chapter, rather than typing free text. After each selection, the next step SHALL be determined by the actual children of the selected code: if those children are `line_item`-level, the next step is the terminal Line Item selection; otherwise the next step is whatever level the children are (`sub_chapter` or `section`). Only a `line_item`-level code SHALL be accepted as the item's final WBS code.

#### Scenario: Full-depth branch
- **WHEN** a user selects a Chapter whose children are `sub_chapter`, whose children are in turn `section`, whose children are in turn `line_item`
- **THEN** the system presents Sub Chapter, then Section, then Line Item as three successive selection steps before a code is finalized

#### Scenario: Branch that skips Section
- **WHEN** a user selects a Sub Chapter whose children are `line_item`-level (no intermediate Section)
- **THEN** the system presents Line Item as the next step immediately after Sub Chapter, without showing a Section step

#### Scenario: Chapter that never has a Section
- **WHEN** a user is working within a Chapter where no branch has a Section level (e.g. every sub-chapter's children are line items)
- **THEN** no Section step appears for any selection path under that Chapter

#### Scenario: Backtracking a selection
- **WHEN** a user has made one or more selections and clears an earlier one (e.g. changes the Chapter)
- **THEN** all selections made after that level are discarded and the corresponding later steps are re-derived from the new selection

#### Scenario: Attempting to finalize on a non-line-item code
- **WHEN** a user has not yet reached a `line_item`-level selection
- **THEN** the item cannot be submitted, since no non-terminal code is offered as a final, submittable value

### Requirement: Read-only description and unit derived from the selected line item
Once a Line Item is selected, the item's Description and Unit fields SHALL display the selected catalog entry's description and unit, and SHALL NOT be editable as free text.

#### Scenario: Selecting a line item populates Description and Unit
- **WHEN** a user selects a Line Item in the code picker
- **THEN** the Description field shows that catalog entry's description and the Unit field shows its unit, both non-editable

#### Scenario: Changing the selected line item updates the derived fields
- **WHEN** a user backtracks and selects a different Line Item
- **THEN** the Description and Unit fields update to the newly selected entry's values

### Requirement: Trade field removed from BOQ item entry
The Trade field SHALL NOT appear on the "Add BOQ Item" form, the "Edit BOQ Item" form, the BOQ items table, its filter control, or the bulk-import template/preview. This does not apply to the unrelated `trade` field on Activities.

#### Scenario: Adding or editing a BOQ item
- **WHEN** a user opens the Add or Edit BOQ Item form
- **THEN** no Trade field is present

#### Scenario: Bulk import template and preview
- **WHEN** a user downloads the bulk-import CSV template or views the import preview table
- **THEN** no Trade column is present

#### Scenario: Activities are unaffected
- **WHEN** a user opens the Add/Edit Activity form on the Activity Schedule page
- **THEN** its Trade field is still present, unchanged by this capability

### Requirement: Status removed from BOQ item entry
Neither the "Add BOQ Item" form nor the "Edit BOQ Item" form SHALL present a Status field. Every newly created item SHALL default to `active`. This does not change the `boq_items.status` column itself, its display on the BOQ table, its filter, or bulk import's Status column.

#### Scenario: Adding a new item
- **WHEN** a user submits the "Add BOQ Item" form
- **THEN** the created item's status is `active`, without the user having chosen it, and no Status field was shown on the form

#### Scenario: Editing an existing item
- **WHEN** a user opens "Edit BOQ Item" for an existing item
- **THEN** no Status field is present, and the item's existing status is left unchanged by the edit

#### Scenario: Status remains visible and filterable
- **WHEN** a user views the BOQ items table
- **THEN** each item's status is still shown as a badge and can still be filtered, unaffected by its removal from the add/edit forms

### Requirement: Denormalized catalog fields stored on each BOQ item
When a BOQ item's WBS code is inserted or updated, the system SHALL populate that row's Chapter, Section, Line Item description, Revit Category, and Family Type fields from the corresponding `boq_code_catalog` entries, so these fields can be read directly without joining back to the catalog. When the WBS code is null or does not resolve to a catalog line item, these fields SHALL be null.

#### Scenario: Creating an item via the catalog picker
- **WHEN** a new BOQ item is created with a WBS code selected through the catalog picker
- **THEN** the created row's Chapter, Section, Line Item, Revit Category, and Family Type fields are populated from that code's catalog ancestry

#### Scenario: Section folds in the sub-chapter when no distinct section exists
- **WHEN** a BOQ item's WBS code's nearest non-terminal ancestor is a `sub_chapter` (no intermediate `section` row exists on that branch)
- **THEN** the row's Section field holds that sub-chapter's description

#### Scenario: Unmatched or absent WBS code
- **WHEN** a BOQ item has no WBS code, or one that does not resolve to any `boq_code_catalog` line item
- **THEN** its Chapter, Section, Line Item, Revit Category, and Family Type fields are null

#### Scenario: Updating an item's WBS code
- **WHEN** an existing BOQ item's WBS code is changed to a different line item
- **THEN** its Chapter, Section, Line Item, Revit Category, and Family Type fields are recomputed to match the new code
