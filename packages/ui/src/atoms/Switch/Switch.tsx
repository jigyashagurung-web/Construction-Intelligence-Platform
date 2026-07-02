import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import { cn } from '../../utils/cn'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SwitchProps {
  checked?:         boolean
  defaultChecked?:  boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?:        boolean
  required?:        boolean
  /** Label rendered beside the switch */
  label?:           React.ReactNode
  /** Secondary description text below the label */
  hint?:            string
  error?:           string
  size?:            'sm' | 'md'
  /** Which side the label appears on */
  labelPosition?:   'left' | 'right'
  id?:              string
  name?:            string
  className?:       string
}

// ── Component ─────────────────────────────────────────────────────────────────

function Switch({
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  required,
  label,
  hint,
  error,
  size = 'md',
  labelPosition = 'right',
  id,
  name,
  className,
}: SwitchProps) {
  const generatedId = React.useId()
  const inputId     = id ?? generatedId
  const errorId     = `${inputId}-error`
  const hintId      = `${inputId}-hint`
  const hasError    = Boolean(error)
  const describedBy = [hasError ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ')

  const trackSize = size === 'sm'
    ? 'h-4 w-7'
    : 'h-5 w-9'

  const thumbSize = size === 'sm'
    ? 'h-3 w-3 data-[state=checked]:translate-x-3'
    : 'h-3.5 w-3.5 data-[state=checked]:translate-x-4'

  const switchEl = (
    <SwitchPrimitive.Root
      id={inputId}
      name={name}
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      required={required}
      aria-describedby={describedBy || undefined}
      aria-invalid={hasError || undefined}
      className={cn(
        trackSize,
        'relative shrink-0 cursor-pointer rounded-full border-2 border-transparent',
        'bg-[--border-default] transition-colors outline-none',
        'focus-visible:ring-2 focus-visible:ring-[--focus-ring] focus-visible:ring-offset-2',
        'data-[state=checked]:bg-[--action-primary-bg]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        hasError && 'ring-1 ring-[--color-danger-border]',
      )}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          thumbSize,
          'block rounded-full bg-white shadow-sm',
          'transition-transform duration-200',
          'translate-x-0.5',
        )}
      />
    </SwitchPrimitive.Root>
  )

  if (!label) return (
    <div className={cn('flex flex-col gap-1', className)}>
      {switchEl}
      {hint && !hasError && <p id={hintId} className="text-xs text-[--text-secondary]">{hint}</p>}
      {hasError && <p id={errorId} className="text-xs text-[--color-danger-text]" role="alert">{error}</p>}
    </div>
  )

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className={cn('flex items-center gap-3', labelPosition === 'left' && 'flex-row-reverse justify-end')}>
        {switchEl}
        <div className="flex flex-col gap-0.5">
          <label
            htmlFor={inputId}
            className={cn(
              'leading-none cursor-pointer select-none text-[--text-primary]',
              size === 'sm' ? 'text-xs' : 'text-sm',
              disabled && 'opacity-50 cursor-not-allowed',
            )}
          >
            {label}
            {required && <span className="ml-0.5 text-[--color-danger-text]" aria-hidden>*</span>}
          </label>
          {hint && !hasError && (
            <p id={hintId} className="text-xs text-[--text-tertiary]">{hint}</p>
          )}
        </div>
      </div>
      {hasError && (
        <p id={errorId} className="text-xs text-[--color-danger-text]" role="alert">{error}</p>
      )}
    </div>
  )
}

Switch.displayName = 'Switch'
export { Switch }
