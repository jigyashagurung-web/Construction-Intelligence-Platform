import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../utils/cn'

// ── Input shell variants ───────────────────────────────────────────────────────
const inputShellVariants = cva(
  [
    'relative flex items-center w-full',
    'rounded-[--input-radius] border bg-[--input-bg]',
    'transition-colors',
    'focus-within:border-[--input-border-focus] focus-within:ring-1 focus-within:ring-[--input-border-focus]',
    'has-[:disabled]:opacity-50 has-[:disabled]:cursor-not-allowed',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'h-8  text-xs',
        md: 'h-10 text-sm',
        lg: 'h-12 text-base',
      },
      state: {
        default: 'border-[--input-border]',
        error:   'border-[--input-border-error] focus-within:border-[--input-border-error] focus-within:ring-[--input-border-error]',
      },
    },
    defaultVariants: { size: 'md', state: 'default' },
  }
)

// ── Types ─────────────────────────────────────────────────────────────────────
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputShellVariants> {
  /** Visible label rendered above the input */
  label?:       string
  /** Helper text shown below the input */
  hint?:        string
  /** Error message — replaces hint and sets error state */
  error?:       string
  /** Icon rendered inside the left edge */
  iconLeft?:    React.ReactNode
  /** Icon rendered inside the right edge */
  iconRight?:   React.ReactNode
  /** Short text prefix inside the input (e.g. "NPR", "m²") */
  prefix?:      string
  /** Short text suffix inside the input (e.g. "%", "bags") */
  suffix?:      string
  /** Additional class applied to the outer wrapper div */
  wrapperClassName?: string
}

// ── Component ─────────────────────────────────────────────────────────────────
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      wrapperClassName,
      label,
      hint,
      error,
      iconLeft,
      iconRight,
      prefix,
      suffix,
      size,
      id,
      disabled,
      required,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const inputId = id ?? React.useId()
    const hintId  = `${inputId}-hint`
    const errorId = `${inputId}-error`
    const hasError = Boolean(error)

    return (
      <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
        {/* Label */}
        {label && (
          <LabelPrimitive.Root
            htmlFor={inputId}
            className="text-[--text-label] font-medium leading-none text-sm"
          >
            {label}
            {required && (
              <span className="ml-1 text-[--color-danger-icon]" aria-hidden="true">
                *
              </span>
            )}
          </LabelPrimitive.Root>
        )}

        {/* Shell */}
        <div
          className={cn(
            inputShellVariants({ size, state: hasError ? 'error' : 'default' })
          )}
        >
          {/* Left icon */}
          {iconLeft && (
            <span
              className="pointer-events-none absolute left-3 flex items-center text-[--text-tertiary]"
              aria-hidden="true"
            >
              {iconLeft}
            </span>
          )}

          {/* Prefix */}
          {prefix && !iconLeft && (
            <span className="pointer-events-none pl-3 text-[--text-tertiary] select-none shrink-0 text-sm">
              {prefix}
            </span>
          )}

          {/* Native input */}
          <input
            id={inputId}
            ref={ref}
            type={type}
            disabled={disabled}
            required={required}
            aria-invalid={hasError || undefined}
            aria-describedby={
              error   ? errorId
              : hint  ? hintId
              : undefined
            }
            className={cn(
              'flex-1 bg-transparent outline-none px-3',
              'text-[--input-text] placeholder:text-[--input-placeholder]',
              'disabled:cursor-not-allowed',
              iconLeft  && 'pl-9',
              iconRight && 'pr-9',
              prefix    && !iconLeft && 'pl-1',
              suffix    && !iconRight && 'pr-1',
              className
            )}
            {...props}
          />

          {/* Suffix */}
          {suffix && !iconRight && (
            <span className="pointer-events-none pr-3 text-[--text-tertiary] select-none shrink-0 text-sm">
              {suffix}
            </span>
          )}

          {/* Right icon */}
          {iconRight && (
            <span
              className="pointer-events-none absolute right-3 flex items-center text-[--text-tertiary]"
              aria-hidden="true"
            >
              {iconRight}
            </span>
          )}
        </div>

        {/* Hint / Error */}
        {error ? (
          <p id={errorId} role="alert" className="text-xs text-[--color-danger-text]">
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className="text-xs text-[--text-secondary]">
            {hint}
          </p>
        ) : null}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
