## Context

BOQ items are project-scoped rows (`boq_items`) whose `wbs_code` is a foreign key into the governed, hierarchical `boq_code_catalog` (chapter → sub_chapter → section → line_item, migration 011), enforced by a `NOT VALID` FK plus a trigger that additionally requires the code to be at `line_item` level (migration 013). Depth is **not** uniform: some branches run the full four levels (`01.10.00.00` Site Labour Camp → `01.10.10.00` Site Clearance → `01.10.10.01` line item), others skip Section entirely (`02.60.00.00` Form Work's line items attach directly to the sub-chapter), and an entire chapter (Finishes) never has a Section at any branch.

Today's "Add/Edit BOQ Item" dialog (`BOQDialog` in `packages/app/src/pages/BOQPage.tsx`) is a free-text `wbs_code` input with autocomplete *suggestions* drawn from the catalog — nothing stops submission of a code that isn't in the catalog or isn't line-item level, so the DB's FK/trigger is the only real enforcement, and it surfaces as a raw error (reproduced during manual QA of the recently-shipped bulk-import feature; see that change's fix for the equivalent unmatched-code case). Every page in `packages/app` (`BOQPage`, `ActivitySchedulePage`, `MaterialsPage`, `ProjectListPage`, `DailyProgressPage`) hand-rolls its own copy of the same modal shell and a local `Field` helper — there is a separate `@cip/ui` component package with a `Combobox`/`Dialog`, but no page in the live app imports it, so "the app's design" in practice means this shared hand-rolled convention, not `@cip/ui`.

An interactive HTML prototype (reviewed and approved for functionality) validated the dynamic-depth cascading picker against a realistic subset of the seed catalog, including the skip-section branches.

## Goals / Non-Goals

**Goals:**
- Every `wbs_code` written from the UI resolves to an existing `line_item`-level catalog entry by construction — the FK/trigger error class found in QA becomes unreachable from the UI, not just better-handled.
- The picker adapts to whatever depth a branch actually has (2 to 4 levels) with no special-casing per chapter.
- Description and Unit reflect the governed catalog value once a line item is chosen, with no manual retyping.
- Remove Trade (superseded by Revit Category/Family Type) and Status (a governed/catalog-side concern, not a per-item form field) from the manual entry flow entirely.
- Per-project reporting/exports can read chapter/section/line-item text and Revit mapping directly off `boq_items`, with no join back to the catalog.
- The new picker feels like it belongs in this app: same combobox interaction the current WBS field already uses, same `Field`/modal conventions as every other page.

**Non-Goals:**
- Adding the cascading picker to bulk-import's per-row spreadsheet editing — rows there keep resolving a typed/pasted code against the catalog (matched/unmatched/invalid), unchanged.
- Migrating any page onto `@cip/ui` — out of scope and a much larger effort than this change.
- Backfilling or reconciling existing `boq_items` rows whose `wbs_code` is legacy free text or doesn't resolve to a catalog line item — their new denormalized columns simply stay null, identical to how an unmatched bulk-import row already behaves.
- Making the denormalized chapter/section/line-item/Revit/family fields independently editable — they are derived and read-only from the client's perspective.

## Decisions

**1. Walk the hierarchy dynamically via `parent_code`, not a fixed number of steps.**
After each selection, query that code's children; if they're `line_item`-level, render the terminal Line Item step, otherwise render one more step labeled for whatever level the children actually are (`sub_chapter` or `section`) and repeat. This is the only approach that handles Form Work/RCC Band (skip Section) and all of Finishes (never has Section) without per-chapter special-casing.
*Alternative considered:* a single flat searchable list of all line items. Rejected — chapter/section context is exactly what narrows hundreds of line items down to a manageable choice; a flat list throws that scaffolding away.

**2. Each step is a type-to-filter combobox, not a native `<select>`.**
Reuses the existing WBS-field interaction (input + absolute-positioned suggestion list, `bg-blue-50` hover, `rounded-lg shadow-lg`) at every cascading level. A native select doesn't scale to chapters with dozens of line items and isn't what "top-notch, interactive" or "uniform with the rest of the app" point to — the throwaway HTML prototype used plain `<select>`s only to keep that mockup simple; the real implementation should not carry that shortcut forward.

**3. Breadcrumb chips track confirmed selections; clicking a chip's `×` clears from that level down.**
Validated in the prototype — lets a user jump back to re-pick a chapter without restarting the whole flow.

**4. Description and Unit become read-only once a Line Item is selected**, sourced live from the in-memory catalog entry (not the DB's denormalized column, which only exists after the row is written).

**5. Status is removed from both "Add BOQ Item" and "Edit BOQ Item."** New items default to `active` (matching the column default); a status change is not a manual per-item form field at all — it belongs to the catalog/governed side of the system, not this entry flow. The `boq_items.status` column, its table badge, and its filter are untouched — bulk import's Status column also stays, so importing remains the one path that can set a non-`active` status at creation time. See Risks/Trade-offs for the consequence this has on changing an existing item's status later.

**6. Trade is dropped as a column, not just hidden.** Revit Category/Family Type — now denormalized onto `boq_items` — supersede what Trade was standing in for. `activities.trade` is a separate table/feature and is untouched.

**7. Denormalized columns are populated by an `AFTER INSERT OR UPDATE` trigger**, mirroring the pattern already established by `boq_items_check_wbs_code_level` (migration 013): runs in the same transaction, so a row is never visible with `wbs_code` set but stale/missing derived fields.
*Alternative considered:* a read-time view joining to the catalog. Rejected per your stated preference for physical columns — simpler exports/reports, and the catalog is governed/migration-only (migration 011's RLS comment: no app-level write policy), so staleness risk is minimal.

**8. "Section" folds in the sub-chapter when a branch has no distinct section level** (immediate non-terminal ancestor stored, whatever level it actually is) — confirmed.

**9. `description` is repurposed in place to hold the line item's catalog description (autofilled once a Line Item is selected)**, rather than adding a separate `line_item` column — confirmed, and consistent with how `wbs_code` itself was already repurposed from free text into a catalog reference (migration 013). Avoids a redundant column carrying the same meaning under a different name.

## Risks / Trade-offs

- [Dropping `trade` is a breaking, irreversible column drop] → Confirmed no other code outside `BOQPage.tsx`/`boqImport.ts` reads it; still worth exporting existing `trade` values before the migration runs, in case they're wanted for historical reference.
- [Denormalized columns can drift if a catalog description is ever edited after items reference it] → Catalog is migration-only/governed, so this should be rare; any future migration that edits an existing catalog row's description must also refresh `boq_items` rows denormalized from it (document as a standing rule for catalog-editing migrations).
- [Cascading picker is more clicks than free-text for a user who already knows the exact code] → Each step stays typeable (not click-only), so a known code can be typed through quickly rather than requiring list-scrolling.
- [New client-side hierarchy-walking logic] → Already exercised against real catalog data in the reviewed prototype; the same traversal is straightforward to unit test.
- [Removing Status from both Add and Edit means the single-item UI can no longer change an existing item's status to `omitted`/`variation`/`provisional` after creation] → Bulk import's Status column remains the one place that can still set a non-`active` status. If a manual per-item status change turns out to be needed later, that's a separate, future change — not reintroduced here.

## Migration Plan

1. Ship the schema migration first: add the denormalized columns + trigger, backfill existing rows whose `wbs_code` already resolves to a catalog line item (one-time `UPDATE`), and drop `trade`. Additive parts are backward-compatible; the `trade` drop is not, since the current UI still reads/writes it.
2. Ship the UI change (cascading picker, read-only description/unit, no Trade, no Status on either Add or Edit) in the same release as step 1, so there's no window where the deployed UI references a dropped column.
3. No RLS changes needed — new/changed columns inherit the existing row-level policies on `boq_items` (policies are table-scoped).
4. Rollback: the denormalization is purely additive and safe to keep independently; if the `trade` drop specifically needs to be reverted, keep it as its own migration step so it can be rolled back without touching the denormalization work.
