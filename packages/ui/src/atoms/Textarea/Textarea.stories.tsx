import type { Meta, StoryObj } from '@storybook/react'
import { Textarea } from './Textarea'

const meta = {
  title:     'Atoms/Textarea',
  component:  Textarea,
  tags:      ['autodocs'],
  parameters: { layout: 'padded' },
  args: { label: 'Notes', placeholder: 'Enter text…' },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { label: 'Site observation', rows: 3 },
}

export const WithHint: Story = {
  args: {
    label:       'Daily progress notes',
    hint:        'Describe work completed, issues encountered, and next steps',
    placeholder: 'e.g. Poured 72 sqm of G+1 slab. Curing started. Formwork removal tomorrow.',
    rows:        4,
  },
}

export const Error: Story = {
  args: {
    label: 'Reason for delay',
    error: 'This field is required when status is "Delayed"',
    rows:  3,
  },
}

export const Disabled: Story = {
  args: {
    label:        'Audit remarks',
    defaultValue: 'Completed and verified by PM on 2081-03-14.',
    disabled:     true,
    rows:         2,
  },
}

export const AutoResize: Story = {
  name: 'Auto-resize',
  args: {
    label:       'Material request notes',
    hint:        'Grows as you type (capped at 8 rows)',
    placeholder: 'Start typing to see auto-resize…',
    autoResize:  true,
    rows:        2,
    maxRows:     8,
  },
}

export const Sizes: Story = {
  name: 'Sizes: sm / md / lg',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
      <Textarea label="Small"  size="sm" rows={2} placeholder="Small textarea…"  />
      <Textarea label="Medium" size="md" rows={3} placeholder="Medium textarea…" />
      <Textarea label="Large"  size="lg" rows={3} placeholder="Large textarea…"  />
    </div>
  ),
}
