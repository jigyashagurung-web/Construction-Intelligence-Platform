/**
 * Full-page composition: Materials & Inventory
 * Stock tracking, consumption recording, and purchase-order creation.
 */
import { useState, useMemo } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { createColumnHelper } from '@tanstack/react-table'
import {
  LayoutDashboard, FolderKanban, FileText, Package,
  Settings2, ShieldCheck, Users, Plus, ClipboardList,
  Truck, AlertTriangle, TrendingDown, DollarSign,
  BarChart3, Search, X,
} from 'lucide-react'
import { AppShell }     from '../organisms/AppShell'
import { DataTable, selectionColumn } from '../organisms/DataTable'
import { PageHeader }   from '../molecules/PageHeader'
import { FilterBar }    from '../molecules/FilterBar'
import { MetricCard }   from '../molecules/MetricCard'
import { EmptyState }   from '../molecules/EmptyState'
import { ToastProvider, useToast } from '../molecules/Toast'
import { Badge }        from '../atoms/Badge'
import { Button }       from '../atoms/Button'
import { Input }        from '../atoms/Input'
import { Select }       from '../atoms/Select'
import { Textarea }     from '../atoms/Textarea'
import { Avatar }       from '../atoms/Avatar'
import { DatePicker }   from '../atoms/DatePicker'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogBody, DialogFooter, DialogClose,
} from '../organisms/Dialog'
import type { NavSection } from '../organisms/Sidebar'
import type { Row } from '@tanstack/react-table'

// ── Nav ───────────────────────────────────────────────────────────────────────

