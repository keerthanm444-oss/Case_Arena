'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

/**
 * Card — composable container.
 *
 * Variants:
 *   default   — bg-elevated, line border. The standard panel.
 *   panel     — bg-panel, less elevated. For nested groupings.
 *   outlined  — transparent bg, line border. Use over patterned backgrounds.
 *   accent    — accent-soft tinted, accent-soft border. Highlight cards.
 *
 * Composition:
 *   <Card>
 *     <CardHeader>
 *       <CardTitle>...</CardTitle>
 *       <CardDescription>...</CardDescription>
 *     </CardHeader>
 *     <CardBody>...</CardBody>
 *     <CardFooter>...</CardFooter>
 *   </Card>
 */

export const cardVariants = cva('rounded-md border transition-colors duration-fast', {
  variants: {
    variant: {
      default: 'bg-bg-elevated border-line',
      panel: 'bg-bg-panel border-line',
      outlined: 'bg-transparent border-line-strong',
      accent: 'bg-accent-soft border-accent-soft',
    },
    interactive: {
      true: 'hover:border-line-strong cursor-pointer',
      false: '',
    },
  },
  defaultVariants: { variant: 'default', interactive: false },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, variant, interactive, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, interactive }), className)}
      {...props}
    />
  );
});

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardHeader({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col gap-1 px-4 pt-4 pb-3', className)}
        {...props}
      />
    );
  },
);

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  function CardTitle({ className, ...props }, ref) {
    return (
      <h3
        ref={ref}
        className={cn('text-md text-fg leading-snug tracking-tight', className)}
        {...props}
      />
    );
  },
);

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(function CardDescription({ className, ...props }, ref) {
  return (
    <p
      ref={ref}
      className={cn('text-xs text-fg-muted leading-normal', className)}
      {...props}
    />
  );
});

export const CardBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardBody({ className, ...props }, ref) {
    return <div ref={ref} className={cn('px-4 pb-4', className)} {...props} />;
  },
);

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardFooter({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-2 px-4 py-3 border-t border-line',
          className,
        )}
        {...props}
      />
    );
  },
);
