-- =====================================================================
-- Quantity Consumed on Daily Progress + derived Activity progress
-- =====================================================================

alter table daily_progress_entries
  add column if not exists quantity_consumed numeric(18, 4) not null default 0;

alter table daily_progress_entries
  add constraint daily_progress_qty_consumed_check check (quantity_consumed >= 0);

-- Activity link becomes mandatory for new entries. Enforced via the insert
-- policy (not a NOT NULL column constraint) so pre-existing rows with a
-- null activity_id — if any — aren't broken by this migration.
drop policy if exists "daily_progress: insert" on daily_progress_entries;

create policy "daily_progress: insert" on daily_progress_entries
  for insert with check (
    activity_id is not null
    and project_id in (
      select id from projects
      where org_id = (select org_id from profiles where id = auth.uid())
    )
    and (select role from profiles where id = auth.uid()) in
        ('admin', 'project_manager', 'site_engineer')
  );

-- Recomputes a single activity's progress from its diary entries' summed
-- quantity_consumed against its linked BOQ item's quantity. No-ops for
-- activities without a BOQ item link (or a zero/unset BOQ quantity), so
-- those activities keep their manually-entered progress untouched.
create or replace function recompute_activity_progress(p_activity_id uuid)
returns void language plpgsql security definer
set search_path = public as $$
declare
  boq_qty  numeric(18, 4);
  consumed numeric(18, 4);
begin
  if p_activity_id is null then
    return;
  end if;

  select b.quantity into boq_qty
  from activities a
  join boq_items b on b.id = a.boq_item_id
  where a.id = p_activity_id;

  if boq_qty is null or boq_qty <= 0 then
    return;
  end if;

  select coalesce(sum(quantity_consumed), 0) into consumed
  from daily_progress_entries
  where activity_id = p_activity_id;

  update activities
  set progress = least(100, round(consumed / boq_qty * 100, 2))
  where id = p_activity_id;
end;
$$;

create or replace function set_activity_progress()
returns trigger language plpgsql security definer
set search_path = public as $$
begin
  if TG_OP = 'DELETE' then
    perform recompute_activity_progress(old.activity_id);
    return old;
  end if;

  perform recompute_activity_progress(new.activity_id);

  if TG_OP = 'UPDATE' and old.activity_id is distinct from new.activity_id then
    perform recompute_activity_progress(old.activity_id);
  end if;

  return new;
end;
$$;

create trigger daily_progress_entries_set_activity_progress
  after insert or update or delete on daily_progress_entries
  for each row execute function set_activity_progress();
