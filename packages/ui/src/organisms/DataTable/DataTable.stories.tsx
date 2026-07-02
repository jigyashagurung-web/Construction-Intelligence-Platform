import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { createColumnHelper } from '@tanstack/react-table'
import {
  Edit3, Trash2, Eye, Download, Send,
  AlertTriangle, ShoppingCart,
} from 'lucide-react'
import { DataTable, selectionColumn } from './DataTable'
import { Badge } from '../../atoms/Badge'
import { ProgressRing } from '../../atoms/ProgressRing'
import { Avatar } from '../../atoms/Avatar'

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title:     'Organisms/DataTable',
  component:  DataTable,
  tags:      ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Full-featured data table built on **TanStack Table v8**.

Supports: sorting · global search · pagination · row selection + bulk actions ·
row action menu · column visibility toggle · loading skeleton · empty state ·
density-aware row height · sticky header.

\`\`\`tsx
import { DataTable, selectionColumn } from '@cip/ui'
import { createColumnHelper } from '@tanstack/react-table'

const col = createColumnHelper<BoqItem>()
const columns = [
  selectionColumn<BoqItem>(),
  col.accessor('code',    { header: 'Code' }),
  col.accessor('description', { header: 'Description' }),
  col.accessor('qty',     { header: 'Qty', cell: i => i.getValue().toLocaleString() }),
]
<DataTable columns={columns} data={items} searchable pagination />
\`\`\`
        `.trim(),
      },
    },
  },
} satisfies Meta<any>

export default meta
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Story = StoryObj<any>

// ═══════════════════════════════════════════════════════════════════════════════
// 1 · BOQ TABLE
// ═══════════════════════════════════════════════════════════════════════════════

type BoqItem = {
  code:        string
  description: string
  unit:        string
  qty:         number
  rate:        number
  amount:      number
  progress:    number
  status:      'on-track' | 'at-risk' | 'delayed' | 'complete'
}

const BOQ_DATA: BoqItem[] = [
  { code: '1.01', description: 'Earthwork excavation in soft soil',       unit: 'cum', qty: 850,  rate: 320,   amount: 272000,  progress: 100, status: 'complete'  },
  { code: '1.02', description: 'Earthwork excavation in hard soil',       unit: 'cum', qty: 210,  rate: 580,   amount: 121800,  progress: 100, status: 'complete'  },
  { code: '2.01', description: 'PCC M10 grade concrete',                  unit: 'cum', qty: 95,   rate: 6200,  amount: 589000,  progress: 87,  status: 'on-track'  },
  { code: '2.02', description: 'RCC M25 — footings & tie beams',          unit: 'cum', qty: 142,  rate: 9800,  amount: 1391600, progress: 73,  status: 'on-track'  },
  { code: '2.03', description: 'RCC M30 — columns G+1',                   unit: 'cum', qty: 58,   rate: 11200, amount: 649600,  progress: 52,  status: 'at-risk'   },
  { code: '2.04', description: 'RCC M30 — beams & slabs G+1',             unit: 'cum', qty: 186,  rate: 10400, amount: 1934400, progress: 38,  status: 'at-risk'   },
  { code: '3.01', description: 'Fe500 TMT rebar — all diameters',         unit: 'MT',  qty: 48.5, rate: 98000, amount: 4753000, progress: 61,  status: 'on-track'  },
  { code: '3.02', description: 'Structural steel sections',               unit: 'MT',  qty: 12.2, rate: 115000,amount: 1403000, progress: 0,   status: 'delayed'   },
  { code: '4.01', description: 'Brick masonry in cement mortar 1:4',      unit: 'sqm', qty: 1240, rate: 1450,  amount: 1798000, progress: 22,  status: 'delayed'   },
  { code: '4.02', description: '12mm external plaster',                   unit: 'sqm', qty: 2100, rate: 620,   amount: 1302000, progress: 0,   status: 'delayed'   },
  { code: '5.01', description: 'Ceramic floor tiles 600×600',             unit: 'sqm', qty: 480,  rate: 1850,  amount: 888000,  progress: 0,   status: 'delayed'   },
  { code: '6.01', description: 'UPVC doors & windows supply & fix',       unit: 'nos', qty: 68,   rate: 18500, amount: 1258000, progress: 0,   status: 'delayed'   },
  { code: '7.01', description: 'Internal electrical wiring (copper)',     unit: 'lot', qty: 1,    rate: 850000,amount: 850000,  progress: 15,  status: 'on-track'  },
  { code: '7.02', description: 'Plumbing — water supply & drainage',      unit: 'lot', qty: 1,    rate: 620000,amount: 620000,  progress: 8,   status: 'on-track'  },
  { code: '8.01', description: 'Two-coat weather shield paint exterior',  unit: 'sqm', qty: 1840, rate: 320,   amount: 588800,  progress: 0,   status: 'delayed'   },
]

