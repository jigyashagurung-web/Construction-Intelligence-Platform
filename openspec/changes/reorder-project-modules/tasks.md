## 1. Reorder module cards

- [x] 1.1 In `packages/app/src/pages/ProjectDetailPage.tsx`, reorder the five `<ModuleCard>` elements to: Bill of Quantities, Materials, Activity Schedule, Daily Progress, Reports. No changes to props, icons, colors, or routes on any card.

## 2. Verification

- [x] 2.1 Run `tsc --noEmit` for `packages/app` — confirm no type errors from the reorder.
- [x] 2.2 Visually confirm in the running app (any project's detail page) that cards render left-to-right, top-to-bottom in the new order at both the `sm:grid-cols-2` and `lg:grid-cols-4` breakpoints, with Reports last. Confirmed by user.
