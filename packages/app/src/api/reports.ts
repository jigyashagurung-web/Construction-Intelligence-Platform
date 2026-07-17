import { supabase } from '@/lib/supabase'
import type { DailyProgressPhoto, DailyProgressRollup, ProgressCurvePoint } from '@/types'

export interface DateRange {
  from: string
  to: string
}

export async function fetchDailyRollup(
  projectId: string,
  range?: DateRange
): Promise<DailyProgressRollup[]> {
  let query = supabase
    .from('v_daily_progress_rollup')
    .select('*')
    .eq('project_id', projectId)
    .order('entry_date', { ascending: true })

  if (range) {
    query = query.gte('entry_date', range.from).lte('entry_date', range.to)
  }

  const { data, error } = await query
  if (error) throw error
  return data as DailyProgressRollup[]
}

export async function fetchProgressCurve(projectId: string): Promise<ProgressCurvePoint[]> {
  const { data, error } = await supabase
    .from('v_activity_progress_daily')
    .select('*')
    .eq('project_id', projectId)
    .order('entry_date', { ascending: true })
  if (error) throw error
  return data as ProgressCurvePoint[]
}

export interface ProgressPhotoFilters {
  activityId?: string
  range?: DateRange
}

export async function fetchProgressPhotos(
  projectId: string,
  filters?: ProgressPhotoFilters
): Promise<(DailyProgressPhoto & { entry: { id: string; entry_date: string; activity_id: string } })[]> {
  let query = supabase
    .from('daily_progress_photos')
    .select('*, entry:daily_progress_entries!inner(id, entry_date, activity_id)')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (filters?.activityId) {
    query = query.eq('entry.activity_id', filters.activityId)
  }
  if (filters?.range) {
    query = query.gte('entry.entry_date', filters.range.from).lte('entry.entry_date', filters.range.to)
  }

  const { data, error } = await query
  if (error) throw error
  return data as (DailyProgressPhoto & { entry: { id: string; entry_date: string; activity_id: string } })[]
}
