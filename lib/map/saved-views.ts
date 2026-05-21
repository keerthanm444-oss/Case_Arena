import {
  autoSave,
  listSaves,
  readSave,
  deleteSave,
} from '@/lib/muscles/save-helpers';
import type { MapSavedView } from '@/types';

/**
 * Saved view persistence. Goes through the same `saves` Dexie table that all
 * muscles use, with kind 'map-view'. Each row's payload is a serialized
 * MapSavedView; the row's `name` mirrors the view's name.
 */

const KIND = 'map-view' as const;

export async function listSavedViews(): Promise<MapSavedView[]> {
  const rows = await listSaves(KIND);
  const views: MapSavedView[] = [];
  for (const r of rows) {
    const v = r.payload as MapSavedView | undefined;
    if (!v || typeof v !== 'object') continue;
    views.push({
      id: r.id,
      name: r.name,
      mode: v.mode ?? 'web',
      filters: v.filters ?? {},
      pinned: v.pinned ?? [],
      createdAt: r.createdAt,
    });
  }
  return views;
}

export async function saveView(view: MapSavedView): Promise<string> {
  const id = await autoSave(null, KIND, {
    name: view.name,
    data: view,
  });
  return id;
}

export async function deleteSavedView(id: string): Promise<void> {
  await deleteSave(id);
}

/** Optional helper if a consumer wants to load a specific view by id. */
export async function loadSavedView(id: string): Promise<MapSavedView | null> {
  const row = await readSave<MapSavedView>(id);
  if (!row) return null;
  return row.payload;
}
