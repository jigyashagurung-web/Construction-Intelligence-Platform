-- =====================================================================
-- Fix: activity edits silently no-op + profile self-privilege-escalation
-- =====================================================================

-- Activity edits (progress, status, assignee, etc.) were matching 0 rows
-- under RLS for every role — verified the policy text in 004_activities.sql
-- is correct, so the live policy is likely missing or diverged from the
-- migration. Drop-and-recreate makes this idempotent regardless of cause.
drop policy if exists "activities: update" on activities;

create policy "activities: update" on activities
  for update using (
    project_id in (
      select id from projects
      where org_id = (select org_id from profiles where id = auth.uid())
    )
    and (select role from profiles where id = auth.uid()) in
        ('admin', 'project_manager', 'qty_surveyor', 'site_engineer')
  );

-- "profiles: own row" (001_initial_schema.sql) is `for all using (id =
-- auth.uid())` with no WITH CHECK, which lets any authenticated user PATCH
-- their own role (or org_id) directly via the REST API — bypassing the
-- admin-promotes-via-Team-page flow entirely. RLS can't express "this
-- column may only change when X" directly, so enforce it with a trigger
-- instead: block role/org_id changes on your own row unless you're already
-- an admin. Admins promoting OTHER members still go through the separate
-- "profiles: admin update org members" policy, which this trigger doesn't
-- touch.
create or replace function current_user_is_admin()
returns boolean language sql stable security definer
set search_path = public as $$
  select role = 'admin' from profiles where id = auth.uid();
$$;

create or replace function prevent_self_privilege_escalation()
returns trigger language plpgsql security definer
set search_path = public as $$
begin
  if (new.role is distinct from old.role or new.org_id is distinct from old.org_id)
     and not current_user_is_admin() then
    raise exception 'Only an admin can change role or organisation membership.';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_self_privilege_escalation on profiles;

create trigger profiles_prevent_self_privilege_escalation
  before update on profiles
  for each row execute function prevent_self_privilege_escalation();
