'use client';

import * as React from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { DevEventLog } from '@/components/skeleton/DevEventLog';
import { Workspace } from '@/components/workspace/Workspace';
import { usePreferences } from '@/lib/store';

/**
 * ClientProviders — wraps the app root.
 *
 * Mounts: TooltipProvider, the Workspace shell (sidebar + topbar + palette +
 * keyboard nav + route observer), Toaster, and the dev-only event log.
 *
 * Wrapped routes never need to know providers exist — they just render their
 * own content and inherit the chrome.
 */

export function ClientProviders({ children }: { children: React.ReactNode }) {
  // Touch the store on first paint to force hydration of the persist middleware,
  // which re-applies DOM attributes via onRehydrateStorage.
  usePreferences((s) => s.theme);

  return (
    <TooltipProvider delayDuration={200} skipDelayDuration={300}>
      <Workspace>{children}</Workspace>
      <Toaster />
      <DevEventLog />
    </TooltipProvider>
  );
}
