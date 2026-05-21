import type { FrameworkTreeNode } from './canonical-frameworks';

/**
 * Radial layout algorithm for the framework mind map.
 *
 * Root sits at the origin. Children fan out around it. Each subtree gets
 * an angular slice proportional to its leaf count, ensuring even visual
 * weight. Leaf nodes sit at greater radial distance than branch nodes.
 */

const BASE_RADIUS = 180;
const RING_GAP = 160;
const NODE_W = 180;
const NODE_H = 56;

export interface LayoutNode {
  id: string;
  label: string;
  hint?: string;
  x: number;
  y: number;
  depth: number;
  isLeaf: boolean;
  isRoot: boolean;
}

export interface LayoutEdge {
  id: string;
  source: string;
  target: string;
}

export interface RadialLayout {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  width: number;
  height: number;
}

export function radialLayout(root: FrameworkTreeNode): RadialLayout {
  const nodes: LayoutNode[] = [];
  const edges: LayoutEdge[] = [];

  function leafCount(n: FrameworkTreeNode): number {
    if (!n.children || n.children.length === 0) return 1;
    return n.children.reduce((acc, c) => acc + leafCount(c), 0);
  }

  function place(
    node: FrameworkTreeNode,
    depth: number,
    startAngle: number,
    endAngle: number,
    parentId: string | null,
  ) {
    const midAngle = (startAngle + endAngle) / 2;
    const radius = depth === 0 ? 0 : BASE_RADIUS + (depth - 1) * RING_GAP;
    const x = Math.cos(midAngle) * radius;
    const y = Math.sin(midAngle) * radius;

    nodes.push({
      id: node.id,
      label: node.label,
      hint: node.hint,
      x,
      y,
      depth,
      isLeaf: !node.children || node.children.length === 0,
      isRoot: depth === 0,
    });

    if (parentId) {
      edges.push({
        id: `${parentId}-${node.id}`,
        source: parentId,
        target: node.id,
      });
    }

    if (node.children && node.children.length > 0) {
      const totalLeaves = leafCount(node);
      let cursor = startAngle;
      const span = endAngle - startAngle;
      for (const child of node.children) {
        const childLeaves = leafCount(child);
        const childSpan = (span * childLeaves) / totalLeaves;
        place(child, depth + 1, cursor, cursor + childSpan, node.id);
        cursor += childSpan;
      }
    }
  }

  // Root spans the full circle (2π)
  place(root, 0, 0, Math.PI * 2, null);

  // Compute extent
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const n of nodes) {
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + NODE_W);
    maxY = Math.max(maxY, n.y + NODE_H);
  }

  return {
    nodes,
    edges,
    width: maxX - minX + NODE_W * 2,
    height: maxY - minY + NODE_H * 2,
  };
}
