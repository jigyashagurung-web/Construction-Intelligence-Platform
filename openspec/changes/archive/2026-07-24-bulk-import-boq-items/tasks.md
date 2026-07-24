## 1. Dependencies

- [x] 1.1 Add `xlsx` (SheetJS) as a dependency of `packages/app` for CSV and XLSX parsing.

## 2. Parsing and validation utilities

- [x] 2.1 Add a parser module (e.g. `packages/app/src/lib/boqImport.ts`) with a function that takes a `File`, detects CSV vs XLSX, and returns an array of raw row objects keyed by the template's column headers (WBS Code, Description, Trade, Quantity, Unit, Unit Rate, Status).
- [x] 2.2 Add a row-validation function that, given a raw row and the already-loaded `boq_code_catalog` (via `fetchBoqCodeCatalog`), classifies the row as `matched` (code resolves to a `line_item`-level catalog entry), `unmatched` (code doesn't match any catalog entry — allowed, not blocking), or `invalid` (code resolves to a non-line-item catalog entry, or a required field is missing, or Quantity/Unit Rate isn't a parseable non-negative number), returning the status plus human-readable reason(s).
- [x] 2.3 Add a function generating the downloadable CSV template (header row: WBS Code, Description, Trade, Quantity, Unit, Unit Rate, Status) as a `Blob`.

## 3. API layer

- [x] 3.1 Add `CreateBOQItemsInput` type and `createBOQItems(projectId: string, items: CreateBOQItemInput[])` to `packages/app/src/api/boq.ts`, doing a single `supabase.from('boq_items').insert(rows).select()` array insert (stamping `created_by` for every row, same as `createBOQItem`), throwing the raw `PostgrestError` on failure consistent with the rest of the file.

## 4. Import dialog UI

- [x] 4.1 Add a "Bulk Import" button next to "Add Item" on `BOQPage.tsx` that opens a new `BOQBulkImportDialog` component, following the same hand-rolled modal pattern (`fixed inset-0 z-50` overlay, centered card) as the existing `BOQDialog`.
- [x] 4.2 Implement the upload step: a file input (CSV/XLSX accept filter), a template download link/button, and an error state for unparseable files.
- [x] 4.3 On successful parse, run every row through the validation function from 2.2 and transition to a preview step.
- [x] 4.4 Implement the preview step: a table listing every row with its status (matched/unmatched/invalid) and reason(s) for invalid rows, inline editing of a row's fields with live re-validation, and a per-row exclude/skip toggle.
- [x] 4.5 Implement the commit step: on confirm, call `createBOQItems` with only the non-excluded, non-invalid rows; show a loading state during the request.
- [x] 4.6 Implement the summary step: after commit succeeds, show counts of rows created vs. skipped (with reasons for skipped rows); after commit fails, surface the raw error and keep the user on the preview step so they can retry without re-uploading.
- [x] 4.7 On successful commit, invalidate the `['boq', projectId]` query (same as `createMut` in `BOQPage.tsx`) so the BOQ table refreshes with the newly imported rows.

## 5. Verification

- [x] 5.1 Verified via a standalone script driving the real `parseBoqImportFile`/`validateBoqImportRow` functions against a 4-row CSV (a `line_item` code, a `sub_chapter` code, a code absent from the catalog, and a row missing Description): statuses came back `matched`, `invalid` ("...is a sub_chapter code..."), `unmatched` ("...does not match any catalog entry"), `invalid` ("Quantity is required") respectively — exactly as specced. Not yet exercised through the actual browser UI.
- [ ] 5.2 Manually verify: excluding one row and committing the rest creates exactly the expected `boq_items` rows for the project, and the summary reports the correct created/skipped counts. **Not done** — requires driving the real app UI against the live Supabase project (auth + writing real `boq_items` rows to a real project), which needs explicit user sign-off before mutating live data.
- [x] 5.3 Verified via the same script: `generateBoqImportTemplate()` produces `WBS Code,Description,Trade,Quantity,Unit,Unit Rate,Status\n` — exact header columns in order.
- [x] 5.4 Ran `tsc --noEmit` for `packages/app` — no type errors.
