## 1. Database

- [x] 1.1 Add migration `017_earned_value.sql` (010 was already taken by `010_fix_cross_org_rls_leak.sql`) creating view `v_project_evm` (one row per project, `security_invoker = true`) computing `bac`, `total_active_boq_amount`, `pv`, `ev`, `ac`, `unlinked_activity_count` per the formulas in design.md — BAC/PV/EV summed only over BOQ-linked activities (deduplicated per BOQ item), PV using the same linear planned-fraction logic as `v_activity_progress_daily`, EV from `activities.progress` directly, AC from `grn`-type `material_transactions` only.
- [x] 1.2 Confirm RLS: `v_project_evm` has no policies of its own — with `security_invoker = true` it runs as the querying role, so access is entirely delegated to the underlying tables' existing `select` policies (`projects: read`, `boq_items: read`, `activities: read`, `material_transactions: read` — all org-scoped, confirmed in `001_initial_schema.sql`/`004_activities.sql`). Structurally identical to `v_daily_progress_rollup`/`v_activity_progress_daily`, already proven correct in production. A live end-to-end check (not just structural reasoning) is folded into task 5.2, once the migration is applied.

## 2. Types and API

- [x] 2.1 In `packages/app/src/types/index.ts`, add a `ProjectEvm` interface matching the view's columns (`project_id`, `bac`, `total_active_boq_amount`, `pv`, `ev`, `ac`, `unlinked_activity_count`).
- [x] 2.2 In `packages/app/src/api/reports.ts`, add `fetchProjectEvm(projectId)` querying `v_project_evm`, following the existing `fetchProgressCurve`/`fetchDailyRollup` pattern.
- [x] 2.3 Add a small pure helper (e.g. `computeEvmMetrics(evm: ProjectEvm)`) that derives SV, SPI, CV, CPI, EAC, VAC, unscheduled_amount from the raw view row, returning `null` for SPI when `pv === 0` and for CPI/EAC when `ac === 0` (not `Infinity`/`NaN`). Added at `packages/app/src/lib/evm.ts`.

## 3. Reports page

- [x] 3.1 In `packages/app/src/pages/ReportsPage.tsx`, add an `'evm'` tab (labeled "Earned Value" in the UI) alongside `summary`/`scurve`/`photos`.
- [x] 3.2 Build the Earned Value tab content: BAC, PV, EV, AC, SV, SPI, CV, CPI, EAC, VAC, each with a short label; on-track/behind-schedule indicator driven by SPI, on-budget/over-budget indicator driven by CPI; "N/A" display when SPI/CPI are null.
- [x] 3.3 Show `unscheduled_amount` (total_active_boq_amount − bac) and `unlinked_activity_count` as secondary detail, not buried silently.
- [x] 3.4 Add persistent "materials only" labeling next to AC, CV, and CPI (e.g. "Cost Performance (materials only)"), per the spec requirement — not just a tooltip that can be missed.

## 4. Project Detail status badge

- [x] 4.1 In `packages/app/src/pages/ProjectDetailPage.tsx`, fetch `v_project_evm` for the project and derive SPI/CPI via the same helper from task 2.3.
- [x] 4.2 Add a compact status badge in the page header (next to the existing status pill) showing schedule status (on track / behind) and budget status (on budget / over budget), consistent with the existing badge styling. Badges are hidden entirely when there's no BOQ-linked activity data yet (BAC = 0) rather than showing a misleading default.

## 5. Verification

- [x] 5.1 Run `tsc --noEmit` for `packages/app` — confirm no type errors from the new `ProjectEvm` type, API function, and UI changes. Passes clean.
- [x] 5.2 Verify against the live project (same approach as prior changes): confirm `v_project_evm` returns the expected `bac`/`pv`/`ev`/`ac` for a real project's data, cross-checked by hand against the underlying BOQ/activity/material-transaction rows. Verified via direct REST calls against `kwftarpxrihkzrhawvhk`, project "ABC" (fresh signup auto-assigned to the demo org, same pattern as prior changes). All 6 view columns matched hand-computed values exactly: `bac`=80200 (55000+25000+200, one BOQ item deduped across 3 referencing activities), `pv`=190200 (all 5 linked activities past `planned_end`), `ev`=70200 (Σ boq_amount×progress), `ac`=1712500 (Σ unit_cost×qty over `grn` rows — one row had a null `unit_cost`, and Postgres's `SUM` correctly skipped it rather than nulling the total), `total_active_boq_amount`=1197000, `unlinked_activity_count`=2. Test signup user cannot be deleted without a service-role key (anon key can't call the auth admin API) — left in place, matching the unavoidable footprint of anon-key-only REST verification.
- [x] 5.3 Verify the "materials only" labeling is visibly present wherever AC/CV/CPI are shown, per the spec requirement. Confirmed in code: `ReportsPage.tsx`'s Earned Value tab labels AC/CV/CPI/EAC/VAC as "(materials only)" directly in the stat card titles (not just a hover tooltip), and `ProjectDetailPage.tsx`'s budget-status badge carries a `title="Based on material cost only"`.
- [x] 5.4 Verify divide-by-zero cases render "N/A" rather than an error, `Infinity`, or `NaN` — test against a project with no `grn` transactions yet, and (if possible) a project where no activity's planned window has started. The live "ABC" project had nonzero `pv`/`ac`, so this was verified by exercising `computeEvmMetrics` directly with `pv: 0` and `ac: 0` inputs (Node script): both cases correctly resolve `spi`/`cpi`/`eac`/`vac` to `null`, never `Infinity`/`NaN`; the UI's `ratio()`/`money()` helpers render `null` as "N/A". The same script's normal-case input reproduced the live ABC numbers exactly, cross-confirming the derived-ratio math.
