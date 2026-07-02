import * as React from 'react'
import { X, SlidersHorizontal } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Button } from '../../atoms/Button'

// ── Filter chip ───────────────────────────────────────────────────────────────

export interface FilterChipData {
  id:       string
  /** Category label, e.g. "Status" */
  label:    string
  /** Selected value, e.g. "At risk" */
  value:    string
  onRemove?: () => void
}

export interface FilterChipProps extends FilterChipData {
  className?: string
}

export function FilterChip({ label, value, onRemove, className }: FilterChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-[--border-default]',
        'bg-[--surface-input] px-2.5 py-1 text-xs font-medium',
        'whitespace-nowrap',
        className,
      )}
    >
      <span className="text-[--text-tertiary]">{label}:</span>
      <span className="text-[--text-primary]">{value}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className={cn(
            'ml-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full',
            'text-[--text-tertiary] hover:text-[--text-primary] hover:bg-[--surface-hover]',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[--focus-ring]',
            'transition-colors',
          )}
          aria-label={`Remove ${label}: ${value} filter`}
        >
          <X className="h-2.5 w-2.5" aria-hidden />
        </button>
      )}
    </span>
  )
}

// ── FilterBar ─────────────────────────────────────────────────────────────────

export interface FilterBarProps {
  filters:      FilterChipData[]
  onClearAll?:  () => void
  /** Left slot — typically a search input or sort dropdown */
  leftSlot?:    React.ReactNode
  /** Right slot — typically column toggle or density picker */
  rightSlot?:   React.ReactNode
  /** Label for the filter icon button (e.g. "Filters") */
  filterLabel?: string
  onFilterClick?: () => void
  className?:   string
}

export function FilterBar({
  filters,
  onClearAll,
  leftSlot,
  rightSlot,
  filterLabel   = 'Filters',
  onFilterClick,
  className,
}: FilterBarProps) {
  const activeCount = filters.length

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {/* Top row: controls */}
      <div className="flex items-center gap-2">
        {leftSlot && <div className="flex-1 min-w-0">{leftSlot}</div>}

        {onFilterClick && (
          <Button
            variant="secondary"
            size="sm"
            iconLeft={<SlidersHorizontal className="h-3.5 w-3.5" />}
            onClick={onFilterClick}
          >
            {filterLabel}
            {activeCount > 0 && (
              <span className="ml-1 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[--action-primary-bg] px-1 text-[10px] font-semibold text-white tabular-nums">
                {activeCount}
              </span>
            )}
          </Button>
        )}

        {rightSlot && <div className="shrink-0">{rightSlot}</div>}
      </div>

      {/* Active filter chips */}
      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Active filters">
          {filters.map((chip) => (
            <FilterChip key={chip.id} {...chip} />
          ))}
          {onClearAll && (
            <button
              onClick={onClearAll}
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
                'text-[--text-secondary] hover:text-[--color-danger-text]',
                'transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--focus-ring]',
              )}
              aria-label="Clear all filters"
            >
              <X className="h-3 w-3" aria-hidden />
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  )
}

FilterBar.displayName = 'FilterBar'
