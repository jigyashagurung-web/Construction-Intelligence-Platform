import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Combobox } from './Combobox'

const meta = {
  title:     'Molecules/Combobox',
  component:  Combobox,
  tags:      ['autodocs'],
  parameters: { layout: 'padded' },
  args: { placeholder: 'Select…' },
} satisfies Meta<typeof Combobox>

export default meta
type Story = StoryObj<typeof meta>

// ── Fixtures ──────────────────────────────────────────────────────────────────

const MATERIALS = [
  { value: 'opc43',    label: 'OPC Cement 43 Grade' },
  { value: 'opc53',    label: 'OPC Cement 53 Grade' },
  { value: 'ppc',      label: 'PPC Portland Pozzolana Cement' },
  { value: 'rebar10',  label: 'TMT Rebar 10mm Fe500' },
  { value: 'rebar12',  label: 'TMT Rebar 12mm Fe500' },
  { value: 'rebar16',  label: 'TMT Rebar 16mm Fe500' },
  { value: 'rebar20',  label: 'TMT Rebar 20mm Fe500' },
  { value: 'rebar25',  label: 'TMT Rebar 25mm Fe500' },
  { value: 'sand_c',   label: 'Coarse Sand (Sieved)' },
  { value: 'sand_f',   label: 'Fine Sand (Plastering)' },
  { value: 'agg20',    label: '20mm Crushed Aggregate' },
  { value: 'agg40',    label: '40mm Crushed Aggregate' },
  { value: 'brick',    label: 'Standard Brick (Bhaktapur)' },
  { value: 'tile_600', label: 'Ceramic Tile 600×600mm' },
  { value: 'tile_300', label: 'Ceramic Tile 300×300mm' },
  { value: 'pipe_upvc','label': 'UPVC Conduit 25mm' },
  { value: 'paint_wx', label: 'Weather Shield Exterior Paint' },
  { value: 'waterproof',label:'Waterproofing Compound (Cebex)' },
]

const MAT_GROUPS = [
  {
    label: 'Binding materials',
    options: [
      { value: 'opc43', label: 'OPC Cement 43 Grade' },
      { value: 'opc53', label: 'OPC Cement 53 Grade' },
      { value: 'ppc',   label: 'PPC Portland Pozzolana' },
    ],
  },
  {
    label: 'Steel & reinforcement',
    options: [
      { value: 'rebar10', label: 'TMT Rebar 10mm Fe500' },
      { value: 'rebar12', label: 'TMT Rebar 12mm Fe500' },
      { value: 'rebar16', label: 'TMT Rebar 16mm Fe500' },
      { value: 'rebar20', label: 'TMT Rebar 20mm Fe500' },
    ],
  },
  {
    label: 'Aggregate',
    options: [
      { value: 'sand_c', label: 'Coarse Sand (Sieved)' },
      { value: 'agg20',  label: '20mm Crushed Aggregate' },
      { value: 'agg40',  label: '40mm Crushed Aggregate' },
    ],
  },
  {
    label: 'Masonry',
    options: [
      { value: 'brick', label: 'Standard Brick (Bhaktapur)' },
    ],
  },
  {
    label: 'Finishing',
    options: [
      { value: 'tile_600', label: 'Ceramic Tile 600×600mm' },
      { value: 'paint_wx', label: 'Weather Shield Paint' },
      { value: 'waterproof', label: 'Waterproofing Compound' },
    ],
  },
]

const CONTRACTORS = Array.from({ length: 40 }, (_, i) => ({
  value: `c${i + 1}`,
  label: [
    'Pashupati Construction', 'Bagmati Builders', 'Himalaya Engineering',
    'Everest Civil Works', 'Annapurna Contractors', 'Sagarmatha Build',
    'Lumbini Projects', 'Janaki Constructions', 'Siddhartha Works',
    'Butwal Engineering',
  ][i % 10] + (i >= 10 ? ` (Branch ${Math.floor(i / 10) + 1})` : ''),
}))

// ── Stories ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    label:   'Material',
    options: MATERIALS,
    hint:    'Search by name or code',
  },
}

export const Grouped: Story = {
  name: 'Grouped options',
  args: {
    label:  'Material',
    groups: MAT_GROUPS,
    hint:   'Materials grouped by trade category',
  },
}

export const LargeList: Story = {
  name: 'Large list (40 contractors)',
  args: {
    label:             'Subcontractor',
    options:            CONTRACTORS,
    placeholder:       'Search contractor…',
    searchPlaceholder: 'Type contractor name…',
    hint:              'Search by name or code',
  },
}

export const ErrorState: Story = {
  name: 'Error state',
  args: {
    label:   'Material',
    options: MATERIALS,
    error:   'Material selection is required',
  },
}

export const MaterialRequisition: Story = {
  name: 'Material requisition (interactive)',
  render: () => {
    const [material, setMaterial] = useState('')
    const [unit, setUnit]         = useState('')

    return (
      <div style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Combobox
          label="Material"
          groups={MAT_GROUPS}
          value={material}
          onValueChange={setMaterial}
          placeholder="Search material…"
          hint="Type to filter — 18 materials available"
          required
        />
        {material && (
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Selected: <strong style={{ color: 'var(--action-primary-bg)' }}>{material}</strong>
          </p>
        )}
      </div>
    )
  },
}
