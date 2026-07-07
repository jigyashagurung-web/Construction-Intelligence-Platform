import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, Plus, Loader2, Pencil, Trash2, X, GanttChartSquare,
  List, TrendingUp, CheckCircle2, Clock, AlertTriangle, ChevronDown,
} from 'lucide-react'
import {
  fetchActivities, createActivity, updateActivity, deleteActivity,
} from '@/api/activities'
import { fetchProject } from '@/api/projects'
import type { Activity, ActivityStatus } from '@/types'

const STATUS_OPTS: ActivityStatus[] = ['not_started', 'on_track', 'at_risk', 'delayed', 'complete']

const STATUS_CFG: Record<ActivityStatus, { label: string; badge: string; bar: string }> = {
  not_started: { label: 'Not Started', badge: 'bg-gray-100 text-gray-500',    bar: 'bg-gray-300' },
  on_track:    { label: 'On Track',    badge: 'bg-blue-100 text-blue-700',    bar: 'bg-blue-500' },
  at_risk:     { label: 'At Risk',     badge: 'bg-yellow-100 text-yellow-700', bar: 'bg-yellow-500' },
  delayed:     { label: 'Delayed',     badge: 'bg-red-100 text-red-600',      bar: 'bg-red-500' },
  complete:    { label: 'Complete',    badge: 'bg-green-100 text-green-700',  bar: 'bg-green-500' },
}

const TRADES = [
  'Civil Works', 'Structural Steel', 'MEP', 'Finishing',
  'Earthworks', 'Roads & Pavements', 'Plumbing', 'Electrical', 'General',
]

const dayDiff = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000)

