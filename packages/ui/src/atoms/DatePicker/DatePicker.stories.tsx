import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { DatePicker } from './DatePicker'

const meta = {
  title:      'Atoms/DatePicker',
  component:   DatePicker,
  tags:       ['autodocs'],
  parameters: { layout: 'centered' },
  args: { mode: 'bs' },
} satisfies Meta<typeof DatePicker>

export default meta
type Story = StoryObj<typeof meta>

// ── Stories ───────────────────────────────────────────────────────────────────

export const BSMode: Story = {
  name: 'BS calendar (default)',
  render: () => {
    const [v, setV] = useState('2081-03-15')
    return (
      <div style={{ width: 280 }}>
        <DatePicker
          mode="bs"
          label="Site report date"
          hint="Bikram Sambat calendar"
          value={v}
          onChange={setV}
        />
        <p style={{ marginTop: 8, fontSize: 12, color: 'var(--text-tertiary)' }}>Value: {v || '—'}</p>
      </div>
    )
  },
}

export const ADMode: Story = {
  name: 'AD calendar (Gregorian)',
  render: () => {
    const [v, setV] = useState('2024-06-28')
    return (
      <div style={{ width: 280 }}>
        <DatePicker
          mode="ad"
          label="Contract date"
          hint="Gregorian / Anno Domini calendar"
          value={v}
          onChange={setV}
        />
        <p style={{ marginTop: 8, fontSize: 12, color: 'var(--text-tertiary)' }}>Value: {v || '—'}</p>
      </div>
    )
  },
}

export const Empty: Story = {
  name: 'Empty — no selection',
  args: {
    mode:        'bs',
    label:       'Inspection date',
    placeholder: 'Pick a date',
    value:       '',
    required:    true,
  },
}

export const WithError: Story = {
  name: 'Validation error state',
  args: {
    mode:  'bs',
    label: 'Start date',
    value: '',
    error: 'Start date is required',
  },
}

export const Disabled: Story = {
  name: 'Disabled',
  args: {
    mode:     'bs',
    label:    'Completion date',
    value:    '2082-09-01',
    disabled: true,
    hint:     'Cannot be edited after contract is signed',
  },
}

export const Sizes: Story = {
  name: 'Sizes — sm / md / lg',
  render: () => {
    const [sm, setSm] = useState('')
    const [md, setMd] = useState('')
    const [lg, setLg] = useState('')
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:16, width:300 }}>
        <DatePicker mode="bs" size="sm" label="Small" value={sm} onChange={setSm} />
        <DatePicker mode="bs" size="md" label="Medium (default)" value={md} onChange={setMd} />
        <DatePicker mode="bs" size="lg" label="Large" value={lg} onChange={setLg} />
      </div>
    )
  },
}

export const SideBySide: Story = {
  name: 'BS + AD for the same field',
  render: () => {
    const [bs, setBs] = useState('2081-01-01')
    const [ad, setAd] = useState('2024-04-13')
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:16, width:300 }}>
        <DatePicker mode="bs" label="Bikram Sambat" value={bs} onChange={setBs} />
        <DatePicker mode="ad" label="Gregorian (AD)" value={ad} onChange={setAd} />
        <p style={{ fontSize:11, color:'var(--text-tertiary)' }}>
          The footer in each picker shows the equivalent date in the other calendar.
        </p>
      </div>
    )
  },
}
