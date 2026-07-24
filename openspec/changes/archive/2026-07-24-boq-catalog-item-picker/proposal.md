## Why

BOQ items are added via a free-text `wbs_code` input with autocomplete *suggestions* (`BOQDialog` on `BOQPage.tsx`) — nothing stops a user from typing a code that doesn't exist in `boq_code_catalog`, or one that resolves to a chapter/sub-chapter/section instead of a line item. Both cases are only caught when the database rejects the write (`boq_items_wbs_code_fkey` / `boq_items_wbs_code_level_check`), surfacing a raw Postgres error to the user — this was hit directly during manual QA of the bulk-import feature. Description is separately hand-typed even though the catalog already carries a governed description per code, so project records can drift from the taxonomy. Trade is a free-text/dropdown holdover from before the catalog existed and now duplicates what Revit Category/Family Type already encode. Status is a governed/lifecycle concept, not something a user should be setting by hand on this form at all. And every report or export that wants an item's chapter/section grouping or Revit mapping has to join back to `boq_code_catalog` itself, rather than reading it off `boq_items`.

## What Changes

- Replace the free-text WBS Code input in "Add/Edit BOQ Item" with a cascading, catalog-driven picker: Chapter first, then whatever level actually exists beneath the current selection (some branches go straight to Line Item, others pass through Sub Chapter and/or Section first — depth is walked dynamically per branch, not fixed), down to a Line Item. Only line-item codes are selectable as the final value, so every write satisfies the existing FK and level-check trigger by construction.
- Once a Line Item is selected, Description becomes read-only and mirrors the catalog's description for that code — no more manual retyping or drift.
- Remove the Trade field entirely from the BOQ item add/edit form, the BOQ table's Trade column and filter, and the bulk-import CSV template/column/validation. (`activities.trade` on `ActivitySchedulePage` is a separate, unrelated field and is untouched.)
- Remove the Status field from both "Add BOQ Item" and "Edit BOQ Item" — new items default to `active`; there is no manual per-item way to change status through this form. The `boq_items.status` column, its table badge, and bulk import's Status column are unaffected.
- **BREAKING**: `boq_items.trade` column is dropped.
- Add denormalized columns to `boq_items` — chapter description, section description (folding in the sub-chapter when a branch has no distinct section level), line-item description, Revit category, and family type — populated by a trigger whenever `wbs_code` is inserted or updated, so per-project reporting/exports read them directly with no join. Cleared to null when `wbs_code` is null or doesn't resolve to a catalog line item (matching the existing unmatched-import behavior).
- Bulk import keeps its current matched/unmatched/invalid row classification and typed/pasted WBS codes (adding the cascading picker to spreadsheet rows is out of scope); its CSV template drops the Trade column, and matched rows get their description/derived fields resolved the same way manual entry does.
- The new picker reuses this app's existing hand-rolled search-as-you-type combobox pattern (the same one the current WBS autocomplete already uses) and the `Field`/modal conventions duplicated across `BOQPage.tsx`, `ActivitySchedulePage.tsx`, `MaterialsPage.tsx`, `ProjectListPage.tsx`, and `DailyProgressPage.tsx` — not the separate `@cip/ui` component library, which no page in `packages/app` currently consumes.

## Capabilities

### New Capabilities
- `boq-item-entry`: Catalog-driven creation and editing of a project's BOQ items — cascading chapter/sub-chapter/section/line-item selection, read-only catalog-derived description, and denormalized chapter/section/line-item/Revit-category/family-type fields stored on each `boq_items` row.

### Modified Capabilities
(none — no capability has been synced to `openspec/specs/` yet for `boq_items` add/edit or bulk import; this change defines `boq-item-entry` fresh)

## Impact

- **Database**: migration adding `chapter`, `section`, `line_item` (or renaming the existing `description` column into this role — see design.md), `revit_category`, `family_type` columns to `boq_items`, plus a trigger to populate them from `boq_code_catalog` on insert/update of `wbs_code`; migration dropping `boq_items.trade`.
- **Frontend**: `BOQDialog` on `packages/app/src/pages/BOQPage.tsx` rewritten around the cascading picker, read-only description, and no Status field in either mode; BOQ table's Trade column/filter removed; `packages/app/src/lib/boqImport.ts` and `BOQBulkImportDialog` lose the Trade column and gain catalog-resolved description on matched rows.
- **Types/API**: `BOQItem` and `CreateBOQItemInput`/`CreateBOQItemsInput` in `packages/app/src/types/index.ts` and `packages/app/src/api/boq.ts` drop `trade` and gain the new denormalized fields (read-only from the client's perspective — populated by the DB trigger, not sent on insert).
- **No other consumers** of `boq_items.trade` exist outside `BOQPage.tsx`/`boqImport.ts` (confirmed via repo search), so the drop is contained.
