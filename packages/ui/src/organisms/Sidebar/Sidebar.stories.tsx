import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import {
  LayoutDashboard, FolderKanban, FileSpreadsheet, Package,
  ClipboardList, Warehouse, BarChart3, TrendingUp, Sparkles,
  Settings2, Users, ShieldCheck,
} from 'lucide-react'
import { Sidebar, type NavSection } from './Sidebar'
import { Avatar } from '../../atoms/Avatar'

// ── CIP navigation fixture ────────────────────────────────────────────────────
export const CIP_NAV: NavSection[] = [
  {
    id: 'main',
    items: [
      { id: 'dashboard', label: 'Dashboard',      icon: LayoutDashboard, href: '/dashboard' },
      { id: 'projects',  label: 'Projects',       icon: FolderKanban,    href: '/projects' },
    ],
  },
  {
    id: 'project',
    label: 'Project',
    items: [
      { id: 'boq',        label: 'BOQ',            icon: FileSpreadsheet, href: '/boq' },
      { id: 'materials',  label: 'Materials',      icon: Package,         href: '/materials',  badge: 3 },
      { id: 'progress',   label: 'Daily Progress', icon: ClipboardList,   href: '/progress' },
      { id: 'inventory',  label: 'Inventory',      icon: Warehouse,       href: '/inventory',  badge: 1 },
      { id: 'reports',    label: 'Reports',        icon: BarChart3,       href: '/reports' },
      { id: 'forecast',   label: 'Forecast',       icon: TrendingUp,      href: '/forecast' },
      { id: 'ai',         label: 'AI Assistant',   icon: Sparkles,        href: '/ai' },
    ],
  },
  {
    id: 'system',
    label: 'System',
    items: [
      { id: 'safety',  label: 'Safety',         icon: ShieldCheck, href: '/safety' },
      { id: 'settings',label: 'Settings',       icon: Settings2,   href: '/settings' },
      { id: 'admin',   label: 'Administration', icon: Users,       href: '/admin' },
    ],
  },
]

const UserFooter = ({ collapsed }: { collapsed: boolean }) => (
  <div className={`flex items-center gap-3 rounded-md px-2 py-2 hover:bg-[rgba(255,255,255,0.07)] cursor-pointer transition-colors ${collapsed ? 'justify-center' : ''}`}>
    <Avatar name="Roshan Shrestha" size="sm" status="online" />
    {!collapsed && (
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium text-white leading-tight">Roshan Shrestha</span>
        <span className="truncate text-xs text-[rgba(255,255,255,0.45)]">Project Manager</span>
      </div>
    )}
  </div>
)

// ── Meta ──────────────────────────────────────────────────────────────────────
const meta = {
  title:     'Organisms/Sidebar',
  component:  Sidebar,
  tags:      ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
Primary navigation organism. Renders the full CIP nav tree with section groupings,
badge counts, and a collapse toggle.

**Collapse behaviour:** width transitions from 240 px (expanded) to 64 px (icon-only).
In collapsed mode each item is wrapped in a right-side Tooltip so the label is never
lost. The toggle button is a floating circle on the right edge.
        `.trim(),
      },
    },
  },
} satisfies Meta<typeof Sidebar>

export default meta
type Story = StoryObj<typeof meta>

// ── Stories ───────────────────────────────────────────────────────────────────

export const Expanded: Story = {
  render: () => (
    <div style={{ height: '100vh', display: 'flex' }}>
      <Sidebar
        navigation={CIP_NAV}
        activeId="dashboard"
        footer={<UserFooter collapsed={false} />}
      />
    </div>
  ),
}

export const Collapsed: Story = {
  render: () => (
    <div style={{ height: '100vh', display: 'flex' }}>
      <Sidebar
        navigation={CIP_NAV}
        activeId="materials"
        collapsed
        footer={<UserFooter collapsed />}
      />
    </div>
  ),
}

export const WithActiveProject: Story = {
  name: 'Active — Deep Page',
  render: () => (
    <div style={{ height: '100vh', display: 'flex' }}>
      <Sidebar
        navigation={CIP_NAV}
        activeId="forecast"
        footer={<UserFooter collapsed={false} />}
      />
    </div>
  ),
}

export const Interactive: Story = {
  name: 'Interactive (toggle collapse)',
  render: () => {
    const [collapsed, setCollapsed] = useState(false)
    const [activeId, setActiveId]   = useState('dashboard')
    return (
      <div style={{ height: '100vh', display: 'flex' }}>
        <Sidebar
          navigation={CIP_NAV}
          activeId={activeId}
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
          onNavigate={(item) => setActiveId(item.id)}
          footer={<UserFooter collapsed={collapsed} />}
        />
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--surface-page)',
          color: 'var(--text-secondary)',
          fontSize: '14px',
        }}>
          Active: <strong style={{ marginLeft: 6, color: 'var(--text-primary)' }}>{activeId}</strong>
        </div>
      </div>
    )
  },
}
