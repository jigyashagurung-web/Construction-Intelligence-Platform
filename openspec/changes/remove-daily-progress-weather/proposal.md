## Why

The Weather field on the Log Daily Progress form has no downstream consumer anywhere in the product: no reporting view, rollup, or export reads it, and it isn't documented as a requirement in the `daily-progress-quantity-tracking` spec. It's pure UI/schema surface area (an icon-mapped dropdown, a table column, a nullable DB column with a CHECK constraint) with no behavior riding on it — removing it simplifies the diary entry form with no loss of functionality.

## What Changes

- **BREAKING**: Remove the `weather` column (and its `daily_progress_weather_check` constraint) from `daily_progress_entries` — existing entries' weather values are permanently deleted.
- Remove the Weather field from the "Log Daily Progress" add/edit form, the Weather column from the daily progress table, and the `Weather` type entirely from the frontend.

## Capabilities

### Modified Capabilities
- `daily-progress-quantity-tracking`: add a "Weather field removed from daily progress entry" requirement documenting that the form, table, and schema no longer carry a Weather field.

## Impact

- `supabase/migrations/` — new migration dropping `daily_progress_entries.weather` (constraint drops with the column).
- `packages/app/src/types/index.ts` — delete the `Weather` type (line 95) and the `weather` field on `DailyProgressEntry` (line 112).
- `packages/app/src/api/dailyProgress.ts` — remove `weather?: Weather` from `CreateDailyProgressInput` (line 18).
- `packages/app/src/pages/DailyProgressPage.tsx` — remove `WEATHER_OPTS`/`WEATHER_CFG` (lines 18-26), the Weather table column and its cells (line 211, 226-232), and the Weather form field/state in `EntryDialog` (state line 334, submit line 357, field lines 391-396).
- No change to `packages/ui`'s Storybook `DailyProgressPage.stories.tsx` — it has its own independent, already-divergent mock weather UI, not wired to the real schema.
- No change to reporting (`009_reporting.sql` views, `reports.ts`, `ReportsPage.tsx`) — confirmed no reference to weather anywhere in that path.
