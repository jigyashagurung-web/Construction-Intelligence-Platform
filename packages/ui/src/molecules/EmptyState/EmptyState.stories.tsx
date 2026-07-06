import type { Meta, StoryObj } from '@storybook/react'
import { FileSpreadsheet, Package, ClipboardList, Plus, RefreshCw } from 'lucide-react'
import { EmptyState } from './EmptyState'

const meta = {
  title:     'Molecules/EmptyState',
  component:  EmptyState,
  tags:      ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title:       'No items yet',
    description: 'Get started by adding your first item.',
    variant:     'default',
  },
}

export const SearchEmpty: Story = {
  name: 'Search — no results',
  args: {
    variant:     'search',
    title:       'No results found',
    description: 'Try a different keyword or clear the filter.',
    action: {
      label:   'Clear search',
      onClick: () => {},
      variant: 'secondary',
    },
  },
}

export const ErrorState: Story = {
  name: 'Error loading',
  args: {
    variant:     'error',
    title:       'Could not load data',
    description: 'A network error occurred. Check your connection and try again.',
    action:  { label: 'Retry', onClick: () => {}, icon: <RefreshCw className="h-4 w-4" /> },
  },
}

export const Sizes: Story = {
  name: 'Sizes: sm / md / lg',
  args: {} as any,
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', border: '1px solid var(--border-default)', borderRadius: '12px', overflow: 'hidden' }}>
      {(['sm', 'md', 'lg'] as const).map((size, i, arr) => (
        <div key={size} style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
          <p style={{ textAlign: 'center', paddingTop: '12px', fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>size: {size}</p>
          <EmptyState size={size} title="No items" description="Add one to get started." />
        </div>
      ))}
    </div>
  ),
}

export const CIPScenarios: Story = {
  name: 'CIP scenarios',
  args: {} as any,
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
      <div style={{ border: '1px solid var(--border-default)', borderRadius: '12px', overflow: 'hidden', background: 'var(--surface-card)' }}>
        <EmptyState
          icon={<FileSpreadsheet className="h-10 w-10 text-[--text-tertiary]" aria-hidden />}
          title="No BOQ items"
          description="Import from Excel or add line items manually to build your bill of quantities."
          action={{ label: 'Add item', onClick: () => {}, icon: <Plus className="h-4 w-4" /> }}
          secondaryAction={{ label: 'Import from Excel', onClick: () => {} }}
        />
      </div>
      <div style={{ border: '1px solid var(--border-default)', borderRadius: '12px', overflow: 'hidden', background: 'var(--surface-card)' }}>
        <EmptyState
          icon={<Package className="h-10 w-10 text-[--text-tertiary]" aria-hidden />}
          title="No materials on site"
          description="Record incoming materials to track inventory and trigger low-stock alerts."
          action={{ label: 'Record delivery', onClick: () => {}, icon: <Plus className="h-4 w-4" /> }}
        />
      </div>
      <div style={{ border: '1px solid var(--border-default)', borderRadius: '12px', overflow: 'hidden', background: 'var(--surface-card)' }}>
        <EmptyState
          icon={<ClipboardList className="h-10 w-10 text-[--text-tertiary]" aria-hidden />}
          title="No reports this week"
          description="Daily progress reports submitted by your team will appear here."
          variant="default"
          size="md"
        />
      </div>
    </div>
  ),
}
