## Context

`packages/app/src/lib/boqImport.ts`'s `validateBoqImportRow` currently treats a WBS Code that doesn't resolve to a `boq_code_catalog` entry as `unmatched`: a warning, not a blocker. The row still produces a `CreateBOQItemsInput` with `wbs_code: undefined`, importable as free text. This predates the catalog-driven picker (`boq-catalog-item-picker`, migration 015) that made manual "Add Item" entry catalog-only; bulk import was never tightened to match.

## Goals / Non-Goals

**Goals:**
- Every bulk-imported row's WBS Code must resolve to a `line_item`-level `boq_code_catalog` entry, or the row is rejected (marked `invalid`), consistent with manual entry.
- Blank WBS Code is treated as a missing required field, same as blank Description/Quantity/Unit Rate.

**Non-Goals:**
- No database migration — `boq_items.wbs_code` is already nullable and FK-constrained; this is purely a client-side validation tightening.
- Not changing the manual Add/Edit dialog (`BOQDialog`), which already enforces catalog-only entry via `BoqCodePicker`.
- Not backfilling or touching existing `boq_items` rows that already hold a null/legacy `wbs_code`.

## Decisions

- **Collapse `unmatched` into `invalid` rather than keeping it as a dead status.** `BoqImportRowStatus` narrows from `'matched' | 'unmatched' | 'invalid'` to `'matched' | 'invalid'`. Keeping an unreachable `'unmatched'` branch around (in the type, the status color map, and the preview counts row) would be dead code inviting confusion about when it fires.
- **Reuse the existing `reasons` array for the new failure mode** instead of introducing a separate error channel — a non-matching or blank WBS Code just becomes another entry in the same invalid-reasons list a user already sees and corrects in the preview table.
- **No change to `CreateBOQItemsInput`/`createBOQItems`** — since only rows with a resolved `matchedEntry` ever produce an `item` now, `wbs_code` on the produced item is always defined; the type doesn't need to change, only the code path producing it.

## Risks / Trade-offs

- [Existing spreadsheets built against the old template with codes absent from the catalog will now fail entirely instead of partially importing] → Acceptable per explicit product decision; the preview step still lets a user correct a row's WBS Code inline and re-validate before committing.
