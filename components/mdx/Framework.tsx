'use client';

import * as React from 'react';
import Link from 'next/link';
import { Network } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * <Framework slug="profitability">profit tree</Framework> — links to the
 * mind-map view of that framework.
 */

export interface FrameworkProps {
  slug: string;
  children?: React.ReactNode;
  /** Optional non-link style — for use in tables or breadcrumbs */
  static?: boolean;
}

export function Framework({ slug, children, static: isStatic }: FrameworkProps) {
  const label = children ?? slug;
  const className = cn(
    'inline-flex items-baseline gap-1 px-1 rounded-sm',
    'font-mono text-2xs uppercase tracking-wider',
    'border border-line bg-bg-panel text-fg-muted',
    !isStatic && 'hover:text-accent hover:border-accent transition-colors duration-fast',
  );
  if (isStatic) {
    return (
      <span className={className}>
        <Network size={9} aria-hidden />
        {label}
      </span>
    );
  }
  return (
    <Link href={`/tools/mind-map?framework=${slug}`} className={className}>
      <Network size={9} aria-hidden />
      {label}
    </Link>
  );
}
