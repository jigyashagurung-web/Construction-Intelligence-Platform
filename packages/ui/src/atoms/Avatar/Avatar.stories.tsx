import type { Meta, StoryObj } from '@storybook/react'
import { Avatar } from './Avatar'

const meta = {
  title:     'Atoms/Avatar',
  component:  Avatar,
  tags:      ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    size:   { control: 'select' },
    status: { control: 'select' },
  },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const WithInitials: Story = {
  args: { name: 'Roshan Shrestha', size: 'md' },
}

export const WithImage: Story = {
  args: {
    name: 'Anita Tamang',
    src:  'https://i.pravatar.cc/150?u=anita',
    size: 'md',
  },
}

export const WithStatus: Story = {
  name: 'With Status Dot',
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <Avatar name="Roshan Shrestha" status="online"  size="md" />
      <Avatar name="Anita Tamang"    status="away"    size="md" />
      <Avatar name="Bikash Karki"    status="offline" size="md" />
    </div>
  ),
}

export const Sizes: Story = {
  name: 'All Sizes',
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Avatar key={size} name="Roshan Shrestha" size={size} />
      ))}
    </div>
  ),
}

export const AvatarGroup: Story = {
  name: 'Avatar Group (team)',
  render: () => (
    <div style={{ display: 'flex' }}>
      {[
        'Roshan Shrestha',
        'Anita Tamang',
        'Bikash Karki',
        'Sita Rai',
      ].map((name, i) => (
        <div key={name} style={{ marginLeft: i === 0 ? 0 : -8 }}>
          <Avatar
            name={name}
            size="sm"
            style={{ border: '2px solid var(--surface-card)' }}
            title={name}
          />
        </div>
      ))}
      <div style={{ marginLeft: -8 }}>
        <Avatar
          name="+5"
          size="sm"
          style={{ border: '2px solid var(--surface-card)', background: 'var(--surface-hover)' }}
        />
      </div>
    </div>
  ),
}
