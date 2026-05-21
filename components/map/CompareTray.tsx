'use client';

import * as React from 'react';
import Link from 'next/link';
import { GitCompare, X, ChevronUp, ChevronDown, ExternalLink, Clock } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { StatusPill } from '@/components/display/status-pill';
import { Tag } from '@/components/display/tag';
import type { MapNode } from '@/types';

/**
 * CompareTray — bottom drawer holding up to 4 pinned case nodes.
 *
 * When the tray has 0 pins, it shows a tiny minimized hint bar at the
 * bottom. With 1+ pins, it expands to show each card horizontally with
 * the option to click "Compare" to enter a dedicated side-by-side view.
 *
 * Pin storage is owned by parent (MapShell) so the URL stays in sync.
 */

const MAX_PINS = 4;

export interface CompareTrayProps {
  pinned: MapNode[];
  onUnpin: (id: string) => void;
  onClear: () => void;
}

export function CompareTray({ pinned, onUnpin, onClear }: CompareTrayProps) {
  const [open, setOpen] = React.useState(false);
  const [comparing, setComparing] = React.useState(false);

  React.useEffect(() => {
    if (pinned.length === 0) setComparing(false);
  }, [pinned.length]);

  if (pinned.length === 0) {
    return (
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-30',
          'border-t border-line bg-bg-panel/95 backdrop-blur-sm',
        )}
      >
        <div className="px-4 py-1.5 max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-fg-muted">
            <GitCompare size={11} />
            <span className="font-mono text-2xs uppercase tracking-widest">
              Compare tray · empty
            </span>
            <span className="text-2xs text-fg-subtle">
              Pin up to {MAX_PINS} cases to compare
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-30',
        'border-t border-line bg-bg-panel/95 backdrop-blur-sm',
        'transition-[max-height] duration-base',
        comparing && open ? 'max-h-[60vh]' : open ? 'max-h-[35vh]' : 'max-h-[120px]',
        'overflow-hidden',
      )}
    >
      {/* Header strip */}
      <div className="px-4 py-2 max-w-7xl mx-auto flex items-center justify-between gap-3 border-b border-line">
        <div className="flex items-center gap-2 text-fg">
          <GitCompare size={13} className="text-accent" />
          <span className="font-mono text-2xs uppercase tracking-widest">
            Compare tray
          </span>
          <StatusPill tone="accent" size="xs">{pinned.length} / {MAX_PINS}</StatusPill>
        </div>
        <div className="flex items-center gap-1">
          {pinned.length >= 2 && (
            <Button
              variant={comparing ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => {
                setComparing((v) => !v);
                setOpen(true);
              }}
            >
              {comparing ? 'Hide diff' : 'Compare side-by-side'}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClear} leading={<X size={11} />}>
            Clear
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen((v) => !v)}
            leading={open ? <ChevronDown size={11} /> : <ChevronUp size={11} />}
            aria-label={open ? 'Collapse' : 'Expand'}
          >
            {open ? 'Collapse' : 'Expand'}
          </Button>
        </div>
      </div>

      {/* Compact row of pins (always visible) */}
      <div className="max-w-7xl mx-auto px-4 py-2 overflow-x-auto">
        {!comparing ? (
          <div className="flex items-stretch gap-2">
            {pinned.map((n) => (
              <PinCard key={n.id} node={n} onUnpin={() => onUnpin(n.id)} compact={!open} />
            ))}
            {pinned.length < MAX_PINS && (
              <div
                className={cn(
                  'flex items-center justify-center gap-1.5 border border-dashed border-line rounded-md',
                  'text-fg-subtle min-w-[200px] px-3 py-2 text-2xs font-mono uppercase tracking-wider',
                )}
              >
                Pin a case to add
              </div>
            )}
          </div>
        ) : (
          <CompareGrid nodes={pinned} onUnpin={onUnpin} />
        )}
      </div>
    </div>
  );
}

