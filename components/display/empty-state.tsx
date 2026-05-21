'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';

/**
 * EmptyState — graceful "nothing here yet" UI.
 *
 * Used by listings, the map, dashboards, and any surface that may be empty
 * while content is being authored. The Skeleton (System 2) used a plain
 * div; replace those usages with this in System 4.
 */

export interface EmptyStateProps {
  icon?: React.ReactNode;
  /** Brief mono label (uppercase) above the title */
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  /** Optional row of action buttons */
  actions?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  eyebrow,
  title,
  description,
  actions,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'rounded-md border border-line bg-bg-panel',
        'flex flex-col items-center text-center px-6 py-10 gap-2',
        className,
      )}
    >
      {icon && (
        <div className="text-fg-subtle mb-2 [&_svg]:w-6 [&_svg]:h-6" aria-hidden>
          {icon}
        </div>
      )}
      {eyebrow && (
        <div className="font-mono text-2xs uppercase tracking-widest text-fg-muted">
          {eyebrow}
        </div>
      )}
      <h3 className="text-md text-fg leading-snug">{title}</h3>
      {description && (
        <p className="text-sm text-fg-muted max-w-md leading-relaxed">
          {description}
        </p>
      )}
      {actions && <div className="flex items-center gap-2 mt-2">{actions}</div>}
    </div>
  );
}
