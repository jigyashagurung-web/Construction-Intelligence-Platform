import * as React from 'react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { Bell, Search, ChevronDown, LogOut, User, Settings, Menu, CloudOff } from 'lucide-react'
import { Avatar }  from '../../atoms/Avatar'
import { cn }      from '../../utils/cn'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Project {
  id:   string
  name: string
  code: string
}

export interface CurrentUser {
  name:       string
  role:       string
  avatarUrl?: string
}

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  projects:       Project[]
  activeProject?: Project
  user:           CurrentUser
  /** Unread notification count */
  notificationCount?: number
  /** Show offline sync indicator */
  offline?: boolean
  onProjectChange?:   (project: Project) => void
  onSearchClick?:     () => void
  onNotificationClick?: () => void
  onProfileClick?:    () => void
  onLogout?:          () => void
  onMenuToggle?:      () => void
}

// ── Dropdown shared styles ─────────────────────────────────────────────────────
const DROPDOWN_CONTENT = cn(
  'z-50 min-w-48 rounded-[--radius-md] border border-[--border-default]',
  'bg-[--surface-card] shadow-[--shadow-raised]',
  'p-1 text-sm',
  'data-[state=open]:animate-slide-up',
)

const DROPDOWN_ITEM = cn(
  'relative flex cursor-pointer select-none items-center gap-2',
  'rounded-sm px-3 py-2 text-[--text-primary] outline-none',
  'transition-colors hover:bg-[--surface-hover]',
  'data-[highlighted]:bg-[--surface-hover]',
  'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
)

