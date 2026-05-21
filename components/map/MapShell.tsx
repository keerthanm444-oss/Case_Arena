'use client';

import * as React from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Network, GitBranch, Grid3x3, Filter as FilterIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { StatusPill } from '@/components/display/status-pill';
import { Callout } from '@/components/display/callout';
import { EmptyState } from '@/components/display/empty-state';
import { MapFilters } from './MapFilters';
import { SavedViews } from './SavedViews';
import { CompareTray } from './CompareTray';
import { WebView } from './views/WebView';
import { BranchView } from './views/BranchView';
import { MatrixView } from './views/MatrixView';
import {
  readMapUrlState,
  writeMapUrlState,
  type MapFiltersState,
  type MapUrlState,
} from '@/lib/map/url-state';
import type { MapGraph, MapNode, MapViewMode } from '@/types';

/**
 * MapShell — full-screen layout for /map.
 *
 *   ┌──────────────────────────────────────────────────────┐
 *   │  Topbar: view tabs · filter count · saved-views drop │
 *   ├──────┬───────────────────────────────────────────────┤
 *   │ Left │  Active view (Web | Branch | Matrix)          │
 *   │ rail │                                               │
 *   │      │                                               │
 *   ├──────┴───────────────────────────────────────────────┤
 *   │  Compare tray (bottom drawer)                        │
 *   └──────────────────────────────────────────────────────┘
 */

export interface MapShellProps {
  graph: MapGraph;
}

const VIEW_TABS: Array<{ id: MapViewMode; label: string; icon: React.ComponentType<{ size?: number }> }> = [
  { id: 'web', label: 'Web', icon: Network },
  { id: 'branch', label: 'Branch', icon: GitBranch },
  { id: 'matrix', label: 'Matrix', icon: Grid3x3 },
];

