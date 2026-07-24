## Why

BOQ items are unique to each project (quantities, rates, descriptions), even though they draw from the same shared `boq_code_catalog` taxonomy. Today the only way to populate a project's BOQ is the "Add Item" dialog on `BOQPage.tsx`, one row at a time. Real BOQs commonly run into hundreds of line items, so onboarding a new project means hours of repetitive manual entry. A bulk import reduces that to uploading a spreadsheet.

## What Changes

- Add a "Bulk Import" entry point on the BOQ page (next to "Add Item") that opens an import dialog.
- Accept an uploaded CSV/XLSX file, parse rows client-side, and match each row's WBS code against the existing `boq_code_catalog` line items.
- Show a preview/validation step before committing: per-row status (matched code, unmatched code, missing required field, invalid number), with a downloadable template to guide correct formatting.
- Allow the user to fix or skip invalid rows, then bulk-insert only the valid rows into `boq_items` for the current project via a single batched call.
- Provide a downloadable CSV template (columns: WBS Code, Description, Trade, Quantity, Unit, Unit Rate, Status) so users can pre-fill data in a spreadsheet.
- Surface an import summary (rows created, rows skipped, reasons) after the bulk insert completes.

## Capabilities

### New Capabilities
- `boq-bulk-import`: Upload a CSV/XLSX file of BOQ line items, validate rows against the BOQ code catalog, preview and correct errors, and bulk-create the valid rows as project-scoped `boq_items`.

### Modified Capabilities
(none — existing single-item add/edit/delete flow in `boq_items` is unaffected)

## Impact

- **Frontend**: `packages/app/src/pages/BOQPage.tsx` (new "Bulk Import" button + dialog), new file parsing dependency (CSV/XLSX), new component for the import preview/validation table.
- **API layer**: `packages/app/src/api/boq.ts` gains a batch-insert function alongside the existing single-row `createBOQItem`.
- **Database**: no schema changes. Reuses `boq_items` (project-scoped, RLS-protected) and `boq_code_catalog` (global reference, read-only) exactly as they exist today; import validation relies on the existing `wbs_code` FK and line-item-level trigger rather than adding new constraints.
- **Dependencies**: adds a client-side spreadsheet-parsing library (e.g. for CSV and XLSX) to `packages/app`.
