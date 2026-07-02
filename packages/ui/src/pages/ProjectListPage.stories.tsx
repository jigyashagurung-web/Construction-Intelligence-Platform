/**
 * Full-page composition: Project List
 * Landing screen after login — shows all projects across the organisation.
 */
import { useState, useMemo } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import {
  LayoutDashboard, FolderKanban, Settings2, Users,
  ShieldCheck, Plus, MapPin, Calendar, TrendingUp,
  TrendingDown, Users2, Search, X,
} from 'lucide-react'
import { AppShell }       from '../organisms/AppShell'
import { PageHeader }     from '../molecules/PageHeader'
import { FilterBar }      from '../molecules/FilterBar'
import { MetricCard }     from '../molecules/MetricCard'
import { EmptyState }     from '../molecules/EmptyState'
import { ToastProvider, useToast } from '../molecules/Toast'
import { Card, CardBody, CardFooter } from '../atoms/Card'
import { Badge }          from '../atoms/Badge'
import { Button }         from '../atoms/Button'
import { Select }         from '../atoms/Select'
import { Avatar }         from '../atoms/Avatar'
import { ProgressRing }   from '../atoms/ProgressRing'
import type { NavSection } from '../organisms/Sidebar'

// ── Nav ───────────────────────────────────────────────────────────────────────

const NAV: NavSection[] = [
  {
    id: 'main',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '#' },
      { id: 'projects',  label: 'Projects',  icon: FolderKanban,    href: '#' },
    ],
  },
  {
    id: 'system',
    label: 'System',
    items: [
      { id: 'safety',   label: 'Safety',         icon: ShieldCheck, href: '#' },
      { id: 'settings', label: 'Settings',       icon: Settings2,   href: '#' },
      { id: 'admin',    label: 'Administration', icon: Users,       href: '#' },
    ],
  },
]

const HEADER_PROJECTS = [
  { id: 'org', name: 'Viveka Constructions', code: 'ORG' },
]

const USER = { name: 'Anita Tamang', role: 'Organisation Admin' }

// ── Data ──────────────────────────────────────────────────────────────────────

type ProjectStatus = 'on-track' | 'at-risk' | 'delayed' | 'completed' | 'planning'
type ProjectType   = 'Residential' | 'Commercial' | 'Infrastructure' | 'Government' | 'Industrial'

interface Project {
  id:          string
  name:        string
  code:        string
  type:        ProjectType
  location:    string
  status:      ProjectStatus
  progress:    number
  budget:      number     // NPR
  spent:       number
  startDate:   string
  endDate:     string
  pm:          string
  teamSize:    number
}

