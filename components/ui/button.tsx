'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

/**
 * Button — variant-driven, theme-aware, no hardcoded colors.
 *
 * Variants:
 *   primary    — filled accent. Default CTA.
 *   secondary  — outlined, transparent bg. Most controls.
 *   ghost      — transparent + hover background. Toolbar buttons.
 *   danger     — filled danger. Destructive actions.
 *   command    — mono uppercase, terminal-feel. Used in toolbars + the palette.
 *
 * Sizes:
 *   xs · sm · md (default) · lg
 *
 * The base styles are deliberately tight — business-app density, no
 * inflated padding. Each variant flips background/border/foreground while
 * keeping geometry consistent.
 */

export const buttonVariants = cva(
  // base — applied to every variant
  [
    'inline-flex items-center justify-center gap-2',
    'rounded-md border',
    'font-body select-none whitespace-nowrap',
    'transition-colors duration-fast ease-out-custom',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ring-offset)]',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: [
          'bg-accent text-accent-fg border-accent',
          'hover:opacity-90 active:opacity-80',
        ].join(' '),
        secondary: [
          'bg-transparent text-fg border-line-strong',
          'hover:bg-bg-panel hover:border-fg-muted',
          'active:bg-bg-elevated',
        ].join(' '),
        ghost: [
          'bg-transparent text-fg-muted border-transparent',
          'hover:bg-bg-panel hover:text-fg',
          'active:bg-bg-elevated',
        ].join(' '),
        danger: [
          'bg-danger text-fg-inverse border-danger',
          'hover:opacity-90 active:opacity-80',
        ].join(' '),
        command: [
          'bg-bg-panel text-fg-muted border-line',
          'font-mono uppercase tracking-wider',
          'hover:text-fg hover:border-line-strong hover:bg-bg-elevated',
        ].join(' '),
      },
      size: {
        xs: 'h-6 px-2 text-2xs',
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4 text-sm',
        lg: 'h-11 px-5 text-md',
      },
      square: {
        true: 'aspect-square px-0',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'secondary',
      size: 'md',
      square: false,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Optional leading icon */
  leading?: React.ReactNode;
  /** Optional trailing icon */
  trailing?: React.ReactNode;
  /** Render as a child element (e.g. Link) without applying button semantics */
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant, size, square, leading, trailing, children, ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, square }), className)}
        {...props}
      >
        {leading}
        {children}
        {trailing}
      </button>
    );
  },
);