function PinCard({ node, onUnpin, compact }: { node: MapNode; onUnpin: () => void; compact?: boolean }) {
  const slug = node.id.replace(/^case:/, '');
  const m = node.meta;
  return (
    <div
      className={cn(
        'flex flex-col gap-1 px-3 py-2 rounded-md border border-line bg-bg-elevated min-w-[220px] flex-1 max-w-[280px]',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm text-fg leading-snug truncate flex-1">
          {node.label}
        </div>
        <button
          type="button"
          onClick={onUnpin}
          className="text-fg-subtle hover:text-danger transition-colors duration-fast"
          aria-label="Unpin"
        >
          <X size={11} />
        </button>
      </div>
      {!compact && (
        <>
          <div className="flex items-center gap-1 flex-wrap">
            {m.industry && <StatusPill tone="accent" size="xs">{m.industry}</StatusPill>}
            {m.difficulty && <StatusPill tone="outline" size="xs">{m.difficulty}</StatusPill>}
            {typeof m.timeEstimate === 'number' && (
              <span className="font-mono text-2xs text-fg-subtle flex items-center gap-0.5">
                <Clock size={9} /> {m.timeEstimate}m
              </span>
            )}
          </div>
          <Link
            href={`/cases/${slug}`}
            className="inline-flex items-center gap-1 text-2xs text-accent hover:underline mt-1"
          >
            Open <ExternalLink size={9} />
          </Link>
        </>
      )}
    </div>
  );
}

/** Side-by-side comparison grid. Each row is a property; each column is a case.
 *  Differences are subtly highlighted. */
function CompareGrid({ nodes, onUnpin }: { nodes: MapNode[]; onUnpin: (id: string) => void }) {
  const rows: Array<{ label: string; values: (string | undefined)[] }> = [
    { label: 'Title',      values: nodes.map((n) => n.label) },
    { label: 'Industry',   values: nodes.map((n) => n.meta.industry) },
    { label: 'Category',   values: nodes.map((n) => n.meta.category) },
    { label: 'Difficulty', values: nodes.map((n) => n.meta.difficulty) },
    { label: 'Time',       values: nodes.map((n) => n.meta.timeEstimate ? `${n.meta.timeEstimate}m` : undefined) },
    { label: 'Source',     values: nodes.map((n) => n.meta.sourcePublisher) },
    { label: 'Solved',     values: nodes.map((n) => (n.meta.solved ? '✓' : '—')) },
    { label: 'Frameworks', values: nodes.map((n) => n.meta.frameworks?.join(', ')) },
    { label: 'Tags',       values: nodes.map((n) => n.meta.tags?.join(', ')) },
  ];

  return (
    <div className="grid gap-1 max-h-[44vh] overflow-y-auto pr-1">
      {/* Header row with unpin buttons */}
      <div
        className="grid gap-2 px-2 py-2 sticky top-0 bg-bg-panel/95 backdrop-blur-sm z-10 border-b border-line"
        style={{ gridTemplateColumns: `7rem repeat(${nodes.length}, minmax(160px, 1fr))` }}
      >
        <div />
        {nodes.map((n) => (
          <div key={n.id} className="flex items-start justify-between gap-1">
            <Link
              href={`/cases/${n.id.replace('case:', '')}`}
              className="text-sm text-fg hover:text-accent transition-colors duration-fast leading-snug truncate"
            >
              {n.label}
            </Link>
            <button
              type="button"
              onClick={() => onUnpin(n.id)}
              className="text-fg-subtle hover:text-danger transition-colors duration-fast shrink-0"
              aria-label="Unpin"
            >
              <X size={11} />
            </button>
          </div>
        ))}
      </div>

      {rows.slice(1).map((row) => {
        const allSame = row.values.every((v, _, arr) => v === arr[0]);
        return (
          <div
            key={row.label}
            className="grid gap-2 px-2 py-1.5 items-baseline rounded-sm hover:bg-bg-elevated"
            style={{ gridTemplateColumns: `7rem repeat(${nodes.length}, minmax(160px, 1fr))` }}
          >
            <div className="font-mono text-2xs uppercase tracking-wider text-fg-subtle">
              {row.label}
            </div>
            {row.values.map((v, i) => (
              <div
                key={i}
                className={cn(
                  'text-xs',
                  allSame ? 'text-fg-muted' : 'text-fg',
                )}
              >
                {v ?? <span className="text-fg-subtle">—</span>}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