const STATUS_VARIANT = {
  'complete':  'success',
  'on-track':  'primary',
  'at-risk':   'warning',
  'delayed':   'danger',
} as const

const nprf = (n: number) =>
  new Intl.NumberFormat('en-NP', { maximumFractionDigits: 0 }).format(n)

const boqCol = createColumnHelper<BoqItem>()
const BOQ_COLUMNS = [
  selectionColumn<BoqItem>(),
  boqCol.accessor('code', {
    header: 'Code',
    size:   70,
    cell:   (i) => <span className="font-mono text-xs text-[--text-secondary]">{i.getValue()}</span>,
  }),
  boqCol.accessor('description', {
    header: 'Description',
    size:   320,
    cell:   (i) => <span className="font-medium">{i.getValue()}</span>,
  }),
  boqCol.accessor('unit', {
    header: 'Unit',
    size:   60,
    cell:   (i) => <span className="text-[--text-secondary]">{i.getValue()}</span>,
  }),
  boqCol.accessor('qty', {
    header: 'Qty',
    size:   90,
    cell:   (i) => <span className="tabular-nums">{nprf(i.getValue())}</span>,
  }),
  boqCol.accessor('rate', {
    header: 'Rate (NPR)',
    size:   110,
    cell:   (i) => <span className="tabular-nums text-right block">{nprf(i.getValue())}</span>,
  }),
  boqCol.accessor('amount', {
    header: 'Amount (NPR)',
    size:   130,
    cell:   (i) => (
      <span className="tabular-nums font-semibold text-right block">
        {nprf(i.getValue())}
      </span>
    ),
  }),
  boqCol.accessor('progress', {
    header: 'Progress',
    size:   80,
    cell:   (i) => <ProgressRing value={i.getValue()} size="sm" description={`${i.getValue()}% complete`} />,
  }),
  boqCol.accessor('status', {
    header: 'Status',
    size:   100,
    cell:   (i) => (
      <Badge variant={STATUS_VARIANT[i.getValue()]} dot size="sm">
        {i.getValue().replace('-', ' ')}
      </Badge>
    ),
  }),
]

