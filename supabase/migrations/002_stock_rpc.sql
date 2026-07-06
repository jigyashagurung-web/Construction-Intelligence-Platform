-- Atomic stock adjustment — upserts project_material row and applies delta
create or replace function adjust_material_stock(
  p_project_id  uuid,
  p_material_id uuid,
  p_delta       numeric
) returns void language plpgsql security definer as $$
begin
  insert into project_materials (project_id, material_id, on_hand, updated_at)
  values (p_project_id, p_material_id, greatest(0, p_delta), now())
  on conflict (project_id, material_id) do update
    set on_hand    = greatest(0, project_materials.on_hand + p_delta),
        updated_at = now();
end;
$$;
