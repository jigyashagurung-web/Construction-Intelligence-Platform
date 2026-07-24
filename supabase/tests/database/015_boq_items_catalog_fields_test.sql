-- =====================================================================
-- pgTAP tests for supabase/migrations/015_boq_items_catalog_fields.sql
--
-- Run with the Supabase CLI:
--   npm run test:db
-- =====================================================================

begin;

select plan(16);

-- -------------------------
-- Schema shape
-- -------------------------
select hasnt_column('public', 'boq_items', 'trade', 'boq_items.trade column has been dropped');
select has_column('public', 'boq_items', 'chapter',        'boq_items.chapter column exists');
select has_column('public', 'boq_items', 'section',        'boq_items.section column exists');
select has_column('public', 'boq_items', 'revit_category', 'boq_items.revit_category column exists');
select has_column('public', 'boq_items', 'family_type',    'boq_items.family_type column exists');

-- -------------------------
-- Fixture project (reuses the demo org seeded in 001_initial_schema.sql)
-- -------------------------
select lives_ok($$
  insert into projects (id, org_id, name, code)
  values ('88888888-8888-8888-8888-888888888801', '00000000-0000-0000-0000-000000000001', 'Catalog Fields Test Project', 'CFT-1')
$$, 'setup: project for the catalog-fields trigger test');

-- -------------------------
-- Full-depth branch: chapter -> sub_chapter -> section -> line_item
-- 01.10.10.01 "Clearing and grubbing" -> section 01.10.10.00 "Site Clearance" -> chapter 01.00.00.00
-- -------------------------
select lives_ok($$
  insert into boq_items (id, project_id, wbs_code, description, quantity, unit_rate)
  values ('88888888-8888-8888-8888-888888888802', '88888888-8888-8888-8888-888888888801', '01.10.10.01', 'Clearing and grubbing', 100, 85)
$$, 'setup: full-depth-branch boq_item');

select results_eq(
  $$ select chapter, section, revit_category, family_type from boq_items where id = '88888888-8888-8888-8888-888888888802' $$,
  $$ values ('SITE DEVELOPMENT WORKS'::text, 'Site Clearance'::text, 'Site'::text, 'Clearing'::text) $$,
  'full-depth branch resolves chapter/section/revit_category/family_type from catalog ancestry'
);

-- -------------------------
-- Skip-section branch: chapter -> sub_chapter -> line_item (no section row)
-- 02.60.10.01 "Foundation formwork" attaches directly to sub_chapter 02.60.00.00 "FORM WORK"
-- -------------------------
select lives_ok($$
  insert into boq_items (id, project_id, wbs_code, description, quantity, unit_rate)
  values ('88888888-8888-8888-8888-888888888803', '88888888-8888-8888-8888-888888888801', '02.60.10.01', 'Foundation formwork', 50, 120)
$$, 'setup: skip-section-branch boq_item');

select results_eq(
  $$ select chapter, section from boq_items where id = '88888888-8888-8888-8888-888888888803' $$,
  $$ values ('CIVIL WORK'::text, 'FORM WORK'::text) $$,
  'skip-section branch folds the sub-chapter into the section field'
);

-- -------------------------
-- Null wbs_code
-- -------------------------
select lives_ok($$
  insert into boq_items (id, project_id, description, quantity, unit_rate)
  values ('88888888-8888-8888-8888-888888888804', '88888888-8888-8888-8888-888888888801', 'Ad hoc item, no code', 1, 1)
$$, 'setup: boq_item with no wbs_code');

select results_eq(
  $$ select chapter, section, revit_category, family_type from boq_items where id = '88888888-8888-8888-8888-888888888804' $$,
  $$ values (null::text, null::text, null::text, null::text) $$,
  'a null wbs_code leaves all derived fields null'
);

-- -------------------------
-- Unmatched wbs_code (legacy free text, not in the catalog)
-- -------------------------
select lives_ok($$
  insert into boq_items (id, project_id, wbs_code, description, quantity, unit_rate)
  values ('88888888-8888-8888-8888-888888888805', '88888888-8888-8888-8888-888888888801', 'legacy-1.2.3', 'Legacy item', 1, 1)
$$, 'setup: boq_item with an unmatched wbs_code');

select results_eq(
  $$ select chapter, section, revit_category, family_type from boq_items where id = '88888888-8888-8888-8888-888888888805' $$,
  $$ values (null::text, null::text, null::text, null::text) $$,
  'an unmatched wbs_code leaves all derived fields null'
);

-- -------------------------
-- Updating wbs_code recomputes the derived fields
-- -------------------------
select lives_ok($$
  update boq_items set wbs_code = '01.20.10.01' where id = '88888888-8888-8888-8888-888888888802'
$$, 'update the full-depth-branch item to a different line item (01.20.10.01, Protection Pile work)');

select results_eq(
  $$ select chapter, section, revit_category, family_type from boq_items where id = '88888888-8888-8888-8888-888888888802' $$,
  $$ values ('SITE DEVELOPMENT WORKS'::text, 'Protection Pile Work'::text, 'Structural Foundation'::text, 'Pile'::text) $$,
  'updating wbs_code to a different line item recomputes chapter/section/revit_category/family_type'
);

select * from finish();

rollback;
