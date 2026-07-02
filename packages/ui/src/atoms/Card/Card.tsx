import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../utils/cn'

// ── Root ──────────────────────────────────────────────────────────────────────

const cardVariants = cva(
  'flex flex-col rounded-xl bg-[--surface-card] overflow-hidden',
  {
    variants: {
      variant: {
        default:  'border border-[--border-default]',
        flat:     '',
        elevated: 'shadow-[--shadow-md]',
      },
      padding: {
        none: '',
        sm:   '',
        md:   '',
        lg:   '',
      },
    },
    defaultVariants: { variant: 'default', padding: 'none' },
  },
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /** Render as a clickable element */
  asButton?: boolean
}

export function Card({ variant, padding, asButton, className, ...props }: CardProps) {
  if (asButton) {
    return (
      <div
        role="button"
        tabIndex={0}
        className={cn(
          cardVariants({ variant, padding }),
          'cursor-pointer transition-all hover:border-[--border-strong] hover:shadow-[--shadow-md]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--focus-ring]',
          className,
        )}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            ;(e.currentTarget as HTMLElement).click()
          }
        }}
        {...props}
      />
    )
  }
  return <div className={cn(cardVariants({ variant, padding }), className)} {...props} />
}
Card.displayName = 'Card'

// ── Header ────────────────────────────────────────────────────────────────────

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  bordered?: boolean
}

export function CardHeader({ bordered = false, className, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 px-5 py-4',
        bordered && 'border-b border-[--border-subtle]',
        className,
      )}
      {...props}
    />
  )
}
CardHeader.displayName = 'CardHeader'

// ── Title (inside CardHeader) ─────────────────────────────────────────────────

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-sm font-semibold text-[--text-primary]', className)} {...props} />
  )
}
CardTitle.displayName = 'CardTitle'

// ── Body ──────────────────────────────────────────────────────────────────────

const BODY_PADDING = { none: '', sm: 'p-3', md: 'p-5', lg: 'p-6' } as const

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: keyof typeof BODY_PADDING
}

export function CardBody({ padding = 'md', className, ...props }: CardBodyProps) {
  return <div className={cn(BODY_PADDING[padding], className)} {...props} />
}
CardBody.displayName = 'CardBody'

// ── Footer ────────────────────────────────────────────────────────────────────

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  bordered?: boolean
}

export function CardFooter({ bordered = true, className, ...props }: CardFooterProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-5 py-3.5',
        bordered && 'border-t border-[--border-subtle]',
        className,
      )}
      {...props}
    />
  )
}
CardFooter.displayName = 'CardFooter'
