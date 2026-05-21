'use client';

import * as React from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Breadcrumbs } from './Breadcrumbs';
import { Kbd } from '@/components/ui/kbd';
import { useUIStore } from '@/lib/store';
import { ThemeSwitcher } from './ThemeSwitcher';

/**
 * Topbar — sticky horizontal bar above the content area.
 *
 *   [ breadcrumbs ........................ ] [ ⌘K trigger ] [ theme ]
 *
 * The ⌘K trigger is keyboard-actionable and visible — discoverability
 * matters even more than the shortcut itself.
 */

export function Topbar() {
  const openPalette = useUIStore((s) => s.openPalette);

  return (
    <div
      className={cn(
        'sticky top-0 z-sticky',
        'h-[var(--topbar-h)] shrink-0',
        'bg-bg-overlay backdrop-blur-md',
        'border-b border-line',
        'flex items-center justify-between gap-3 px-4',
      )}
    >
      <Breadcrumbs />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={openPalette}
          className={cn(
            'flex items-center gap-2 px-2.5 h-7 rounded-md',
            'border border-line bg-bg-elevated text-fg-muted',
            'hover:text-fg hover:border-line-strong transition-colors duration-fast',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
          )}
          aria-label="Open command palette"
        >
          <Search size={12} />
          <span className="hidden md:inline font-mono text-2xs tracking-wider">
            Search · jump
          </span>
          <Kbd combo>⌘ K</Kbd>
        </button>
        <ThemeSwitcher />
      </div>
    </div>
  );
}
