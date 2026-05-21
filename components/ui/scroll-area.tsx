'use client';

import * as React from 'react';
import * as RSA from '@radix-ui/react-scroll-area';
import { cn } from '@/lib/cn';

export const ScrollArea = React.forwardRef<
  React.ElementRef<typeof RSA.Root>,
  React.ComponentPropsWithoutRef<typeof RSA.Root>
>(function ScrollArea({ className, children, ...props }, ref) {
  return (
    <RSA.Root
      ref={ref}
      className={cn('relative overflow-hidden', className)}
      {...props}
    >
      <RSA.Viewport className="h-full w-full">{children}</RSA.Viewport>
      <ScrollBar />
      <RSA.Corner />
    </RSA.Root>
  );
});

export const ScrollBar = React.forwardRef<
  React.ElementRef<typeof RSA.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof RSA.ScrollAreaScrollbar>
>(function ScrollBar({ className, orientation = 'vertical', ...props }, ref) {
  return (
    <RSA.ScrollAreaScrollbar
      ref={ref}
      orientation={orientation}
      className={cn(
        'flex touch-none select-none transition-colors duration-fast',
        orientation === 'vertical' && 'h-full w-2 p-px',
        orientation === 'horizontal' && 'h-2 flex-col p-px',
        className,
      )}
      {...props}
    >
      <RSA.ScrollAreaThumb className="relative flex-1 rounded-pill bg-line-strong hover:bg-fg-subtle transition-colors duration-fast" />
    </RSA.ScrollAreaScrollbar>
  );
});
