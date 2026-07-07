-- =====================================================================
-- Activity Schedule
-- =====================================================================

create table activities (
  id            uuid primary key default uuid_generate_v4(),
  project_id    uuid not null references projects on delete cascade,
  boq_item_id   uuid references boq_items on delete set null,
  wbs_code      text,
  name          text not null,
  trade         text,
  planned_start date not null,
  planned_end   date not null,
  actual_start  date,
  actual_end    date,
  progress      numeric(5, 2) not null default 0,
  status        text not null default 'not_started',
  is_critical   boolean not null default false,
  assignee      text,
  created_by    uuid references profiles,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint activities_status_check check (
    status in ('not_started', 'on_track', 'at_risk', 'delayed', 'complete')
  ),
  constraint activities_progress_check check (progress >= 0 and progress <= 100)
);

create trigger activities_updated_at
  before update on activities
  for each row execute function set_updated_at();

alter table activities enable row level security;

create policy "activities: read" on activities
  for select using (
    project_id in (
      select id from projects
      where org_id = (select org_id from profiles where id = auth.uid())
    )
  );

create policy "activities: insert" on activities
  for insert with check (
    project_id in (
      select id from projects
      where org_id = (select org_id from profiles where id = auth.uid())
    )
    and (select role from profiles where id = auth.uid()) in
        ('admin', 'project_manager', 'qty_surveyor')
  );

create policy "activities: update" on activities
  for update using (
    project_id in (
      select id from projects
      where org_id = (select org_id from profiles where id = auth.uid())
    )
    and (select role from profiles where id = auth.uid()) in
        ('admin', 'project_manager', 'qty_surveyor', 'site_engineer')
  );

create policy "activities: delete" on activities
  for delete using (
    project_id in (
      select id from projects
      where org_id = (select org_id from profiles where id = auth.uid())
    )
    and (select role from profiles where id = auth.uid()) in
        ('admin', 'project_manager')
  );
