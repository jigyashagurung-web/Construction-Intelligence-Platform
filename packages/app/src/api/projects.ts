import { supabase } from '@/lib/supabase'
import type { Project, ProjectStatus } from '@/types'

export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Project[]
}

export async function fetchProject(id: string): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as Project
}

export interface CreateProjectInput {
  name: string
  code: string
  status?: ProjectStatus
  start_date?: string
  end_date?: string
  budget?: number
  currency?: string
  location?: string
  description?: string
  org_id: string
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('projects')
    .insert({ ...input, created_by: user?.id })
    .select()
    .single()
  if (error) throw error
  return data as Project
}

export async function updateProject(
  id: string,
  patch: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>
): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Project
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw error
}
