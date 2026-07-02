import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './Badge'

const meta = {
  title:     'Atoms/Badge',
  component:  Badge,
  tags:      ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Status label used throughout CIP. Pairs colour + (optional dot) + text so status is never conveyed by colour alone.

**Construction use cases:** activity status, safety severity, material stock level, approval state, forecast risk.
        `.trim(),
      },
    },
  },
  argTypes: {
    variant: { control: 'select' },
    size:    { control: 'select' },
    dot:     { control: 'boolean' },
    children:{ control: 'text' },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { children: 'In Progress' },
}

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
      <Badge variant="default">Default</Badge>
      <Badge variant="primary">Primary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="danger">Danger</Badge>
      <Badge variant="info">Info</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
}

export const WithDot: Story = {
  name: 'With Status Dot',
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      <Badge variant="success" dot>On Track</Badge>
      <Badge variant="warning" dot>At Risk</Badge>
      <Badge variant="danger"  dot>Delayed</Badge>
      <Badge variant="info"    dot>Pending</Badge>
    </div>
  ),
}

export const ConstructionStatuses: Story = {
  name: '📐 Construction Use Cases',
  parameters: {
    docs: {
      description: {
        story: 'Badge labels from real CIP screens — activity status, safety, forecasts.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', width: '80px' }}>Activity:</span>
        <Badge variant="success" dot>Completed</Badge>
        <Badge variant="primary" dot>In Progress</Badge>
        <Badge variant="warning" dot>At Risk</Badge>
        <Badge variant="danger"  dot>Delayed</Badge>
        <Badge variant="outline"    >Not Started</Badge>
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', width: '80px' }}>Safety:</span>
        <Badge variant="danger"  dot>Critical</Badge>
        <Badge variant="warning" dot>Major</Badge>
        <Badge variant="info"    dot>Minor</Badge>
        <Badge variant="outline" dot>Observation</Badge>
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', width: '80px' }}>Stock:</span>
        <Badge variant="danger"  dot>Critical Low</Badge>
        <Badge variant="warning" dot>Reorder Soon</Badge>
        <Badge variant="success" dot>Adequate</Badge>
      </div>
    </div>
  ),
}
