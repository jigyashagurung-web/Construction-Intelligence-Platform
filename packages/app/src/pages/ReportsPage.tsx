import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft, Loader2, BarChart3, TrendingUp, Image as ImageIcon, ChevronDown, AlertTriangle,
} from 'lucide-react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar,
} from 'recharts'
import { fetchProject } from '@/api/projects'
import { fetchActivities } from '@/api/activities'
import { fetchDailyRollup, fetchProgressCurve, fetchProgressPhotos } from '@/api/reports'
import { getProgressPhotoUrl } from '@/api/dailyProgress'
import type { DailyProgressRollup } from '@/types'

type ProgressPhotoWithEntry = Awaited<ReturnType<typeof fetchProgressPhotos>>[number]

type Tab = 'summary' | 'scurve' | 'photos'
type Granularity = 'day' | 'week' | 'month'

const today = () => new Date().toISOString().slice(0, 10)
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10)

function isoWeekStart(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z')
  const day = (d.getUTCDay() + 6) % 7 // Monday = 0
  d.setUTCDate(d.getUTCDate() - day)
  return d.toISOString().slice(0, 10)
}

function bucketRollup(rows: DailyProgressRollup[], granularity: Granularity) {
  if (granularity === 'day') {
    return rows.map((r) => ({ bucket: r.entry_date, ...r }))
  }
  const buckets = new Map<string, { bucket: string; quantity_consumed: number; labour_count: number; equipment_count: number; entries: number }>()
  for (const r of rows) {
    const key = granularity === 'week' ? isoWeekStart(r.entry_date) : r.entry_date.slice(0, 7)
    const existing = buckets.get(key) ?? { bucket: key, quantity_consumed: 0, labour_count: 0, equipment_count: 0, entries: 0 }
    existing.quantity_consumed += r.quantity_consumed
    existing.labour_count += r.labour_count
    existing.equipment_count += r.equipment_count
    existing.entries += r.entries
    buckets.set(key, existing)
  }
  return Array.from(buckets.values()).sort((a, b) => a.bucket.localeCompare(b.bucket))
}