export function MapShell({ graph }: MapShellProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Parse URL state on mount + when URL changes
  const [state, setState] = React.useState<MapUrlState>(() =>
    readMapUrlState(new URLSearchParams(searchParams?.toString() ?? '')),
  );

  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  // Sync state → URL
  React.useEffect(() => {
    const next = writeMapUrlState(state);
    const current = searchParams?.toString() ?? '';
    if (next !== current) {
      router.replace(`${pathname}${next ? `?${next}` : ''}`, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // Filter the graph
  const filteredNodes = React.useMemo(
    () => filterNodes(graph.nodes, state.filters),
    [graph.nodes, state.filters],
  );
  const filteredEdges = React.useMemo(() => {
    const ids = new Set(filteredNodes.map((n) => n.id));
    return graph.edges.filter((e) => ids.has(e.source) && ids.has(e.target));
  }, [graph.edges, filteredNodes]);

  const pinnedIds = React.useMemo(() => new Set(state.pinned), [state.pinned]);
  const pinnedNodes = React.useMemo(
    () => state.pinned.map((id) => graph.nodes.find((n) => n.id === id)).filter((n): n is MapNode => !!n),
    [state.pinned, graph.nodes],
  );

  function setView(view: MapViewMode) {
    setState((s) => ({ ...s, view }));
  }

  function setFilters(filters: MapFiltersState) {
    setState((s) => ({ ...s, filters }));
  }

  function togglePin(id: string) {
    setState((s) => {
      if (s.pinned.includes(id)) {
        return { ...s, pinned: s.pinned.filter((x) => x !== id) };
      }
      if (s.pinned.length >= 4) return s; // max
      return { ...s, pinned: [...s.pinned, id] };
    });
  }

  function clearPins() {
    setState((s) => ({ ...s, pinned: [] }));
  }

  function applySavedView(v: { mode: MapViewMode; filters: MapFiltersState; pinned: string[] }) {
    setState((s) => ({ ...s, view: v.mode, filters: v.filters, pinned: v.pinned }));
  }

  const hasNoCases = graph.nodes.filter((n) => n.kind === 'case').length === 0;

  return (
    <div
      className={cn(
        "grid h-full transition-all",
        sidebarOpen ? "grid-cols-1 md:grid-cols-[280px_1fr]" : "grid-cols-1"
      )}
      style={{
        gridTemplateRows: 'auto 1fr auto',
      }}
    >
      {/* TOPBAR — spans both columns */}
      <header
        className="col-span-2 flex items-center justify-between gap-3 px-4 py-2 border-b border-line bg-bg-panel/95 backdrop-blur-sm"
      >
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen((v) => !v)}
            leading={<FilterIcon size={12} />}
          >
            {sidebarOpen ? 'Hide filters' : 'Show filters'}
          </Button>
          {/* View tabs */}
          <div className="ml-2 flex items-center gap-0.5 p-0.5 border border-line rounded-md">
            {VIEW_TABS.map((tab) => {
              const Icon = tab.icon;
              const active = state.view === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setView(tab.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 h-7 rounded-sm text-2xs uppercase tracking-wider font-mono',
                    'transition-colors duration-fast',
                    active
                      ? 'bg-accent text-accent-fg'
                      : 'text-fg-muted hover:text-fg hover:bg-bg-elevated',
                  )}
                  aria-pressed={active}
                >
                  <Icon size={11} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill tone="outline" size="xs">
            {filteredNodes.filter((n) => n.kind === 'case').length} / {graph.nodes.filter((n) => n.kind === 'case').length} cases
          </StatusPill>
          {filteredEdges.length > 0 && (
            <StatusPill tone="outline" size="xs">
              {filteredEdges.length} edges
            </StatusPill>
          )}
        </div>
      </header>

      {/* LEFT SIDEBAR */}
      {sidebarOpen && (
        <aside className="overflow-y-auto border-r border-line bg-bg-panel p-3 grid gap-5 auto-rows-min max-md:fixed max-md:inset-y-[var(--topbar-h)] max-md:left-0 max-md:right-0 max-md:z-sticky">
          <MapFilters
            nodes={graph.nodes}
            filters={state.filters}
            onChange={setFilters}
          />
          <SavedViews
            view={state.view}
            filters={state.filters}
            pinned={state.pinned}
            onApply={applySavedView}
          />
        </aside>
      )}

      {/* MAIN VIEW */}
      <main className="overflow-hidden relative" style={{ paddingBottom: pinnedNodes.length > 0 ? '110px' : '32px' }}>
        {hasNoCases ? (
          <div className="grid place-items-center h-full px-4">
            <EmptyState
              icon={<Network />}
              title="No cases authored yet"
              description="The map will populate as cases are added via Tissue passes. The renderer, filters, and compare tray are ready."
              actions={
                <Callout tone="note" hideIcon>
                  <span className="font-mono text-2xs uppercase tracking-wider text-fg-muted">
                    Author a case ·
                  </span>{' '}
                  Drop a file into <code>content/cases/&lt;slug&gt;.mdx</code> with valid frontmatter.
                </Callout>
              }
            />
          </div>
        ) : (
          <>
            {state.view === 'web' && (
              <WebView
                nodes={filteredNodes}
                edges={filteredEdges}
                pinnedIds={pinnedIds}
                onPin={togglePin}
                focusId={state.focus}
              />
            )}
            {state.view === 'branch' && (
              <BranchView
                nodes={filteredNodes}
                pinnedIds={pinnedIds}
                onPin={togglePin}
              />
            )}
            {state.view === 'matrix' && (
              <MatrixView
                nodes={filteredNodes}
                pinnedIds={pinnedIds}
                onPin={togglePin}
              />
            )}
          </>
        )}
      </main>

      {/* BOTTOM TRAY — spans both columns */}
      <div className="col-span-2">
        <CompareTray
          pinned={pinnedNodes}
          onUnpin={togglePin}
          onClear={clearPins}
        />
      </div>
    </div>
  );
}

function filterNodes(nodes: MapNode[], f: MapFiltersState): MapNode[] {
  return nodes.filter((n) => {
    if (n.kind !== 'case') return true; // keep non-case nodes always
    const m = n.meta;
    if (f.industries?.length && !f.industries.includes(m.industry!)) return false;
    if (f.categories?.length && !f.categories.includes(m.category!)) return false;
    if (f.difficulties?.length && !f.difficulties.includes(m.difficulty!)) return false;
    if (f.publishers?.length && !f.publishers.includes(m.sourcePublisher!)) return false;
    if (f.frameworks?.length) {
      const overlap = (m.frameworks ?? []).some((fw) => f.frameworks!.includes(fw));
      if (!overlap) return false;
    }
    if (f.onlySolved && !m.solved) return false;
    if (f.tags?.length) {
      const overlap = (m.tags ?? []).some((t) => f.tags!.includes(t));
      if (!overlap) return false;
    }
    return true;
  });
}
