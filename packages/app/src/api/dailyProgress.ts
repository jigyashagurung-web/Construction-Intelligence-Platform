import { supabase } from '@/lib/supabase'
import type { DailyProgressEntry, Weather } from '@/types'

export async function fetchDailyProgress(projectId: string): Promise<DailyProgressEntry[]> {
  const { data, error } = await supabase
    .from('daily_progress_entries')
    .select('*, activity:activities(*)')
    .eq('project_id', projectId)
    .order('entry_date', { ascending: false })
  if (error) throw error
  return data as DailyProgressEntry[]
}

export interface CreateDailyProgressInput {
  project_id: string
  activity_id?: string
  entry_date: string
  weather?: Weather
  labour_count?: number
  equipment_count?: number
  work_done: string
  issues?: string
}

export async function createDailyProgressEntry(
  input: CreateDailyProgressInput
): Promise<DailyProgressEntry> {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('daily_progress_entries')
    .insert({ ...input, created_by: user?.id })
    .select('*, activity:activities(*)')
    .single()
  if (error) throw error
  return data as DailyProgressEntry
}

export async function updateDailyProgressEntry(
  id: string,
  patch: Partial<Omit<DailyProgressEntry, 'id' | 'project_id' | 'created_at' | 'updated_at' | 'activity'>>
): Promise<DailyProgressEntry> {
  const { data, error } = await supabase
    .from('daily_progress_entries')
    .update(patch)
    .eq('id', id)
    .select('*, activity:activities(*)')
    .single()
  if (error) throw error
  return data as DailyProgressEntry
}

export async function deleteDailyProgressEntry(id: string): Promise<void> {
  const { error } = await supabase.from('daily_progress_entries').delete().eq('id', id)
  if (error) throw error
}
