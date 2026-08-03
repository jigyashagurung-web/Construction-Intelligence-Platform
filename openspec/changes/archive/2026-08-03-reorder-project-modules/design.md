## Context

`ProjectDetailPage.tsx` renders five `<ModuleCard>` elements in a `grid` in source order: Activity Schedule, Bill of Quantities, Materials, Daily Progress, Reports. Grid layout wraps at `sm:grid-cols-2` / `lg:grid-cols-4`, so visual position follows JSX order with no explicit `order` styling or sorting logic involved.

## Goals / Non-Goals

**Goals:**
- Change the JSX order of the five `<ModuleCard>` elements to: Bill of Quantities, Materials, Activity Schedule, Daily Progress, Reports.

**Non-Goals:**
- No changes to `ModuleCard` props, styling, icons, or routes.
- No user-configurable ordering (e.g. drag-to-reorder, per-user preference) — this is a fixed, hardcoded order matching the intended workflow for all users.

## Decisions

- **Reorder via JSX source order, not a CSS `order` property or a sorted array.** The grid has no reason to diverge visual order from source order, and keeping them identical is simpler to read and maintain than adding an `order-*` class per card.
- **Hardcode the sequence rather than deriving it from data.** There's no per-project variation in which modules exist or their intended order — it's the same five modules for every project — so an array/config abstraction would be unwarranted for five static elements.

## Risks / Trade-offs

- [Risk] None identified — this is a pure visual reorder of static JSX with no logic, data, or route changes. → No mitigation needed beyond the manual visual check in tasks.md.
