import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

// ── Re-exports ────────────────────────────────────────────────────────────────

export const Dialog        = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose   = DialogPrimitive.Close
export const DialogPortal  = DialogPrimitive.Portal

export type DialogProps    = DialogPrimitive.DialogProps

// ── Overlay ───────────────────────────────────────────────────────────────────

export const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px]',
      'data-[state=open]:animate-in   data-[state=open]:fade-in-0',
      'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
      className,
    )}
    {...props}
  />
))
DialogOverlay.displayName = 'DialogOverlay'

// ── Content ───────────────────────────────────────────────────────────────────

const MODAL_SIZE = {
  sm:   'max-w-sm',
  md:   'max-w-lg',
  lg:   'max-w-2xl',
  xl:   'max-w-4xl',
  full: 'max-w-[calc(100vw-2rem)]',
} as const

export interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  /** `modal` = centred overlay. `drawer` = right-side panel */
  variant?: 'modal' | 'drawer'
  /** Modal width (ignored for drawer) */
  size?:    keyof typeof MODAL_SIZE
  /** Show X close button in top-right corner */
  showClose?: boolean
}

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, variant = 'modal', size = 'md', showClose = true, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed z-50 bg-[--surface-card] shadow-[--shadow-xl] outline-none',
        variant === 'modal' && [
          'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
          'w-full rounded-2xl p-0 overflow-hidden',
          MODAL_SIZE[size],
          'data-[state=open]:animate-in   data-[state=open]:fade-in-0  data-[state=open]:zoom-in-95',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
        ],
        variant === 'drawer' && [
          'right-0 top-0 h-full w-full max-w-md rounded-l-2xl',
          'data-[state=open]:animate-in   data-[state=open]:slide-in-from-right',
          'data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right',
        ],
        className,
      )}
      {...props}
    >
      {children}
      {showClose && (
        <DialogPrimitive.Close
          className={cn(
            'absolute z-10 flex h-8 w-8 items-center justify-center rounded-lg',
            'text-[--text-tertiary] hover:text-[--text-primary] hover:bg-[--surface-hover]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--focus-ring]',
            'transition-colors',
            variant === 'modal'  && 'right-4 top-4',
            variant === 'drawer' && 'right-4 top-4',
          )}
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" aria-hidden />
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = 'DialogContent'

// ── Layout sub-components ─────────────────────────────────────────────────────

export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Show a bottom border separating header from body */
  bordered?: boolean
}

export function DialogHeader({ className, bordered = false, ...props }: DialogHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1 px-6 py-5',
        bordered && 'border-b border-[--border-subtle]',
        className,
      )}
      {...props}
    />
  )
}
DialogHeader.displayName = 'DialogHeader'

export function DialogBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex-1 overflow-y-auto px-6 py-5', className)}
      {...props}
    />
  )
}
DialogBody.displayName = 'DialogBody'

export interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Show a top border separating footer from body */
  bordered?: boolean
}

export function DialogFooter({ className, bordered = true, ...props }: DialogFooterProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 px-6 py-4',
        bordered && 'border-t border-[--border-subtle]',
        className,
      )}
      {...props}
    />
  )
}
DialogFooter.displayName = 'DialogFooter'

export const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-base font-semibold text-[--text-primary] pr-8', className)}
    {...props}
  />
))
DialogTitle.displayName = 'DialogTitle'

export const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-[--text-secondary]', className)}
    {...props}
  />
))
DialogDescription.displayName = 'DialogDescription'
