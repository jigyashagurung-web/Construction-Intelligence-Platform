/**
 * Full-page composition: Activity Schedule
 *
 * Gantt chart with baseline vs actual bars, critical-path highlighting,
 * zoom levels, and a table fallback view. All state is local.
 */
import { useState, useMemo, useRef } from 'react'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { createColumnHelper } from '@tanstack/react-table'
import {
  LayoutDashboard, FolderKanban, FileSpreadsheet, Package,
  ClipboardList, Warehouse, BarChart3, TrendingUp, Sparkles,
  Settings2, Users, ShieldCheck,
  Plus, Download, ZoomIn, ZoomOut, List, GanttChartSquare,
  AlertTriangle, CheckCircle2, Clock, ChevronRight,
} from 'lucide-react'
import { AppShell }   from '../organisms/AppShell'
import { PageHeader } from '../molecules/PageHeader'
import { DataTable }  from '../organisms/DataTable'
import { MetricCard } from '../molecules/MetricCard'
import { Badge }      from '../atoms/Badge'
import { Button }     from '../atoms/Button'
import { Select }     from '../atoms/Select'
import { Checkbox }   from '../atoms/Checkbox'
import { Tooltip }    from '../atoms/Tooltip'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogBody, DialogFooter, DialogClose,
} from '../organisms/Dialog'
import type { NavSection } from '../organisms/Sidebar'

// ── Nav ───────────────────────────────────────────────────────────────────────

