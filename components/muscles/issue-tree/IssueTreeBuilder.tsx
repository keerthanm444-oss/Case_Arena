'use client';

import * as React from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';

import {
  Plus, Save, Download, FileJson, FileText, ImageDown, RotateCcw, Lock,
} from 'lucide-react';

import { IssueNode, type IssueNodeData } from './nodes/IssueNode';
import { layoutTree } from './layout';
import {
  type IssueTreeData,
  type IssueTreeNodePayload,
  makeEmptyTree,
  nextNodeId,
} from './types';
import { exportJSON, exportMarkdown, exportPNG } from './export';

import {
  FLOW_DEFAULTS,
  BACKGROUND_PROPS,
  MINIMAP_STYLE,
  CONTROLS_STYLE,
} from '@/lib/muscles/flow-config';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SimpleTooltip } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { StatusPill } from '@/components/display/status-pill';
import { cn } from '@/lib/cn';

import { autoSave } from '@/lib/muscles/save-helpers';
import { useEmit } from '@/lib/event-bus';
import { useUIStore } from '@/lib/store';

/**
 * IssueTreeBuilder — fully interactive React Flow canvas.
 *
 * Two modes:
 *   - Standalone (full-page) via /tools/issue-tree
 *   - Embedded (compact, optionally read-only) inside MDX case pages
 *
 * Features:
 *   - Click a node to select; double-click to edit label
 *   - "+" button (or Tab key) on a selected node adds a child
 *   - "🗑" button (or Backspace key) deletes a non-root node
 *   - Drag to reposition; auto-layout button re-runs the tree layout
 *   - Persists to Dexie's `saves` table with kind="issue-tree"
 *   - Export: JSON, Markdown, PNG
 *
 * The tree state lives in React Flow's internal stores via the
 * `useNodesState` / `useEdgesState` hooks. We mirror to the portable
 * `IssueTreeData` shape only on save / export.
 */

const NODE_TYPES = {
  issue: IssueNode,
};

export interface IssueTreeBuilderProps {
  /** Optional pre-seeded data (e.g. case page issue tree) */
  initialData?: IssueTreeData;
  /** Optional default name */
  initialName?: string;
  /** Optional context (e.g. caseSlug) for save categorization */
  contextRef?: string;
  /** Read-only — no editing, no save. Used for embedded read-modes in published cases. */
  readOnly?: boolean;
  /** Existing save id to attach to (for resumed edits) */
  existingSaveId?: string;
  /** Embedded variants pass `embedded=true` to drop margins + use compact toolbar */
  embedded?: boolean;
  /** Optional height override (default: 70vh) */
  height?: number | string;
  className?: string;
}

