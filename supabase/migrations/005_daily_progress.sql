-- =====================================================================
-- Daily Progress (site diary)
-- =====================================================================

create table daily_progress_entries (
  id             uuid primary key default uuid_generate_v4(),
  project_id     uuid not null references projects on delete cascade,
  activity_id    uuid references activities on delete set null,
  entry_date     date not null,
  weather        text,
  labour_count   integer not null default 0,
  equipment_count integer not null default 0,
  work_done      text not null,
  issues         text,
  created_by     uuid references profiles,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint daily_progress_weather_check check (
    weather is null or weather in ('sunny', 'cloudy', 'rainy', 'stormy', 'foggy')
  ),
  constraint daily_progress_labour_check check (labour_count >= 0),
  constraint daily_progress_equipment_check check (equipment_count >= 0)
);

create trigger daily_progress_entries_updated_at
  before update on daily_progress_entries
  for each row execute function set_updated_at();

alter table daily_progress_entries enable row level security;

create policy "daily_progress: read" on daily_progress_entries
  for select using (
    project_id in (
      select id from projects
      where org_id = (select org_id from profiles where id = auth.uid())
    )
  );

create policy "daily_progress: insert" on daily_progress_entries
  for insert with check (
    project_id in (
      select id from projects
      where org_id = (select org_id from profiles where id = auth.uid())
    )
    and (select role from profiles where id = auth.uid()) in
        ('admin', 'project_manager', 'site_engineer')
  );

create policy "daily_progress: update" on daily_progress_entries
  for update using (
    project_id in (
      select id from projects
      where org_id = (select org_id from profiles where id = auth.uid())
    )
    and (select role from profiles where id = auth.uid()) in
        ('admin', 'project_manager', 'site_engineer')
  );

create policy "daily_progress: delete" on daily_progress_entries
  for delete using (
    project_id in (
      select id from projects
      where org_id = (select org_id from profiles where id = auth.uid())
    )
    and (select role from profiles where id = auth.uid()) in
        ('admin', 'project_manager')
  );
