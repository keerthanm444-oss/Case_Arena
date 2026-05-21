'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';
import { X } from 'lucide-react';

/**
 * Tag — smaller than StatusPill, sentence-case, used for:
 *   - case tags ("retail", "profitability")
 *   - filter chips
 *   - framework chips
 *
 * Removable: pass `onRemove` to get an inline ✕ button.
 */

export const tagVariants = cva(
  'inline-flex items-center gap-1.5 rounded-pill border font-body whitespace-nowrap transition-colors duration-fast',
  {
    variants: {
      tone: {
        neutral: 'border-line bg-bg-panel text-fg',
        accent: 'border-accent-soft bg-accent-soft text-accent',
        outline: 'border-line-strong bg-transparent text-fg-muted',
        ghost: 'border-transparent bg-bg-panel text-fg-muted hover:text-fg',
      },
      size: {
        sm: 'h-5 px-2 text-2xs',
        md: 'h-6 px-2.5 text-xs',
        lg: 'h-7 px-3 text-sm',
      },
      interactive: {
        true: 'hover:border-line-strong hover:bg-bg-elevated cursor-pointer',
        false: '',
      },
    },
    defaultVariants: { tone: 'neutral', size: 'md', interactive: false },
  },
);

export interface TagProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'onRemove'>,
    VariantProps<typeof tagVariants> {
  onRemove?: () => void;
}

export const Tag = React.forwardRef<HTMLSpanElement, TagProps>(function Tag(
  { className, tone, size, interactive, onRemove, children, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cn(tagVariants({ tone, size, interactive: interactive ?? !!onRemove }), className)}
      {...props}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="-mr-1 opacity-60 hover:opacity-100 rounded-sm hover:bg-bg-elevated transition-opacity"
          aria-label="Remove"
        >
          <X size={12} />
        </button>
      )}
    </span>
  );
});