const NAV: NavSection[] = [
  {
    id: 'main',
    items: [
      { id: 'dashboard',  label: 'Dashboard',   icon: LayoutDashboard, href: '#' },
      { id: 'projects',   label: 'Projects',    icon: FolderKanban,    href: '#' },
      { id: 'dpr',        label: 'Daily Reports', icon: FileText,      href: '#' },
      { id: 'materials',  label: 'Materials',   icon: Package,         href: '#' },
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
const USER           = { name: 'Anita Tamang', role: 'Project Manager' }

// ── Types ─────────────────────────────────────────────────────────────────────

type MaterialCategory = 'Cement & Concrete' | 'Steel & Rebar' | 'Masonry' | 'MEP' | 'Formwork' | 'Finishing' | 'Safety'
type StockStatus      = 'ok' | 'low' | 'critical' | 'out'

interface MaterialItem {
  id:           string
  code:         string
  name:         string
  category:     MaterialCategory
  unit:         string
  openingStock: number
  received:     number
  consumed:     number
  closingStock: number   // opening + received - consumed
  minLevel:     number   // reorder point
  maxLevel:     number   // capacity
  unitRate:     number   // NPR
  lastUpdated:  string   // BS date
  status:       StockStatus
}

// ── Seed data ─────────────────────────────────────────────────────────────────

function makeItem(
  id: string, code: string, name: string, category: MaterialCategory,
  unit: string, opening: number, received: number, consumed: number,
  min: number, max: number, rate: number,
): MaterialItem {
  const closing = opening + received - consumed
  let status: StockStatus = 'ok'
  if (closing <= 0) status = 'out'
  else if (closing <= min * 0.35) status = 'critical'
  else if (closing < min) status = 'low'
  return {
    id, code, name, category, unit,
    openingStock: opening, received, consumed,
    closingStock: closing,
    minLevel: min, maxLevel: max, unitRate: rate,
    lastUpdated: '2081-04-02', status,
  }
}

const INITIAL_DATA: MaterialItem[] = [
  makeItem('1','CEM-001','OPC 43 Grade Cement',          'Cement & Concrete', 'bags',  450,  200, 180, 100, 600,    950),
  makeItem('2','CEM-002','PPC Cement',                   'Cement & Concrete', 'bags',  120,    0,  98, 100, 400,    900),  // low
  makeItem('3','CEM-003','Ready-mix concrete M25',       'Cement & Concrete', 'm³',     24,   12,  30,   5,  40,  8500),
  makeItem('4','STL-001','TMT Fe-500 Rebar 16mm',        'Steel & Rebar',     'MT',      8.5,  0,   6.2,  5,  20, 120000),
  makeItem('5','STL-002','TMT Fe-500 Rebar 12mm',        'Steel & Rebar',     'MT',      3.2,  0,   2.8,  3,  15, 118000), // critical
  makeItem('6','STL-003','Binding wire 18 SWG',          'Steel & Rebar',     'kg',    150,    0,  80,  50, 300,    120),
  makeItem('7','MAS-001','Modular brick (230×110×75)',   'Masonry',           'nos',  5000,    0, 820, 2000,10000,   18),
  makeItem('8','MAS-002','AAC blocks 600×200×150',       'Masonry',           'nos',   200,    0,  90,  100, 500,   85),
  makeItem('9','MEP-001','CPVC pipe 20mm',               'MEP',               'm',       0,    0,   0,   50, 200,  120),  // out
  makeItem('10','MEP-002','Electrical conduit 20mm PVC', 'MEP',               'm',     220,    0, 135,  80, 400,   45),
  makeItem('11','MEP-003','MCB Single pole 6A',          'MEP',               'nos',    35,    0,  12,  20, 100,  380),
  makeItem('12','FOR-001','12mm shuttering plywood',     'Formwork',          'sheets', 45,    0,  12,  20, 100, 2200),
  makeItem('13','FIN-001','Ceramic floor tile 600×600',  'Finishing',         'm²',     85,   40,   0,  20, 200,  950),
  makeItem('14','SAF-001','Safety helmets (IS certified)','Safety',           'nos',    32,    0,   0,  25,  50,  450),
  makeItem('15','SAF-002','Reflective safety vests',     'Safety',            'nos',    18,    0,   0,  20,  50,  280),  // low
]

// ── Helpers ───────────────────────────────────────────────────────────────────

const nprc = (n: number) => {
  if (n >= 10000000) return `₨ ${(n / 10000000).toFixed(2)} Cr`
  if (n >= 100000)   return `₨ ${(n / 100000).toFixed(1)} L`
  if (n >= 1000)     return `₨ ${(n / 1000).toFixed(1)} K`
  return `₨ ${n.toLocaleString()}`
}

const STATUS_CONFIG: Record<StockStatus, { variant: any; label: string; color: string }> = {
  ok:       { variant:'success', label:'OK',       color:'var(--color-success-icon)' },
  low:      { variant:'warning', label:'Low',      color:'var(--color-warning-icon)' },
  critical: { variant:'danger',  label:'Critical', color:'var(--color-danger-icon)'  },
  out:      { variant:'danger',  label:'Out',      color:'var(--color-danger-icon)'  },
}

const CAT_COLORS: Record<MaterialCategory, string> = {
  'Cement & Concrete': '#6366f1',
  'Steel & Rebar':     '#f59e0b',
  'Masonry':           '#8b5cf6',
  'MEP':               '#06b6d4',
  'Formwork':          '#84cc16',
  'Finishing':         '#f97316',
  'Safety':            '#ef4444',
}

// ── Stock gauge cell ──────────────────────────────────────────────────────────

function StockGauge({ item }: { item: MaterialItem }) {
  const pct   = item.maxLevel > 0 ? Math.min(100, (item.closingStock / item.maxLevel) * 100) : 0
  const minPct = item.maxLevel > 0 ? (item.minLevel / item.maxLevel) * 100 : 0
  const cfg   = STATUS_CONFIG[item.status]
  return (
    <div style={{ minWidth: 140 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
        <span style={{ fontSize:12, fontWeight:700, fontVariantNumeric:'tabular-nums', color:'var(--text-primary)' }}>
          {item.closingStock.toLocaleString()}
        </span>
        <span style={{ fontSize:11, color:'var(--text-tertiary)' }}>{item.unit}</span>
      </div>
      <div style={{ position:'relative', height:6, borderRadius:3, background:'var(--surface-hover)' }}>
        {/* Fill */}
        <div style={{
          position:'absolute', left:0, top:0, height:'100%', borderRadius:3,
          width:`${pct}%`, background: cfg.color,
          transition:'width 0.3s',
        }} />
        {/* Min-level marker */}
        <div style={{
          position:'absolute', top:-1, height:8, width:2, borderRadius:1,
          left:`${minPct}%`, background:'var(--text-tertiary)', opacity:0.5,
        }} title={`Reorder point: ${item.minLevel} ${item.unit}`} />
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:2 }}>
        <span style={{ fontSize:10, color:'var(--text-tertiary)' }}>min {item.minLevel}</span>
        <span style={{ fontSize:10, color:'var(--text-tertiary)' }}>{item.maxLevel}</span>
      </div>
    </div>
  )
}

// ── Dialogs ───────────────────────────────────────────────────────────────────

function RecordUsageDialog({
  item,
  onClose,
  onSave,
}: {
  item:    MaterialItem | null
  onClose: () => void
  onSave:  (qty: number, notes: string) => void
}) {
  const [qty,   setQty]   = useState('')
  const [date,  setDate]  = useState('2081-04-02')
  const [trade, setTrade] = useState('')
  const [notes, setNotes] = useState('')

  function handleSave() {
    const n = parseFloat(qty)
    if (!n || n <= 0) return
    onSave(n, notes)
    setQty(''); setNotes(''); setTrade('')
  }

  return (
    <Dialog open={Boolean(item)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Record material usage</DialogTitle>
        </DialogHeader>
        <DialogBody>
          {item && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ padding:'10px 14px', borderRadius:8, background:'var(--surface-hover)', display:'flex', alignItems:'center', gap:10 }}>
                <Package className="h-4 w-4" style={{ color:'var(--text-tertiary)', flexShrink:0 }} aria-hidden />
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)' }}>{item.name}</p>
                  <p style={{ fontSize:11, color:'var(--text-tertiary)' }}>{item.code} · Available: {item.closingStock} {item.unit}</p>
                </div>
              </div>
              <DatePicker mode="bs" label="Usage date" value={date} onChange={setDate} required />
              <Input
                label={`Quantity used (${item.unit})`}
                type="number"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                hint={`Available: ${item.closingStock} ${item.unit}`}
                error={parseFloat(qty) > item.closingStock ? 'Quantity exceeds available stock' : undefined}
                required
              />
              <Select
                label="Used by (trade)"
                options={[
                  { value:'concrete', label:'Concrete gang'    },
                  { value:'steel',    label:'Bar benders'      },
                  { value:'masonry',  label:'Masonry gang'     },
                  { value:'mep',      label:'MEP contractors'  },
                  { value:'general',  label:'General works'    },
                ]}
                value={trade}
                onValueChange={setTrade}
                placeholder="Select trade…"
              />
              <Textarea
                label="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. used for G+2 slab pour…"
                rows={2}
              />
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary" size="sm">Cancel</Button>
          </DialogClose>
          <Button
            size="sm"
            disabled={!qty || parseFloat(qty) <= 0 || parseFloat(qty) > (item?.closingStock ?? 0)}
            onClick={handleSave}
          >
            Record usage
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CreatePODialog({
  item,
  onClose,
  onSubmit,
}: {
  item:     MaterialItem | null
  onClose:  () => void
  onSubmit: () => void
}) {
  const [supplier,  setSupplier]  = useState('')
  const [qty,       setQty]       = useState(() => item ? String(Math.ceil(item.maxLevel * 0.6)) : '')
  const [delivery,  setDelivery]  = useState('2081-04-10')
  const [priority,  setPriority]  = useState('normal')
  const [notes,     setNotes]     = useState('')

  // Update default qty if item changes
  const defaultQty = item ? String(Math.ceil((item.maxLevel - item.closingStock) * 0.8)) : ''

  return (
    <Dialog open={Boolean(item)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent variant="drawer" size="md">
        <DialogHeader>
          <DialogTitle>Create purchase order</DialogTitle>
        </DialogHeader>
        <DialogBody>
          {item && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {/* Item summary */}
              <div style={{ padding:'12px 14px', borderRadius:10, background:'var(--surface-hover)', display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:36, height:36, borderRadius:8, background: CAT_COLORS[item.category] + '22', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Package className="h-4 w-4" style={{ color: CAT_COLORS[item.category] }} aria-hidden />
                </div>
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)' }}>{item.name}</p>
                  <div style={{ display:'flex', gap:8, marginTop:2 }}>
                    <span style={{ fontSize:11, color:'var(--text-tertiary)' }}>{item.code}</span>
                    <Badge variant={STATUS_CONFIG[item.status].variant} size="sm" dot>{STATUS_CONFIG[item.status].label}</Badge>
                  </div>
                </div>
              </div>

              {/* Stock context */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, padding:'12px', borderRadius:8, border:'1px solid var(--border-default)' }}>
                <div style={{ textAlign:'center' }}>
                  <p style={{ fontSize:20, fontWeight:700, color:'var(--text-primary)', fontVariantNumeric:'tabular-nums' }}>{item.closingStock}</p>
                  <p style={{ fontSize:10, color:'var(--text-tertiary)', textTransform:'uppercase' }}>Current</p>
                </div>
                <div style={{ textAlign:'center', borderLeft:'1px solid var(--border-subtle)', borderRight:'1px solid var(--border-subtle)' }}>
                  <p style={{ fontSize:20, fontWeight:700, color:'var(--color-warning-text)', fontVariantNumeric:'tabular-nums' }}>{item.minLevel}</p>
                  <p style={{ fontSize:10, color:'var(--text-tertiary)', textTransform:'uppercase' }}>Reorder point</p>
                </div>
                <div style={{ textAlign:'center' }}>
                  <p style={{ fontSize:20, fontWeight:700, color:'var(--text-primary)', fontVariantNumeric:'tabular-nums' }}>{item.maxLevel}</p>
                  <p style={{ fontSize:10, color:'var(--text-tertiary)', textTransform:'uppercase' }}>Capacity</p>
                </div>
              </div>

              <Input
                label="Supplier name"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="e.g. Himal Cement Industries"
                required
              />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <Input
                  label={`Order quantity (${item.unit})`}
                  type="number"
                  value={qty || defaultQty}
                  onChange={(e) => setQty(e.target.value)}
                  hint={`Suggested: ${defaultQty} ${item.unit}`}
                  required
                />
                <Select
                  label="Priority"
                  options={[
                    { value:'normal', label:'Normal'  },
                    { value:'urgent', label:'Urgent'  },
                    { value:'asap',   label:'ASAP'    },
                  ]}
                  value={priority}
                  onValueChange={setPriority}
                />
              </div>
              <DatePicker mode="bs" label="Expected delivery date" value={delivery} onChange={setDelivery} required />
              <div style={{ padding:'10px 14px', borderRadius:8, background:'var(--surface-hover)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:12, color:'var(--text-secondary)' }}>Estimated order value</span>
                <span style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)' }}>
                  {nprc(parseFloat(qty || defaultQty || '0') * item.unitRate)}
                </span>
              </div>
              <Textarea
                label="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Delivery instructions, spec requirements…"
                rows={3}
              />
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary" size="sm">Cancel</Button>
          </DialogClose>
          <Button
            size="sm"
            iconLeft={<ClipboardList className="h-4 w-4" />}
            disabled={!supplier || !(qty || defaultQty)}
            onClick={onSubmit}
          >
            Submit PO
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Columns ───────────────────────────────────────────────────────────────────

const col = createColumnHelper<MaterialItem>()

function buildColumns(): any[] {
  return [
    selectionColumn<MaterialItem>(),
    col.accessor('code', {
      header: 'Code',
      size: 96,
      cell: (i) => (
        <span style={{ fontFamily:'monospace', fontSize:11, color:'var(--text-secondary)' }}>{i.getValue()}</span>
      ),
    }),
    col.accessor('name', {
      header: 'Material',
      size: 240,
      cell: (i) => {
        const item = i.row.original
        return (
          <div>
            <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', lineHeight:1.3 }}>{item.name}</p>
            <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:2 }}>
              <span style={{ display:'inline-block', width:6, height:6, borderRadius:'50%', background: CAT_COLORS[item.category], flexShrink:0 }} />
              <span style={{ fontSize:11, color:'var(--text-tertiary)' }}>{item.category}</span>
            </div>
          </div>
        )
      },
    }),
    col.accessor('closingStock', {
      header: 'Stock level',
      size: 180,
      cell: (i) => <StockGauge item={i.row.original} />,
    }),
    col.accessor('consumed', {
      header: 'Used today',
      size: 90,
      cell: (i) => {
        const v = i.getValue()
        return (
          <span style={{ fontSize:12, fontVariantNumeric:'tabular-nums', color: v > 0 ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
            {v > 0 ? `${v} ${i.row.original.unit}` : '—'}
          </span>
        )
      },
    }),
    col.accessor('received', {
      header: 'Received',
      size: 90,
      cell: (i) => {
        const v = i.getValue()
        return (
          <span style={{ fontSize:12, fontVariantNumeric:'tabular-nums', color: v > 0 ? 'var(--color-success-text)' : 'var(--text-tertiary)' }}>
            {v > 0 ? `+${v} ${i.row.original.unit}` : '—'}
          </span>
        )
      },
    }),
    col.accessor('unitRate', {
      header: 'Unit rate',
      size: 100,
      cell: (i) => (
        <span style={{ fontSize:12, fontVariantNumeric:'tabular-nums', color:'var(--text-secondary)' }}>
          {nprc(i.getValue())} / {i.row.original.unit}
        </span>
      ),
    }),
    col.accessor('status', {
      header: 'Status',
      size: 90,
      cell: (i) => {
        const cfg = STATUS_CONFIG[i.getValue()]
        return <Badge variant={cfg.variant} dot size="sm">{cfg.label}</Badge>
      },
    }),
  ]
}

// ── Page ──────────────────────────────────────────────────────────────────────

function MaterialsContent() {
  const { toast } = useToast()

  const [data,         setData]         = useState<MaterialItem[]>(INITIAL_DATA)
  const [search,       setSearch]       = useState('')
  const [catFilter,    setCatFilter]    = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [usageItem,    setUsageItem]    = useState<MaterialItem | null>(null)
  const [poItem,       setPoItem]       = useState<MaterialItem | null>(null)

  const filtered = useMemo(() =>
    data.filter((m) =>
      (!catFilter    || m.category === catFilter) &&
      (!statusFilter || m.status   === statusFilter) &&
      (!search       || m.name.toLowerCase().includes(search.toLowerCase()) ||
                        m.code.toLowerCase().includes(search.toLowerCase())),
    ),
  [data, catFilter, statusFilter, search])

  const kpis = useMemo(() => ({
    total:       data.length,
    lowOrWorse:  data.filter((m) => m.status === 'low' || m.status === 'critical' || m.status === 'out').length,
    outOfStock:  data.filter((m) => m.status === 'out').length,
    totalValue:  data.reduce((s, m) => s + m.closingStock * m.unitRate, 0),
  }), [data])

  const activeFilters = [
    catFilter    && { id:'cat',    label:'Category', value:catFilter,    onRemove:() => setCatFilter('')    },
    statusFilter && { id:'status', label:'Status',   value:statusFilter, onRemove:() => setStatusFilter('') },
  ].filter(Boolean) as any[]

  const columns = useMemo(() => buildColumns(), [])

  const rowActions = useMemo(() => [
    {
      label: 'Record usage',
      icon:  <TrendingDown className="h-4 w-4" />,
      onClick: (row: Row<MaterialItem>) => setUsageItem(row.original),
    },
    {
      label: 'Create PO',
      icon:  <ClipboardList className="h-4 w-4" />,
      onClick: (row: Row<MaterialItem>) => setPoItem(row.original),
    },
  ], [])

  const bulkActions = useMemo(() => [
    {
      label: 'Export selected',
      onClick: (rows: Row<MaterialItem>[]) => {
        toast({ title:`Exported ${rows.length} items`, variant:'success' })
      },
    },
    {
      label: 'Create bulk PO',
      onClick: (rows: Row<MaterialItem>[]) => {
        toast({ title:`PO for ${rows.length} items`, description:'Draft purchase order created', variant:'info' })
      },
    },
  ], [toast])

  function handleRecordUsage(qty: number, notes: string) {
    if (!usageItem) return
    setData((prev) => prev.map((m) => {
      if (m.id !== usageItem.id) return m
      const newConsumed = m.consumed + qty
      const newClosing  = m.closingStock - qty
      let status: StockStatus = 'ok'
      if (newClosing <= 0)               status = 'out'
      else if (newClosing <= m.minLevel * 0.35) status = 'critical'
      else if (newClosing < m.minLevel)  status = 'low'
      return { ...m, consumed: newConsumed, closingStock: newClosing, status }
    }))
    toast({
      title:       `Usage recorded`,
      description: `${qty} ${usageItem.unit} of ${usageItem.name}${notes ? ` — ${notes}` : ''}`,
      variant:     'success',
    })
    setUsageItem(null)
  }

  function handleSubmitPO() {
    toast({
      title:       'Purchase order submitted',
      description: `PO for ${poItem?.name} has been sent for approval`,
      variant:     'success',
      duration:    6000,
    })
    setPoItem(null)
  }

  const categories: MaterialCategory[] = ['Cement & Concrete','Steel & Rebar','Masonry','MEP','Formwork','Finishing','Safety']

  return (
    <div style={{ height:'100vh' }}>
      <AppShell
        sidebarProps={{
          navigation: NAV,
          activeId:   'materials',
          footer: (
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'4px 8px' }}>
              <Avatar name={USER.name} size="sm" status="online" />
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:600, color:'white', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{USER.name}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)' }}>{USER.role}</div>
              </div>
            </div>
          ),
        }}
        headerProps={{
          projects:      [HEADER_PROJECT],
          activeProject: HEADER_PROJECT,
          user:          USER,
          notificationCount: kpis.lowOrWorse,
        }}
      >
        <div style={{ maxWidth:1360, margin:'0 auto' }}>

          {/* Page header */}
          <PageHeader
            title="Materials & Inventory"
            description={`${HEADER_PROJECT.name} · ${data.length} items tracked`}
            breadcrumb={[
              { label:'Projects',                    onClick:() => {} },
              { label:'Baneshwor Commercial Complex', onClick:() => {} },
              { label:'Materials' },
            ]}
            actions={
              <div style={{ display:'flex', gap:8 }}>
                <Button
                  variant="secondary"
                  size="sm"
                  iconLeft={<Truck className="h-4 w-4" />}
                  onClick={() => toast({ title:'Record delivery', description:'Goods receipt form coming soon', variant:'info' })}
                >
                  Receive stock
                </Button>
                <Button
                  size="sm"
                  iconLeft={<Plus className="h-4 w-4" />}
                  onClick={() => toast({ title:'New material', description:'Add material form coming soon', variant:'info' })}
                >
                  Add material
                </Button>
              </div>
            }
          />

          {/* KPI strip */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:14, marginBottom:24 }}>
            <MetricCard label="Items tracked"    value={kpis.total}        status="ok"      icon={<Package       className="h-5 w-5" />} />
            <MetricCard label="Need attention"   value={kpis.lowOrWorse}   status={kpis.lowOrWorse > 0 ? 'warning' : 'ok'} icon={<AlertTriangle  className="h-5 w-5" />} trendPositiveIsGood={false} />
            <MetricCard label="Out of stock"     value={kpis.outOfStock}   status={kpis.outOfStock > 0 ? 'danger' : 'ok'}  icon={<TrendingDown   className="h-5 w-5" />} trendPositiveIsGood={false} />
            <MetricCard label="Inventory value"  value={nprc(kpis.totalValue)} status="ok" icon={<DollarSign    className="h-5 w-5" />} />
          </div>

          {/* Filter bar */}
          <div style={{ marginBottom:16 }}>
            <FilterBar
              filters={activeFilters}
              onClearAll={() => { setCatFilter(''); setStatusFilter('') }}
              leftSlot={
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  <div style={{ position:'relative', width:220 }}>
                    <Search className="h-3.5 w-3.5" style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text-tertiary)', pointerEvents:'none' }} aria-hidden />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search materials…"
                      style={{ width:'100%', height:32, paddingLeft:30, paddingRight: search ? 28 : 10, borderRadius:8, border:'1px solid var(--border-default)', background:'var(--surface-input)', color:'var(--text-primary)', fontSize:13, outline:'none' }}
                      aria-label="Search materials"
                    />
                    {search && (
                      <button onClick={() => setSearch('')} style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-tertiary)', display:'flex' }} aria-label="Clear">
                        <X className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    )}
                  </div>
                  <div style={{ width:180 }}>
                    <Select
                      size="sm"
                      options={categories.map((c) => ({ value:c, label:c }))}
                      value={catFilter}
                      onValueChange={setCatFilter}
                      placeholder="All categories"
                    />
                  </div>
                  <div style={{ width:140 }}>
                    <Select
                      size="sm"
                      options={[
                        { value:'ok',       label:'OK'       },
                        { value:'low',      label:'Low'      },
                        { value:'critical', label:'Critical' },
                        { value:'out',      label:'Out'      },
                      ]}
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                      placeholder="All statuses"
                    />
                  </div>
                </div>
              }
              rightSlot={
                <Button variant="ghost" size="sm" iconLeft={<BarChart3 className="h-3.5 w-3.5" />}
                  onClick={() => toast({ title:'Analytics', description:'Consumption analytics dashboard coming soon', variant:'info' })}>
                  Analytics
                </Button>
              }
            />
          </div>

          {/* DataTable */}
          <DataTable<MaterialItem>
            columns={columns}
            data={filtered}
            rowActions={rowActions}
            bulkActions={bulkActions}
            searchable={false}
            columnToggle
            pagination
            pageSize={10}
            stickyHeader
            aria-label="Materials inventory"
            emptyState={
              <EmptyState
                variant="search"
                title="No materials match"
                description="Try a different category, status, or keyword."
                action={{ label:'Clear filters', onClick:() => { setSearch(''); setCatFilter(''); setStatusFilter('') }, variant:'secondary' }}
              />
            }
          />
        </div>

        {/* Dialogs */}
        <RecordUsageDialog
          item={usageItem}
          onClose={() => setUsageItem(null)}
          onSave={handleRecordUsage}
        />
        <CreatePODialog
          item={poItem}
          onClose={() => setPoItem(null)}
          onSubmit={handleSubmitPO}
        />
      </AppShell>
    </div>
  )
}

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title:      'Pages/Materials & Inventory',
  component:   MaterialsContent,
  tags:       ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Stock tracking with visual gauges, consumption recording, and purchase-order creation workflow.',
      },
    },
  },
  decorators: [(Story: any) => <ToastProvider><Story /></ToastProvider>],
} satisfies Meta<any>

export default meta

export const Default: StoryObj<any> = {
  name:   '📦 Materials & Inventory — full page',
  render: () => <MaterialsContent />,
}
