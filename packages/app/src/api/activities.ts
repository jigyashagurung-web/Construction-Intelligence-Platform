import { supabase } from '@/lib/supabase'
import type { Activity, ActivityStatus } from '@/types'

export async function fetchActivities(projectId: string): Promise<Activity[]> {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('project_id', projectId)
    .order('planned_start', { ascending: true })
  if (error) throw error
  return data as Activity[]
}

export interface CreateActivityInput {
  project_id: string
  boq_item_id?: string
  wbs_code?: string
  name: string
  trade?: string
  planned_start: string
  planned_end: string
  actual_start?: string
  actual_end?: string
  progress?: number
  status?: ActivityStatus
  is_critical?: boolean
  assignee?: string
}

export async function createActivity(input: CreateActivityInput): Promise<Activity> {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('activities')
    .insert({ ...input, created_by: user?.id })
    .select()
    .single()
  if (error) throw error
  return data as Activity
}

export async function updateActivity(
  id: string,
  patch: Partial<Omit<Activity, 'id' | 'project_id' | 'created_at' | 'updated_at'>>
): Promise<Activity> {
  const { data, error } = await supabase
    .from('activities')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Activity
}

export async function deleteActivity(id: string): Promise<void> {
  const { error } = await supabase.from('activities').delete().eq('id', id)
  if (error) throw error
}
