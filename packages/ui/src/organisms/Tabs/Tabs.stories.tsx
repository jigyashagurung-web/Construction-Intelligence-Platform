import type { Meta, StoryObj } from '@storybook/react'
import {
  BarChart3, Clock, AlertTriangle,
  TrendingUp, Package, Plus,
} from 'lucide-react'
import { Tabs } from './Tabs'
import { DataTable, selectionColumn } from '../DataTable'
import { MetricCard } from '../../molecules/MetricCard'
import { Badge }      from '../../atoms/Badge'
import { Button }     from '../../atoms/Button'
import { ProgressRing } from '../../atoms/ProgressRing'
import { createColumnHelper } from '@tanstack/react-table'

const meta = {
  title:     'Organisms/Tabs',
  component:  Tabs,
  tags:      ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Tab navigation built on **Radix UI Tabs**.

Two variants:
- \`underline\` (default) — bottom border indicator, minimal, suits content-heavy pages
- \`pills\` — filled background, suits dashboards and filter panels

Optional \`count\` badge per tab for alert/item counts. \`headerSlot\` for actions alongside the tab list.
        `.trim(),
      },
    },
  },
} satisfies Meta<any>

export default meta
type Story = StoryObj<any>

// ── Fixtures ──────────────────────────────────────────────────────────────────

type BoqRow = { code: string; description: string; unit: string; qty: number; amount: number; status: string }

const BOQ_ROWS: BoqRow[] = [
  { code: '2.01', description: 'PCC M10 foundation',      unit: 'cum', qty: 95,  amount: 589000,  status: 'complete'  },
  { code: '2.02', description: 'RCC M25 footings',        unit: 'cum', qty: 142, amount: 1391600, status: 'on-track'  },
  { code: '2.03', description: 'RCC M30 columns G+1',     unit: 'cum', qty: 58,  amount: 649600,  status: 'at-risk'   },
  { code: '3.01', description: 'Fe500 TMT rebar all dia', unit: 'MT',  qty: 48,  amount: 4753000, status: 'on-track'  },
  { code: '4.01', description: 'Brick masonry 1:4',       unit: 'sqm', qty: 1240,amount: 1798000, status: 'delayed'   },
]

const nprf = (n: number) => new Intl.NumberFormat('en-NP', { maximumFractionDigits: 0 }).format(n)

const col = createColumnHelper<BoqRow>()
const BOQ_COLS = [
  selectionColumn<BoqRow>(),
  col.accessor('code',        { header: 'Code',        size: 70, cell: (i) => <span className="font-mono text-xs text-[--text-secondary]">{i.getValue()}</span> }),
  col.accessor('description', { header: 'Description', size: 280 }),
  col.accessor('unit',        { header: 'Unit',        size: 60,  cell: (i) => <span className="text-[--text-secondary]">{i.getValue()}</span> }),
  col.accessor('qty',         { header: 'Qty',         size: 80,  cell: (i) => <span className="tabular-nums">{i.getValue()}</span> }),
  col.accessor('amount',      { header: 'Amount (NPR)',size: 130, cell: (i) => <span className="tabular-nums font-semibold">{nprf(i.getValue())}</span> }),
  col.accessor('status', {
    header: 'Status',
    size: 100,
    cell: (i) => {
      const map = { complete: 'success', 'on-track': 'primary', 'at-risk': 'warning', delayed: 'danger' } as const
      return <Badge variant={(map as any)[i.getValue()] ?? 'default'} dot size="sm">{i.getValue()}</Badge>
    },
  }),
]

function SummaryPanel() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
      <MetricCard label="Contract value"     value="9,16,12,600" unit="NPR" status="ok"      icon={<TrendingUp  className="h-5 w-5" />} />
      <MetricCard label="Work done to date"  value="4,23,08,400" unit="NPR" trend={8}  trendLabel="vs last month" status="ok" icon={<BarChart3   className="h-5 w-5" />} />
      <MetricCard label="Remaining"          value="4,93,04,200" unit="NPR" status="ok"      icon={<Package     className="h-5 w-5" />} />
      <MetricCard label="Pending approvals"  value="3"           trend={1}  trendLabel="new today"  status="warning" trendPositiveIsGood={false} icon={<Clock className="h-5 w-5" />} />
    </div>
  )
}

