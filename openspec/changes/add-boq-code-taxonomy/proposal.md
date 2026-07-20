## Why

BOQ items are currently stored with only a free-text `wbs_code` and free-text `trade` (`supabase/migrations/001_initial_schema.sql`) — there is no standardized code structure, no category hierarchy, and no link to BIM/Revit model elements. The business has a controlled BOQ coding standard (`EN_BOQ_Coded_Revit_Integration`, v1.0) that defines a 4-level hierarchical code (`Chapter.SubChapter.Section.Item`, e.g. `02.40.30.01`) mapped to a Revit Category and Family Type for every line item. "WBS code" and "BOQ code" refer to the same concept in this system, so the existing `wbs_code` column is repurposed to hold this structured code rather than introducing a parallel column. Adopting this standard now — before more projects and BOQ data accumulate — prevents every project from inventing its own ad hoc codes and lays the groundwork for future BIM-driven quantity takeoff.

## What Changes

- Add a new `boq_code_catalog` reference table seeded with the standard taxonomy: chapter, sub-chapter, section, and line-item codes, each with description, hierarchy level, unit, Revit category, and Revit family type.
- Repurpose `boq_items.wbs_code` from free text into a foreign key into `boq_code_catalog`, constrained to leaf/line-item codes only. The column name stays `wbs_code`; its content/type changes.
- **BREAKING**: existing free-text `wbs_code` values do not match the new structured format and will need a one-time backfill/mapping pass (see design.md) before the FK constraint can be enforced on all rows.
- Category, hierarchy level, unit, and Revit mapping are no longer stored per-row on `boq_items` — they are looked up via `wbs_code` → `boq_code_catalog`, removing duplication and drift across projects.
- Governance: new codes can only be added to the catalog through a controlled process (matching the source standard's "coordinate with senior leadership" note), not ad hoc per project.
- Out of scope for this change: automatic import/sync of BOQ line items from a Revit/BIM model export. The catalog captures the Revit category/family mapping needed for that, but the import pipeline itself is left for a future change.

## Capabilities

### New Capabilities
- `boq-code-taxonomy`: Standardized, hierarchical BOQ code catalog (chapter/sub-chapter/section/item) with category, unit, and Revit category/family-type mapping, referenced by `boq_items`.

### Modified Capabilities
(none — `daily-progress-quantity-tracking` reads `boq_items.quantity`/`amount`, which are unaffected by this change)

## Impact

- **Database**: new `boq_code_catalog` table + seed migration; `boq_items.wbs_code` changes from free text to an FK into `boq_code_catalog` (nullable/unenforced during transition, then constrained).
- **RLS**: `boq_code_catalog` is a shared/global reference table (not project- or org-scoped) — needs its own read-only RLS policy distinct from the per-org policies on `boq_items`/`materials` (see `010_fix_cross_org_rls_leak.sql` for the pattern being extended).
- **App layer**: `packages/app/src/api/boq.ts` (CRUD), `packages/app/src/types/index.ts:38-54` (TS types) need catalog-backed lookup support for `wbs_code`; `packages/app/src/pages/BOQPage.tsx` needs a code picker backed by the catalog instead of free-text entry.
- **Data migration**: existing `boq_items.wbs_code` free-text values need a mapping/backfill pass to the new structured codes before the FK constraint is enforced.
