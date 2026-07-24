## Context

`BOQPage.tsx` currently supports only single-row creation through `BOQDialog`, which calls `createBOQItem` (`packages/app/src/api/boq.ts`) — one Supabase `.insert().select().single()` per submit. Real BOQs run to hundreds of rows, so this proposal adds a client-side bulk import: upload a CSV/XLSX, validate rows against `boq_code_catalog`, preview/correct, then insert only the valid rows in one batched call.

Relevant existing constraints:
- `boq_items.wbs_code` has a `NOT VALID` FK to `boq_code_catalog(code)` plus a trigger (`boq_items_wbs_code_level_check`) that rejects any `wbs_code` resolving to a catalog entry whose `level <> 'line_item'`. Free-text codes that don't match any catalog entry are silently allowed (legacy grandfathering) — the import validator must replicate this same permissiveness rather than being stricter than the DB.
- `boq_items` write RLS (`001_initial_schema.sql`) requires the caller's `profiles.role` to be one of `admin`, `project_manager`, `qty_surveyor`, in addition to project/org scoping. Bulk import doesn't change this — it's enforced automatically by RLS on every inserted row.
- `amount` is a DB-generated column (`quantity * unit_rate`) and must never be included in insert payloads.
- No CSV/XLSX parsing library exists in `packages/app` today; no multi-row `.insert([...])` call exists anywhere in the API layer yet — this feature introduces both patterns.
- The full `boq_code_catalog` is already loaded client-side once with `staleTime: Infinity` (`BOQPage.tsx`), so the import dialog can reuse that same in-memory data for matching without a new fetch.

## Goals / Non-Goals

**Goals:**
- Let a user upload a CSV/XLSX of BOQ line items and see per-row validation status before anything is written.
- Match each row's WBS code against the existing catalog client-side, reusing the same matching semantics as the single-item `BOQDialog` (line-item-level codes valid; unmatched codes are a warning, not a hard block, consistent with DB behavior).
- Insert only rows the user has confirmed as valid, in one batched request, and report a clear summary (created / skipped / reasons).
- Ship a downloadable template so users know the expected columns.

**Non-Goals:**
- No schema or RLS changes — reuses `boq_items` and `boq_code_catalog` exactly as they exist.
- No server-side parsing/validation endpoint — all parsing and validation happens client-side; the server-side guarantee is still the existing FK/trigger/RLS stack.
- No partial-row editing inline beyond what's needed to fix an invalid row before import (this is not a spreadsheet editor).
- No support for updating/upserting existing `boq_items` rows via import — only net-new row creation.

## Decisions

### 1. Parsing library: SheetJS (`xlsx`) for both CSV and XLSX
A single client-side library that parses both formats avoids branching logic and an extra CSV-only dependency. `xlsx` reads a workbook, and a CSV is parsed the same way as a single-sheet workbook. Alternative considered: `papaparse` (CSV) + `xlsx` (spreadsheet) as two dependencies — rejected to keep the dependency surface and code paths smaller, since `xlsx` alone covers both.

### 2. Validation runs entirely client-side, mirrors DB constraints
Each row is validated against the same rules the DB already enforces, so a row that passes preview is (barring a race with another writer) guaranteed to insert successfully:
- `wbs_code` must resolve to a `boq_code_catalog` entry with `level === 'line_item'` (mirrors the trigger). A code that doesn't match any catalog entry is flagged as "unmatched" but not blocked, matching the legacy free-text allowance already in the DB — the user can choose to skip or force-import it.
- `description` and `quantity` and `unit_rate` are required (mirror the `not null` columns); `quantity`/`unit_rate` must parse as non-negative numbers.
- Rows failing required-field or numeric-format checks are hard-blocked from import (skipped by default) since the DB would reject them outright (`not null` / numeric cast failure).

Alternative considered: send raw rows to the server and let Postgres constraints be the sole validation, showing errors after the fact. Rejected — the proposal explicitly calls for a preview/fix step *before* committing, which requires client-side pre-validation.

### 3. Batch insert as a single new API function, not per-row loop
Add `createBOQItems(projectId, rows[])` to `packages/app/src/api/boq.ts` that does one `supabase.from('boq_items').insert(rows).select()` call (array insert, one round trip), rather than `Promise.all` of N single-row inserts. This is a new pattern for the codebase (no existing array-insert call), but is the natural Supabase-idiomatic approach and avoids N separate network round trips and N separate RLS/trigger evaluations being reported individually to the client.

Trade-off: a Postgres array insert is all-or-nothing per statement — if any single row in the batch violates a constraint (e.g. a race where a code was removed from the catalog between preview and commit), the entire batch fails. Mitigated by validating client-side immediately before commit (re-check against the already-loaded catalog, which is effectively static reference data) and, if the DB does reject the batch, surfacing the raw error and letting the user retry — consistent with the existing "throw raw PostgrestError" pattern used by every other function in `boq.ts`. Chunking into smaller batches (e.g. 50 rows) is deferred as a follow-up if real-world batch failures prove this insufficient.

### 4. Reuse existing modal/dialog conventions, no new dialog primitive
The import dialog follows the same hand-rolled modal pattern as `BOQDialog` (`fixed inset-0 z-50` overlay, centered card) rather than introducing `packages/ui`'s `Dialog` organism, to stay visually and structurally consistent with the page's existing "Add Item" dialog.

### 5. Template download is a static client-generated file, not a server asset
The CSV template (`WBS Code, Description, Trade, Quantity, Unit, Unit Rate, Status` header row) is generated client-side via a `Blob` download, avoiding a server endpoint or static asset for a fixed, small file.

## Risks / Trade-offs

- **[Risk]** Large files (hundreds+ rows) parsed and validated entirely in the browser main thread could jank the UI. → **Mitigation**: BOQs are described as running to "hundreds" of rows, not tens of thousands; a synchronous parse/validate pass at that scale is acceptable. Revisit with a Web Worker only if real usage shows jank.
- **[Risk]** Whole-batch insert failure (one bad row fails all rows) could be confusing after a large import. → **Mitigation**: client-side pre-validation against the same catalog data used for preview should make a batch-time DB rejection rare; if it happens, the raw error is surfaced and no partial state is silently lost (nothing was inserted).
- **[Risk]** RLS requires `admin` / `project_manager` / `qty_surveyor` role for the insert; a user without one of those roles can still parse/preview a file but the final insert will fail. → **Mitigation**: this matches the existing single-item add behavior (same RLS check already applies to `createBOQItem`), so no new failure mode is introduced — the import summary reports the RLS rejection the same way `createBOQItem` already surfaces write errors today.
- **[Risk]** `xlsx` is a new dependency with historical CVEs in older versions around prototype pollution in certain parsing paths. → **Mitigation**: pin to a current, patched version and only parse user-supplied files client-side (no server-side parsing of untrusted input).

## Migration Plan

No data migration. Rollout is additive: new UI entry point, new API function, new dependency. Rollback is a revert of the frontend change — no schema or RLS state to unwind.
