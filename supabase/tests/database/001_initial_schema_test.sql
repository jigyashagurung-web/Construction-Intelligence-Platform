-- =====================================================================
-- pgTAP tests for supabase/migrations/001_initial_schema.sql
--
-- Run with the Supabase CLI (spins up a local Postgres via Docker and
-- applies every migration before executing tests in this directory):
--
--   supabase test db
-- =====================================================================

begin;

select plan(49);

-- -------------------------
-- Tables exist
-- -------------------------
select has_table('public', 'organisations',        'organisations table exists');
select has_table('public', 'profiles',              'profiles table exists');
select has_table('public', 'projects',              'projects table exists');
select has_table('public', 'boq_items',             'boq_items table exists');
select has_table('public', 'materials',             'materials table exists');
select has_table('public', 'project_materials',     'project_materials table exists');
select has_table('public', 'material_transactions', 'material_transactions table exists');

-- -------------------------
-- Defaults
-- -------------------------
select col_default_is('public', 'organisations', 'plan',      'trial',     'organisations.plan defaults to trial');
select col_default_is('public', 'profiles',       'role',      'viewer',    'profiles.role defaults to viewer');
select col_default_is('public', 'projects',       'status',    'planning',  'projects.status defaults to planning');
select col_default_is('public', 'projects',       'currency',  'NPR',       'projects.currency defaults to NPR');
select col_default_is('public', 'boq_items',      'quantity',  '0',         'boq_items.quantity defaults to 0');
select col_default_is('public', 'boq_items',      'unit_rate', '0',         'boq_items.unit_rate defaults to 0');
select col_default_is('public', 'boq_items',      'status',    'active',    'boq_items.status defaults to active');

-- -------------------------
-- Foreign keys
-- -------------------------
select fk_ok('public', 'profiles',              'org_id',      'public', 'organisations', 'id');
select fk_ok('public', 'projects',              'org_id',      'public', 'organisations', 'id');
select fk_ok('public', 'boq_items',              'project_id', 'public', 'projects',      'id');
select fk_ok('public', 'materials',              'org_id',      'public', 'organisations', 'id');
select fk_ok('public', 'project_materials',      'project_id', 'public', 'projects',      'id');
select fk_ok('public', 'project_materials',      'material_id','public', 'materials',     'id');
select fk_ok('public', 'material_transactions',  'project_id', 'public', 'projects',      'id');
select fk_ok('public', 'material_transactions',  'material_id','public', 'materials',     'id');

-- -------------------------
-- Check constraints (reject invalid enum-like values)
-- -------------------------
select throws_ok(
  $$ insert into organisations (name, slug) values ('Dup Co', 'demo') $$,
  'duplicate organisations.slug is rejected'
);

select throws_ok(
  $$ insert into projects (org_id, name, code, status)
     values ('00000000-0000-0000-0000-000000000001', 'X', 'X-1', 'bogus') $$,
  'projects.status rejects values outside the allowed list'
);

select throws_ok(
  $$ insert into boq_items (project_id, description, status)
     values ('00000000-0000-0000-0000-000000000000', 'X', 'bogus') $$,
  'boq_items.status rejects values outside the allowed list'
);

select throws_ok(
  $$ insert into material_transactions (project_id, material_id, txn_type, quantity)
     values ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'bogus', 1) $$,
  'material_transactions.txn_type rejects values outside the allowed list'
);

-- -------------------------
-- Generated column
-- -------------------------
select lives_ok(
  $$ insert into organisations (id, name, slug)
     values ('99999999-9999-9999-9999-999999999901', 'Amount Test Org', 'amount-test-org') $$,
  'setup: organisation for generated-column test'
);

select lives_ok(
  $$ insert into projects (id, org_id, name, code)
     values ('99999999-9999-9999-9999-999999999902', '99999999-9999-9999-9999-999999999901', 'Amount Test Project', 'AT-1') $$,
  'setup: project for generated-column test'
);

select lives_ok(
  $$ insert into boq_items (id, project_id, description, quantity, unit_rate)
     values ('99999999-9999-9999-9999-999999999903', '99999999-9999-9999-9999-999999999902', 'Rebar', 10, 250) $$,
  'setup: boq_item for generated-column test'
);

