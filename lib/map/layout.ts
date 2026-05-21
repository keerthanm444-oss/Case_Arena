/**
 * Force-directed layout for the WebView.
 *
 * Uses d3-force for the simulation. Keeps the implementation small + isolated
 * so the React layer just renders <circle> + <line> from the simulation's
 * latest positions.
 *
 * Determinism: we seed the layout with a hash-based initial position per
 * node id so that the visual layout is stable across refreshes (otherwise
 * d3-force's random starts cause the graph to jiggle differently every load).
 */

import * as d3 from 'd3';
import type { MapNode, MapEdge } from '@/types';

export interface PositionedNode extends MapNode {
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  /** Whether the user is dragging this node */
  fx?: number | null;
  fy?: number | null;
}

export interface PositionedEdge extends MapEdge {
  source: PositionedNode | string;
  target: PositionedNode | string;
}

export interface ForceLayoutOptions {
  width: number;
  height: number;
  /** Number of iterations to run synchronously before yielding */
  iterations?: number;
  /** Strength of node repulsion (negative = repulsion) */
  charge?: number;
  /** Edge ideal length */
  linkDistance?: number;
  /** Strength of attraction toward center */
  centerStrength?: number;
}

/** Deterministic seed based on node id — same id, same starting position. */
function seedPosition(id: string, width: number, height: number) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0x7fffffff;
  }
  return {
    x: (hash % width) * 0.5 + width * 0.25,
    y: (((hash >>> 8) % height) * 0.5) + height * 0.25,
  };
}

/** Run the simulation synchronously to a fixed point and return positioned nodes. */
export function computeForceLayout(
  nodes: MapNode[],
  edges: MapEdge[],
  opts: ForceLayoutOptions,
): { nodes: PositionedNode[]; edges: PositionedEdge[] } {
  const { width, height, iterations = 200, charge = -160, linkDistance = 80, centerStrength = 0.05 } = opts;

  const positioned: PositionedNode[] = nodes.map((n) => ({
    ...n,
    ...seedPosition(n.id, width, height),
  }));

  // Filter edges to those whose endpoints exist
  const nodeIds = new Set(positioned.map((n) => n.id));
  const validEdges = edges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target));

  const sim = d3
    .forceSimulation<PositionedNode>(positioned)
    .force(
      'link',
      d3
        .forceLink<PositionedNode, PositionedEdge>(
          validEdges.map((e) => ({ ...e })) as PositionedEdge[],
        )
        .id((d) => d.id)
        .distance(linkDistance)
        .strength((d) => (d.weight ?? 0.5) * 0.6),
    )
    .force('charge', d3.forceManyBody().strength(charge))
    .force('center', d3.forceCenter(width / 2, height / 2).strength(centerStrength))
    .force(
      'collide',
      d3.forceCollide<PositionedNode>((d) => 8 + Math.sqrt(d.weight) * 6),
    )
    .stop();

  for (let i = 0; i < iterations; i++) sim.tick();

  return {
    nodes: positioned,
    edges: validEdges.map((e) => {
      const s = positioned.find((n) => n.id === e.source)!;
      const t = positioned.find((n) => n.id === e.target)!;
      return { ...e, source: s, target: t };
    }),
  };
}

/** Map a node id to its color category — used by web + branch views. */
export function nodeTone(node: MapNode): 'accent' | 'success' | 'warning' | 'danger' | 'neutral' {
  if (node.kind !== 'case') return 'neutral';
  switch (node.meta.difficulty) {
    case 'intro': return 'success';
    case 'standard': return 'accent';
    case 'advanced': return 'warning';
    case 'final-round': return 'danger';
    default: return 'neutral';
  }
}
