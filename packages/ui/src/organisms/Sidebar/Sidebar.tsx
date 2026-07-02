import * as React from 'react'
import type { LucideIcon } from 'lucide-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Tooltip, TooltipProvider } from '../../atoms/Tooltip'
import { cn } from '../../utils/cn'

// ── Data types ────────────────────────────────────────────────────────────────

export interface NavItem {
  id:      string
  label:   string
  icon:    LucideIcon
  href:    string
  /** Numeric badge (alert count). Max displayed: 99. */
  badge?:  number
}

export interface NavSection {
  id:     string
  /** Optional heading rendered above the group */
  label?: string
  items:  NavItem[]
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface NavItemButtonProps {
  item:       NavItem
  active:     boolean
  collapsed:  boolean
  onNavigate: (item: NavItem) => void
}

function NavItemButton({ item, active, collapsed, onNavigate }: NavItemButtonProps) {
  const Icon = item.icon
  const badgeCount = item.badge ? Math.min(item.badge, 99) : null

  const button = (
    <button
      onClick={() => onNavigate(item)}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group relative flex w-full items-center gap-3 rounded-md',
        'transition-colors duration-[--duration-fast]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--primitive-blue-400]',
        collapsed
          ? 'h-10 w-10 justify-center p-0 mx-auto'
          : 'h-11 px-3',
        active
          ? [
              'bg-[rgba(255,255,255,0.12)]',
              'text-white',
              'before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2',
              'before:h-5 before:w-0.5 before:rounded-full before:bg-[--primitive-blue-400]',
            ]
          : 'text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.07)] hover:text-white'
      )}
    >
      <Icon
        className={cn(
          'shrink-0 transition-colors',
          collapsed ? 'h-5 w-5' : 'h-4 w-4',
          active ? 'text-white' : 'text-[rgba(255,255,255,0.5)] group-hover:text-white'
        )}
        aria-hidden="true"
      />

      {!collapsed && (
        <>
          <span className="flex-1 truncate text-left text-sm font-medium">
            {item.label}
          </span>
          {badgeCount !== null && (
            <span
              className={cn(
                'flex h-5 min-w-5 items-center justify-center rounded-full px-1',
                'text-[10px] font-bold',
                active
                  ? 'bg-[--primitive-blue-400] text-white'
                  : 'bg-[rgba(255,255,255,0.15)] text-[rgba(255,255,255,0.8)]'
              )}
              aria-label={`${badgeCount} alerts`}
            >
              {badgeCount}
            </span>
          )}
        </>
      )}

      {/* Badge dot in collapsed mode */}
      {collapsed && badgeCount !== null && (
        <span
          className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[--primitive-red-500]"
          aria-label={`${badgeCount} alerts`}
        />
      )}
    </button>
  )

  // In collapsed mode, wrap each button in a tooltip
  if (collapsed) {
    return (
      <Tooltip content={item.label} side="right" delayDuration={200}>
        {button}
      </Tooltip>
    )
  }

  return button
}

// ── Main component ────────────────────────────────────────────────────────────

export interface SidebarProps {
  navigation:         NavSection[]
  activeId:           string
  collapsed?:         boolean
  onCollapsedChange?: (collapsed: boolean) => void
  /** Called when a nav item is clicked */
  onNavigate?:        (item: NavItem) => void
  /** Slot rendered at the bottom of the sidebar (user info, etc.) */
  footer?:            React.ReactNode
  className?:         string
}

function Sidebar({
  navigation,
  activeId,
  collapsed = false,
  onCollapsedChange,
  onNavigate,
  footer,
  className,
}: SidebarProps) {
  function handleNavigate(item: NavItem) {
    onNavigate?.(item)
  }

  return (
    <TooltipProvider>
      <aside
        data-collapsed={collapsed}
        className={cn(
          'group/sidebar relative flex flex-col',
          'bg-[--surface-sidebar] border-r border-[rgba(255,255,255,0.08)]',
          'transition-[width] duration-[--duration-moderate] ease-in-out',
          collapsed ? 'w-16' : 'w-[var(--sidebar-width,240px)]',
          'h-full shrink-0 overflow-hidden',
          className
        )}
      >
        {/* ── Brand mark ── */}
        <div
          className={cn(
            'flex items-center border-b border-[rgba(255,255,255,0.08)]',
            'h-14 shrink-0 overflow-hidden',
            collapsed ? 'justify-center px-0' : 'px-4 gap-3'
          )}
        >
          {/* Logo mark — 32×32 square */}
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[--primitive-blue-600] font-bold text-white text-sm"
            aria-hidden="true"
          >
            CI
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="truncate text-sm font-semibold text-white leading-tight">
                CIP
              </span>
              <span className="truncate text-[10px] text-[rgba(255,255,255,0.45)] leading-tight">
                Construction Intelligence
              </span>
            </div>
          )}
        </div>

        {/* ── Nav sections ── */}
        <nav
          className="flex-1 overflow-y-auto overflow-x-hidden py-3 scrollbar-none"
          aria-label="Main navigation"
        >
          {navigation.map((section, si) => (
            <div key={section.id} className={cn('px-2', si > 0 && 'mt-4')}>
              {/* Section heading — hidden when collapsed */}
              {section.label && !collapsed && (
                <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-[rgba(255,255,255,0.35)]">
                  {section.label}
                </p>
              )}
              {/* Divider when collapsed and not first section */}
              {collapsed && si > 0 && (
                <div className="mb-2 mx-auto h-px w-8 bg-[rgba(255,255,255,0.1)]" />
              )}
              <ul className="flex flex-col gap-0.5" role="list">
                {section.items.map((item) => (
                  <li key={item.id}>
                    <NavItemButton
                      item={item}
                      active={item.id === activeId}
                      collapsed={collapsed}
                      onNavigate={handleNavigate}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* ── Footer slot ── */}
        {footer && (
          <div className="shrink-0 border-t border-[rgba(255,255,255,0.08)] p-2">
            {footer}
          </div>
        )}

        {/* ── Collapse toggle ── */}
        {onCollapsedChange && (
          <Tooltip
            content={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            side="right"
            delayDuration={600}
          >
            <button
              onClick={() => onCollapsedChange(!collapsed)}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className={cn(
                'absolute -right-3 top-[72px]',
                'flex h-6 w-6 items-center justify-center',
                'rounded-full border border-[--border-default]',
                'bg-[--surface-card] text-[--text-secondary]',
                'shadow-sm transition-colors hover:bg-[--surface-hover] hover:text-[--text-primary]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--border-focus]',
                'z-10'
              )}
            >
              {collapsed
                ? <ChevronRight className="h-3 w-3" />
                : <ChevronLeft  className="h-3 w-3" />
              }
            </button>
          </Tooltip>
        )}
      </aside>
    </TooltipProvider>
  )
}

export { Sidebar }
