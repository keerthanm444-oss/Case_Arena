'use client';

import * as React from 'react';
import * as RTabs from '@radix-ui/react-tabs';
import { cn } from '@/lib/cn';

export const Tabs = RTabs.Root;

export const TabsList = React.forwardRef<
  React.ElementRef<typeof RTabs.List>,
  React.ComponentPropsWithoutRef<typeof RTabs.List>
>(function TabsList({ className, ...props }, ref) {
  return (
    <RTabs.List
      ref={ref}
      className={cn(
        'inline-flex items-center gap-0 border-b border-line',
        className,
      )}
      {...props}
    />
  );
});

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof RTabs.Trigger>,
  React.ComponentPropsWithoutRef<typeof RTabs.Trigger>
>(function TabsTrigger({ className, ...props }, ref) {
  return (
    <RTabs.Trigger
      ref={ref}
      className={cn(
        'relative px-3 py-2 -mb-px',
        'font-mono text-2xs uppercase tracking-wider text-fg-muted',
        'hover:text-fg transition-colors duration-fast',
        'data-[state=active]:text-fg data-[state=active]:border-b-2 data-[state=active]:border-accent',
        'border-b-2 border-transparent',
        'focus-visible:outline-none focus-visible:bg-bg-panel rounded-sm',
        'disabled:opacity-50 disabled:pointer-events-none',
        className,
      )}
      {...props}
    />
  );
});

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof RTabs.Content>,
  React.ComponentPropsWithoutRef<typeof RTabs.Content>
>(function TabsContent({ className, ...props }, ref) {
  return (
    <RTabs.Content
      ref={ref}
      className={cn(
        'mt-4 focus-visible:outline-none',
        'data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:duration-base',
        className,
      )}
      {...props}
    />
  );
});
