-- =====================================================================
-- boq_items.wbs_code: repurpose free text into a catalog-backed code
-- =====================================================================
-- "WBS code" and "BOQ code" are the same concept in this system, so
-- the existing wbs_code column is reused rather than adding a second
-- column. See openspec/changes/add-boq-code-taxonomy.
--
-- The FK is added NOT VALID: existing rows hold pre-standard free-text
-- values (e.g. "1.1.2") that do not match any boq_code_catalog.code,
-- so validating immediately would break every existing BOQ item. New
-- and edited rows are expected to use catalog codes via the app's
-- code picker. Once a backfill maps legacy values to catalog codes
-- (tracked separately, not part of this migration), run:
--   alter table boq_items validate constraint boq_items_wbs_code_fkey;
-- to enforce the constraint for all rows.

alter table boq_items
  add constraint boq_items_wbs_code_fkey
  foreign key (wbs_code) references boq_code_catalog (code)
  not valid;

-- Only line-item-level codes may be assigned to a BOQ item. A plain FK
-- can't express this (it can target any row in boq_code_catalog
-- regardless of level), so it's enforced here via trigger. Rows whose
-- wbs_code doesn't match any catalog entry (legacy free text) are left
-- alone — this only fires validation for values that ARE present in
-- the catalog.
create or replace function boq_items_check_wbs_code_level()
returns trigger language plpgsql as $$
declare
  code_level boq_code_level;
begin
  if new.wbs_code is null then
    return new;
  end if;

  select level into code_level from boq_code_catalog where code = new.wbs_code;

  if code_level is not null and code_level <> 'line_item' then
    raise exception 'wbs_code % is a % code; boq_items.wbs_code must reference a line_item', new.wbs_code, code_level;
  end if;

  return new;
end;
$$;

create trigger boq_items_wbs_code_level_check
  before insert or update on boq_items
  for each row execute function boq_items_check_wbs_code_level();
