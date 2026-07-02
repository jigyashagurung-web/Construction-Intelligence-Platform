import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check, Minus } from 'lucide-react'
import { cn } from '../../utils/cn'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CheckboxProps {
  checked?:         boolean | 'indeterminate'
  defaultChecked?:  boolean
  onCheckedChange?: (checked: boolean | 'indeterminate') => void
  disabled?:        boolean
  required?:        boolean
  /** Text or node rendered next to the checkbox */
  label?:           React.ReactNode
  hint?:            string
  error?:           string
  size?:            'sm' | 'md'
  id?:              string
  name?:            string
  value?:           string
  className?:       string
}

// ── Component ─────────────────────────────────────────────────────────────────

function Checkbox({
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  required,
  label,
  hint,
  error,
  size = 'md',
  id,
  name,
  value,
  className,
}: CheckboxProps) {
  const generatedId = React.useId()
  const inputId     = id ?? generatedId
  const errorId     = `${inputId}-error`
  const hintId      = `${inputId}-hint`
  const hasError    = Boolean(error)
  const describedBy = [hasError ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ')

  const boxSize = size === 'sm'
    ? 'h-3.5 w-3.5 rounded'
    : 'h-4 w-4 rounded'

  const iconSize = size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3'

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-start gap-2.5">
        <CheckboxPrimitive.Root
          id={inputId}
          name={name}
          value={value}
          checked={checked}
          defaultChecked={defaultChecked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          required={required}
          aria-describedby={describedBy || undefined}
          aria-invalid={hasError || undefined}
          className={cn(
            boxSize,
            'shrink-0 border-2 transition-colors outline-none',
            'border-[--border-default] bg-[--surface-input]',
            'focus-visible:ring-2 focus-visible:ring-[--focus-ring] focus-visible:ring-offset-1',
            'data-[state=checked]:bg-[--action-primary-bg] data-[state=checked]:border-[--action-primary-bg]',
            'data-[state=indeterminate]:bg-[--action-primary-bg] data-[state=indeterminate]:border-[--action-primary-bg]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            hasError && 'border-[--color-danger-border] data-[state=unchecked]:border-[--color-danger-border]',
          )}
        >
          <CheckboxPrimitive.Indicator className="flex items-center justify-center text-white">
            {checked === 'indeterminate'
              ? <Minus className={iconSize} strokeWidth={3} aria-hidden />
              : <Check className={iconSize} strokeWidth={3} aria-hidden />
            }
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>

        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'leading-none cursor-pointer select-none text-[--text-primary]',
              size === 'sm' ? 'text-xs pt-px' : 'text-sm pt-0.5',
              disabled && 'opacity-50 cursor-not-allowed',
            )}
          >
            {label}
            {required && <span className="ml-0.5 text-[--color-danger-text]" aria-hidden>*</span>}
          </label>
        )}
      </div>

      {hint && !hasError && (
        <p id={hintId} className={cn('text-[--text-secondary]', label ? 'ml-6' : '', 'text-xs')}>{hint}</p>
      )}
      {hasError && (
        <p id={errorId} className={cn('text-[--color-danger-text]', label ? 'ml-6' : '', 'text-xs')} role="alert">{error}</p>
      )}
    </div>
  )
}

Checkbox.displayName = 'Checkbox'
export { Checkbox }
