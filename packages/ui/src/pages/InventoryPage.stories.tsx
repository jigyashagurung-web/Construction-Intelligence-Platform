/**
 * Full-page composition: Inventory Management
 *
 * Site stock levels, Goods Receipt Notes (GRN), material issues,
 * and reorder management. All state is local — no external store required.
 */
import { useState, useMemo } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { createColumnHelper } from '@tanstack/react-table'
import {
  LayoutDashboard, FolderKanban, FileSpreadsheet, Package,
  ClipboardList, Warehouse, BarChart3, TrendingUp, Sparkles,
  Settings2, Users, ShieldCheck,
  Plus, Download, Truck, ArrowUpFromLine,
  AlertTriangle, CheckCircle2, XCircle, Search,
} from 'lucide-react'
import { AppShell }     from '../organisms/AppShell'
import { PageHeader }   from '../molecules/PageHeader'
import { FilterBar }    from '../molecules/FilterBar'
import { Tabs }         from '../organisms/Tabs'
import { DataTable, selectionColumn, type Row } from '../organisms/DataTable'
import { MetricCard }   from '../molecules/MetricCard'
import { EmptyState }   from '../molecules/EmptyState'
import { ToastProvider, useToast } from '../molecules/Toast'
import { Badge }        from '../atoms/Badge'
import { Button }       from '../atoms/Button'
import { Input }        from '../atoms/Input'
import { Select }       from '../atoms/Select'
import { Textarea }     from '../atoms/Textarea'
import { DatePicker }   from '../atoms/DatePicker'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogBody, DialogFooter, DialogClose,
} from '../organisms/Dialog'
import type { NavSection } from '../organisms/Sidebar'

// ── Nav fixture ───────────────────────────────────────────────────────────────

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
      { id: 'boq',       label: 'BOQ',            icon: FileSpreadsheet, href: '#' },
      { id: 'materials', label: 'Materials',      icon: Package,         href: '#' },
      { id: 'progress',  label: 'Daily Progress', icon: ClipboardList,   href: '#' },
      { id: 'inventory', label: 'Inventory',      icon: Warehouse,       href: '#', badge: 3 },
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
const USER           = { name: 'Roshan Shrestha', role: 'Quantity Surveyor' }

// ── Types ─────────────────────────────────────────────────────────────────────

type StockStatus = 'ok' | 'low' | 'critical' | 'out'

type StockItem = {
  id:           string
  item:         string
  category:     string
  unit:         string
  onHand:       number
  reorderPoint: number
  status:       StockStatus
  lastUpdated:  string
  value:        number
}

type GrnRow = {
  id:       string
  supplier: string
  invoice:  string
  date:     string
  items:    number
  value:    number
  status:   'received' | 'pending' | 'partial'
}

type IssueRow = {
  id:          string
  issuedTo:    string
  activity:    string
  date:        string
  items:       number
  issuedBy:    string
}

// ── Stock data ────────────────────────────────────────────────────────────────

const STOCK: StockItem[] = [
  { id: 'S01', item: 'TMT Rebar 12mm',         category: 'Steel',       unit: 'kg',     onHand: 1_240, reorderPoint: 500,  status: 'ok',       lastUpdated: '2 days ago',   value: 98_000  },
  { id: 'S02', item: 'Cement OPC 53',           category: 'Cement',      unit: 'bags',   onHand: 180,   reorderPoint: 200,  status: 'low',      lastUpdated: 'Today',        value: 21_600  },
  { id: 'S03', item: 'Aggregate 20mm',          category: 'Aggregate',   unit: 'm³',     onHand: 45,    reorderPoint: 10,   status: 'ok',       lastUpdated: '3 days ago',   value: 31_500  },
  { id: 'S04', item: 'River Sand',              category: 'Aggregate',   unit: 'm³',     onHand: 8,     reorderPoint: 15,   status: 'low',      lastUpdated: 'Today',        value: 4_000   },
  { id: 'S05', item: 'Binding Wire',            category: 'Steel',       unit: 'kg',     onHand: 85,    reorderPoint: 50,   status: 'ok',       lastUpdated: 'Yesterday',    value: 8_500   },
  { id: 'S06', item: 'Shuttering Plywood 18mm', category: 'Formwork',    unit: 'sheets', onHand: 3,     reorderPoint: 20,   status: 'critical', lastUpdated: 'Today',        value: 1_800   },
  { id: 'S07', item: 'PVC Pipe 110mm',          category: 'Plumbing',    unit: 'm',      onHand: 340,   reorderPoint: 100,  status: 'ok',       lastUpdated: '5 days ago',   value: 17_000  },
  { id: 'S08', item: 'Electrical Conduit 25mm', category: 'Electrical',  unit: 'm',      onHand: 680,   reorderPoint: 200,  status: 'ok',       lastUpdated: '4 days ago',   value: 13_600  },
  { id: 'S09', item: 'Ceramic Tiles 600×600',   category: 'Finishing',   unit: 'm²',     onHand: 0,     reorderPoint: 50,   status: 'out',      lastUpdated: '2 weeks ago',  value: 0       },
  { id: 'S10', item: 'Waterproofing Compound',  category: 'Finishing',   unit: 'L',      onHand: 220,   reorderPoint: 100,  status: 'ok',       lastUpdated: '1 week ago',   value: 33_000  },
  { id: 'S11', item: 'TMT Rebar 16mm',          category: 'Steel',       unit: 'kg',     onHand: 650,   reorderPoint: 300,  status: 'ok',       lastUpdated: '3 days ago',   value: 58_500  },
  { id: 'S12', item: 'Hollow Blocks 200mm',     category: 'Masonry',     unit: 'pcs',    onHand: 420,   reorderPoint: 500,  status: 'low',      lastUpdated: 'Today',        value: 12_600  },
]

