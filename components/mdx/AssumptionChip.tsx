'use client';

import * as React from 'react';
import { ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAssumptions, type AssumptionValue } from './AssumptionContext';

/**
 * <AssumptionChip name="growth_rate" base={0.05} alt={0.10} label="Growth" unit="%" />
 *
 * Registers into the page's AssumptionContext on mount, then clicking the
 * chip flips between `base` and `alt`. LiveNumbers elsewhere on the page
 * re-evaluate automatically.
 *
 * Display variants:
 *   - Two-state toggle (base | alt) — when alt is provided
 *   - Read-only badge — when alt is omitted; useful for naming a constant
 */

export interface AssumptionChipProps {
  name: string;
  base: AssumptionValue;
  alt?: AssumptionValue;
  label?: string;
  unit?: string;
  /** Number of decimal places for numeric formatting */
  decimals?: number;
}

export function AssumptionChip({
  name,
  base,
  alt,
  label,
  unit,
  decimals = 2,
}: AssumptionChipProps) {
  const ctx = useAssumptions();

  // Register on mount
  React.useEffect(() => {
    ctx.register({ name, base, alt, value: base, label, unit });
  }, [name, base, alt, label, unit, ctx]);

  const current = ctx.assumptions[name];
  const isToggled = current && current.value !== base;
  const display = current ? current.value : base;

  function formatValue(v: AssumptionValue): string {
    if (typeof v === 'number') return v.toFixed(decimals);
    return String(v);
  }

  function handleClick() {
    if (alt !== undefined) ctx.toggle(name);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={alt === undefined}
      className={cn(
        'inline-flex items-baseline gap-1.5 px-2 -mx-0.5 h-6 rounded-pill',
        'border font-mono text-2xs tracking-wider',
        'transition-colors duration-fast align-baseline',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
        isToggled
          ? 'border-accent bg-accent text-accent-fg'
          : 'border-accent-soft bg-accent-soft text-accent hover:bg-accent hover:text-accent-fg',
        alt === undefined && 'cursor-default opacity-80 hover:bg-accent-soft hover:text-accent',
      )}
      title={
        alt !== undefined
          ? `Toggle between ${formatValue(base)} and ${formatValue(alt)}`
          : `Assumption · ${name}`
      }
    >
      {label && <span className="opacity-70">{label}</span>}
      <span className="font-numeric tabular-nums">
        {formatValue(display)}
        {unit && <span className="opacity-70 ml-0.5">{unit}</span>}
      </span>
      {alt !== undefined && <ChevronsUpDown size={9} className="opacity-60" />}
    </button>
  );
}
