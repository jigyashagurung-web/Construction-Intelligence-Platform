## 1. Database migration (`supabase/migrations/015_boq_items_catalog_fields.sql`)

- [x] 1.1 Add nullable columns to `boq_items`: `chapter text`, `section text`, `revit_category text`, `family_type text` (repurpose the existing `description` column to hold the line-item description once a catalog code is set, per design.md decision 9 — no new column for it).
- [x] 1.2 Add a `before insert or update of wbs_code on boq_items` trigger function that, given `new.wbs_code`: resolves the catalog entry and its ancestry; if it resolves to a `line_item`, sets `chapter` = the chapter ancestor's description, `section` = the nearest non-terminal ancestor's description (`section`-level if one exists on that branch, otherwise the `sub_chapter`'s), `revit_category`/`family_type` from the line item; if `wbs_code` is null or doesn't resolve to a `line_item`, sets all four fields to null. Mirrors the lookup style already used by `boq_items_check_wbs_code_level` (migration 013). Implemented as `BEFORE` (mutating `NEW.*` directly, like the existing `set_updated_at` trigger) rather than `AFTER` as originally sketched — avoids a second `UPDATE` statement and recursive trigger firing.
- [x] 1.3 One-time backfill: `update boq_items set wbs_code = wbs_code` reuses the trigger above (fires on any UPDATE touching `wbs_code`, including a same-value reassignment) instead of duplicating its resolution logic in a separate statement.
- [x] 1.4 Drop the `trade` column from `boq_items`.

## 2. Types and API layer

- [x] 2.1 In `packages/app/src/types/index.ts`, remove `trade` from `BOQItem` and add `chapter: string | null`, `section: string | null`, `revit_category: string | null`, `family_type: string | null` (leave `description` as-is, now catalog-sourced once a code is set).
- [x] 2.2 In `packages/app/src/api/boq.ts`, remove `trade` from `CreateBOQItemInput`; the new denormalized fields are DB-trigger-populated and are not part of the insert payload.

## 3. Cascading code picker component

- [x] 3.1 Add a component (`packages/app/src/components/BoqCodePicker.tsx`) that, given the loaded catalog and a selected code, derives the ordered path of steps by walking `parent_code` from the root: each step is a labeled (Chapter / Sub Chapter / Section / Line Item, per the actual level of that step's options) type-to-filter combobox, reusing the existing input + absolute-positioned suggestion list pattern (`bg-blue-50` hover, `rounded-lg shadow-lg`) already used by the current WBS autocomplete in `BOQDialog`.
- [x] 3.2 Render confirmed selections as breadcrumb chips above the active step; clicking a chip's `×` clears that level and everything after it, re-deriving subsequent steps.
- [x] 3.3 Stop rendering further steps once the selected code is `line_item`-level. The component reports only the final `wbs_code` via `onSelect` (undefined until a line item is reached); the parent form looks up the resolved catalog entry itself (for description/unit/revit/family) from `codeCatalog` + the selected code, rather than the picker exposing the entry object directly — a cleaner split of responsibility than originally sketched.

## 4. Add/Edit BOQ item form (`BOQDialog` in `packages/app/src/pages/BOQPage.tsx`)

- [x] 4.1 Replace the free-text WBS Code input with `BoqCodePicker`.
- [x] 4.2 Make Description and Unit read-only, populated from the picker's resolved line-item entry; clear/disable them until a line item is selected.
- [x] 4.3 Remove the Trade field and its state/handlers from the form.
- [x] 4.4 Remove the Status field from both "Add" and "Edit" mode (new items default to `active`, matching the DB default; editing an existing item no longer changes its status through this form).
- [x] 4.5 Disable submit until a `line_item`-level code, Quantity, and Unit Rate are all present (mirrors existing required-field behavior, now gating on the picker instead of free text). Note: this also means editing a legacy item whose `wbs_code` doesn't resolve to a catalog line item now requires assigning it a valid one via the picker before any other field can be saved — consistent with migration 013's comment that "edited rows are expected to use catalog codes," but flagging since it's a real behavior change for old data.

## 5. BOQ table cleanup

- [x] 5.1 Remove the Trade column from the BOQ items table and the Trade filter dropdown/state on `BOQPage.tsx`.

## 6. Bulk import updates (`packages/app/src/lib/boqImport.ts`, `BOQBulkImportDialog`)

- [x] 6.1 Remove `trade` from `BoqImportRawRow`, `TEMPLATE_COLUMNS`, and the generated CSV template.
- [x] 6.2 Remove the Trade column from the import preview table.
- [x] 6.3 For rows classified `matched`, set the row's `description` (and `unit`, extending the same principle) from the resolved catalog line item rather than the imported free-text value (consistent with manual entry now always reflecting the catalog).

## 7. Verification

- [x] 7.1 Added `supabase/tests/database/015_boq_items_catalog_fields_test.sql` (16 assertions) covering: `trade` dropped / new columns exist, full-depth branch (`01.10.10.01`), skip-section branch (`02.60.10.01`, folds sub-chapter into `section`), null `wbs_code`, unmatched/legacy `wbs_code`, and an update that recomputes fields for a different line item. Verified the referenced catalog codes/descriptions against `012_boq_code_catalog_seed.sql` by hand. Not executed — this sandbox has no Docker, same limitation noted for the earlier `001_initial_schema_test.sql`; run via `npm run test:db` on a machine with Docker.
- [x] 7.2 Run `tsc --noEmit` for `packages/app`. Clean (one unused `ChevronDown` import left over from the removed Trade filter was also cleaned up).
- [x] 7.3 Manually verified in the browser against the live project: cascading picker works across depth scenarios, Description/Unit lock correctly, Trade and Status are gone from both Add and Edit while the table's Status badge/filter still work. Verification surfaced two real bugs, both fixed: (1) `PickerStep` had no `key`, so React reused the same instance across levels and every step after Chapter inherited the prior step's closed/reset state instead of opening pre-populated; (2) the picker's dropdown was capped at 8 options and required typing before showing anything — reworked to open pre-populated with the full option list, codes shown on breadcrumb chips, and a "Selected code" line once a Line Item is chosen.
- [x] 7.4 Manually verified a bulk import still classifies matched/unmatched/invalid rows correctly with Trade removed from the template.
