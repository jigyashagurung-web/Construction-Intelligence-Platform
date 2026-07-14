-- =====================================================================
-- User & Permission Management
-- =====================================================================

-- Profiles need an email so the admin member list can identify people
-- without querying auth.users from the client.
alter table profiles add column if not exists email text;

update profiles p
set email = u.email
from auth.users u
where u.id = p.id and p.email is null;

-- New signups now default to 'viewer' instead of 'admin' — an admin
-- promotes members deliberately via the Team page, rather than every
-- signup becoming an org admin.
create or replace function handle_new_user()
returns trigger language plpgsql security definer
set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, org_id, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    '00000000-0000-0000-0000-000000000001',
    'viewer'
  );
  return new;
end;
$$;

-- Admins can update other members' role within their own org.
-- Additive to "profiles: own row" (001_initial_schema.sql) — no conflict.
create policy "profiles: admin update org members" on profiles
  for update using (
    org_id = (select org_id from profiles where id = auth.uid())
    and (select role from profiles where id = auth.uid()) = 'admin'
  )
  with check (
    org_id = (select org_id from profiles where id = auth.uid())
  );