const GRN_HISTORY: GrnRow[] = [
  { id: 'GRN-048', supplier: 'Himal Steel Suppliers',    invoice: 'INV-2081-1142', date: '2081-03-14', items: 3, value: 1_24_500, status: 'received' },
  { id: 'GRN-047', supplier: 'Kathmandu Cement Depot',   invoice: 'INV-KC-8821',   date: '2081-03-12', items: 1, value: 38_400,   status: 'received' },
  { id: 'GRN-046', supplier: 'Shree Aggregates Pvt.',    invoice: 'INV-SA-3310',   date: '2081-03-10', items: 2, value: 27_000,   status: 'partial'  },
  { id: 'GRN-045', supplier: 'National Plywood House',   invoice: 'INV-NP-0562',   date: '2081-03-08', items: 1, value: 9_600,    status: 'received' },
  { id: 'GRN-044', supplier: 'Everest MEP Suppliers',    invoice: 'INV-EM-7731',   date: '2081-03-05', items: 4, value: 43_200,   status: 'received' },
]

const ISSUES: IssueRow[] = [
  { id: 'ISS-0124', issuedTo: 'Bikash Karki',   activity: 'G+1 Slab Casting',        date: '2081-03-14', items: 4, issuedBy: 'Roshan Shrestha' },
  { id: 'ISS-0123', issuedTo: 'Ram Bahadur',    activity: 'G+1 Rebar Fabrication',   date: '2081-03-13', items: 2, issuedBy: 'Roshan Shrestha' },
  { id: 'ISS-0122', issuedTo: 'Sunita Gurung',  activity: 'External Wall Brickwork', date: '2081-03-12', items: 1, issuedBy: 'Anita Tamang'   },
  { id: 'ISS-0121', issuedTo: 'Anish Tamang',   activity: 'MEP Conduit Routing',     date: '2081-03-11', items: 3, issuedBy: 'Roshan Shrestha' },
]

// ── Status helpers ────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<StockStatus, { variant: 'success' | 'warning' | 'danger' | 'default'; label: string }> = {
  ok:       { variant: 'success', label: 'In Stock'    },
  low:      { variant: 'warning', label: 'Low Stock'   },
  critical: { variant: 'danger',  label: 'Critical'    },
  out:      { variant: 'default', label: 'Out of Stock' },
}

const GRN_STATUS_BADGE: Record<GrnRow['status'], { variant: 'success' | 'warning' | 'default'; label: string }> = {
  received: { variant: 'success', label: 'Received' },
  partial:  { variant: 'warning', label: 'Partial'  },
  pending:  { variant: 'default', label: 'Pending'  },
}

const CATEGORIES = ['Steel', 'Cement', 'Aggregate', 'Formwork', 'Plumbing', 'Electrical', 'Finishing', 'Masonry']

// ── Column helpers ────────────────────────────────────────────────────────────

const stockCol  = createColumnHelper<StockItem>()
const grnCol    = createColumnHelper<GrnRow>()
const issueCol  = createColumnHelper<IssueRow>()

// ── GRN Dialog ────────────────────────────────────────────────────────────────

