// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import {
  createSave,
  updateSave,
  readSave,
  listSaves,
  deleteSave,
  autoSave,
} from '@/lib/muscles/save-helpers';
import { _resetDb } from '@/lib/db/db';

/**
 * Save-helpers round-trip — the uniform Dexie wrapper used by every muscle.
 * Using fake-indexeddb to back the Dexie store with an in-memory IDB so
 * tests don't need a browser.
 */

beforeEach(async () => {
  await _resetDb();
});

describe('save-helpers — round trip', () => {
  it('creates + reads back a save', async () => {
    const id = await createSave('issue-tree', {
      name: 'Tree A',
      data: { nodes: [], edges: [] },
    });
    const got = await readSave<{ nodes: unknown[]; edges: unknown[] }>(id);
    expect(got).not.toBeNull();
    expect(got!.name).toBe('Tree A');
    expect(got!.kind).toBe('issue-tree');
    expect(got!.payload.nodes).toEqual([]);
  });

  it('updates an existing save in place', async () => {
    const id = await createSave('issue-tree', {
      name: 'v1',
      data: { count: 1 },
    });
    await updateSave<{ count: number }>(id, { name: 'v2', data: { count: 2 } });
    const got = await readSave<{ count: number }>(id);
    expect(got!.name).toBe('v2');
    expect(got!.payload.count).toBe(2);
  });

  it('listSaves returns rows of the given kind, newest first', async () => {
    const a = await createSave('issue-tree', { name: 'first',  data: {} });
    // small delay to ensure distinct updatedAt timestamps
    await new Promise((r) => setTimeout(r, 10));
    const b = await createSave('issue-tree', { name: 'second', data: {} });
    const rows = await listSaves('issue-tree');
    expect(rows.length).toBe(2);
    expect(rows[0]!.id).toBe(b);
    expect(rows[1]!.id).toBe(a);
  });

  it('listSaves filters by contextRef', async () => {
    await createSave('issue-tree', { name: 'A', contextRef: 'case-x', data: {} });
    await createSave('issue-tree', { name: 'B', contextRef: 'case-y', data: {} });
    const rows = await listSaves('issue-tree', 'case-x');
    expect(rows.length).toBe(1);
    expect(rows[0]!.name).toBe('A');
  });

  it('deleteSave removes the row', async () => {
    const id = await createSave('issue-tree', { name: 'tmp', data: {} });
    await deleteSave(id);
    expect(await readSave(id)).toBeNull();
  });
});

describe('save-helpers — autoSave (create or update)', () => {
  it('creates when given null', async () => {
    const id = await autoSave(null, 'sizing-scenario', {
      name: 'auto',
      data: { steps: 7 },
    });
    expect(typeof id).toBe('string');
    expect((await readSave(id))!.name).toBe('auto');
  });

  it('updates when given an existing id', async () => {
    const id = await autoSave(null, 'sizing-scenario', { name: 'v1', data: {} });
    const same = await autoSave(id, 'sizing-scenario', { name: 'v2', data: {} });
    expect(same).toBe(id);
    expect((await readSave(id))!.name).toBe('v2');
  });
});
