## ADDED Requirements

### Requirement: Mandatory BOQ line-item link on activity creation
The system SHALL require every newly created Activity to be linked to a `boq_items` row whose WBS code resolves to a `line_item`-level `boq_code_catalog` entry. An Activity SHALL NOT be creatable without this link.

#### Scenario: Creating an activity without a BOQ item selected
- **WHEN** a user attempts to submit the "Add Activity" form without selecting a BOQ item
- **THEN** the submission is rejected and the form remains open

#### Scenario: Creating an activity with a BOQ item selected
- **WHEN** a user selects a BOQ item via the catalog picker and submits the "Add Activity" form
- **THEN** the created activity's `boq_item_id` references that BOQ item

#### Scenario: Pre-existing activities without a BOQ link are unaffected
- **WHEN** an activity created before this requirement was in effect has no BOQ item link
- **THEN** that activity continues to exist and function as before; only creating a new activity or editing an existing one requires selecting a BOQ item

### Requirement: Catalog-driven BOQ item selection replaces free-text WBS Code and Trade
The "Add Activity" and "Edit Activity" forms SHALL present a single BOQ item selection control (the same catalog-driven picker used for BOQ item entry) in place of a free-text WBS Code input, a Trade dropdown, and a separate BOQ Item dropdown.

#### Scenario: Selecting a BOQ item
- **WHEN** a user opens the "Add Activity" form and selects a BOQ item through the picker
- **THEN** no separate WBS Code input or Trade dropdown is shown, and the selection resolves the activity's BOQ item link directly

#### Scenario: No independent WBS Code entry
- **WHEN** a user opens the "Add Activity" or "Edit Activity" form
- **THEN** there is no free-text WBS Code field independent of the BOQ item selection

#### Scenario: No Trade field
- **WHEN** a user opens the "Add Activity" or "Edit Activity" form
- **THEN** there is no Trade field or Trade dropdown

### Requirement: Activity progress always auto-computed from the linked BOQ item
Since every activity has a BOQ item link, the system SHALL always auto-compute an activity's progress from its logged Quantity Consumed against the linked BOQ item's quantity. The "Add Activity" and "Edit Activity" forms SHALL NOT present a manual Progress input.

#### Scenario: Viewing progress on the activity form
- **WHEN** a user opens the "Add Activity" or "Edit Activity" form
- **THEN** Progress is shown as a read-only, auto-calculated value, with no editable Progress input

#### Scenario: Progress updates as quantity is logged
- **WHEN** a daily progress entry logs Quantity Consumed against an activity
- **THEN** that activity's progress recomputes from the total quantity consumed against its linked BOQ item's quantity, unchanged from existing behavior

### Requirement: Chapter and section displayed from the linked BOQ item
The system SHALL display an activity's chapter and section by reading them from its linked `boq_items` row, rather than storing or deriving them independently on the activity itself.

#### Scenario: Viewing an activity's categorization
- **WHEN** a user views an activity's chapter/section grouping (e.g. in a schedule or filter view)
- **THEN** the values shown are the linked BOQ item's chapter and section
