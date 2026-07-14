## Why

Daily Progress entries currently capture labour, equipment, weather, and free-text "work done," but nothing quantifiable. Without a structured quantity, percent-complete on the Activity Schedule has to be entered by hand and drifts from what was actually logged on site. Capturing "Quantity Consumed" per diary entry lets us derive activity — and eventually BOQ item — completion percentage directly from site diary data instead of a manually-typed number.

## What Changes

- Add a mandatory **Quantity Consumed** field to the Log Daily Progress entry form, recorded against the entry's linked activity.
- **BREAKING**: Linking an entry to an **Activity** becomes mandatory (it was previously optional) — quantity consumed is meaningless without an activity to consume against.
- Store the unit alongside the quantity (read-only, inherited from the activity's BOQ item where available) so entries stay comparable across a project that mixes units (m², m³, nos, etc.).
- Daily Progress table gains a "Qty Consumed" column; the entry list's per-activity total feeds a new "Qty Complete" indicator.
- Activity Schedule's `progress` percentage becomes a derived read-only value (`sum(quantity_consumed) / boq item quantity`) for activities linked to a BOQ item; activities without a BOQ item link keep manual progress entry as a fallback.

## Capabilities

### New Capabilities
- `daily-progress-quantity-tracking`: Recording, validating, and aggregating quantity consumed per diary entry, and deriving activity percent-complete from it.

### Modified Capabilities
(none — no existing capability specs cover Daily Progress or Activity Schedule yet)

## Impact

- **DB**: `daily_progress_entries` gains `quantity_consumed numeric(18,4) not null`; new migration `007_quantity_consumed.sql`.
- **API**: `packages/app/src/api/dailyProgress.ts` create/update payloads require `quantity_consumed` and `activity_id`.
- **UI**: `DailyProgressPage.tsx` (`EntryDialog`, table columns), `ActivitySchedulePage.tsx` (progress display switches from editable input to derived read-only value for BOQ-linked activities).
- **Types**: `packages/app/src/types/index.ts` — `DailyProgressEntry.quantity_consumed`, `activity_id` no longer optional.
- Existing rows: backfill `quantity_consumed` to `0` for pre-existing entries (migration default), since real consumed quantities weren't tracked historically.
