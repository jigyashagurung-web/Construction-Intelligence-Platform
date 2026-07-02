import * as React from 'react'
import { createPortal } from 'react-dom'
import { X, CheckCircle2, AlertTriangle, XCircle, Info, Bell } from 'lucide-react'
import { cn } from '../../utils/cn'

// ── Types ─────────────────────────────────────────────────────────────────────

export type ToastVariant = 'default' | 'success' | 'warning' | 'danger' | 'info'

export interface ToastOptions {
  title:        string
  description?: string
  variant?:     ToastVariant
  /** ms until auto-dismiss. Pass Infinity to require manual dismiss */
  duration?:    number
  action?: {
    label:   string
    onClick: () => void
  }
}

interface ToastItem extends ToastOptions {
  id:       string
  closing:  boolean
}

interface ToastContextValue {
  toast:   (opts: ToastOptions) => string
  dismiss: (id: string) => void
}

// ── Context ───────────────────────────────────────────────────────────────────

const ToastContext = React.createContext<ToastContextValue>({
  toast:   () => '',
  dismiss: () => {},
})

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useToast() {
  return React.useContext(ToastContext)
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([])

  const dismiss = React.useCallback((id: string) => {
    // Mark as closing (triggers exit animation), then remove
    setToasts((prev) => prev.map((t) => t.id === id ? { ...t, closing: true } : t))
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 300)
  }, [])

  const toast = React.useCallback((opts: ToastOptions): string => {
    const id = Math.random().toString(36).slice(2, 9)
    setToasts((prev) => {
      // Keep at most 5 toasts; bump oldest if over limit
      const next = [...prev, { ...opts, id, closing: false }]
      return next.length > 5 ? next.slice(next.length - 5) : next
    })
    const duration = opts.duration ?? 4500
    if (duration !== Infinity) {
      setTimeout(() => dismiss(id), duration)
    }
    return id
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <ToastList toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

// ── Config ────────────────────────────────────────────────────────────────────

const VARIANT_CONFIG: Record<ToastVariant, {
  icon:       React.ElementType
  iconClass:  string
  barClass:   string
}> = {
  default: {
    icon:      Bell,
    iconClass: 'text-[--text-tertiary]',
    barClass:  'bg-[--border-default]',
  },
  success: {
    icon:      CheckCircle2,
    iconClass: 'text-[--color-success-icon]',
    barClass:  'bg-[--color-success-icon]',
  },
  warning: {
    icon:      AlertTriangle,
    iconClass: 'text-[--color-warning-icon]',
    barClass:  'bg-[--color-warning-icon]',
  },
  danger: {
    icon:      XCircle,
    iconClass: 'text-[--color-danger-icon]',
    barClass:  'bg-[--color-danger-icon]',
  },
  info: {
    icon:      Info,
    iconClass: 'text-[--color-info-icon]',
    barClass:  'bg-[--color-info-icon]',
  },
}

// ── Single toast ──────────────────────────────────────────────────────────────

function ToastItem({
  toast,
  onDismiss,
}: {
  toast:     ToastItem
  onDismiss: (id: string) => void
}) {
  const config   = VARIANT_CONFIG[toast.variant ?? 'default']
  const Icon     = config.icon
  const duration = toast.duration ?? 4500
  const finite   = duration !== Infinity

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        'relative flex w-full max-w-sm overflow-hidden rounded-xl',
        'border border-[--border-default] bg-[--surface-overlay]',
        'shadow-[--shadow-lg] pointer-events-auto',
        // Enter
        !toast.closing && 'animate-in slide-in-from-right-5 fade-in-0 duration-300',
        // Exit
        toast.closing  && 'animate-out slide-out-to-right-5 fade-out-0 duration-300',
      )}
    >
      {/* Left accent bar */}
      <div className={cn('w-1 shrink-0', config.barClass)} aria-hidden />

      <div className="flex flex-1 items-start gap-3 px-4 py-3.5">
        <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', config.iconClass)} aria-hidden />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[--text-primary]">{toast.title}</p>
          {toast.description && (
            <p className="mt-0.5 text-xs text-[--text-secondary]">{toast.description}</p>
          )}
          {toast.action && (
            <button
              onClick={() => { toast.action!.onClick(); onDismiss(toast.id) }}
              className="mt-2 text-xs font-semibold text-[--action-primary-bg] hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[--focus-ring] rounded"
            >
              {toast.action.label}
            </button>
          )}
        </div>

        <button
          onClick={() => onDismiss(toast.id)}
          className={cn(
            'flex h-6 w-6 shrink-0 items-center justify-center rounded',
            'text-[--text-tertiary] hover:text-[--text-primary] hover:bg-[--surface-hover]',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[--focus-ring]',
            'transition-colors',
          )}
          aria-label="Dismiss notification"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>

      {/* Progress bar */}
      {finite && (
        <div
          className={cn('absolute bottom-0 left-1 h-0.5 rounded-full', config.barClass, 'opacity-40')}
          style={{
            width:      '100%',
            animation:  `toast-progress ${duration}ms linear forwards`,
          }}
          aria-hidden
        />
      )}
    </div>
  )
}

// ── List ──────────────────────────────────────────────────────────────────────

function ToastList({
  toasts,
  onDismiss,
}: {
  toasts:    ToastItem[]
  onDismiss: (id: string) => void
}) {
  if (typeof document === 'undefined') return null

  return createPortal(
    <>
      <style>{`
        @keyframes toast-progress {
          from { transform: scaleX(1); transform-origin: left; }
          to   { transform: scaleX(0); transform-origin: left; }
        }
      `}</style>
      <div
        className="fixed right-4 top-4 z-[9999] flex flex-col items-end gap-2 pointer-events-none"
        aria-label="Notifications"
        aria-live="polite"
        aria-relevant="additions"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
        ))}
      </div>
    </>,
    document.body,
  )
}
