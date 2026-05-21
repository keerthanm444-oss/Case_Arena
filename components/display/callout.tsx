'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';
import { Info, AlertTriangle, AlertCircle, CheckCircle2, Lightbulb, Quote } from 'lucide-react';

/**
 * Callout — emphasized inline block for important content.
 *
 * Variants tone the left edge + icon. Used heavily in modules to draw
 * attention to key principles, warnings, and tips.
 */

export const calloutVariants = cva(
  'relative grid grid-cols-[auto_1fr] gap-3 rounded-md border p-4 transition-colors duration-fast shadow-soft',
  {
    variants: {
      tone: {
        info: 'border-info/30 bg-info/5 text-fg',
        warning: 'border-warning/30 bg-warning/5 text-fg',
        danger: 'border-danger/30 bg-danger/5 text-fg',
        success: 'border-success/30 bg-success/5 text-fg',
        note: 'border-line bg-bg-panel text-fg',
        tip: 'border-accent-soft bg-accent-soft text-fg',
        quote: 'border-l-2 border-l-accent border-y-0 border-r-0 rounded-none pl-4 py-2 bg-transparent shadow-none',
      },
    },
    defaultVariants: { tone: 'note' },
  },
);

const ICONS = {
  info: Info,
  warning: AlertTriangle,
  danger: AlertCircle,
  success: CheckCircle2,
  note: Info,
  tip: Lightbulb,
  quote: Quote,
};

const ICON_COLOR: Record<NonNullable<VariantProps<typeof calloutVariants>['tone']>, string> = {
  info: 'text-info',
  warning: 'text-warning',
  danger: 'text-danger',
  success: 'text-success',
  note: 'text-fg-muted',
  tip: 'text-accent',
  quote: 'text-accent',
};

export interface CalloutProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof calloutVariants> {
  title?: string;
  hideIcon?: boolean;
}

export const Callout = React.forwardRef<HTMLDivElement, CalloutProps>(
  function Callout({ className, tone = 'note', title, hideIcon, children, ...props }, ref) {
    const Icon = ICONS[tone ?? 'note'];
    return (
      <div ref={ref} className={cn(calloutVariants({ tone }), className)} {...props}>
        {!hideIcon && tone !== 'quote' && (
          <Icon
            size={16}
            className={cn('mt-0.5 shrink-0', ICON_COLOR[tone ?? 'note'])}
            aria-hidden
          />
        )}
        <div className={cn(tone === 'quote' && 'col-span-2')}>
          {title && <div className="font-mono text-2xs uppercase tracking-widest text-fg-muted mb-1">{title}</div>}
          <div className={cn(tone === 'quote' ? 'text-md italic leading-relaxed' : 'text-sm leading-relaxed')}>{children}</div>
        </div>
      </div>
    );
  },
);
