import type { Meta, StoryObj } from '@storybook/react'
import {
  TrendingUp, Package, Users, Truck, DollarSign,
  ShieldCheck, CalendarClock, AlertTriangle,
} from 'lucide-react'
import { MetricCard } from './MetricCard'

const meta = {
  title:     'Molecules/MetricCard',
  component:  MetricCard,
  tags:      ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Single-KPI tile used across all CIP dashboards. A coloured left border
encodes semantic status (ok / warning / danger) so state is visible
at a glance without reading the number.

**30-second rule:** A project manager must understand project health in
30 seconds. A grid of MetricCards is the primary tool that achieves this.
      `.trim(),
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '240px' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    status:   { control: 'select' },
    loading:  { control: 'boolean' },
    trend:    { control: { type: 'range', min: -50, max: 50, step: 1 } },
    trendPositiveIsGood: { control: 'boolean' },
  },
} satisfies Meta<typeof MetricCard>

export default meta
type Story = StoryObj<typeof meta>

// ── Base ──────────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    label:      'Overall Progress',
    value:      '68',
    unit:       '%',
    trend:      4,
    trendLabel: 'vs last week',
    status:     'ok',
    icon:       <TrendingUp className="h-5 w-5" />,
  },
}

export const Warning: Story = {
  args: {
    label:      'Schedule Delay',
    value:      '12',
    unit:       'days',
    trend:      3,
    trendLabel: 'since last report',
    trendPositiveIsGood: false,
    status:     'warning',
    icon:       <CalendarClock className="h-5 w-5" />,
  },
}

export const Danger: Story = {
  args: {
    label:      'Safety Violations',
    value:      '4',
    trend:      2,
    trendLabel: 'this week',
    trendPositiveIsGood: false,
    status:     'danger',
    icon:       <AlertTriangle className="h-5 w-5" />,
  },
}

export const Loading: Story = {
  args: {
    label:   'Total Cost',
    value:   0,
    loading: true,
    icon:    <DollarSign className="h-5 w-5" />,
  },
}

export const NoTrend: Story = {
  name: 'Without Trend',
  args: {
    label:    'Active Sites',
    value:    '7',
    subLabel: 'Across 3 districts',
    status:   'ok',
  },
}

export const FlatTrend: Story = {
  name: 'Flat Trend',
  args: {
    label:      'Labour Headcount',
    value:      '84',
    unit:       'workers',
    trend:      0,
    trendLabel: 'vs yesterday',
    icon:       <Users className="h-5 w-5" />,
  },
}

// ── Dashboard grid ────────────────────────────────────────────────────────────

export const DashboardGrid: Story = {
  name: '📐 Project Dashboard Grid',
  args: {} as any,
  decorators: [(Story) => <Story />],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'A realistic 4-card top row from the CIP Project Dashboard. ' +
               'Status border colours convey health without requiring the number to be read.',
      },
    },
  },
  render: () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
      gap: '16px',
      maxWidth: '960px',
    }}>
      <MetricCard
        label="Overall Progress"
        value="68" unit="%"
        trend={4} trendLabel="vs last week"
        status="ok"
        icon={<TrendingUp className="h-5 w-5" />}
      />
      <MetricCard
        label="Schedule Performance"
        value="0.87" unit="SPI"
        trend={-0.03} trendLabel="vs baseline"
        trendPositiveIsGood={true}
        status="warning"
        subLabel="12 days behind schedule"
        icon={<CalendarClock className="h-5 w-5" />}
      />
      <MetricCard
        label="Cement Stock"
        value="420" unit="bags"
        trend={-80} trendLabel="since Monday"
        trendPositiveIsGood={false}
        status="danger"
        subLabel="Reorder point: 200 bags"
        icon={<Package className="h-5 w-5" />}
      />
      <MetricCard
        label="Equipment Utilisation"
        value="74" unit="%"
        trend={6} trendLabel="vs last week"
        status="ok"
        icon={<Truck className="h-5 w-5" />}
      />
      <MetricCard
        label="Safety Score"
        value="82" unit="/100"
        trend={-3} trendLabel="vs last week"
        trendPositiveIsGood={true}
        status="warning"
        icon={<ShieldCheck className="h-5 w-5" />}
      />
      <MetricCard
        label="Cost Performance"
        value="0.92" unit="CPI"
        trend={0.01} trendLabel="vs last week"
        status="ok"
        subLabel="NPR 1.2Cr under budget"
        icon={<DollarSign className="h-5 w-5" />}
      />
    </div>
  ),
}

export const LoadingGrid: Story = {
  name: 'Loading State Grid',
  args: {} as any,
  decorators: [(Story) => <Story />],
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 220px)', gap: '16px' }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <MetricCard key={i} label="Loading…" value={0} loading />
      ))}
    </div>
  ),
}
