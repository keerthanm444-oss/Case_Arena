'use client';

import * as React from 'react';
import * as RD from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

export const Dialog = RD.Root;
export const DialogTrigger = RD.Trigger;
export const DialogPortal = RD.Portal;
export const DialogClose = RD.Close;

export const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof RD.Overlay>,
  React.ComponentPropsWithoutRef<typeof RD.Overlay>
>(function DialogOverlay({ className, ...props }, ref) {
  return (
    <RD.Overlay
      ref={ref}
      className={cn(
        'fixed inset-0 z-modal bg-bg/70 backdrop-blur-sm',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=open]:fade-in data-[state=closed]:fade-out',
        className,
      )}
      {...props}
    />
  );
});

/**
 * DialogContent variants:
 *   center — modal in middle of viewport
 *   right  — sheet from right edge (drawer)
 *   left   — sheet from left edge
 *   bottom — sheet from bottom (mobile-friendly)
 */
export const dialogVariants = cva(
  'fixed z-modal bg-bg-elevated border-line text-fg shadow-overlay focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out',
  {
    variants: {
      side: {
        center: [
          'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
          'w-full max-w-lg rounded-md border',
          'data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95',
          'data-[state=open]:fade-in data-[state=closed]:fade-out',
        ].join(' '),
        right: [
          'right-0 top-0 h-full',
          'w-full sm:max-w-md border-l',
          'data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right',
        ].join(' '),
        left: [
          'left-0 top-0 h-full',
          'w-full sm:max-w-md border-r',
          'data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left',
        ].join(' '),
        bottom: [
          'left-0 bottom-0 w-full',
          'max-h-[85vh] border-t rounded-t-lg',
          'data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom',
        ].join(' '),
      },
    },
    defaultVariants: { side: 'center' },
  },
);

export interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof RD.Content>,
    VariantProps<typeof dialogVariants> {
  hideClose?: boolean;
}

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof RD.Content>,
  DialogContentProps
>(function DialogContent({ side, className, hideClose, children, ...props }, ref) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <RD.Content
        ref={ref}
        className={cn(dialogVariants({ side }), className)}
        {...props}
      >
        {children}
        {!hideClose && (
          <RD.Close
            className={cn(
              'absolute top-3 right-3 rounded-sm p-1',
              'text-fg-muted hover:text-fg hover:bg-bg-panel',
              'transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
            )}
            aria-label="Close"
          >
            <X size={16} />
          </RD.Close>
        )}
      </RD.Content>
    </DialogPortal>
  );
});

export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col gap-1.5 p-5 border-b border-line', className)} {...props} />
);

export const DialogBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-5', className)} {...props} />
);

export const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex items-center justify-end gap-2 p-4 border-t border-line',
      className,
    )}
    {...props}
  />
);

export const DialogTitle = React.forwardRef<
  React.ElementRef<typeof RD.Title>,
  React.ComponentPropsWithoutRef<typeof RD.Title>
>(function DialogTitle({ className, ...props }, ref) {
  return (
    <RD.Title
      ref={ref}
      className={cn('text-md text-fg leading-snug', className)}
      {...props}
    />
  );
});

export const DialogDescription = React.forwardRef<
  React.ElementRef<typeof RD.Description>,
  React.ComponentPropsWithoutRef<typeof RD.Description>
>(function DialogDescription({ className, ...props }, ref) {
  return (
    <RD.Description
      ref={ref}
      className={cn('text-sm text-fg-muted leading-normal', className)}
      {...props}
    />
  );
});
