'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

/**
 * Layout primitives. These exist so System 7 module + case renderers
 * compose the same way regardless of theme or density.
 */

// ---------- Container — max-width-bounded page wrapper ----------

const containerVariants = cva('mx-auto w-full px-4 sm:px-6', {
  variants: {
    width: {
      sm: 'max-w-screen-sm',
      md: 'max-w-screen-md',
      lg: 'max-w-screen-lg',
      xl: 'max-w-screen-xl',
      reading: 'max-w-reading',
      full: 'max-w-none',
    },
  },
  defaultVariants: { width: 'xl' },
});

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  function Container({ className, width, ...props }, ref) {
    return (
      <div ref={ref} className={cn(containerVariants({ width }), className)} {...props} />
    );
  },
);

// ---------- PageHeader — top-of-page hero/title block ----------

export interface PageHeaderProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  meta,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn('mb-10', className)}>
      {eyebrow && (
        <div className="mb-3">
          {typeof eyebrow === 'string' ? (
            <div className="font-mono text-2xs uppercase tracking-widest text-fg-muted">
              {eyebrow}
            </div>
          ) : (
            eyebrow
          )}
        </div>
      )}
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <h1
          className="font-display text-fg leading-tight"
          style={{
            fontSize: 'var(--text-4xl)',
            fontWeight: 300,
            letterSpacing: 'var(--tracking-tightest)',
            fontVariationSettings: "'opsz' 120, 'SOFT' 100",
          }}
        >
          {title}
        </h1>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {description && (
        <p
          className="text-fg-muted mt-3 max-w-3xl"
          style={{ fontSize: 'var(--text-md)', lineHeight: 'var(--leading-relaxed)' }}
        >
          {description}
        </p>
      )}
      {meta && <div className="mt-5">{meta}</div>}
    </header>
  );
}

// ---------- Section — semantic chunk with optional title ----------

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  /** Mono uppercase eyebrow above the title */
  eyebrow?: string;
}

export function Section({
  title,
  description,
  actions,
  eyebrow,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn('mb-10', className)} {...props}>
      {(title || eyebrow || description || actions) && (
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            {eyebrow && (
              <div className="font-mono text-2xs uppercase tracking-widest text-fg-muted mb-1">
                {eyebrow}
              </div>
            )}
            {title && (
              <h2
                className="font-display text-fg leading-snug tracking-tight"
                style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: 500,
                  fontVariationSettings: "'opsz' 48, 'SOFT' 60",
                }}
              >
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm text-fg-muted mt-1 max-w-2xl">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

// ---------- Pane — workspace pane (used by sidebar + rail in System 5) ----------

export interface PaneProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional border placements */
  borderLeft?: boolean;
  borderRight?: boolean;
}

export const Pane = React.forwardRef<HTMLDivElement, PaneProps>(function Pane(
  { className, borderLeft, borderRight, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'bg-bg-panel h-full',
        borderLeft && 'border-l border-line',
        borderRight && 'border-r border-line',
        className,
      )}
      {...props}
    />
  );
});

// ---------- Rail — sticky right-rail container ----------

export interface RailProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Sticky offset from top in px (default = topbar+breadcrumb height) */
  top?: number;
}

export const Rail = React.forwardRef<HTMLDivElement, RailProps>(function Rail(
  { className, top = 80, children, ...props },
  ref,
) {
  return (
    <aside
      ref={ref}
      className={cn(
        'sticky self-start',
        'border-l border-line bg-bg-panel px-4 py-4',
        'w-rail max-h-[calc(100dvh-var(--topbar-h))] overflow-auto',
        className,
      )}
      style={{ top }}
      {...props}
    >
      {children}
    </aside>
  );
});

// ---------- Stack — gap-aware flex/grid utility ----------

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'col';
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8;
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
}

const GAP = {
  0: 'gap-0', 1: 'gap-1', 2: 'gap-2', 3: 'gap-3',
  4: 'gap-4', 5: 'gap-5', 6: 'gap-6', 8: 'gap-8',
} as const;

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(function Stack(
  {
    direction = 'col',
    gap = 3,
    align,
    justify,
    wrap,
    className,
    ...props
  },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'flex',
        direction === 'col' ? 'flex-col' : 'flex-row',
        GAP[gap],
        align && `items-${align}`,
        justify && `justify-${justify}`,
        wrap && 'flex-wrap',
        className,
      )}
      {...props}
    />
  );
});
