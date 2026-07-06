/**
 * Full-page composition: Purchase Orders
 *
 * Create, track, and approve purchase orders from low-stock alerts
 * through vendor delivery. All state is local — no external store required.
 */
import { useState, useMemo } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { createColumnHelper } from '@tanstack/react-table'
import {
  LayoutDashboard, FolderKanban, FileSpreadsheet, Package,
  ClipboardList, Warehouse, BarChart3, TrendingUp, Sparkles,
  Settings2, Users, ShieldCheck,
  Plus, Download, Send, CheckCircle2, XCircle,
  Clock, AlertTriangle, Search, ChevronRight,
} from 'lucide-react'
import { AppShell }     from '../organisms/AppShell'
import { PageHeader }   from '../molecules/PageHeader'
import { FilterBar }    from '../molecules/FilterBar'
import { Tabs }         from '../organisms/Tabs'
import { DataTable, selectionColumn } from '../organisms/DataTable'
import { MetricCard }   from '../molecules/MetricCard'
import { ToastProvider, useToast } from '../molecules/Toast'
import { Badge }        from '../atoms/Badge'
import { Button }       from '../atoms/Button'
import { Input }        from '../atoms/Input'
import { Select }       from '../atoms/Select'
import { Textarea }     from '../atoms/Textarea'
import { DatePicker }   from '../atoms/DatePicker'
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from '../atoms/Card'
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
      { id: 'inventory', label: 'Inventory',      icon: Warehouse,       href: '#' },
      { id: 'orders',    label: 'Purchase Orders',icon: TrendingUp,      href: '#', badge: 2 },
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
const USER           = { name: 'Anita Tamang', role: 'Procurement Officer' }

// ── Types ─────────────────────────────────────────────────────────────────────

type POStatus = 'draft' | 'pending' | 'approved' | 'delivered' | 'cancelled'

type POLine = {
  item:     string
  unit:     string
  qty:      number
  rate:     number
}

type PurchaseOrder = {
  id:         string
  vendor:     string
  status:     POStatus
  raised:     string
  required:   string
  lines:      POLine[]
  total:      number
  raisedBy:   string
  approvedBy: string | null
  notes:      string
}

// ── Data ──────────────────────────────────────────────────────────────────────

const ORDERS: PurchaseOrder[] = [
  {
    id: 'PO-0049', vendor: 'Kathmandu Cement Depot',   status: 'pending',   raised: '2081-03-15', required: '2081-03-18',
    lines: [{ item: 'Cement OPC 53', unit: 'bags', qty: 300, rate: 720 }],
    total: 2_16_000, raisedBy: 'Anita Tamang', approvedBy: null,
    notes: 'Urgent — G+1 slab pour scheduled 2081-03-19.',
  },
  {
    id: 'PO-0048', vendor: 'National Plywood House',   status: 'pending',   raised: '2081-03-15', required: '2081-03-17',
    lines: [{ item: 'Shuttering Plywood 18mm', unit: 'sheets', qty: 40, rate: 3_200 }],
    total: 1_28_000, raisedBy: 'Anita Tamang', approvedBy: null,
    notes: 'Stock critically low — only 3 sheets on hand.',
  },
  {
    id: 'PO-0047', vendor: 'Shree Aggregates Pvt.',    status: 'approved',  raised: '2081-03-12', required: '2081-03-16',
    lines: [
      { item: 'River Sand',     unit: 'm³', qty: 30, rate: 3_500 },
      { item: 'Aggregate 20mm', unit: 'm³', qty: 20, rate: 2_800 },
    ],
    total: 1_61_000, raisedBy: 'Anita Tamang', approvedBy: 'Roshan Shrestha',
    notes: '',
  },
  {
    id: 'PO-0046', vendor: 'Himal Steel Suppliers',    status: 'delivered', raised: '2081-03-08', required: '2081-03-12',
    lines: [
      { item: 'TMT Rebar 12mm', unit: 'kg', qty: 1_000, rate: 79 },
      { item: 'TMT Rebar 16mm', unit: 'kg', qty:   500, rate: 90 },
      { item: 'Binding Wire',   unit: 'kg', qty:    50, rate: 100 },
    ],
    total: 1_29_000, raisedBy: 'Anita Tamang', approvedBy: 'Roshan Shrestha',
    notes: 'GRN-046 raised on 2081-03-14.',
  },
  {
    id: 'PO-0045', vendor: 'Everest MEP Suppliers',    status: 'delivered', raised: '2081-03-04', required: '2081-03-08',
    lines: [
      { item: 'PVC Pipe 110mm',          unit: 'm', qty: 200, rate: 50  },
      { item: 'Electrical Conduit 25mm', unit: 'm', qty: 400, rate: 20  },
    ],
    total: 1_80_00, raisedBy: 'Anita Tamang', approvedBy: 'Roshan Shrestha',
    notes: '',
  },
  {
    id: 'PO-0044', vendor: 'Valley Finishing Mart',    status: 'cancelled', raised: '2081-02-28', required: '2081-03-05',
    lines: [{ item: 'Ceramic Tiles 600×600', unit: 'm²', qty: 120, rate: 1_800 }],
    total: 2_16_000, raisedBy: 'Anita Tamang', approvedBy: null,
    notes: 'Cancelled — design change pending architect sign-off.',
  },
  {
    id: 'PO-0043', vendor: 'Kathmandu Cement Depot',   status: 'delivered', raised: '2081-02-20', required: '2081-02-24',
    lines: [{ item: 'Cement OPC 53', unit: 'bags', qty: 500, rate: 720 }],
    total: 3_60_000, raisedBy: 'Anita Tamang', approvedBy: 'Roshan Shrestha',
    notes: '',
  },
]