export function ReportsPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('summary')

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => fetchProject(projectId!),
    enabled: !!projectId,
  })

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <button
          onClick={() => navigate(`/projects/${projectId}`)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-2 transition-colors"
        >
          <ArrowLeft size={14} />
          {project?.name ?? 'Project'}
        </button>

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 size={18} className="text-blue-600" />
            Reports
          </h1>
        </div>

        <div className="flex border border-gray-200 rounded-lg overflow-hidden w-fit">
          {([
            { v: 'summary' as const, icon: <BarChart3 size={14} />, label: 'Summary' },
            { v: 'scurve' as const, icon: <TrendingUp size={14} />, label: 'S-curve' },
            { v: 'photos' as const, icon: <ImageIcon size={14} />, label: 'Photos' },
          ]).map(({ v, icon, label }) => (
            <button
              key={v}
              onClick={() => setTab(v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                tab === v ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {icon}{label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {tab === 'summary' && projectId && <SummaryTab projectId={projectId} />}
        {tab === 'scurve' && projectId && <SCurveTab projectId={projectId} />}
        {tab === 'photos' && projectId && <PhotosTab projectId={projectId} />}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

function EmptyState({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      {icon}
      <p className="text-sm text-gray-500 mt-3">{label}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------

function SummaryTab({ projectId }: { projectId: string }) {
  const [from, setFrom] = useState(daysAgo(30))
  const [to, setTo] = useState(today())
  const [granularity, setGranularity] = useState<Granularity>('week')

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['daily_rollup', projectId, from, to],
    queryFn: () => fetchDailyRollup(projectId, { from, to }),
  })

  const bucketed = useMemo(() => bucketRollup(rows, granularity), [rows, granularity])

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 flex-wrap mb-5">
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inp} />
        <span className="text-xs text-gray-400">to</span>
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inp} />
        <div className="relative ml-2">
          <select
            value={granularity}
            onChange={(e) => setGranularity(e.target.value as Granularity)}
            className="appearance-none pl-3 pr-7 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 size={22} className="animate-spin text-gray-400" /></div>
      ) : bucketed.length === 0 ? (
        <EmptyState icon={<BarChart3 size={36} className="text-gray-200" />} label="No diary entries in this date range." />
      ) : (
        <>
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bucketed} barCategoryGap={2}>
                <CartesianGrid strokeDasharray="0" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={40} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                  labelFormatter={(v) => `Period: ${v}`}
                />
                <Bar dataKey="quantity_consumed" name="Quantity consumed" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <table className="w-full text-sm bg-white border border-gray-200 rounded-xl overflow-hidden">
            <thead className="bg-gray-50">
              <tr className="text-xs text-gray-500 font-medium">
                <th className="px-4 py-2.5 text-left">Period</th>
                <th className="px-4 py-2.5 text-right">Entries</th>
                <th className="px-4 py-2.5 text-right">Qty Consumed</th>
                <th className="px-4 py-2.5 text-right">Labour</th>
                <th className="px-4 py-2.5 text-right">Equipment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bucketed.map((b) => (
                <tr key={b.bucket} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-gray-800 text-xs">{b.bucket}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-gray-600">{b.entries}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-gray-600">{b.quantity_consumed}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-gray-600">{b.labour_count}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-gray-600">{b.equipment_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------

function SCurveTab({ projectId }: { projectId: string }) {
  const { data: curve = [], isLoading } = useQuery({
    queryKey: ['progress_curve', projectId],
    queryFn: () => fetchProgressCurve(projectId),
  })

  const { data: activities = [] } = useQuery({
    queryKey: ['activities', projectId],
    queryFn: () => fetchActivities(projectId),
  })

  const unweightedCount = activities.filter((a) => !a.boq_item_id).length

  return (
    <div className="p-6">
      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 size={22} className="animate-spin text-gray-400" /></div>
      ) : curve.length === 0 ? (
        <EmptyState icon={<TrendingUp size={36} className="text-gray-200" />} label="No activities to plot yet." />
      ) : (
        <>
          {unweightedCount > 0 && (
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 mb-4">
              <AlertTriangle size={13} className="text-gray-400 flex-shrink-0" />
              {unweightedCount} of {activities.length} activities have no BOQ item link — they contribute an equal-share
              estimated weight to this curve rather than a quantity-derived one.
            </div>
          )}
          <div className="bg-white border border-gray-200 rounded-xl p-4" style={{ height: 360 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={curve}>
                <CartesianGrid strokeDasharray="0" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="entry_date" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} tickLine={false} minTickGap={40} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={40} domain={[0, 100]} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="planned_pct" name="Planned %" stroke="#6b7280" strokeWidth={2} strokeDasharray="4 3" dot={false} />
                <Line type="monotone" dataKey="actual_pct" name="Actual %" stroke="#2563eb" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------

function PhotosTab({ projectId }: { projectId: string }) {
  const [activityFilter, setActivityFilter] = useState('All')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const { data: activities = [] } = useQuery({
    queryKey: ['activities', projectId],
    queryFn: () => fetchActivities(projectId),
  })

  const { data: photos = [], isLoading } = useQuery({
    queryKey: ['progress_photos', projectId, activityFilter, from, to],
    queryFn: () => fetchProgressPhotos(projectId, {
      activityId: activityFilter === 'All' ? undefined : activityFilter,
      range: from && to ? { from, to } : undefined,
    }),
  })

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 flex-wrap mb-5">
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
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inp} />
        <span className="text-xs text-gray-400">to</span>
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inp} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 size={22} className="animate-spin text-gray-400" /></div>
      ) : photos.length === 0 ? (
        <EmptyState icon={<ImageIcon size={36} className="text-gray-200" />} label="No progress photos logged yet." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((p) => (
            <PhotoThumb key={p.id} photo={p} activityName={activities.find((a) => a.id === p.entry.activity_id)?.name} />
          ))}
        </div>
      )}
    </div>
  )
}

function PhotoThumb({ photo, activityName }: { photo: ProgressPhotoWithEntry; activityName?: string }) {
  const { data: url } = useQuery({
    queryKey: ['photo_url', photo.id],
    queryFn: () => getProgressPhotoUrl(photo.storage_path),
  })

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
      <div className="aspect-square bg-gray-50 flex items-center justify-center">
        {url ? (
          <img src={url} alt={photo.caption ?? 'Progress photo'} className="w-full h-full object-cover" />
        ) : (
          <Loader2 size={16} className="animate-spin text-gray-300" />
        )}
      </div>
      <div className="px-2 py-1.5">
        <p className="text-[11px] text-gray-500 truncate">{activityName ?? '—'}</p>
        <p className="text-[10px] text-gray-400">{photo.entry.entry_date}</p>
      </div>
    </div>
  )
}

const inp = 'px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white'
