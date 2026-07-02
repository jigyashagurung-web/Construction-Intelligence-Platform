import type { Meta, StoryObj } from '@storybook/react'
import { Header, type Project } from './Header'

const PROJECTS: Project[] = [
  { id: 'p1', name: 'Baneshwor Commercial Complex', code: 'BCC-2081' },
  { id: 'p2', name: 'Thankot Highway Upgrade',      code: 'THU-2081' },
  { id: 'p3', name: 'Pokhara Airport Annex',         code: 'PAA-2080' },
]

const USER = {
  name: 'Roshan Shrestha',
  role: 'Project Manager',
}

const meta = {
  title:     'Organisms/Header',
  component:  Header,
  tags:      ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
Top application bar. Contains the project switcher, global search trigger,
offline indicator, notification bell, and user menu.

**Height:** 56 px (fixed). Background uses \`--surface-header\` (deepest navy)
to visually anchor the page and separate it from the sidebar.
      `.trim(),
      },
    },
  },
  args: {
    projects:      PROJECTS,
    activeProject: PROJECTS[0],
    user:          USER,
  },
  argTypes: {
    notificationCount: { control: { type: 'range', min: 0, max: 99, step: 1 } },
    offline:           { control: 'boolean' },
  },
} satisfies Meta<typeof Header>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { notificationCount: 0 },
}

export const WithNotifications: Story = {
  args: { notificationCount: 7 },
}

export const Offline: Story = {
  args: { notificationCount: 2, offline: true },
}

export const ManyNotifications: Story = {
  name: 'Notification Badge > 9',
  args: { notificationCount: 24 },
}

export const NoActiveProject: Story = {
  name: 'No Active Project',
  args: { activeProject: undefined, notificationCount: 0 },
}