export const BOQTable: Story = {
  name: '📋 BOQ Table',
  render: () => (
    <DataTable<BoqItem>
      columns={BOQ_COLUMNS}
      data={BOQ_DATA}
      searchable
      searchPlaceholder="Search items…"
      columnToggle
      pagination
      pageSize={8}
      stickyHeader
      aria-label="Bill of Quantities"
      rowActions={[
        { label: 'Edit item',    icon: <Edit3  className="h-4 w-4" />, onClick: (r) => alert(`Edit ${r.original.code}`) },
        { label: 'View details', icon: <Eye    className="h-4 w-4" />, onClick: (r) => alert(`View ${r.original.code}`) },
        { label: 'Delete',       icon: <Trash2 className="h-4 w-4" />, variant: 'destructive', onClick: (r) => alert(`Delete ${r.original.code}`) },
      ]}
      bulkActions={[
        { label: 'Export selected', icon: <Download className="h-4 w-4" />, onClick: (rows) => alert(`Export ${rows.length} items`) },
        { label: 'Delete selected', icon: <Trash2   className="h-4 w-4" />, variant: 'destructive', onClick: (rows) => alert(`Delete ${rows.length} items`) },
      ]}
      emptyState={
        <div className="flex flex-col items-center gap-2 text-[--text-tertiary]">
          <p className="text-sm font-medium">No BOQ items match your search</p>
          <p className="text-xs">Try a different keyword or clear the filter</p>
        </div>
      }
    />
  ),
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2 · MATERIALS / INVENTORY TABLE
// ═══════════════════════════════════════════════════════════════════════════════

type MaterialItem = {
  id:           string
  name:         string
  category:     string
  onHand:       number
  reorderPoint: number
  unit:         string
  lastReceived: string
  supplier:     string
  stockStatus:  'ok' | 'low' | 'critical' | 'out'
}

const MAT_DATA: MaterialItem[] = [
  { id: 'M001', name: 'OPC Cement 43 Grade',       category: 'Binding',   onHand: 420,   reorderPoint: 200, unit: 'bags',  lastReceived: '2081-03-12', supplier: 'Shivam Cement',     stockStatus: 'ok'       },
  { id: 'M002', name: 'TMT Rebar 12mm Fe500',       category: 'Steel',     onHand: 2100,  reorderPoint: 3000,unit: 'kg',    lastReceived: '2081-03-08', supplier: 'Himal Iron',        stockStatus: 'low'      },
  { id: 'M003', name: 'TMT Rebar 16mm Fe500',       category: 'Steel',     onHand: 180,   reorderPoint: 500, unit: 'kg',    lastReceived: '2081-02-28', supplier: 'Himal Iron',        stockStatus: 'critical' },
  { id: 'M004', name: 'Coarse Sand (Sieved)',        category: 'Aggregate', onHand: 38,    reorderPoint: 20,  unit: 'cum',   lastReceived: '2081-03-14', supplier: 'Local Quarry',      stockStatus: 'ok'       },
  { id: 'M005', name: '20mm Crushed Aggregate',     category: 'Aggregate', onHand: 52,    reorderPoint: 30,  unit: 'cum',   lastReceived: '2081-03-14', supplier: 'Local Quarry',      stockStatus: 'ok'       },
  { id: 'M006', name: 'UPVC Conduit 25mm',           category: 'Electrical',onHand: 0,     reorderPoint: 100, unit: 'rft',   lastReceived: '2081-01-20', supplier: 'Panchakanya',       stockStatus: 'out'      },
  { id: 'M007', name: 'Ceramic Tiles 600×600',       category: 'Finishing', onHand: 840,   reorderPoint: 500, unit: 'sqft',  lastReceived: '2081-03-01', supplier: 'Kajaria Nepal',     stockStatus: 'ok'       },
  { id: 'M008', name: 'PVC Water Pipe 3/4"',         category: 'Plumbing',  onHand: 45,    reorderPoint: 100, unit: 'rft',   lastReceived: '2081-02-15', supplier: 'Supreme Pipes',     stockStatus: 'critical' },
  { id: 'M009', name: 'Brick (Standard)',             category: 'Masonry',   onHand: 12400, reorderPoint: 5000,unit: 'nos',   lastReceived: '2081-03-13', supplier: 'Bhaktapur Kilns',   stockStatus: 'ok'       },
  { id: 'M010', name: 'Waterproofing Compound',      category: 'Chemical',  onHand: 28,    reorderPoint: 40,  unit: 'litre', lastReceived: '2081-02-22', supplier: 'Pidilite Nepal',    stockStatus: 'low'      },
]

const STOCK_VARIANT = {
  'ok':       'success',
  'low':      'warning',
  'critical': 'danger',
  'out':      'danger',
} as const

const matCol = createColumnHelper<MaterialItem>()
const MAT_COLUMNS = [
  selectionColumn<MaterialItem>(),
  matCol.accessor('id', {
    header: 'Code',
    size:   70,
    cell:   (i) => <span className="font-mono text-xs text-[--text-secondary]">{i.getValue()}</span>,
  }),
  matCol.accessor('name', {
    header: 'Material',
    size:   240,
    cell:   (i) => <span className="font-medium">{i.getValue()}</span>,
  }),
  matCol.accessor('category', {
    header: 'Category',
    size:   110,
    cell:   (i) => <Badge variant="default" size="sm">{i.getValue()}</Badge>,
  }),
  matCol.accessor('onHand', {
    header: 'On Hand',
    size:   90,
    cell:   (i) => {
      const row = i.row.original
      const pct = row.onHand / row.reorderPoint
      return (
        <span className={cn(
          'tabular-nums font-semibold',
          pct === 0 ? 'text-[--color-danger-text]' :
          pct < 0.5 ? 'text-[--color-danger-text]' :
          pct < 1   ? 'text-[--color-warning-text]' :
                      'text-[--text-primary]',
        )}>
          {i.getValue().toLocaleString()} {row.unit}
        </span>
      )
    },
  }),
  matCol.accessor('reorderPoint', {
    header: 'Reorder At',
    size:   100,
    cell:   (i) => <span className="tabular-nums text-[--text-secondary]">{i.getValue().toLocaleString()} {i.row.original.unit}</span>,
  }),
  matCol.accessor('lastReceived', {
    header: 'Last Received',
    size:   130,
    cell:   (i) => <span className="text-[--text-secondary]">{i.getValue()}</span>,
  }),
  matCol.accessor('supplier', {
    header: 'Supplier',
    size:   160,
    cell:   (i) => <span className="text-[--text-secondary]">{i.getValue()}</span>,
  }),
  matCol.accessor('stockStatus', {
    header: 'Stock',
    size:   90,
    cell:   (i) => (
      <Badge variant={STOCK_VARIANT[i.getValue()]} dot size="sm">
        {i.getValue() === 'out' ? 'Out of stock' : i.getValue()}
      </Badge>
    ),
  }),
]

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}

