/**
 * Full-page composition: Bill of Quantities
 *
 * Demonstrates how every library component fits together in a real CIP screen.
 * All state is local — no external store required.
 */
import { useState, useMemo } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { createColumnHelper } from '@tanstack/react-table'
import {
  LayoutDashboard, FolderKanban, FileSpreadsheet, Package,
  ClipboardList, Warehouse, BarChart3, TrendingUp, Sparkles,
  Settings2, Users, ShieldCheck,
  Plus, Download, Upload, Edit3, Trash2, Copy,
  AlertTriangle, CheckCircle2, Clock, DollarSign,
  Search, X,
} from 'lucide-react'
import { AppShell }             from '../organisms/AppShell'
import { PageHeader }           from '../molecules/PageHeader'
import { FilterBar }            from '../molecules/FilterBar'
import { Tabs }                 from '../organisms/Tabs'
import { DataTable, selectionColumn, type Row } from '../organisms/DataTable'
import {
  Dialog, DialogContent,
  DialogHeader, DialogBody, DialogFooter,
  DialogTitle, DialogDescription, DialogClose,
} from '../organisms/Dialog'
import { MetricCard }           from '../molecules/MetricCard'
import { Card, CardHeader, CardTitle, CardBody } from '../atoms/Card'
import { Badge }                from '../atoms/Badge'
import { Button }               from '../atoms/Button'
import { Input }                from '../atoms/Input'
import { Select }               from '../atoms/Select'
import { Textarea }             from '../atoms/Textarea'
import { ProgressRing }         from '../atoms/ProgressRing'
import { EmptyState }           from '../molecules/EmptyState'
import { ToastProvider, useToast } from '../molecules/Toast'
import { Avatar }               from '../atoms/Avatar'
import type { NavSection }      from '../organisms/Sidebar'

