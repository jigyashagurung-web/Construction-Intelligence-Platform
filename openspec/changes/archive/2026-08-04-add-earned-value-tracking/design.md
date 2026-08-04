## Context

The reporting migration (`009_reporting.sql`) already built `v_activity_progress_daily`, a cost-weighted planned-% vs actual-% curve per project per day, using each activity's linked BOQ item's `amount` as its weight and a linear planned ramp between `planned_start`/`planned_end`. Its own comment says explicitly: *"This is a v1 proxy for effort/cost share, not a real earned-value baseline — see design.md."* This change is that follow-up: turning the same weighting idea into dollar-denominated EVM (BAC/PV/EV/AC and derived variances), rigorously rather than as a display proxy.

Since `require-activity-boq-link` (`016_activities_require_boq_link.sql`), every *new* activity has a mandatory `boq_item_id`. Pre-existing activities from before that migration may still have a null `boq_item_id` (the migration didn't backfill them, only enforced the link going forward via the insert policy). There is also no DB constraint preventing two activities from referencing the same `boq_item_id` — the codebase already assumes a practical 1:1 activity↔BOQ-item relationship (same assumption `v_activity_progress_daily` makes), and this change keeps that assumption rather than solving it.

`MaterialTransaction` has no `activity_id`/`boq_item_id` column — only `project_id`/`material_id`. So Actual Cost can only be computed at the whole-project level; no per-activity cost variance is possible without a schema change, which is out of scope here.

## Goals / Non-Goals

**Goals:**
- Compute BAC, PV, EV, AC and derived SV, SPI, CV, CPI, EAC, VAC for a project, as of the current date (a live snapshot, not a historical trend).
- Weight every activity's contribution to PV/EV by its linked BOQ item's `amount` — no activity-count averaging.
- Make the material-cost-only nature of AC/CPI/CV impossible to miss in the UI.
- Surface unscheduled budget (active BOQ items with no linked activity) and unlinked activities (activities with no `boq_item_id`, legacy rows only) as visible counts, not silently dropped numbers.

**Non-Goals:**
- Historical EVM trend / time-series chart (e.g. "CPI over the last 6 months") — v1 is a current-state snapshot only, consistent with the "am I on schedule and on budget right now" question this change answers. A trend view is a natural future addition on top of the same view.
- Per-activity cost variance — blocked by `MaterialTransaction` having no activity link.
- Labour/equipment cost inclusion in AC — no rate/cost data exists anywhere for either today.
- Monte Carlo schedule risk, criticality heatmap, root-cause tagging, scenario modelling, cash-flow forecasting — later Phase 2 scope, not this change.
- Deriving `Activity.actual_start`/`actual_end` from the daily progress log — a real, separate data-integrity gap identified while scoping this change, tracked as its own follow-up since it doesn't affect any formula here.
- Re-baselining (adjusting PV after schedule slips) — out of scope; PV always reflects the current `planned_start`/`planned_end` values as stored.

## Decisions

- **New view `v_project_evm`, one row per project**, computed fresh on every query (no materialization, no new table) — mirrors the existing views' `security_invoker = true` pattern so RLS is enforced as the querying role, not the view owner.
  - `bac` = `sum(boq_items.amount)` for BOQ items that have at least one linked activity (joined via `activities.boq_item_id`, deduplicated per BOQ item to avoid double-counting if ever shared — though see Risks).
  - `total_active_boq_amount` = `sum(boq_items.amount)` for **all** active BOQ items in the project, linked or not. `unscheduled_amount = total_active_boq_amount − bac` is derived client-side, giving a "$X of budget has no schedule yet" figure without a second view.
  - `pv` = `sum(boq_amount_i × planned_fraction_i)` across BOQ-linked activities only, where `planned_fraction_i` is the same linear ramp already used in `v_activity_progress_daily` (0 before `planned_start`, 1 after `planned_end`, linear between).
  - `ev` = `sum(boq_amount_i × activity.progress_i / 100)` across BOQ-linked activities — reads the already-trigger-maintained `progress` column directly rather than recomputing cumulative quantity_consumed, since progress is guaranteed current.
  - `ac` = `sum(unit_cost × quantity)` across all `grn`-type `material_transactions` for the project, to date. **Procurement/cash basis, not consumption basis** — cost is counted when material is received, not when it's later issued to an activity. (`issue`/`return`/`adjustment` transactions don't affect AC.)
  - `unlinked_activity_count` = count of activities in the project with `boq_item_id is null`, surfaced so a PM notices if legacy data is being silently excluded from BAC/PV/EV.
- **Derived ratios (SV, SPI, CV, CPI, EAC, VAC) computed client-side**, not in SQL — the view returns only the raw aggregates (`bac`, `pv`, `ev`, `ac`, `total_active_boq_amount`, `unlinked_activity_count`). This mirrors the existing pattern where `ActivitySchedulePage.tsx` computes its "Overall Progress" KPI client-side from raw activity rows rather than in a view — keeps null/zero-division handling (see below) in one place (TypeScript) instead of duplicated in SQL and the API layer.
- **Divide-by-zero handling**: if `pv = 0` (e.g. no activity has started yet), SPI is undefined, not `Infinity`/`NaN` — displayed as "N/A" rather than a misleading number. Same for `cpi` when `ac = 0`.
- **Status thresholds**: strictly binary at the industry-standard boundary of `1.0` — SPI/CPI `>= 1.0` reads as on-track/on-budget, `< 1.0` reads as behind-schedule/over-budget. No amber "at risk" band in v1 (open question below).
- **"Material Cost Performance" labeling**: any UI element showing AC, CV, or CPI carries a fixed label/subtext to that effect (e.g. "Cost Performance (materials only)"), and the delta spec requires this text to be present — not just a design suggestion, a testable requirement.

## Risks / Trade-offs

- [Risk] AC/CPI/CV reflect material cost only — a project could read "under budget" while labour/equipment costs are actually overrunning. → Mitigation: mandatory "materials only" labeling everywhere these numbers appear (spec'd requirement, not just a design intent).
- [Risk] Linear planned-% assumes uniform work pace across an activity's window; real construction productivity is usually its own S-curve (slow start, ramp, slow finish). → Mitigation: accepted v1 approximation, consistent with `v_activity_progress_daily`'s existing assumption; revisit only if a time-phased baseline schedule is added later.
- [Risk] No DB constraint stops two activities sharing one `boq_item_id`, which would double-count that item's amount in BAC/PV/EV. → Mitigation: same pre-existing assumption already made by `v_activity_progress_daily`; not solved here, called out as a shared known limitation rather than silently ignored.
- [Risk] Legacy activities with `boq_item_id is null` are excluded from BAC/PV/EV entirely. → Mitigation: `unlinked_activity_count` surfaced in the UI so this isn't a silent gap.
- [Risk] `material_transactions` has no effective/incurred date column (only `created_at`), so AC is always "as of now," not point-in-time-accurate for a past date. → Mitigation: acceptable given this change is a live-status snapshot, not a historical trend (see Non-Goals).

## Migration Plan

- New migration `010_earned_value.sql` adding `v_project_evm` only — no new tables, no new columns, no backfill. Purely additive.
- Rollback: `drop view v_project_evm` — no data loss possible since it's a read-only view over existing tables.

## Open Questions

- Should SPI/CPI have an amber "at risk" band (e.g. 0.90–1.0) between on-track and behind, or stay strictly binary at 1.0 for v1?
- Should the unscheduled-budget figure (`unscheduled_amount`) be shown prominently next to BAC, or kept as a secondary/expandable detail?
