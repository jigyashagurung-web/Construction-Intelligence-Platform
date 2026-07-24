-- =====================================================================
-- boq_items: denormalize catalog ancestry, drop free-text trade
-- =====================================================================
-- See openspec/changes/boq-catalog-item-picker. Once a boq_items row's
-- wbs_code resolves to a boq_code_catalog line item, reporting/exports
-- need its chapter/section grouping and Revit mapping without joining
-- back to the catalog on every read.
--
-- "Section" holds the line item's nearest non-terminal ancestor,
-- whatever level that actually is: a true section-level row where one
-- exists on that branch, or the sub-chapter directly when it doesn't
-- (e.g. Form Work, RCC Band Along Wall — see migration 012).
--
-- description/unit are unaffected here: they're ordinary columns the
-- app now populates from the selected catalog entry at write time,
-- same as before, just sourced from the cascading picker instead of
-- free text.

alter table boq_items
  add column chapter        text,
  add column section        text,
  add column revit_category text,
  add column family_type    text;

create or replace function boq_items_sync_catalog_fields()
returns trigger language plpgsql as $$
declare
  v_line   boq_code_catalog;
  v_parent boq_code_catalog;
begin
  if new.wbs_code is not null then
    select * into v_line from boq_code_catalog where code = new.wbs_code;
  end if;

  if v_line is null or v_line.level <> 'line_item' then
    new.chapter        := null;
    new.section        := null;
    new.revit_category := null;
    new.family_type    := null;
    return new;
  end if;

  new.revit_category := v_line.revit_category;
  new.family_type    := v_line.family_type;

  -- nearest non-terminal ancestor: a real section, or the sub-chapter
  -- when the branch has no section row.
  select * into v_parent from boq_code_catalog where code = v_line.parent_code;
  new.section := v_parent.description;

  -- walk up to the chapter (parent could already be the chapter itself).
  while v_parent.level <> 'chapter' loop
    select * into v_parent from boq_code_catalog where code = v_parent.parent_code;
  end loop;
  new.chapter := v_parent.description;

  return new;
end;
$$;

create trigger boq_items_sync_catalog_fields_trigger
  before insert or update of wbs_code on boq_items
  for each row execute function boq_items_sync_catalog_fields();

-- One-time backfill for existing rows, reusing the trigger above
-- (fires on any UPDATE that touches wbs_code, including a no-op
-- reassignment) rather than duplicating its resolution logic here.
update boq_items set wbs_code = wbs_code;

alter table boq_items drop column trade;
