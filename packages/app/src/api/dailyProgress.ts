import { supabase } from '@/lib/supabase'
import type { DailyProgressEntry, DailyProgressPhoto, Weather } from '@/types'

export async function fetchDailyProgress(projectId: string): Promise<DailyProgressEntry[]> {
  const { data, error } = await supabase
    .from('daily_progress_entries')
    .select('*, activity:activities(*), photos:daily_progress_photos(*)')
    .eq('project_id', projectId)
    .order('entry_date', { ascending: false })
  if (error) throw error
  return data as DailyProgressEntry[]
}

export interface CreateDailyProgressInput {
  project_id: string
  activity_id: string
  entry_date: string
  weather?: Weather
  labour_count?: number
  equipment_count?: number
  quantity_consumed: number
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
  const { data: photos, error: photosError } = await supabase
    .from('daily_progress_photos')
    .select('storage_path')
    .eq('entry_id', id)
  if (photosError) throw photosError

  if (photos && photos.length > 0) {
    const { error: storageError } = await supabase.storage
      .from('progress-photos')
      .remove(photos.map((p) => p.storage_path))
    if (storageError) throw storageError
  }

  const { error } = await supabase.from('daily_progress_entries').delete().eq('id', id)
  if (error) throw error
}

export async function uploadDailyProgressPhoto(
  projectId: string,
  entryId: string,
  file: File
): Promise<DailyProgressPhoto> {
  const { data: { user } } = await supabase.auth.getUser()
  const path = `${projectId}/${entryId}/${crypto.randomUUID()}-${file.name}`

  const { error: uploadError } = await supabase.storage
    .from('progress-photos')
    .upload(path, file)
  if (uploadError) throw uploadError

  const { data, error } = await supabase
    .from('daily_progress_photos')
    .insert({ project_id: projectId, entry_id: entryId, storage_path: path, created_by: user?.id })
    .select()
    .single()
  if (error) throw error
  return data as DailyProgressPhoto
}

export async function deleteDailyProgressPhoto(photo: DailyProgressPhoto): Promise<void> {
  const { error: storageError } = await supabase.storage
    .from('progress-photos')
    .remove([photo.storage_path])
  if (storageError) throw storageError

  const { error } = await supabase.from('daily_progress_photos').delete().eq('id', photo.id)
  if (error) throw error
}

// The bucket is private (RLS-scoped to project org members), so callers need
// a short-lived signed URL rather than a public one.
export async function getProgressPhotoUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('progress-photos')
    .createSignedUrl(storagePath, 60 * 60)
  if (error) throw error
  return data.signedUrl
}
