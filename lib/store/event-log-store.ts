/**
 * Event log store — in-memory ring buffer of the last N events.
 *
 * Dexie holds the persistent log; this store is just a fast read path for
 * the dev event-log panel and for any component that wants to react to
 * very recent events without round-tripping to IndexedDB.
 */

'use client';

import { create } from 'zustand';
import type { InteractionEvent } from '@/types/interaction';

const RING_SIZE = 100;

interface EventLogState {
  recent: InteractionEvent[];
  push: (e: InteractionEvent) => void;
  clear: () => void;
}

export const useEventLogStore = create<EventLogState>((set) => ({
  recent: [],
  push: (e) =>
    set((s) => {
      const next = s.recent.length >= RING_SIZE ? s.recent.slice(1) : s.recent;
      return { recent: [...next, e] };
    }),
  clear: () => set({ recent: [] }),
}));
