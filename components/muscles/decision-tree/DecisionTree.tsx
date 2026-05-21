'use client';

import * as React from 'react';
import { ChevronRight, GitMerge, Save, Lock } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { StatusPill } from '@/components/display/status-pill';
import { KPITile } from '@/components/display/kpi-tile';
import { Callout } from '@/components/display/callout';
import { Card } from '@/components/ui/card';
import {
  type DecisionTreeNode,
  computeEV,
  sampleDecisionTree,
  normalizeProbabilities,
} from './types';
import { autoSave } from '@/lib/muscles/save-helpers';
import { useEmit } from '@/lib/event-bus';
import { useUIStore } from '@/lib/store';

/**
 * DecisionTree muscle — sliders + payoff inputs with live EV.
 *
 * Rendered as a horizontal indented tree rather than a React Flow canvas:
 * decision trees are linear "if-then" structures that read better as a
 * styled list than as a free-form graph. EV is computed bottom-up on
 * every keystroke / slider drag.
 *
 * Optimal path is highlighted: the decision-child with the highest EV
 * gets a green left border at each Decision node.
 */

export interface DecisionTreeProps {
  initialData?: DecisionTreeNode;
  initialName?: string;
  contextRef?: string;
  readOnly?: boolean;
  existingSaveId?: string;
  embedded?: boolean;
  className?: string;
}

