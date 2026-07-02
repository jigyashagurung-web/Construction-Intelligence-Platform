import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '../../utils/cn'

// ── Re-exports (for composing custom layouts) ─────────────────────────────────

export const TabsRoot    = TabsPrimitive.Root
export const TabsList    = TabsPrimitive.List
export const TabsTrigger = TabsPrimitive.Trigger
export const TabsContent = TabsPrimitive.Content

// ── Compound Tabs ─────────────────────────────────────────────────────────────

export interface TabItem {
  value:     string
  label:     string
  /** Number badge shown on the tab (e.g. alert count) */
  count?:    number
  disabled?: boolean
  content:   React.ReactNode
}

export interface TabsProps {
  items:           TabItem[]
  defaultValue?:   string
  value?:          string
  onValueChange?:  (value: string) => void
  /** `underline` — bottom border indicator. `pills` — filled background indicator */
  variant?:        'underline' | 'pills'
  size?:           'sm' | 'md'
  className?:      string
  /** Extra content rendered to the right of the tab list (e.g. action buttons) */
  headerSlot?:     React.ReactNode
}

// ── Styles ────────────────────────────────────────────────────────────────────

const LIST_VARIANT = {
  underline: 'border-b border-[--border-default] gap-0',
  pills:     'bg-[--surface-input] rounded-lg p-1 gap-1',
}

const TRIGGER_BASE = [
  'relative inline-flex items-center gap-1.5 font-medium outline-none transition-colors',
  'focus-visible:ring-2 focus-visible:ring-[--focus-ring] focus-visible:ring-offset-1 rounded-sm',
  'disabled:opacity-40 disabled:pointer-events-none',
]

const TRIGGER_VARIANT = {
  underline: [
    'px-4 pb-3 pt-2.5 text-[--text-secondary]',
    'hover:text-[--text-primary]',
    'data-[state=active]:text-[--action-primary-bg]',
    // active indicator bar
    'after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-0.5 after:rounded-full',
    'after:bg-transparent data-[state=active]:after:bg-[--action-primary-bg]',
    'after:transition-colors',
  ],
  pills: [
    'px-3 text-[--text-secondary] rounded-md',
    'hover:text-[--text-primary] hover:bg-[--surface-hover]',
    'data-[state=active]:bg-[--surface-card] data-[state=active]:text-[--text-primary]',
    'data-[state=active]:shadow-sm',
  ],
}

const TRIGGER_SIZE = {
  sm: 'text-xs py-1.5',
  md: 'text-sm py-2',
}

// ── Component ─────────────────────────────────────────────────────────────────

function Tabs({
  items,
  defaultValue,
  value,
  onValueChange,
  variant  = 'underline',
  size     = 'md',
  className,
  headerSlot,
}: TabsProps) {
  const resolved = defaultValue ?? value ?? items[0]?.value

  return (
    <TabsPrimitive.Root
      defaultValue={defaultValue ?? resolved}
      value={value}
      onValueChange={onValueChange}
      className={cn('flex flex-col', className)}
    >
      {/* Tab list + optional header slot */}
      <div className={cn('flex items-center justify-between', variant === 'underline' && 'mb-0')}>
        <TabsPrimitive.List
          className={cn(
            'flex',
            LIST_VARIANT[variant],
            // Horizontal scroll on small screens
            'overflow-x-auto scrollbar-none',
          )}
        >
          {items.map((item) => (
            <TabsPrimitive.Trigger
              key={item.value}
              value={item.value}
              disabled={item.disabled}
              className={cn(
                ...TRIGGER_BASE,
                ...TRIGGER_VARIANT[variant],
                TRIGGER_SIZE[size],
              )}
            >
              {item.label}
              {item.count !== undefined && (
                <span
                  className={cn(
                    'inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1',
                    'text-[10px] font-semibold leading-none tabular-nums',
                    'bg-[--surface-hover] text-[--text-secondary]',
                    'transition-colors',
                    // Active state: primary tinted badge
                  )}
                  aria-label={`${item.count} items`}
                >
                  {item.count > 99 ? '99+' : item.count}
                </span>
              )}
            </TabsPrimitive.Trigger>
          ))}
        </TabsPrimitive.List>

        {headerSlot && (
          <div className="shrink-0 pl-4">{headerSlot}</div>
        )}
      </div>

      {/* Tab panels */}
      {items.map((item) => (
        <TabsPrimitive.Content
          key={item.value}
          value={item.value}
          className={cn(
            'flex-1 outline-none',
            'data-[state=active]:animate-in data-[state=active]:fade-in-0',
            variant === 'underline' && 'pt-4',
            variant === 'pills'     && 'pt-3',
          )}
        >
          {item.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  )
}

Tabs.displayName = 'Tabs'
export { Tabs }
