import * as React from 'react'
import { SearchX, AlertCircle, FolderOpen } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Button } from '../../atoms/Button'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface EmptyStateAction {
  label:    string
  onClick:  () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  icon?:    React.ReactNode
}

export interface EmptyStateProps {
  /** Custom icon or illustration. Falls back to variant default. */
  icon?:             React.ReactNode
  title:             string
  description?:      string
  /** Primary CTA */
  action?:           EmptyStateAction
  /** Secondary CTA below the primary */
  secondaryAction?:  EmptyStateAction
  /** `default` — generic empty, `search` — no results, `error` — load failure */
  variant?:          'default' | 'search' | 'error'
  size?:             'sm' | 'md' | 'lg'
  className?:        string
}

// ── Default icons per variant ─────────────────────────────────────────────────

const VARIANT_ICON: Record<string, React.ElementType> = {
  default: FolderOpen,
  search:  SearchX,
  error:   AlertCircle,
}

const VARIANT_ICON_COLOR: Record<string, string> = {
  default: 'text-[--text-tertiary]',
  search:  'text-[--text-tertiary]',
  error:   'text-[--color-danger-icon]',
}

const ICON_SIZE: Record<string, string> = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
}

const RING_SIZE: Record<string, string> = {
  sm: 'h-14 w-14',
  md: 'h-16 w-16',
  lg: 'h-20 w-20',
}

// ── Component ─────────────────────────────────────────────────────────────────

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  variant  = 'default',
  size     = 'md',
  className,
}: EmptyStateProps) {
  const DefaultIcon = VARIANT_ICON[variant]

  return (
    <div
      className={cn('flex flex-col items-center text-center', className)}
      style={{ padding: size === 'sm' ? '32px 24px' : size === 'lg' ? '64px 32px' : '48px 32px' }}
      role="status"
      aria-label={title}
    >
      {/* Icon ring */}
      <div className={cn(
        RING_SIZE[size],
        'flex items-center justify-center rounded-full bg-[--surface-hover] mb-4',
      )}>
        {icon ?? (
          <DefaultIcon
            className={cn(ICON_SIZE[size], VARIANT_ICON_COLOR[variant])}
            aria-hidden
          />
        )}
      </div>

      <p className={cn(
        'font-semibold text-[--text-primary]',
        size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base',
      )}>
        {title}
      </p>

      {description && (
        <p className={cn(
          'mt-1 text-[--text-secondary] max-w-xs',
          size === 'sm' ? 'text-xs' : 'text-sm',
        )}>
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="mt-5 flex flex-col items-center gap-2">
          {action && (
            <Button
              variant={action.variant === 'secondary' ? 'secondary' : action.variant === 'ghost' ? 'ghost' : 'primary'}
              size={size === 'sm' ? 'sm' : 'md'}
              iconLeft={action.icon ? <span className="h-4 w-4">{action.icon}</span> : undefined}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="ghost"
              size="sm"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

EmptyState.displayName = 'EmptyState'
