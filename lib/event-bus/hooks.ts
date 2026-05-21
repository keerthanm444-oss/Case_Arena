/**
 * React hooks for the event bus.
 *
 * Components call `useEmit()` to get a stable dispatch function. The hook
 * silently no-ops on the server, which is correct: the only events worth
 * emitting are user actions, which by definition originate on the client.
 */

'use client';

import { useCallback } from 'react';
import { dispatch, emit, buildEvent, replay } from './bus';
import type {
  InteractionEvent,
  InteractionEventKind,
} from '@/types/interaction';

export function useEmit() {
  return useCallback(
    async <K extends InteractionEventKind>(
      kind: K,
      payload: Extract<InteractionEvent, { kind: K }>['payload'],
    ) => {
      if (typeof window === 'undefined') return;
      await dispatch(kind, payload);
    },
    [],
  );
}

export { emit, dispatch, buildEvent, replay };
