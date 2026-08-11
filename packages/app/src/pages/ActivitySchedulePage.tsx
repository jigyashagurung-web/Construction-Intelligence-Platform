import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, Plus, Loader2, Pencil, Trash2, X, GanttChartSquare,
  List, TrendingUp, CheckCircle2, Clock, AlertTriangle, ChevronDown, Lock,
} from 'lucide-react'
import {
  fetchActivities, createActivity, updateActivity, deleteActivity,
} from '@/api/activities'
import { fetchProject } from '@/api/projects'
import { fetchBOQItems } from '@/api/boq'
import { useAuthStore } from '@/store/authStore'
import type { Activity, ActivityStatus, BOQItem } from '@/types'

// Mirrors the role checks in the activities RLS policies
// (supabase/migrations/004_activities.sql) — keep in sync.
const CAN_CREATE_ROLES = ['admin', 'project_manager', 'qty_surveyor']
const CAN_UPDATE_ROLES = ['admin', 'project_manager', 'qty_surveyor', 'site_engineer']
const CAN_DELETE_ROLES = ['admin', 'project_manager']

const STATUS_OPTS: ActivityStatus[] = ['not_started', 'on_track', 'at_risk', 'delayed', 'complete']

const STATUS_CFG: Record<ActivityStatus, { label: string; badge: string; bar: string }> = {
  not_started: { label: 'Not Started', badge: 'bg-gray-100 text-gray-500',    bar: 'bg-gray-300' },
  on_track:    { label: 'On Track',    badge: 'bg-blue-100 text-blue-700',    bar: 'bg-blue-500' },
  at_risk:     { label: 'At Risk',     badge: 'bg-yellow-100 text-yellow-700', bar: 'bg-yellow-500' },
  delayed:     { label: 'Delayed',     badge: 'bg-red-100 text-red-600',      bar: 'bg-red-500' },
  complete:    { label: 'Complete',    badge: 'bg-green-100 text-green-700',  bar: 'bg-green-500' },
}

const dayDiff = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000)

// Actual dates are derived from the Daily Log (see 018_activity_actual_dates_derived.sql),
// except when actual_end_source is 'manual' — stamped when an activity is marked complete
// ahead of (or without) a diary-derived completion date.
function actualDateTooltip(a: Activity): string {
  const start = a.actual_start ?? '—'
  if (!a.actual_end) return `Actual: ${start} → not yet complete`
  const suffix = a.actual_end_source === 'manual'
    ? 'set manually on completion'
    : 'derived from logs — may shift if diary entries change'
  return `Actual: ${start} → ${a.actual_end} (${suffix})`
}

