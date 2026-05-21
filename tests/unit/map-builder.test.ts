import { describe, it, expect } from 'vitest';
import { buildMapGraph } from '@/lib/content/map-builder';

describe('map graph builder', () => {
  it('returns a valid empty-but-shaped graph when no cases exist', () => {
    const g = buildMapGraph();
    expect(Array.isArray(g.nodes)).toBe(true);
    expect(Array.isArray(g.edges)).toBe(true);
    expect(typeof g.builtAt).toBe('string');
    // builtAt should be ISO
    expect(() => new Date(g.builtAt).toISOString()).not.toThrow();
  });

  // When real case content lands in Tissue passes, the suite below should
  // re-run automatically; these tests are stable against an empty content
  // set today.
  it('emits a unique id per edge', () => {
    const g = buildMapGraph();
    const ids = new Set(g.edges.map((e) => e.id));
    expect(ids.size).toBe(g.edges.length);
  });
});
