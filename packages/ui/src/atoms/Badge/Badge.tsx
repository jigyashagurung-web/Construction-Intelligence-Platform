import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../utils/cn'

const badgeVariants = cva(
  [
    'inline-flex items-center gap-1.5 rounded-[--badge-radius]',
    'font-semibold leading-none transition-colors',
    'border',
  ].join(' '),
  {
    variants: {
      variant: {
        default:  'border-[--border-default] bg-[--surface-hover] text-[--text-primary]',
        primary:  'border-[--primitive-blue-200] bg-[--primitive-blue-50] text-[--primitive-blue-700]',
        success:  'border-[--color-success-border] bg-[--color-success-bg] text-[--color-success-text]',
        warning:  'border-[--color-warning-border] bg-[--color-warning-bg] text-[--color-warning-text]',
        danger:   'border-[--color-danger-border]  bg-[--color-danger-bg]  text-[--color-danger-text]',
        info:     'border-[--color-info-border]    bg-[--color-info-bg]    text-[--color-info-text]',
        outline:  'border-[--border-strong] bg-transparent text-[--text-secondary]',
      },
      size: {
        sm: 'px-1.5 py-0.5 text-[10px]',
        md: 'px-2   py-1   text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size:    'md',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Optional leading dot (colour matches variant) */
  dot?: boolean
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, dot = false, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {dot && (
        <span
          className="h-1.5 w-1.5 rounded-full bg-current shrink-0"
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
)
Badge.displayName = 'Badge'

export { Badge, badgeVariants }