select is(
  (select amount from boq_items where id = '99999999-9999-9999-9999-999999999903'),
  2500.00::numeric(18,2),
  'boq_items.amount is generated as quantity * unit_rate'
);

-- -------------------------
-- updated_at trigger
-- -------------------------
select isnt(
  (select updated_at from projects where id = '99999999-9999-9999-9999-999999999902'),
  null,
  'projects.updated_at is set on insert'
);

select lives_ok(
  $$ update projects set name = 'Amount Test Project (renamed)'
     where id = '99999999-9999-9999-9999-999999999902' $$,
  'setup: update project to exercise updated_at trigger'
);

select cmp_ok(
  (select updated_at from projects where id = '99999999-9999-9999-9999-999999999902'),
  '>',
  (select created_at from projects where id = '99999999-9999-9999-9999-999999999902'),
  'projects_updated_at trigger bumps updated_at past created_at on update'
);

-- -------------------------
-- Row level security is enabled
-- -------------------------
select ok((select relrowsecurity from pg_class where oid = 'public.organisations'::regclass),       'RLS enabled on organisations');
select ok((select relrowsecurity from pg_class where oid = 'public.profiles'::regclass),             'RLS enabled on profiles');
select ok((select relrowsecurity from pg_class where oid = 'public.projects'::regclass),              'RLS enabled on projects');
select ok((select relrowsecurity from pg_class where oid = 'public.boq_items'::regclass),             'RLS enabled on boq_items');
select ok((select relrowsecurity from pg_class where oid = 'public.materials'::regclass),              'RLS enabled on materials');
select ok((select relrowsecurity from pg_class where oid = 'public.project_materials'::regclass),      'RLS enabled on project_materials');
select ok((select relrowsecurity from pg_class where oid = 'public.material_transactions'::regclass),  'RLS enabled on material_transactions');

-- -------------------------
-- Seed data
-- -------------------------
select results_eq(
  $$ select name, plan from organisations where slug = 'demo' $$,
  $$ values ('Demo Construction Co.'::text, 'pro'::text) $$,
  'demo organisation seed row is present'
);

-- -------------------------
-- Behavioural: cross-org isolation + role-gated writes
-- -------------------------

-- Two orgs, two projects, one viewer and one project_manager, both in org A.
select lives_ok($$
  insert into organisations (id, name, slug) values
    ('11111111-1111-1111-1111-111111111111', 'Org A', 'org-a-rls-test'),
    ('22222222-2222-2222-2222-222222222222', 'Org B', 'org-b-rls-test')
$$, 'setup: two organisations for RLS test');

select lives_ok($$
  insert into auth.users (id, email) values
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'viewer@rls-test.local'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'pm@rls-test.local')
$$, 'setup: auth users (handle_new_user trigger auto-creates profiles)');

select lives_ok($$
  update profiles set org_id = '11111111-1111-1111-1111-111111111111', role = 'viewer'
    where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
$$, 'setup: assign viewer profile to org A');

select lives_ok($$
  update profiles set org_id = '11111111-1111-1111-1111-111111111111', role = 'project_manager'
    where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab'
$$, 'setup: assign project_manager profile to org A');

select lives_ok($$
  insert into projects (id, org_id, name, code) values
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Project A', 'PA-1'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'Project B', 'PB-1')
$$, 'setup: one project in each organisation');

select set_config('request.jwt.claims', json_build_object('sub', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')::text, true);
set local role authenticated;

select results_eq(
  $$ select id from projects order by id $$,
  $$ values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid) $$,
  'org A viewer sees only org A''s project, not org B''s'
);

select throws_ok(
  $$ insert into boq_items (project_id, description)
     values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'blocked item') $$,
  'viewer role is blocked from inserting boq_items by RLS'
);

reset role;
select set_config('request.jwt.claims', json_build_object('sub', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab')::text, true);
set local role authenticated;

select lives_ok(
  $$ insert into boq_items (project_id, description)
     values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'allowed item') $$,
  'project_manager role can insert boq_items in their own org'
);

reset role;

select * from finish();

rollback;
