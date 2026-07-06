import type { Meta, StoryObj } from '@storybook/react'
import { expect, within, userEvent } from '@storybook/test'
import { Search, MapPin, Package, Calendar } from 'lucide-react'
import { Input } from './Input'

const meta = {
  title:     'Atoms/Input',
  component:  Input,
  tags:      ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Text input with integrated label, hint, error, icon, prefix, and suffix slots.

Built on a native \`<input>\` with a Radix Label so the label–input association
is programmatic, not visual-only. Error messages use \`role="alert"\` so screen
readers announce them on change.

**Construction use cases:** quantity entry with unit suffix, NPR currency fields,
site coordinate inputs, material search, date pickers.
        `.trim(),
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '320px' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    size:     { control: 'select' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    label:    { control: 'text' },
    hint:     { control: 'text' },
    error:    { control: 'text' },
    prefix:   { control: 'text' },
    suffix:   { control: 'text' },
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

// ── Base ──────────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    label:       'Activity Name',
    placeholder: 'e.g. Brickwork — Level 2',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input  = canvas.getByRole('textbox', { name: /activity name/i })
    await userEvent.type(input, 'Foundation Concrete Pour')
    await expect(input).toHaveValue('Foundation Concrete Pour')
  },
}

export const WithHint: Story = {
  args: {
    label:       'Planned Quantity',
    placeholder: '0',
    hint:        'Enter the planned quantity for this activity.',
    type:        'number',
  },
}

export const WithError: Story = {
  args: {
    label:       'Completed Quantity',
    placeholder: '0',
    error:       'Completed quantity cannot exceed planned quantity (240 m²).',
    value:       '300',
    type:        'number',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input  = canvas.getByRole('spinbutton', { name: /completed quantity/i })
    await expect(input).toHaveAttribute('aria-invalid', 'true')
  },
}

export const Disabled: Story = {
  args: {
    label:    'Site Code',
    value:    'KTM-SITE-04',
    disabled: true,
    hint:     'Assigned automatically on site creation.',
  },
}

export const Required: Story = {
  args: {
    label:       'Report Date',
    type:        'date',
    required:    true,
  },
}

// ── Adornment variants ────────────────────────────────────────────────────────

export const WithLeftIcon: Story = {
  name: 'With Left Icon',
  args: {
    label:       'Search Materials',
    placeholder: 'Cement, rebar, sand…',
    iconLeft:    <Search className="h-4 w-4" />,
  },
}

export const WithPrefix: Story = {
  name: 'With Prefix (Currency)',
  args: {
    label:       'Unit Rate',
    placeholder: '0.00',
    prefix:      'NPR',
    type:        'number',
    hint:        'Rate per unit as per BOQ.',
  },
}

export const WithSuffix: Story = {
  name: 'With Suffix (Unit)',
  args: {
    label:       'Completed Area',
    placeholder: '0',
    suffix:      'm²',
    type:        'number',
  },
}

export const WithBothAdornments: Story = {
  name: 'Prefix + Suffix',
  args: {
    label:       'Cost Range',
    placeholder: '0',
    prefix:      'NPR',
    suffix:      'per bag',
    type:        'number',
  },
}

// ── Size variants ─────────────────────────────────────────────────────────────

export const Sizes: Story = {
  name: 'All Sizes',
  args: {} as any,
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '320px' }}>
      <Input size="sm" label="Small"  placeholder="Small input" />
      <Input size="md" label="Medium" placeholder="Medium input (default)" />
      <Input size="lg" label="Large"  placeholder="Large input" />
    </div>
  ),
}

// ── Construction domain ───────────────────────────────────────────────────────

export const ConstructionFields: Story = {
  name: '📐 Construction Use Cases',
  args: {} as any,
  parameters: {
    docs: {
      description: {
        story: 'Common field patterns from CIP daily report, BOQ, and inventory screens.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '360px' }}>
      <Input
        label="Site Location (GPS)"
        placeholder="27.7172° N, 85.3240° E"
        iconLeft={<MapPin className="h-4 w-4" />}
        hint="Tap the map icon to pick from map."
      />
      <Input
        label="Cement Used Today"
        type="number"
        placeholder="0"
        suffix="bags"
        hint="1 bag = 50 kg. BOM estimate: 42 bags."
      />
      <Input
        label="Contract Value"
        type="number"
        placeholder="0.00"
        prefix="NPR"
        hint="As per agreement dated 2081-01-15."
      />
      <Input
        label="Material Search"
        placeholder="Search catalogue…"
        iconLeft={<Package className="h-4 w-4" />}
      />
      <Input
        label="Inspection Date"
        type="date"
        required
        iconLeft={<Calendar className="h-4 w-4" />}
      />
      <Input
        label="Completed Quantity"
        type="number"
        value="300"
        suffix="m²"
        error="Exceeds planned quantity (240 m²). Verify with site supervisor."
      />
    </div>
  ),
}
