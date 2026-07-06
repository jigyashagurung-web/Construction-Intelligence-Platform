-- =====================================================================
-- CIP — Construction Intelligence Platform: Initial Schema
-- =====================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- -------------------------
-- Organisations (tenants)
-- -------------------------
create table organisations (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  slug       text unique not null,
  plan       text not null default 'trial',
  created_at timestamptz not null default now()
);

-- -------------------------
-- User profiles (extends auth.users)
-- -------------------------
create table profiles (
  id         uuid primary key references auth.users on delete cascade,
  org_id     uuid references organisations on delete cascade,
  full_name  text,
  role       text not null default 'viewer',
  avatar_url text,
  created_at timestamptz not null default now(),
  constraint profiles_role_check check (
    role in ('admin', 'project_manager', 'site_engineer', 'qty_surveyor', 'viewer')
  )
);

-- Auto-create profile on sign-up
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- -------------------------
-- Projects
-- -------------------------
create table projects (
  id          uuid primary key default uuid_generate_v4(),
  org_id      uuid references organisations on delete cascade,
  name        text not null,
  code        text not null,
  status      text not null default 'planning',
  start_date  date,
  end_date    date,
  budget      numeric(18, 2),
  currency    text not null default 'NPR',
  location    text,
  description text,
  created_by  uuid references profiles,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint projects_status_check check (
    status in ('planning', 'active', 'on_hold', 'complete', 'cancelled')
  )
);

-- -------------------------
-- BOQ Items
-- -------------------------
create table boq_items (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid not null references projects on delete cascade,
  wbs_code    text,
  description text not null,
  unit        text,
  quantity    numeric(18, 4) not null default 0,
  unit_rate   numeric(18, 2) not null default 0,
  trade       text,
  status      text not null default 'active',
  created_by  uuid references profiles,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint boq_items_status_check check (
    status in ('active', 'omitted', 'variation', 'provisional')
  )
);

-- Computed amount column
alter table boq_items
  add column amount numeric(18, 2) generated always as (quantity * unit_rate) stored;

-- -------------------------
-- Material catalogue (org-level)
-- -------------------------
create table materials (
  id         uuid primary key default uuid_generate_v4(),
  org_id     uuid references organisations on delete cascade,
  name       text not null,
  unit       text not null,
  category   text,
  spec       text,
  created_at timestamptz not null default now()
);

-- -------------------------
-- Project material stock
-- -------------------------
create table project_materials (
  id            uuid primary key default uuid_generate_v4(),
  project_id    uuid not null references projects on delete cascade,
  material_id   uuid not null references materials on delete restrict,
  on_hand       numeric(18, 4) not null default 0,
  reorder_point numeric(18, 4) not null default 0,
  unit_cost     numeric(18, 2),
  updated_at    timestamptz not null default now(),
  unique (project_id, material_id)
);

-- -------------------------
-- Material transactions (GRN / issue / adjustment)
-- -------------------------
create table material_transactions (
  id            uuid primary key default uuid_generate_v4(),
  project_id    uuid not null references projects on delete cascade,
  material_id   uuid not null references materials on delete restrict,
  txn_type      text not null,
  quantity      numeric(18, 4) not null,
  unit_cost     numeric(18, 2),
  reference     text,
  notes         text,
  created_by    uuid references profiles,
  created_at    timestamptz not null default now(),
  constraint material_transactions_type_check check (
    txn_type in ('grn', 'issue', 'return', 'adjustment')
  )
);

-- -------------------------
-- updated_at trigger helper
-- -------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger projects_updated_at
  before update on projects
  for each row execute function set_updated_at();

create trigger boq_items_updated_at
  before update on boq_items
  for each row execute function set_updated_at();

create trigger project_materials_updated_at
  before update on project_materials
  for each row execute function set_updated_at();

-- =====================================================================
-- Row-Level Security
-- =====================================================================

alter table organisations       enable row level security;
alter table profiles            enable row level security;
alter table projects            enable row level security;
alter table boq_items           enable row level security;
alter table materials           enable row level security;
alter table project_materials   enable row level security;
alter table material_transactions enable row level security;

-- Profiles: users see only their own row; org admins see all in org
create policy "profiles: own row" on profiles
  for all using (id = auth.uid());

create policy "profiles: org members" on profiles
  for select using (
    org_id = (select org_id from profiles where id = auth.uid())
  );

-- Organisations: members see their org
create policy "organisations: member" on organisations
  for select using (
    id = (select org_id from profiles where id = auth.uid())
  );

-- Projects: org members can read; project_manager+ can write
create policy "projects: read" on projects
  for select using (
    org_id = (select org_id from profiles where id = auth.uid())
  );

create policy "projects: write" on projects
  for all using (
    org_id = (select org_id from profiles where id = auth.uid())
    and (select role from profiles where id = auth.uid()) in
        ('admin', 'project_manager', 'qty_surveyor')
  );

-- BOQ: project-scoped
create policy "boq_items: read" on boq_items
  for select using (
    project_id in (
      select id from projects
      where org_id = (select org_id from profiles where id = auth.uid())
    )
  );

create policy "boq_items: write" on boq_items
  for all using (
    project_id in (
      select id from projects
      where org_id = (select org_id from profiles where id = auth.uid())
    )
    and (select role from profiles where id = auth.uid()) in
        ('admin', 'project_manager', 'qty_surveyor')
  );

-- Materials catalogue: org-scoped
create policy "materials: read" on materials
  for select using (
    org_id = (select org_id from profiles where id = auth.uid())
  );

create policy "materials: write" on materials
  for all using (
    org_id = (select org_id from profiles where id = auth.uid())
    and (select role from profiles where id = auth.uid()) in ('admin', 'project_manager')
  );

-- Project materials stock
create policy "project_materials: read" on project_materials
  for select using (
    project_id in (
      select id from projects
      where org_id = (select org_id from profiles where id = auth.uid())
    )
  );

create policy "project_materials: write" on project_materials
  for all using (
    project_id in (
      select id from projects
      where org_id = (select org_id from profiles where id = auth.uid())
    )
  );

-- Material transactions
create policy "material_transactions: read" on material_transactions
  for select using (
    project_id in (
      select id from projects
      where org_id = (select org_id from profiles where id = auth.uid())
    )
  );

create policy "material_transactions: write" on material_transactions
  for insert with check (
    project_id in (
      select id from projects
      where org_id = (select org_id from profiles where id = auth.uid())
    )
  );

-- =====================================================================
-- Seed: demo organisation + common materials catalogue
-- =====================================================================

insert into organisations (id, name, slug, plan) values
  ('00000000-0000-0000-0000-000000000001', 'Demo Construction Co.', 'demo', 'pro');
