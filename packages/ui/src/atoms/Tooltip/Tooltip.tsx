import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cn } from '../../utils/cn'

// Re-export provider so AppShell / preview can wrap once at the root
const TooltipProvider = TooltipPrimitive.Provider

// ── Props ─────────────────────────────────────────────────────────────────────
export interface TooltipProps {
  /** Content shown inside the tooltip */
  content:        React.ReactNode
  /** The trigger element */
  children:       React.ReactNode
  side?:          'top' | 'right' | 'bottom' | 'left'
  align?:         'start' | 'center' | 'end'
  /** ms before tooltip opens. Default 400. */
  delayDuration?: number
  /** Disable the tooltip without removing it from the tree */
  disabled?:      boolean
  className?:     string
}

// ── Component ─────────────────────────────────────────────────────────────────
function Tooltip({
  content,
  children,
  side          = 'top',
  align         = 'center',
  delayDuration = 400,
  disabled      = false,
  className,
}: TooltipProps) {
  if (disabled) return <>{children}</>

  return (
    <TooltipPrimitive.Root delayDuration={delayDuration}>
      <TooltipPrimitive.Trigger asChild>
        {children}
      </TooltipPrimitive.Trigger>

      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          align={align}
          sideOffset={6}
          className={cn(
            'z-50 overflow-hidden rounded-md',
            'bg-[--primitive-zinc-900] px-3 py-1.5',
            'text-xs font-medium text-[--primitive-zinc-50]',
            'shadow-md',
            'animate-fade-in',
            // Exit handled by Radix data-state
            'data-[state=closed]:animate-none',
            className
          )}
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-[--primitive-zinc-900]" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}

export { Tooltip, TooltipProvider }