export function IssueTreeBuilder({
  initialData,
  initialName,
  contextRef,
  readOnly,
  existingSaveId,
  embedded,
  height,
  className,
}: IssueTreeBuilderProps) {
  const [data, setData] = React.useState<IssueTreeData>(
    () => initialData ?? makeEmptyTree(initialName ?? 'Problem'),
  );

  // Convert IssueTreeData → React Flow nodes + edges
  const initialFlow = React.useMemo(() => treeDataToFlow(data, readOnly ?? false), []); // eslint-disable-line react-hooks/exhaustive-deps

  const [nodes, setNodes, onNodesChange] = useNodesState<IssueNodeData>(initialFlow.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<{ label?: string }>(initialFlow.edges);

  const [name, setName] = React.useState<string>(initialName ?? 'Untitled tree');
  const [saveId, setSaveId] = React.useState<string | null>(existingSaveId ?? null);
  const [dirty, setDirty] = React.useState(false);
  const flowWrapperRef = React.useRef<HTMLDivElement>(null);

  const emit = useEmit();
  const toast = useUIStore((s) => s.toast);

  // Mark dirty when nodes / edges change
  React.useEffect(() => {
    setDirty(true);
  }, [nodes, edges, name]);

  // Build the IssueTreeData snapshot from the current React Flow state
  function snapshot(): IssueTreeData {
    const positions: Record<string, { x: number; y: number }> = {};
    const nodePayloads: IssueTreeNodePayload[] = nodes.map((n) => {
      positions[n.id] = { x: n.position.x, y: n.position.y };
      return {
        id: n.id,
        label: n.data.label,
        tone: n.data.tone,
        note: n.data.note,
      };
    });
    return {
      version: 1,
      rootId: data.rootId,
      nodes: nodePayloads,
      edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target })),
      positions,
      layout: data.layout ?? 'LR',
    };
  }

  // ---- Mutations ----

  function handleAddChild(parentId: string) {
    if (readOnly) return;
    const id = nextNodeId();
    const parent = nodes.find((n) => n.id === parentId);
    if (!parent) return;
    const newNode: Node<IssueNodeData> = {
      id,
      type: 'issue',
      position: { x: parent.position.x + 240, y: parent.position.y + 80 },
      data: {
        label: 'New idea',
        tone: 'neutral',
        onAddChild: handleAddChild,
        onDelete: handleDelete,
        onLabelChange: handleLabelChange,
        readOnly,
      },
    };
    setNodes((ns) => ns.concat(newNode));
    setEdges((es) =>
      addEdge(
        {
          id: `e-${parentId}-${id}`,
          source: parentId,
          target: id,
          type: 'smoothstep',
        },
        es,
      ),
    );
  }

  function handleDelete(nodeId: string) {
    if (readOnly) return;
    if (nodeId === data.rootId) return;
    // Cascade delete: remove the node + any descendants
    const childMap: Record<string, string[]> = {};
    for (const e of edges) (childMap[e.source] ||= []).push(e.target);
    const toRemove = new Set<string>();
    function walk(id: string) {
      toRemove.add(id);
      for (const c of childMap[id] ?? []) walk(c);
    }
    walk(nodeId);
    setNodes((ns) => ns.filter((n) => !toRemove.has(n.id)));
    setEdges((es) =>
      es.filter((e) => !toRemove.has(e.source) && !toRemove.has(e.target)),
    );
  }

  function handleLabelChange(nodeId: string, newLabel: string) {
    setNodes((ns) =>
      ns.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, label: newLabel } } : n)),
    );
  }

  function handleAutoLayout() {
    const snap = snapshot();
    const result = layoutTree(snap);
    setNodes((ns) =>
      ns.map((n) => ({
        ...n,
        position: result.positions[n.id] ?? n.position,
      })),
    );
  }

  // Re-bind handlers when nodes change so they always reference current state
  React.useEffect(() => {
    setNodes((ns) =>
      ns.map((n) => ({
        ...n,
        data: {
          ...n.data,
          onAddChild: handleAddChild,
          onDelete: handleDelete,
          onLabelChange: handleLabelChange,
          readOnly: readOnly ?? false,
        },
      })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save
  async function handleSave() {
    const snap = snapshot();
    const id = await autoSave(saveId, 'issue-tree', {
      name,
      contextRef,
      data: snap,
    });
    setSaveId(id);
    setDirty(false);
    toast('success', `Saved · ${name}`);
    void emit('case.tree.edited', {
      caseSlug: contextRef ?? '',
      nodeCount: snap.nodes.length,
    });
  }

  // Exports
  function onExportJSON() {
    exportJSON(name, snapshot());
    void emit('tree.exported', { format: 'json' });
  }
  function onExportMarkdown() {
    exportMarkdown(name, snapshot());
    void emit('tree.exported', { format: 'md' });
  }
  async function onExportPNG() {
    if (!flowWrapperRef.current) return;
    try {
      await exportPNG(name, flowWrapperRef.current);
      void emit('tree.exported', { format: 'png' });
    } catch {
      toast('danger', 'PNG export failed.');
    }
  }
  function onReset() {
    if (!confirm('Discard all changes and start over?')) return;
    const empty = makeEmptyTree('Problem');
    const fresh = treeDataToFlow(empty, false);
    setData(empty);
    setNodes(fresh.nodes);
    setEdges(fresh.edges);
    setSaveId(null);
    setName('Untitled tree');
  }

  // Keyboard
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (readOnly) return;
      if (e.target instanceof HTMLElement) {
        const tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;
      }
      // Tab — add child of selected node
      if (e.key === 'Tab') {
        const sel = nodes.find((n) => n.selected);
        if (sel) {
          e.preventDefault();
          handleAddChild(sel.id);
        }
      }
      // Backspace / Delete — delete selected
      if (e.key === 'Backspace' || e.key === 'Delete') {
        const sel = nodes.find((n) => n.selected);
        if (sel) {
          e.preventDefault();
          handleDelete(sel.id);
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, readOnly]);

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Toolbar */}
      {!readOnly && (
        <div
          className={cn(
            'flex items-center justify-between gap-3 p-2',
            'border border-line rounded-t-md bg-bg-panel',
            embedded && 'p-1.5',
          )}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Input
              size="sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="max-w-[280px] font-display"
              placeholder="Name this tree…"
              aria-label="Tree name"
            />
            {dirty && (
              <StatusPill tone="warning" size="xs">
                unsaved
              </StatusPill>
            )}
            {!dirty && saveId && (
              <StatusPill tone="success" size="xs">
                saved
              </StatusPill>
            )}
          </div>
          <div className="flex items-center gap-1">
            <SimpleTooltip content="Auto-layout (re-arrange nodes)" side="bottom">
              <Button variant="ghost" size="sm" onClick={handleAutoLayout} square aria-label="Auto-layout">
                <RotateCcw size={12} />
              </Button>
            </SimpleTooltip>
            <Button variant="secondary" size="sm" onClick={handleSave} leading={<Save size={12} />}>
              Save
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" leading={<Download size={12} />}>
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={onExportJSON} leading={<FileJson size={12} />}>
                  JSON
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={onExportMarkdown} leading={<FileText size={12} />}>
                  Markdown
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={onExportPNG} leading={<ImageDown size={12} />}>
                  PNG
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={onReset}>Reset…</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {readOnly && (
        <div className="flex items-center gap-2 px-3 py-1.5 border border-line rounded-t-md bg-bg-panel">
          <Lock size={11} className="text-fg-subtle" />
          <span className="font-mono text-2xs uppercase tracking-wider text-fg-muted">
            Read-only · {name}
          </span>
        </div>
      )}

      {/* Canvas */}
      <div
        ref={flowWrapperRef}
        className={cn(
          'flex-1 border border-line border-t-0 rounded-b-md overflow-hidden bg-bg',
        )}
        style={{ height: height ?? (embedded ? 420 : '70vh') }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={(c: Connection) =>
            setEdges((es) => addEdge({ ...c, id: `e-${c.source}-${c.target}`, type: 'smoothstep' }, es))
          }
          nodeTypes={NODE_TYPES}
          {...FLOW_DEFAULTS}
          nodesDraggable={!readOnly}
          nodesConnectable={!readOnly}
          elementsSelectable={!readOnly}
          proOptions={{ hideAttribution: true }}
        >
          <Background {...BACKGROUND_PROPS} />
          <Controls style={CONTROLS_STYLE} showInteractive={false} />
          {!embedded && <MiniMap pannable zoomable style={MINIMAP_STYLE} maskColor="var(--bg-overlay)" />}
        </ReactFlow>
      </div>

      {!readOnly && !embedded && (
        <div className="mt-2 flex items-center gap-3 text-2xs font-mono text-fg-subtle tracking-wider">
          <span>Double-click to edit · Tab adds child · ⌫ deletes</span>
        </div>
      )}
    </div>
  );
}

// ---------- Helpers ----------

function treeDataToFlow(data: IssueTreeData, readOnly: boolean) {
  const layout = layoutTree(data);
  const nodes: Node<IssueNodeData>[] = data.nodes.map((n) => ({
    id: n.id,
    type: 'issue',
    position: data.positions?.[n.id] ?? layout.positions[n.id] ?? { x: 0, y: 0 },
    data: {
      label: n.label,
      tone: n.tone ?? (n.id === data.rootId ? 'accent' : 'neutral'),
      note: n.note,
      isRoot: n.id === data.rootId,
      readOnly,
    },
  }));
  const edges: Edge[] = data.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: 'smoothstep',
  }));
  return { nodes, edges };
}
