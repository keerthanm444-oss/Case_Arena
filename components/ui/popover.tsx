'use client';

import * as React from 'react';
import * as RP from '@radix-ui/react-popover';
import { cn } from '@/lib/cn';

export const Popover = RP.Root;
export const PopoverTrigger = RP.Trigger;
export const PopoverClose = RP.Close;
export const PopoverAnchor = RP.Anchor;

export const PopoverContent = React.forwardRef<
  React.ElementRef<typeof RP.Content>,
  React.ComponentPropsWithoutRef<typeof RP.Content>
>(function PopoverContent({ className, sideOffset = 6, align = 'center', children, ...props }, ref) {
  return (
    <RP.Portal>
      <RP.Content
        ref={ref}
        sideOffset={sideOffset}
        align={align}
        className={cn(
          'z-overlay min-w-[200px] rounded-md border border-line shadow-3',
          'bg-bg-overlay backdrop-blur-md text-fg',
          'p-3',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=open]:fade-in data-[state=closed]:fade-out',
          'data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1',
          className,
        )}
        {...props}
      >
        {children}
      </RP.Content>
    </RP.Portal>
  );
});
