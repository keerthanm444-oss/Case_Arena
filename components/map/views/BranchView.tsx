'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronRight, Pin, Clock } from 'lucide-react';
import { cn } from '@/lib/cn';
import { StatusPill } from '@/components/display/status-pill';
import { Button } from '@/components/ui/button';
import type { MapNode } from '@/types';

/**
 * BranchView — hierarchical layout grouped by industry → category → case.
 *
 * Pure CSS grid, no force simulation. Industries collapse/expand;
 * categories show as second-level headings; cases are leaf rows.
 *
 * Cmd-click on a row → pin to Compare Tray.
 */

export interface BranchViewProps {
  nodes: MapNode[];
  pinnedIds: Set<string>;
  onPin: (id: string) => void;
}

interface Grouped {
  industry: string;
  categories: Array<{
    category: string;
    cases: MapNode[];
  }>;
}

export function BranchView({ nodes, pinnedIds, onPin }: BranchViewProps) {
  const groups = React.useMemo(() => groupNodes(nodes), [nodes]);
  const [collapsed, setCollapsed] = React.useState<Set<string>>(new Set());

  function toggle(key: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  if (groups.length === 0) {
    return (
      <div className="grid place-items-center h-full px-4">
        <div className="text-center max-w-md">
          <div className="font-mono text-2xs uppercase tracking-widest text-fg-muted mb-1">
            No cases match
          </div>
          <p className="text-sm text-fg-muted">
            Adjust filters or clear them to see the full hierarchy.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-4 py-3">
      <div className="grid gap-5 max-w-4xl mx-auto">
        {groups.map((g) => {
          const isCollapsed = collapsed.has(g.industry);
          const caseCount = g.categories.reduce((acc, c) => acc + c.cases.length, 0);
          return (
            <section key={g.industry}>
              <button
                type="button"
                onClick={() => toggle(g.industry)}
                className="w-full grid grid-cols-[1.25rem_1fr_auto] gap-2 items-center mb-2 text-left group"
              >
                <ChevronRight
                  size={12}
                  className={cn(
                    'text-fg-muted transition-transform duration-fast',
                    !isCollapsed && 'rotate-90',
                  )}
                />
                <div className="font-display text-lg text-fg capitalize">
                  {g.industry}
                </div>
                <StatusPill tone="outline" size="xs">{caseCount}</StatusPill>
              </button>

              {!isCollapsed && (
                <div className="pl-5 grid gap-3">
                  {g.categories.map((c) => (
                    <div key={`${g.industry}-${c.category}`}>
                      <div className="font-mono text-2xs uppercase tracking-widest text-fg-muted mb-1.5 flex items-center gap-2">
                        {c.category}
                        <span className="text-fg-subtle">·</span>
                        <span className="text-fg-subtle">{c.cases.length}</span>
                      </div>
                      <div className="grid gap-1">
                        {c.cases.map((n) => (
                          <CaseRow
                            key={n.id}
                            node={n}
                            isPinned={pinnedIds.has(n.id)}
                            onPin={() => onPin(n.id)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function CaseRow({ node, isPinned, onPin }: { node: MapNode; isPinned: boolean; onPin: () => void }) {
  const slug = node.id.replace('case:', '');
  const m = node.meta;
  return (
    <div
      className={cn(
        'grid grid-cols-[1fr_auto] gap-3 items-center px-3 py-2 rounded-md',
        'border border-line bg-bg-panel hover:bg-bg-elevated',
        'transition-colors duration-fast',
      )}
    >
      <div className="min-w-0">
        <Link
          href={`/cases/${slug}`}
          className="text-sm text-fg hover:text-accent transition-colors duration-fast"
        >
          {node.label}
        </Link>
        <div className="flex items-center gap-1 flex-wrap mt-1">
          {m.difficulty && (
            <StatusPill
              size="xs"
              tone={
                m.difficulty === 'intro' || m.difficulty === 'standard'
                  ? 'success'
                  : m.difficulty === 'advanced'
                    ? 'warning'
                    : 'danger'
              }
            >
              {m.difficulty}
            </StatusPill>
          )}
          {typeof m.timeEstimate === 'number' && (
            <span className="font-mono text-2xs text-fg-subtle flex items-center gap-0.5">
              <Clock size={9} /> {m.timeEstimate}m
            </span>
          )}
          {m.solved && <StatusPill tone="success" size="xs">solved</StatusPill>}
          {m.frameworks?.slice(0, 2).map((f) => (
            <span
              key={f}
              className="font-mono text-2xs px-1 rounded-sm border border-line text-fg-subtle"
            >
              {f}
            </span>
          ))}
          {(m.frameworks?.length ?? 0) > 2 && (
            <span className="font-mono text-2xs text-fg-subtle">
              +{(m.frameworks?.length ?? 0) - 2}
            </span>
          )}
        </div>
      </div>
      <Button
        variant={isPinned ? 'primary' : 'ghost'}
        size="xs"
        onClick={onPin}
        leading={<Pin size={10} />}
      >
        {isPinned ? 'Pinned' : 'Pin'}
      </Button>
    </div>
  );
}

function groupNodes(nodes: MapNode[]): Grouped[] {
  const cases = nodes.filter((n) => n.kind === 'case');
  const byIndustry = new Map<string, MapNode[]>();
  for (const n of cases) {
    const i = n.meta.industry ?? 'other';
    if (!byIndustry.has(i)) byIndustry.set(i, []);
    byIndustry.get(i)!.push(n);
  }

  return Array.from(byIndustry.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .map(([industry, items]) => {
      const byCategory = new Map<string, MapNode[]>();
      for (const n of items) {
        const c = n.meta.category ?? 'other';
        if (!byCategory.has(c)) byCategory.set(c, []);
        byCategory.get(c)!.push(n);
      }
      const categories = Array.from(byCategory.entries())
        .sort((a, b) => b[1].length - a[1].length)
        .map(([category, cs]) => ({
          category,
          cases: cs.sort((a, b) => a.label.localeCompare(b.label)),
        }));
      return { industry, categories };
    });
}
