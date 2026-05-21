import { describe, it, expect } from 'vitest';
import {
  readMapUrlState,
  writeMapUrlState,
  hasActiveFilters,
  clearFilters,
} from '@/lib/map/url-state';
import { computeForceLayout, nodeTone } from '@/lib/map/layout';
import type { MapNode, MapEdge } from '@/types';

describe('map url-state', () => {
  it('reads defaults when params are empty', () => {
    const s = readMapUrlState(new URLSearchParams(''));
    expect(s.view).toBe('web');
    expect(s.filters).toEqual({
      industries: undefined,
      categories: undefined,
      difficulties: undefined,
      frameworks: undefined,
      publishers: undefined,
      onlySolved: undefined,
      tags: undefined,
    });
    expect(s.pinned).toEqual([]);
    expect(s.focus).toBeUndefined();
  });

  it('round-trips state through URL', () => {
    const input = {
      view: 'matrix' as const,
      filters: {
        industries: ['retail', 'tech'],
        difficulties: ['advanced'],
        onlySolved: true,
      },
      pinned: ['case:a', 'case:b'],
      focus: 'case:b',
    };
    const params = new URLSearchParams(writeMapUrlState(input));
    const out = readMapUrlState(params);
    expect(out.view).toBe('matrix');
    expect(out.filters.industries).toEqual(['retail', 'tech']);
    expect(out.filters.difficulties).toEqual(['advanced']);
    expect(out.filters.onlySolved).toBe(true);
    expect(out.pinned).toEqual(['case:a', 'case:b']);
    expect(out.focus).toBe('case:b');
  });

  it('omits empty arrays from the URL', () => {
    const s = writeMapUrlState({
      view: 'web',
      filters: { industries: [] },
      pinned: [],
    });
    // Default view 'web' should not be serialized; empty arrays should not appear
    expect(s).toBe('');
  });

  it('serializes a non-default view', () => {
    const s = writeMapUrlState({
      view: 'branch',
      filters: {},
      pinned: [],
    });
    expect(s).toContain('view=branch');
  });

  it('reports active filters correctly', () => {
    expect(hasActiveFilters({})).toBe(false);
    expect(hasActiveFilters({ industries: ['retail'] })).toBe(true);
    expect(hasActiveFilters({ onlySolved: true })).toBe(true);
    expect(hasActiveFilters(clearFilters())).toBe(false);
  });

  it('falls back to web for invalid view modes', () => {
    const s = readMapUrlState(new URLSearchParams('view=invalid'));
    expect(s.view).toBe('web');
  });
});

describe('map layout — computeForceLayout', () => {
  function makeNode(id: string, weight = 1): MapNode {
    return {
      id,
      kind: 'case',
      label: id,
      weight,
      meta: { difficulty: 'standard' },
    };
  }

  it('positions every node deterministically (same id → same seed)', () => {
    const nodes = [makeNode('a'), makeNode('b'), makeNode('c')];
    const r1 = computeForceLayout(nodes, [], {
      width: 400,
      height: 300,
      iterations: 50,
    });
    const r2 = computeForceLayout(nodes, [], {
      width: 400,
      height: 300,
      iterations: 50,
    });
    // With same seed + same iterations, positions are deterministic
    expect(r1.nodes[0]!.x).toBeCloseTo(r2.nodes[0]!.x, 5);
    expect(r1.nodes[0]!.y).toBeCloseTo(r2.nodes[0]!.y, 5);
  });

  it('skips edges with missing endpoints', () => {
    const nodes = [makeNode('a'), makeNode('b')];
    const edges: MapEdge[] = [
      { id: 'e1', source: 'a', target: 'b', kind: 'shares-framework', weight: 1 },
      { id: 'e2', source: 'a', target: 'missing', kind: 'shares-framework', weight: 1 },
    ];
    const r = computeForceLayout(nodes, edges, {
      width: 400,
      height: 300,
      iterations: 10,
    });
    expect(r.edges).toHaveLength(1);
    expect(r.edges[0]!.id).toBe('e1');
  });
});

describe('map layout — nodeTone', () => {
  it('maps difficulties to expected tones', () => {
    const make = (difficulty: string) =>
      ({ kind: 'case', meta: { difficulty } } as unknown as MapNode);
    expect(nodeTone(make('intro'))).toBe('success');
    expect(nodeTone(make('standard'))).toBe('accent');
    expect(nodeTone(make('advanced'))).toBe('warning');
    expect(nodeTone(make('final-round'))).toBe('danger');
  });

  it('returns neutral for non-case nodes', () => {
    const fw: MapNode = {
      id: 'fw:x',
      kind: 'framework',
      label: 'x',
      weight: 1,
      meta: {},
    };
    expect(nodeTone(fw)).toBe('neutral');
  });
});
