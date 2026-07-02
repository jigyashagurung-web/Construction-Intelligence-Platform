import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { ChevronDown, ChevronUp, Check } from 'lucide-react'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SelectOption {
  value:     string
  label:     string
  disabled?: boolean
}

export interface SelectOptionGroup {
  label:   string
  options: SelectOption[]
}

export interface SelectProps {
  options?:       SelectOption[]
  groups?:        SelectOptionGroup[]
  value?:         string
  defaultValue?:  string
  onValueChange?: (value: string) => void
  placeholder?:   string
  label?:         React.ReactNode
  hint?:          string
  error?:         string
  disabled?:      boolean
  required?:      boolean
  size?:          'sm' | 'md' | 'lg'
  id?:            string
  name?:          string
  className?:     string
}

// ── Trigger variants ──────────────────────────────────────────────────────────

const triggerVariants = cva(
  [
    'flex w-full items-center justify-between gap-2 rounded-lg border',
    'bg-[--surface-input] px-3 text-left',
    'text-[--text-primary] transition-colors',
    'outline-none focus:ring-2 focus:ring-[--focus-ring] focus:border-[--border-focus]',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'data-[placeholder]:text-[--text-placeholder]',
  ],
  {
    variants: {
      size: {
        sm: 'h-8 text-xs',
        md: 'h-10 text-sm',
        lg: 'h-12 text-base',
      },
      state: {
        default: 'border-[--border-default] hover:border-[--border-strong]',
        error:   'border-[--color-danger-border] hover:border-[--color-danger-border]',
      },
    },
    defaultVariants: { size: 'md', state: 'default' },
  },
)

// ── Component ─────────────────────────────────────────────────────────────────

function Select({
  options,
  groups,
  value,
  defaultValue,
  onValueChange,
  placeholder = 'Select…',
  label,
  hint,
  error,
  disabled,
  required,
  size = 'md',
  id,
  name,
  className,
}: SelectProps) {
  const generatedId  = React.useId()
  const inputId      = id ?? generatedId
  const errorId      = `${inputId}-error`
  const hintId       = `${inputId}-hint`

  const hasError     = Boolean(error)
  const describedBy  = [hasError ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ')

  // Flatten groups + standalone options into one source of truth for rendering
  const allGroups: SelectOptionGroup[] = groups
    ? groups
    : options
    ? [{ label: '', options }]
    : []

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-[--text-primary]"
        >
          {label}
          {required && <span className="ml-0.5 text-[--color-danger-text]" aria-hidden>*</span>}
        </label>
      )}

      <SelectPrimitive.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
        name={name}
      >
        <SelectPrimitive.Trigger
          id={inputId}
          className={triggerVariants({ size, state: hasError ? 'error' : 'default' })}
          aria-describedby={describedBy || undefined}
          aria-invalid={hasError || undefined}
          aria-required={required || undefined}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon asChild>
            <ChevronDown className="h-4 w-4 shrink-0 text-[--text-tertiary]" aria-hidden />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={4}
            className={cn(
              'z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg',
              'border border-[--border-default] bg-[--surface-overlay] shadow-[--shadow-lg]',
              'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
              'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
            )}
          >
            <SelectPrimitive.ScrollUpButton className="flex h-7 items-center justify-center text-[--text-tertiary]">
              <ChevronUp className="h-4 w-4" aria-hidden />
            </SelectPrimitive.ScrollUpButton>

            <SelectPrimitive.Viewport className="p-1 max-h-[var(--radix-select-content-available-height)]">
              {allGroups.map((group, gi) => (
                <React.Fragment key={gi}>
                  {gi > 0 && (
                    <SelectPrimitive.Separator className="my-1 h-px bg-[--border-subtle]" />
                  )}
                  {group.label && (
                    <SelectPrimitive.Label className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[--text-tertiary]">
                      {group.label}
                    </SelectPrimitive.Label>
                  )}
                  {group.options.map((opt) => (
                    <SelectPrimitive.Item
                      key={opt.value}
                      value={opt.value}
                      disabled={opt.disabled}
                      className={cn(
                        'relative flex cursor-pointer select-none items-center gap-2 rounded-md py-2 pl-3 pr-8',
                        'text-sm text-[--text-primary] outline-none transition-colors',
                        'focus:bg-[--surface-hover] data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed',
                      )}
                    >
                      <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                      <SelectPrimitive.ItemIndicator className="absolute right-2.5">
                        <Check className="h-3.5 w-3.5 text-[--action-primary-bg]" aria-hidden />
                      </SelectPrimitive.ItemIndicator>
                    </SelectPrimitive.Item>
                  ))}
                </React.Fragment>
              ))}
            </SelectPrimitive.Viewport>

            <SelectPrimitive.ScrollDownButton className="flex h-7 items-center justify-center text-[--text-tertiary]">
              <ChevronDown className="h-4 w-4" aria-hidden />
            </SelectPrimitive.ScrollDownButton>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>

      {hint && !hasError && (
        <p id={hintId} className="text-xs text-[--text-secondary]">{hint}</p>
      )}
      {hasError && (
        <p id={errorId} className="text-xs text-[--color-danger-text]" role="alert">{error}</p>
      )}
    </div>
  )
}

Select.displayName = 'Select'
export { Select }