export function DecisionTree({
  initialData,
  initialName,
  contextRef,
  readOnly,
  existingSaveId,
  embedded,
  className,
}: DecisionTreeProps) {
  const [tree, setTree] = React.useState<DecisionTreeNode>(
    () => initialData ?? sampleDecisionTree(),
  );
  const [name, setName] = React.useState(initialName ?? 'Decision scenario');
  const [saveId, setSaveId] = React.useState<string | null>(existingSaveId ?? null);
  const [dirty, setDirty] = React.useState(false);
  const emit = useEmit();
  const toast = useUIStore((s) => s.toast);

  const ev = React.useMemo(() => computeEV(tree), [tree]);

  function updateNode(id: string, patch: Partial<DecisionTreeNode>): void {
    function walk(n: DecisionTreeNode): DecisionTreeNode {
      if (n.id === id) return { ...n, ...patch };
      if (n.children) return { ...n, children: n.children.map(walk) };
      return n;
    }
    setTree(walk(tree));
    setDirty(true);
  }

  function normalize(parentId: string): void {
    function walk(n: DecisionTreeNode): DecisionTreeNode {
      if (n.id === parentId && n.kind === 'chance') {
        const kids = n.children ?? [];
        const total = kids.reduce((acc, k) => acc + (k.probability ?? 0), 0);
        if (total === 0) {
          return {
            ...n,
            children: kids.map((k) => ({ ...k, probability: 1 / kids.length })),
          };
        }
        return {
          ...n,
          children: kids.map((k) => ({
            ...k,
            probability: (k.probability ?? 0) / total,
          })),
        };
      }
      if (n.children) return { ...n, children: n.children.map(walk) };
      return n;
    }
    setTree(walk(tree));
    setDirty(true);
  }

  async function handleSave() {
    const id = await autoSave(saveId, 'decision-tree', {
      name,
      contextRef,
      data: tree,
    });
    setSaveId(id);
    setDirty(false);
    void emit('decision.tree.scenario.saved', { name, ev: ev.rootEV });
    toast('success', `Saved · ${name}`);
  }

  function handleReset() {
    setTree(normalizeProbabilities(sampleDecisionTree()));
    setName('Decision scenario');
    setSaveId(null);
    setDirty(false);
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Toolbar */}
      {!readOnly && (
        <div className="flex items-center justify-between gap-3 p-2 border border-line rounded-t-md bg-bg-panel">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Input
              size="sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="max-w-[280px]"
              aria-label="Scenario name"
            />
            {dirty && <StatusPill tone="warning" size="xs">unsaved</StatusPill>}
            {!dirty && saveId && (
              <StatusPill tone="success" size="xs">saved</StatusPill>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={handleReset}>
              Reset
            </Button>
            <Button variant="secondary" size="sm" onClick={handleSave} leading={<Save size={12} />}>
              Save
            </Button>
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

      {/* KPI band */}
      <div
        className={cn(
          'grid grid-cols-2 md:grid-cols-3 gap-2 p-3',
          'border-x border-line bg-bg-panel',
        )}
      >
        <KPITile
          label="Expected value (root)"
          value={ev.rootEV.toFixed(2)}
          sub={`Best decision · ${ev.optimalChild[tree.id] ? labelOf(tree, ev.optimalChild[tree.id]!) : '—'}`}
          variant="accent"
          size="sm"
        />
        <KPITile
          label="Tree shape"
          value={countNodes(tree)}
          sub={`${countLeaves(tree)} leaves`}
          size="sm"
        />
        <KPITile
          label="Decisions"
          value={countDecisions(tree)}
          sub={`${countChance(tree)} chance nodes`}
          size="sm"
        />
      </div>

      {/* Tree */}
      <Card variant="panel" className="rounded-t-none border-t-0">
        <div className="p-3">
          <DecisionTreeView
            node={tree}
            depth={0}
            evByNode={ev.evByNode}
            optimalChild={ev.optimalChild}
            readOnly={readOnly ?? false}
            updateNode={updateNode}
            normalize={normalize}
          />
        </div>
      </Card>

      {!readOnly && !embedded && (
        <Callout tone="note" className="mt-3" hideIcon>
          <span className="font-mono text-2xs uppercase tracking-wider text-fg-muted">
            How EV is computed ·
          </span>{' '}
          Leaf = payoff · Chance = Σ(p × child EV) · Decision = max(child EV).
          Probabilities under a chance node must sum to 1 — use "normalize"
          to auto-fix.
        </Callout>
      )}
    </div>
  );
}

// ---------- Recursive view ----------

interface ViewProps {
  node: DecisionTreeNode;
  depth: number;
  evByNode: Record<string, number>;
  optimalChild: Record<string, string>;
  readOnly: boolean;
  updateNode: (id: string, patch: Partial<DecisionTreeNode>) => void;
  normalize: (parentId: string) => void;
}

function DecisionTreeView({
  node,
  depth,
  evByNode,
  optimalChild,
  readOnly,
  updateNode,
  normalize,
}: ViewProps) {
  const kids = node.children ?? [];
  const isOptimalAtParent = false; // applied to children by parent below
  const ev = evByNode[node.id] ?? 0;

  return (
    <div className={cn(depth > 0 && 'pl-4 border-l border-line ml-1.5')}>
      <NodeRow node={node} depth={depth} ev={ev} isOptimal={isOptimalAtParent} readOnly={readOnly} updateNode={updateNode} />
      {node.kind === 'chance' && kids.length > 0 && !readOnly && (
        <div className="pl-3 mb-1">
          <Button variant="ghost" size="xs" onClick={() => normalize(node.id)}>
            Normalize probabilities
          </Button>
        </div>
      )}
      {kids.map((k) => {
        const isOptimal =
          node.kind === 'decision' && optimalChild[node.id] === k.id;
        return (
          <div
            key={k.id}
            className={cn(isOptimal && 'border-l-2 border-l-success -ml-px')}
          >
            <DecisionTreeView
              node={k}
              depth={depth + 1}
              evByNode={evByNode}
              optimalChild={optimalChild}
              readOnly={readOnly}
              updateNode={updateNode}
              normalize={normalize}
            />
          </div>
        );
      })}
    </div>
  );
}

function NodeRow({
  node,
  depth,
  ev,
  readOnly,
  updateNode,
}: {
  node: DecisionTreeNode;
  depth: number;
  ev: number;
  isOptimal: boolean;
  readOnly: boolean;
  updateNode: (id: string, patch: Partial<DecisionTreeNode>) => void;
}) {
  const tone = node.kind === 'decision' ? 'accent' : node.kind === 'chance' ? 'warning' : 'success';

  return (
    <div className="flex items-center gap-2 py-1.5">
      <ChevronRight size={11} className="text-fg-subtle shrink-0" />
      <StatusPill tone={tone as 'accent' | 'warning' | 'success'} size="xs">
        {node.kind}
      </StatusPill>
      {readOnly ? (
        <span className="text-sm text-fg flex-1 truncate">{node.label}</span>
      ) : (
        <Input
          value={node.label}
          onChange={(e) => updateNode(node.id, { label: e.target.value })}
          className="text-sm h-7 px-2 flex-1 min-w-0 max-w-[320px]"
          aria-label="Node label"
        />
      )}

      {/* Probability — only for chance children */}
      {node.probability !== undefined && (
        <ProbabilityControl
          value={node.probability}
          readOnly={readOnly}
          onChange={(v) => updateNode(node.id, { probability: v })}
        />
      )}

      {/* Payoff — only for leaves */}
      {node.kind === 'leaf' && (
        <PayoffControl
          value={node.payoff ?? 0}
          unit={node.unit ?? '$'}
          readOnly={readOnly}
          onChange={(v) => updateNode(node.id, { payoff: v })}
        />
      )}

      {/* EV */}
      <span
        className={cn(
          'font-numeric tabular-nums text-xs px-2 py-0.5 rounded-sm',
          'border bg-bg-panel',
          ev >= 0 ? 'text-success border-success/30' : 'text-danger border-danger/30',
          'min-w-[60px] text-right',
        )}
        title="Expected value"
      >
        EV {ev.toFixed(1)}
      </span>
    </div>
  );
}

function ProbabilityControl({
  value,
  readOnly,
  onChange,
}: {
  value: number;
  readOnly: boolean;
  onChange: (v: number) => void;
}) {
  if (readOnly) {
    return (
      <span className="font-mono text-2xs text-fg-muted min-w-[3rem] text-right tabular-nums">
        p={value.toFixed(2)}
      </span>
    );
  }
  return (
    <div className="flex items-center gap-2 shrink-0">
      <span className="font-mono text-2xs text-fg-subtle">p</span>
      <Slider
        value={[Math.round(value * 100)]}
        onValueChange={(vals) => onChange((vals[0] ?? 0) / 100)}
        min={0}
        max={100}
        step={1}
        className="w-24"
      />
      <span className="font-mono text-2xs text-fg-muted tabular-nums w-9 text-right">
        {(value * 100).toFixed(0)}%
      </span>
    </div>
  );
}

function PayoffControl({
  value,
  unit,
  readOnly,
  onChange,
}: {
  value: number;
  unit: string;
  readOnly: boolean;
  onChange: (v: number) => void;
}) {
  if (readOnly) {
    return (
      <span className="font-mono text-2xs text-fg-muted tabular-nums">
        {value} {unit}
      </span>
    );
  }
  return (
    <div className="flex items-center gap-1 shrink-0">
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value || '0'))}
        className="w-20 h-7 px-2"
        aria-label="Payoff"
      />
      <span className="font-mono text-2xs text-fg-subtle">{unit}</span>
    </div>
  );
}

// ---------- small helpers ----------

function countNodes(n: DecisionTreeNode): number {
  return 1 + (n.children?.reduce((acc, k) => acc + countNodes(k), 0) ?? 0);
}
function countLeaves(n: DecisionTreeNode): number {
  if (!n.children || n.children.length === 0) return 1;
  return n.children.reduce((acc, k) => acc + countLeaves(k), 0);
}
function countDecisions(n: DecisionTreeNode): number {
  return (n.kind === 'decision' ? 1 : 0) +
    (n.children?.reduce((acc, k) => acc + countDecisions(k), 0) ?? 0);
}
function countChance(n: DecisionTreeNode): number {
  return (n.kind === 'chance' ? 1 : 0) +
    (n.children?.reduce((acc, k) => acc + countChance(k), 0) ?? 0);
}
function labelOf(tree: DecisionTreeNode, id: string): string | undefined {
  if (tree.id === id) return tree.label;
  for (const k of tree.children ?? []) {
    const r = labelOf(k, id);
    if (r) return r;
  }
  return undefined;
}
