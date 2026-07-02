import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Search, Settings2 } from 'lucide-react'
import { FilterBar, FilterChip } from './FilterBar'
import { Button }    from '../../atoms/Button'
import { Select }    from '../../atoms/Select'
import { DataTable, selectionColumn } from '../../organisms/DataTable'
import { Badge }     from '../../atoms/Badge'
import { createColumnHelper } from '@tanstack/react-table'

const meta = {
  title:     'Molecules/FilterBar',
  component:  FilterBar,
  tags:      ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof FilterBar>

export default meta
type Story = StoryObj<typeof meta>

// ── Stories ───────────────────────────────────────────────────────────────────

export const WithChips: Story = {
  name: 'With active filter chips',
  args: {
    filters: [
      { id: 'status',   label: 'Status',   value: 'At risk'     },
      { id: 'trade',    label: 'Trade',    value: 'Concrete'    },
      { id: 'assignee', label: 'Assignee', value: 'Bikash Karki'},
    ],
    onClearAll: () => {},
  },
}

export const NoFilters: Story = {
  name: 'No active filters',
  args: {
    filters:      [],
    filterLabel:  'Filters',
    onFilterClick: () => {},
    leftSlot: (
      <div style={{ position: 'relative', width: '240px' }}>
        <Search className="h-3.5 w-3.5" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} aria-hidden />
        <input
          placeholder="Search…"
          style={{
            width: '100%', height: '32px', paddingLeft: '30px', paddingRight: '12px',
            borderRadius: '8px', border: '1px solid var(--border-default)',
            background: 'var(--surface-input)', color: 'var(--text-primary)',
            fontSize: '13px', outline: 'none',
          }}
          aria-label="Search"
        />
      </div>
    ) as any,
  },
}

// ── Standalone FilterChip ────────────────────────────────────────────────────

export const Chips: Story = {
  name: 'FilterChip standalone',
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
      <FilterChip id="a" label="Status"   value="At risk"      onRemove={() => {}} />
      <FilterChip id="b" label="Trade"    value="Concrete"     onRemove={() => {}} />
      <FilterChip id="c" label="Progress" value="< 50%"        onRemove={() => {}} />
      <FilterChip id="d" label="Assignee" value="Bikash Karki" onRemove={() => {}} />
      <FilterChip id="e" label="Due"      value="This week"    />
    </div>
  ),
}

// ── Full integration: FilterBar + DataTable ───────────────────────────────────

type ActivityRow = { id: string; activity: string; trade: string; status: string; progress: number; assignee: string }

const ROWS: ActivityRow[] = [
  { id: 'A01', activity: 'G+1 Column casting',        trade: 'Concrete', status: 'Complete',     progress: 100, assignee: 'Bikash Karki'  },
  { id: 'A02', activity: 'G+1 Beam & slab formwork',  trade: 'Concrete', status: 'At risk',      progress: 68,  assignee: 'Bikash Karki'  },
  { id: 'A03', activity: 'G+1 Rebar fabrication',     trade: 'Steel',    status: 'On track',     progress: 58,  assignee: 'Ram Bahadur'   },
  { id: 'A04', activity: 'External wall brickwork',   trade: 'Masonry',  status: 'Delayed',      progress: 22,  assignee: 'Sunita Gurung' },
  { id: 'A05', activity: 'Electrical conduit routing',trade: 'MEP',      status: 'On track',     progress: 30,  assignee: 'Anish Tamang'  },
  { id: 'A06', activity: 'Water supply rough-in',     trade: 'MEP',      status: 'At risk',      progress: 8,   assignee: 'Anish Tamang'  },
  { id: 'A07', activity: 'Plastering internal walls', trade: 'Finishing',status: 'Not started',  progress: 0,   assignee: 'Manisha Lama'  },
]

