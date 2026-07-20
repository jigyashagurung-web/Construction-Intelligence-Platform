import { supabase } from '@/lib/supabase'
import type { BOQItem, BOQStatus, BoqCodeCatalogEntry } from '@/types'

export async function fetchBoqCodeCatalog(): Promise<BoqCodeCatalogEntry[]> {
  const { data, error } = await supabase
    .from('boq_code_catalog')
    .select('*')
    .order('code', { ascending: true })
  if (error) throw error
  return data as BoqCodeCatalogEntry[]
}

export function resolveBoqCodeAncestry(
  code: string,
  catalog: BoqCodeCatalogEntry[]
): BoqCodeCatalogEntry[] {
  const byCode = new Map(catalog.map((e) => [e.code, e]))
  const chain: BoqCodeCatalogEntry[] = []
  let current = byCode.get(code)
  while (current) {
    chain.unshift(current)
    current = current.parent_code ? byCode.get(current.parent_code) : undefined
  }
  return chain
}

export async function fetchBOQItems(projectId: string): Promise<BOQItem[]> {
  const { data, error } = await supabase
    .from('boq_items')
    .select('*')
    .eq('project_id', projectId)
    .order('wbs_code', { ascending: true, nullsFirst: false })
  if (error) throw error
  return data as BOQItem[]
}

export interface CreateBOQItemInput {
  project_id: string
  wbs_code?: string
  description: string
  unit?: string
  quantity: number
  unit_rate: number
  trade?: string
  status?: BOQStatus
}

export async function createBOQItem(input: CreateBOQItemInput): Promise<BOQItem> {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('boq_items')
    .insert({ ...input, created_by: user?.id })
    .select()
    .single()
  if (error) throw error
  return data as BOQItem
}

export async function updateBOQItem(
  id: string,
  patch: Partial<Omit<BOQItem, 'id' | 'amount' | 'created_at' | 'updated_at'>>
): Promise<BOQItem> {
  const { data, error } = await supabase
    .from('boq_items')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as BOQItem
}

export async function deleteBOQItem(id: string): Promise<void> {
  const { error } = await supabase.from('boq_items').delete().eq('id', id)
  if (error) throw error
}
