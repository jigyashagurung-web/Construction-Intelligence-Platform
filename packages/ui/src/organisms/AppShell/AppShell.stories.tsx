import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import {
  LayoutDashboard, FolderKanban, FileSpreadsheet, Package,
  ClipboardList, Warehouse, BarChart3, TrendingUp, Sparkles,
  Settings2, Users, ShieldCheck,
  AlertTriangle, CalendarClock, DollarSign, Truck,
} from 'lucide-react'
import { AppShell }    from './AppShell'
import { MetricCard }  from '../../molecules/MetricCard'
import { ProgressRing }from '../../atoms/ProgressRing'
import { Badge }       from '../../atoms/Badge'
import { type NavSection } from '../Sidebar'
import { Avatar } from '../../atoms/Avatar'

// ── Fixtures ──────────────────────────────────────────────────────────────────
const PROJECTS = [
  { id: 'p1', name: 'Baneshwor Commercial Complex', code: 'BCC-2081' },
  { id: 'p2', name: 'Thankot Highway Upgrade',      code: 'THU-2081' },
  { id: 'p3', name: 'Pokhara Airport Annex',         code: 'PAA-2080' },
]

const NAV: NavSection[] = [
  {
    id: 'main',
    items: [
      { id: 'dashboard', label: 'Dashboard',      icon: LayoutDashboard, href: '/dashboard' },
      { id: 'projects',  label: 'Projects',       icon: FolderKanban,    href: '/projects'  },
    ],
  },
  {
    id: 'project',
    label: 'Project',
    items: [
      { id: 'boq',       label: 'BOQ',            icon: FileSpreadsheet, href: '/boq'       },
      { id: 'materials', label: 'Materials',      icon: Package,         href: '/materials', badge: 3 },
      { id: 'progress',  label: 'Daily Progress', icon: ClipboardList,   href: '/progress'  },
      { id: 'inventory', label: 'Inventory',      icon: Warehouse,       href: '/inventory', badge: 1 },
      { id: 'reports',   label: 'Reports',        icon: BarChart3,       href: '/reports'   },
      { id: 'forecast',  label: 'Forecast',       icon: TrendingUp,      href: '/forecast'  },
      { id: 'ai',        label: 'AI Assistant',   icon: Sparkles,        href: '/ai'        },
    ],
  },
  {
    id: 'system',
    label: 'System',
    items: [
      { id: 'safety',   label: 'Safety',         icon: ShieldCheck, href: '/safety'   },
      { id: 'settings', label: 'Settings',       icon: Settings2,   href: '/settings' },
      { id: 'admin',    label: 'Administration', icon: Users,       href: '/admin'    },
    ],
  },
]

const USER = { name: 'Roshan Shrestha', role: 'Project Manager' }

