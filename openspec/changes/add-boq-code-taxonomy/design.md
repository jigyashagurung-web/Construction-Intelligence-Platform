## Context

BOQ items today (`supabase/migrations/001_initial_schema.sql:75-95`) store `wbs_code` and `trade` as free text, with no shared taxonomy across projects. A controlled external standard exists (`EN_BOQ_Coded_Revit_Integration`, v1.0) defining a 4-level hierarchical code — `Chapter.SubChapter.Section.Item` (e.g. `02.40.30.01`) — where every level (including group headers like "Chapter"/"Sub Chapter"/"Section") is itself a row with a code and description, and only the leaf "Line Item" rows carry unit, Revit Category, and Family Type. The source spreadsheet explicitly treats this as a governed reference: new codes require sign-off, not ad hoc entry per project.

"WBS code" and "BOQ code" are the same concept here, so this design repurposes the existing `wbs_code` column rather than adding a second column alongside it — there is no `boq_code`/`wbs_code` split; `wbs_code` itself becomes the structured, catalog-backed value.

This design covers how that taxonomy is represented in the database and how `boq_items` connects to it. It does not cover Revit/BIM import tooling (explicitly out of scope per the proposal).

## Goals / Non-Goals

**Goals:**
- Represent the full 4-level code hierarchy faithfully, including group-header levels (chapter/sub-chapter/section), not just leaf items.
- Constrain `boq_items.wbs_code` to leaf ("line item") codes only, once backfilled.
- Make the catalog a single shared reference, not duplicated/customizable per project or org.
- Support a non-breaking transition: existing free-text `wbs_code` values keep working until backfilled to the new structured format.

**Non-Goals:**
- Revit/BIM model import or auto-sync of quantities (future change).
- Per-org or per-project custom codes/taxonomy extensions.
- Introducing a separate `boq_code` column — `wbs_code` is repurposed in place, not duplicated.
- Removing or renaming `trade` in this change.

## Decisions

**1. One self-referential `boq_code_catalog` table for all 4 levels, not 4 separate tables.**
The source data already models chapter/sub-chapter/section/item as rows of the same shape (code, description, level) — mirroring that avoids a 4-way join just to resolve a line item's ancestry, and keeps seeding simple (one fixture derived directly from the spreadsheet). Alternative considered: separate `boq_chapters`/`boq_sub_chapters`/`boq_sections`/`boq_line_items` tables — rejected as needless normalization for data that's read-mostly and never restructured at runtime.

Columns: `code` (PK, text, e.g. `02.40.30.01`), `parent_code` (FK to `boq_code_catalog.code`, null for chapters), `level` (enum: `chapter` | `sub_chapter` | `section` | `line_item`), `description`, `unit` (null except for `line_item`), `revit_category` (null except for `line_item`), `family_type` (null except for `line_item`).

**2. `boq_items.wbs_code` is constrained to `line_item`-level codes via a trigger, not a plain FK.**
A plain FK can reference any row in `boq_code_catalog` regardless of level; a `BEFORE INSERT OR UPDATE` trigger on `boq_items` validates `level = 'line_item'` for the referenced code. Alternative considered: a partial unique index / separate leaf-only view as the FK target — rejected because Postgres FKs can't target a view, and a generated "leaf codes" table would duplicate data.

**3. `boq_code_catalog` is global, not org- or project-scoped.**
Per the source standard's own governance note, this is one shared taxonomy, not a per-tenant customization. RLS: `SELECT` allowed for any authenticated user; no `INSERT`/`UPDATE`/`DELETE` policy for app roles — the catalog is only mutated via migrations (service role). This is simpler than the per-org policies added in `010_fix_cross_org_rls_leak.sql` since there's no org boundary to enforce, only read-vs-write.

**4. `wbs_code`'s FK constraint is added unenforced first, then tightened after backfill.**
The column type/FK change lands in this change, but existing free-text values are not valid structured codes yet. The FK + leaf-level trigger are added with `NOT VALID` (or applied only to new/updated rows) so existing rows keep working unchanged; a separate backfill pass maps old values to catalog codes, after which the constraint is validated for all rows. New/edited items are expected to set `wbs_code` via the app's catalog picker from day one.

**5. `trade` and `status` on `boq_items` are untouched.**
`trade` overlaps conceptually with the chapter-level ancestor of a line item's code, but collapsing them is a separate decision with its own migration risk (existing filters/reports may depend on `trade`'s current values) — left as an open question below rather than folded into this change.

## Risks / Trade-offs

- **Risk**: Existing free-text `wbs_code` values don't map cleanly 1:1 to the new catalog codes → **Mitigation**: backfill is an explicit, separately-tracked follow-up task with manual review, not assumed automatic; the FK constraint stays unenforced on legacy rows until that's done.
- **Risk**: A real project needs a code the standard doesn't cover → **Mitigation**: accepted trade-off per the source's own governance model; catalog gaps are filled by a migration adding new rows, not by relaxing the schema to allow ad hoc codes.
- **Risk**: Trigger-based level enforcement is less discoverable than a plain FK constraint → **Mitigation**: documented here and in the migration's own comment; covered by a spec scenario so it's tested.
- **Risk**: Global-only catalog blocks future multi-tenant customization if a customer needs their own coding scheme → **Mitigation**: explicitly deferred (see Open Questions); current known customers all use this one standard.

## Migration Plan

1. Create `boq_code_catalog` table with `level` enum and the level-check trigger function (used by both the catalog's own parent/child consistency and by `boq_items`).
2. Seed migration: insert the full taxonomy (chapters → line items) transcribed from the source spreadsheet.
3. Alter `boq_items.wbs_code`: add the FK into `boq_code_catalog` as `NOT VALID` plus the leaf-only trigger, so existing free-text rows are unaffected until validated.
4. Add RLS: global authenticated `SELECT` on `boq_code_catalog`; no app-role write policy.
5. Update app layer (`packages/app/src/api/boq.ts`, `types/index.ts`, `BOQPage.tsx`) to replace free-text `wbs_code` entry with a catalog-backed code picker for new/edited BOQ items.
6. Track backfill of existing free-text `wbs_code` values to structured catalog codes as a separate follow-up task; run `VALIDATE CONSTRAINT` once complete (not blocking this change's rollout).
7. **Rollback**: drop the FK/trigger from `boq_items.wbs_code` (column and existing values are untouched) and drop `boq_code_catalog` (including its RLS policy and trigger function). Non-destructive since no existing data is altered.

## Open Questions

- Should `trade` eventually be deprecated in favor of deriving it from the chapter ancestor of `wbs_code`? (deferred — separate change)
- Will any org ever need codes outside this standard taxonomy, and if so, does the catalog need an org-scoped extension mechanism later?
- Who owns backfilling existing free-text `wbs_code` values to structured catalog codes, and on what timeline?
