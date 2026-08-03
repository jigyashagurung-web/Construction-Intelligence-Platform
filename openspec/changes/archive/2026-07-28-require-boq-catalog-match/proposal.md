## Why

The bulk-import flow currently lets a WBS Code that doesn't match any `boq_code_catalog` entry through as an "unmatched" warning, importing the row as free text with no `wbs_code`. That reopens exactly the inconsistency the catalog was introduced to close (typos, ad hoc codes, rows that can't be grouped by chapter/section/Revit category). Every bulk-imported row should be required to resolve to a real catalog line item, same as the manual "Add Item" flow already requires via `BoqCodePicker`.

## What Changes

- **BREAKING**: A WBS Code that does not match a `line_item`-level `boq_code_catalog` entry is now `invalid` (blocks import), not `unmatched` (warn-and-allow).
- **BREAKING**: WBS Code becomes a required field for bulk import, same as Description/Quantity/Unit Rate — a blank code is `invalid`.
- Drop the `unmatched` row status from the bulk-import flow entirely; every importable row is `matched`.
- Correct the bulk-import template documentation: remove the stale `Trade` column reference (dropped from `boq_items` by migration 015; not present in the actual template).

## Capabilities

### Modified Capabilities
- `boq-bulk-import`: "Row validation against the BOQ code catalog" now requires a catalog match instead of allowing an unmatched free-text row; WBS Code becomes a required field; the "Downloadable import template" requirement's column list is corrected to drop `Trade`.

## Impact

- `packages/app/src/lib/boqImport.ts` — `validateBoqImportRow`: remove the `codeWarning`/`unmatched` branch; blank or non-matching WBS Code becomes an invalid reason.
- `packages/app/src/pages/BOQPage.tsx` — `BOQBulkImportDialog`: preview step drops the "unmatched" count/badge; only matched/invalid remain.
- `openspec/specs/boq-bulk-import/spec.md` — requirements and scenarios updated to match.
- No database migration needed — this is client-side validation tightening only.