export function ActivitySchedulePage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const profile = useAuthStore((s) => s.profile)
  const canCreate = !!profile && CAN_CREATE_ROLES.includes(profile.role)
  const canUpdate = !!profile && CAN_UPDATE_ROLES.includes(profile.role)
  const canDelete = !!profile && CAN_DELETE_ROLES.includes(profile.role)

  const [view, setView]           = useState<'gantt' | 'table'>('gantt')
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

  const { data: boqItems = [] } = useQuery({
    queryKey: ['boq_items', projectId],
    queryFn: () => fetchBOQItems(projectId!),
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

  const boqItemById = useMemo(() => new Map(boqItems.map((b) => [b.id, b])), [boqItems])

  const filtered = activities.filter((a) => statusFilter === 'All' || a.status === statusFilter)

  const complete = activities.filter((a) => a.status === 'complete').length
  const onTrack  = activities.filter((a) => a.status === 'on_track').length
  const atRisk   = activities.filter((a) => a.status === 'at_risk' || a.status === 'delayed').length
  const overallPct = activities.length
    ? Math.round(activities.reduce((s, a) => s + a.progress, 0) / activities.length)
    : 0

  function openEdit(a: Activity) {
    if (!canUpdate) return
    setEditing(a)
    setDialog('edit')
  }

  function handleDelete(id: string) {
    if (!canDelete) return
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
            disabled={!canCreate}
            title={canCreate ? undefined : "Your role can't create activities — ask an admin or PM."}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium px-3.5 py-2 rounded-lg transition-colors"
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
          <GanttView activities={filtered} boqItemById={boqItemById} onRowClick={openEdit} canUpdate={canUpdate} />
        ) : (
          <TableView activities={filtered} boqItemById={boqItemById} onEdit={openEdit} onDelete={handleDelete} canUpdate={canUpdate} canDelete={canDelete} />
        )}
      </div>

      {/* Add / Edit dialog */}
      {dialog && (
        <ActivityDialog
          mode={dialog}
          initial={editing}
          projectId={projectId!}
          boqItems={boqItems}
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

function GanttView({
  activities, boqItemById, onRowClick, canUpdate,
}: {
  activities: Activity[]
  boqItemById: Map<string, BOQItem>
  onRowClick: (a: Activity) => void
  canUpdate: boolean
}) {
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
          const boq = boqItemById.get(a.boq_item_id)
          const planLeft  = (dayDiff(rangeStart, a.planned_start) / totalDays) * 100
          const planWidth = Math.max((dayDiff(a.planned_start, a.planned_end) / totalDays) * 100, 1)
          return (
            <button
              key={a.id}
              onClick={() => onRowClick(a)}
              disabled={!canUpdate}
              title={canUpdate ? undefined : "Your role can't edit activities."}
              className={`flex items-center w-full text-left border-b border-gray-100 last:border-b-0 transition-colors ${i % 2 ? 'bg-gray-50/50' : ''} ${
                canUpdate ? 'hover:bg-gray-50' : 'cursor-not-allowed opacity-60'
              }`}
            >
              <div className="w-56 flex-shrink-0 px-3 py-2.5 min-w-0">
                <div className="flex items-center gap-1.5">
                  {a.is_critical && <span className="w-1 h-3 rounded bg-red-500 flex-shrink-0" />}
                  <p className="text-xs font-medium text-gray-900 truncate">{a.name}</p>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                  {boq ? `${boq.wbs_code ? `${boq.wbs_code} · ` : ''}${[boq.chapter, boq.section].filter(Boolean).join(' / ') || '—'}` : '—'}
                </p>
              </div>
              <div className="flex-1 relative h-10 mx-3">
                {todayPct != null && (
                  <div className="absolute top-0 bottom-0 w-px bg-red-400 z-10" style={{ left: `${todayPct}%` }} />
                )}
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-4 rounded bg-gray-100 border border-gray-200"
                  style={{ left: `${planLeft}%`, width: `${planWidth}%` }}
                  title={actualDateTooltip(a)}
                >
                  <div
                    className={`h-full rounded-l ${a.status === 'not_started' ? 'bg-gray-300' : cfg.bar}`}
                    style={{ width: `${a.progress}%` }}
                  />
                </div>
              </div>
              <div className="w-16 flex-shrink-0 pr-3 text-right">
                <span
                  className={`text-xs font-semibold inline-flex items-center gap-1 justify-end ${a.status === 'not_started' ? 'text-gray-400' : 'text-gray-700'}`}
                  title={a.boq_item_id ? 'Auto-calculated from logged Quantity Consumed' : undefined}
                >
                  {a.boq_item_id && <Lock size={9} className="text-gray-400" />}
                  {a.progress}%
                </span>
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
  activities, boqItemById, onEdit, onDelete, canUpdate, canDelete,
}: {
  activities: Activity[]
  boqItemById: Map<string, BOQItem>
  onEdit: (a: Activity) => void
  onDelete: (id: string) => void
  canUpdate: boolean
  canDelete: boolean
}) {
  return (
    <table className="w-full text-sm">
      <thead className="bg-gray-50 sticky top-0 z-10">
        <tr className="text-xs text-gray-500 font-medium">
          <th className="px-4 py-2.5 text-left w-24">WBS</th>
          <th className="px-4 py-2.5 text-left">Activity</th>
          <th className="px-4 py-2.5 text-left w-40">Chapter / Section</th>
          <th className="px-4 py-2.5 text-left w-28">Plan Start</th>
          <th className="px-4 py-2.5 text-left w-28">Plan End</th>
          <th className="px-4 py-2.5 text-left w-28">Actual Start</th>
          <th className="px-4 py-2.5 text-left w-32">Actual End</th>
          <th className="px-4 py-2.5 text-left w-36">Progress</th>
          <th className="px-4 py-2.5 text-left w-28">Status</th>
          <th className="px-4 py-2.5 text-left w-32">Assignee</th>
          <th className="px-4 py-2.5 w-16" />
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {activities.map((a) => {
          const cfg = STATUS_CFG[a.status]
          const boq = boqItemById.get(a.boq_item_id)
          return (
            <tr key={a.id} className="hover:bg-gray-50 group">
              <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{boq?.wbs_code ?? '—'}</td>
              <td className="px-4 py-2.5 text-gray-800">
                <div className="flex items-center gap-1.5">
                  {a.is_critical && <span className="w-1 h-3 rounded bg-red-500" />}
                  {a.name}
                </div>
              </td>
              <td className="px-4 py-2.5 text-gray-500 text-xs">{[boq?.chapter, boq?.section].filter(Boolean).join(' / ') || '—'}</td>
              <td className="px-4 py-2.5 text-gray-500 text-xs">{a.planned_start}</td>
              <td className="px-4 py-2.5 text-gray-500 text-xs">{a.planned_end}</td>
              <td className="px-4 py-2.5 text-gray-500 text-xs" title={a.actual_start ? 'Derived from Daily Log entries' : undefined}>
                {a.actual_start ?? '—'}
              </td>
              <td className="px-4 py-2.5 text-xs">
                {a.actual_end ? (
                  <span
                    className="inline-flex items-center gap-1 text-gray-500"
                    title={
                      a.actual_end_source === 'manual'
                        ? 'Set manually on completion'
                        : 'Derived from logs — may adjust if diary entries are added or edited later'
                    }
                  >
                    {a.actual_end}
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        a.actual_end_source === 'manual' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {a.actual_end_source === 'manual' ? 'manual' : 'derived'}
                    </span>
                  </span>
                ) : (
                  <span className="text-gray-300">—</span>
                )}
              </td>
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div className={`h-full ${cfg.bar}`} style={{ width: `${a.progress}%` }} />
                  </div>
                  <span
                    className="text-xs font-medium text-gray-600 w-12 text-right inline-flex items-center gap-1 justify-end"
                    title={a.boq_item_id ? 'Auto-calculated from logged Quantity Consumed' : undefined}
                  >
                    {a.boq_item_id && <Lock size={9} className="text-gray-400" />}
                    {a.progress}%
                  </span>
                </div>
              </td>
              <td className="px-4 py-2.5">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.badge}`}>{cfg.label}</span>
              </td>
              <td className="px-4 py-2.5 text-gray-500 text-xs">{a.assignee ?? '—'}</td>
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit(a)}
                    disabled={!canUpdate}
                    title={canUpdate ? undefined : "Your role can't edit activities."}
                    className="p-1 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600 disabled:hover:bg-transparent disabled:text-gray-200 disabled:cursor-not-allowed transition-colors"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => onDelete(a.id)}
                    disabled={!canDelete}
                    title={canDelete ? undefined : "Your role can't delete activities."}
                    className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 disabled:hover:bg-transparent disabled:text-gray-200 disabled:cursor-not-allowed transition-colors"
                  >
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
  boqItems: BOQItem[]
  onClose: () => void
  onSubmit: (data: {
    name: string
    boq_item_id: string
    planned_start: string
    planned_end: string
    status: ActivityStatus
    is_critical: boolean
    assignee?: string
  }) => void
  loading: boolean
  error: string | null
}

function ActivityDialog({ mode, initial, boqItems, onClose, onSubmit, loading, error }: ActivityDialogProps) {
  const [name, setName]         = useState(initial?.name ?? '')
  const [boqItemId, setBoqItemId] = useState(initial?.boq_item_id ?? '')
  const [plannedStart, setPlannedStart] = useState(initial?.planned_start ?? '')
  const [plannedEnd, setPlannedEnd]     = useState(initial?.planned_end ?? '')
  const [status, setStatusVal]          = useState<ActivityStatus>(initial?.status ?? 'not_started')
  const [isCritical, setIsCritical]     = useState(initial?.is_critical ?? false)
  const [assignee, setAssignee]         = useState(initial?.assignee ?? '')

  // Every activity requires a BOQ item link — progress always comes from
  // the auto-calculation trigger (007_quantity_consumed.sql), never manual entry.
  const canSubmit = !!boqItemId && !!name && !!plannedStart && !!plannedEnd

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    onSubmit({
      name,
      boq_item_id: boqItemId,
      planned_start: plannedStart,
      planned_end: plannedEnd,
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
          <Field label="BOQ Item *">
            <BoqItemPicker boqItems={boqItems} value={boqItemId} onSelect={(id) => setBoqItemId(id ?? '')} />
            <p className="text-xs text-gray-400 mt-1">
              Progress is auto-calculated from logged Quantity Consumed against this item's quantity.
            </p>
          </Field>

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

          {mode === 'edit' && initial && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Actual start">
                <div
                  className={`${inp} bg-gray-50 text-gray-500 flex items-center`}
                  title={initial.actual_start ? 'Derived from Daily Log entries' : undefined}
                >
                  {initial.actual_start ?? '—'}
                </div>
              </Field>
              <Field label="Actual end">
                <div
                  className={`${inp} bg-gray-50 text-gray-500 flex items-center gap-1.5`}
                  title={
                    initial.actual_end
                      ? initial.actual_end_source === 'manual'
                        ? 'Set manually on completion'
                        : 'Derived from logs — may adjust if diary entries are added or edited later'
                      : undefined
                  }
                >
                  {initial.actual_end ?? '—'}
                  {initial.actual_end && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        initial.actual_end_source === 'manual' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {initial.actual_end_source === 'manual' ? 'manual' : 'derived'}
                    </span>
                  )}
                </div>
              </Field>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <Field label="Progress (%)">
              <div
                className={`${inp} bg-gray-50 text-gray-500 flex items-center`}
                title="Auto-calculated from logged Quantity Consumed."
              >
                {initial?.boq_item_id === boqItemId ? initial.progress : 0}% (auto)
              </div>
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
              disabled={loading || !canSubmit}
              title={canSubmit ? undefined : 'Select a BOQ item to continue'}
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

// ---------------------------------------------------------------------------

interface BoqItemPickerProps {
  boqItems: BOQItem[]
  /** Currently selected BOQ item id, if any (controlled by the parent form). */
  value?: string
  /** Fires with a BOQ item id once one is picked, or undefined when cleared. */
  onSelect: (id: string | undefined) => void
}

/** Searchable single-select over the project's existing BOQ items, replacing
 * the old flat <select> — an activity links to an actual boq_items row (with
 * its own resolved catalog code/quantity), not a boq_code_catalog code directly. */
function BoqItemPicker({ boqItems, value, onSelect }: BoqItemPickerProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen]   = useState(false)

  const selected = boqItems.find((b) => b.id === value)

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return boqItems
    return boqItems.filter((b) => `${b.wbs_code ?? ''} ${b.description}`.toLowerCase().includes(q))
  }, [query, boqItems])

  if (selected) {
    return (
      <div className="flex items-center justify-between gap-2 border border-gray-200 rounded-lg bg-gray-50 px-3 py-2">
        <div className="min-w-0">
          <p className="text-xs font-mono text-gray-500">{selected.wbs_code ?? '—'}</p>
          <p className="text-sm text-gray-800 truncate">{selected.description}</p>
        </div>
        <button
          type="button"
          onClick={() => onSelect(undefined)}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
          aria-label="Clear selected BOQ item"
        >
          <X size={14} />
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <input
        className={inp}
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Search BOQ items by WBS code or description…"
        autoComplete="off"
      />
      {open && matches.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full max-h-64 overflow-auto bg-white border border-gray-200 rounded-lg shadow-lg text-xs">
          {matches.map((b) => (
            <li key={b.id}>
              <button
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-blue-50"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { onSelect(b.id); setQuery(''); setOpen(false) }}
              >
                <span className="font-mono text-gray-500">{b.wbs_code ?? '—'}</span>
                <span className="text-gray-800"> — {b.description} ({b.quantity} {b.unit ?? ''})</span>
              </button>
            </li>
          ))}
        </ul>
      )}
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
