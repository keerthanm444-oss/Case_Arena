'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

export const inputVariants = cva(
  [
    'flex w-full bg-bg-elevated text-fg rounded-md border border-line',
    'placeholder:text-fg-subtle',
    'font-body',
    'transition-colors duration-fast',
    'focus-visible:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ring-offset)]',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'read-only:bg-bg-panel read-only:text-fg-muted',
    // Numeric inputs auto-switch to mono numerics
    '[&[type=number]]:font-numeric [&[type=number]]:tabular-nums',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-3 text-sm',
        lg: 'h-11 px-4 text-md',
      },
      tone: {
        default: '',
        invalid: 'border-danger focus-visible:border-danger ring-danger',
      },
    },
    defaultVariants: { size: 'md', tone: 'default' },
  },
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, size, tone, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(inputVariants({ size, tone }), className)}
        {...props}
      />
    );
  },
);

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(function Label({ className, ...props }, ref) {
  return (
    <label
      ref={ref}
      className={cn(
        'block font-mono text-2xs uppercase tracking-widest text-fg-muted mb-1.5',
        className,
      )}
      {...props}
    />
  );
});

/** Composite — label + input wrapper with built-in helper/error text. */
export interface FieldProps {
  label?: string;
  helper?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function Field({ label, helper, error, children, className }: FieldProps) {
  return (
    <div className={cn('grid gap-1', className)}>
      {label && <Label>{label}</Label>}
      {children}
      {(helper || error) && (
        <p
          className={cn(
            'text-xs mt-1',
            error ? 'text-danger' : 'text-fg-subtle',
          )}
        >
          {error ?? helper}
        </p>
      )}
    </div>
  );
}
