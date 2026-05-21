'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { useEmit } from '@/lib/event-bus';

/**
 * RouteObserver — emits a `page.viewed` event whenever the pathname
 * changes. Mounts once in the workspace shell. Feeds the recently-viewed
 * reducer in Dexie.
 *
 * Defensive: emits only after the first hydration so we don't fire during
 * server-side rendering. Debounce-by-de-dup: doesn't re-emit for the same
 * pathname in succession (which can happen due to query-string changes).
 */

export function RouteObserver() {
  const pathname = usePathname();
  const emit = useEmit();
  const last = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!pathname) return;
    if (last.current === pathname) return;
    last.current = pathname;
    emit('page.viewed', { path: pathname });
  }, [pathname, emit]);

  return null;
}
