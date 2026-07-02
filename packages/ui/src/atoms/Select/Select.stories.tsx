import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Select } from './Select'

const meta = {
  title:     'Atoms/Select',
  component:  Select,
  tags:      ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Dropdown select built on **Radix UI Select**. Mirrors the \`Input\` API: label, hint, error, size.

For large searchable lists (100+ items) use \`Combobox\` instead.
        `.trim(),
      },
    },
  },
  args: {
    placeholder: 'Select an option…',
    label:       'Label',
  },
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

// ── Fixtures ──────────────────────────────────────────────────────────────────

const UNITS = [
  { value: 'm',   label: 'm  — Metre'       },
  { value: 'sqm', label: 'sqm — Square metre' },
  { value: 'cum', label: 'cum — Cubic metre'  },
  { value: 'rft', label: 'rft — Running foot' },
  { value: 'kg',  label: 'kg  — Kilogram'     },
  { value: 'MT',  label: 'MT  — Metric tonne' },
  { value: 'nos', label: 'nos — Numbers'      },
  { value: 'lot', label: 'lot — Lump sum'     },
  { value: 'bag', label: 'bag — Bag (50kg)'   },
]

const MAT_GROUPS = [
  {
    label: 'Structural',
    options: [
      { value: 'cement',  label: 'OPC Cement 43 Grade' },
      { value: 'rebar12', label: 'TMT Rebar 12mm Fe500'  },
      { value: 'rebar16', label: 'TMT Rebar 16mm Fe500'  },
      { value: 'steel',   label: 'Structural Steel'      },
    ],
  },
  {
    label: 'Aggregate',
    options: [
      { value: 'sand',   label: 'Coarse Sand (Sieved)' },
      { value: 'gravel', label: '20mm Crushed Aggregate' },
    ],
  },
  {
    label: 'Finishing',
    options: [
      { value: 'tile',  label: 'Ceramic Tile 600×600' },
      { value: 'paint', label: 'Weather Shield Paint'  },
    ],
  },
]

// ── Stories ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    label:   'BOQ Unit',
    hint:    'Unit of measurement for this line item',
    options: UNITS,
  },
}

export const WithValue: Story = {
  name: 'With selected value',
  args: {
    label:        'BOQ Unit',
    options:      UNITS,
    defaultValue: 'cum',
  },
}

export const Grouped: Story = {
  name: 'Grouped options',
  args: {
    label:  'Material',
    hint:   'Select the material for this requisition',
    groups: MAT_GROUPS,
  },
}

export const ErrorState: Story = {
  name: 'Error state',
  args: {
    label:   'BOQ Unit',
    options:  UNITS,
    error:   'Unit is required before saving the item',
  },
}

export const Disabled: Story = {
  args: {
    label:    'BOQ Unit',
    options:  UNITS,
    disabled: true,
  },
}

export const Sizes: Story = {
  name: 'Sizes: sm / md / lg',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '320px' }}>
      <Select label="Small"  size="sm" options={UNITS} placeholder="Small select…"  />
      <Select label="Medium" size="md" options={UNITS} placeholder="Medium select…" />
      <Select label="Large"  size="lg" options={UNITS} placeholder="Large select…"  />
    </div>
  ),
}

export const ConstructionUnits: Story = {
  name: 'Construction — unit picker (interactive)',
  render: () => {
    const [unit, setUnit] = useState('')
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '320px' }}>
        <Select
          label="Measurement unit"
          hint="Choose the unit that applies to this BOQ line item"
          options={UNITS}
          value={unit}
          onValueChange={setUnit}
          required
        />
        {unit && (
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Selected: <strong style={{ color: 'var(--text-primary)' }}>{unit}</strong>
          </p>
        )}
      </div>
    )
  },
}