// ── Sample dashboard content ──────────────────────────────────────────────────
function DashboardContent() {
  const activities = [
    { label: 'Foundation',  value: 100, status: 'Completed'  as const },
    { label: 'Structure',   value: 82,  status: 'On Track'   as const },
    { label: 'MEP Rough',   value: 54,  status: 'In Progress'as const },
    { label: 'Finishing',   value: 31,  status: 'At Risk'    as const },
    { label: 'Landscaping', value: 8,   status: 'Critical'   as const },
  ]

  const statusVariant = {
    'Completed':  'success',
    'On Track':   'primary',
    'In Progress':'info',
    'At Risk':    'warning',
    'Critical':   'danger',
  } as const

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1100px' }}>

      {/* Page heading */}
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Project Dashboard
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Baneshwor Commercial Complex — Last updated 2 minutes ago
        </p>
      </div>

      {/* KPI grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
        <MetricCard label="Overall Progress"      value="68"   unit="%" trend={4}     trendLabel="vs last week"  status="ok"      icon={<TrendingUp      className="h-5 w-5"/>} />
        <MetricCard label="Schedule Performance"  value="0.87" unit="SPI" trend={-0.03} trendLabel="vs baseline" status="warning" icon={<CalendarClock   className="h-5 w-5"/>} trendPositiveIsGood />
        <MetricCard label="Cost Performance"      value="0.92" unit="CPI" trend={0.01}  trendLabel="vs last week"status="ok"      icon={<DollarSign      className="h-5 w-5"/>} />
        <MetricCard label="Safety Score"          value="82"   unit="/100" trend={-3}  trendLabel="vs last week"  status="warning" icon={<ShieldCheck     className="h-5 w-5"/>} trendPositiveIsGood />
        <MetricCard label="Equipment Utilisation" value="74"   unit="%" trend={6}     trendLabel="vs last week"  status="ok"      icon={<Truck           className="h-5 w-5"/>} />
        <MetricCard label="Active Alerts"         value="4"             trend={2}     trendLabel="since Monday"   status="danger"  icon={<AlertTriangle   className="h-5 w-5"/>} trendPositiveIsGood={false} />
      </div>

      {/* Activity progress section */}
      <div style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        borderRadius: '12px',
        padding: '20px',
      }}>
        <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
          Activity Progress
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
          {activities.map(({ label, value, status }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <ProgressRing value={value} size="lg" description={`${label} progress`} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
              <Badge variant={statusVariant[status]} dot size="sm">{status}</Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity feed */}
      <div style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        borderRadius: '12px',
        padding: '20px',
      }}>
        <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
          Recent Activity
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {[
            { user: 'Bikash Karki',   action: 'submitted daily report',           time: '5m ago',  type: 'ok'      },
            { user: 'System',         action: 'Cement stock below reorder point',  time: '22m ago', type: 'danger'  },
            { user: 'Anita Tamang',   action: 'approved PO-0042 — Rebar 10mm 5t', time: '1h ago',  type: 'ok'      },
            { user: 'System',         action: 'Forecast updated — 12 day delay risk', time: '2h ago', type: 'warning'},
          ].map(({ user, action, time, type }, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 0',
              borderBottom: i < 3 ? '1px solid var(--border-default)' : 'none',
            }}>
              <Avatar name={user} size="sm" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{user}</span>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}> {action}</span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>{time}</span>
              <div style={{
                width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                background: type === 'ok' ? 'var(--color-success-icon)' : type === 'danger' ? 'var(--color-danger-icon)' : 'var(--color-warning-icon)',
              }} />
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

// ── Meta ──────────────────────────────────────────────────────────────────────
const meta = {
  title:     'Organisms/AppShell',
  component:  AppShell,
  tags:      ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
Root layout template. Composes \`Sidebar\` + \`Header\` + scrollable content area.

Manages sidebar collapse state internally. On mobile (< lg breakpoint) the sidebar
becomes a slide-in drawer triggered by the Header hamburger button.
      `.trim(),
      },
    },
  },
} satisfies Meta<typeof AppShell>

export default meta
type Story = StoryObj<typeof meta>

// ── Stories ───────────────────────────────────────────────────────────────────

export const ProjectDashboard: Story = {
  name: '📐 Project Dashboard (full layout)',
  args: {} as any,
  render: () => {
    const [activeId, setActiveId] = useState('dashboard')
    const [activeProject, setActiveProject] = useState(PROJECTS[0])

    return (
      <div style={{ height: '100vh' }}>
        <AppShell
          sidebarProps={{
            navigation: NAV,
            activeId,
            onNavigate: (item) => setActiveId(item.id),
            footer: (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer' }}
                   className="hover:bg-[rgba(255,255,255,0.07)] transition-colors">
                <Avatar name={USER.name} size="sm" status="online" />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {USER.name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>
                    {USER.role}
                  </div>
                </div>
              </div>
            ),
          }}
          headerProps={{
            projects:             PROJECTS,
            activeProject,
            user:                 USER,
            notificationCount:    4,
            onProjectChange:      setActiveProject,
          }}
        >
          <DashboardContent />
        </AppShell>
      </div>
    )
  },
}

export const OfflineMode: Story = {
  name: 'Offline Mode',
  args: {} as any,
  render: () => (
    <div style={{ height: '100vh' }}>
      <AppShell
        sidebarProps={{ navigation: NAV, activeId: 'progress' }}
        headerProps={{
          projects: PROJECTS, activeProject: PROJECTS[0],
          user: USER, notificationCount: 1, offline: true,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>You are offline</p>
          <p style={{ fontSize: '14px' }}>Changes will sync automatically when connectivity is restored.</p>
        </div>
      </AppShell>
    </div>
  ),
}
