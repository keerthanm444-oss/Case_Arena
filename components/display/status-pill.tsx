'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

/**
 * StatusPill — compact uppercase mono label.
 *
 * Tones map to semantic state. Sizes match the existing .pill class
 * (which stays in globals.css as a fallback for non-React contexts like
 * inline MDX shortcuts).
 */

export const pillVariants = cva(
  'inline-flex items-center gap-1 rounded-pill border font-mono uppercase tracking-wider whitespace-nowrap transition-colors duration-fast',
  {
    variants: {
      tone: {
        neutral: 'border-line bg-bg-panel text-fg-muted',
        accent: 'border-accent-soft bg-accent-soft text-accent',
        success: 'border-success/30 bg-success/10 text-success',
        warning: 'border-warning/30 bg-warning/10 text-warning',
        danger: 'border-danger/30 bg-danger/10 text-danger',
        info: 'border-info/30 bg-info/10 text-info',
        outline: 'border-line-strong bg-transparent text-fg-muted',
      },
      size: {
        xs: 'px-1.5 py-0 text-2xs h-4',
        sm: 'px-2 py-0.5 text-2xs h-5',
        md: 'px-2.5 py-0.5 text-2xs h-6',
      },
    },
    defaultVariants: { tone: 'neutral', size: 'sm' },
  },
);

export interface StatusPillProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof pillVariants> {
  /** Optional leading dot indicator */
  dot?: boolean;
}

export const StatusPill = React.forwardRef<HTMLSpanElement, StatusPillProps>(
  function StatusPill({ className, tone, size, dot, children, ...props }, ref) {
    return (
      <span ref={ref} className={cn(pillVariants({ tone, size }), className)} {...props}>
        {dot && (
          <span
            className="w-1.5 h-1.5 rounded-full bg-current"
            aria-hidden
          />
        )}
        {children}
      </span>
    );
  },
);
