import * as React from 'react'
import { ChevronRight, ArrowLeft } from 'lucide-react'
import { cn } from '../../utils/cn'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  label: string
  href?: string
  onClick?: () => void
}

export interface PageHeaderProps {
  title:          string
  description?:   string
  breadcrumb?:    BreadcrumbItem[]
  /** Badge or status pill shown beside the title */
  badge?:         React.ReactNode
  /** Back button — rendered when either prop is provided */
  backLabel?:     string
  onBack?:        () => void
  /** Right-side slot: primary action(s), kebab menu, etc. */
  actions?:       React.ReactNode
  /** Compact variant — less vertical padding (for sub-pages) */
  compact?:       boolean
  className?:     string
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PageHeader({
  title,
  description,
  breadcrumb,
  badge,
  backLabel,
  onBack,
  actions,
  compact = false,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-1', compact ? 'pb-4' : 'pb-6', className)}>

      {/* Breadcrumb */}
      {breadcrumb && breadcrumb.length > 0 && (
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1 text-xs text-[--text-tertiary]">
            {breadcrumb.map((crumb, i) => (
              <React.Fragment key={i}>
                {i > 0 && <ChevronRight className="h-3 w-3 shrink-0 opacity-50" aria-hidden />}
                <li>
                  {crumb.href || crumb.onClick ? (
                    <a
                      href={crumb.href}
                      onClick={crumb.onClick}
                      className="hover:text-[--text-primary] transition-colors cursor-pointer"
                    >
                      {crumb.label}
                    </a>
                  ) : (
                    <span className="text-[--text-secondary]">{crumb.label}</span>
                  )}
                </li>
              </React.Fragment>
            ))}
          </ol>
        </nav>
      )}

      {/* Back button */}
      {(backLabel !== undefined || onBack) && (
        <button
          onClick={onBack}
          className={cn(
            'mb-1 flex w-fit items-center gap-1.5 text-xs text-[--text-secondary]',
            'hover:text-[--text-primary] transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--focus-ring] rounded',
          )}
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          {backLabel ?? 'Back'}
        </button>
      )}

      {/* Title row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className={cn(
              'font-bold text-[--text-primary] leading-tight',
              compact ? 'text-lg' : 'text-xl',
            )}>
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p className="text-sm text-[--text-secondary]">{description}</p>
          )}
        </div>

        {actions && (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        )}
      </div>
    </div>
  )
}

PageHeader.displayName = 'PageHeader'
