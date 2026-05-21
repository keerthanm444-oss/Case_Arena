'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';
import { useAssumptions, evalFormula } from './AssumptionContext';

/**
 * <LiveNumber compute="revenue - cost" prefix="$" suffix="M" decimals={1} />
 *
 * Reads from the AssumptionContext, evaluates the formula via the safe
 * expression parser. Re-renders whenever any referenced assumption updates.
 *
 * The formula supports:
 *   - + - * / %
 *   - Parentheses
 *   - Named functions: min, max, round, abs, floor, ceil, pow
 *   - Identifiers must resolve to a registered assumption name
 */

export interface LiveNumberProps {
  compute: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  /** Tone for the visual emphasis — large numbers tend to want "accent" */
  tone?: 'inherit' | 'accent' | 'success' | 'danger';
  /** Render larger (e.g. as a hero KPI) */
  large?: boolean;
  /** Override label shown above */
  label?: string;
}

const TONE_CLASS: Record<NonNullable<LiveNumberProps['tone']>, string> = {
  inherit: '',
  accent: 'text-accent',
  success: 'text-success',
  danger: 'text-danger',
};

export function LiveNumber({
  compute,
  prefix,
  suffix,
  decimals = 0,
  tone = 'inherit',
  large,
  label,
}: LiveNumberProps) {
  const ctx = useAssumptions();
  const value = React.useMemo(
    () => evalFormula(compute, (name) => ctx.asNumber(name)),
    [compute, ctx],
  );
  const ok = Number.isFinite(value);

  const formatted = ok
    ? formatBig(value, decimals)
    : '—';

  if (large) {
    return (
      <span
        className={cn(
          'inline-flex flex-col items-baseline gap-0.5',
          'font-numeric tabular-nums',
          TONE_CLASS[tone],
        )}
      >
        {label && (
          <span className="font-mono text-2xs uppercase tracking-widest text-fg-muted">
            {label}
          </span>
        )}
        <span className="text-2xl leading-none">
          {prefix}
          {formatted}
          {suffix}
        </span>
      </span>
    );
  }
  return (
    <span
      className={cn(
        'font-numeric tabular-nums px-1 -mx-0.5 rounded-sm',
        'bg-bg-panel border border-line',
        TONE_CLASS[tone],
      )}
      title={ok ? undefined : `Could not evaluate: ${compute}`}
    >
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

function formatBig(v: number, decimals: number): string {
  const abs = Math.abs(v);
  if (abs >= 1e12) return `${(v / 1e12).toFixed(decimals)}T`;
  if (abs >= 1e9) return `${(v / 1e9).toFixed(decimals)}B`;
  if (abs >= 1e6) return `${(v / 1e6).toFixed(decimals)}M`;
  if (abs >= 1e3) return `${(v / 1e3).toFixed(decimals)}K`;
  return v.toFixed(decimals);
}
