import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Switch } from './Switch'

const meta = {
  title:     'Atoms/Switch',
  component:  Switch,
  tags:      ['autodocs'],
  parameters: { layout: 'padded' },
  args: { label: 'Label' },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { label: 'Enable notifications' },
}

export const Checked: Story = {
  args: { label: 'Offline sync enabled', defaultChecked: true },
}

export const WithHint: Story = {
  args: {
    label: 'Auto-submit daily report',
    hint:  'Report will submit at 18:00 if you have not done so manually',
  },
}

export const LabelLeft: Story = {
  name: 'Label on left',
  args: {
    label:         'Dark mode',
    labelPosition: 'left',
    defaultChecked: true,
  },
}

export const Disabled: Story = {
  args: {
    label:   'Feature locked',
    hint:    'Available on Pro plan',
    disabled: true,
  },
}

export const Sizes: Story = {
  name: 'Sizes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Switch size="sm" label="Small switch" />
      <Switch size="md" label="Medium switch (default)" defaultChecked />
    </div>
  ),
}

export const SettingsPanel: Story = {
  name: 'Settings panel (interactive)',
  render: () => {
    const [settings, setSettings] = useState({
      offlineMode:      true,
      pushNotify:       true,
      autoSubmit:       false,
      lowBandwidth:     false,
      twoFA:            true,
    })

    const toggle = (key: keyof typeof settings) =>
      setSettings((s) => ({ ...s, [key]: !s[key] }))

    return (
      <div style={{
        maxWidth: '420px',
        border: '1px solid var(--border-default)',
        borderRadius: '12px',
        overflow: 'hidden',
        background: 'var(--surface-card)',
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>App settings</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {[
            { key: 'offlineMode',  label: 'Offline mode',           hint: 'Cache data for use without internet' },
            { key: 'pushNotify',   label: 'Push notifications',      hint: 'Alerts for approvals, stock, forecasts' },
            { key: 'autoSubmit',   label: 'Auto-submit daily report', hint: 'Submits at 18:00 if not done manually' },
            { key: 'lowBandwidth', label: 'Low bandwidth mode',      hint: 'Disables animations and large assets' },
            { key: 'twoFA',        label: 'Two-factor auth',         hint: 'Required for PO approvals above ₨ 5L' },
          ].map(({ key, label, hint }, i, arr) => (
            <div key={key} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 20px',
              borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none',
            }}>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '1px' }}>{hint}</p>
              </div>
              <Switch
                checked={settings[key as keyof typeof settings]}
                onCheckedChange={() => toggle(key as keyof typeof settings)}
                size="sm"
              />
            </div>
          ))}
        </div>
      </div>
    )
  },
}
