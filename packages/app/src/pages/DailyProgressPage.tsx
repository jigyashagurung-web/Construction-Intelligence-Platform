import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, Plus, Loader2, NotebookPen, Pencil, Trash2, X,
  Users, Truck, AlertTriangle, ChevronDown, Cloud, CloudRain,
  CloudFog, CloudLightning, Sun,
} from 'lucide-react'
import {
  fetchDailyProgress, createDailyProgressEntry, updateDailyProgressEntry, deleteDailyProgressEntry,
} from '@/api/dailyProgress'
import { fetchActivities } from '@/api/activities'
import { fetchProject } from '@/api/projects'
import type { DailyProgressEntry, Weather } from '@/types'

const WEATHER_OPTS: Weather[] = ['sunny', 'cloudy', 'rainy', 'stormy', 'foggy']

const WEATHER_CFG: Record<Weather, { label: string; icon: React.ReactNode }> = {
  sunny:  { label: 'Sunny',  icon: <Sun size={13} className="text-yellow-500" /> },
  cloudy: { label: 'Cloudy', icon: <Cloud size={13} className="text-gray-400" /> },
  rainy:  { label: 'Rainy',  icon: <CloudRain size={13} className="text-blue-500" /> },
  stormy: { label: 'Stormy', icon: <CloudLightning size={13} className="text-purple-500" /> },
  foggy:  { label: 'Foggy',  icon: <CloudFog size={13} className="text-gray-400" /> },
}

const today = () => new Date().toISOString().slice(0, 10)

