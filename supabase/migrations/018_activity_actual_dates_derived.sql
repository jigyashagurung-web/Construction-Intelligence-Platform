-- =====================================================================
-- Activity Schedule: derive Actual Start / Actual End from the diary
-- instead of manual entry.
--
-- See openspec/changes/derive-activity-actual-dates. Actual Start/End were
-- previously free-typed on the Activity form, disconnected from what the
-- Daily Log actually recorded. This migration makes them read-only,
-- computed from daily_progress_entries by extending the existing
-- recompute_activity_progress trigger (007_quantity_consumed.sql):
--
--   - actual_start = earliest entry_date across the activity's diary
--     entries (applies to every activity, BOQ-linked or not).
--   - actual_end, for BOQ-linked activities, = the entry_date at which the
--     running total of quantity_consumed (entries ordered chronologically
--     by entry_date, not insertion order) first reaches the linked BOQ
--     item's quantity.
--   - Activities with no BOQ link, or manually marked 'complete' before
--     the logged quantity reaches 100%, have no derivable crossing event:
--     actual_end is stamped with the date status changed to 'complete',
--     tagged actual_end_source = 'manual' so the UI can label it distinctly
--     from a diary-derived value, and the recompute trigger will never
--     overwrite a 'manual' stamp.
-- =====================================================================

alter table activities
  add column if not exists actual_end_source text;

alter table activities
  add constraint activities_actual_end_source_check
    check (actual_end_source is null or actual_end_source in ('derived', 'manual'));

-- Preserve legacy data: any activity already marked complete with an
-- existing (till now manually-typed) actual_end is tagged 'manual' before
-- the recompute below runs, so the derive step doesn't blank it out for
-- activities whose diary history doesn't happen to reach 100%.
update activities
set actual_end_source = 'manual'
where status = 'complete' and actual_end is not null;

create or replace function recompute_activity_progress(p_activity_id uuid)
returns void language plpgsql security definer
set search_path = public as $$
declare
  boq_qty     numeric(18, 4);
  consumed    numeric(18, 4);
  new_start   date;
  new_end     date;
  cur_end_src text;
begin
  if p_activity_id is null then
    return;
  end if;

  -- Actual start always reflects the diary, regardless of BOQ link.
  select min(entry_date) into new_start
  from daily_progress_entries
  where activity_id = p_activity_id;

  update activities set actual_start = new_start where id = p_activity_id;

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

  -- Never clobber a manually-stamped completion date (see
  -- stamp_actual_end_on_manual_complete below) with a diary-derived one.
  select actual_end_source into cur_end_src from activities where id = p_activity_id;

  if cur_end_src is distinct from 'manual' then
    select entry_date into new_end
    from (
      select
        entry_date,
        sum(quantity_consumed) over (order by entry_date, id) as running_total
      from daily_progress_entries
      where activity_id = p_activity_id
    ) running
    where running_total >= boq_qty
    order by entry_date
    limit 1;

    if new_end is not null then
      update activities
      set actual_end = new_end, actual_end_source = 'derived'
      where id = p_activity_id;
    else
      update activities
      set actual_end = null, actual_end_source = null
      where id = p_activity_id;
    end if;
  end if;
end;
$$;

-- Backfill: apply the derivation above once over all existing activities so
-- actual_start/actual_end reflect current diary history rather than being
-- blanked by the cutover. Activities preserved as 'manual' just above are
-- skipped for actual_end by the guard inside the function.
do $$
declare
  r record;
begin
  for r in select id from activities loop
    perform recompute_activity_progress(r.id);
  end loop;
end $$;

-- Manual-completion fallback: stamps actual_end when a Project
-- Manager/Admin marks an activity complete ahead of (or without) a
-- diary-derived completion date.
create or replace function stamp_actual_end_on_manual_complete()
returns trigger language plpgsql security definer
set search_path = public as $$
begin
  if new.status = 'complete'
     and old.status is distinct from 'complete'
     and old.actual_end_source is distinct from 'derived' then
    new.actual_end := current_date;
    new.actual_end_source := 'manual';
  end if;
  return new;
end;
$$;

create trigger activities_stamp_manual_complete
  before update on activities
  for each row execute function stamp_actual_end_on_manual_complete();

-- actual_start/actual_end/actual_end_source are trigger-only by
-- convention, not DB-level column grants: this codebase's RLS policies
-- are row-level only and no migration here uses GRANT/REVOKE for column
-- protection — `progress` on BOQ-linked activities is auto-computed the
-- same way and relies on the same convention. Enforcement is the API
-- layer (CreateActivityInput/UpdateActivityInput in activities.ts omit
-- these fields); a client bypassing the API can't make a wrong value
-- stick since any diary change re-derives the correct value.
