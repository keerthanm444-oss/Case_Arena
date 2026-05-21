'use client';

import * as React from 'react';
import { Pin, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { NodeCard } from '../NodeCard';
import { computeForceLayout, nodeTone, type PositionedNode } from '@/lib/map/layout';
import type { MapNode, MapEdge } from '@/types';

/**
 * WebView — force-directed graph.
 *
 * Pure SVG. Nodes are <circle>; edges are <line>. The layout runs once
 * synchronously when the node set or filter changes, then static.
 *
 * Interaction:
 *   - Hover a node → preview card appears (positioned next to the node)
 *   - Click a node → focus that neighborhood (dim other nodes)
 *   - Cmd-click a node → pin to Compare Tray
 *   - Pan + zoom via wheel + drag (basic)
 */

const TONE_COLORS: Record<ReturnType<typeof nodeTone>, string> = {
  accent: 'var(--accent)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  danger: 'var(--danger)',
  neutral: 'var(--fg-muted)',
};

export interface WebViewProps {
  nodes: MapNode[];
  edges: MapEdge[];
  pinnedIds: Set<string>;
  onPin: (id: string) => void;
  focusId?: string;
}

export function WebView({ nodes, edges, pinnedIds, onPin, focusId }: WebViewProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState({ width: 900, height: 600 });
  const [hoverId, setHoverId] = React.useState<string | null>(null);
  const [selectedId, setSelectedId] = React.useState<string | null>(focusId ?? null);
  const [zoom, setZoom] = React.useState(1);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const dragging = React.useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (r) setSize({ width: Math.max(300, r.width), height: Math.max(300, r.height) });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const layout = React.useMemo(
    () => computeForceLayout(nodes, edges, { width: size.width, height: size.height }),
    [nodes, edges, size.width, size.height],
  );

  // Build adjacency for neighborhood focus
  const neighbors = React.useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const n of layout.nodes) map.set(n.id, new Set([n.id]));
    for (const e of layout.edges) {
      const s = typeof e.source === 'string' ? e.source : e.source.id;
      const t = typeof e.target === 'string' ? e.target : e.target.id;
      map.get(s)?.add(t);
      map.get(t)?.add(s);
    }
    return map;
  }, [layout]);

  const focusNeighborhood = selectedId ? neighbors.get(selectedId) : null;

  function onMouseDown(e: React.MouseEvent) {
    if ((e.target as Element).tagName === 'circle') return;
    dragging.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: pan.x,
      origY: pan.y,
    };
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!dragging.current) return;
    setPan({
      x: dragging.current.origX + (e.clientX - dragging.current.startX),
      y: dragging.current.origY + (e.clientY - dragging.current.startY),
    });
  }
  function onMouseUp() {
    dragging.current = null;
  }

  function handleNodeClick(node: PositionedNode, ev: React.MouseEvent) {
    if (ev.metaKey || ev.ctrlKey) {
      onPin(node.id);
      return;
    }
    setSelectedId((cur) => (cur === node.id ? null : node.id));
  }

  const hovered = hoverId ? layout.nodes.find((n) => n.id === hoverId) : null;

  return (
    <div ref={containerRef} className="relative h-full overflow-hidden bg-bg-page">
      {/* Toolbar */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
        <Button variant="ghost" size="xs" onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))} aria-label="Zoom in">
          <ZoomIn size={11} />
        </Button>
        <Button variant="ghost" size="xs" onClick={() => setZoom((z) => Math.max(0.4, z - 0.2))} aria-label="Zoom out">
          <ZoomOut size={11} />
        </Button>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); setSelectedId(null); }}
          aria-label="Reset view"
          leading={<RefreshCw size={11} />}
        >
          Reset
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 z-10 flex items-center gap-3 text-2xs font-mono uppercase tracking-wider text-fg-subtle px-2 py-1 bg-bg-panel/80 border border-line rounded-md">
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-success" />intro</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-accent" />standard</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-warning" />advanced</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-danger" />final-round</span>
      </div>

      {/* SVG canvas */}
      <svg
        width={size.width}
        height={size.height}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        className="touch-none cursor-grab active:cursor-grabbing"
        style={{ display: 'block' }}
      >
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Edges */}
          <g>
            {layout.edges.map((e) => {
              const s = typeof e.source === 'object' ? e.source : null;
              const t = typeof e.target === 'object' ? e.target : null;
              if (!s || !t) return null;
              const dim =
                focusNeighborhood &&
                !(focusNeighborhood.has(s.id) && focusNeighborhood.has(t.id));
              return (
                <line
                  key={e.id}
                  x1={s.x}
                  y1={s.y}
                  x2={t.x}
                  y2={t.y}
                  stroke="var(--line)"
                  strokeWidth={Math.max(0.5, (e.weight ?? 0.3) * 1.5)}
                  opacity={dim ? 0.1 : 0.5}
                />
              );
            })}
          </g>

          {/* Nodes */}
          <g>
            {layout.nodes.map((n) => {
              const tone = nodeTone(n);
              const r = 5 + Math.sqrt(n.weight) * 4;
              const dim = focusNeighborhood && !focusNeighborhood.has(n.id);
              const isPinned = pinnedIds.has(n.id);
              const isSelected = selectedId === n.id;

              return (
                <g
                  key={n.id}
                  transform={`translate(${n.x}, ${n.y})`}
                  onMouseEnter={() => setHoverId(n.id)}
                  onMouseLeave={() => setHoverId((id) => (id === n.id ? null : id))}
                  onClick={(ev) => handleNodeClick(n, ev)}
                  style={{ cursor: 'pointer' }}
                  opacity={dim ? 0.25 : 1}
                >
                  <circle
                    r={r}
                    fill={TONE_COLORS[tone]}
                    stroke={isSelected ? 'var(--accent)' : 'var(--bg-page)'}
                    strokeWidth={isSelected ? 3 : 1.5}
                  />
                  {isPinned && (
                    <circle
                      r={r + 4}
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth={1.5}
                      strokeDasharray="2 2"
                    />
                  )}
                  {(isSelected || hoverId === n.id) && (
                    <text
                      y={r + 12}
                      textAnchor="middle"
                      className="font-mono"
                      style={{
                        fontSize: 10,
                        fill: 'var(--fg)',
                        pointerEvents: 'none',
                        paintOrder: 'stroke',
                        stroke: 'var(--bg-page)',
                        strokeWidth: 3,
                      }}
                    >
                      {n.label.length > 30 ? `${n.label.slice(0, 28)}…` : n.label}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </g>
      </svg>

      {/* Hover preview */}
      {hovered && (
        <div
          className="absolute z-20 pointer-events-none"
          style={{
            left: Math.min(
              size.width - 280,
              Math.max(8, (hovered as PositionedNode).x * zoom + pan.x + 20),
            ),
            top: Math.min(
              size.height - 200,
              Math.max(8, (hovered as PositionedNode).y * zoom + pan.y + 20),
            ),
          }}
        >
          <div className="bg-bg-panel border border-line rounded-md shadow-lg px-3 py-2 max-w-[260px]">
            <NodeCard node={hovered} />
            <div className="font-mono text-2xs text-fg-subtle mt-2">
              Click to focus · ⌘-click to pin
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {layout.nodes.length === 0 && (
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <div className="text-center max-w-md px-4">
            <Pin size={20} className="text-fg-subtle mx-auto mb-2" />
            <div className="font-mono text-2xs uppercase tracking-widest text-fg-muted mb-1">
              No cases match
            </div>
            <p className="text-sm text-fg-muted">
              Adjust filters or clear them to see the full graph.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
