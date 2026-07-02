import type { Meta, StoryObj } from '@storybook/react'
import { ProgressRing } from './ProgressRing'

const meta = {
  title:     'Atoms/ProgressRing',
  component:  ProgressRing,
  tags:      ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Circular progress indicator. Uses the 5-band CIP progress colour scale by default:
**0–25%** danger red → **26–50%** amber → **51–75%** sky → **76–99%** blue → **100%** green.

Used on activity cards, site summary dashboards, and the executive portfolio view.
Respects \`prefers-reduced-motion\` — the fill animation is disabled when set.
      `.trim(),
      },
    },
  },
  argTypes: {
    value:  { control: { type: 'range', min: 0, max: 100, step: 1 } },
    size:   { control: 'select' },
    colour: { control: 'color' },
    label:  { control: 'text' },
  },
} satisfies Meta<typeof ProgressRing>

export default meta
type Story = StoryObj<typeof meta>

// ── Base ──────────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    value:       65,
    description: 'Foundation progress',
  },
}

export const Complete: Story = {
  args: { value: 100, description: 'Activity complete' },
}

export const Critical: Story = {
  args: { value: 18, description: 'Critical — very low progress' },
}

// ── Sizes ─────────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  name: 'All Sizes',
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
      <ProgressRing value={72} size="sm" description="Small ring" />
      <ProgressRing value={72} size="md" description="Medium ring" />
      <ProgressRing value={72} size="lg" description="Large ring" />
    </div>
  ),
}

// ── Colour scale ──────────────────────────────────────────────────────────────

export const ColourScale: Story = {
  name: '5-Band Colour Scale',
  parameters: {
    docs: {
      description: {
        story: 'Each band maps to a semantic CIP token — colour is never hardcoded.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
      {[12, 38, 62, 88, 100].map((v) => (
        <div key={v} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <ProgressRing value={v} size="md" description={`${v}% progress`} />
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{v}%</span>
        </div>
      ))}
    </div>
  ),
}

// ── Custom label ──────────────────────────────────────────────────────────────

export const CustomLabel: Story = {
  name: 'Custom Centre Label',
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <ProgressRing value={78} size="lg" label="78%" description="Budget consumed" />
      <ProgressRing value={45} size="lg" label="45 / 100" description="Activities complete" />
      <ProgressRing value={92} size="lg" label={null}     description="No label variant" />
    </div>
  ),
}

// ── Construction domain ───────────────────────────────────────────────────────

export const ConstructionUseCases: Story = {
  name: '📐 Dashboard Use Cases',
  parameters: {
    docs: {
      description: {
        story: 'How ProgressRing appears across CIP dashboard cards.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px' }}>
      {[
        { label: 'Foundation',   value: 100, title: 'Completed'   },
        { label: 'Structure',    value: 82,  title: 'On Track'     },
        { label: 'MEP Rough',    value: 54,  title: 'In Progress'  },
        { label: 'Finishing',    value: 31,  title: 'At Risk'      },
        { label: 'Landscaping',  value: 8,   title: 'Critical'     },
      ].map(({ label, value, title }) => (
        <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <ProgressRing value={value} size="lg" description={`${label} progress`} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{title}</span>
        </div>
      ))}
    </div>
  ),
}
