import { describe, it, expect } from 'vitest';
import { layoutTree } from '@/components/muscles/issue-tree/layout';
import { makeEmptyTree } from '@/components/muscles/issue-tree/types';

describe('issue tree — layout', () => {
  it('places the root at (0, 0) for an empty tree', () => {
    const t = makeEmptyTree();
    const r = layoutTree(t);
    expect(r.positions['root']).toEqual({ x: 0, y: 0 });
  });

  it('places children to the right of the root in LR mode', () => {
    const t = {
      ...makeEmptyTree(),
      nodes: [
        { id: 'root', label: 'r' },
        { id: 'a', label: 'a' },
        { id: 'b', label: 'b' },
      ],
      edges: [
        { id: 'e1', source: 'root', target: 'a' },
        { id: 'e2', source: 'root', target: 'b' },
      ],
    };
    const r = layoutTree(t);
    expect(r.positions['a']!.x).toBeGreaterThan(r.positions['root']!.x);
    expect(r.positions['b']!.x).toBeGreaterThan(r.positions['root']!.x);
    // The two children should be vertically separated
    expect(r.positions['a']!.y).not.toEqual(r.positions['b']!.y);
  });

  it('returns positive width/height with multiple nodes', () => {
    const t = {
      ...makeEmptyTree(),
      nodes: [
        { id: 'root', label: 'r' },
        { id: 'a', label: 'a' },
      ],
      edges: [{ id: 'e1', source: 'root', target: 'a' }],
    };
    const r = layoutTree(t);
    expect(r.width).toBeGreaterThan(0);
    expect(r.height).toBeGreaterThan(0);
  });
});
