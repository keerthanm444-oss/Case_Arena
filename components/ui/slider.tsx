'use client';

import * as React from 'react';
import * as RSL from '@radix-ui/react-slider';
import { cn } from '@/lib/cn';

/**
 * Slider — Radix-wrapped.
 *
 * Critical surface: every case-page slider, decision-tree probability,
 * and market-sizing assumption is one of these. Designed to feel
 * frictionless under rapid manipulation.
 */

export const Slider = React.forwardRef<
  React.ElementRef<typeof RSL.Root>,
  React.ComponentPropsWithoutRef<typeof RSL.Root>
>(function Slider({ className, ...props }, ref) {
  return (
    <RSL.Root
      ref={ref}
      className={cn(
        'relative flex w-full touch-none select-none items-center',
        'h-5',
        className,
      )}
      {...props}
    >
      <RSL.Track className="relative h-1 w-full grow overflow-hidden rounded-pill bg-bg-panel">
        <RSL.Range className="absolute h-full bg-accent" />
      </RSL.Track>
      {/* Render a thumb for each value (single or range) */}
      {(props.value ?? props.defaultValue ?? [0]).map((_, i) => (
        <RSL.Thumb
          key={i}
          className={cn(
            'block h-4 w-4 rounded-full border-2 border-accent bg-bg-elevated',
            'transition-colors duration-fast',
            'hover:bg-accent-soft',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ring-offset)]',
            'disabled:pointer-events-none disabled:opacity-50',
          )}
          aria-label={`Slider thumb ${i + 1}`}
        />
      ))}
    </RSL.Root>
  );
});
