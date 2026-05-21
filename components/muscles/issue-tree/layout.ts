import type { IssueTreeData } from './types';

/**
 * Simple deterministic tree layout.
 *
 * Avoids pulling in a heavy graph library (dagre, elkjs). Instead, recursively
 * lays out children in a balanced way:
 *   - LR (default): root on the left, children stack vertically to the right
 *   - TB: root at the top, children spread horizontally below
 *
 * Each subtree's height is the sum of its leaves; nodes are placed centered
 * within their subtree's vertical span. Good enough for trees up to ~50 nodes,
 * which covers every case interview tree we'll encounter.
 */

const NODE_WIDTH = 200;
const NODE_HEIGHT = 56;
const H_GAP = 64;
const V_GAP = 18;

interface LayoutResult {
  positions: Record<string, { x: number; y: number }>;
  width: number;
  height: number;
}

export function layoutTree(data: IssueTreeData): LayoutResult {
  const layout = data.layout ?? 'LR';

  // Build adjacency
  const children: Record<string, string[]> = {};
  for (const e of data.edges) {
    (children[e.source] ||= []).push(e.target);
  }

  const positions: Record<string, { x: number; y: number }> = {};

  if (layout === 'LR') {
    // Recursively compute the vertical span of each subtree first, then place
    function spanOf(id: string): number {
      const kids = children[id] ?? [];
      if (kids.length === 0) return NODE_HEIGHT;
      return kids.reduce((acc, k, i) => {
        const childSpan = spanOf(k);
        return acc + childSpan + (i > 0 ? V_GAP : 0);
      }, 0);
    }

    function place(id: string, x: number, yCenter: number) {
      positions[id] = { x, y: yCenter - NODE_HEIGHT / 2 };
      const kids = children[id] ?? [];
      if (kids.length === 0) return;
      const totalHeight = spanOf(id);
      let cursor = yCenter - totalHeight / 2;
      for (const k of kids) {
        const childHeight = spanOf(k);
        const childCenter = cursor + childHeight / 2;
        place(k, x + NODE_WIDTH + H_GAP, childCenter);
        cursor += childHeight + V_GAP;
      }
    }

    place(data.rootId, 0, 0);
  } else {
    // TB layout — mirror of LR
    function spanOf(id: string): number {
      const kids = children[id] ?? [];
      if (kids.length === 0) return NODE_WIDTH;
      return kids.reduce((acc, k, i) => {
        const childSpan = spanOf(k);
        return acc + childSpan + (i > 0 ? H_GAP : 0);
      }, 0);
    }

    function place(id: string, xCenter: number, y: number) {
      positions[id] = { x: xCenter - NODE_WIDTH / 2, y };
      const kids = children[id] ?? [];
      if (kids.length === 0) return;
      const totalWidth = spanOf(id);
      let cursor = xCenter - totalWidth / 2;
      for (const k of kids) {
        const childWidth = spanOf(k);
        const childCenter = cursor + childWidth / 2;
        place(k, childCenter, y + NODE_HEIGHT + V_GAP * 2);
        cursor += childWidth + H_GAP;
      }
    }

    place(data.rootId, 0, 0);
  }

  // Compute overall extent
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const { x, y } of Object.values(positions)) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + NODE_WIDTH);
    maxY = Math.max(maxY, y + NODE_HEIGHT);
  }

  return {
    positions,
    width: maxX - minX,
    height: maxY - minY,
  };
}
