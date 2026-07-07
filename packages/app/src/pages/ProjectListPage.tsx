import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Loader2, FolderOpen, MapPin, CalendarDays, X } from 'lucide-react'
import { fetchProjects, createProject } from '@/api/projects'
import { useAuthStore } from '@/store/authStore'
import type { ProjectStatus } from '@/types'

const STATUS_COLOR: Record<ProjectStatus, string> = {
  planning:  'bg-gray-100 text-gray-600',
  active:    'bg-green-100 text-green-700',
  on_hold:   'bg-yellow-100 text-yellow-700',
  complete:  'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-600',
}

const fmt = new Intl.NumberFormat('en-NP', { maximumFractionDigits: 0 })

export function ProjectListPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const profile = useAuthStore((s) => s.profile)
  const [showDialog, setShowDialog] = useState(false)

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  })

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      setShowDialog(false)
    },
  })

  if (!profile?.org_id) {
    return (
      <div className="p-6 max-w-lg mx-auto mt-12 text-center">
        <p className="text-sm font-medium text-red-600 mb-2">Account not linked to an organisation.</p>
        <p className="text-xs text-gray-500">
          Run this in your Supabase SQL Editor, then sign out and back in:
        </p>
        <pre className="mt-3 text-left text-xs bg-gray-900 text-green-400 rounded-lg px-4 py-3 overflow-x-auto">
          {`update profiles\nset org_id = '00000000-0000-0000-0000-000000000001',\n    role = 'admin';`}
        </pre>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowDialog(true)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3.5 py-2 rounded-lg transition-colors"
        >
          <Plus size={15} />
          New Project
        </button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <FolderOpen size={40} className="text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">No projects yet.</p>
          <p className="text-gray-400 text-xs mt-1">Click "New Project" to create your first one.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => navigate(`/projects/${p.id}`)}
              className="text-left bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-mono text-gray-400">{p.code}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLOR[p.status]}`}>
                  {p.status.replace('_', ' ')}
                </span>
              </div>
              <h3 className="font-medium text-gray-900 text-sm mb-2 group-hover:text-blue-600 transition-colors">
                {p.name}
              </h3>
              <div className="space-y-1">
                {p.location && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <MapPin size={11} />
                    {p.location}
                  </div>
                )}
                {p.start_date && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <CalendarDays size={11} />
                    {p.start_date}
                    {p.end_date ? ` → ${p.end_date}` : ''}
                  </div>
                )}
              </div>
              {p.budget && (
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-700">
                  Budget: <span className="font-semibold">NPR {fmt.format(p.budget)}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* New Project Dialog */}
      {showDialog && (
        <NewProjectDialog
          orgId={profile?.org_id ?? ''}
          onClose={() => setShowDialog(false)}
          onSubmit={(input) => createMutation.mutate(input)}
          loading={createMutation.isPending}
          error={createMutation.error?.message ?? null}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------

interface NewProjectDialogProps {
  orgId: string
  onClose: () => void
  onSubmit: (input: Parameters<typeof createProject>[0]) => void
  loading: boolean
  error: string | null
}

function NewProjectDialog({ orgId, onClose, onSubmit, loading, error }: NewProjectDialogProps) {
  const [name, setName]         = useState('')
  const [code, setCode]         = useState('')
  const [status, setStatus]     = useState<ProjectStatus>('planning')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate]   = useState('')
  const [budget, setBudget]     = useState('')
  const [location, setLocation] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({
      name,
      code,
      status,
      org_id: orgId,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      budget: budget ? Number(budget) : undefined,
      location: location || undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">New Project</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <Field label="Project name *">
            <input
              className={input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Hetauda Bridge Reinforcement"
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Code *">
              <input
                className={input}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="HBR-001"
                required
              />
            </Field>
            <Field label="Status">
              <select
                className={input}
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Start date">
              <input type="date" className={input} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </Field>
            <Field label="End date">
              <input type="date" className={input} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Budget (NPR)">
              <input
                type="number"
                className={input}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="0"
              />
            </Field>
            <Field label="Location">
              <input
                className={input}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Hetauda, Nepal"
              />
            </Field>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-sm text-white font-medium flex items-center justify-center gap-2 transition-colors"
            >
              {loading && <Loader2 size={13} className="animate-spin" />}
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const input = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  )
}
