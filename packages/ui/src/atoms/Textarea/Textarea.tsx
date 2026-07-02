import * as React from 'react'
import { cn } from '../../utils/cn'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?:      React.ReactNode
  hint?:       string
  error?:      string
  size?:       'sm' | 'md' | 'lg'
  /** Grow to fit content up to maxRows */
  autoResize?: boolean
  /** Minimum visible rows */
  rows?:       number
  /** Max rows before scrolling (only when autoResize=true) */
  maxRows?:    number
  id?:         string
}

// ── Component ─────────────────────────────────────────────────────────────────

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      hint,
      error,
      size = 'md',
      autoResize = false,
      rows = 3,
      maxRows,
      id,
      required,
      disabled,
      className,
      onChange,
      ...rest
    },
    ref,
  ) => {
    const generatedId = React.useId()
    const inputId     = id ?? generatedId
    const errorId     = `${inputId}-error`
    const hintId      = `${inputId}-hint`
    const hasError    = Boolean(error)
    const describedBy = [hasError ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ')

    // Auto-resize: adjust scrollHeight on change
    const innerRef = React.useRef<HTMLTextAreaElement | null>(null)

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (autoResize && innerRef.current) {
          const el = innerRef.current
          el.style.height = 'auto'
          const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 20
          const maxH = maxRows ? maxRows * lineHeight + 20 : Infinity
          el.style.height = `${Math.min(el.scrollHeight, maxH)}px`
          el.style.overflowY = el.scrollHeight > maxH ? 'auto' : 'hidden'
        }
        onChange?.(e)
      },
      [autoResize, maxRows, onChange],
    )

    const setRefs = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        innerRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node
      },
      [ref],
    )

    const paddingClass = size === 'sm' ? 'px-2.5 py-1.5 text-xs' : size === 'lg' ? 'px-4 py-3 text-base' : 'px-3 py-2.5 text-sm'

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[--text-primary]">
            {label}
            {required && <span className="ml-0.5 text-[--color-danger-text]" aria-hidden>*</span>}
          </label>
        )}

        <textarea
          ref={setRefs}
          id={inputId}
          rows={rows}
          disabled={disabled}
          required={required}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy || undefined}
          onChange={handleChange}
          className={cn(
            'w-full rounded-lg border bg-[--surface-input]',
            'text-[--text-primary] placeholder:text-[--text-placeholder]',
            'transition-colors outline-none resize-y',
            'focus:ring-2 focus:ring-[--focus-ring] focus:border-[--border-focus]',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:resize-none',
            paddingClass,
            hasError
              ? 'border-[--color-danger-border] hover:border-[--color-danger-border]'
              : 'border-[--border-default] hover:border-[--border-strong]',
            autoResize && 'resize-none overflow-hidden',
            className,
          )}
          {...rest}
        />

        {hint && !hasError && (
          <p id={hintId} className="text-xs text-[--text-secondary]">{hint}</p>
        )}
        {hasError && (
          <p id={errorId} className="text-xs text-[--color-danger-text]" role="alert">{error}</p>
        )}
      </div>
    )
  },
)

Textarea.displayName = 'Textarea'
export { Textarea }