export function DailyProgressPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [activityFilter, setActivityFilter] = useState('All')
  const [dialog, setDialog]   = useState<'add' | 'edit' | null>(null)
  const [editing, setEditing] = useState<DailyProgressEntry | null>(null)

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => fetchProject(projectId!),
    enabled: !!projectId,
  })

  const { data: activities = [] } = useQuery({
    queryKey: ['activities', projectId],
    queryFn: () => fetchActivities(projectId!),
    enabled: !!projectId,
  })

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['daily_progress', projectId],
    queryFn: () => fetchDailyProgress(projectId!),
    enabled: !!projectId,
  })

  const createMut = useMutation({
    mutationFn: createDailyProgressEntry,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['daily_progress', projectId] }); setDialog(null) },
  })

  const updateMut = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Parameters<typeof updateDailyProgressEntry>[1] }) =>
      updateDailyProgressEntry(id, patch),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['daily_progress', projectId] }); setDialog(null) },
  })

  const deleteMut = useMutation({
    mutationFn: deleteDailyProgressEntry,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['daily_progress', projectId] }),
  })

  const filtered = entries.filter(
    (e) => activityFilter === 'All' || e.activity_id === activityFilter
  )

  const todayEntries   = entries.filter((e) => e.entry_date === today())
  const todayLabour    = todayEntries.reduce((s, e) => s + e.labour_count, 0)
  const todayEquipment = todayEntries.reduce((s, e) => s + e.equipment_count, 0)
  const openIssues     = entries.filter((e) => e.issues && e.issues.trim().length > 0).length

  function openEdit(e: DailyProgressEntry) {
    setEditing(e)
    setDialog('edit')
  }

  function handleDelete(id: string) {
    if (confirm('Delete this diary entry?')) deleteMut.mutate(id)
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
              <NotebookPen size={18} className="text-orange-600" />
              Daily Progress
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {entries.length} diary entr{entries.length !== 1 ? 'ies' : 'y'}
            </p>
          </div>
          <button
            onClick={() => { setEditing(null); setDialog('add') }}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3.5 py-2 rounded-lg transition-colors"
          >
            <Plus size={15} />
            Log Entry
          </button>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Kpi label="Labour Today" value={todayLabour} icon={<Users size={15} className="text-blue-500" />} />
          <Kpi label="Equipment Today" value={todayEquipment} icon={<Truck size={15} className="text-blue-500" />} />
          <Kpi label="Entries with Issues" value={openIssues} icon={<AlertTriangle size={15} className={openIssues > 0 ? 'text-red-500' : 'text-gray-400'} />} warn={openIssues > 0} />
        </div>

        {/* Toolbar */}
        <div className="relative w-56">
          <select
            value={activityFilter}
            onChange={(e) => setActivityFilter(e.target.value)}
            className="w-full appearance-none pl-3 pr-7 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="All">All activities</option>
            {activities.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={22} className="animate-spin text-gray-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <NotebookPen size={36} className="text-gray-200 mb-3" />
            <p className="text-sm text-gray-500">
              {entries.length === 0 ? 'No diary entries yet.' : 'No entries match your filter.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr className="text-xs text-gray-500 font-medium">
                <th className="px-4 py-2.5 text-left w-28">Date</th>
                <th className="px-4 py-2.5 text-left w-40">Activity</th>
                <th className="px-4 py-2.5 text-left w-24">Weather</th>
                <th className="px-4 py-2.5 text-right w-20">Labour</th>
                <th className="px-4 py-2.5 text-right w-24">Equipment</th>
                <th className="px-4 py-2.5 text-left">Work Done</th>
                <th className="px-4 py-2.5 text-left">Issues</th>
                <th className="px-4 py-2.5 w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50 group align-top">
                  <td className="px-4 py-2.5 text-xs text-gray-500 whitespace-nowrap">{e.entry_date}</td>
                  <td className="px-4 py-2.5 text-gray-800 text-xs">{e.activity?.name ?? '—'}</td>
                  <td className="px-4 py-2.5">
                    {e.weather ? (
                      <span className="flex items-center gap-1 text-xs text-gray-600">
                        {WEATHER_CFG[e.weather].icon}
                        {WEATHER_CFG[e.weather].label}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-gray-700">{e.labour_count}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-gray-700">{e.equipment_count}</td>
                  <td className="px-4 py-2.5 text-gray-600 text-xs max-w-xs">{e.work_done}</td>
                  <td className="px-4 py-2.5 text-xs max-w-xs">
                    {e.issues ? <span className="text-red-500">{e.issues}</span> : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(e)} className="p-1 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleDelete(e.id)} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit dialog */}
      {dialog && (
        <EntryDialog
          mode={dialog}
          initial={editing}
          activities={activities}
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

interface EntryDialogProps {
  mode: 'add' | 'edit'
  initial: DailyProgressEntry | null
  activities: { id: string; name: string }[]
  onClose: () => void
  onSubmit: (data: {
    activity_id?: string
    entry_date: string
    weather?: Weather
    labour_count: number
    equipment_count: number
    work_done: string
    issues?: string
  }) => void
  loading: boolean
  error: string | null
}

function EntryDialog({ mode, initial, activities, onClose, onSubmit, loading, error }: EntryDialogProps) {
  const [activityId, setActivityId] = useState(initial?.activity_id ?? '')
  const [entryDate, setEntryDate]   = useState(initial?.entry_date ?? today())
  const [weather, setWeather]       = useState<Weather | ''>(initial?.weather ?? '')
  const [labour, setLabour]         = useState(String(initial?.labour_count ?? '0'))
  const [equipment, setEquipment]   = useState(String(initial?.equipment_count ?? '0'))
  const [workDone, setWorkDone]     = useState(initial?.work_done ?? '')
  const [issues, setIssues]         = useState(initial?.issues ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({
      activity_id: activityId || undefined,
      entry_date: entryDate,
      weather: weather || undefined,
      labour_count: Number(labour),
      equipment_count: Number(equipment),
      work_done: workDone,
      issues: issues || undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{mode === 'add' ? 'Log Daily Progress' : 'Edit Entry'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date *">
              <input type="date" className={inp} value={entryDate} onChange={(e) => setEntryDate(e.target.value)} required />
            </Field>
            <Field label="Activity">
              <select className={inp} value={activityId} onChange={(e) => setActivityId(e.target.value)}>
                <option value="">— None —</option>
                {activities.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Weather">
              <select className={inp} value={weather} onChange={(e) => setWeather(e.target.value as Weather | '')}>
                <option value="">— None —</option>
                {WEATHER_OPTS.map((w) => <option key={w} value={w}>{WEATHER_CFG[w].label}</option>)}
              </select>
            </Field>
            <Field label="Labour count">
              <input type="number" min="0" className={inp} value={labour} onChange={(e) => setLabour(e.target.value)} />
            </Field>
            <Field label="Equipment count">
              <input type="number" min="0" className={inp} value={equipment} onChange={(e) => setEquipment(e.target.value)} />
            </Field>
          </div>

          <Field label="Work done *">
            <textarea
              className={`${inp} h-20 resize-none`}
              value={workDone}
              onChange={(e) => setWorkDone(e.target.value)}
              placeholder="e.g. Completed 40 m² of brickwork on Block A, 3rd floor"
              required
            />
          </Field>

          <Field label="Issues / delays">
            <textarea
              className={`${inp} h-16 resize-none`}
              value={issues}
              onChange={(e) => setIssues(e.target.value)}
              placeholder="Optional — e.g. material shortage, weather delay"
            />
          </Field>

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
              {mode === 'add' ? 'Log Entry' : 'Save Changes'}
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
