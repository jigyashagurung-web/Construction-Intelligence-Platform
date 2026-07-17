import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft, Loader2, MapPin, CalendarDays, DollarSign,
  ClipboardList, Package, BarChart3, GanttChartSquare, NotebookPen
} from 'lucide-react'
import { fetchProject } from '@/api/projects'
import type { ProjectStatus } from '@/types'

const STATUS_COLOR: Record<ProjectStatus, { bg: string; text: string; dot: string }> = {
  planning:  { bg: 'bg-gray-100',    text: 'text-gray-700',  dot: 'bg-gray-400' },
  active:    { bg: 'bg-green-100',   text: 'text-green-700', dot: 'bg-green-500' },
  on_hold:   { bg: 'bg-yellow-100',  text: 'text-yellow-700',dot: 'bg-yellow-500' },
  complete:  { bg: 'bg-blue-100',    text: 'text-blue-700',  dot: 'bg-blue-500' },
  cancelled: { bg: 'bg-red-100',     text: 'text-red-600',   dot: 'bg-red-500' },
}

const fmt = new Intl.NumberFormat('en-NP', { maximumFractionDigits: 0 })

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => fetchProject(projectId!),
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

  const s = STATUS_COLOR[project.status]

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
          to={`/projects/${projectId}/schedule`}
          icon={<GanttChartSquare size={20} className="text-indigo-600" />}
          title="Activity Schedule"
          description="Gantt view, baseline vs actual, critical path"
          bg="bg-indigo-50"
        />
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

function ModuleCard({
  to, icon, title, description, bg, disabled,
}: {
  to: string
  icon: React.ReactNode
  title: string
  description: string
  bg: string
  disabled?: boolean
}) {
  const cls = `block p-5 rounded-xl border ${
    disabled
      ? 'border-gray-100 opacity-50 cursor-not-allowed'
      : 'border-gray-200 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all group'
  } bg-white`

  const inner = (
    <>
      <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <h3 className={`font-medium text-sm text-gray-900 mb-1 ${disabled ? '' : 'group-hover:text-blue-600 transition-colors'}`}>
        {title}
      </h3>
      <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
    </>
  )

  if (disabled) return <div className={cls}>{inner}</div>
  return <Link to={to} className={cls}>{inner}</Link>
}
