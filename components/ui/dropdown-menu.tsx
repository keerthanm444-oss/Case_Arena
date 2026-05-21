'use client';

import * as React from 'react';
import * as RDM from '@radix-ui/react-dropdown-menu';
import { Check, ChevronRight, Circle } from 'lucide-react';
import { cn } from '@/lib/cn';

export const DropdownMenu = RDM.Root;
export const DropdownMenuTrigger = RDM.Trigger;
export const DropdownMenuGroup = RDM.Group;
export const DropdownMenuPortal = RDM.Portal;
export const DropdownMenuSub = RDM.Sub;
export const DropdownMenuRadioGroup = RDM.RadioGroup;

const menuContentClasses = [
  'z-overlay min-w-[180px]',
  'rounded-md border border-line shadow-3 bg-bg-overlay backdrop-blur-md text-fg',
  'p-1',
  'data-[state=open]:animate-in data-[state=closed]:animate-out',
  'data-[state=open]:fade-in data-[state=closed]:fade-out',
].join(' ');

export const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof RDM.Content>,
  React.ComponentPropsWithoutRef<typeof RDM.Content>
>(function DropdownMenuContent({ className, sideOffset = 6, ...props }, ref) {
  return (
    <RDM.Portal>
      <RDM.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(menuContentClasses, className)}
        {...props}
      />
    </RDM.Portal>
  );
});

const itemClasses = [
  'relative flex items-center gap-2 rounded-sm px-2 py-1.5',
  'text-sm text-fg',
  'cursor-default select-none outline-none',
  'transition-colors duration-fast',
  'data-[highlighted]:bg-bg-panel data-[highlighted]:text-fg',
  'data-[disabled]:opacity-50 data-[disabled]:pointer-events-none',
].join(' ');

export const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof RDM.Item>,
  React.ComponentPropsWithoutRef<typeof RDM.Item> & {
    inset?: boolean;
    leading?: React.ReactNode;
    kbd?: string;
  }
>(function DropdownMenuItem({ className, inset, leading, kbd, children, ...props }, ref) {
  return (
    <RDM.Item
      ref={ref}
      className={cn(itemClasses, inset && 'pl-7', className)}
      {...props}
    >
      {leading}
      <span className="flex-1">{children}</span>
      {kbd && (
        <kbd className="font-mono text-2xs text-fg-subtle tracking-wider">{kbd}</kbd>
      )}
    </RDM.Item>
  );
});

export const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof RDM.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof RDM.CheckboxItem>
>(function DropdownMenuCheckboxItem({ className, children, checked, ...props }, ref) {
  return (
    <RDM.CheckboxItem
      ref={ref}
      className={cn(itemClasses, 'pl-7', className)}
      checked={checked}
      {...props}
    >
      <span className="absolute left-2 flex items-center justify-center">
        <RDM.ItemIndicator>
          <Check size={12} className="text-accent" />
        </RDM.ItemIndicator>
      </span>
      {children}
    </RDM.CheckboxItem>
  );
});

export const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof RDM.RadioItem>,
  React.ComponentPropsWithoutRef<typeof RDM.RadioItem>
>(function DropdownMenuRadioItem({ className, children, ...props }, ref) {
  return (
    <RDM.RadioItem
      ref={ref}
      className={cn(itemClasses, 'pl-7', className)}
      {...props}
    >
      <span className="absolute left-2 flex items-center justify-center">
        <RDM.ItemIndicator>
          <Circle size={6} className="fill-accent text-accent" />
        </RDM.ItemIndicator>
      </span>
      {children}
    </RDM.RadioItem>
  );
});

export const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof RDM.Label>,
  React.ComponentPropsWithoutRef<typeof RDM.Label> & { inset?: boolean }
>(function DropdownMenuLabel({ className, inset, ...props }, ref) {
  return (
    <RDM.Label
      ref={ref}
      className={cn(
        'px-2 py-1.5 font-mono text-2xs uppercase tracking-widest text-fg-muted',
        inset && 'pl-7',
        className,
      )}
      {...props}
    />
  );
});

export const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof RDM.Separator>,
  React.ComponentPropsWithoutRef<typeof RDM.Separator>
>(function DropdownMenuSeparator({ className, ...props }, ref) {
  return (
    <RDM.Separator
      ref={ref}
      className={cn('-mx-1 my-1 h-px bg-line', className)}
      {...props}
    />
  );
});

export const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof RDM.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof RDM.SubTrigger>
>(function DropdownMenuSubTrigger({ className, children, ...props }, ref) {
  return (
    <RDM.SubTrigger
      ref={ref}
      className={cn(itemClasses, 'data-[state=open]:bg-bg-panel', className)}
      {...props}
    >
      {children}
      <ChevronRight size={12} className="ml-auto text-fg-muted" />
    </RDM.SubTrigger>
  );
});

export const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof RDM.SubContent>,
  React.ComponentPropsWithoutRef<typeof RDM.SubContent>
>(function DropdownMenuSubContent({ className, ...props }, ref) {
  return (
    <RDM.SubContent ref={ref} className={cn(menuContentClasses, className)} {...props} />
  );
});
