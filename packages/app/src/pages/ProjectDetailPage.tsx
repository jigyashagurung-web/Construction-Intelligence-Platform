import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft, Loader2, MapPin, CalendarDays, DollarSign,
  ClipboardList, Package, BarChart3, GanttChartSquare, NotebookPen,
  CheckCircle2, XCircle,
} from 'lucide-react'
import { fetchProject } from '@/api/projects'
import { fetchProjectEvm } from '@/api/reports'
import { computeEvmMetrics } from '@/lib/evm'
import { PROJECT_STATUS_COLOR } from '@/lib/projectStatus'
import { ModuleCard } from '@/components/ModuleCard'

const fmt = new Intl.NumberFormat('en-NP', { maximumFractionDigits: 0 })

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => fetchProject(projectId!),
    enabled: !!projectId,
  })

  const { data: evm } = useQuery({
    queryKey: ['project_evm', projectId],
    queryFn: () => fetchProjectEvm(projectId!),
    enabled: !!projectId,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="p-6">
        <p className="text-red-500 text-sm">Failed to load project.</p>
        <button onClick={() => navigate('/')} className="mt-2 text-blue-600 text-sm hover:underline">
          Go back
        </button>
      </div>
    )
  }

  const s = PROJECT_STATUS_COLOR[project.status]
  const m = evm && evm.bac > 0 ? computeEvmMetrics(evm) : null

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4 transition-colors"
      >
        <ArrowLeft size={14} />
        Projects
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-gray-400">{project.code}</span>
            <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-medium ${s.bg} ${s.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
              {project.status.replace('_', ' ')}
            </span>
            {m && (
              <>
                <EvmBadge ok={m.spi === null ? null : m.spi >= 1} okLabel="On schedule" badLabel="Behind schedule" />
                <EvmBadge ok={m.cpi === null ? null : m.cpi >= 1} okLabel="On budget" badLabel="Over budget" title="Based on material cost only" />
              </>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          {project.description && (
            <p className="text-sm text-gray-500 mt-1 max-w-xl">{project.description}</p>
          )}
        </div>
      </div>

      {/* Meta strip */}
      <div className="flex flex-wrap gap-4 mb-8 text-sm text-gray-600">
        {project.location && (
          <span className="flex items-center gap-1.5"><MapPin size={13} className="text-gray-400" />{project.location}</span>
        )}
        {project.start_date && (
          <span className="flex items-center gap-1.5">
            <CalendarDays size={13} className="text-gray-400" />
            {project.start_date}{project.end_date ? ` → ${project.end_date}` : ''}
          </span>
        )}
        {project.budget && (
          <span className="flex items-center gap-1.5">
            <DollarSign size={13} className="text-gray-400" />
            NPR {fmt.format(project.budget)}
          </span>
        )}
      </div>

      {/* Module cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ModuleCard
          to={`/projects/${projectId}/boq`}
          icon={<ClipboardList size={20} className="text-blue-600" />}
          title="Bill of Quantities"
          description="Manage BOQ items, quantities, and unit rates"
          bg="bg-blue-50"
        />
        <ModuleCard
          to={`/projects/${projectId}/materials`}
          icon={<Package size={20} className="text-green-600" />}
          title="Materials"
          description="Track stock, record GRNs, and manage issues"
          bg="bg-green-50"
        />
        <ModuleCard
          to={`/projects/${projectId}/schedule`}
          icon={<GanttChartSquare size={20} className="text-indigo-600" />}
          title="Activity Schedule"
          description="Gantt view, baseline vs actual, critical path"
          bg="bg-indigo-50"
        />
        <ModuleCard
          to={`/projects/${projectId}/progress`}
          icon={<NotebookPen size={20} className="text-orange-600" />}
          title="Daily Progress"
          description="Site diary — labour, equipment, and work logged daily"
          bg="bg-orange-50"
        />
        <ModuleCard
          to={`/projects/${projectId}/reports`}
          icon={<BarChart3 size={20} className="text-purple-600" />}
          title="Reports"
          description="Daily/weekly/monthly rollups, S-curve, and progress photos"
          bg="bg-purple-50"
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

function EvmBadge({
  ok, okLabel, badLabel, title,
}: {
  ok: boolean | null
  okLabel: string
  badLabel: string
  title?: string
}) {
  if (ok === null) return null
  const Icon = ok ? CheckCircle2 : XCircle
  const cls = ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-medium ${cls}`}
    >
      <Icon size={11} />
      {ok ? okLabel : badLabel}
    </span>
  )
}