// ── Component ─────────────────────────────────────────────────────────────────
const Header = React.forwardRef<HTMLElement, HeaderProps>(
  (
    {
      projects,
      activeProject,
      user,
      notificationCount = 0,
      offline = false,
      onProjectChange,
      onSearchClick,
      onNotificationClick,
      onProfileClick,
      onLogout,
      onMenuToggle,
      className,
      ...props
    },
    ref
  ) => {
    const clampedCount = Math.min(notificationCount, 99)

    return (
      <header
        ref={ref}
        className={cn(
          'flex h-14 shrink-0 items-center gap-3 px-4',
          'bg-[--surface-header] border-b border-[rgba(255,255,255,0.08)]',
          className
        )}
        {...props}
      >
        {/* ── Mobile menu button ── */}
        <button
          onClick={onMenuToggle}
          aria-label="Toggle navigation menu"
          className="flex h-8 w-8 items-center justify-center rounded-md text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.08)] hover:text-white transition-colors lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--primitive-blue-400]"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* ── Project selector ── */}
        <DropdownMenuPrimitive.Root>
          <DropdownMenuPrimitive.Trigger asChild>
            <button
              aria-label="Switch project"
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-1.5',
                'text-white hover:bg-[rgba(255,255,255,0.08)]',
                'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--primitive-blue-400]',
                'max-w-[200px]',
              )}
            >
              <span className="truncate text-sm font-semibold">
                {activeProject?.name ?? 'Select Project'}
              </span>
              {activeProject && (
                <span className="shrink-0 rounded bg-[rgba(255,255,255,0.15)] px-1.5 py-0.5 text-[10px] font-bold text-[rgba(255,255,255,0.8)]">
                  {activeProject.code}
                </span>
              )}
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[rgba(255,255,255,0.5)]" />
            </button>
          </DropdownMenuPrimitive.Trigger>

          <DropdownMenuPrimitive.Portal>
            <DropdownMenuPrimitive.Content
              align="start"
              sideOffset={8}
              className={DROPDOWN_CONTENT}
            >
              <DropdownMenuPrimitive.Label className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[--text-tertiary]">
                Your Projects
              </DropdownMenuPrimitive.Label>

              {projects.map((project) => (
                <DropdownMenuPrimitive.Item
                  key={project.id}
                  className={cn(
                    DROPDOWN_ITEM,
                    project.id === activeProject?.id && 'bg-[--surface-selected] font-medium'
                  )}
                  onSelect={() => onProjectChange?.(project)}
                >
                  <span className="flex-1 truncate">{project.name}</span>
                  <span className="text-xs text-[--text-tertiary]">{project.code}</span>
                </DropdownMenuPrimitive.Item>
              ))}
            </DropdownMenuPrimitive.Content>
          </DropdownMenuPrimitive.Portal>
        </DropdownMenuPrimitive.Root>

        {/* ── Spacer ── */}
        <div className="flex-1" />

        {/* ── Search trigger ── */}
        <button
          onClick={onSearchClick}
          aria-label="Search (Ctrl+K)"
          className={cn(
            'hidden sm:flex items-center gap-2',
            'rounded-md border border-[rgba(255,255,255,0.12)]',
            'bg-[rgba(255,255,255,0.06)] px-3 py-1.5',
            'text-[rgba(255,255,255,0.45)] hover:bg-[rgba(255,255,255,0.10)] hover:text-[rgba(255,255,255,0.7)]',
            'text-sm transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--primitive-blue-400]',
            'w-48 lg:w-64',
          )}
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1 text-left">Search…</span>
          <kbd className="hidden lg:inline-flex items-center rounded border border-[rgba(255,255,255,0.12)] px-1.5 py-0.5 text-[10px] font-mono">
            ⌘K
          </kbd>
        </button>

        {/* ── Offline indicator ── */}
        {offline && (
          <div
            className="flex items-center gap-1.5 rounded-md bg-[--color-warning-bg] px-2 py-1 text-xs font-medium text-[--color-warning-text]"
            aria-live="polite"
            role="status"
          >
            <CloudOff className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Offline</span>
          </div>
        )}

        {/* ── Notifications ── */}
        <button
          onClick={onNotificationClick}
          aria-label={
            clampedCount > 0
              ? `${clampedCount} unread notifications`
              : 'Notifications'
          }
          className={cn(
            'relative flex h-8 w-8 items-center justify-center rounded-md',
            'text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.08)] hover:text-white',
            'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--primitive-blue-400]',
          )}
        >
          <Bell className="h-4.5 w-4.5" />
          {clampedCount > 0 && (
            <span
              aria-hidden="true"
              className={cn(
                'absolute -right-0.5 -top-0.5 flex items-center justify-center',
                'rounded-full bg-[--primitive-red-500] text-white',
                'font-bold leading-none',
                clampedCount > 9
                  ? 'h-4 min-w-4 px-1 text-[9px]'
                  : 'h-4 w-4 text-[10px]'
              )}
            >
              {clampedCount}
            </span>
          )}
        </button>

        {/* ── User menu ── */}
        <DropdownMenuPrimitive.Root>
          <DropdownMenuPrimitive.Trigger asChild>
            <button
              aria-label="User menu"
              className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-[rgba(255,255,255,0.08)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--primitive-blue-400]"
            >
              <Avatar
                src={user.avatarUrl}
                name={user.name}
                size="sm"
                status="online"
              />
              <div className="hidden md:flex flex-col items-start min-w-0">
                <span className="truncate text-xs font-medium text-white max-w-28">
                  {user.name}
                </span>
                <span className="truncate text-[10px] text-[rgba(255,255,255,0.45)] max-w-28">
                  {user.role}
                </span>
              </div>
              <ChevronDown className="hidden md:block h-3 w-3 text-[rgba(255,255,255,0.4)] shrink-0" />
            </button>
          </DropdownMenuPrimitive.Trigger>

          <DropdownMenuPrimitive.Portal>
            <DropdownMenuPrimitive.Content
              align="end"
              sideOffset={8}
              className={DROPDOWN_CONTENT}
            >
              {/* User info header */}
              <div className="px-3 py-2 border-b border-[--border-default] mb-1">
                <p className="text-sm font-medium text-[--text-primary]">{user.name}</p>
                <p className="text-xs text-[--text-secondary]">{user.role}</p>
              </div>

              <DropdownMenuPrimitive.Item
                className={DROPDOWN_ITEM}
                onSelect={onProfileClick}
              >
                <User className="h-4 w-4 text-[--text-secondary]" />
                Profile
              </DropdownMenuPrimitive.Item>

              <DropdownMenuPrimitive.Item className={DROPDOWN_ITEM}>
                <Settings className="h-4 w-4 text-[--text-secondary]" />
                Settings
              </DropdownMenuPrimitive.Item>

              <DropdownMenuPrimitive.Separator className="my-1 h-px bg-[--border-default]" />

              <DropdownMenuPrimitive.Item
                className={cn(DROPDOWN_ITEM, 'text-[--color-danger-text]')}
                onSelect={onLogout}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuPrimitive.Item>
            </DropdownMenuPrimitive.Content>
          </DropdownMenuPrimitive.Portal>
        </DropdownMenuPrimitive.Root>
      </header>
    )
  }
)
Header.displayName = 'Header'

export { Header }
