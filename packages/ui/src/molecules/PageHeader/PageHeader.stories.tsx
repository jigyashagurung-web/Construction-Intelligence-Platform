import type { Meta, StoryObj } from '@storybook/react'
import { Plus, Download, Settings2, MoreHorizontal } from 'lucide-react'
import { PageHeader } from './PageHeader'
import { Button } from '../../atoms/Button'
import { Badge }  from '../../atoms/Badge'

const meta = {
  title:     'Molecules/PageHeader',
  component:  PageHeader,
  tags:      ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof PageHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Simple: Story = {
  args: {
    title:       'Bill of Quantities',
    description: 'Baneshwor Commercial Complex — Contract value: ₨ 9,16,12,600',
  },
}

export const WithActions: Story = {
  name: 'With actions',
  args: {
    title:       'Bill of Quantities',
    description: 'Baneshwor Commercial Complex',
    actions: (
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button variant="secondary" size="sm" iconLeft={<Download className="h-4 w-4" />}>Export</Button>
        <Button size="sm" iconLeft={<Plus className="h-4 w-4" />}>Add item</Button>
      </div>
    ) as any,
  },
}

export const WithBreadcrumb: Story = {
  name: 'With breadcrumb',
  args: {
    title:       'BOQ',
    description: '142 line items · Last updated 2 hours ago',
    breadcrumb:  [
      { label: 'Projects', onClick: () => {} },
      { label: 'Baneshwor Commercial Complex', onClick: () => {} },
      { label: 'BOQ' },
    ],
    actions: (
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button variant="ghost" size="sm" iconLeft={<Settings2 className="h-4 w-4" />} />
        <Button size="sm" iconLeft={<Plus className="h-4 w-4" />}>Add item</Button>
      </div>
    ) as any,
  },
}

export const WithBadge: Story = {
  name: 'With status badge',
  args: {
    title:       'Thankot Highway Upgrade',
    description: 'THU-2081 · Thankot, Kathmandu Valley',
    breadcrumb:  [
      { label: 'Projects', onClick: () => {} },
      { label: 'Thankot Highway Upgrade' },
    ],
    badge: <Badge variant="warning" dot>At risk</Badge> as any,
    actions: (
      <Button variant="secondary" size="sm" iconLeft={<MoreHorizontal className="h-4 w-4" />}>
        Options
      </Button>
    ) as any,
  },
}

export const WithBackButton: Story = {
  name: 'With back button',
  args: {
    title:       'Purchase Order PO-0048',
    description: 'TMT Rebar 16mm · 500 kg · ₨ 49,000',
    backLabel:   'Back to Inventory',
    onBack:      () => alert('Navigate back'),
    actions: (
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button variant="destructive" size="sm">Reject</Button>
        <Button size="sm">Approve</Button>
      </div>
    ) as any,
  },
}

export const Compact: Story = {
  name: 'Compact (sub-page)',
  args: {
    title:       'Activity progress',
    compact:     true,
    breadcrumb:  [{ label: 'BOQ', onClick: () => {} }, { label: 'Activity progress' }],
  },
}

export const AllCIPPages: Story = {
  name: 'CIP page headers gallery',
  args: {} as any,
  render: () => {
    const pages = [
      { title: 'Dashboard',      description: 'Baneshwor Commercial Complex — overview',                   badge: <Badge variant="primary" dot size="sm">On track</Badge>    },
      { title: 'Bill of Quantities', description: '142 items · ₨ 9.16 Cr contract value',                  badge: null                                                        },
      { title: 'Daily Progress', description: 'Submit and review site progress reports',                    badge: <Badge variant="warning" dot size="sm">Report due</Badge>  },
      { title: 'Materials',      description: 'Inventory & requisitions — 10 items low stock',              badge: <Badge variant="danger" dot size="sm">3 critical</Badge>   },
      { title: 'Forecast',       description: 'AI-powered completion forecast — updated 2h ago',             badge: null                                                        },
      { title: 'Safety',         description: 'Incident log and safety score',                              badge: <Badge variant="success" dot size="sm">Score: 82/100</Badge>},
    ]
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {pages.map((p, i) => (
          <div key={i} style={{ borderBottom: i < pages.length - 1 ? '1px solid var(--border-subtle)' : 'none', paddingBottom: i < pages.length - 1 ? '20px' : 0, marginBottom: i < pages.length - 1 ? '20px' : 0 }}>
            <PageHeader
              title={p.title}
              description={p.description}
              badge={p.badge ?? undefined}
              breadcrumb={[{ label: 'Projects', onClick: () => {} }, { label: 'BCC-2081', onClick: () => {} }, { label: p.title }]}
              actions={<Button size="sm" variant="secondary" iconLeft={<Settings2 className="h-4 w-4" />}>Options</Button>}
              compact
            />
          </div>
        ))}
      </div>
    )
  },
}
