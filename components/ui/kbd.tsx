'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';

/**
 * <Kbd> — a styled keyboard-shortcut indicator.
 *
 *   <Kbd>⌘ K</Kbd>
 *   <Kbd combo>g m</Kbd>   // for chord shortcuts, slightly wider
 */

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  /** When true, allow wider keys (e.g. "g m" chords) */
  combo?: boolean;
}

export const Kbd = React.forwardRef<HTMLElement, KbdProps>(function Kbd(
  { className, combo, children, ...props },
  ref,
) {
  return (
    <kbd
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center',
        combo ? 'min-w-[2.5rem] px-1.5' : 'min-w-[1.25rem] px-1',
        'h-5 rounded-sm border border-line bg-bg-panel',
        'font-mono text-2xs text-fg-muted tracking-wider',
        'leading-none',
        className,
      )}
      {...props}
    >
      {children}
    </kbd>
  );
});