const NAV: NavSection[] = [
  {
    id: 'main',
    items: [
      { id: 'dashboard', label: 'Dashboard',      icon: LayoutDashboard, href: '#' },
      { id: 'projects',  label: 'Projects',       icon: FolderKanban,    href: '#' },
    ],
  },
  {
    id: 'project',
    label: 'Project',
    items: [
      { id: 'schedule',  label: 'Schedule',       icon: GanttChartSquare,href: '#' },
      { id: 'boq',       label: 'BOQ',            icon: FileSpreadsheet, href: '#' },
      { id: 'materials', label: 'Materials',      icon: Package,         href: '#' },
      { id: 'progress',  label: 'Daily Progress', icon: ClipboardList,   href: '#' },
      { id: 'inventory', label: 'Inventory',      icon: Warehouse,       href: '#' },
      { id: 'reports',   label: 'Reports',        icon: BarChart3,       href: '#' },
      { id: 'forecast',  label: 'Forecast',       icon: TrendingUp,      href: '#' },
      { id: 'ai',        label: 'AI Assistant',   icon: Sparkles,        href: '#' },
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

const HEADER_PROJECT = { id: 'bcc', name: 'Baneshwor Commercial Complex', code: 'BCC-2081' }
const USER           = { name: 'Roshan Shrestha', role: 'Project Manager' }

// ── Types ─────────────────────────────────────────────────────────────────────

type ActivityStatus = 'complete' | 'on-track' | 'at-risk' | 'delayed' | 'not-started'

type Activity = {
  id:           string
  wbs:          string
  name:         string
  trade:        string
  plannedStart: number   // day offset from project Day 0
  plannedEnd:   number
  actualStart:  number | null
  actualEnd:    number | null
  progress:     number   // 0–100
  status:       ActivityStatus
  isCritical:   boolean
  assignee:     string
}

// ── Activity data  (Day 0 = project start; TODAY = Day 72) ────────────────────

const TODAY = 72

const ACTIVITIES: Activity[] = [
  { id: 'A01', wbs: '1',     name: 'Site Preparation',          trade: 'General',    plannedStart: 0,   plannedEnd: 14,  actualStart: 0,   actualEnd: 12,  progress: 100, status: 'complete',    isCritical: true,  assignee: 'Bikash Karki'   },
  { id: 'A02', wbs: '2',     name: 'Foundation Excavation',     trade: 'Civil',      plannedStart: 10,  plannedEnd: 28,  actualStart: 11,  actualEnd: 27,  progress: 100, status: 'complete',    isCritical: true,  assignee: 'Ram Bahadur'    },
  { id: 'A03', wbs: '3',     name: 'Foundation Concrete',       trade: 'Concrete',   plannedStart: 25,  plannedEnd: 45,  actualStart: 27,  actualEnd: 46,  progress: 100, status: 'complete',    isCritical: true,  assignee: 'Bikash Karki'   },
  { id: 'A04', wbs: '4',     name: 'G+1 Column Casting',        trade: 'Concrete',   plannedStart: 42,  plannedEnd: 60,  actualStart: 46,  actualEnd: 62,  progress: 100, status: 'complete',    isCritical: true,  assignee: 'Bikash Karki'   },
  { id: 'A05', wbs: '5.1',   name: 'G+1 Beam Formwork',         trade: 'Formwork',   plannedStart: 58,  plannedEnd: 76,  actualStart: 62,  actualEnd: null,progress: 82,  status: 'on-track',    isCritical: true,  assignee: 'Sunita Gurung'  },
  { id: 'A06', wbs: '5.2',   name: 'G+1 Rebar Fabrication',     trade: 'Steel',      plannedStart: 60,  plannedEnd: 78,  actualStart: 63,  actualEnd: null,progress: 61,  status: 'at-risk',     isCritical: false, assignee: 'Ram Bahadur'    },
  { id: 'A07', wbs: '5.3',   name: 'G+1 Slab Concrete Pour',   trade: 'Concrete',   plannedStart: 76,  plannedEnd: 84,  actualStart: null,actualEnd: null,progress: 0,   status: 'not-started', isCritical: true,  assignee: 'Bikash Karki'   },
  { id: 'A08', wbs: '6',     name: 'External Wall Brickwork',   trade: 'Masonry',    plannedStart: 62,  plannedEnd: 108, actualStart: 68,  actualEnd: null,progress: 24,  status: 'delayed',     isCritical: false, assignee: 'Anish Tamang'   },
  { id: 'A09', wbs: '7',     name: 'MEP Rough-in',              trade: 'MEP',        plannedStart: 80,  plannedEnd: 120, actualStart: null,actualEnd: null,progress: 0,   status: 'not-started', isCritical: false, assignee: 'Manisha Lama'   },
  { id: 'A10', wbs: '8',     name: 'Internal Plastering',       trade: 'Finishing',  plannedStart: 108, plannedEnd: 140, actualStart: null,actualEnd: null,progress: 0,   status: 'not-started', isCritical: false, assignee: 'Sunita Gurung'  },
  { id: 'A11', wbs: '9',     name: 'Electrical Wiring Final',   trade: 'Electrical', plannedStart: 118, plannedEnd: 148, actualStart: null,actualEnd: null,progress: 0,   status: 'not-started', isCritical: false, assignee: 'Anish Tamang'   },
  { id: 'A12', wbs: '10',    name: 'Waterproofing',             trade: 'Finishing',  plannedStart: 138, plannedEnd: 158, actualStart: null,actualEnd: null,progress: 0,   status: 'not-started', isCritical: true,  assignee: 'Ram Bahadur'    },
  { id: 'A13', wbs: '11',    name: 'Floor & Wall Finishing',    trade: 'Finishing',  plannedStart: 152, plannedEnd: 182, actualStart: null,actualEnd: null,progress: 0,   status: 'not-started', isCritical: false, assignee: 'Manisha Lama'   },
]

const TOTAL_DAYS = 190

// Month labels (Nepali calendar, project Day 0 ≈ 1 Magh 2081)
const MONTHS = [
  { label: 'Magh 2081',    start: 0,   end: 30  },
  { label: 'Falgun 2081',  start: 30,  end: 59  },
  { label: 'Chaitra 2081', start: 59,  end: 89  },
  { label: 'Baisakh 2082', start: 89,  end: 119 },
  { label: 'Jestha 2082',  start: 119, end: 149 },
  { label: 'Ashadh 2082',  start: 149, end: 190 },
]

const TRADES = ['General', 'Civil', 'Concrete', 'Formwork', 'Steel', 'Masonry', 'MEP', 'Electrical', 'Finishing']

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CFG: Record<ActivityStatus, { color: string; badge: 'success' | 'primary' | 'warning' | 'danger' | 'default'; label: string }> = {
  'complete':    { color: '#16a34a', badge: 'success', label: 'Complete'    },
  'on-track':    { color: '#2563eb', badge: 'primary', label: 'On Track'   },
  'at-risk':     { color: '#d97706', badge: 'warning', label: 'At Risk'    },
  'delayed':     { color: '#dc2626', badge: 'danger',  label: 'Delayed'    },
  'not-started': { color: '#a1a1aa', badge: 'default', label: 'Not Started'},
}

// ── Zoom config ───────────────────────────────────────────────────────────────

const ZOOM_DAY_W: Record<string, number> = { week: 18, month: 7, quarter: 3.5 }
const ZOOM_LABELS = [
  { value: 'week',    label: 'Week' },
  { value: 'month',   label: 'Month' },
  { value: 'quarter', label: 'Quarter' },
]

// ── Activity detail dialog ────────────────────────────────────────────────────

function ActivityDetail({ activity, onClose }: { activity: Activity; onClose: () => void }) {
  const { badge, label } = STATUS_CFG[activity.status]
  const plannedDur = activity.plannedEnd - activity.plannedStart
  const variance   = activity.actualStart != null
    ? activity.actualStart - activity.plannedStart
    : 0

  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent size="md">
        <DialogHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <DialogTitle>{activity.name}</DialogTitle>
            <Badge variant={badge} dot size="sm">{label}</Badge>
            {activity.isCritical && <Badge variant="danger" size="sm">Critical Path</Badge>}
          </div>
          <DialogDescription>WBS {activity.wbs} · {activity.trade}</DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Progress bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Progress</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: STATUS_CFG[activity.status].color }}>{activity.progress}%</span>
              </div>
              <div style={{ height: 8, borderRadius: 4, background: 'var(--surface-subtle)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${activity.progress}%`, borderRadius: 4, background: STATUS_CFG[activity.status].color, transition: 'width 0.3s ease' }} />
              </div>
            </div>

            {/* Date grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Planned Start', value: `Day ${activity.plannedStart}` },
                { label: 'Planned End',   value: `Day ${activity.plannedEnd}`   },
                { label: 'Actual Start',  value: activity.actualStart != null ? `Day ${activity.actualStart}` : '—' },
                { label: 'Actual End',    value: activity.actualEnd   != null ? `Day ${activity.actualEnd}`   : activity.status === 'complete' ? '—' : 'In progress' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '10px 12px', background: 'var(--surface-subtle)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Duration',    value: `${plannedDur}d`                              },
                { label: 'Assignee',    value: activity.assignee                              },
                { label: 'Start Var.',  value: variance === 0 ? '—' : variance > 0 ? `+${variance}d` : `${variance}d` },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <DialogClose asChild><Button variant="ghost">Close</Button></DialogClose>
          <Button iconLeft={<ClipboardList className="h-4 w-4" />}>Update Progress</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Gantt chart ───────────────────────────────────────────────────────────────

const ROW_H     = 44
const HEADER_H  = 52
const LABEL_W   = 300

function GanttChart({
  activities,
  zoom,
  showBaseline,
  onRowClick,
}: {
  activities:   Activity[]
  zoom:         string
  showBaseline: boolean
  onRowClick:   (a: Activity) => void
}) {
  const dayW   = ZOOM_DAY_W[zoom]
  const totalW = TOTAL_DAYS * dayW
  const weekCount = Math.ceil(TOTAL_DAYS / 7)

  const barH       = showBaseline ? 10 : 14
  const baselineTop = (ROW_H - barH * 2 - 4) / 2
  const actualTop   = showBaseline ? baselineTop + barH + 4 : (ROW_H - barH) / 2

  return (
    <div style={{ display: 'flex', border: '1px solid var(--border-default)', borderRadius: '12px', overflow: 'hidden', background: 'var(--surface-card)' }}>

      {/* ── Left label pane ── */}
      <div style={{ flexShrink: 0, width: LABEL_W, borderRight: '2px solid var(--border-default)' }}>
        {/* Header */}
        <div style={{ height: HEADER_H, background: 'var(--surface-subtle)', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Activity</span>
          <Badge variant="default" size="sm">{showBaseline ? 'Baseline + Actual' : 'Actual only'}</Badge>
        </div>
        {/* Rows */}
        {activities.map((act, i) => (
          <button
            key={act.id}
            onClick={() => onRowClick(act)}
            style={{
              display: 'flex', alignItems: 'center',
              width: '100%', height: ROW_H, padding: '0 12px',
              gap: '8px',
              background: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.015)',
              borderBottom: '1px solid var(--border-subtle)',
              border: 'none', cursor: 'pointer', textAlign: 'left',
            }}
          >
            {/* Critical path indicator */}
            <div style={{
              width: 3, height: 22, borderRadius: 2, flexShrink: 0,
              background: act.isCritical ? 'var(--color-danger-icon)' : 'transparent',
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '1px' }}>
                {act.name}
              </p>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono, monospace)' }}>{act.wbs}</span>
                <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>·</span>
                <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{act.trade}</span>
              </div>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: STATUS_CFG[act.status].color, tabularNums: true, flexShrink: 0 }}>
              {act.progress}%
            </span>
            <ChevronRight className="h-3.5 w-3.5" style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
          </button>
        ))}
      </div>

      {/* ── Right scrollable Gantt area ── */}
      <div style={{ flex: 1, overflowX: 'auto', overflowY: 'hidden' }}>
        <div style={{ position: 'relative', width: Math.max(totalW, 400) }}>

          {/* Timeline header */}
          <div style={{ position: 'sticky', top: 0, height: HEADER_H, background: 'var(--surface-subtle)', borderBottom: '1px solid var(--border-default)', zIndex: 4 }}>
            {/* Month row */}
            <div style={{ position: 'relative', height: 26, borderBottom: '1px solid var(--border-subtle)' }}>
              {MONTHS.map((m) => (
                <div key={m.label} style={{
                  position: 'absolute',
                  left: m.start * dayW,
                  width: (m.end - m.start) * dayW,
                  height: '100%',
                  borderRight: '1px solid var(--border-subtle)',
                  display: 'flex', alignItems: 'center', paddingLeft: 8, overflow: 'hidden',
                }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{m.label}</span>
                </div>
              ))}
            </div>
            {/* Week row */}
            <div style={{ position: 'relative', height: 26 }}>
              {Array.from({ length: weekCount }).map((_, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  left: i * 7 * dayW,
                  width: 7 * dayW,
                  height: '100%',
                  borderRight: '1px solid var(--border-subtle)',
                  display: 'flex', alignItems: 'center', paddingLeft: 4, overflow: 'hidden',
                }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>W{i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chart body */}
          <div style={{ position: 'relative', height: activities.length * ROW_H }}>

            {/* Week gridlines */}
            {Array.from({ length: weekCount }).map((_, i) => (
              <div key={i} style={{
                position: 'absolute', top: 0, bottom: 0,
                left: i * 7 * dayW - 0.5,
                width: 1,
                background: 'var(--border-subtle)',
                zIndex: 0,
              }} />
            ))}

            {/* Row stripes */}
            {activities.map((_, i) => i % 2 !== 0 && (
              <div key={i} style={{
                position: 'absolute',
                top: i * ROW_H, left: 0, right: 0, height: ROW_H,
                background: 'rgba(0,0,0,0.015)',
              }} />
            ))}

            {/* Row borders */}
            {activities.map((_, i) => (
              <div key={i} style={{
                position: 'absolute',
                top: (i + 1) * ROW_H - 1, left: 0, right: 0, height: 1,
                background: 'var(--border-subtle)',
              }} />
            ))}

            {/* Today line */}
            <div style={{
              position: 'absolute', top: 0, bottom: 0,
              left: TODAY * dayW,
              width: 2,
              background: '#ef4444',
              zIndex: 5,
              opacity: 0.8,
            }}>
              <div style={{
                position: 'absolute', top: 6, left: '50%',
                transform: 'translateX(-50%)',
                background: '#ef4444', color: 'white',
                fontSize: '9px', fontWeight: 800, letterSpacing: '0.04em',
                padding: '1px 5px', borderRadius: 3,
                whiteSpace: 'nowrap', zIndex: 6,
              }}>TODAY</div>
            </div>

            {/* Activity bars */}
            {activities.map((act, i) => {
              const rowTop = i * ROW_H
              const barColor = STATUS_CFG[act.status].color

              // Planned dimensions
              const planLeft  = act.plannedStart * dayW
              const planWidth = (act.plannedEnd - act.plannedStart) * dayW

              // Actual dimensions
              const aStart   = act.actualStart ?? act.plannedStart
              const duration = act.actualEnd != null
                ? act.actualEnd - aStart
                : act.actualStart != null
                  ? (act.plannedEnd - act.plannedStart) * (act.progress / 100)
                  : act.plannedEnd - act.plannedStart
              const actLeft  = aStart * dayW
              const actWidth = Math.max(duration * dayW, 3)

              return (
                <g key={act.id}>
                  {/* Baseline bar */}
                  {showBaseline && (
                    <div style={{
                      position: 'absolute',
                      top: rowTop + baselineTop,
                      left: planLeft,
                      width: planWidth,
                      height: barH,
                      borderRadius: 4,
                      border: '1.5px dashed #a1a1aa',
                      background: 'rgba(161,161,170,0.15)',
                      zIndex: 1,
                    }} />
                  )}

                  {/* Actual / planned bar */}
                  <div
                    onClick={() => onRowClick(act)}
                    title={`${act.name} — ${STATUS_CFG[act.status].label} (${act.progress}%)`}
                    style={{
                      position: 'absolute',
                      top: rowTop + actualTop,
                      left: actLeft,
                      width: actWidth,
                      height: barH,
                      borderRadius: 4,
                      background: act.status === 'not-started' ? '#d4d4d8' : barColor,
                      opacity: act.status === 'not-started' ? 0.55 : 1,
                      zIndex: 2,
                      cursor: 'pointer',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Progress fill overlay for in-progress bars */}
                    {act.progress > 0 && act.progress < 100 && (
                      <div style={{
                        position: 'absolute', top: 0, left: 0,
                        width: `${act.progress}%`, height: '100%',
                        background: 'rgba(255,255,255,0.28)',
                        borderRadius: 4,
                      }} />
                    )}
                  </div>
                </g>
              )
            })}

          </div>
        </div>
      </div>
    </div>
  )
}

// ── Table view columns ────────────────────────────────────────────────────────

const col = createColumnHelper<Activity>()

const TABLE_COLS = [
  col.accessor('wbs',    { header: 'WBS',      size: 70,  cell: (i) => <span className="font-mono text-xs text-[--text-tertiary]">{i.getValue()}</span> }),
  col.accessor('name',   { header: 'Activity', size: 220, cell: (i) => <span className="font-medium text-[--text-primary]">{i.getValue()}</span> }),
  col.accessor('trade',  { header: 'Trade',    size: 100, cell: (i) => <Badge variant="default" size="sm">{i.getValue()}</Badge> }),
  col.accessor('plannedStart', { header: 'Plan Start', size: 90,  cell: (i) => <span className="tabular-nums text-xs text-[--text-secondary]">Day {i.getValue()}</span> }),
  col.accessor('plannedEnd',   { header: 'Plan End',   size: 90,  cell: (i) => <span className="tabular-nums text-xs text-[--text-secondary]">Day {i.getValue()}</span> }),
  col.accessor('actualStart',  { header: 'Act. Start', size: 90,  cell: (i) => i.getValue() != null ? <span className="tabular-nums text-xs text-[--text-secondary]">Day {i.getValue()}</span> : <span className="text-xs text-[--text-tertiary]">—</span> }),
  col.accessor('progress', {
    header: 'Progress',
    size: 140,
    cell: (i) => {
      const act = i.row.original
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--border-default)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${i.getValue()}%`, borderRadius: 3, background: STATUS_CFG[act.status].color }} />
          </div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: STATUS_CFG[act.status].color, tabularNums: true, minWidth: 28 }}>
            {i.getValue()}%
          </span>
        </div>
      )
    },
  }),
  col.accessor('status', {
    header: 'Status',
    size: 130,
    cell: (i) => {
      const { badge, label } = STATUS_CFG[i.getValue()]
      return <Badge variant={badge} dot size="sm">{label}</Badge>
    },
  }),
  col.accessor('isCritical', {
    header: 'Critical',
    size: 80,
    cell: (i) => i.getValue()
      ? <Badge variant="danger" size="sm">Yes</Badge>
      : <span className="text-xs text-[--text-tertiary]">—</span>,
  }),
  col.accessor('assignee', { header: 'Assignee', size: 140, cell: (i) => <span className="text-xs text-[--text-secondary]">{i.getValue()}</span> }),
]

// ── Main page ─────────────────────────────────────────────────────────────────

function ActivitySchedulePage() {
  const [activeNav,     setActiveNav]     = useState('schedule')
  const [view,          setView]          = useState<'gantt' | 'table'>('gantt')
  const [zoom,          setZoom]          = useState('month')
  const [showBaseline,  setShowBaseline]  = useState(true)
  const [tradeFilter,   setTradeFilter]   = useState('')
  const [statusFilter,  setStatusFilter]  = useState('')
  const [selectedAct,   setSelectedAct]   = useState<Activity | null>(null)

  const filtered = useMemo(() => {
    let rows = ACTIVITIES
    if (tradeFilter)  rows = rows.filter((a) => a.trade  === tradeFilter)
    if (statusFilter) rows = rows.filter((a) => a.status === statusFilter)
    return rows
  }, [tradeFilter, statusFilter])

  // ── KPIs ────────────────────────────────────────────────────────────────────

  const complete   = ACTIVITIES.filter((a) => a.status === 'complete').length
  const onTrack    = ACTIVITIES.filter((a) => a.status === 'on-track').length
  const atRisk     = ACTIVITIES.filter((a) => a.status === 'at-risk' || a.status === 'delayed').length
  const overallPct = Math.round(ACTIVITIES.reduce((s, a) => s + a.progress, 0) / ACTIVITIES.length)
  const criticalDelayed = ACTIVITIES.filter((a) => a.isCritical && (a.status === 'delayed' || a.status === 'at-risk')).length

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div style={{ height: '100vh' }}>
      <AppShell
        sidebarProps={{ navigation: NAV, activeId: activeNav, onNavigate: (item) => setActiveNav(item.id) }}
        headerProps={{ projects: [HEADER_PROJECT], activeProject: HEADER_PROJECT, user: USER, notificationCount: 1 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          <PageHeader
            title="Activity Schedule"
            description="Baneshwor Commercial Complex · Baseline vs actual Gantt"
            badge={
              criticalDelayed > 0
                ? <Badge variant="danger" dot size="sm">{criticalDelayed} critical at risk</Badge>
                : <Badge variant="success" dot size="sm">Critical path on track</Badge>
            }
            breadcrumb={[{ label: 'BCC-2081', onClick: () => {} }, { label: 'Schedule' }]}
            actions={
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="secondary" size="sm" iconLeft={<Download className="h-4 w-4" />}>Export</Button>
                <Button size="sm" iconLeft={<Plus className="h-4 w-4" />}>Add Activity</Button>
              </div>
            }
          />

          {/* KPI strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
            <MetricCard label="Overall Progress"  value={overallPct}  unit="%" status="ok"      icon={<TrendingUp     className="h-5 w-5" />} trend={4} trendLabel="vs last week" />
            <MetricCard label="Complete"          value={complete}            status="ok"      icon={<CheckCircle2   className="h-5 w-5" />} />
            <MetricCard label="On Track"          value={onTrack}             status="ok"      icon={<Clock          className="h-5 w-5" />} />
            <MetricCard label="At Risk / Delayed" value={atRisk}              status={atRisk > 0 ? 'warning' : 'ok'} icon={<AlertTriangle className="h-5 w-5" />} trendPositiveIsGood={false} />
          </div>

          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* View toggle */}
            <div style={{ display: 'flex', border: '1px solid var(--border-default)', borderRadius: '8px', overflow: 'hidden' }}>
              {([
                { v: 'gantt' as const,  icon: <GanttChartSquare className="h-4 w-4" />, label: 'Gantt'  },
                { v: 'table' as const,  icon: <List             className="h-4 w-4" />, label: 'Table'  },
              ] as const).map(({ v, icon, label }) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 12px', fontSize: '13px', fontWeight: 500,
                    background: view === v ? 'var(--action-primary-bg)' : 'transparent',
                    color: view === v ? 'white' : 'var(--text-secondary)',
                    border: 'none', cursor: 'pointer',
                  }}
                >
                  {icon}{label}
                </button>
              ))}
            </div>

            {/* Zoom (Gantt only) */}
            {view === 'gantt' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ZoomOut className="h-4 w-4" style={{ color: 'var(--text-tertiary)' }} />
                <div style={{ display: 'flex', border: '1px solid var(--border-default)', borderRadius: '8px', overflow: 'hidden' }}>
                  {ZOOM_LABELS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setZoom(value)}
                      style={{
                        padding: '6px 12px', fontSize: '12px', fontWeight: 500,
                        background: zoom === value ? 'var(--surface-hover)' : 'transparent',
                        color: zoom === value ? 'var(--text-primary)' : 'var(--text-secondary)',
                        border: 'none', cursor: 'pointer',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <ZoomIn className="h-4 w-4" style={{ color: 'var(--text-tertiary)' }} />
              </div>
            )}

            {/* Filters */}
            <div style={{ width: 140 }}>
              <Select
                options={TRADES.map((t) => ({ value: t, label: t }))}
                value={tradeFilter}
                onValueChange={setTradeFilter}
                placeholder="All trades"
                size="sm"
              />
            </div>
            <div style={{ width: 160 }}>
              <Select
                options={(Object.entries(STATUS_CFG) as [ActivityStatus, typeof STATUS_CFG[ActivityStatus]][])
                  .map(([v, c]) => ({ value: v, label: c.label }))}
                value={statusFilter}
                onValueChange={setStatusFilter}
                placeholder="All statuses"
                size="sm"
              />
            </div>

            {/* Baseline toggle (Gantt only) */}
            {view === 'gantt' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
                <Checkbox
                  id="baseline"
                  checked={showBaseline}
                  onCheckedChange={(v) => setShowBaseline(!!v)}
                />
                <label htmlFor="baseline" style={{ fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}>
                  Show baseline
                </label>
              </div>
            )}

            {/* Legend */}
            {view === 'gantt' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: view === 'gantt' ? 0 : 'auto', flexWrap: 'wrap' }}>
                {(Object.entries(STATUS_CFG) as [ActivityStatus, typeof STATUS_CFG[ActivityStatus]][]).map(([, cfg]) => (
                  <div key={cfg.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: 12, height: 8, borderRadius: 2, background: cfg.color }} />
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{cfg.label}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: 3, height: 14, borderRadius: 2, background: '#ef4444' }} />
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Critical</span>
                </div>
              </div>
            )}
          </div>

          {/* Main view */}
          {view === 'gantt' ? (
            <GanttChart
              activities={filtered}
              zoom={zoom}
              showBaseline={showBaseline}
              onRowClick={setSelectedAct}
            />
          ) : (
            <DataTable<Activity>
              columns={TABLE_COLS}
              data={filtered}
              aria-label="Activity schedule table"
            />
          )}

        </div>

        {/* Activity detail dialog */}
        {selectedAct && (
          <ActivityDetail
            activity={selectedAct}
            onClose={() => setSelectedAct(null)}
          />
        )}
      </AppShell>
    </div>
  )
}

// ── Storybook meta ────────────────────────────────────────────────────────────

const meta = {
  title:      'Pages/ActivitySchedule',
  component:  ActivitySchedulePage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
Full-page Activity Schedule (Gantt) screen. Covers:

- **Gantt view** — scrollable bar chart with baseline (dashed) and actual (solid) bars per activity
- **Zoom levels** — Week / Month / Quarter, changing the day-width of the timeline
- **Baseline toggle** — show or hide the planned-schedule bars
- **Critical path** — red left-edge indicator and TODAY marker line
- **Status colours** — complete (green), on-track (blue), at-risk (amber), delayed (red), not-started (grey)
- **Table view** — DataTable fallback with progress bar inline cells
- **Activity detail dialog** — dates, start variance, progress bar, assignee, and action buttons
- **Trade and status filters** — narrow the activity list in both views
        `.trim(),
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ActivitySchedulePage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: '📅 Activity Schedule (Gantt)',
  args: {} as any,
  render: () => <ActivitySchedulePage />,
}
