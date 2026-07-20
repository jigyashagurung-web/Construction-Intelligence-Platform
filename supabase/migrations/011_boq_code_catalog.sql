-- =====================================================================
-- BOQ Code Catalog: standardized hierarchical BOQ/WBS coding taxonomy
-- =====================================================================
-- Source: "EN_BOQ_Coded_Revit_Integration" v1.0 standard. This is a
-- governed reference — new codes are added via migration, not ad hoc
-- per project (see openspec/changes/add-boq-code-taxonomy).
--
-- "WBS code" and "BOQ code" are the same concept in this system:
-- boq_items.wbs_code is repurposed (013_boq_items_wbs_code_fk.sql) to
-- reference line-item-level rows in this catalog instead of holding
-- free text.

create type boq_code_level as enum ('chapter', 'sub_chapter', 'section', 'line_item');

create table boq_code_catalog (
  code           text primary key,
  parent_code    text references boq_code_catalog (code),
  level          boq_code_level not null,
  description    text not null,
  unit           text,
  revit_category text,
  family_type    text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger boq_code_catalog_updated_at
  before update on boq_code_catalog
  for each row execute function set_updated_at();

-- Enforce hierarchy consistency: a chapter has no parent; every other
-- level must have a parent that is strictly higher in the hierarchy.
-- Parents are not required to be exactly one level up — several
-- sub-chapters in the source standard have line items directly
-- beneath them with no intermediate section row (relies on the enum's
-- declaration order: chapter < sub_chapter < section < line_item).
create or replace function boq_code_catalog_check_hierarchy()
returns trigger language plpgsql as $$
declare
  parent_level boq_code_level;
begin
  if new.level = 'chapter' then
    if new.parent_code is not null then
      raise exception 'chapter-level code % must not have a parent_code', new.code;
    end if;
    return new;
  end if;

  if new.parent_code is null then
    raise exception '% code % requires a parent_code', new.level, new.code;
  end if;

  select level into parent_level from boq_code_catalog where code = new.parent_code;
  if parent_level is null then
    raise exception 'parent_code % for % does not exist', new.parent_code, new.code;
  end if;

  if parent_level >= new.level then
    raise exception 'code % (level %) must have a parent at a higher level, got % (level %)',
      new.code, new.level, new.parent_code, parent_level;
  end if;

  return new;
end;
$$;

create trigger boq_code_catalog_hierarchy_check
  before insert or update on boq_code_catalog
  for each row execute function boq_code_catalog_check_hierarchy();

-- =====================================================================
-- RLS: global, read-only reference table (not org- or project-scoped)
-- =====================================================================
alter table boq_code_catalog enable row level security;

create policy "boq_code_catalog: read" on boq_code_catalog
  for select using (auth.role() = 'authenticated');

-- No insert/update/delete policy for app roles: the catalog is a
-- governed reference, mutated only via migrations (service role
-- bypasses RLS).
