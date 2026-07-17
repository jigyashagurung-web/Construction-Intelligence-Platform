-- =====================================================================
-- Fix: cross-organisation data leak via undocumented "X: all" policies
-- =====================================================================
--
-- Found while manually verifying cross-org isolation for the reporting
-- feature (add-reporting change, task 6.4). `projects`, `boq_items`,
-- `materials`, `project_materials`, and `material_transactions` each had
-- an untracked "<table>: all" policy (not present in any prior migration)
-- with `qual`/`with_check` of `auth.role() = 'authenticated'` — no org
-- scoping at all. Postgres OR's every matching permissive policy for a
-- given command, so this alone let any authenticated user read, insert,
-- update, and delete every row in these tables regardless of
-- organisation, bypassing the correctly org-scoped insert/update/delete
-- policies sitting right next to it. It also left these tables without
-- a real SELECT policy of their own — reads were only working because
-- of the leaky catch-all.
--
-- Verified live via `pg_policies` that only these five tables carried
-- the leaky policy (daily_progress_entries, daily_progress_photos, and
-- activities were unaffected), and confirmed cross-org read access was
-- fully blocked — with same-org access unaffected — after applying
-- this fix.

drop policy if exists "projects: all" on projects;

create policy "projects: read" on projects
  for select using (
    org_id = (select org_id from profiles where id = auth.uid())
  );

drop policy if exists "boq_items: all" on boq_items;

create policy "boq_items: read" on boq_items
  for select using (
    project_id in (
      select id from projects
      where org_id = (select org_id from profiles where id = auth.uid())
    )
  );

drop policy if exists "materials: all" on materials;

create policy "materials: read" on materials
  for select using (
    org_id = (select org_id from profiles where id = auth.uid())
  );

drop policy if exists "project_materials: all" on project_materials;

create policy "project_materials: read" on project_materials
  for select using (
    project_id in (
      select id from projects
      where org_id = (select org_id from profiles where id = auth.uid())
    )
  );

drop policy if exists "material_transactions: all" on material_transactions;

create policy "material_transactions: read" on material_transactions
  for select using (
    project_id in (
      select id from projects
      where org_id = (select org_id from profiles where id = auth.uid())
    )
  );
