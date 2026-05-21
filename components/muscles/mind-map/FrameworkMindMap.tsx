'use client';

import * as React from 'react';
import ReactFlow, {
  Background,
  Controls,
  type Node,
  type Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Handle, Position, type NodeProps } from 'reactflow';
import { ExternalLink } from 'lucide-react';

import { cn } from '@/lib/cn';
import {
  FLOW_DEFAULTS,
  BACKGROUND_PROPS,
  CONTROLS_STYLE,
  NODE_TONES,
} from '@/lib/muscles/flow-config';
import { Button } from '@/components/ui/button';
import { Callout } from '@/components/display/callout';
import { StatusPill } from '@/components/display/status-pill';
import {
  CANONICAL_FRAMEWORKS,
  getCanonicalFramework,
  type CanonicalFramework,
} from './canonical-frameworks';
import { radialLayout } from './radial-layout';
import { FRAMEWORK_SPINE } from '@/lib/content/frameworks';
import { useEmit } from '@/lib/event-bus';

/**
 * FrameworkMindMap — radial visualization of a canonical framework.
 *
 * Built-in frameworks load from `canonical-frameworks.ts`. A picker at the
 * top lets the user switch frameworks. Hover any node for the hint text.
 *
 * Read-only by default (the canonical structure is fixed). User-forking
 * (creating editable variants) is a future addition wired through Dexie's
 * `saves` table (kind: 'framework-fork').
 */

const NODE_TYPES = { framework: FrameworkNode };

export interface FrameworkMindMapProps {
  /** Initial framework slug (default: profitability) */
  initialSlug?: string;
  /** Embedded variant — compact toolbar, fixed height */
  embedded?: boolean;
  /** Height override */
  height?: number | string;
  className?: string;
}

export function FrameworkMindMap({
  initialSlug = 'profitability',
  embedded,
  height,
  className,
}: FrameworkMindMapProps) {
  const [slug, setSlug] = React.useState(initialSlug);
  const framework = getCanonicalFramework(slug);
  const emit = useEmit();

  React.useEffect(() => {
    void emit('mindmap.framework.forked', {
      parentFrameworkId: slug,
      newId: `view:${slug}`,
    });
  }, [slug, emit]);

  if (!framework) {
    return <FrameworkMissing slug={slug} />;
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Toolbar */}
      <div
        className={cn(
          'flex items-center justify-between gap-3 px-3 py-2',
          'border border-line rounded-t-md bg-bg-panel',
        )}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <select
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className={cn(
              'h-8 px-2 rounded-md text-sm',
              'bg-bg-elevated border border-line text-fg',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
            )}
            aria-label="Choose framework"
          >
            {FRAMEWORK_SPINE.map((f) => (
              <option key={f.slug} value={f.slug}>
                {f.name}
              </option>
            ))}
          </select>
          <FrameworkAttribution framework={framework} />
        </div>
        <StatusPill tone="outline" size="xs">read-only</StatusPill>
      </div>

      {/* Canvas */}
      <FrameworkCanvas
        framework={framework}
        height={height ?? (embedded ? 480 : '70vh')}
      />
    </div>
  );
}

// ---------- The actual flow canvas ----------

function FrameworkCanvas({
  framework,
  height,
}: {
  framework: CanonicalFramework;
  height: number | string;
}) {
  // Memoize so the layout doesn't recompute on every render
  const { nodes, edges } = React.useMemo(() => {
    const layout = radialLayout(framework.root);
    const flowNodes: Node[] = layout.nodes.map((n) => ({
      id: n.id,
      type: 'framework',
      position: { x: n.x, y: n.y },
      data: {
        label: n.label,
        hint: n.hint,
        depth: n.depth,
        isLeaf: n.isLeaf,
        isRoot: n.isRoot,
      },
      draggable: false,
      selectable: true,
    }));
    const flowEdges: Edge[] = layout.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: 'smoothstep',
      style: {
        stroke: 'var(--line-strong)',
        strokeWidth: 1.5,
      },
    }));
    return { nodes: flowNodes, edges: flowEdges };
  }, [framework]);

  return (
    <div
      className="flex-1 border border-line border-t-0 rounded-b-md overflow-hidden bg-bg"
      style={{ height }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        {...FLOW_DEFAULTS}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        proOptions={{ hideAttribution: true }}
      >
        <Background {...BACKGROUND_PROPS} />
        <Controls style={CONTROLS_STYLE} showInteractive={false} />
      </ReactFlow>
    </div>
  );
}

// ---------- Custom node ----------

interface FrameworkNodeData {
  label: string;
  hint?: string;
  depth: number;
  isLeaf: boolean;
  isRoot: boolean;
}

function FrameworkNode({ data }: NodeProps<FrameworkNodeData>) {
  const tone = NODE_TONES[
    data.isRoot ? 'accent' : data.isLeaf ? 'muted' : 'neutral'
  ];

  return (
    <div
      className={cn(
        'group relative px-3 py-2 rounded-md border-2',
        'min-w-[160px] max-w-[240px]',
        data.isRoot && 'min-w-[200px]',
      )}
      style={{
        background: tone.bg,
        borderColor: tone.border,
        color: tone.text,
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: 'transparent', border: 'none', width: 1, height: 1 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: 'transparent', border: 'none', width: 1, height: 1 }}
      />
      <div
        className={cn(
          'leading-snug',
          data.isRoot ? 'font-display text-md' : 'text-sm',
        )}
        style={
          data.isRoot
            ? {
                fontVariationSettings: "'opsz' 48, 'SOFT' 60",
                textAlign: 'center',
              }
            : undefined
        }
      >
        {data.label}
      </div>
      {data.hint && (
        <div className="text-2xs text-fg-subtle mt-1 italic leading-tight">
          {data.hint}
        </div>
      )}
    </div>
  );
}

// ---------- Helpers ----------

function FrameworkAttribution({ framework }: { framework: CanonicalFramework }) {
  return (
    <div className="hidden md:flex items-center gap-1.5 font-mono text-2xs uppercase tracking-wider text-fg-subtle truncate">
      <span>Source ·</span>
      <span className="truncate">{framework.source.publisher}</span>
      {framework.source.year && <span>· {framework.source.year}</span>}
    </div>
  );
}

function FrameworkMissing({ slug }: { slug: string }) {
  return (
    <Callout tone="warning" title="Framework not found">
      No canonical tree registered for <code>{slug}</code>.
    </Callout>
  );
}
