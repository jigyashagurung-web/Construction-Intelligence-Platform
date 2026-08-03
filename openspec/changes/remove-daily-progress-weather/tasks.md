## 1. Database migration

- [ ] 1.1 Add a new migration (e.g. `017_remove_daily_progress_weather.sql`) that drops `daily_progress_entries.weather` (the `daily_progress_weather_check` constraint drops automatically with the column).

## 2. Types and API

- [ ] 2.1 In `packages/app/src/types/index.ts`, delete the `Weather` type and the `weather` field on `DailyProgressEntry`.
- [ ] 2.2 In `packages/app/src/api/dailyProgress.ts`, remove `weather?: Weather` from `CreateDailyProgressInput`.

## 3. DailyProgressPage UI

- [ ] 3.1 In `packages/app/src/pages/DailyProgressPage.tsx`, remove the `WEATHER_OPTS`/`WEATHER_CFG` constants.
- [ ] 3.2 Remove the "Weather" table column header and its per-row cell.
- [ ] 3.3 Remove the Weather field (state, submit payload entry, and form `<select>`) from `EntryDialog`.
- [ ] 3.4 Remove now-unused lucide icon imports (Sun/Cloud/CloudRain/CloudLightning/CloudFog or equivalent) if they were only used by `WEATHER_CFG`.

## 4. Spec sync prep

- [ ] 4.1 Verify the delta spec at `openspec/changes/remove-daily-progress-weather/specs/daily-progress-quantity-tracking/spec.md` matches implemented behavior once code changes land.

## 5. Verification

- [ ] 5.1 Run `tsc --noEmit` for `packages/app` — confirm no type errors and no unused-import errors from the removed `Weather` type/icons.
- [ ] 5.2 Verify against the live project (same approach as prior changes this session): after the migration is applied, confirm `daily_progress_entries` no longer has a `weather` column (e.g. a `select weather from daily_progress_entries limit 1` returns a column-not-found error via the REST API), and that existing entries still load/read fine otherwise.
