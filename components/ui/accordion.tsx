'use client';

import * as React from 'react';
import * as RA from '@radix-ui/react-accordion';
import * as RC from '@radix-ui/react-collapsible';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

// ---------- Accordion (multi-item, controlled by Radix Root) ----------

export const Accordion = RA.Root;

export const AccordionItem = React.forwardRef<
  React.ElementRef<typeof RA.Item>,
  React.ComponentPropsWithoutRef<typeof RA.Item>
>(function AccordionItem({ className, ...props }, ref) {
  return (
    <RA.Item
      ref={ref}
      className={cn('border-b border-line last:border-b-0', className)}
      {...props}
    />
  );
});

export const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof RA.Trigger>,
  React.ComponentPropsWithoutRef<typeof RA.Trigger>
>(function AccordionTrigger({ className, children, ...props }, ref) {
  return (
    <RA.Header className="flex">
      <RA.Trigger
        ref={ref}
        className={cn(
          'flex flex-1 items-center justify-between gap-4 py-3 text-sm text-fg',
          'text-left transition-colors duration-fast hover:text-accent',
          'focus-visible:outline-none focus-visible:bg-bg-panel rounded-sm',
          '[&[data-state=open]>svg]:rotate-180',
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDown
          size={14}
          className="shrink-0 text-fg-muted transition-transform duration-base"
          aria-hidden
        />
      </RA.Trigger>
    </RA.Header>
  );
});

export const AccordionContent = React.forwardRef<
  React.ElementRef<typeof RA.Content>,
  React.ComponentPropsWithoutRef<typeof RA.Content>
>(function AccordionContent({ className, children, ...props }, ref) {
  return (
    <RA.Content
      ref={ref}
      className={cn(
        'overflow-hidden text-sm text-fg-muted leading-relaxed',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=open]:fade-in data-[state=closed]:fade-out',
        className,
      )}
      {...props}
    >
      <div className="pb-3">{children}</div>
    </RA.Content>
  );
});

// ---------- Collapsible (single-item) ----------

export const Collapsible = RC.Root;
export const CollapsibleTrigger = RC.Trigger;
export const CollapsibleContent = RC.Content;