export const InventoryTable: Story = {
  name: '📦 Inventory / Materials',
  render: () => (
    <DataTable<MaterialItem>
      columns={MAT_COLUMNS}
      data={MAT_DATA}
      searchable
      searchPlaceholder="Search materials…"
      columnToggle
      pagination
      pageSize={8}
      aria-label="Materials inventory"
      rowActions={[
        { label: 'Request stock',   icon: <ShoppingCart  className="h-4 w-4" />, onClick: (r) => alert(`Request ${r.original.name}`) },
        { label: 'View history',    icon: <Eye           className="h-4 w-4" />, onClick: (r) => alert(`History ${r.original.name}`) },
        { label: 'Flag shortage',   icon: <AlertTriangle className="h-4 w-4" />, onClick: (r) => alert(`Flag ${r.original.name}`) },
      ]}
      bulkActions={[
        { label: 'Raise PO',     icon: <Send     className="h-4 w-4" />, onClick: (rows) => alert(`Create PO for ${rows.length} items`) },
        { label: 'Export',       icon: <Download className="h-4 w-4" />, onClick: (rows) => alert(`Export ${rows.length} items`) },
      ]}
    />
  ),
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3 · ACTIVITY PROGRESS TABLE (with ProgressRing in cells)
// ═══════════════════════════════════════════════════════════════════════════════

type ActivityRow = {
  id:          string
  trade:       string
  activity:    string
  assignee:    string
  planned:     number
  actual:      number
  startDate:   string
  endDate:     string
  daysLeft:    number
  status:      'completed' | 'on-track' | 'at-risk' | 'delayed' | 'not-started'
}

const ACT_DATA: ActivityRow[] = [
  { id: 'A01', trade: 'Concrete',   activity: 'G+1 Column casting',        assignee: 'Bikash Karki',    planned: 100, actual: 100, startDate: '2081-01-10', endDate: '2081-01-28', daysLeft: 0,  status: 'completed'   },
  { id: 'A02', trade: 'Concrete',   activity: 'G+1 Beam & slab formwork',  assignee: 'Bikash Karki',    planned: 80,  actual: 68,  startDate: '2081-02-01', endDate: '2081-02-22', daysLeft: 4,  status: 'at-risk'     },
  { id: 'A03', trade: 'Steel',      activity: 'G+1 Rebar fabrication',     assignee: 'Ram Bahadur',     planned: 60,  actual: 58,  startDate: '2081-02-05', endDate: '2081-02-25', daysLeft: 3,  status: 'on-track'    },
  { id: 'A04', trade: 'Masonry',    activity: 'External wall brickwork',   assignee: 'Sunita Gurung',   planned: 40,  actual: 22,  startDate: '2081-02-15', endDate: '2081-03-20', daysLeft: 18, status: 'delayed'     },
  { id: 'A05', trade: 'MEP',        activity: 'Electrical conduit routing', assignee: 'Anish Tamang',   planned: 30,  actual: 30,  startDate: '2081-02-20', endDate: '2081-03-15', daysLeft: 12, status: 'on-track'    },
  { id: 'A06', trade: 'MEP',        activity: 'Water supply rough-in',     assignee: 'Anish Tamang',    planned: 20,  actual: 8,   startDate: '2081-03-01', endDate: '2081-03-25', daysLeft: 22, status: 'at-risk'     },
  { id: 'A07', trade: 'Finishing',  activity: 'Plastering internal walls', assignee: 'Manisha Lama',    planned: 0,   actual: 0,   startDate: '2081-04-01', endDate: '2081-05-15', daysLeft: 58, status: 'not-started' },
  { id: 'A08', trade: 'Finishing',  activity: 'Floor tile laying',         assignee: 'Manisha Lama',    planned: 0,   actual: 0,   startDate: '2081-05-01', endDate: '2081-06-10', daysLeft: 85, status: 'not-started' },
]

const TRADE_VARIANT: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
  Concrete:  'primary',
  Steel:     'info',
  Masonry:   'warning',
  MEP:       'success',
  Finishing: 'default',
}

