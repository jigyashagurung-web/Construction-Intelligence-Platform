import type { Meta, StoryObj } from '@storybook/react'
import { TooltipProvider, Tooltip } from './Tooltip'
import { Button } from '../Button'
import { Info } from 'lucide-react'

const meta = {
  title:     'Atoms/Tooltip',
  component:  Tooltip,
  tags:      ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [(Story) => <TooltipProvider><Story /></TooltipProvider>],
  argTypes: {
    side:  { control: 'select' },
    align: { control: 'select' },
  },
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    content:  'View full BOQ breakdown',
    children: <Button variant="secondary">Hover me</Button>,
  },
}

export const Sides: Story = {
  name: 'All Sides',
  args: {} as any,
  render: () => (
    <TooltipProvider>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', padding: '40px' }}>
        {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
          <Tooltip key={side} content={`Tooltip on ${side}`} side={side}>
            <Button variant="secondary" size="sm">{side}</Button>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  ),
}

export const IconTrigger: Story = {
  name: 'Icon Trigger (collapsed sidebar pattern)',
  args: {} as any,
  render: () => (
    <TooltipProvider>
      <Tooltip content="Daily Progress" side="right">
        <button
          aria-label="Daily Progress"
          style={{
            width: 40, height: 40, borderRadius: 8,
            background: 'var(--surface-hover)',
            border: '1px solid var(--border-default)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-secondary)',
          }}
        >
          <Info className="h-5 w-5" />
        </button>
      </Tooltip>
    </TooltipProvider>
  ),
}
