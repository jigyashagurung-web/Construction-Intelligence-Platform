-- =====================================================================
-- Earned Value Management: BAC/PV/EV/AC snapshot per project.
--
-- Follows up on the comment in 009_reporting.sql's v_activity_progress_daily
-- ("a v1 proxy for effort/cost share, not a real earned-value baseline") by
-- computing a rigorous dollar-denominated snapshot, as of the current date.
--
-- Scope (see design.md for full rationale):
--   - bac / pv / ev only sum BOQ items with at least one linked activity;
--     items with no linked activity are excluded from bac and folded into
--     total_active_boq_amount instead (client derives the difference as
--     "unscheduled budget").
--   - "active" BOQ items means status <> 'omitted' (variation/provisional
--     items still represent real budget; omitted items don't).
--   - ac is procurement/cash-basis: only 'grn' transactions, project-wide
--     (material_transactions has no activity/boq_item link, so no
--     per-activity cost variance is possible).
--   - unlinked_activity_count surfaces activities with a null boq_item_id
--     (legacy rows predating 016_activities_require_boq_link.sql) so their
--     exclusion from bac/pv/ev is visible, not silent.
--   - Derived ratios (SV, SPI, CV, CPI, EAC, VAC) are computed client-side,
--     not here, to keep divide-by-zero handling in one place (TypeScript).
-- =====================================================================

create view v_project_evm
with (security_invoker = true)
as
with linked_boq as (
  -- One row per BOQ item that has >=1 linked activity, so a shared BOQ
  -- item (no DB constraint prevents two activities referencing the same
  -- one) is only counted once toward bac/pv.
  select distinct b.id, b.project_id, b.amount
  from boq_items b
  where b.status <> 'omitted'
    and exists (select 1 from activities a where a.boq_item_id = b.id)
),
bac_per_project as (
  select project_id, sum(amount) as bac
  from linked_boq
  group by project_id
),
total_active_boq as (
  select project_id, sum(amount) as total_active_boq_amount
  from boq_items
  where status <> 'omitted'
  group by project_id
),
pv_ev_per_activity as (
  select
    a.project_id,
    b.amount as boq_amount,
    case
      when current_date < a.planned_start then 0
      when current_date > a.planned_end then 1
      when a.planned_end = a.planned_start then 1
      else (current_date - a.planned_start)::numeric / (a.planned_end - a.planned_start)
    end as planned_fraction,
    a.progress / 100.0 as actual_fraction
  from activities a
  join boq_items b on b.id = a.boq_item_id and b.status <> 'omitted'
),
pv_ev_per_project as (
  select
    project_id,
    sum(boq_amount * planned_fraction) as pv,
    sum(boq_amount * actual_fraction)  as ev
  from pv_ev_per_activity
  group by project_id
),
ac_per_project as (
  select project_id, sum(unit_cost * quantity) as ac
  from material_transactions
  where txn_type = 'grn'
  group by project_id
),
unlinked_per_project as (
  select project_id, count(*) as unlinked_activity_count
  from activities
  where boq_item_id is null
  group by project_id
)
select
  p.id as project_id,
  coalesce(bac.bac, 0)                               as bac,
  coalesce(tab.total_active_boq_amount, 0)           as total_active_boq_amount,
  coalesce(pe.pv, 0)                                 as pv,
  coalesce(pe.ev, 0)                                 as ev,
  coalesce(ac.ac, 0)                                 as ac,
  coalesce(u.unlinked_activity_count, 0)             as unlinked_activity_count
from projects p
left join bac_per_project    bac on bac.project_id = p.id
left join total_active_boq   tab on tab.project_id = p.id
left join pv_ev_per_project  pe  on pe.project_id  = p.id
left join ac_per_project     ac  on ac.project_id  = p.id
left join unlinked_per_project u on u.project_id   = p.id;
