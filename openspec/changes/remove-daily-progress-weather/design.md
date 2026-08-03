## Context

`daily_progress_entries.weather` (migration 005) is a nullable `text` column with a CHECK constraint restricting it to `sunny`/`cloudy`/`rainy`/`stormy`/`foggy` or null. It's surfaced in the Log Daily Progress form as an optional dropdown, shown as an icon+label in the entries table, and typed end-to-end as `Weather` in the frontend. No reporting view, rollup, or export in this codebase reads it (confirmed by grepping `009_reporting.sql`, `reports.ts`, `ReportsPage.tsx` — zero matches), and it's undocumented in the `daily-progress-quantity-tracking` spec.

## Goals / Non-Goals

**Goals:**
- Remove Weather from the schema, API, and UI with no residual dead code or unreferenced types.
- Document the removal as an explicit spec requirement (mirroring `boq-item-entry`'s "Trade field removed"/"Status removed" requirements), rather than leaving it undocumented.

**Non-Goals:**
- Not preserving historical weather data anywhere (no archive table, no export-before-drop step) — see the accepted trade-off below.
- Not touching `packages/ui`'s Storybook mock, which already diverges from the real schema and isn't wired to it.

## Decisions

- **Drop the column outright rather than soft-deprecating it (e.g. leaving it nullable-and-unused).** There's no consumer to migrate off it gradually, unlike `require-boq-catalog-match`/`require-activity-boq-link` where existing rows had to be grandfathered against a *behavioral* tightening. Here it's simple dead-weight removal — a straight `alter table ... drop column weather` is the whole migration, and its CHECK constraint drops automatically with it.
- **Document the removal as a new requirement in `daily-progress-quantity-tracking`** rather than silently deleting the field with no spec trace — same rationale as `boq-item-entry`'s explicit "Trade field removed"/"Status removed" requirements: a capability spec should say what a form does NOT have, when that absence might otherwise look like an oversight to a future reader.

## Risks / Trade-offs

- [Existing entries' logged weather values are permanently lost on migration] → Accepted: confirmed via research that nothing downstream (reporting, exports, other specs) depends on this data, so there's nothing to preserve. If a future need for historical weather emerges, that data is already gone regardless of how carefully this migration is written — noting it here so it's a known, deliberate trade-off rather than an oversight.