export function ActivitySchedulePage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [view, setView]           = useState<'gantt' | 'table'>('gantt')
  const [tradeFilter, setTrade]   = useState('All')
  const [statusFilter, setStatus] = useState<'All' | ActivityStatus>('All')
  const [dialog, setDialog]       = useState<'add' | 'edit' | null>(null)
  const [editing, setEditing]     = useState<Activity | null>(null)

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => fetchProject(projectId!),
    enabled: !!projectId,
  })

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activities', projectId],
    queryFn: () => fetchActivities(projectId!),
    enabled: !!projectId,
  })

  const createMut = useMutation({
    mutationFn: createActivity,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['activities', projectId] }); setDialog(null) },
  })

  const updateMut = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Parameters<typeof updateActivity>[1] }) =>
      updateActivity(id, patch),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['activities', projectId] }); setDialog(null) },
  })

  const deleteMut = useMutation({
    mutationFn: deleteActivity,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['activities', projectId] }),
  })

  const trades = ['All', ...Array.from(new Set(activities.map((a) => a.trade).filter(Boolean)))] as string[]
  const filtered = activities.filter((a) => {
    const matchTrade  = tradeFilter === 'All' || a.trade === tradeFilter
    const matchStatus = statusFilter === 'All' || a.status === statusFilter
    return matchTrade && matchStatus
  })

  const complete = activities.filter((a) => a.status === 'complete').length
  const onTrack  = activities.filter((a) => a.status === 'on_track').length
  const atRisk   = activities.filter((a) => a.status === 'at_risk' || a.status === 'delayed').length
  const overallPct = activities.length
    ? Math.round(activities.reduce((s, a) => s + a.progress, 0) / activities.length)
    : 0

  function openEdit(a: Activity) {
    setEditing(a)
    setDialog('edit')
  }

  function handleDelete(id: string) {
    if (confirm('Delete this activity?')) deleteMut.mutate(id)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <button
          onClick={() => navigate(`/projects/${projectId}`)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-2 transition-colors"
        >
          <ArrowLeft size={14} />
          {project?.name ?? 'Project'}
        </button>

        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <GanttChartSquare size={18} className="text-blue-600" />
              Activity Schedule
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {activities.length} activit{activities.length !== 1 ? 'ies' : 'y'}
            </p>
          </div>
          <button
            onClick={() => { setEditing(null); setDialog('add') }}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3.5 py-2 rounded-lg transition-colors"
          >
            <Plus size={15} />
            Add Activity
          </button>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <Kpi label="Overall Progress" value={`${overallPct}%`} icon={<TrendingUp size={15} className="text-blue-500" />} />
          <Kpi label="Complete" value={complete} icon={<CheckCircle2 size={15} className="text-green-500" />} />
          <Kpi label="On Track" value={onTrack} icon={<Clock size={15} className="text-blue-500" />} />
          <Kpi label="At Risk / Delayed" value={atRisk} icon={<AlertTriangle size={15} className={atRisk > 0 ? 'text-red-500' : 'text-gray-400'} />} warn={atRisk > 0} />
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            {([
              { v: 'gantt' as const, icon: <GanttChartSquare size={14} />, label: 'Gantt' },
              { v: 'table' as const, icon: <List size={14} />, label: 'Table' },
            ]).map(({ v, icon, label }) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                  view === v ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {icon}{label}
              </button>
            ))}
          </div>

          <div className="relative">
            <select
              value={tradeFilter}
              onChange={(e) => setTrade(e.target.value)}
              className="appearance-none pl-3 pr-7 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {trades.map((t) => <option key={t}>{t}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatus(e.target.value as typeof statusFilter)}
              className="appearance-none pl-3 pr-7 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="All">All statuses</option>
              {STATUS_OPTS.map((s) => <option key={s} value={s}>{STATUS_CFG[s].label}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main view */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={22} className="animate-spin text-gray-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <GanttChartSquare size={36} className="text-gray-200 mb-3" />
            <p className="text-sm text-gray-500">
              {activities.length === 0 ? 'No activities yet.' : 'No activities match your filters.'}
            </p>
          </div>
        ) : view === 'gantt' ? (
          <GanttView activities={filtered} onRowClick={openEdit} />
        ) : (
          <TableView activities={filtered} onEdit={openEdit} onDelete={handleDelete} />
        )}
      </div>

      {/* Add / Edit dialog */}
      {dialog && (
        <ActivityDialog
          mode={dialog}
          initial={editing}
          projectId={projectId!}
          onClose={() => { setDialog(null); setEditing(null) }}
          onSubmit={(data) => {
            if (dialog === 'edit' && editing) {
              updateMut.mutate({ id: editing.id, patch: data })
            } else {
              createMut.mutate({ project_id: projectId!, ...data })
            }
          }}
          loading={createMut.isPending || updateMut.isPending}
          error={createMut.error?.message ?? updateMut.error?.message ?? null}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------

function Kpi({ label, value, icon, warn }: { label: string; value: string | number; icon: React.ReactNode; warn?: boolean }) {
  return (
    <div className={`rounded-lg border px-3 py-2.5 ${warn ? 'border-red-100 bg-red-50' : 'border-gray-100 bg-gray-50'}`}>
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">{icon}{label}</div>
      <p className={`text-lg font-semibold ${warn ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------

function GanttView({ activities, onRowClick }: { activities: Activity[]; onRowClick: (a: Activity) => void }) {
  const { rangeStart, totalDays } = useMemo(() => {
    const dates = activities.flatMap((a) => [a.planned_start, a.planned_end, a.actual_start, a.actual_end].filter(Boolean) as string[])
    const start = dates.reduce((min, d) => (d < min ? d : min), dates[0])
    const end   = dates.reduce((max, d) => (d > max ? d : max), dates[0])
    return { rangeStart: start, totalDays: Math.max(dayDiff(start, end), 1) }
  }, [activities])

  const today = new Date().toISOString().slice(0, 10)
  const todayPct = today >= rangeStart ? Math.min((dayDiff(rangeStart, today) / totalDays) * 100, 100) : null

  return (
    <div className="p-4">
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
        {activities.map((a, i) => {
          const cfg = STATUS_CFG[a.status]
          const planLeft  = (dayDiff(rangeStart, a.planned_start) / totalDays) * 100
          const planWidth = Math.max((dayDiff(a.planned_start, a.planned_end) / totalDays) * 100, 1)
          return (
            <button
              key={a.id}
              onClick={() => onRowClick(a)}
              className={`flex items-center w-full text-left border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${i % 2 ? 'bg-gray-50/50' : ''}`}
            >
              <div className="w-56 flex-shrink-0 px-3 py-2.5 min-w-0">
                <div className="flex items-center gap-1.5">
                  {a.is_critical && <span className="w-1 h-3 rounded bg-red-500 flex-shrink-0" />}
                  <p className="text-xs font-medium text-gray-900 truncate">{a.name}</p>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">{a.wbs_code ? `${a.wbs_code} · ` : ''}{a.trade ?? '—'}</p>
              </div>
              <div className="flex-1 relative h-10 mx-3">
                {todayPct != null && (
                  <div className="absolute top-0 bottom-0 w-px bg-red-400 z-10" style={{ left: `${todayPct}%` }} />
                )}
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-4 rounded bg-gray-100 border border-gray-200"
                  style={{ left: `${planLeft}%`, width: `${planWidth}%` }}
                >
                  <div
                    className={`h-full rounded-l ${a.status === 'not_started' ? 'bg-gray-300' : cfg.bar}`}
                    style={{ width: `${a.progress}%` }}
                  />
                </div>
              </div>
              <div className="w-16 flex-shrink-0 pr-3 text-right">
                <span className={`text-xs font-semibold ${a.status === 'not_started' ? 'text-gray-400' : 'text-gray-700'}`}>{a.progress}%</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

function TableView({
  activities, onEdit, onDelete,
}: {
  activities: Activity[]
  onEdit: (a: Activity) => void
  onDelete: (id: string) => void
}) {
  return (
    <table className="w-full text-sm">
      <thead className="bg-gray-50 sticky top-0 z-10">
        <tr className="text-xs text-gray-500 font-medium">
          <th className="px-4 py-2.5 text-left w-24">WBS</th>
          <th className="px-4 py-2.5 text-left">Activity</th>
          <th className="px-4 py-2.5 text-left w-32">Trade</th>
          <th className="px-4 py-2.5 text-left w-28">Plan Start</th>
          <th className="px-4 py-2.5 text-left w-28">Plan End</th>
          <th className="px-4 py-2.5 text-left w-36">Progress</th>
          <th className="px-4 py-2.5 text-left w-28">Status</th>
          <th className="px-4 py-2.5 text-left w-32">Assignee</th>
          <th className="px-4 py-2.5 w-16" />
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {activities.map((a) => {
          const cfg = STATUS_CFG[a.status]
          return (
            <tr key={a.id} className="hover:bg-gray-50 group">
              <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{a.wbs_code ?? '—'}</td>
              <td className="px-4 py-2.5 text-gray-800">
                <div className="flex items-center gap-1.5">
                  {a.is_critical && <span className="w-1 h-3 rounded bg-red-500" />}
                  {a.name}
                </div>
              </td>
              <td className="px-4 py-2.5 text-gray-500 text-xs">{a.trade ?? '—'}</td>
              <td className="px-4 py-2.5 text-gray-500 text-xs">{a.planned_start}</td>
              <td className="px-4 py-2.5 text-gray-500 text-xs">{a.planned_end}</td>
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div className={`h-full ${cfg.bar}`} style={{ width: `${a.progress}%` }} />
                  </div>
                  <span className="text-xs font-medium text-gray-600 w-9 text-right">{a.progress}%</span>
                </div>
              </td>
              <td className="px-4 py-2.5">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.badge}`}>{cfg.label}</span>
              </td>
              <td className="px-4 py-2.5 text-gray-500 text-xs">{a.assignee ?? '—'}</td>
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onEdit(a)} className="p-1 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => onDelete(a.id)} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

// ---------------------------------------------------------------------------

interface ActivityDialogProps {
  mode: 'add' | 'edit'
  initial: Activity | null
  projectId: string
  onClose: () => void
  onSubmit: (data: {
    wbs_code?: string
    name: string
    trade?: string
    planned_start: string
    planned_end: string
    actual_start?: string
    actual_end?: string
    progress: number
    status: ActivityStatus
    is_critical: boolean
    assignee?: string
  }) => void
  loading: boolean
  error: string | null
}

function ActivityDialog({ mode, initial, onClose, onSubmit, loading, error }: ActivityDialogProps) {
  const [wbs, setWbs]           = useState(initial?.wbs_code ?? '')
  const [name, setName]         = useState(initial?.name ?? '')
  const [trade, setTrade]       = useState(initial?.trade ?? '')
  const [plannedStart, setPlannedStart] = useState(initial?.planned_start ?? '')
  const [plannedEnd, setPlannedEnd]     = useState(initial?.planned_end ?? '')
  const [actualStart, setActualStart]   = useState(initial?.actual_start ?? '')
  const [actualEnd, setActualEnd]       = useState(initial?.actual_end ?? '')
  const [progress, setProgress]         = useState(String(initial?.progress ?? '0'))
  const [status, setStatusVal]          = useState<ActivityStatus>(initial?.status ?? 'not_started')
  const [isCritical, setIsCritical]     = useState(initial?.is_critical ?? false)
  const [assignee, setAssignee]         = useState(initial?.assignee ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({
      wbs_code: wbs || undefined,
      name,
      trade: trade || undefined,
      planned_start: plannedStart,
      planned_end: plannedEnd,
      actual_start: actualStart || undefined,
      actual_end: actualEnd || undefined,
      progress: Number(progress),
      status,
      is_critical: isCritical,
      assignee: assignee || undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{mode === 'add' ? 'Add Activity' : 'Edit Activity'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="WBS Code">
              <input className={inp} value={wbs} onChange={(e) => setWbs(e.target.value)} placeholder="1.1.2" />
            </Field>
            <Field label="Trade">
              <select className={inp} value={trade} onChange={(e) => setTrade(e.target.value)}>
                <option value="">— None —</option>
                {TRADES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Activity name *">
            <input
              className={inp}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Foundation Concrete Pour"
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Planned start *">
              <input type="date" className={inp} value={plannedStart} onChange={(e) => setPlannedStart(e.target.value)} required />
            </Field>
            <Field label="Planned end *">
              <input type="date" className={inp} value={plannedEnd} onChange={(e) => setPlannedEnd(e.target.value)} required />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Actual start">
              <input type="date" className={inp} value={actualStart} onChange={(e) => setActualStart(e.target.value)} />
            </Field>
            <Field label="Actual end">
              <input type="date" className={inp} value={actualEnd} onChange={(e) => setActualEnd(e.target.value)} />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Progress (%)">
              <input
                type="number" min="0" max="100" className={inp}
                value={progress} onChange={(e) => setProgress(e.target.value)}
              />
            </Field>
            <Field label="Status">
              <select className={inp} value={status} onChange={(e) => setStatusVal(e.target.value as ActivityStatus)}>
                {STATUS_OPTS.map((s) => <option key={s} value={s}>{STATUS_CFG[s].label}</option>)}
              </select>
            </Field>
            <Field label="Assignee">
              <input className={inp} value={assignee} onChange={(e) => setAssignee(e.target.value)} placeholder="Name" />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={isCritical} onChange={(e) => setIsCritical(e.target.checked)} className="rounded border-gray-300" />
            On critical path
          </label>

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
              {mode === 'add' ? 'Add Activity' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const inp = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  )
}