// ── Fixtures ──────────────────────────────────────────────────────────────────

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
    label: 'BCC-2081',
    items: [
      { id: 'boq',       label: 'BOQ',            icon: FileSpreadsheet, href: '#' },
      { id: 'materials', label: 'Materials',      icon: Package,         href: '#', badge: 3 },
      { id: 'progress',  label: 'Daily Progress', icon: ClipboardList,   href: '#' },
      { id: 'inventory', label: 'Inventory',      icon: Warehouse,       href: '#', badge: 1 },
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

const PROJECTS = [
  { id: 'p1', name: 'Baneshwor Commercial Complex', code: 'BCC-2081' },
  { id: 'p2', name: 'Thankot Highway Upgrade',       code: 'THU-2081' },
  { id: 'p3', name: 'Pokhara Airport Annex',          code: 'PAA-2080' },
]

const USER = { name: 'Roshan Shrestha', role: 'Project Manager' }

// ── Data ──────────────────────────────────────────────────────────────────────

type Trade = 'Earthwork' | 'Concrete' | 'Steel' | 'Masonry' | 'MEP' | 'Finishing'
type Status = 'complete' | 'on-track' | 'at-risk' | 'delayed' | 'not-started'

interface BoqItem {
  code:        string
  description: string
  unit:        string
  qty:         number
  rate:        number
  amount:      number
  progress:    number
  trade:       Trade
  status:      Status
  notes:       string
}

const INITIAL_DATA: BoqItem[] = [
  { code:'1.01', description:'Earthwork excavation — soft soil',      unit:'cum',  qty:850,   rate:320,    amount:272000,   progress:100, trade:'Earthwork', status:'complete',     notes:'' },
  { code:'1.02', description:'Earthwork excavation — hard rock',      unit:'cum',  qty:210,   rate:580,    amount:121800,   progress:100, trade:'Earthwork', status:'complete',     notes:'' },
  { code:'2.01', description:'PCC M10 foundation concrete',           unit:'cum',  qty:95,    rate:6200,   amount:589000,   progress:87,  trade:'Concrete',  status:'on-track',     notes:'' },
  { code:'2.02', description:'RCC M25 — footings & tie beams',        unit:'cum',  qty:142,   rate:9800,   amount:1391600,  progress:73,  trade:'Concrete',  status:'on-track',     notes:'' },
  { code:'2.03', description:'RCC M30 — columns G+1',                 unit:'cum',  qty:58,    rate:11200,  amount:649600,   progress:52,  trade:'Concrete',  status:'at-risk',      notes:'Formwork delay due to rain' },
  { code:'2.04', description:'RCC M30 — beams & slabs G+1',          unit:'cum',  qty:186,   rate:10400,  amount:1934400,  progress:38,  trade:'Concrete',  status:'at-risk',      notes:'' },
  { code:'3.01', description:'Fe500 TMT rebar — all diameters',       unit:'MT',   qty:48.5,  rate:98000,  amount:4753000,  progress:61,  trade:'Steel',     status:'on-track',     notes:'' },
  { code:'3.02', description:'Structural steel sections',             unit:'MT',   qty:12.2,  rate:115000, amount:1403000,  progress:0,   trade:'Steel',     status:'delayed',      notes:'Supplier: delivery postponed to 2081-04-01' },
  { code:'4.01', description:'Brick masonry in cement mortar 1:4',    unit:'sqm',  qty:1240,  rate:1450,   amount:1798000,  progress:22,  trade:'Masonry',   status:'delayed',      notes:'' },
  { code:'4.02', description:'12mm cement plaster — external',        unit:'sqm',  qty:2100,  rate:620,    amount:1302000,  progress:0,   trade:'Masonry',   status:'not-started',  notes:'' },
  { code:'5.01', description:'Ceramic floor tiles 600×600',           unit:'sqm',  qty:480,   rate:1850,   amount:888000,   progress:0,   trade:'Finishing', status:'not-started',  notes:'' },
  { code:'5.02', description:'Two-coat weather shield paint exterior', unit:'sqm',  qty:1840,  rate:320,    amount:588800,   progress:0,   trade:'Finishing', status:'not-started',  notes:'' },
  { code:'6.01', description:'UPVC doors & windows supply & fix',     unit:'nos',  qty:68,    rate:18500,  amount:1258000,  progress:0,   trade:'Finishing', status:'not-started',  notes:'' },
  { code:'7.01', description:'Internal electrical wiring (copper)',   unit:'lot',  qty:1,     rate:850000, amount:850000,   progress:15,  trade:'MEP',       status:'on-track',     notes:'' },
  { code:'7.02', description:'Plumbing — water supply & drainage',    unit:'lot',  qty:1,     rate:620000, amount:620000,   progress:8,   trade:'MEP',       status:'on-track',     notes:'' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

const nprf = (n: number) =>
  new Intl.NumberFormat('en-NP', { maximumFractionDigits: 0 }).format(n)

const STATUS_BADGE: Record<Status, { variant: any; label: string }> = {
  'complete':    { variant: 'success', label: 'Complete'    },
  'on-track':    { variant: 'primary', label: 'On track'    },
  'at-risk':     { variant: 'warning', label: 'At risk'     },
  'delayed':     { variant: 'danger',  label: 'Delayed'     },
  'not-started': { variant: 'default', label: 'Not started' },
}

const TRADE_BADGE: Record<Trade, any> = {
  Earthwork: 'default',
  Concrete:  'primary',
  Steel:     'info',
  Masonry:   'warning',
  MEP:       'success',
  Finishing: 'default',
}

const UNITS = [
  { value:'m',   label:'m  — Metre'         },
  { value:'sqm', label:'sqm — Square metre'  },
  { value:'cum', label:'cum — Cubic metre'   },
  { value:'rft', label:'rft — Running foot'  },
  { value:'kg',  label:'kg  — Kilogram'      },
  { value:'MT',  label:'MT  — Metric tonne'  },
  { value:'nos', label:'nos — Numbers'       },
  { value:'lot', label:'lot — Lump sum'      },
  { value:'bag', label:'bag — Bag (50 kg)'   },
]

// ── Column definitions ────────────────────────────────────────────────────────

const col = createColumnHelper<BoqItem>()

function buildColumns() {
  return [
    selectionColumn<BoqItem>(),
    col.accessor('code', {
      header: 'Code', size: 70,
      cell: (i) => <span className="font-mono text-xs text-[--text-secondary]">{i.getValue()}</span>,
    }),
    col.accessor('description', {
      header: 'Description', size: 300,
      cell: (i) => <span className="font-medium">{i.getValue()}</span>,
    }),
    col.accessor('trade', {
      header: 'Trade', size: 100,
      cell: (i) => <Badge variant={TRADE_BADGE[i.getValue()]} size="sm">{i.getValue()}</Badge>,
    }),
    col.accessor('unit', {
      header: 'Unit', size: 55,
      cell: (i) => <span className="text-[--text-secondary]">{i.getValue()}</span>,
    }),
    col.accessor('qty', {
      header: 'Qty', size: 80,
      cell: (i) => <span className="tabular-nums">{i.getValue()}</span>,
    }),
    col.accessor('rate', {
      header: 'Rate (NPR)', size: 110,
      cell: (i) => <span className="tabular-nums text-right block">{nprf(i.getValue())}</span>,
    }),
    col.accessor('amount', {
      header: 'Amount (NPR)', size: 130,
      cell: (i) => <span className="tabular-nums font-semibold text-right block">{nprf(i.getValue())}</span>,
    }),
    col.accessor('progress', {
      header: '%', size: 60,
      cell: (i) => (
        <div className="flex items-center gap-1.5">
          <ProgressRing value={i.getValue()} size="sm" description={`${i.getValue()}%`} />
          <span className="tabular-nums text-xs text-[--text-tertiary]">{i.getValue()}</span>
        </div>
      ),
    }),
    col.accessor('status', {
      header: 'Status', size: 110,
      cell: (i) => {
        const s = STATUS_BADGE[i.getValue()]
        return <Badge variant={s.variant} dot size="sm">{s.label}</Badge>
      },
    }),
  ]
}

// ── Tab: Summary ──────────────────────────────────────────────────────────────

function SummaryTab({ data }: { data: BoqItem[] }) {
  const total       = data.reduce((s, r) => s + r.amount, 0)
  const done        = data.reduce((s, r) => s + r.amount * (r.progress / 100), 0)
  const remaining   = total - done
  const overallPct  = Math.round((done / total) * 100)

  const byTrade = (['Earthwork','Concrete','Steel','Masonry','MEP','Finishing'] as Trade[]).map((t) => {
    const rows   = data.filter((r) => r.trade === t)
    const tTotal = rows.reduce((s, r) => s + r.amount, 0)
    const tDone  = rows.reduce((s, r) => s + r.amount * (r.progress / 100), 0)
    const pct    = tTotal ? Math.round((tDone / tTotal) * 100) : 0
    return { trade: t, count: rows.length, amount: tTotal, done: tDone, pct }
  }).filter((t) => t.count > 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
        <MetricCard
          label="Contract value"
          value={`₨ ${nprf(total)}`}
          status="ok"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <MetricCard
          label="Work certified"
          value={`₨ ${nprf(Math.round(done))}`}
          trend={overallPct}
          trendLabel="% complete"
          status="ok"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <MetricCard
          label="Remaining value"
          value={`₨ ${nprf(Math.round(remaining))}`}
          status="ok"
          icon={<Clock className="h-5 w-5" />}
        />
        <MetricCard
          label="Delayed items"
          value={String(data.filter((r) => r.status === 'delayed').length)}
          status={data.filter((r) => r.status === 'delayed').length > 0 ? 'danger' : 'ok'}
          icon={<AlertTriangle className="h-5 w-5" />}
          trendPositiveIsGood={false}
        />
      </div>

      {/* Trade breakdown */}
      <Card>
        <CardHeader bordered>
          <CardTitle>Breakdown by trade</CardTitle>
        </CardHeader>
        <CardBody padding="none">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                {['Trade', 'Items', 'Contract (NPR)', 'Certified (NPR)', 'Progress'].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {byTrade.map((t, i) => (
                <tr key={t.trade} style={{ borderBottom: i < byTrade.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <td style={{ padding: '10px 16px' }}>
                    <Badge variant={TRADE_BADGE[t.trade]} size="sm">{t.trade}</Badge>
                  </td>
                  <td style={{ padding: '10px 16px', color: 'var(--text-secondary)', tabularNums: true } as any}>{t.count}</td>
                  <td style={{ padding: '10px 16px', fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>{nprf(t.amount)}</td>
                  <td style={{ padding: '10px 16px', fontVariantNumeric: 'tabular-nums' }}>{nprf(Math.round(t.done))}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: 'var(--surface-hover)', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: '3px', width: `${t.pct}%`,
                          background: t.pct === 100 ? 'var(--color-success-icon)' : t.pct >= 50 ? 'var(--action-primary-bg)' : t.pct > 0 ? 'var(--color-warning-icon)' : 'var(--border-default)',
                          transition: 'width 0.4s ease',
                        }} />
                      </div>
                      <span style={{ fontSize: '12px', fontVariantNumeric: 'tabular-nums', color: 'var(--text-secondary)', minWidth: '32px' }}>{t.pct}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  )
}

// ── Tab: Alerts ───────────────────────────────────────────────────────────────

function AlertsTab({ data }: { data: BoqItem[] }) {
  const atRisk  = data.filter((r) => r.status === 'at-risk')
  const delayed = data.filter((r) => r.status === 'delayed')

  if (atRisk.length === 0 && delayed.length === 0) {
    return (
      <EmptyState
        variant="default"
        title="No active alerts"
        description="All BOQ items are on track. We'll notify you if anything needs attention."
        size="md"
      />
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {[
        ...delayed.map((r) => ({ ...r, alertVariant: 'danger' as const, alertLabel: 'Delayed' })),
        ...atRisk.map((r)  => ({ ...r, alertVariant: 'warning' as const, alertLabel: 'At risk' })),
      ].map((item) => (
        <div key={item.code} style={{
          display: 'flex', gap: '14px', alignItems: 'flex-start',
          padding: '14px 16px', borderRadius: '12px',
          background: item.alertVariant === 'danger' ? 'var(--color-danger-bg-subtle)' : 'var(--color-warning-bg-subtle)',
          border: `1px solid ${item.alertVariant === 'danger' ? 'var(--color-danger-border)' : 'var(--color-warning-border)'}`,
        }}>
          <AlertTriangle
            className="h-5 w-5 mt-0.5 shrink-0"
            style={{ color: item.alertVariant === 'danger' ? 'var(--color-danger-icon)' : 'var(--color-warning-icon)' }}
            aria-hidden
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
              <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '11px', color: 'var(--text-tertiary)' }}>{item.code}</span>
              <Badge variant={item.alertVariant} size="sm">{item.alertLabel}</Badge>
            </div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>{item.description}</p>
            {item.notes && (
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.notes}</p>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <ProgressRing value={item.progress} size="sm" description={`${item.progress}% complete`} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Tab: Change history ───────────────────────────────────────────────────────

function HistoryTab() {
  const events = [
    { user: 'Roshan Shrestha', action: 'Updated rate for RCC M30 columns — ₨ 10,800 → ₨ 11,200',  time: '2081-03-14 16:42', variant: 'ok'      },
    { user: 'Anita Tamang',    action: 'Approved BOQ revision 3 — rebar quantity increase +8%',     time: '2081-03-12 14:22', variant: 'ok'      },
    { user: 'Roshan Shrestha', action: 'Flagged item 3.02 as delayed — supplier delivery pushed',   time: '2081-03-10 09:18', variant: 'warning' },
    { user: 'System',          action: 'BOQ re-priced using current market index (2081 Q3)',         time: '2081-02-28 00:00', variant: 'info'    },
    { user: 'Bikash Karki',    action: 'Marked items 1.01, 1.02 as 100% complete',                  time: '2081-02-20 17:05', variant: 'ok'      },
    { user: 'Anita Tamang',    action: 'Approved initial BOQ — 15 line items, ₨ 9.16 Cr',           time: '2081-01-15 11:00', variant: 'ok'      },
    { user: 'Roshan Shrestha', action: 'Imported BOQ from Excel template (rev-2.xlsx)',              time: '2081-01-15 10:45', variant: 'info'    },
  ]

  return (
    <Card>
      <CardBody padding="none">
        {events.map(({ user, action, time, variant }, i) => (
          <div key={i} style={{
            display: 'flex', gap: '12px', alignItems: 'flex-start',
            padding: '12px 20px',
            borderBottom: i < events.length - 1 ? '1px solid var(--border-subtle)' : 'none',
          }}>
            <div style={{ position: 'relative', marginTop: '2px' }}>
              <Avatar name={user} size="sm" />
              <span style={{
                position: 'absolute', bottom: '-1px', right: '-1px',
                width: 8, height: 8, borderRadius: '50%',
                background: variant === 'ok' ? 'var(--color-success-icon)' : variant === 'warning' ? 'var(--color-warning-icon)' : 'var(--color-info-icon)',
                border: '1.5px solid var(--surface-card)',
              }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{user} </span>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{action}</span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', marginTop: '2px' }}>{time}</span>
          </div>
        ))}
      </CardBody>
    </Card>
  )
}

// ── Edit Item Dialog ──────────────────────────────────────────────────────────

function EditItemDialog({
  item,
  open,
  onOpenChange,
  onSave,
}: {
  item:         BoqItem | null
  open:         boolean
  onOpenChange: (v: boolean) => void
  onSave:       (updated: BoqItem) => void
}) {
  const [form, setForm] = useState<Partial<BoqItem>>({})

  // Sync form when item changes
  const currentItem = { ...(item ?? {}), ...form } as BoqItem

  const set = (key: keyof BoqItem, value: any) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSave = () => {
    if (!item) return
    const qty    = Number(currentItem.qty)  || item.qty
    const rate   = Number(currentItem.rate) || item.rate
    onSave({ ...item, ...form, qty, rate, amount: qty * rate })
    setForm({})
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setForm({}) }}>
      <DialogContent variant="modal" size="md">
        <DialogHeader bordered>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <DialogTitle>Edit BOQ line item</DialogTitle>
            {item && <Badge variant="default" size="sm" style={{ fontFamily: 'monospace' }}>{item.code}</Badge>}
          </div>
          <DialogDescription>
            Changes will update quantity, rate, and recalculate the line amount.
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Input
              label="Description"
              value={currentItem.description ?? ''}
              onChange={(e) => set('description', e.target.value)}
              required
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                label="Quantity"
                type="number"
                value={String(currentItem.qty ?? '')}
                onChange={(e) => set('qty', e.target.value)}
                hint="Measured quantity"
                required
              />
              <Select
                label="Unit"
                options={UNITS}
                value={currentItem.unit}
                onValueChange={(v) => set('unit', v)}
                required
              />
            </div>
            <Input
              label="Rate (NPR)"
              type="number"
              value={String(currentItem.rate ?? '')}
              onChange={(e) => set('rate', e.target.value)}
              hint={`Line amount: ₨ ${nprf((Number(currentItem.qty) || 0) * (Number(currentItem.rate) || 0))}`}
              required
            />
            <Textarea
              label="Notes"
              value={currentItem.notes ?? ''}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Reason for change, supplier info, site conditions…"
              rows={2}
              autoResize
              maxRows={5}
            />
          </div>
        </DialogBody>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Discard</Button>
          </DialogClose>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Delete Confirm Dialog ─────────────────────────────────────────────────────

function DeleteConfirmDialog({
  code,
  open,
  onOpenChange,
  onConfirm,
}: {
  code:         string | null
  open:         boolean
  onOpenChange: (v: boolean) => void
  onConfirm:    () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="modal" size="sm">
        <DialogHeader>
          <div style={{
            width: 44, height: 44, borderRadius: '50%', marginBottom: '14px',
            background: 'var(--color-danger-bg-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Trash2 className="h-5 w-5" style={{ color: 'var(--color-danger-icon)' }} aria-hidden />
          </div>
          <DialogTitle>Delete line item?</DialogTitle>
          <DialogDescription>
            BOQ item <strong style={{ color: 'var(--text-primary)' }}>{code}</strong> will be permanently
            removed. This cannot be undone and will affect the contract total.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button variant="destructive" onClick={onConfirm}>Delete item</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

function BOQPageContent() {
  const { toast } = useToast()

  // Layout
  const [activeNav,     setActiveNav]     = useState('boq')
  const [activeProject, setActiveProject] = useState(PROJECTS[0])

  // Data
  const [data, setData] = useState<BoqItem[]>(INITIAL_DATA)

  // Filters
  const [search,       setSearch]       = useState('')
  const [tradeFilter,  setTradeFilter]  = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Dialogs
  const [editOpen,   setEditOpen]   = useState(false)
  const [editItem,   setEditItem]   = useState<BoqItem | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteCode, setDeleteCode] = useState<string | null>(null)

  // Computed
  const filtered = useMemo(() =>
    data.filter((r) =>
      (!tradeFilter  || r.trade  === tradeFilter)  &&
      (!statusFilter || r.status === statusFilter) &&
      (!search       || r.description.toLowerCase().includes(search.toLowerCase()) || r.code.includes(search)),
    ),
  [data, tradeFilter, statusFilter, search])

  const alertCount = data.filter((r) => r.status === 'at-risk' || r.status === 'delayed').length

  const activeFilters = [
    tradeFilter  && { id:'trade',  label:'Trade',  value:tradeFilter,  onRemove: () => setTradeFilter('')  },
    statusFilter && { id:'status', label:'Status', value:statusFilter, onRemove: () => setStatusFilter('') },
  ].filter(Boolean) as any[]

  // Handlers
  const handleEdit = (item: BoqItem) => { setEditItem(item); setEditOpen(true) }

  const handleSave = (updated: BoqItem) => {
    setData((prev) => prev.map((r) => r.code === updated.code ? updated : r))
    setEditOpen(false)
    setEditItem(null)
    toast({ title: 'Changes saved', description: `${updated.code} — ${updated.description}`, variant: 'success' })
  }

  const handleDeleteRequest = (code: string) => { setDeleteCode(code); setDeleteOpen(true) }

  const handleDeleteConfirm = () => {
    const item = data.find((r) => r.code === deleteCode)
    setData((prev) => prev.filter((r) => r.code !== deleteCode))
    setDeleteOpen(false)
    setDeleteCode(null)
    toast({ title: 'Item deleted', description: `${item?.code} removed from BOQ`, variant: 'warning' })
  }

  const handleDuplicate = (item: BoqItem) => {
    const newCode = `${item.code}-copy`
    const newItem: BoqItem = { ...item, code: newCode, progress: 0, status: 'not-started', notes: `Duplicated from ${item.code}` }
    setData((prev) => [...prev, newItem])
    toast({ title: 'Item duplicated', description: `${newCode} added to BOQ`, variant: 'info' })
  }

  const handleBulkExport = (rows: Row<BoqItem>[]) =>
    toast({ title: `Exporting ${rows.length} items`, description: 'Download will start shortly', variant: 'info' })

  const handleBulkDelete = (rows: Row<BoqItem>[]) => {
    const codes = rows.map((r) => r.original.code)
    setData((prev) => prev.filter((r) => !codes.includes(r.code)))
    toast({ title: `${codes.length} items deleted`, variant: 'warning' })
  }

  const columns = useMemo(
    () => buildColumns(),
    [],
  )

  const rowActions = [
    { label: 'Edit item',   icon: <Edit3  className="h-4 w-4" />, onClick: (r: Row<BoqItem>) => handleEdit(r.original) },
    { label: 'Duplicate',   icon: <Copy   className="h-4 w-4" />, onClick: (r: Row<BoqItem>) => handleDuplicate(r.original) },
    { label: 'Delete item', icon: <Trash2 className="h-4 w-4" />, variant: 'destructive' as const, onClick: (r: Row<BoqItem>) => handleDeleteRequest(r.original.code) },
  ]

  const bulkActions = [
    { label: 'Export selected', icon: <Download className="h-4 w-4" />, onClick: handleBulkExport },
    { label: 'Delete selected', icon: <Trash2   className="h-4 w-4" />, variant: 'destructive' as const, onClick: handleBulkDelete },
  ]

  // Sidebar user footer
  const sidebarFooter = (
    <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'4px 8px', borderRadius:'6px', cursor:'pointer' }}>
      <Avatar name={USER.name} size="sm" status="online" />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize:'13px', fontWeight:600, color:'white', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{USER.name}</div>
        <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.45)' }}>{USER.role}</div>
      </div>
    </div>
  )

  return (
    <div style={{ height: '100vh' }}>
      <AppShell
        sidebarProps={{
          navigation: NAV,
          activeId:   activeNav,
          onNavigate: (item) => setActiveNav(item.id),
          footer:     sidebarFooter,
        }}
        headerProps={{
          projects:          PROJECTS,
          activeProject,
          user:              USER,
          notificationCount: alertCount,
          onProjectChange:   setActiveProject,
        }}
      >
        {/* ── Page wrapper ── */}
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

          {/* ── Page header ── */}
          <PageHeader
            title="Bill of Quantities"
            description={`${activeProject.name} · ${data.length} line items · Contract: ₨ ${nprf(data.reduce((s, r) => s + r.amount, 0))}`}
            breadcrumb={[
              { label: 'Projects', onClick: () => setActiveNav('projects') },
              { label: activeProject.code, onClick: () => setActiveNav('dashboard') },
              { label: 'BOQ' },
            ]}
            badge={<Badge variant="primary" dot>Active</Badge>}
            actions={
              <div style={{ display:'flex', gap:'8px' }}>
                <Button variant="secondary" size="sm" iconLeft={<Download className="h-4 w-4" />}>
                  Export
                </Button>
                <Button variant="secondary" size="sm" iconLeft={<Upload className="h-4 w-4" />}>
                  Import
                </Button>
                <Button size="sm" iconLeft={<Plus className="h-4 w-4" />}
                  onClick={() => {
                    const blank: BoqItem = { code:`${data.length + 1}.01`, description:'New line item', unit:'nos', qty:1, rate:0, amount:0, progress:0, trade:'Concrete', status:'not-started', notes:'' }
                    handleEdit(blank)
                  }}
                >
                  Add item
                </Button>
              </div>
            }
          />

          {/* ── Tabs ── */}
          <Tabs
            variant="underline"
            items={[
              {
                value: 'items',
                label: 'Line items',
                count: filtered.length,
                content: (
                  <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                    {/* FilterBar */}
                    <FilterBar
                      filters={activeFilters}
                      onClearAll={() => { setTradeFilter(''); setStatusFilter('') }}
                      leftSlot={
                        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                          {/* Inline search */}
                          <div style={{ position:'relative', width:'220px' }}>
                            <Search className="h-3.5 w-3.5" style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text-tertiary)', pointerEvents:'none' }} aria-hidden />
                            <input
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                              placeholder="Search by code or description…"
                              style={{ width:'100%', height:'32px', paddingLeft:'30px', paddingRight: search ? '28px' : '10px', borderRadius:'8px', border:'1px solid var(--border-default)', background:'var(--surface-input)', color:'var(--text-primary)', fontSize:'13px', outline:'none' }}
                              aria-label="Search BOQ items"
                            />
                            {search && (
                              <button onClick={() => setSearch('')} style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', color:'var(--text-tertiary)', background:'none', border:'none', cursor:'pointer', display:'flex' }} aria-label="Clear search">
                                <X className="h-3.5 w-3.5" aria-hidden />
                              </button>
                            )}
                          </div>
                          <div style={{ width:'130px' }}>
                            <Select
                              options={(['Earthwork','Concrete','Steel','Masonry','MEP','Finishing'] as Trade[]).map((t) => ({ value:t, label:t }))}
                              value={tradeFilter}
                              onValueChange={setTradeFilter}
                              placeholder="All trades"
                              size="sm"
                            />
                          </div>
                          <div style={{ width:'145px' }}>
                            <Select
                              options={[
                                { value:'complete',    label:'Complete'    },
                                { value:'on-track',    label:'On track'    },
                                { value:'at-risk',     label:'At risk'     },
                                { value:'delayed',     label:'Delayed'     },
                                { value:'not-started', label:'Not started' },
                              ]}
                              value={statusFilter}
                              onValueChange={setStatusFilter}
                              placeholder="All statuses"
                              size="sm"
                            />
                          </div>
                        </div>
                      }
                    />

                    {/* DataTable */}
                    <DataTable<BoqItem>
                      columns={columns}
                      data={filtered}
                      rowActions={rowActions}
                      bulkActions={bulkActions}
                      columnToggle
                      pagination
                      pageSize={8}
                      stickyHeader
                      aria-label="Bill of Quantities line items"
                      emptyState={
                        <EmptyState
                          variant="search"
                          title="No items match the current filters"
                          description="Try a different keyword, or clear the trade and status filters."
                          action={{ label: 'Clear filters', onClick: () => { setSearch(''); setTradeFilter(''); setStatusFilter('') }, variant: 'secondary' }}
                          size="sm"
                        />
                      }
                    />
                  </div>
                ),
              },
              {
                value:   'summary',
                label:   'Summary',
                content: <SummaryTab data={data} />,
              },
              {
                value:   'alerts',
                label:   'Alerts',
                count:   alertCount,
                content: <AlertsTab data={data} />,
              },
              {
                value:   'history',
                label:   'Change history',
                content: <HistoryTab />,
              },
            ]}
          />
        </div>

        {/* ── Dialogs (rendered outside Tabs so they overlay the full viewport) ── */}
        <EditItemDialog
          item={editItem}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSave={handleSave}
        />
        <DeleteConfirmDialog
          code={deleteCode}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          onConfirm={handleDeleteConfirm}
        />
      </AppShell>
    </div>
  )
}

// ── Storybook meta ────────────────────────────────────────────────────────────

const meta = {
  title:     'Pages/BOQ Page',
  component:  BOQPageContent,
  tags:      ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
Full-page composition: **Bill of Quantities**.

Demonstrates all library components working together in a real CIP screen:

\`AppShell\` · \`PageHeader\` · \`FilterBar\` · \`Tabs\` · \`DataTable\` ·
\`Dialog\` (edit + confirm delete) · \`Toast\` · \`MetricCard\` · \`Card\` ·
\`Badge\` · \`Button\` · \`Input\` · \`Select\` · \`Textarea\` ·
\`ProgressRing\` · \`EmptyState\` · \`Avatar\`

All state is local — no router or external store required.
        `.trim(),
      },
    },
  },
  decorators: [
    (Story: any) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
} satisfies Meta<any>

export default meta

export const Default: StoryObj<any> = {
  name: '📐 BOQ Page — full layout',
  render: () => <BOQPageContent />,
}
