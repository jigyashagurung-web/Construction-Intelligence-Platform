## Context

`daily_progress_entries` (migration `005_daily_progress.sql`) has an optional `activity_id` and no quantity field. `activities` (migration `004_activities.sql`) has a manually-entered `progress numeric(5,2)` and an optional `boq_item_id` → `boq_items.quantity`/`unit`. Both `DailyProgressPage.tsx` and `ActivitySchedulePage.tsx` are already live, so this change edits existing components rather than adding new ones.

## Goals / Non-Goals

**Goals:**
- Every new diary entry records a mandatory `quantity_consumed` against a mandatory `activity_id`.
- Activities linked to a BOQ item get their `progress` derived from summed `quantity_consumed`, removing manual entry drift.
- Existing rows and activities without a BOQ item link keep working without data loss.

**Non-Goals:**
- Multi-unit conversion (e.g. m² ↔ m³) — quantity is compared in the BOQ item's native unit only.
- Retroactively back-filling real `quantity_consumed` values for historical entries — they default to `0`.
- Editing `boq_items.quantity` or introducing new BOQ capabilities.

## Decisions

- **Column type**: `quantity_consumed numeric(18,4) not null default 0`, mirroring `boq_items.quantity`'s precision so sums compare cleanly. Default `0` only applies to the backfill of pre-existing rows via the migration; the app form requires a non-zero, non-blank entry going forward (`check (quantity_consumed >= 0)`, enforced positive-entry at the form layer, not the DB, so `0` remains a legitimate logged value e.g. "no progress today").
- **`activity_id` becomes `not null`**: existing rows with `activity_id is null` are backfilled to... there are none expected in the POC seed data, but the migration handles it defensively by keeping those rows and leaving `activity_id null` un-migratable — see Risks. Going forward, DB `not null` isn't added (would break on any legacy null row); enforcement is at the RLS/insert-check layer instead: `insert with check (activity_id is not null)`. This avoids a hard migration failure while still blocking new nulls.
- **Progress derivation lives in Postgres, not the client**: a `set_activity_progress()` trigger function fires `after insert or update or delete on daily_progress_entries`, recomputing the parent activity's `progress` from `sum(quantity_consumed) / boq_items.quantity * 100` (clamped to 100) whenever the activity has a `boq_item_id`. Doing it in a trigger (vs. client-side recompute) keeps progress correct regardless of which client/API path wrote the entry, and avoids read-then-write races between concurrent diary entries.
- **Activities without a `boq_item_id`** keep their `progress` field manually editable in `ActivitySchedulePage.tsx` exactly as today — the trigger only touches BOQ-linked activities.
- **Unit display**: the entry dialog shows the linked activity's BOQ unit (read-only, resolved client-side from `activities.boq_item_id → boq_items.unit`) next to the quantity input, so users see what "quantity consumed" is measured in without a redundant unit column on `daily_progress_entries`.

## Risks / Trade-offs

- [Existing diary entries with `activity_id is null`] → Migration leaves them as-is (not retroactively deleted or assigned); they're excluded from the new insert-check (which only applies to new inserts, not existing rows) and simply won't contribute to any progress calculation. Flagged as a known gap since the POC has no production data yet.
- [Trigger recompute cost] → Negligible at POC scale (single recompute per insert/update/delete, indexed on `activity_id`); revisit if diary entry volume grows large enough to warrant batching.
- [Two sources of truth for `progress`] → For BOQ-linked activities, `progress` is now derived, but the column itself is still writable directly (no DB-level lockout) to avoid overengineering a POC. UI simply stops exposing the input for BOQ-linked activities.

## Migration Plan

1. `007_quantity_consumed.sql`: add `quantity_consumed numeric(18,4) not null default 0` to `daily_progress_entries`; add `check (quantity_consumed >= 0)`; add insert-check requiring `activity_id is not null` for new rows; add `set_activity_progress()` trigger function + trigger.
2. Update `packages/app/src/types/index.ts`, `api/dailyProgress.ts`, `DailyProgressPage.tsx` (form + table), `ActivitySchedulePage.tsx` (read-only progress for BOQ-linked activities) in the same change — no separate rollout phase needed since this is a pre-production POC.
3. Rollback: drop the trigger/function and column; no data migration to reverse since defaults are additive.

## Open Questions

- None — resolved via user confirmation that Activity becomes mandatory and progress becomes auto-derived.
