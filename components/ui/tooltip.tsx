'use client';

import * as React from 'react';
import * as RT from '@radix-ui/react-tooltip';
import { cn } from '@/lib/cn';

/**
 * Tooltip — themed Radix wrapper.
 *
 * Default delay 200ms (fast). Mono small label inside a bg-overlay tile.
 * Use sparingly — business-app tooltips should be terse.
 */

export const TooltipProvider = ({
  delayDuration = 200,
  ...props
}: React.ComponentPropsWithoutRef<typeof RT.Provider>) => (
  <RT.Provider delayDuration={delayDuration} {...props} />
);

export const Tooltip = RT.Root;
export const TooltipTrigger = RT.Trigger;

export const TooltipContent = React.forwardRef<
  React.ElementRef<typeof RT.Content>,
  React.ComponentPropsWithoutRef<typeof RT.Content>
>(function TooltipContent({ className, sideOffset = 6, children, ...props }, ref) {
  return (
    <RT.Portal>
      <RT.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          'z-toast max-w-xs px-2 py-1 rounded-sm border border-line shadow-2',
          'bg-bg-overlay backdrop-blur-md text-fg',
          'font-mono text-2xs leading-tight',
          'data-[state=delayed-open]:animate-in data-[state=closed]:animate-out',
          'data-[state=delayed-open]:fade-in data-[state=closed]:fade-out',
          className,
        )}
        {...props}
      >
        {children}
      </RT.Content>
    </RT.Portal>
  );
});

/** Sugar — common pattern of {trigger} + {content} in one call. */
export interface SimpleTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}
export function SimpleTooltip({ content, children, side = 'top', align = 'center' }: SimpleTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} align={align}>
        {content}
      </TooltipContent>
    </Tooltip>
  );
}