function HistoryPanel() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {[
        { user: 'Anita Tamang',  action: 'Approved revision 3 — rebar quantities',  time: '2081-03-12 14:22',  type: 'ok'      },
        { user: 'Roshan Shrestha',action: 'Updated rate for PCC M10 (+8%)',          time: '2081-02-28 09:41',  type: 'warning' },
        { user: 'System',        action: 'BOQ imported from Excel — 142 items',     time: '2081-01-15 11:00',  type: 'ok'      },
      ].map(({ user, action, time, type }, i, arr) => (
        <div key={i} style={{
          display: 'flex', gap: '12px', padding: '12px 0',
          borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none',
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%', marginTop: 5, flexShrink: 0,
            background: type === 'ok' ? 'var(--color-success-icon)' : 'var(--color-warning-icon)',
          }} />
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{user}</p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{action}</p>
            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{time}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Stories ───────────────────────────────────────────────────────────────────

export const Underline: Story = {
  name: '📋 BOQ page tabs (underline)',
  render: () => (
    <Tabs
      variant="underline"
      headerSlot={<Button size="sm" iconLeft={<Plus className="h-4 w-4" />}>Add item</Button>}
      items={[
        {
          value: 'items',
          label: 'Line items',
          count: BOQ_ROWS.length,
          content: (
            <DataTable<BoqRow>
              columns={BOQ_COLS}
              data={BOQ_ROWS}
              searchable
              pagination={false}
              aria-label="BOQ line items"
            />
          ),
        },
        {
          value: 'summary',
          label: 'Summary',
          content: <SummaryPanel />,
        },
        {
          value: 'alerts',
          label: 'Alerts',
          count: 2,
          content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { msg: 'Rebar 16mm — insufficient stock for scheduled pour on 2081-03-20', variant: 'danger' as const },
                { msg: 'Rate variance on Brick masonry > 10% above market index', variant: 'warning' as const },
              ].map(({ msg, variant }, i) => (
                <div key={i} style={{
                  display: 'flex', gap: '10px', alignItems: 'flex-start',
                  padding: '12px 14px', borderRadius: '10px',
                  background: variant === 'danger' ? 'var(--color-danger-bg-subtle)' : 'var(--color-warning-bg-subtle)',
                  border: `1px solid ${variant === 'danger' ? 'var(--color-danger-border)' : 'var(--color-warning-border)'}`,
                }}>
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" style={{ color: variant === 'danger' ? 'var(--color-danger-icon)' : 'var(--color-warning-icon)' }} aria-hidden />
                  <p style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{msg}</p>
                </div>
              ))}
            </div>
          ),
        },
        {
          value: 'history',
          label: 'Change history',
          content: <HistoryPanel />,
        },
      ]}
    />
  ),
}

export const Pills: Story = {
  name: 'Pills variant',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '640px' }}>
      <Tabs
        variant="pills"
        items={[
          {
            value: 'overview',
            label: 'Overview',
            content: (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                {[
                  { label: 'Foundation',  value: 100 },
                  { label: 'Structure',   value: 82  },
                  { label: 'MEP rough',   value: 54  },
                  { label: 'Finishing',   value: 12  },
                  { label: 'Landscaping', value: 0   },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <ProgressRing value={value} size="md" description={`${label} ${value}%`} />
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{label}</span>
                  </div>
                ))}
              </div>
            ),
          },
          { value: 'schedule', label: 'Schedule', content: <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Gantt chart would render here.</p> },
          { value: 'cost',     label: 'Cost',     content: <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Cost breakdown chart would render here.</p> },
          { value: 'risks',    label: 'Risks', count: 3, content: <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Risk register would render here.</p> },
        ]}
      />
    </div>
  ),
}

export const Sizes: Story = {
  name: 'Sizes: sm / md',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', marginBottom: '12px' }}>size: sm</p>
        <Tabs size="sm" items={[
          { value: 'a', label: 'Tab A', content: <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Content A</p> },
          { value: 'b', label: 'Tab B', count: 4, content: <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Content B</p> },
          { value: 'c', label: 'Tab C', disabled: true, content: null },
        ]} />
      </div>
      <div>
        <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', marginBottom: '12px' }}>size: md (default)</p>
        <Tabs size="md" items={[
          { value: 'a', label: 'Tab A', content: <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Content A</p> },
          { value: 'b', label: 'Tab B', count: 4, content: <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Content B</p> },
          { value: 'c', label: 'Tab C', disabled: true, content: null },
        ]} />
      </div>
    </div>
  ),
}
