import * as React from 'react'
import { Slot }        from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 }     from 'lucide-react'
import { cn }          from '../../utils/cn'

// ── Variants ──────────────────────────────────────────────────────────────────
// All colour values use CSS custom properties so they respond to
// data-theme switches without re-rendering.
const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'font-medium rounded-[--button-radius]',
    'ring-offset-[--surface-page] transition-colors',
    'focus-visible:outline-none focus-visible:ring-2',
    'focus-visible:ring-[--border-focus] focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'select-none',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: [
          'bg-[--button-primary-bg] text-[--button-primary-text]',
          'hover:bg-[--button-primary-bg-hover]',
          'active:bg-[--button-primary-bg-active]',
        ].join(' '),
        secondary: [
          'border border-[--button-secondary-border] bg-transparent',
          'text-[--text-primary]',
          'hover:bg-[--surface-hover] active:bg-[--surface-active]',
        ].join(' '),
        ghost: [
          'bg-transparent text-[--text-primary]',
          'hover:bg-[--surface-hover] active:bg-[--surface-active]',
        ].join(' '),
        destructive: [
          'bg-[--color-danger-600] text-white',
          'hover:bg-[--color-danger-700]',
        ].join(' '),
        link: [
          'text-[--text-link] underline-offset-4',
          'hover:underline hover:text-[--text-link-hover]',
          'h-auto px-0 py-0',
        ].join(' '),
      },
      size: {
        sm:   'h-8  px-3   text-xs',
        md:   'h-10 px-4   text-sm',
        lg:   'h-12 px-6   text-base',
        icon: 'h-10 w-10  text-sm',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size:    'md',
    },
  }
)

// ── Props ─────────────────────────────────────────────────────────────────────
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as a child element (Radix Slot pattern — useful for Next.js Link) */
  asChild?:   boolean
  /** Show a spinner and mark as aria-busy. Implies disabled. */
  loading?:   boolean
  /** Icon rendered before children */
  iconLeft?:  React.ReactNode
  /** Icon rendered after children */
  iconRight?: React.ReactNode
}

// ── Component ─────────────────────────────────────────────────────────────────
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild   = false,
      loading   = false,
      disabled,
      iconLeft,
      iconRight,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <>
            <Loader2
              className="h-4 w-4 animate-spin"
              aria-hidden="true"
            />
            <span className="sr-only">Loading</span>
          </>
        ) : (
          iconLeft && (
            <span className="shrink-0" aria-hidden="true">
              {iconLeft}
            </span>
          )
        )}

        {children}

        {!loading && iconRight && (
          <span className="shrink-0" aria-hidden="true">
            {iconRight}
          </span>
        )}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
