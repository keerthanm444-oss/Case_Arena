'use client';

import * as React from 'react';
import * as RP from '@radix-ui/react-progress';
import { cn } from '@/lib/cn';

export interface ProgressProps extends React.ComponentPropsWithoutRef<typeof RP.Root> {
  value?: number;
  /** 0-100 */
  max?: number;
  tone?: 'accent' | 'success' | 'warning' | 'danger';
}

const TONE: Record<NonNullable<ProgressProps['tone']>, string> = {
  accent: 'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
};

export const Progress = React.forwardRef<React.ElementRef<typeof RP.Root>, ProgressProps>(
  function Progress({ className, value = 0, max = 100, tone = 'accent', ...props }, ref) {
    const pct = Math.min(100, Math.max(0, (value / max) * 100));
    return (
      <RP.Root
        ref={ref}
        className={cn(
          'relative h-1.5 w-full overflow-hidden rounded-pill bg-bg-panel',
          className,
        )}
        value={value}
        max={max}
        {...props}
      >
        <RP.Indicator
          className={cn(
            'h-full transition-transform duration-base ease-out-custom',
            TONE[tone],
          )}
          style={{ transform: `translateX(-${100 - pct}%)` }}
        />
      </RP.Root>
    );
  },
);
