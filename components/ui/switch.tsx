'use client';

import * as React from 'react';
import * as RS from '@radix-ui/react-switch';
import { cn } from '@/lib/cn';

export const Switch = React.forwardRef<
  React.ElementRef<typeof RS.Root>,
  React.ComponentPropsWithoutRef<typeof RS.Root>
>(function Switch({ className, ...props }, ref) {
  return (
    <RS.Root
      ref={ref}
      className={cn(
        'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-pill border border-line',
        'transition-colors duration-fast',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ring-offset)]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:bg-accent data-[state=checked]:border-accent',
        'data-[state=unchecked]:bg-bg-panel',
        className,
      )}
      {...props}
    >
      <RS.Thumb
        className={cn(
          'pointer-events-none block h-4 w-4 rounded-full',
          'transition-transform duration-fast',
          'bg-fg-inverse shadow-sm',
          'data-[state=checked]:translate-x-[18px] data-[state=unchecked]:translate-x-0.5',
          'data-[state=checked]:bg-accent-fg',
          'data-[state=unchecked]:bg-fg-muted',
        )}
      />
    </RS.Root>
  );
});
