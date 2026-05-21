'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { RouteObserver } from './RouteObserver';
import { CommandPalette } from '@/components/palette/CommandPalette';
import { KeyboardNavigator } from '@/components/keyboard/KeyboardNavigator';

const SIDEBAR_LS_KEY = 'ca:sidebar-collapsed';

/**
 * Workspace — the universal app shell.
 *
 *   ┌──────┬──────────────────────────────────┐
 *   │      │ Topbar (breadcrumbs + ⌘K)        │
 *   │ Side │----------------------------------│
 *   │ bar  │                                  │
 *   │      │  Page content (children)         │
 *   │      │                                  │
 *   └──────┴──────────────────────────────────┘
 *
 * Sidebar collapse state persists to localStorage. The shell is rendered
 * client-side because it owns keyboard listeners and palette state.
 */

export function Workspace({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState<boolean>(false);
  const [mounted, setMounted] = React.useState(false);

  // Hydrate sidebar state from localStorage on mount
  React.useEffect(() => {
    try {
      const v = localStorage.getItem(SIDEBAR_LS_KEY);
      if (v === '1') setCollapsed(true);
    } catch {
      // ignore
    }
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(SIDEBAR_LS_KEY, collapsed ? '1' : '0');
    } catch {
      // ignore
    }
  }, [collapsed, mounted]);

  return (
    <div className={cn('grid h-dvh w-full', 'grid-cols-[auto_1fr]')}>
      <Sidebar
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((c) => !c)}
      />
      <div className="flex flex-col h-dvh min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      {/* Global keyboard listeners & palette */}
      <KeyboardNavigator
        onToggleSidebar={() => setCollapsed((c) => !c)}
      />
      <CommandPalette />
      <RouteObserver />
    </div>
  );
}
