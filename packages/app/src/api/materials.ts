import { supabase } from '@/lib/supabase'
import type { Material, ProjectMaterial, MaterialTransaction, TransactionType } from '@/types'

// ---- Catalogue ---------------------------------------------------------

export async function fetchMaterials(orgId: string): Promise<Material[]> {
  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .eq('org_id', orgId)
    .order('name')
  if (error) throw error
  return data as Material[]
}

export async function createMaterial(input: {
  org_id: string
  name: string
  unit: string
  category?: string
  spec?: string
}): Promise<Material> {
  const { data, error } = await supabase
    .from('materials')
    .insert(input)
    .select()
    .single()
  if (error) throw error
  return data as Material
}

// ---- Project stock ------------------------------------------------------

export async function fetchProjectMaterials(projectId: string): Promise<ProjectMaterial[]> {
  const { data, error } = await supabase
    .from('project_materials')
    .select('*, material:materials(*)')
    .eq('project_id', projectId)
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data as ProjectMaterial[]
}

export async function upsertProjectMaterial(input: {
  project_id: string
  material_id: string
  reorder_point?: number
  unit_cost?: number
}): Promise<ProjectMaterial> {
  const { data, error } = await supabase
    .from('project_materials')
    .upsert(input, { onConflict: 'project_id,material_id' })
    .select('*, material:materials(*)')
    .single()
  if (error) throw error
  return data as ProjectMaterial
}

// ---- Transactions -------------------------------------------------------

export async function fetchTransactions(projectId: string): Promise<MaterialTransaction[]> {
  const { data, error } = await supabase
    .from('material_transactions')
    .select('*, material:materials(*)')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) throw error
  return data as MaterialTransaction[]
}

export async function recordTransaction(input: {
  project_id: string
  material_id: string
  txn_type: TransactionType
  quantity: number
  unit_cost?: number
  reference?: string
  notes?: string
}): Promise<MaterialTransaction> {
  const { data: { user } } = await supabase.auth.getUser()

  // Insert the transaction
  const { data: txn, error: txnErr } = await supabase
    .from('material_transactions')
    .insert({ ...input, created_by: user?.id })
    .select('*, material:materials(*)')
    .single()
  if (txnErr) throw txnErr

  // Adjust on_hand: grn/return add; issue/adjustment subtract
  const delta = ['grn', 'return'].includes(input.txn_type)
    ? input.quantity
    : -input.quantity

  const { error: stockErr } = await supabase.rpc('adjust_material_stock', {
    p_project_id: input.project_id,
    p_material_id: input.material_id,
    p_delta: delta,
  })
  // If RPC not yet deployed, silently fall back (stock will show 0)
  if (stockErr) console.warn('adjust_material_stock RPC not found — run migration 002', stockErr)

  return txn as MaterialTransaction
}