const VARIANT_MAP: Record<string, any> = { Complete: 'success', 'On track': 'primary', 'At risk': 'warning', Delayed: 'danger', 'Not started': 'default' }
const col = createColumnHelper<ActivityRow>()
const COLS = [
  selectionColumn<ActivityRow>(),
  col.accessor('id',       { header: 'ID', size: 60, cell: (i) => <span className="font-mono text-xs text-[--text-secondary]">{i.getValue()}</span> }),
  col.accessor('trade',    { header: 'Trade',    size: 110, cell: (i) => <Badge variant="default" size="sm">{i.getValue()}</Badge> }),
  col.accessor('activity', { header: 'Activity', size: 260 }),
  col.accessor('assignee', { header: 'Assignee', size: 150, cell: (i) => <span className="text-[--text-secondary] text-xs">{i.getValue()}</span> }),
  col.accessor('progress', { header: '%', size: 60, cell: (i) => <span className="tabular-nums font-semibold">{i.getValue()}</span> }),
  col.accessor('status', {
    header: 'Status', size: 110,
    cell: (i) => <Badge variant={VARIANT_MAP[i.getValue()]} dot size="sm">{i.getValue()}</Badge>,
  }),
]

export const WithDataTable: Story = {
  name: 'FilterBar + DataTable (interactive)',
  render: () => {
    const [statusFilter, setStatusFilter] = useState('')
    const [tradeFilter,  setTradeFilter]  = useState('')
    const [search,       setSearch]       = useState('')

    const activeFilters = [
      statusFilter && { id: 'status', label: 'Status', value: statusFilter, onRemove: () => setStatusFilter('') },
      tradeFilter  && { id: 'trade',  label: 'Trade',  value: tradeFilter,  onRemove: () => setTradeFilter('')  },
    ].filter(Boolean) as any[]

    const filtered = ROWS.filter((r) =>
      (!statusFilter || r.status === statusFilter) &&
      (!tradeFilter  || r.trade  === tradeFilter)  &&
      (!search       || r.activity.toLowerCase().includes(search.toLowerCase())),
    )

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <FilterBar
          filters={activeFilters}
          onClearAll={() => { setStatusFilter(''); setTradeFilter('') }}
          leftSlot={
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ position: 'relative', width: '200px' }}>
                <Search className="h-3.5 w-3.5" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} aria-hidden />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search activities…"
                  style={{ width: '100%', height: '32px', paddingLeft: '30px', borderRadius: '8px', border: '1px solid var(--border-default)', background: 'var(--surface-input)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
                  aria-label="Search"
                />
              </div>
              <div style={{ width: '140px' }}>
                <Select
                  options={[
                    { value: 'Concrete',  label: 'Concrete'  },
                    { value: 'Steel',     label: 'Steel'     },
                    { value: 'Masonry',   label: 'Masonry'   },
                    { value: 'MEP',       label: 'MEP'       },
                    { value: 'Finishing', label: 'Finishing' },
                  ]}
                  value={tradeFilter}
                  onValueChange={setTradeFilter}
                  placeholder="All trades"
                  size="sm"
                />
              </div>
              <div style={{ width: '150px' }}>
                <Select
                  options={[
                    { value: 'Complete',    label: 'Complete'    },
                    { value: 'On track',    label: 'On track'    },
                    { value: 'At risk',     label: 'At risk'     },
                    { value: 'Delayed',     label: 'Delayed'     },
                    { value: 'Not started', label: 'Not started' },
                  ]}
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                  placeholder="All statuses"
                  size="sm"
                />
              </div>
            </div>
          }
          rightSlot={<Button variant="ghost" size="sm" iconLeft={<Settings2 className="h-3.5 w-3.5" />}>Columns</Button>}
        />

        <DataTable<ActivityRow>
          columns={COLS}
          data={filtered}
          pagination={false}
          aria-label="Activity progress"
          emptyState={
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
              No activities match the current filters
            </div>
          }
        />
      </div>
    )
  },
}
