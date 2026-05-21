'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, Pin } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { StatusPill } from '@/components/display/status-pill';
import type { MapNode } from '@/types';

/**
 * MatrixView — Framework × Industry heatmap grid.
 *
 * Each cell's intensity = number of cases at that (framework, industry)
 * intersection. Click a cell → drill into the cases at that intersection
 * (right-side panel).
 *
 * Useful for "show me all retail profitability cases" — the cell at
 * (profitability, retail) holds exactly that set.
 */

export interface MatrixViewProps {
  nodes: MapNode[];
  pinnedIds: Set<string>;
  onPin: (id: string) => void;
}

interface Cell {
  framework: string;
  industry: string;
  cases: MapNode[];
}

export function MatrixView({ nodes, pinnedIds, onPin }: MatrixViewProps) {
  const { rows, cols, cellMap, maxCount } = React.useMemo(() => buildMatrix(nodes), [nodes]);
  const [selected, setSelected] = React.useState<Cell | null>(null);

  if (rows.length === 0 || cols.length === 0) {
    return (
      <div className="grid place-items-center h-full px-4">
        <div className="text-center max-w-md">
          <div className="font-mono text-2xs uppercase tracking-widest text-fg-muted mb-1">
            No cases match
          </div>
          <p className="text-sm text-fg-muted">
            Adjust filters or clear them to populate the matrix.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-0">
      {/* Matrix grid */}
      <div className="overflow-auto p-4">
        <div className="min-w-fit">
          <div
            className="grid gap-1"
            style={{
              gridTemplateColumns: `12rem repeat(${cols.length}, minmax(72px, 1fr))`,
            }}
          >
            {/* Top-left corner */}
            <div className="font-mono text-2xs uppercase tracking-widest text-fg-muted px-2 py-1">
              Framework / Industry →
            </div>
            {/* Column headers */}
            {cols.map((c) => (
              <div
                key={c}
                className="font-mono text-2xs uppercase tracking-wider text-fg-muted px-1 py-1 text-center"
              >
                {c}
              </div>
            ))}

            {/* Row by row */}
            {rows.map((r) => (
              <React.Fragment key={r}>
                <div className="font-mono text-2xs text-fg px-2 py-1 truncate">
                  {r}
                </div>
                {cols.map((c) => {
                  const key = `${r}::${c}`;
                  const cell = cellMap.get(key);
                  const count = cell?.cases.length ?? 0;
                  const intensity = maxCount === 0 ? 0 : count / maxCount;
                  const isSelected = selected?.framework === r && selected?.industry === c;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => count > 0 && setSelected(cell ?? null)}
                      disabled={count === 0}
                      className={cn(
                        'h-9 rounded-sm border transition-all duration-fast',
                        'flex items-center justify-center font-numeric tabular-nums text-xs',
                        count === 0 && 'cursor-default border-line bg-bg-panel text-fg-subtle opacity-50',
                        count > 0 && 'cursor-pointer hover:scale-105',
                        isSelected && 'ring-2 ring-accent ring-offset-1 ring-offset-bg-page',
                      )}
                      style={
                        count > 0
                          ? {
                              backgroundColor: `color-mix(in oklab, var(--accent) ${10 + intensity * 70}%, var(--bg-panel))`,
                              borderColor: 'var(--accent-soft)',
                              color: intensity > 0.5 ? 'var(--accent-fg)' : 'var(--fg)',
                            }
                          : undefined
                      }
                      aria-label={`${r} × ${c} — ${count} case${count === 1 ? '' : 's'}`}
                    >
                      {count > 0 ? count : ''}
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>

          {/* Scale legend */}
          <div className="mt-4 flex items-center gap-2">
            <span className="font-mono text-2xs uppercase tracking-wider text-fg-subtle">
              Heat
            </span>
            <div className="flex">
              {[0.15, 0.35, 0.55, 0.75, 0.95].map((i) => (
                <span
                  key={i}
                  className="inline-block w-6 h-3 border border-accent-soft"
                  style={{
                    backgroundColor: `color-mix(in oklab, var(--accent) ${i * 100}%, var(--bg-panel))`,
                  }}
                />
              ))}
            </div>
            <span className="font-mono text-2xs text-fg-subtle">low → high</span>
          </div>
        </div>
      </div>

      {/* Detail panel */}
      <aside className="border-l border-line bg-bg-panel overflow-y-auto">
        {selected ? (
          <div className="p-4">
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setSelected(null)}
              leading={<ArrowLeft size={10} />}
              className="mb-3"
            >
              Back
            </Button>
            <div className="font-mono text-2xs uppercase tracking-widest text-fg-muted">
              {selected.framework} × {selected.industry}
            </div>
            <div className="font-display text-md text-fg mt-1 mb-4">
              {selected.cases.length} case{selected.cases.length === 1 ? '' : 's'}
            </div>
            <div className="grid gap-2">
              {selected.cases.map((n) => {
                const slug = n.id.replace('case:', '');
                const m = n.meta;
                const isPinned = pinnedIds.has(n.id);
                return (
                  <div key={n.id} className="rounded-md border border-line bg-bg-elevated p-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Link
                        href={`/cases/${slug}`}
                        className="text-sm text-fg hover:text-accent transition-colors duration-fast leading-snug"
                      >
                        {n.label}
                      </Link>
                      <Button
                        variant={isPinned ? 'primary' : 'ghost'}
                        size="xs"
                        onClick={() => onPin(n.id)}
                        leading={<Pin size={10} />}
                      >
                        {isPinned ? '✓' : ''}
                      </Button>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                      {m.difficulty && <StatusPill size="xs" tone="outline">{m.difficulty}</StatusPill>}
                      {m.solved && <StatusPill size="xs" tone="success">solved</StatusPill>}
                      {typeof m.timeEstimate === 'number' && (
                        <span className="font-mono text-2xs text-fg-subtle">{m.timeEstimate}m</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <div className="font-mono text-2xs uppercase tracking-widest text-fg-muted mb-2">
              Detail panel
            </div>
            <p className="text-sm text-fg-muted leading-relaxed">
              Click any non-empty cell to see the cases at that
              framework × industry intersection.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}

function buildMatrix(nodes: MapNode[]): {
  rows: string[];
  cols: string[];
  cellMap: Map<string, Cell>;
  maxCount: number;
} {
  const cellMap = new Map<string, Cell>();
  const rowSet = new Set<string>();
  const colSet = new Set<string>();

  for (const n of nodes) {
    if (n.kind !== 'case') continue;
    const industry = n.meta.industry ?? 'other';
    const frameworks = n.meta.frameworks?.length ? n.meta.frameworks : ['(none)'];
    colSet.add(industry);
    for (const fw of frameworks) {
      rowSet.add(fw);
      const key = `${fw}::${industry}`;
      const cell = cellMap.get(key) ?? { framework: fw, industry, cases: [] };
      cell.cases.push(n);
      cellMap.set(key, cell);
    }
  }

  const maxCount = Array.from(cellMap.values()).reduce(
    (acc, c) => Math.max(acc, c.cases.length),
    0,
  );

  return {
    rows: Array.from(rowSet).sort(),
    cols: Array.from(colSet).sort(),
    cellMap,
    maxCount,
  };
}
