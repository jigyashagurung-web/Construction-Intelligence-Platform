import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'

export async function fetchOrgMembers(orgId: string): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data as Profile[]
}

export async function updateMemberRole(userId: string, role: Profile['role']): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data as Profile
}
