## Why

The Project Detail page currently lists module cards in the order Activity Schedule, Bill of Quantities, Materials, Daily Progress, Reports. This doesn't match the actual data flow a user follows on a project: quantities are priced in the BOQ first, materials are procured/tracked against it, activities are scheduled and linked to BOQ items, and daily progress is logged against those activities. Presenting cards in that same sequence makes the workflow self-evident to a new user, instead of leading with Activity Schedule before its BOQ dependency exists.

## What Changes

- Reorder the module cards on the Project Detail page to: Bill of Quantities, Materials, Activity Schedule, Daily Progress, Reports.
- Reports remains last, unchanged in position.
- Display order only — no changes to routes, module functionality, icons, colors, or descriptions.

## Capabilities

### New Capabilities
- `project-detail-navigation`: Defines the module cards shown on the Project Detail page and the order they're displayed in.

### Modified Capabilities
(none — no existing spec covers the Project Detail page's module layout)

## Impact

- `packages/app/src/pages/ProjectDetailPage.tsx`: reorder the five `<ModuleCard>` elements. No changes to `packages/app/src/components/ModuleCard.tsx` itself.
