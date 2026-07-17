-- =====================================================================
-- Reporting: progress photos + rollup/S-curve views
-- =====================================================================

-- -------------------------
-- Progress photos
-- -------------------------
create table daily_progress_photos (
  id           uuid primary key default uuid_generate_v4(),
  entry_id     uuid not null references daily_progress_entries on delete cascade,
  project_id   uuid not null references projects on delete cascade,
  storage_path text not null,
  caption      text,
  created_by   uuid references profiles,
  created_at   timestamptz not null default now()
);

alter table daily_progress_photos enable row level security;

create policy "daily_progress_photos: read" on daily_progress_photos
  for select using (
    project_id in (
      select id from projects
      where org_id = (select org_id from profiles where id = auth.uid())
    )
  );

create policy "daily_progress_photos: insert" on daily_progress_photos
  for insert with check (
    project_id in (
      select id from projects
      where org_id = (select org_id from profiles where id = auth.uid())
    )
    and (select role from profiles where id = auth.uid()) in
        ('admin', 'project_manager', 'site_engineer')
  );

create policy "daily_progress_photos: delete" on daily_progress_photos
  for delete using (
    project_id in (
      select id from projects
      where org_id = (select org_id from profiles where id = auth.uid())
    )
    and (select role from profiles where id = auth.uid()) in
        ('admin', 'project_manager', 'site_engineer')
  );

-- -------------------------
-- Storage bucket for photos
-- -------------------------
-- Path convention: {project_id}/{entry_id}/{uuid}-{filename} — the first path
-- segment is the project_id, which every policy below checks against.
insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', false)
on conflict (id) do nothing;

create policy "progress-photos: read" on storage.objects
  for select using (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1]::uuid in (
      select id from projects
      where org_id = (select org_id from profiles where id = auth.uid())
    )
  );

create policy "progress-photos: insert" on storage.objects
  for insert with check (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1]::uuid in (
      select id from projects
      where org_id = (select org_id from profiles where id = auth.uid())
    )
    and (select role from profiles where id = auth.uid()) in
        ('admin', 'project_manager', 'site_engineer')
  );

create policy "progress-photos: delete" on storage.objects
  for delete using (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1]::uuid in (
      select id from projects
      where org_id = (select org_id from profiles where id = auth.uid())
    )
    and (select role from profiles where id = auth.uid()) in
        ('admin', 'project_manager', 'site_engineer')
  );

-- -------------------------
-- Daily rollup view — client buckets this into week/month, no separate
-- views needed for those.
-- -------------------------
-- security_invoker: without it, Postgres runs the view's underlying-table
-- queries as the view owner, bypassing daily_progress_entries' RLS for
-- every caller. With it, RLS is evaluated as the querying role, same as
-- querying the table directly.
create view v_daily_progress_rollup
with (security_invoker = true)
as
select
  project_id,
  entry_date,
  sum(quantity_consumed) as quantity_consumed,
  sum(labour_count)      as labour_count,
  sum(equipment_count)   as equipment_count,
  count(*)               as entries
from daily_progress_entries
group by project_id, entry_date;

-- -------------------------
-- S-curve view: cumulative planned-% vs actual-% per project per day.
--
-- Weighting: each activity's contribution to the project curve is its
-- linked BOQ item's `amount` (quantity * unit_rate). Activities with no
-- BOQ link get the average linked amount for that project as a stand-in
-- weight (or 1, i.e. pure equal weighting, if the project has no
-- BOQ-linked activities at all). This is a v1 proxy for effort/cost
-- share, not a real earned-value baseline — see design.md.
--
-- Planned fraction per activity per day is a linear ramp from
-- planned_start (0%) to planned_end (100%).
--
-- Actual fraction per activity per day:
--   - BOQ-linked: cumulative quantity_consumed as of that day / BOQ quantity
--     (a true historical curve, since diary entries carry entry_date).
--   - Not BOQ-linked: there is no historical snapshot of manually-edited
--     `activities.progress`, so it is shown flat at its current value for
--     every day in range. This is a known approximation (see design.md).
-- -------------------------
create view v_activity_progress_daily
with (security_invoker = true)
as
with activity_weight as (
  select
    a.id,
    a.project_id,
    a.planned_start,
    a.planned_end,
    a.boq_item_id,
    a.progress,
    b.quantity as boq_qty,
    b.amount   as boq_amount
  from activities a
  left join boq_items b on b.id = a.boq_item_id
),
project_avg_amount as (
  select project_id, avg(boq_amount) as avg_amount
  from activity_weight
  where boq_amount is not null
  group by project_id
),
weighted as (
  select
    w.*,
    coalesce(w.boq_amount, pa.avg_amount, 1) as weight
  from activity_weight w
  left join project_avg_amount pa on pa.project_id = w.project_id
),
consumed_by_activity_date as (
  select activity_id, entry_date, sum(quantity_consumed) as qty
  from daily_progress_entries
  group by activity_id, entry_date
),
project_dates as (
  select
    project_id,
    generate_series(
      min(planned_start),
      greatest(max(planned_end), current_date),
      interval '1 day'
    )::date as d
  from weighted
  group by project_id
),
per_activity_date as (
  select
    pd.project_id,
    pd.d as entry_date,
    w.weight,
    case
      when pd.d < w.planned_start then 0
      when pd.d > w.planned_end then 1
      when w.planned_end = w.planned_start then 1
      else (pd.d - w.planned_start)::numeric / (w.planned_end - w.planned_start)
    end as planned_fraction,
    case
      when w.boq_item_id is not null and w.boq_qty > 0 then
        least(1, coalesce((
          select sum(c.qty) from consumed_by_activity_date c
          where c.activity_id = w.id and c.entry_date <= pd.d
        ), 0) / w.boq_qty)
      else
        w.progress / 100.0
    end as actual_fraction
  from project_dates pd
  join weighted w on w.project_id = pd.project_id
)
select
  project_id,
  entry_date,
  round(100 * sum(weight * planned_fraction) / nullif(sum(weight), 0), 2) as planned_pct,
  round(100 * sum(weight * actual_fraction) / nullif(sum(weight), 0), 2) as actual_pct
from per_activity_date
group by project_id, entry_date
order by project_id, entry_date;
