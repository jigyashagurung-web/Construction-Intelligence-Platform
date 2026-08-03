## Why

"Add Activity" still works the way "Add BOQ Item" used to before the catalog rollout: a free-text WBS Code input, a hardcoded local Trade dropdown, and a separate optional BOQ Item link that can silently disagree with the WBS Code field. `boq_items` closed this gap for itself (migrations 011-015, `boq-item-entry` spec, and the just-archived `require-boq-catalog-match`), but Activities were never brought along — an Activity can still exist fully detached from any BOQ line, which also means its progress falls back to manual entry instead of the automatic quantity-consumed calculation that already exists (`recompute_activity_progress`, migration 007) for BOQ-linked activities.

## What Changes

- **BREAKING**: Creating or editing an Activity now requires selecting a BOQ line item (resolving to a `line_item`-level `boq_code_catalog` code via its linked `boq_items` row) — no more BOQ-less activities.
- Replace the free-text "WBS Code" input and the separate "BOQ Item" dropdown in `ActivityDialog` with a single `BoqCodePicker` selection (same component `BOQDialog` already uses) that resolves `boq_item_id` directly.
- **BREAKING**: Remove `activities.trade` and the local `TRADES` dropdown constant. An activity's chapter/section are now derived from its linked `boq_items` row (already populated by the `boq_items_sync_catalog_fields` trigger from migration 015), not entered or selected independently.
- Since every Activity now has a `boq_item_id`, Progress is always auto-calculated from logged Quantity Consumed (`recompute_activity_progress`) — the manual Progress input in `ActivityDialog` is removed.
- Requires a migration to make `activities.boq_item_id` mandatory and drop `activities.trade`/`activities.wbs_code`; needs a stated policy for existing activities rows that currently have a null `boq_item_id` (see design.md — this is flagged as an open question, not yet decided).

## Capabilities

### New Capabilities
- `activity-entry`: Catalog-driven Activity creation — mandatory BOQ line-item link via `BoqCodePicker`, catalog-derived chapter/section display, auto-computed progress, replacing free-text WBS Code/Trade entry.

### Modified Capabilities
- `boq-item-entry`: The "Trade field removed from BOQ item entry" requirement's "Activities are unaffected" scenario is now false once `activities.trade` is dropped — updated to reflect that Activities no longer have a Trade field at all, rather than carrying an unrelated one.

## Impact

- `packages/app/src/pages/ActivitySchedulePage.tsx` — `ActivityDialog` (lines 415-597): replace WBS Code input + Trade select + BOQ Item select with a single `BoqCodePicker`; remove manual Progress input entirely; drop the `TRADES` constant and the page's trade filter dropdown (`tradeFilter` state, line 49) since `trade` no longer exists.
- `packages/app/src/api/activities.ts` — `CreateActivityInput`: drop `wbs_code`/`trade`, make `boq_item_id` required.
- `packages/app/src/types/index.ts` — `Activity` interface: drop `wbs_code`/`trade` (or repurpose per design.md), `boq_item_id` becomes non-nullable, add `chapter`/`section` (denormalized, mirroring `BOQItem`).
- New migration (number TBD at implementation time) — `activities` table: make `boq_item_id not null`, drop `trade`, decide `wbs_code`'s fate (drop vs. trigger-populate like `boq_items.wbs_code`), and define a backfill/rejection strategy for existing null-`boq_item_id` rows.
- No change to `daily_progress_entries` — `activity_id` there is already mandatory (migration 007) and unaffected by this change.
