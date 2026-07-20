## 1. Catalog schema

- [x] 1.1 Create migration `supabase/migrations/011_boq_code_catalog.sql` defining `boq_code_catalog` (`code` PK text, `parent_code` FK to itself nullable, `level` enum `chapter`/`sub_chapter`/`section`/`line_item`, `description` not null, `unit` nullable, `revit_category` nullable, `family_type` nullable, `created_at`, `updated_at`).
- [x] 1.2 Add a trigger function validating hierarchy consistency (chapter has no parent; every other level's parent must be strictly higher in the hierarchy — relaxed from "exactly one level up" to "any higher level" since several sub-chapters in the source have line items directly beneath them with no intermediate section row).
- [x] 1.3 Add RLS: enable RLS on `boq_code_catalog`, add a `SELECT` policy for any authenticated user, and no `INSERT`/`UPDATE`/`DELETE` policy for app roles.

## 2. Seed data

- [x] 2.1 Transcribe the full taxonomy from `EN_BOQ_Coded_Revit_Integration` into `012_boq_code_catalog_seed.sql` + `014_boq_code_catalog_seed_plumbing_complete.sql`. All 7 chapters, 25 sub-chapters, 16 sections, and 100 line items now transcribed (the source sheet ends at row 149, matching this count exactly: 7+25+16+100=148 data rows).
- [x] 2.2 Seed migrations `012_boq_code_catalog_seed.sql` (chapters 01–06 + sub-chapter 07.10) and `014_boq_code_catalog_seed_plumbing_complete.sql` (remaining plumbing sub-chapters 07.20–07.70, plus 2 data fixes to rows seeded by 012) inserting the transcribed rows. Both applied successfully to the live Supabase project.
- [x] 2.3 Verify seed data round-trips. Confirmed against the live database: `total = 148`, `chapters = 7`, `sub_chapters = 25`, `sections = 16`, `line_items = 100`, `orphaned_parents = 0`.

## 3. `boq_items.wbs_code` migration

- [x] 3.1 Add migration `supabase/migrations/013_boq_items_wbs_code_fk.sql` adding an FK from `boq_items.wbs_code` to `boq_code_catalog.code`, created `NOT VALID` so existing free-text rows are unaffected.
- [x] 3.2 Add the leaf-only trigger (`BEFORE INSERT OR UPDATE` on `boq_items`) validating that `wbs_code`'s catalog entry has `level = 'line_item'` whenever `wbs_code` is set to a value present in `boq_code_catalog`.
- [x] 3.3 Documented in the migration's own header comment that `VALIDATE CONSTRAINT` is deferred until the backfill in section 5 is complete.

## 4. App layer

- [x] 4.1 Updated `packages/app/src/types/index.ts` `BOQItem.wbs_code` doc comment and added `BoqCodeLevel`/`BoqCodeCatalogEntry` types.
- [x] 4.2 Added `fetchBoqCodeCatalog` and `resolveBoqCodeAncestry` to `packages/app/src/api/boq.ts`.
- [x] 4.3 Replaced free-text `wbs_code` entry in `packages/app/src/pages/BOQPage.tsx` with a searchable combobox over line-item catalog entries (matches on code, own description, ancestor chapter/sub-chapter/section descriptions, Revit category/family type).
- [x] 4.4 Legacy free-text values are untouched: the field stays a free-editable text input with suggestions layered on top, so existing rows render and remain editable without forcing a code change; `tsc --noEmit` passes.

## 5. Backfill (tracked, not blocking rollout)

- [ ] 5.1 Write a mapping report of all distinct existing `boq_items.wbs_code` values against the new catalog, flagging ones with no obvious match for manual review. **Blocked**: requires querying the live production/staging database's actual `boq_items` rows, not available in this environment.
- [ ] 5.2 Apply reviewed mappings to update existing rows' `wbs_code` to valid catalog line-item codes. **Blocked**: depends on 5.1 and a live database connection.
- [ ] 5.3 Once all rows are backfilled, run `VALIDATE CONSTRAINT` on the FK added in 3.1 and remove the "unvalidated" note from the migration docs. **Blocked**: depends on 5.2.

## 6. Verification

- [x] 6.1 Confirmed against the live database: inserting a `boq_items` row with `wbs_code = '07.40.00.00'` (sub_chapter) is rejected by the trigger (`wbs_code 07.40.00.00 is a sub_chapter code; boq_items.wbs_code must reference a line_item`); inserting with `wbs_code = '07.40.10.01'` (line_item) succeeds.
- [x] 6.2 Confirmed against the live database: `boq_code_catalog` has exactly one RLS policy, `SELECT`-only (`polcmd = 'r'`), `using` clause `auth.role() = 'authenticated'` — readable by any authenticated user regardless of org/project, no INSERT/UPDATE/DELETE policy exists for app roles.
- [x] 6.3 Confirmed against the live database: 2 existing `boq_items` rows have legacy `wbs_code` values not present in `boq_code_catalog`; these remain readable (the FK is `NOT VALID`, so they are not blocked).
