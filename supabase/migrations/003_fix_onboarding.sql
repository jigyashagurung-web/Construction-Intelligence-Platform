-- =====================================================================
-- Fix 1: Update existing profiles that have no org assigned
-- Sets every unassigned profile to the demo org with admin role
-- =====================================================================
update profiles
set
  org_id = '00000000-0000-0000-0000-000000000001',
  role   = 'admin'
where org_id is null;

-- =====================================================================
-- Fix 2: Auto-assign org + admin role on every new signup
-- =====================================================================
create or replace function handle_new_user()
returns trigger language plpgsql security definer
set search_path = public as $$
begin
  insert into public.profiles (id, full_name, org_id, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    '00000000-0000-0000-0000-000000000001',
    'admin'
  );
  return new;
end;
$$;

-- =====================================================================
-- Fix 3: RLS — INSERT needs WITH CHECK, not USING
-- Drop and recreate the write policies correctly
-- =====================================================================

-- Projects
drop policy if exists "projects: write" on projects;

create policy "projects: insert" on projects
  for insert with check (
    org_id = (select org_id from profiles where id = auth.uid())
  );

create policy "projects: update" on projects
  for update using (
    org_id = (select org_id from profiles where id = auth.uid())
    and (select role from profiles where id = auth.uid()) in
        ('admin', 'project_manager', 'qty_surveyor')
  );

create policy "projects: delete" on projects
  for delete using (
    org_id = (select org_id from profiles where id = auth.uid())
    and (select role from profiles where id = auth.uid()) in ('admin', 'project_manager')
  );

-- BOQ items
drop policy if exists "boq_items: write" on boq_items;

create policy "boq_items: insert" on boq_items
  for insert with check (
    project_id in (
      select id from projects
      where org_id = (select org_id from profiles where id = auth.uid())
    )
  );

create policy "boq_items: update" on boq_items
  for update using (
    project_id in (
      select id from projects
      where org_id = (select org_id from profiles where id = auth.uid())
    )
  );

create policy "boq_items: delete" on boq_items
  for delete using (
    project_id in (
      select id from projects
      where org_id = (select org_id from profiles where id = auth.uid())
    )
  );

-- Materials catalogue
drop policy if exists "materials: write" on materials;

create policy "materials: insert" on materials
  for insert with check (
    org_id = (select org_id from profiles where id = auth.uid())
  );

create policy "materials: update" on materials
  for update using (
    org_id = (select org_id from profiles where id = auth.uid())
  );

-- Project materials
drop policy if exists "project_materials: write" on project_materials;

create policy "project_materials: insert" on project_materials
  for insert with check (
    project_id in (
      select id from projects
      where org_id = (select org_id from profiles where id = auth.uid())
    )
  );

create policy "project_materials: update" on project_materials
  for update using (
    project_id in (
      select id from projects
      where org_id = (select org_id from profiles where id = auth.uid())
    )
  );

-- Material transactions
drop policy if exists "material_transactions: write" on material_transactions;

create policy "material_transactions: insert" on material_transactions
  for insert with check (
    project_id in (
      select id from projects
      where org_id = (select org_id from profiles where id = auth.uid())
    )
  );