function GrnDialog({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: () => void }) {
  const [supplier,  setSupplier]  = useState('')
  const [invoice,   setInvoice]   = useState('')
  const [date,      setDate]      = useState('')
  const [notes,     setNotes]     = useState('')

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Record Goods Receipt (GRN)</DialogTitle>
          <DialogDescription>
            Record materials received on site and update stock levels automatically.
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                label="Supplier"
                placeholder="e.g. Himal Steel Suppliers"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                required
              />
              <Input
                label="Invoice / Challan No."
                placeholder="e.g. INV-2081-1142"
                value={invoice}
                onChange={(e) => setInvoice(e.target.value)}
              />
            </div>
            <DatePicker
              label="Date Received"
              value={date}
              onChange={setDate}
              required
            />

            {/* Items table */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Items Received
              </div>
              <div style={{ border: '1px solid var(--border-default)', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-subtle)', borderBottom: '1px solid var(--border-default)' }}>
                      {['Material', 'Qty', 'Unit', 'Rate (₨)', 'Amount (₨)'].map((h) => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '12px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { material: 'TMT Rebar 12mm',    qty: '500', unit: 'kg',   rate: '79' },
                      { material: 'Cement OPC 53',      qty: '100', unit: 'bags', rate: '720' },
                    ].map((r, i) => (
                      <tr key={i} style={{ borderBottom: i < 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                        <td style={{ padding: '8px 12px', color: 'var(--text-primary)' }}>{r.material}</td>
                        <td style={{ padding: '8px 12px', color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{r.qty}</td>
                        <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{r.unit}</td>
                        <td style={{ padding: '8px 12px', color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{r.rate}</td>
                        <td style={{ padding: '8px 12px', color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                          {(Number(r.qty) * Number(r.rate)).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button variant="ghost" size="sm" iconLeft={<Plus className="h-3.5 w-3.5" />} className="mt-2">
                Add item
              </Button>
            </div>

            <Textarea
              label="Notes"
              placeholder="Condition on delivery, discrepancies, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </DialogBody>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button onClick={onSave} iconLeft={<Truck className="h-4 w-4" />}>
            Record GRN
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Issue Dialog ──────────────────────────────────────────────────────────────

function IssueDialog({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: () => void }) {
  const [issuedTo, setIssuedTo] = useState('')
  const [activity, setActivity] = useState('')
  const [date,     setDate]     = useState('')

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Issue Materials</DialogTitle>
          <DialogDescription>
            Record materials issued to a worker or activity. Stock levels will be updated.
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Issued To"
              placeholder="Worker or team name"
              value={issuedTo}
              onChange={(e) => setIssuedTo(e.target.value)}
              required
            />
            <Select
              label="Activity"
              placeholder="Select activity"
              value={activity}
              onValueChange={setActivity}
              options={[
                { value: 'slab',      label: 'G+1 Slab Casting'        },
                { value: 'rebar',     label: 'G+1 Rebar Fabrication'   },
                { value: 'masonry',   label: 'External Wall Brickwork' },
                { value: 'mep',       label: 'MEP Conduit Routing'     },
                { value: 'plastering',label: 'Internal Plastering'     },
              ]}
              required
            />
            <DatePicker label="Issue Date" value={date} onChange={setDate} required />

            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Materials to Issue
              </div>
              <div style={{ border: '1px solid var(--border-default)', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-subtle)', borderBottom: '1px solid var(--border-default)' }}>
                      {['Material', 'Available', 'Issue Qty', 'Unit'].map((h) => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '12px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { material: 'TMT Rebar 12mm', available: '1,240', qty: '200', unit: 'kg'   },
                      { material: 'Binding Wire',   available: '85',    qty: '10',  unit: 'kg'   },
                    ].map((r, i) => (
                      <tr key={i} style={{ borderBottom: i < 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                        <td style={{ padding: '8px 12px', color: 'var(--text-primary)' }}>{r.material}</td>
                        <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{r.available}</td>
                        <td style={{ padding: '8px 12px' }}>
                          <input
                            type="number"
                            defaultValue={r.qty}
                            style={{
                              width: '72px', height: '28px', padding: '0 8px',
                              border: '1px solid var(--border-default)', borderRadius: '6px',
                              background: 'var(--surface-input)', color: 'var(--text-primary)',
                              fontSize: '13px', fontVariantNumeric: 'tabular-nums',
                            }}
                          />
                        </td>
                        <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{r.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button variant="ghost" size="sm" iconLeft={<Plus className="h-3.5 w-3.5" />} className="mt-2">
                Add material
              </Button>
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button onClick={onSave} iconLeft={<ArrowUpFromLine className="h-4 w-4" />}>
            Issue Materials
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

function InventoryPage() {
  const { toast } = useToast()

  const [activeNav,  setActiveNav]  = useState('inventory')
  const [activeTab,  setActiveTab]  = useState('all')
  const [search,     setSearch]     = useState('')
  const [catFilter,  setCatFilter]  = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [grnOpen,    setGrnOpen]    = useState(false)
  const [issueOpen,  setIssueOpen]  = useState(false)

  // ── Derived data ────────────────────────────────────────────────────────────

  const lowStockItems  = STOCK.filter((s) => s.status === 'low' || s.status === 'critical' || s.status === 'out')
  const totalValue     = STOCK.reduce((acc, s) => acc + s.value, 0)

  const filteredStock = useMemo(() => {
    let rows = activeTab === 'low' ? lowStockItems : STOCK
    if (catFilter)    rows = rows.filter((r) => r.category === catFilter)
    if (statusFilter) rows = rows.filter((r) => r.status   === statusFilter)
    if (search)       rows = rows.filter((r) => r.item.toLowerCase().includes(search.toLowerCase()))
    return rows
  }, [activeTab, catFilter, statusFilter, search])

  // ── Active filter chips ─────────────────────────────────────────────────────

  const activeFilters = [
    catFilter    && { id: 'cat',    label: 'Category', value: catFilter,    onRemove: () => setCatFilter('')    },
    statusFilter && { id: 'status', label: 'Status',   value: statusFilter, onRemove: () => setStatusFilter('') },
  ].filter(Boolean) as any[]

  // ── Stock columns ───────────────────────────────────────────────────────────

  const stockCols = [
    selectionColumn<StockItem>(),
    stockCol.accessor('id',       { header: 'ID',       size: 72,  cell: (i) => <span className="font-mono text-xs text-[--text-tertiary]">{i.getValue()}</span> }),
    stockCol.accessor('item',     { header: 'Material', size: 220, cell: (i) => <span className="font-medium text-[--text-primary]">{i.getValue()}</span> }),
    stockCol.accessor('category', { header: 'Category', size: 110, cell: (i) => <Badge variant="default" size="sm">{i.getValue()}</Badge> }),
    stockCol.accessor('onHand',   {
      header: 'On Hand',
      size: 100,
      cell: (i) => {
        const row   = i.row.original
        const ratio = row.onHand / row.reorderPoint
        return (
          <span className={`tabular-nums font-semibold ${ratio < 0.5 ? 'text-[--color-danger-text]' : ratio < 1 ? 'text-[--color-warning-text]' : 'text-[--text-primary]'}`}>
            {i.getValue().toLocaleString()}
          </span>
        )
      },
    }),
    stockCol.accessor('reorderPoint', { header: 'Reorder At', size: 100, cell: (i) => <span className="tabular-nums text-[--text-secondary]">{i.getValue().toLocaleString()}</span> }),
    stockCol.accessor('unit',    { header: 'Unit',    size: 72,  cell: (i) => <span className="text-[--text-secondary] text-xs">{i.getValue()}</span> }),
    stockCol.accessor('status',  {
      header: 'Status',
      size: 120,
      cell: (i) => {
        const { variant, label } = STATUS_BADGE[i.getValue()]
        return <Badge variant={variant} dot size="sm">{label}</Badge>
      },
    }),
    stockCol.accessor('lastUpdated', { header: 'Updated',   size: 110, cell: (i) => <span className="text-[--text-tertiary] text-xs">{i.getValue()}</span> }),
    stockCol.display({
      id:   'actions',
      size: 80,
      cell: () => (
        <div style={{ display: 'flex', gap: '4px' }}>
          <Button variant="ghost" size="sm">Issue</Button>
        </div>
      ),
    }),
  ]

  // ── GRN columns ─────────────────────────────────────────────────────────────

  const grnCols = [
    grnCol.accessor('id',       { header: 'GRN No.',  size: 100, cell: (i) => <span className="font-mono text-xs font-semibold text-[--text-primary]">{i.getValue()}</span> }),
    grnCol.accessor('supplier', { header: 'Supplier', size: 220, cell: (i) => <span className="text-[--text-primary]">{i.getValue()}</span> }),
    grnCol.accessor('invoice',  { header: 'Invoice',  size: 150, cell: (i) => <span className="font-mono text-xs text-[--text-secondary]">{i.getValue()}</span> }),
    grnCol.accessor('date',     { header: 'Date',     size: 110, cell: (i) => <span className="tabular-nums text-[--text-secondary] text-xs">{i.getValue()}</span> }),
    grnCol.accessor('items',    { header: 'Items',    size: 70,  cell: (i) => <span className="tabular-nums">{i.getValue()}</span> }),
    grnCol.accessor('value',    { header: 'Value (₨)',size: 120, cell: (i) => <span className="tabular-nums font-semibold text-[--text-primary]">₨ {i.getValue().toLocaleString()}</span> }),
    grnCol.accessor('status',   {
      header: 'Status',
      size: 110,
      cell: (i) => {
        const { variant, label } = GRN_STATUS_BADGE[i.getValue()]
        return <Badge variant={variant} dot size="sm">{label}</Badge>
      },
    }),
  ]

  // ── Issue columns ────────────────────────────────────────────────────────────

  const issueCols = [
    issueCol.accessor('id',       { header: 'Issue No.',  size: 100, cell: (i) => <span className="font-mono text-xs font-semibold text-[--text-primary]">{i.getValue()}</span> }),
    issueCol.accessor('issuedTo', { header: 'Issued To',  size: 160, cell: (i) => <span className="text-[--text-primary]">{i.getValue()}</span> }),
    issueCol.accessor('activity', { header: 'Activity',   size: 220, cell: (i) => <span className="text-[--text-secondary]">{i.getValue()}</span> }),
    issueCol.accessor('date',     { header: 'Date',       size: 110, cell: (i) => <span className="tabular-nums text-[--text-secondary] text-xs">{i.getValue()}</span> }),
    issueCol.accessor('items',    { header: 'Items',      size: 70,  cell: (i) => <span className="tabular-nums">{i.getValue()}</span> }),
    issueCol.accessor('issuedBy', { header: 'Issued By',  size: 160, cell: (i) => <span className="text-[--text-tertiary] text-xs">{i.getValue()}</span> }),
  ]

  // ── Tab definitions ─────────────────────────────────────────────────────────

  const tabs = [
    {
      id:      'all',
      label:   'All Items',
      content: (
        <>
          <FilterBar
            filters={activeFilters}
            onClearAll={() => { setCatFilter(''); setStatusFilter('') }}
            leftSlot={
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ position: 'relative', width: '220px' }}>
                  <Search className="h-3.5 w-3.5" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} aria-hidden />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search materials…"
                    style={{ width: '100%', height: '32px', paddingLeft: '30px', paddingRight: '12px', borderRadius: '8px', border: '1px solid var(--border-default)', background: 'var(--surface-input)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
                  />
                </div>
                <div style={{ width: '140px' }}>
                  <Select
                    options={CATEGORIES.map((c) => ({ value: c, label: c }))}
                    value={catFilter}
                    onValueChange={setCatFilter}
                    placeholder="Category"
                    size="sm"
                  />
                </div>
                <div style={{ width: '150px' }}>
                  <Select
                    options={[
                      { value: 'ok',       label: 'In Stock'     },
                      { value: 'low',      label: 'Low Stock'    },
                      { value: 'critical', label: 'Critical'     },
                      { value: 'out',      label: 'Out of Stock' },
                    ]}
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                    placeholder="Status"
                    size="sm"
                  />
                </div>
              </div>
            }
          />
          <div style={{ marginTop: '12px' }}>
            <DataTable<StockItem>
              columns={stockCols}
              data={filteredStock}
              aria-label="Inventory stock levels"
              emptyState={
                <EmptyState
                  icon={<Warehouse className="h-10 w-10 text-[--text-tertiary]" aria-hidden />}
                  title="No items match"
                  description="Try adjusting your filters."
                  action={{ label: 'Clear filters', onClick: () => { setCatFilter(''); setStatusFilter(''); setSearch('') } }}
                />
              }
            />
          </div>
        </>
      ),
    },
    {
      id:    'low',
      label: `Low Stock (${lowStockItems.length})`,
      content: (
        <DataTable<StockItem>
          columns={stockCols}
          data={lowStockItems}
          aria-label="Low stock items"
          emptyState={
            <EmptyState
              icon={<CheckCircle2 className="h-10 w-10 text-[--color-success-icon]" aria-hidden />}
              title="All stocked up"
              description="No materials are below their reorder point."
              variant="empty"
            />
          }
        />
      ),
    },
    {
      id:    'grn',
      label: 'GRN History',
      content: (
        <DataTable<GrnRow>
          columns={grnCols}
          data={GRN_HISTORY}
          aria-label="Goods receipt history"
        />
      ),
    },
    {
      id:    'issues',
      label: 'Issues',
      content: (
        <DataTable<IssueRow>
          columns={issueCols}
          data={ISSUES}
          aria-label="Material issues log"
        />
      ),
    },
  ]

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ height: '100vh' }}>
      <AppShell
        sidebarProps={{
          navigation: NAV,
          activeId:   activeNav,
          onNavigate: (item) => setActiveNav(item.id),
        }}
        headerProps={{
          projects:          [HEADER_PROJECT],
          activeProject:     HEADER_PROJECT,
          user:              USER,
          notificationCount: 3,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          <PageHeader
            title="Inventory"
            description="Baneshwor Commercial Complex · Site stock, GRN, and issues"
            badge={
              lowStockItems.length > 0
                ? <Badge variant="danger" dot size="sm">{lowStockItems.length} low stock</Badge>
                : <Badge variant="success" dot size="sm">All stocked</Badge>
            }
            breadcrumb={[
              { label: 'BCC-2081', onClick: () => {} },
              { label: 'Inventory' },
            ]}
            actions={
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  variant="secondary"
                  size="sm"
                  iconLeft={<Download className="h-4 w-4" />}
                >
                  Export
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  iconLeft={<ArrowUpFromLine className="h-4 w-4" />}
                  onClick={() => setIssueOpen(true)}
                >
                  Issue
                </Button>
                <Button
                  size="sm"
                  iconLeft={<Truck className="h-4 w-4" />}
                  onClick={() => setGrnOpen(true)}
                >
                  Record GRN
                </Button>
              </div>
            }
          />

          {/* KPI strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '12px' }}>
            <MetricCard
              label="Total Items"
              value={STOCK.length}
              status="ok"
              icon={<Warehouse className="h-5 w-5" />}
            />
            <MetricCard
              label="Low / Critical"
              value={lowStockItems.length}
              status={lowStockItems.length > 0 ? 'danger' : 'ok'}
              icon={<AlertTriangle className="h-5 w-5" />}
              trendPositiveIsGood={false}
            />
            <MetricCard
              label="Out of Stock"
              value={STOCK.filter((s) => s.status === 'out').length}
              status={STOCK.some((s) => s.status === 'out') ? 'danger' : 'ok'}
              icon={<XCircle className="h-5 w-5" />}
              trendPositiveIsGood={false}
            />
            <MetricCard
              label="Stock Value"
              value={`₨ ${(totalValue / 100_000).toFixed(1)}L`}
              status="ok"
              icon={<TrendingUp className="h-5 w-5" />}
            />
          </div>

          {/* Tabs */}
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

        </div>

        {/* Dialogs */}
        <GrnDialog
          open={grnOpen}
          onClose={() => setGrnOpen(false)}
          onSave={() => {
            setGrnOpen(false)
            toast({ title: 'GRN recorded', description: 'Stock levels have been updated.', variant: 'success' })
          }}
        />
        <IssueDialog
          open={issueOpen}
          onClose={() => setIssueOpen(false)}
          onSave={() => {
            setIssueOpen(false)
            toast({ title: 'Materials issued', description: 'Issue log has been saved.', variant: 'success' })
          }}
        />
      </AppShell>
    </div>
  )
}

// ── Storybook meta ────────────────────────────────────────────────────────────

const meta = {
  title:      'Pages/Inventory',
  component:  InventoryPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
Full-page Inventory Management screen. Covers:

- **Stock overview** — KPI strip showing totals, low-stock count, out-of-stock count, and total value
- **All Items tab** — searchable, filterable DataTable with colour-coded on-hand quantities
- **Low Stock tab** — filtered view showing only items below reorder point
- **GRN History tab** — Goods Receipt Notes with supplier, invoice, and status
- **Issues tab** — material issue log by worker and activity
- **Record GRN dialog** — capture supplier, invoice, items received, and notes
- **Issue dialog** — record materials issued to a worker or activity
        `.trim(),
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof InventoryPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: '📦 Inventory Management',
  args: {} as any,
  render: () => (
    <ToastProvider>
      <InventoryPage />
    </ToastProvider>
  ),
}