const actCol = createColumnHelper<ActivityRow>()
const ACT_COLUMNS = [
  actCol.accessor('trade', {
    header: 'Trade',
    size:   110,
    cell:   (i) => <Badge variant={TRADE_VARIANT[i.getValue()] ?? 'default'} size="sm">{i.getValue()}</Badge>,
  }),
  actCol.accessor('activity', {
    header: 'Activity',
    size:   260,
    cell:   (i) => <span className="font-medium">{i.getValue()}</span>,
  }),
  actCol.accessor('assignee', {
    header: 'Assignee',
    size:   160,
    cell:   (i) => (
      <div className="flex items-center gap-2">
        <Avatar name={i.getValue()} size="sm" />
        <span className="text-[--text-secondary] text-xs">{i.getValue()}</span>
      </div>
    ),
  }),
  actCol.accessor('planned', {
    header: 'Planned %',
    size:   90,
    cell:   (i) => (
      <div className="flex items-center gap-1.5">
        <ProgressRing value={i.getValue()} size="sm" description={`Planned ${i.getValue()}%`} />
        <span className="tabular-nums text-xs text-[--text-tertiary]">{i.getValue()}%</span>
      </div>
    ),
  }),
  actCol.accessor('actual', {
    header: 'Actual %',
    size:   90,
    cell:   (i) => (
      <div className="flex items-center gap-1.5">
        <ProgressRing value={i.getValue()} size="sm" description={`Actual ${i.getValue()}%`} />
        <span className="tabular-nums text-xs text-[--text-tertiary]">{i.getValue()}%</span>
      </div>
    ),
  }),
  actCol.accessor('startDate', { header: 'Start',    size: 110, cell: (i) => <span className="text-xs text-[--text-secondary]">{i.getValue()}</span> }),
  actCol.accessor('endDate',   { header: 'Finish',   size: 110, cell: (i) => <span className="text-xs text-[--text-secondary]">{i.getValue()}</span> }),
  actCol.accessor('daysLeft', {
    header: 'Days Left',
    size:   85,
    cell:   (i) => {
      const d = i.getValue()
      const row = i.row.original
      return (
        <span className={cn(
          'tabular-nums font-semibold text-sm',
          row.status === 'completed' ? 'text-[--color-success-text]' :
          d <= 5 && d > 0 ? 'text-[--color-danger-text]' :
          d <= 14 ? 'text-[--color-warning-text]' :
          'text-[--text-secondary]',
        )}>
          {d === 0 ? '—' : d}
        </span>
      )
    },
  }),
  actCol.accessor('status', {
    header: 'Status',
    size:   110,
    cell:   (i) => {
      const map = {
        'completed':   'success',
        'on-track':    'primary',
        'at-risk':     'warning',
        'delayed':     'danger',
        'not-started': 'default',
      } as const
      return (
        <Badge variant={map[i.getValue()]} dot size="sm">
          {i.getValue().replace('-', ' ')}
        </Badge>
      )
    },
  }),
]

