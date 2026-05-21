'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * KPITile — the workhorse data tile.
 *
 *   label    — small uppercase mono caption
 *   value    — large mono numeric (per typography tokens)
 *   sub      — optional smaller secondary value
 *   delta    — optional ± delta with up/down/flat indicator
 *   trend    — optional inline sparkline (kept as ReactNode slot; real
 *              Sparkline component lives in System 6b dashboard)
 *
 * Density-aware: dense mode tightens padding; comfortable mode breathes.
 */

export const kpiVariants = cva(
  'rounded-md border bg-bg-elevated transition-colors duration-fast',
  {
    variants: {
      variant: {
        default: 'border-line',
        accent: 'border-accent-soft bg-accent-soft',
        ghost: 'border-transparent bg-transparent',
      },
      size: {
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-5',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  },
);

export interface KPITileProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof kpiVariants> {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  delta?: { value: string | number; direction: 'up' | 'down' | 'flat' };
  trend?: React.ReactNode;
}

const DELTA_COLOR = {
  up: 'text-success',
  down: 'text-danger',
  flat: 'text-fg-muted',
};

const DELTA_ICON = {
  up: TrendingUp,
  down: TrendingDown,
  flat: Minus,
};

export const KPITile = React.forwardRef<HTMLDivElement, KPITileProps>(
  function KPITile(
    { className, variant, size, label, value, sub, delta, trend, ...props },
    ref,
  ) {
    const DeltaIcon = delta ? DELTA_ICON[delta.direction] : null;
    return (
      <div ref={ref} className={cn(kpiVariants({ variant, size }), className)} {...props}>
        <div className="font-mono text-2xs uppercase tracking-widest text-fg-muted mb-1.5">
          {label}
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <div className="font-numeric text-2xl tabular-nums tracking-tight text-fg leading-none">
            {value}
          </div>
          {trend}
        </div>
        {(sub || delta) && (
          <div className="flex items-center justify-between gap-3 mt-2">
            {sub && (
              <div className="text-xs text-fg-muted truncate">{sub}</div>
            )}
            {delta && DeltaIcon && (
              <div
                className={cn(
                  'flex items-center gap-1 font-mono text-2xs tabular-nums',
                  DELTA_COLOR[delta.direction],
                )}
              >
                <DeltaIcon size={12} aria-hidden />
                {delta.value}
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
);
