import * as React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '../../utils/cn'

// ── Types ─────────────────────────────────────────────────────────────────────

export type MetricCardStatus = 'ok' | 'warning' | 'danger' | 'neutral'

export interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** KPI label — keep short (≤ 4 words) */
  label:        string
  /** Primary value displayed large */
  value:        string | number
  /** Unit shown after the value (m², bags, days, NPR…) */
  unit?:        string
  /** Numeric trend value. Positive or negative float. */
  trend?:       number
  /** Contextual trend label (e.g. "vs last week", "since baseline") */
  trendLabel?:  string
  /**
   * For most metrics higher = better (default true).
   * Set false for metrics like "delay days" where a positive trend is bad.
   */
  trendPositiveIsGood?: boolean
  /** Semantic status — drives the left border colour */
  status?:      MetricCardStatus
  /** Icon rendered top-left. Pass a Lucide element at h-5 w-5. */
  icon?:        React.ReactNode
  /** Replace the value area with a skeleton (data loading) */
  loading?:     boolean
  /** Secondary line below the value */
  subLabel?:    string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_BORDER: Record<MetricCardStatus, string> = {
  ok:      'border-l-[--color-success-icon]',
  warning: 'border-l-[--color-warning-icon]',
  danger:  'border-l-[--color-danger-icon]',
  neutral: 'border-l-[--border-default]',
}

function TrendIcon({ positive }: { positive: boolean }) {
  return positive
    ? <TrendingUp  className="h-3.5 w-3.5" aria-hidden="true" />
    : <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />
}

// ── Component ─────────────────────────────────────────────────────────────────
const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  (
    {
      label,
      value,
      unit,
      trend,
      trendLabel,
      trendPositiveIsGood = true,
      status  = 'neutral',
      icon,
      loading = false,
      subLabel,
      className,
      ...props
    },
    ref
  ) => {
    const hasTrend    = trend !== undefined
    const trendUp     = hasTrend && trend > 0
    const trendIsGood = trendPositiveIsGood ? trendUp : !trendUp
    const trendFlat   = hasTrend && trend === 0

    const trendColour = trendFlat
      ? 'text-[--text-secondary]'
      : trendIsGood
        ? 'text-[--color-success-text]'
        : 'text-[--color-danger-text]'

    const trendSign = trendFlat ? '' : (trend ?? 0) > 0 ? '+' : ''

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex flex-col gap-3 rounded-[--card-radius]',
          'bg-[--card-bg] border border-[--card-border]',
          'border-l-4 p-5 shadow-[--shadow-card]',
          STATUS_BORDER[status],
          className
        )}
        {...props}
      >
        {/* Header row: label + icon */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-[--text-label] text-sm font-medium leading-tight">
            {label}
          </span>
          {icon && (
            <span className="text-[--text-secondary] shrink-0" aria-hidden="true">
              {icon}
            </span>
          )}
        </div>

        {/* Value */}
        {loading ? (
          <div className="flex flex-col gap-2">
            <div className="h-8 w-24 rounded bg-[--surface-hover] animate-pulse" />
            <div className="h-3 w-16 rounded bg-[--surface-hover] animate-pulse" />
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-baseline gap-1.5 leading-none">
              <span
                className="text-3xl font-bold tracking-tight text-[--text-primary]"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {value}
              </span>
              {unit && (
                <span className="text-sm font-medium text-[--text-secondary]">
                  {unit}
                </span>
              )}
            </div>
            {subLabel && (
              <span className="text-xs text-[--text-secondary]">{subLabel}</span>
            )}
          </div>
        )}

        {/* Trend */}
        {hasTrend && !loading && (
          <div className={cn('flex items-center gap-1 text-xs font-medium', trendColour)}>
            {trendFlat
              ? <Minus className="h-3.5 w-3.5" aria-hidden="true" />
              : <TrendIcon positive={trendUp} />
            }
            <span>
              {trendSign}{Math.abs(trend)}{unit ? ` ${unit}` : '%'}
            </span>
            {trendLabel && (
              <span className="text-[--text-tertiary] font-normal">
                {trendLabel}
              </span>
            )}
          </div>
        )}
      </div>
    )
  }
)
MetricCard.displayName = 'MetricCard'

export { MetricCard }
