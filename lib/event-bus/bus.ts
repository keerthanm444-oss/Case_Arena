/**
 * Event bus — the spine of L3 statefulness.
 *
 * Every meaningful user action calls `emit()`. The bus:
 *   1. Persists the event to the Dexie `events` table
 *   2. Updates the in-memory recent-events ring (Zustand store)
 *   3. Fans out to registered reducers that update derived tables
 *
 * Reducers are PURE wrt the event but DO write to Dexie via thin update
 * helpers (recent, progress, skill, drills). This keeps the bus simple and
 * the reducer registry composable.
 */

'use client';

import type { InteractionEvent, InteractionEventKind } from '@/types/interaction';
import { getDb } from '@/lib/db/db';
import { applyRecentlyViewed } from './reducers/recently-viewed';
import { applyModuleProgress } from './reducers/module-progress';
import { applyCaseProgress } from './reducers/case-progress';
import { applyDrillHistory } from './reducers/drill-history';
import { useEventLogStore } from '@/lib/store/event-log-store';

/** All registered reducer side-effects. Each is async because most write
 *  to Dexie. The bus awaits Promise.all to guarantee derived tables are
 *  consistent after `emit()` resolves — important for tests + tools that
 *  read state immediately after emitting. */
type Reducer = (event: InteractionEvent) => Promise<void>;

const reducers: ReadonlyArray<Reducer> = [
  applyRecentlyViewed,
  applyModuleProgress,
  applyCaseProgress,
  applyDrillHistory,
];

/** Build an event with auto-timestamp. Use when payload is known. */
export function buildEvent<K extends InteractionEventKind>(
  kind: K,
  payload: Extract<InteractionEvent, { kind: K }>['payload'],
): Extract<InteractionEvent, { kind: K }> {
  return {
    kind,
    at: new Date().toISOString(),
    payload,
  } as Extract<InteractionEvent, { kind: K }>;
}

/** The single dispatch point. Returns when all reducers have completed. */
export async function emit(event: InteractionEvent): Promise<void> {
  // 1. Persist to Dexie
  const db = getDb();
  await db.events.add({
    at: event.at,
    kind: event.kind,
    event,
  });

  // 2. Update in-memory ring
  useEventLogStore.getState().push(event);

  // 3. Fan out to reducers
  await Promise.all(reducers.map((r) => r(event).catch((e) => {
    console.error('[event-bus] reducer failed for', event.kind, e);
  })));
}

/** Sugar — build + emit in one call. The common shape. */
export async function dispatch<K extends InteractionEventKind>(
  kind: K,
  payload: Extract<InteractionEvent, { kind: K }>['payload'],
): Promise<void> {
  await emit(buildEvent(kind, payload));
}

/** Replay a slice of the event log against a fresh reducer set.
 *  Useful for tests + for the dashboard rebuilding derived state. */
export async function replay(
  events: InteractionEvent[],
  selectedReducers: ReadonlyArray<Reducer> = reducers,
): Promise<void> {
  for (const e of events) {
    await Promise.all(selectedReducers.map((r) => r(e)));
  }
}
