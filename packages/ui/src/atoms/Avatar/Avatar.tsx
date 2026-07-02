import * as React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { cn } from '../../utils/cn'

// ── Size map ──────────────────────────────────────────────────────────────────
const SIZE: Record<string, string> = {
  xs: 'h-6  w-6  text-[10px]',
  sm: 'h-8  w-8  text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
}

const STATUS_COLOUR: Record<string, string> = {
  online:  'bg-[--color-success-icon]',
  away:    'bg-[--color-warning-icon]',
  offline: 'bg-[--primitive-zinc-400]',
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

// ── Props ─────────────────────────────────────────────────────────────────────
export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  src?:    string
  /** Used for alt text and initials fallback */
  name?:   string
  size?:   'xs' | 'sm' | 'md' | 'lg' | 'xl'
  status?: 'online' | 'away' | 'offline'
}

// ── Component ─────────────────────────────────────────────────────────────────
const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ src, name = '', size = 'md', status, className, ...props }, ref) => (
    <span className="relative inline-flex shrink-0">
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center',
          'rounded-full overflow-hidden select-none',
          'bg-[--primitive-blue-100] text-[--primitive-blue-700]',
          'font-semibold',
          SIZE[size],
          className
        )}
        {...props}
      >
        <AvatarPrimitive.Image
          src={src}
          alt={name}
          className="h-full w-full object-cover"
        />
        <AvatarPrimitive.Fallback
          className="flex h-full w-full items-center justify-center"
          delayMs={300}
        >
          {name ? initials(name) : '?'}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>

      {status && (
        <span
          aria-label={`Status: ${status}`}
          className={cn(
            'absolute bottom-0 right-0 rounded-full ring-2 ring-[--surface-page]',
            STATUS_COLOUR[status],
            size === 'xs' ? 'h-1.5 w-1.5' :
            size === 'sm' ? 'h-2   w-2'   :
            size === 'lg' ? 'h-3   w-3'   :
            size === 'xl' ? 'h-3.5 w-3.5' :
                            'h-2.5 w-2.5'
          )}
        />
      )}
    </span>
  )
)
Avatar.displayName = 'Avatar'

export { Avatar }
