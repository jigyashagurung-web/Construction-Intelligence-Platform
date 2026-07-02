import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Checkbox } from './Checkbox'

const meta = {
  title:     'Atoms/Checkbox',
  component:  Checkbox,
  tags:      ['autodocs'],
  parameters: { layout: 'padded' },
  args: { label: 'Label' },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { label: 'I have reviewed this BOQ item' },
}

export const Checked: Story = {
  args: { label: 'Marked as reviewed', checked: true },
}

export const Indeterminate: Story = {
  args: { label: 'Some items selected', checked: 'indeterminate' },
}

export const WithHint: Story = {
  args: {
    label: 'Notify me of material alerts',
    hint:  'You will receive an SMS when any material falls below reorder point',
  },
}

export const Error: Story = {
  args: {
    label: 'I confirm quantities are accurate',
    error: 'You must confirm before submitting the daily report',
  },
}

export const Disabled: Story = {
  args: { label: 'Disabled option', disabled: true },
}

export const Sizes: Story = {
  name: 'Sizes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Checkbox size="sm" label="Small checkbox" defaultChecked />
      <Checkbox size="md" label="Medium checkbox (default)" defaultChecked />
    </div>
  ),
}

export const PermissionsPanel: Story = {
  name: 'Permissions panel (interactive)',
  render: () => {
    const [perms, setPerms] = useState({
      viewBOQ:        true,
      editBOQ:        false,
      approvePO:      false,
      viewForecasts:  true,
      exportReports:  true,
    })

    const toggle = (key: keyof typeof perms) =>
      setPerms((p) => ({ ...p, [key]: !p[key] }))

    return (
      <div style={{
        maxWidth: '360px',
        border: '1px solid var(--border-default)',
        borderRadius: '12px',
        padding: '20px',
        background: 'var(--surface-card)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div>
          <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Role: Site Engineer
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Configure module permissions
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Checkbox label="View BOQ"         checked={perms.viewBOQ}       onCheckedChange={() => toggle('viewBOQ')}       hint="Read-only access to bill of quantities" />
          <Checkbox label="Edit BOQ"         checked={perms.editBOQ}       onCheckedChange={() => toggle('editBOQ')}       hint="Can add, edit, and delete BOQ line items" />
          <Checkbox label="Approve POs"      checked={perms.approvePO}     onCheckedChange={() => toggle('approvePO')}     hint="Can approve purchase orders up to NPR 5,00,000" />
          <Checkbox label="View forecasts"   checked={perms.viewForecasts}  onCheckedChange={() => toggle('viewForecasts')} />
          <Checkbox label="Export reports"   checked={perms.exportReports}  onCheckedChange={() => toggle('exportReports')} />
        </div>
      </div>
    )
  },
}
