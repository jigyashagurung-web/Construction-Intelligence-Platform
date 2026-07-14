import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, Loader2 } from 'lucide-react'
import { fetchOrgMembers, updateMemberRole } from '@/api/team'
import { useAuthStore } from '@/store/authStore'
import type { Profile } from '@/types'

const ROLE_OPTS: Profile['role'][] = ['admin', 'project_manager', 'site_engineer', 'qty_surveyor', 'viewer']

const ROLE_LABEL: Record<Profile['role'], string> = {
  admin: 'Admin',
  project_manager: 'Project Manager',
  site_engineer: 'Site Engineer',
  qty_surveyor: 'QS',
  viewer: 'Viewer',
}

const fmtDate = new Intl.DateTimeFormat('en-NP', { dateStyle: 'medium' })

export function TeamPage() {
  const profile = useAuthStore((s) => s.profile)
  const qc = useQueryClient()
  const [changingId, setChangingId] = useState<string | null>(null)

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['org_members', profile?.org_id],
    queryFn: () => fetchOrgMembers(profile!.org_id!),
    enabled: !!profile?.org_id && profile.role === 'admin',
  })

  const updateMut = useMutation({
    mutationFn: ({ id, role }: { id: string; role: Profile['role'] }) => updateMemberRole(id, role),
    onMutate: ({ id }) => setChangingId(id),
    onSettled: () => setChangingId(null),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['org_members', profile?.org_id] }),
  })

  if (profile?.role !== 'admin') {
    return (
      <div className="p-6 max-w-lg mx-auto mt-12 text-center">
        <p className="text-sm font-medium text-red-600 mb-2">You don't have access to this page.</p>
        <p className="text-xs text-gray-500">Team management is limited to admins.</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Users size={18} className="text-blue-600" />
          Team
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {members.length} member{members.length !== 1 ? 's' : ''}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={22} className="animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-xs text-gray-500 font-medium">
                <th className="px-4 py-2.5 text-left">Name</th>
                <th className="px-4 py-2.5 text-left">Email</th>
                <th className="px-4 py-2.5 text-left w-44">Role</th>
                <th className="px-4 py-2.5 text-left w-32">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.map((m) => {
                const isSelf = m.id === profile.id
                return (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
                          {m.full_name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <span className="text-gray-900">{m.full_name ?? '—'}{isSelf && ' (you)'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-gray-500">{m.email ?? '—'}</td>
                    <td className="px-4 py-2.5">
                      <select
                        value={m.role}
                        disabled={isSelf || (changingId === m.id && updateMut.isPending)}
                        title={isSelf ? "You can't change your own role." : undefined}
                        onChange={(e) => updateMut.mutate({ id: m.id, role: e.target.value as Profile['role'] })}
                        className="appearance-none px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        {ROLE_OPTS.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs">{fmtDate.format(new Date(m.created_at))}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