const PROJECTS: Project[] = [
  {
    id:'p1', name:'Baneshwor Commercial Complex',  code:'BCC-2081', type:'Commercial',
    location:'Baneshwor, Kathmandu',    status:'on-track',  progress:68,
    budget:91612600, spent:58030000,
    startDate:'2081-01-01', endDate:'2082-06-30', pm:'Roshan Shrestha', teamSize:12,
  },
  {
    id:'p2', name:'Thankot Highway Upgrade',        code:'THU-2081', type:'Infrastructure',
    location:'Thankot, Kathmandu Valley', status:'at-risk',  progress:34,
    budget:48000000, spent:20000000,
    startDate:'2081-03-01', endDate:'2082-03-31', pm:'Bikash Karki',    teamSize:8,
  },
  {
    id:'p3', name:'Pokhara Airport Annex',           code:'PAA-2080', type:'Government',
    location:'Pokhara-12',               status:'completed', progress:100,
    budget:22000000, spent:21800000,
    startDate:'2080-06-01', endDate:'2081-02-28', pm:'Sunita Gurung',   teamSize:6,
  },
  {
    id:'p4', name:'Lalitpur Residential Township',  code:'LRT-2081', type:'Residential',
    location:'Imadol, Lalitpur',         status:'on-track',  progress:22,
    budget:135000000, spent:29000000,
    startDate:'2081-02-01', endDate:'2083-06-30', pm:'Anish Tamang',    teamSize:18,
  },
  {
    id:'p5', name:'Hetauda Industrial Shed',         code:'HIS-2081', type:'Industrial',
    location:'Hetauda, Makwanpur',       status:'delayed',   progress:11,
    budget:18500000, spent:3200000,
    startDate:'2081-04-01', endDate:'2082-01-31', pm:'Manisha Lama',    teamSize:5,
  },
  {
    id:'p6', name:'Butwal Bridge Rehabilitation',   code:'BBR-2081', type:'Infrastructure',
    location:'Butwal, Rupandehi',        status:'planning',  progress:0,
    budget:67000000, spent:0,
    startDate:'2081-07-01', endDate:'2083-01-31', pm:'Ram Bahadur',     teamSize:3,
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

const nprc = (n: number) => {
  if (n >= 10000000) return `₨ ${(n / 10000000).toFixed(2)} Cr`
  if (n >= 100000)   return `₨ ${(n / 100000).toFixed(1)} L`
  return `₨ ${n.toLocaleString()}`
}

const STATUS_CONFIG: Record<ProjectStatus, { variant: any; label: string }> = {
  'on-track':  { variant: 'primary', label: 'On track'  },
  'at-risk':   { variant: 'warning', label: 'At risk'   },
  'delayed':   { variant: 'danger',  label: 'Delayed'   },
  'completed': { variant: 'success', label: 'Completed' },
  'planning':  { variant: 'default', label: 'Planning'  },
}

// ── Project Card ──────────────────────────────────────────────────────────────

function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const s      = STATUS_CONFIG[project.status]
  const cpi    = project.budget > 0 ? project.spent / (project.budget * (project.progress / 100 || 0.01)) : 1
  const cpiOk  = cpi <= 1.05

  return (
    <Card asButton onClick={onClick}>
      <CardBody>
        {/* Title row */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'12px', marginBottom:'12px' }}>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:'14px', fontWeight:700, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:'4px' }}>
              {project.name}
            </p>
            <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
              <span style={{ fontSize:'11px', fontFamily:'monospace', color:'var(--text-tertiary)' }}>{project.code}</span>
              <span style={{ color:'var(--text-tertiary)', fontSize:'11px' }}>·</span>
              <Badge variant="default" size="sm">{project.type}</Badge>
            </div>
          </div>
          <ProgressRing value={project.progress} size="sm" description={`${project.progress}% complete`} />
        </div>

        {/* Meta rows */}
        <div style={{ display:'flex', flexDirection:'column', gap:'5px', marginBottom:'14px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
            <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color:'var(--text-tertiary)' }} aria-hidden />
            <span style={{ fontSize:'12px', color:'var(--text-secondary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{project.location}</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
            <Calendar className="h-3.5 w-3.5 shrink-0" style={{ color:'var(--text-tertiary)' }} aria-hidden />
            <span style={{ fontSize:'12px', color:'var(--text-secondary)' }}>{project.startDate} → {project.endDate}</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
            <Users2 className="h-3.5 w-3.5 shrink-0" style={{ color:'var(--text-tertiary)' }} aria-hidden />
            <span style={{ fontSize:'12px', color:'var(--text-secondary)' }}>
              <Avatar name={project.pm} size="sm" style={{ display:'inline-flex', marginRight:'4px', verticalAlign:'middle' }} />
              {project.pm} · {project.teamSize} members
            </span>
          </div>
        </div>

        {/* Budget bar */}
        <div style={{ marginBottom:'4px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'5px' }}>
            <span style={{ fontSize:'11px', color:'var(--text-tertiary)' }}>Budget utilisation</span>
            <span style={{ fontSize:'11px', fontVariantNumeric:'tabular-nums', color: cpiOk ? 'var(--text-secondary)' : 'var(--color-warning-text)' }}>
              {nprc(project.spent)} / {nprc(project.budget)}
            </span>
          </div>
          <div style={{ height:'5px', borderRadius:'3px', background:'var(--surface-hover)', overflow:'hidden' }}>
            <div style={{
              height:'100%', borderRadius:'3px',
              width:`${Math.min(100, (project.spent / project.budget) * 100)}%`,
              background: project.spent > project.budget ? 'var(--color-danger-icon)' : cpiOk ? 'var(--action-primary-bg)' : 'var(--color-warning-icon)',
              transition:'width 0.4s ease',
            }} />
          </div>
        </div>
      </CardBody>

      <CardFooter>
        <Badge variant={s.variant} dot size="sm">{s.label}</Badge>
        <span style={{ flex:1 }} />
        {!cpiOk && project.status !== 'completed' && (
          <Badge variant="warning" size="sm">Over budget</Badge>
        )}
      </CardFooter>
    </Card>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

function ProjectListContent() {
  const { toast } = useToast()

  const [search,        setSearch]        = useState('')
  const [statusFilter,  setStatusFilter]  = useState('')
  const [typeFilter,    setTypeFilter]    = useState('')

  const filtered = useMemo(() =>
    PROJECTS.filter((p) =>
      (!statusFilter || p.status === statusFilter) &&
      (!typeFilter   || p.type   === typeFilter)   &&
      (!search       || p.name.toLowerCase().includes(search.toLowerCase()) ||
                         p.code.toLowerCase().includes(search.toLowerCase())),
    ),
  [search, statusFilter, typeFilter])

  const activeFilters = [
    statusFilter && { id:'status', label:'Status', value: STATUS_CONFIG[statusFilter as ProjectStatus]?.label ?? statusFilter, onRemove: () => setStatusFilter('') },
    typeFilter   && { id:'type',   label:'Type',   value: typeFilter, onRemove: () => setTypeFilter('') },
  ].filter(Boolean) as any[]

  const totals = {
    total:     PROJECTS.length,
    onTrack:   PROJECTS.filter((p) => p.status === 'on-track').length,
    atRisk:    PROJECTS.filter((p) => p.status === 'at-risk' || p.status === 'delayed').length,
    completed: PROJECTS.filter((p) => p.status === 'completed').length,
    totalBudget: PROJECTS.reduce((s, p) => s + p.budget, 0),
  }

  return (
    <div style={{ height:'100vh' }}>
      <AppShell
        sidebarProps={{
          navigation: NAV,
          activeId:   'projects',
          footer: (
            <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'4px 8px' }}>
              <Avatar name={USER.name} size="sm" status="online" />
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:'13px', fontWeight:600, color:'white', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{USER.name}</div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.45)' }}>{USER.role}</div>
              </div>
            </div>
          ),
        }}
        headerProps={{
          projects:       HEADER_PROJECTS,
          activeProject:  HEADER_PROJECTS[0],
          user:           USER,
          notificationCount: totals.atRisk,
        }}
      >
        <div style={{ maxWidth:'1280px', margin:'0 auto' }}>

          {/* Page header */}
          <PageHeader
            title="Projects"
            description={`${totals.total} projects · Total portfolio: ${nprc(totals.totalBudget)}`}
            actions={
              <Button
                size="sm"
                iconLeft={<Plus className="h-4 w-4" />}
                onClick={() => toast({ title:'New project', description:'Project creation form coming soon', variant:'info' })}
              >
                New project
              </Button>
            }
          />

          {/* KPI strip */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:'14px', marginBottom:'24px' }}>
            <MetricCard label="Total projects"    value={String(totals.total)}     status="ok"      icon={<FolderKanban className="h-5 w-5" />} />
            <MetricCard label="On track"          value={String(totals.onTrack)}   status="ok"      icon={<TrendingUp   className="h-5 w-5" />} />
            <MetricCard label="Need attention"    value={String(totals.atRisk)}    status={totals.atRisk > 0 ? 'warning' : 'ok'} icon={<TrendingDown className="h-5 w-5" />} trendPositiveIsGood={false} />
            <MetricCard label="Completed"         value={String(totals.completed)} status="ok"      icon={<ShieldCheck  className="h-5 w-5" />} />
          </div>

          {/* Filter bar */}
          <div style={{ marginBottom:'16px' }}>
            <FilterBar
              filters={activeFilters}
              onClearAll={() => { setStatusFilter(''); setTypeFilter('') }}
              leftSlot={
                <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                  <div style={{ position:'relative', width:'240px' }}>
                    <Search className="h-3.5 w-3.5" style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text-tertiary)', pointerEvents:'none' }} aria-hidden />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search projects…"
                      style={{ width:'100%', height:'32px', paddingLeft:'30px', paddingRight: search ? '28px' : '10px', borderRadius:'8px', border:'1px solid var(--border-default)', background:'var(--surface-input)', color:'var(--text-primary)', fontSize:'13px', outline:'none' }}
                      aria-label="Search projects"
                    />
                    {search && (
                      <button onClick={() => setSearch('')} style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-tertiary)', display:'flex' }} aria-label="Clear">
                        <X className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    )}
                  </div>
                  <div style={{ width:'145px' }}>
                    <Select
                      options={[
                        { value:'on-track',  label:'On track'  },
                        { value:'at-risk',   label:'At risk'   },
                        { value:'delayed',   label:'Delayed'   },
                        { value:'completed', label:'Completed' },
                        { value:'planning',  label:'Planning'  },
                      ]}
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                      placeholder="All statuses"
                      size="sm"
                    />
                  </div>
                  <div style={{ width:'155px' }}>
                    <Select
                      options={['Residential','Commercial','Infrastructure','Government','Industrial'].map((t) => ({ value:t, label:t }))}
                      value={typeFilter}
                      onValueChange={setTypeFilter}
                      placeholder="All types"
                      size="sm"
                    />
                  </div>
                </div>
              }
            />
          </div>

          {/* Project grid */}
          {filtered.length === 0 ? (
            <EmptyState
              variant="search"
              title="No projects match"
              description="Try a different keyword, status, or type."
              action={{ label:'Clear filters', onClick: () => { setSearch(''); setStatusFilter(''); setTypeFilter('') }, variant:'secondary' }}
            />
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:'16px' }}>
              {filtered.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  onClick={() => toast({ title:`Opening ${p.code}`, description:p.name, variant:'info' })}
                />
              ))}
            </div>
          )}
        </div>
      </AppShell>
    </div>
  )
}

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title:      'Pages/Project List',
  component:   ProjectListContent,
  tags:       ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Organisation-level project grid with KPI strip, live filtering, and clickable project cards.',
      },
    },
  },
  decorators: [(Story: any) => <ToastProvider><Story /></ToastProvider>],
} satisfies Meta<any>

export default meta

export const Default: StoryObj<any> = {
  name:   '📁 Project List — full layout',
  render: () => <ProjectListContent />,
}
