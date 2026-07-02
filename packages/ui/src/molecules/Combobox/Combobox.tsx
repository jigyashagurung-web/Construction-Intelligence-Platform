import * as React from 'react'
import * as Popover from '@radix-ui/react-popover'
import { ChevronDown, Check, Search, X } from 'lucide-react'
import { cn } from '../../utils/cn'
import type { SelectOption, SelectOptionGroup } from '../../atoms/Select'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ComboboxProps {
  options?:           SelectOption[]
  groups?:            SelectOptionGroup[]
  value?:             string
  onValueChange?:     (value: string) => void
  placeholder?:       string
  searchPlaceholder?: string
  emptyMessage?:      string
  label?:             React.ReactNode
  hint?:              string
  error?:             string
  disabled?:          boolean
  required?:          boolean
  size?:              'sm' | 'md' | 'lg'
  id?:                string
  className?:         string
}

// ── Trigger styles (mirrors Select / Input sizing) ────────────────────────────

const SIZE_CLASS: Record<string, string> = {
  sm: 'h-8 text-xs',
  md: 'h-10 text-sm',
  lg: 'h-12 text-base',
}

// ── Component ─────────────────────────────────────────────────────────────────

function Combobox({
  options,
  groups,
  value,
  onValueChange,
  placeholder       = 'Select…',
  searchPlaceholder = 'Search…',
  emptyMessage      = 'No results found',
  label,
  hint,
  error,
  disabled,
  required,
  size = 'md',
  id,
  className,
}: ComboboxProps) {
  const generatedId = React.useId()
  const inputId     = id ?? generatedId
  const searchId    = `${inputId}-search`
  const errorId     = `${inputId}-error`
  const hintId      = `${inputId}-hint`
  const hasError    = Boolean(error)
  const describedBy = [hasError ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ')

  const [open,   setOpen]   = React.useState(false)
  const [query,  setQuery]  = React.useState('')

  // Flatten into a single array for search
  const allOptions = React.useMemo<SelectOption[]>(() => {
    if (groups) return groups.flatMap((g) => g.options)
    return options ?? []
  }, [options, groups])

  const filteredGroups = React.useMemo<SelectOptionGroup[]>(() => {
    const q = query.toLowerCase().trim()
    if (!q) return groups ? groups : [{ label: '', options: allOptions }]

    if (groups) {
      return groups
        .map((g) => ({
          ...g,
          options: g.options.filter((o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)),
        }))
        .filter((g) => g.options.length > 0)
    }
    return [{ label: '', options: allOptions.filter((o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)) }]
  }, [query, groups, allOptions])

  const selectedLabel = allOptions.find((o) => o.value === value)?.label

  const select = (optValue: string) => {
    onValueChange?.(optValue)
    setOpen(false)
    setQuery('')
  }

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onValueChange?.('')
    setQuery('')
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[--text-primary]">
          {label}
          {required && <span className="ml-0.5 text-[--color-danger-text]" aria-hidden>*</span>}
        </label>
      )}

      <Popover.Root open={open} onOpenChange={(o) => { setOpen(o); if (!o) setQuery('') }}>
        <Popover.Trigger asChild disabled={disabled}>
          <button
            id={inputId}
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-autocomplete="list"
            aria-describedby={describedBy || undefined}
            aria-invalid={hasError || undefined}
            aria-required={required || undefined}
            className={cn(
              'flex w-full items-center justify-between gap-2 rounded-lg border px-3',
              'bg-[--surface-input] transition-colors outline-none text-left',
              SIZE_CLASS[size],
              hasError
                ? 'border-[--color-danger-border]'
                : 'border-[--border-default] hover:border-[--border-strong]',
              open && 'ring-2 ring-[--focus-ring] border-[--border-focus]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            <span className={cn('flex-1 truncate', !selectedLabel && 'text-[--text-placeholder]')}>
              {selectedLabel ?? placeholder}
            </span>
            <span className="flex items-center gap-1 shrink-0">
              {value && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={clear}
                  onKeyDown={(e) => e.key === 'Enter' && clear(e as any)}
                  className="rounded p-0.5 text-[--text-tertiary] hover:text-[--text-primary] hover:bg-[--surface-hover]"
                  aria-label="Clear selection"
                >
                  <X className="h-3 w-3" aria-hidden />
                </span>
              )}
              <ChevronDown
                className={cn('h-4 w-4 text-[--text-tertiary] transition-transform', open && 'rotate-180')}
                aria-hidden
              />
            </span>
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={4}
            style={{ width: 'var(--radix-popover-trigger-width)' }}
            className={cn(
              'z-50 overflow-hidden rounded-lg',
              'border border-[--border-default] bg-[--surface-overlay] shadow-[--shadow-lg]',
              'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
              'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
            )}
          >
            {/* Search input */}
            <div className="flex items-center gap-2 border-b border-[--border-subtle] px-3 py-2">
              <Search className="h-3.5 w-3.5 shrink-0 text-[--text-tertiary]" aria-hidden />
              <input
                id={searchId}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                autoFocus
                autoComplete="off"
                className="flex-1 bg-transparent text-sm text-[--text-primary] placeholder:text-[--text-placeholder] outline-none"
                aria-label="Search options"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="text-[--text-tertiary] hover:text-[--text-primary]"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              )}
            </div>

            {/* Options */}
            <div className="max-h-60 overflow-y-auto p-1" role="listbox">
              {filteredGroups.length === 0 || filteredGroups.every((g) => g.options.length === 0) ? (
                <div className="px-3 py-4 text-center text-sm text-[--text-tertiary]">
                  {emptyMessage}
                </div>
              ) : (
                filteredGroups.map((group, gi) => (
                  <React.Fragment key={gi}>
                    {gi > 0 && <div className="my-1 h-px bg-[--border-subtle]" />}
                    {group.label && (
                      <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[--text-tertiary]">
                        {group.label}
                      </div>
                    )}
                    {group.options.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        role="option"
                        aria-selected={opt.value === value}
                        disabled={opt.disabled}
                        onClick={() => select(opt.value)}
                        className={cn(
                          'flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2',
                          'text-sm text-[--text-primary] transition-colors outline-none text-left',
                          'hover:bg-[--surface-hover] focus-visible:bg-[--surface-hover]',
                          'disabled:opacity-40 disabled:cursor-not-allowed',
                          opt.value === value && 'font-medium',
                        )}
                      >
                        <span className="flex-1 truncate">{opt.label}</span>
                        {opt.value === value && (
                          <Check className="h-3.5 w-3.5 shrink-0 text-[--action-primary-bg]" aria-hidden />
                        )}
                      </button>
                    ))}
                  </React.Fragment>
                ))
              )}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {hint && !hasError && (
        <p id={hintId} className="text-xs text-[--text-secondary]">{hint}</p>
      )}
      {hasError && (
        <p id={errorId} className="text-xs text-[--color-danger-text]" role="alert">{error}</p>
      )}
    </div>
  )
}

Combobox.displayName = 'Combobox'
export { Combobox }