export const ActivityProgress: Story = {
  name: '📊 Activity Progress',
  render: () => (
    <DataTable<ActivityRow>
      columns={ACT_COLUMNS}
      data={ACT_DATA}
      searchable
      searchPlaceholder="Search activities…"
      columnToggle
      pagination={false}
      stickyHeader
      aria-label="Activity progress"
      rowActions={[
        { label: 'Update progress', icon: <Edit3 className="h-4 w-4" />, onClick: (r) => alert(`Update ${r.original.activity}`) },
        { label: 'View details',    icon: <Eye   className="h-4 w-4" />, onClick: (r) => alert(`View ${r.original.activity}`) },
      ]}
    />
  ),
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4 · LOADING SKELETON
// ═══════════════════════════════════════════════════════════════════════════════

export const LoadingState: Story = {
  name: 'Loading skeleton',
  render: () => (
    <DataTable<BoqItem>
      columns={BOQ_COLUMNS}
      data={[]}
      loading
      pagination={false}
      aria-label="Loading BOQ"
    />
  ),
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5 · EMPTY STATE
// ═══════════════════════════════════════════════════════════════════════════════

export const EmptyState: Story = {
  name: 'Empty state',
  render: () => (
    <DataTable<BoqItem>
      columns={BOQ_COLUMNS}
      data={[]}
      searchable
      pagination={false}
      aria-label="Empty BOQ"
      emptyState={
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[--surface-hover]">
            <svg viewBox="0 0 24 24" className="h-7 w-7 text-[--text-tertiary]" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-[--text-primary]">No BOQ items yet</p>
          <p className="text-xs text-[--text-tertiary] max-w-xs text-center">
            Import from an Excel template or add items manually to get started.
          </p>
        </div>
      }
    />
  ),
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6 · SELECTION + BULK ACTIONS (interactive)
// ═══════════════════════════════════════════════════════════════════════════════

export const SelectionAndBulkActions: Story = {
  name: 'Selection + bulk actions',
  render: () => {
    const [log, setLog] = useState<string[]>([])
    return (
      <div className="flex flex-col gap-4">
        <DataTable<BoqItem>
          columns={BOQ_COLUMNS}
          data={BOQ_DATA.slice(0, 6)}
          pagination={false}
          aria-label="BOQ with selection"
          bulkActions={[
            {
              label: 'Export',
              icon:  <Download className="h-4 w-4" />,
              onClick: (rows) => setLog((l) => [`Exported ${rows.length} items`, ...l]),
            },
            {
              label:   'Delete',
              icon:    <Trash2 className="h-4 w-4" />,
              variant: 'destructive',
              onClick: (rows) => setLog((l) => [`Deleted ${rows.length} items`, ...l]),
            },
          ]}
          rowActions={[
            { label: 'Edit',   icon: <Edit3  className="h-4 w-4" />, onClick: (r) => setLog((l) => [`Edited ${r.original.code}`, ...l]) },
            { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, variant: 'destructive', onClick: (r) => setLog((l) => [`Deleted ${r.original.code}`, ...l]) },
          ]}
        />
        {log.length > 0 && (
          <div className="rounded-lg border border-[--border-default] bg-[--surface-card] p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[--text-tertiary]">Action log</p>
            {log.slice(0, 5).map((entry, i) => (
              <p key={i} className="text-sm text-[--text-secondary] py-0.5">{entry}</p>
            ))}
          </div>
        )}
      </div>
    )
  },
}