const VENDORS = [
  'Himal Steel Suppliers',
  'Kathmandu Cement Depot',
  'Shree Aggregates Pvt.',
  'National Plywood House',
  'Everest MEP Suppliers',
  'Valley Finishing Mart',
  'Nepal Hardware Traders',
]

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CFG: Record<POStatus, { variant: 'default' | 'warning' | 'success' | 'danger' | 'info'; label: string; icon: React.ReactNode }> = {
  draft:     { variant: 'default',  label: 'Draft',     icon: <Clock        className="h-3.5 w-3.5" /> },
  pending:   { variant: 'warning',  label: 'Pending',   icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  approved:  { variant: 'info',     label: 'Approved',  icon: <CheckCircle2  className="h-3.5 w-3.5" /> },
  delivered: { variant: 'success',  label: 'Delivered', icon: <CheckCircle2  className="h-3.5 w-3.5" /> },
  cancelled: { variant: 'danger',   label: 'Cancelled', icon: <XCircle       className="h-3.5 w-3.5" /> },
}

// ── PO Detail panel ───────────────────────────────────────────────────────────

function PODetail({ po, onApprove, onClose }: { po: PurchaseOrder; onApprove: () => void; onClose: () => void }) {
  const { variant, label } = STATUS_CFG[po.status]
  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent size="lg">
        <DialogHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <DialogTitle>{po.id}</DialogTitle>
            <Badge variant={variant} dot size="sm">{label}</Badge>
          </div>
          <DialogDescription>{po.vendor}</DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Meta row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Raised By',    value: po.raisedBy },
                { label: 'Date Raised',  value: po.raised },
                { label: 'Required By',  value: po.required },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Line items */}
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Line Items</p>
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
                    {po.lines.map((line, i) => (
                      <tr key={i} style={{ borderBottom: i < po.lines.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                        <td style={{ padding: '8px 12px', color: 'var(--text-primary)', fontWeight: 500 }}>{line.item}</td>
                        <td style={{ padding: '8px 12px', fontVariantNumeric: 'tabular-nums' }}>{line.qty.toLocaleString()}</td>
                        <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{line.unit}</td>
                        <td style={{ padding: '8px 12px', fontVariantNumeric: 'tabular-nums' }}>{line.rate.toLocaleString()}</td>
                        <td style={{ padding: '8px 12px', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{(line.qty * line.rate).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: '2px solid var(--border-default)', background: 'var(--surface-subtle)' }}>
                      <td colSpan={4} style={{ padding: '8px 12px', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'right' }}>Total</td>
                      <td style={{ padding: '8px 12px', fontVariantNumeric: 'tabular-nums', fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>
                        ₨ {po.total.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {po.notes && (
              <div style={{ padding: '12px', background: 'var(--surface-subtle)', borderRadius: '8px', border: '1px solid var(--border-default)' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notes</p>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{po.notes}</p>
              </div>
            )}

            {po.approvedBy && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'var(--color-success-50, #f0fdf4)', borderRadius: '8px', border: '1px solid var(--color-success-100, #dcfce7)' }}>
                <CheckCircle2 className="h-4 w-4" style={{ color: 'var(--color-success-icon)', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: 'var(--color-success-text, #166534)' }}>
                  Approved by <strong>{po.approvedBy}</strong>
                </span>
              </div>
            )}
          </div>
        </DialogBody>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Close</Button>
          </DialogClose>
          {po.status === 'pending' && (
            <>
              <Button variant="danger" iconLeft={<XCircle className="h-4 w-4" />}>Reject</Button>
              <Button iconLeft={<CheckCircle2 className="h-4 w-4" />} onClick={onApprove}>
                Approve PO
              </Button>
            </>
          )}
          {po.status === 'approved' && (
            <Button iconLeft={<CheckCircle2 className="h-4 w-4" />}>Mark Delivered</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── New PO Dialog ─────────────────────────────────────────────────────────────

function NewPODialog({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: () => void }) {
  const [vendor,   setVendor]   = useState('')
  const [required, setRequired] = useState('')
  const [notes,    setNotes]    = useState('')

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>New Purchase Order</DialogTitle>
          <DialogDescription>Create a purchase order and send for approval.</DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Select
                label="Vendor"
                placeholder="Select vendor"
                value={vendor}
                onValueChange={setVendor}
                options={VENDORS.map((v) => ({ value: v, label: v }))}
                required
              />
              <DatePicker
                label="Required By"
                value={required}
                onChange={setRequired}
                required
              />
            </div>

            {/* Line items */}
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Line Items
              </p>
              <div style={{ border: '1px solid var(--border-default)', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-subtle)', borderBottom: '1px solid var(--border-default)' }}>
                      {['Material', 'Qty', 'Unit', 'Rate (₨)', 'Amount'].map((h) => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '12px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { material: 'Cement OPC 53', qty: '300', unit: 'bags', rate: '720' },
                    ].map((r, i) => (
                      <tr key={i}>
                        <td style={{ padding: '8px 12px', color: 'var(--text-primary)' }}>{r.material}</td>
                        <td style={{ padding: '8px 12px' }}>
                          <input type="number" defaultValue={r.qty}
                            style={{ width: '72px', height: '28px', padding: '0 8px', border: '1px solid var(--border-default)', borderRadius: '6px', background: 'var(--surface-input)', color: 'var(--text-primary)', fontSize: '13px' }} />
                        </td>
                        <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{r.unit}</td>
                        <td style={{ padding: '8px 12px' }}>
                          <input type="number" defaultValue={r.rate}
                            style={{ width: '80px', height: '28px', padding: '0 8px', border: '1px solid var(--border-default)', borderRadius: '6px', background: 'var(--surface-input)', color: 'var(--text-primary)', fontSize: '13px' }} />
                        </td>
                        <td style={{ padding: '8px 12px', fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: 'var(--text-primary)' }}>
                          ₨ {(Number(r.qty) * Number(r.rate)).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button variant="ghost" size="sm" iconLeft={<Plus className="h-3.5 w-3.5" />} className="mt-2">
                Add line item
              </Button>
            </div>

            <Textarea
              label="Notes"
              placeholder="Delivery instructions, urgency notes, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </DialogBody>

        <DialogFooter>
          <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
          <Button variant="secondary" iconLeft={<Clock className="h-4 w-4" />}>Save Draft</Button>
          <Button iconLeft={<Send className="h-4 w-4" />} onClick={onSave}>Submit for Approval</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

function PurchaseOrdersPage() {
  const { toast } = useToast()

  const [activeNav,    setActiveNav]    = useState('orders')
  const [activeTab,    setActiveTab]    = useState('all')
  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [vendorFilter, setVendorFilter] = useState('')
  const [newPOOpen,    setNewPOOpen]    = useState(false)
  const [selectedPO,   setSelectedPO]  = useState<PurchaseOrder | null>(null)
  const [orders,       setOrders]       = useState<PurchaseOrder[]>(ORDERS)

  // ── Derived ─────────────────────────────────────────────────────────────────

  const pending   = orders.filter((o) => o.status === 'pending')
  const approved  = orders.filter((o) => o.status === 'approved')
  const totalSpend = orders
    .filter((o) => o.status === 'delivered')
    .reduce((s, o) => s + o.total, 0)

  const filteredOrders = useMemo(() => {
    let rows = activeTab === 'pending'  ? pending
             : activeTab === 'approved' ? approved
             : orders

    if (statusFilter) rows = rows.filter((o) => o.status  === statusFilter)
    if (vendorFilter) rows = rows.filter((o) => o.vendor  === vendorFilter)
    if (search)       rows = rows.filter((o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.vendor.toLowerCase().includes(search.toLowerCase()),
    )
    return rows
  }, [activeTab, statusFilter, vendorFilter, search, orders])

  const activeFilters = [
    statusFilter && { id: 'status', label: 'Status', value: statusFilter, onRemove: () => setStatusFilter('') },
    vendorFilter && { id: 'vendor', label: 'Vendor', value: vendorFilter, onRemove: () => setVendorFilter('') },
  ].filter(Boolean) as any[]

  // ── Columns ──────────────────────────────────────────────────────────────────

  const col = createColumnHelper<PurchaseOrder>()

  const columns = [
    selectionColumn<PurchaseOrder>(),
    col.accessor('id', {
      header: 'PO No.',
      size: 100,
      cell: (i) => (
        <button
          onClick={() => setSelectedPO(i.row.original)}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--action-primary-bg)', fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-mono, monospace)' }}
        >
          {i.getValue()}
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      ),
    }),
    col.accessor('vendor',   { header: 'Vendor',      size: 220, cell: (i) => <span className="font-medium text-[--text-primary]">{i.getValue()}</span> }),
    col.accessor('lines',    {
      header: 'Items',
      size: 60,
      cell: (i) => <span className="tabular-nums text-[--text-secondary]">{i.getValue().length}</span>,
    }),
    col.accessor('total',    { header: 'Total (₨)',   size: 130, cell: (i) => <span className="tabular-nums font-semibold">₨ {i.getValue().toLocaleString()}</span> }),
    col.accessor('raised',   { header: 'Raised',      size: 110, cell: (i) => <span className="tabular-nums text-[--text-secondary] text-xs">{i.getValue()}</span> }),
    col.accessor('required', { header: 'Required By', size: 110, cell: (i) => <span className="tabular-nums text-[--text-secondary] text-xs">{i.getValue()}</span> }),
    col.accessor('status',   {
      header: 'Status',
      size: 120,
      cell: (i) => {
        const { variant, label } = STATUS_CFG[i.getValue()]
        return <Badge variant={variant} dot size="sm">{label}</Badge>
      },
    }),
    col.accessor('approvedBy', {
      header: 'Approved By',
      size: 140,
      cell: (i) => i.getValue()
        ? <span className="text-xs text-[--text-secondary]">{i.getValue()}</span>
        : <span className="text-xs text-[--text-tertiary]">—</span>,
    }),
  ]

  // ── Tabs ─────────────────────────────────────────────────────────────────────

  const tableSection = (rows: PurchaseOrder[]) => (
    <>
      <FilterBar
        filters={activeFilters}
        onClearAll={() => { setStatusFilter(''); setVendorFilter('') }}
        leftSlot={
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ position: 'relative', width: '220px' }}>
              <Search className="h-3.5 w-3.5" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} aria-hidden />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search PO or vendor…"
                style={{ width: '100%', height: '32px', paddingLeft: '30px', paddingRight: '12px', borderRadius: '8px', border: '1px solid var(--border-default)', background: 'var(--surface-input)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <div style={{ width: '160px' }}>
              <Select
                options={(['draft','pending','approved','delivered','cancelled'] as POStatus[]).map((s) => ({ value: s, label: STATUS_CFG[s].label }))}
                value={statusFilter}
                onValueChange={setStatusFilter}
                placeholder="All statuses"
                size="sm"
              />
            </div>
            <div style={{ width: '200px' }}>
              <Select
                options={VENDORS.map((v) => ({ value: v, label: v }))}
                value={vendorFilter}
                onValueChange={setVendorFilter}
                placeholder="All vendors"
                size="sm"
              />
            </div>
          </div>
        }
      />
      <div style={{ marginTop: '12px' }}>
        <DataTable<PurchaseOrder>
          columns={columns}
          data={rows}
          aria-label="Purchase orders"
        />
      </div>
    </>
  )

  const tabs = [
    { id: 'all',      label: `All Orders (${orders.length})`,     content: tableSection(filteredOrders) },
    { id: 'pending',  label: `Pending Approval (${pending.length})`,  content: tableSection(filteredOrders) },
    { id: 'approved', label: `Approved (${approved.length})`,         content: tableSection(filteredOrders) },
  ]

  // ── Render ───────────────────────────────────────────────────────────────────

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
          notificationCount: 2,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          <PageHeader
            title="Purchase Orders"
            description="Baneshwor Commercial Complex · Procurement and vendor management"
            badge={
              pending.length > 0
                ? <Badge variant="warning" dot size="sm">{pending.length} pending approval</Badge>
                : undefined
            }
            breadcrumb={[
              { label: 'BCC-2081', onClick: () => {} },
              { label: 'Purchase Orders' },
            ]}
            actions={
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="secondary" size="sm" iconLeft={<Download className="h-4 w-4" />}>
                  Export
                </Button>
                <Button size="sm" iconLeft={<Plus className="h-4 w-4" />} onClick={() => setNewPOOpen(true)}>
                  New PO
                </Button>
              </div>
            }
          />

          {/* KPI strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '12px' }}>
            <MetricCard label="Pending Approval" value={pending.length}  status={pending.length  > 0 ? 'warning' : 'ok'} icon={<AlertTriangle className="h-5 w-5" />} trendPositiveIsGood={false} />
            <MetricCard label="Approved / In Transit" value={approved.length} status={approved.length > 0 ? 'info'    : 'ok'} icon={<CheckCircle2  className="h-5 w-5" />} />
            <MetricCard label="Total Orders"   value={orders.length}    status="ok"  icon={<TrendingUp    className="h-5 w-5" />} />
            <MetricCard label="Delivered Spend" value={`₨ ${(totalSpend / 100_000).toFixed(1)}L`} status="ok" icon={<CheckCircle2 className="h-5 w-5" />} />
          </div>

          {/* Pending approval cards — quick-action strip */}
          {pending.length > 0 && (
            <div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
                Awaiting Your Approval
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
                {pending.map((po) => (
                  <Card key={po.id} variant="default">
                    <CardHeader bordered>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                        <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{po.id}</span>
                        <Badge variant="warning" dot size="sm">Pending</Badge>
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>Due {po.required}</span>
                    </CardHeader>
                    <CardBody>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>{po.vendor}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        {po.lines.map((l) => `${l.qty.toLocaleString()} ${l.unit} ${l.item}`).join(' · ')}
                      </p>
                      {po.notes && (
                        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>{po.notes}</p>
                      )}
                    </CardBody>
                    <CardFooter>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                        ₨ {po.total.toLocaleString()}
                      </span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <Button size="sm" variant="ghost" onClick={() => setSelectedPO(po)}>View</Button>
                        <Button size="sm" variant="danger" iconLeft={<XCircle className="h-3.5 w-3.5" />}>Reject</Button>
                        <Button size="sm" iconLeft={<CheckCircle2 className="h-3.5 w-3.5" />}
                          onClick={() => {
                            setOrders((prev) => prev.map((o) => o.id === po.id ? { ...o, status: 'approved', approvedBy: USER.name } : o))
                            toast({ title: `${po.id} approved`, description: `${po.vendor} has been notified.`, variant: 'success' })
                          }}
                        >
                          Approve
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Full table */}
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Dialogs */}
        <NewPODialog
          open={newPOOpen}
          onClose={() => setNewPOOpen(false)}
          onSave={() => {
            setNewPOOpen(false)
            toast({ title: 'PO submitted', description: 'Sent to Roshan Shrestha for approval.', variant: 'success' })
          }}
        />
        {selectedPO && (
          <PODetail
            po={selectedPO}
            onClose={() => setSelectedPO(null)}
            onApprove={() => {
              setOrders((prev) => prev.map((o) => o.id === selectedPO.id ? { ...o, status: 'approved', approvedBy: USER.name } : o))
              setSelectedPO(null)
              toast({ title: `${selectedPO.id} approved`, description: `${selectedPO.vendor} has been notified.`, variant: 'success' })
            }}
          />
        )}
      </AppShell>
    </div>
  )
}

// ── Storybook meta ────────────────────────────────────────────────────────────

const meta = {
  title:      'Pages/PurchaseOrders',
  component:  PurchaseOrdersPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
Full-page Purchase Orders screen. Covers:

- **KPI strip** — pending approval count, approved/in-transit count, total orders, delivered spend
- **Pending approval cards** — quick-action strip showing POs awaiting sign-off with inline Approve / Reject
- **All Orders tab** — searchable, filterable DataTable across all PO statuses
- **Pending Approval / Approved tabs** — pre-filtered views
- **PO detail dialog** — line items, totals, approval chain, notes; Approve/Reject/Mark Delivered actions
- **New PO dialog** — vendor, required-by date, line items, notes; Save Draft or Submit for Approval
        `.trim(),
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PurchaseOrdersPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: '🛒 Purchase Orders',
  args: {} as any,
  render: () => (
    <ToastProvider>
      <PurchaseOrdersPage />
    </ToastProvider>
  ),
}
