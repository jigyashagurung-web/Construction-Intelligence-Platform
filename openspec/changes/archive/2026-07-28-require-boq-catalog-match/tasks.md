## 1. Validation logic

- [x] 1.1 In `packages/app/src/lib/boqImport.ts`, update `validateBoqImportRow` to treat a blank WBS Code as a missing required field (add to `reasons`, same style as Description/Quantity/Unit Rate).
- [x] 1.2 Update the non-matching-code branch (currently sets `codeWarning`) to instead push an invalid reason (e.g. `WBS Code "<code>" does not match any catalog entry`) and remove the `codeWarning` variable and the `unmatched` status branch entirely.
- [x] 1.3 Narrow `BoqImportRowStatus` from `'matched' | 'unmatched' | 'invalid'` to `'matched' | 'invalid'`.
- [x] 1.4 Confirm the returned `item` (once a row is `matched`) always carries a defined `wbs_code` from `matchedEntry.code` — no more `wbs_code: undefined` path.

## 2. Preview UI

- [x] 2.1 In `packages/app/src/pages/BOQPage.tsx`, remove the `unmatched` entry from `IMPORT_STATUS_LABEL` and `IMPORT_STATUS_COLOR`.
- [x] 2.2 Remove the `unmatched` count from `counts` (the `useMemo` in `BOQBulkImportDialog`) and its badge in the preview step's summary line.

## 3. Spec sync

- [x] 3.1 Verify the delta spec at `openspec/changes/require-boq-catalog-match/specs/boq-bulk-import/spec.md` matches the implemented behavior exactly once code changes land.

## 4. Verification

- [x] 4.1 Run `tsc --noEmit` for `packages/app` — confirm no type errors from the narrowed `BoqImportRowStatus`.
- [x] 4.2 Re-run (or write) a standalone script driving `parseBoqImportFile`/`validateBoqImportRow` against rows covering: a matching `line_item` code (matched), a non-line-item code (invalid), a code absent from the catalog (now invalid, not unmatched), and a blank WBS Code (invalid). Verified via a scratch script (not committed): all four cases returned exactly the expected status/reasons.
- [x] 4.3 Verified against the live project (`kwftarpxrihkzrhawvhk`, project "ABC", fresh signup auto-assigned to the demo org) via direct REST calls with a real session token, since browser automation wasn't available this session: (1) a valid `line_item` code (`01.10.10.01`) inserts successfully and the DB trigger correctly populates `chapter`/`section`/`revit_category`/`family_type`; (2) a code absent from the catalog (`99.99.99.99`) is rejected server-side with FK violation `23503`; (3) a non-line-item (`section`) code (`01.10.10.00`) is rejected server-side with `P0001: wbs_code ... is a section code; boq_items.wbs_code must reference a line_item`. Confirms the client-side validation added in this change (invalid for non-matching or non-line-item codes) rejects exactly what the server would also reject — nothing that passes client validation can fail server-side, and vice versa. Test row cleaned up after. UI-level dialog rendering itself (badge/preview) not re-confirmed in-browser this session.
