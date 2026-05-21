'use client';

import { getDb, type SaveRow } from '@/lib/db/db';
import { nanoid } from 'nanoid';

/**
 * Save helpers — uniform Dexie wrapper for the `saves` table.
 *
 * Every muscle stores its state here via a typed `kind` discriminant. The
 * `payload` is opaque to the DB layer; each muscle defines its own runtime
 * type. The hooks below provide a consistent API across all muscles.
 */

export type SaveKind = SaveRow['kind'];

export interface SavePayload<T> {
  /** Optional friendly name (e.g. "My profitability tree v2") */
  name: string;
  /** Foreign relation — e.g. caseSlug, frameworkSlug */
  contextRef?: string;
  /** The actual data */
  data: T;
}

/** Create a new save. Returns the new id. */
export async function createSave<T>(
  kind: SaveKind,
  payload: SavePayload<T>,
): Promise<string> {
  const db = getDb();
  const id = nanoid(10);
  const now = new Date().toISOString();
  await db.saves.add({
    id,
    kind,
    name: payload.name,
    contextRef: payload.contextRef,
    payload: payload.data,
    createdAt: now,
    updatedAt: now,
  });
  return id;
}

/** Update an existing save in place. */
export async function updateSave<T>(
  id: string,
  patch: Partial<SavePayload<T>>,
): Promise<void> {
  const db = getDb();
  const existing = await db.saves.get(id);
  if (!existing) throw new Error(`Save ${id} not found`);
  await db.saves.put({
    ...existing,
    name: patch.name ?? existing.name,
    contextRef: patch.contextRef ?? existing.contextRef,
    payload: patch.data ?? existing.payload,
    updatedAt: new Date().toISOString(),
  });
}

/** List saves for a kind, optionally filtered to a context. Newest first. */
export async function listSaves(
  kind: SaveKind,
  contextRef?: string,
): Promise<SaveRow[]> {
  const db = getDb();
  let rows = await db.saves.where('kind').equals(kind).reverse().sortBy('updatedAt');
  if (contextRef) rows = rows.filter((r) => r.contextRef === contextRef);
  return rows;
}

/** Read one save by id. */
export async function readSave<T = unknown>(
  id: string,
): Promise<SaveRow & { payload: T } | null> {
  const db = getDb();
  const row = await db.saves.get(id);
  if (!row) return null;
  return row as SaveRow & { payload: T };
}

/** Delete a save. */
export async function deleteSave(id: string): Promise<void> {
  const db = getDb();
  await db.saves.delete(id);
}

/** Auto-save: creates a new save or updates an existing one. */
export async function autoSave<T>(
  existingId: string | null,
  kind: SaveKind,
  payload: SavePayload<T>,
): Promise<string> {
  if (existingId) {
    await updateSave(existingId, payload);
    return existingId;
  }
  return createSave(kind, payload);
}
