import type { Meta, StoryObj } from '@storybook/react'
import { expect, within, userEvent } from '@storybook/test'
import { Plus, Download, Trash2, ArrowRight, Save } from 'lucide-react'
import { Button } from './Button'

// ── Meta ──────────────────────────────────────────────────────────────────────
const meta = {
  title:     'Atoms/Button',
  component:  Button,
  tags:      ['autodocs'],

  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Primary interactive element for CIP.

**When to use:**
- \`primary\` — the single most important action on a page (Submit Report, Save BOQ)
- \`secondary\` — supporting actions alongside a primary (Cancel, Back)
- \`ghost\` — low-emphasis inline actions (View Details, Edit)
- \`destructive\` — irreversible actions with risk (Delete Site, Remove Activity)
- \`link\` — navigate without visual weight

**Accessibility:** Renders a native \`<button>\`. Loading state adds \`aria-busy\` and a visually-hidden "Loading" label.
        `.trim(),
      },
    },
  },

  argTypes: {
    variant:   { control: 'select', description: 'Visual style' },
    size:      { control: 'select', description: 'Height and padding' },
    loading:   { control: 'boolean', description: 'Show spinner, imply disabled' },
    disabled:  { control: 'boolean', description: 'Prevent interaction' },
    children:  { control: 'text',    description: 'Button label' },
    iconLeft:  { control: false },
    iconRight: { control: false },
    asChild:   { control: false },
    onClick:   { action: 'clicked' },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

// ── Base stories ──────────────────────────────────────────────────────────────

export const Primary: Story = {
  args: { variant: 'primary', children: 'Save Report', size: 'md' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const btn    = canvas.getByRole('button', { name: /save report/i })
    await expect(btn).toBeInTheDocument()
    await expect(btn).not.toBeDisabled()
    await userEvent.click(btn)
    await expect(btn).toHaveFocus()
  },
}

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Cancel', size: 'md' },
}

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'View Details', size: 'md' },
}

export const Destructive: Story = {
  name: 'Destructive',
  args: { variant: 'destructive', children: 'Delete Activity', size: 'md' },
}

export const LinkVariant: Story = {
  name: 'Link',
  args: { variant: 'link', children: 'See full report', size: 'md' },
}

// ── State stories ─────────────────────────────────────────────────────────────

export const Loading: Story = {
  args:      { variant: 'primary', children: 'Saving…', loading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const btn    = canvas.getByRole('button')
    await expect(btn).toBeDisabled()
    await expect(btn).toHaveAttribute('aria-busy', 'true')
  },
}

export const Disabled: Story = {
  args: { variant: 'primary', children: 'Submit Report', disabled: true },
  play: async ({ canvasElement }) => {
    const btn = within(canvasElement).getByRole('button')
    await expect(btn).toBeDisabled()
  },
}

// ── Size stories ──────────────────────────────────────────────────────────────

export const Sizes: Story = {
  name: 'All Sizes',
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
}

// ── Icon stories ──────────────────────────────────────────────────────────────

export const WithIconLeft: Story = {
  name: 'With Left Icon',
  args: {
    variant:  'primary',
    children: 'Add Activity',
    iconLeft: <Plus className="h-4 w-4" />,
  },
}

export const WithIconRight: Story = {
  name: 'With Right Icon',
  args: {
    variant:   'secondary',
    children:  'Next Step',
    iconRight: <ArrowRight className="h-4 w-4" />,
  },
}

export const IconOnly: Story = {
  name: 'Icon Only',
  args: {
    variant:    'ghost',
    size:       'icon',
    children:   <Save className="h-4 w-4" />,
    'aria-label': 'Save',
  },
}

// ── Variant showcase ──────────────────────────────────────────────────────────

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
}

// ── Construction-domain examples ──────────────────────────────────────────────

export const ConstructionActions: Story = {
  name: '📐 Construction Use Cases',
  parameters: {
    docs: {
      description: {
        story: 'Real button labels from CIP workflows — daily reporting, BOQ, and site management.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <Button variant="primary"  iconLeft={<Plus     className="h-4 w-4" />}>Add Progress Entry</Button>
        <Button variant="secondary"iconLeft={<Download className="h-4 w-4" />}>Export BOQ</Button>
        <Button variant="ghost"    iconLeft={<Save     className="h-4 w-4" />}>Save Draft</Button>
        <Button variant="destructive" iconLeft={<Trash2 className="h-4 w-4" />}>Remove from Site</Button>
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <Button size="lg" variant="primary">Submit Daily Report</Button>
        <Button size="lg" variant="secondary">Request Approval</Button>
      </div>
    </div>
  ),
}
