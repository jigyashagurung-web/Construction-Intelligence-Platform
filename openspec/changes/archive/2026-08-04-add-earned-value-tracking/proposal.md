## Why

Today there's no way for a PM or contractor to answer "are we on schedule?" or "are we on budget?" in a single, trustworthy number. Activity Schedule shows an unweighted average of per-activity progress, and Reports shows a planned-vs-actual completion curve, but neither turns "percent complete" into a dollar-based judgment of schedule and cost performance — which is the actual question a contractor asks about their project. The data needed to compute that already exists (BOQ item costs, activity progress derived from measured quantities, planned schedule dates, material transaction costs) — it just isn't combined into the industry-standard Earned Value Management (EVM) metrics that answer it directly.

## What Changes

- Add core EVM calculations, cost-weighted (not activity-count-weighted) across a project's BOQ-linked activities. Each activity is treated as one weighted work package: its weight is its `BOQ_amount` share of the total budget, its planned window is `planned_start`→`planned_end`, and its actual progress is the existing quantity-derived `progress` field, tracked independently of that window via the daily progress log.
  - **BAC** (Budget at Completion): sum of `BOQItem.amount` for items with a linked activity. Items without a linked activity are reported separately as unscheduled budget, not folded into BAC.
  - **PV** (Planned Value): per activity, `BOQ_amount × planned_%_complete(date)`, where planned % is linear time-based interpolation between `planned_start` and `planned_end` — the practical method given the schedule model only stores two dates per activity.
  - **EV** (Earned Value): per activity, `BOQ_amount × activity.progress / 100`, reusing the existing quantity-derived progress value.
  - **AC** (Actual Cost): sum of `grn`-type `MaterialTransaction` cost (`unit_cost × quantity`), at the whole-project level only — `MaterialTransaction` has no activity/BOQ-item link, so per-activity cost variance isn't possible with the current schema.
  - Derived: **SV** = EV − PV, **SPI** = EV / PV, **CV** = EV − AC, **CPI** = EV / AC, **EAC** = BAC / CPI, **VAC** = BAC − EAC.
- **AC is explicitly labeled as material-cost-only** (e.g. "Material Cost Performance") in all UI and copy, since labour and equipment have no cost data anywhere in the schema today (`daily_progress_entries` tracks headcounts, not rates). This is a deliberate scoping decision, not an oversight, and must not be presented as whole-project cost performance.
- Add a new "Earned Value" section to the existing Reports page showing all of the above with clear on-track/behind-schedule and on-budget/over-budget indicators.
- Add a compact schedule/cost status badge to the Project Detail page header, in the same style as the existing KPI strips on Activity Schedule.
- No changes to existing tables/columns; all inputs are computed read-only from existing data.

## Capabilities

### New Capabilities
- `earned-value-tracking`: computing and displaying BAC/PV/EV/AC and their derived schedule/cost variance and performance indices for a project, cost-weighted across BOQ-linked activities.

### Modified Capabilities
(none — no existing main spec currently covers Reports or Project Detail status display; `progress-reporting`'s change (`add-reporting`) hasn't been archived/synced into `openspec/specs/` yet, so there's nothing to delta against there)

## Impact

- **Database**: a new migration adding one or two SQL views/RPCs for the aggregation (BAC/PV/EV/AC and derived metrics), following the existing pattern of computing rollups server-side rather than pulling raw rows into the client (as `007_quantity_consumed.sql` and the reporting migration already do).
- **API**: new query functions in `packages/app/src/api/reports.ts` (or a new `api/evm.ts`) for the EVM metrics.
- **UI**: new "Earned Value" section in `packages/app/src/pages/ReportsPage.tsx`; a new status badge in `packages/app/src/pages/ProjectDetailPage.tsx`'s header.
- **Note (out of scope, flagged only)**: the existing "Overall Progress" KPI on `ActivitySchedulePage.tsx` is an unweighted average of `activity.progress` across activities — a different, simpler metric than the cost-weighted approach EVM uses. This proposal does not change that KPI; reconciling the two is a separate decision.
- **Note (out of scope, flagged only)**: `Activity.actual_start`/`actual_end` are currently manual, free-text fields disconnected from the daily progress log — a separate data-integrity gap identified during this proposal's design discussion. Deriving them from logged entries (earliest entry date / the date progress reaches 100%) is a candidate follow-up change; it doesn't affect any EVM formula here, since PV uses only `planned_start`/`planned_end` and EV uses only `activity.progress`.
- **Roadmap**: this is a scoped-down slice of Phase 2 items 2.1 (Delay Prediction — the EVA piece) and 2.5 (Cost Analysis — budget vs. actual, cost variance) in `openspec/changes/construction-intelligence-platform/tasks.md`. Monte Carlo schedule risk, criticality heatmap, root-cause tagging, scenario modelling, and cash-flow forecasting remain future work, not part of this change.
