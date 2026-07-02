import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Bell, X, Check, CheckCheck, Info, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Badge } from '../../atoms/Badge'
import { Button } from '../../atoms/Button'

// ── Types ─────────────────────────────────────────────────────────────────────

export type NotificationType = 'info' | 'warning' | 'danger' | 'success'

export interface CIPNotification {
  id:         string
  type:       NotificationType
  title:      string
  body?:      string
  timestamp:  string   // display string — e.g. "2 hours ago", "Today 14:32"
  read:       boolean
  module?:    string   // e.g. 'BOQ', 'Safety', 'Finance'
  action?:    { label: string; onClick?: () => void }
}

export interface NotificationDrawerProps {
  notifications:     CIPNotification[]
  onMarkAllRead?:    () => void
  onDismiss?:        (id: string) => void
  onMarkRead?:       (id: string) => void
  open?:             boolean
  onOpenChange?:     (open: boolean) => void
  triggerClassName?: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<NotificationType, { icon: React.ElementType; iconClass: string; badgeVariant: any }> = {
  info:    { icon: Info,          iconClass: 'text-[--action-primary-bg]',  badgeVariant: 'primary' },
  warning: { icon: AlertTriangle, iconClass: 'text-[--color-warning-icon]', badgeVariant: 'warning' },
  danger:  { icon: AlertCircle,   iconClass: 'text-[--color-danger-icon]',  badgeVariant: 'danger'  },
  success: { icon: CheckCircle2,  iconClass: 'text-[--color-success-icon]', badgeVariant: 'success' },
}

// ── Notification item ─────────────────────────────────────────────────────────

function NotificationItem({
  notification: n,
  onDismiss,
  onMarkRead,
}: {
  notification: CIPNotification
  onDismiss?:   (id: string) => void
  onMarkRead?:  (id: string) => void
}) {
  const cfg  = TYPE_CONFIG[n.type]
  const Icon = cfg.icon

  return (
    <div
      className={cn(
        'group relative flex gap-3 rounded-xl px-4 py-3 transition-colors',
        n.read ? 'opacity-70' : 'bg-[--surface-hover]',
      )}
    >
      {/* Unread dot */}
      {!n.read && (
        <span
          className="absolute left-1.5 top-4 h-1.5 w-1.5 rounded-full bg-[--action-primary-bg]"
          aria-label="Unread"
        />
      )}

      {/* Type icon */}
      <div className={cn('mt-0.5 shrink-0', cfg.iconClass)}>
        <Icon className="h-4 w-4" aria-hidden />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="text-sm font-semibold text-[--text-primary] leading-tight">{n.title}</p>
          {n.module && (
            <Badge variant={cfg.badgeVariant} size="sm">{n.module}</Badge>
          )}
        </div>
        {n.body && (
          <p className="mt-0.5 text-xs text-[--text-secondary] leading-relaxed line-clamp-2">{n.body}</p>
        )}
        <div className="mt-1.5 flex items-center gap-3">
          <span className="text-xs text-[--text-tertiary]">{n.timestamp}</span>
          {n.action && (
            <button
              type="button"
              onClick={n.action.onClick}
              className="text-xs font-semibold text-[--action-primary-bg] hover:underline focus:outline-none focus-visible:underline"
            >
              {n.action.label}
            </button>
          )}
        </div>
      </div>

      {/* Actions (appear on hover) */}
      <div className="flex shrink-0 flex-col items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {!n.read && onMarkRead && (
          <button
            type="button"
            onClick={() => onMarkRead(n.id)}
            className="rounded p-1 text-[--text-tertiary] hover:bg-[--surface-card] hover:text-[--text-primary] transition-colors focus:outline-none"
            aria-label="Mark as read"
          >
            <Check className="h-3.5 w-3.5" aria-hidden />
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={() => onDismiss(n.id)}
            className="rounded p-1 text-[--text-tertiary] hover:bg-[--surface-card] hover:text-[--text-primary] transition-colors focus:outline-none"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        )}
      </div>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

const NotificationDrawer = React.forwardRef<HTMLButtonElement, NotificationDrawerProps>(
  ({
    notifications,
    onMarkAllRead,
    onDismiss,
    onMarkRead,
    open: controlledOpen,
    onOpenChange,
    triggerClassName,
  }, ref) => {
    const unreadCount = notifications.filter((n) => !n.read).length

    return (
      <DialogPrimitive.Root open={controlledOpen} onOpenChange={onOpenChange}>
        {/* Bell trigger */}
        <DialogPrimitive.Trigger asChild>
          <button
            ref={ref}
            type="button"
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
            className={cn(
              'relative flex h-9 w-9 items-center justify-center rounded-[--radius-md]',
              'text-[--text-secondary] transition-colors',
              'hover:bg-[--surface-hover] hover:text-[--text-primary]',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-[--action-primary-bg]',
              triggerClassName,
            )}
          >
            <Bell className="h-5 w-5" aria-hidden />
            {unreadCount > 0 && (
              <span
                aria-hidden
                className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[--color-danger-icon] px-1 text-[10px] font-bold text-white leading-none"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        </DialogPrimitive.Trigger>

        {/* Drawer */}
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay
            className={cn(
              'fixed inset-0 z-50 bg-black/40 backdrop-blur-sm',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            )}
          />
          <DialogPrimitive.Content
            className={cn(
              'fixed right-0 top-0 z-50 flex h-full w-full max-w-[400px] flex-col',
              'bg-[--card-bg] shadow-[--shadow-dialog] outline-none',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
              'duration-300',
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[--border-default] px-5 py-4">
              <div className="flex items-center gap-2">
                <DialogPrimitive.Title className="text-base font-semibold text-[--text-primary]">
                  Notifications
                </DialogPrimitive.Title>
                {unreadCount > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[--color-danger-icon] px-1.5 text-xs font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && onMarkAllRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    iconLeft={<CheckCheck className="h-3.5 w-3.5" />}
                    onClick={onMarkAllRead}
                  >
                    Mark all read
                  </Button>
                )}
                <DialogPrimitive.Close asChild>
                  <button
                    type="button"
                    className="rounded p-1.5 text-[--text-tertiary] hover:bg-[--surface-hover] hover:text-[--text-primary] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[--action-primary-bg]"
                    aria-label="Close notifications"
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </DialogPrimitive.Close>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
                  <Bell className="h-10 w-10 text-[--text-tertiary]" aria-hidden />
                  <div>
                    <p className="text-sm font-medium text-[--text-primary]">All caught up</p>
                    <p className="mt-0.5 text-xs text-[--text-secondary]">No notifications at this time</p>
                  </div>
                </div>
              ) : (
                <div className="py-2">
                  {notifications.map((n, i) => (
                    <React.Fragment key={n.id}>
                      {i > 0 && (
                        <div className="mx-4 border-t border-[--border-subtle]" />
                      )}
                      <NotificationItem
                        notification={n}
                        onDismiss={onDismiss}
                        onMarkRead={onMarkRead}
                      />
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-[--border-default] px-5 py-3">
                <p className="text-center text-xs text-[--text-tertiary]">
                  {notifications.length} notification{notifications.length !== 1 ? 's' : ''} ·{' '}
                  {unreadCount} unread
                </p>
              </div>
            )}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    )
  }
)
NotificationDrawer.displayName = 'NotificationDrawer'

export { NotificationDrawer }
