-- =====================================================================
-- Activities: require a BOQ item link, drop free-text trade/wbs_code
-- =====================================================================
-- See openspec/changes/require-activity-boq-link. Activities carried the
-- same free-text WBS Code / Trade pattern that boq_items moved away from
-- in migration 015 — boq_item_id already exists as a real FK and already
-- carries the resolved catalog code (wbs_code/chapter/section/etc. on
-- boq_items itself), so activities.wbs_code/trade are redundant,
-- unvalidated duplicates.
--
-- Link enforcement mirrors migration 007's daily_progress_entries.activity_id:
-- policy-enforced on insert, not a NOT NULL column constraint, so any
-- pre-existing activities rows with a null boq_item_id keep working.

alter table activities drop column trade;
alter table activities drop column wbs_code;

drop policy if exists "activities: insert" on activities;

create policy "activities: insert" on activities
  for insert with check (
    boq_item_id is not null
    and project_id in (
      select id from projects
      where org_id = (select org_id from profiles where id = auth.uid())
    )
    and (select role from profiles where id = auth.uid()) in
        ('admin', 'project_manager', 'qty_surveyor')
  );
