'use client';

import * as React from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { StatusPill } from '@/components/display/status-pill';
import type { MapNode } from '@/types';
import type { MapFiltersState } from '@/lib/map/url-state';
import { hasActiveFilters, clearFilters } from '@/lib/map/url-state';

/**
 * MapFilters — multi-select filters that intersect over case nodes.
 *
 * Each group is a list of chips; clicking toggles membership in the
 * corresponding filter array. The component is fully controlled — parent
 * owns the state + URL sync.
 *
 * Groups built dynamically from the actual node set so we never show a
 * filter option that wouldn't match anything.
 */

export interface MapFiltersProps {
  nodes: MapNode[];
  filters: MapFiltersState;
  onChange: (next: MapFiltersState) => void;
}

export function MapFilters({ nodes, filters, onChange }: MapFiltersProps) {
  // Derive filter options from the actual node set
  const options = React.useMemo(() => buildOptions(nodes), [nodes]);
  const active = hasActiveFilters(filters);

  function toggle<K extends keyof MapFiltersState>(
    key: K,
    value: string,
  ) {
    const current = (filters[key] as string[] | undefined) ?? [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: next.length ? next : undefined });
  }

  function setSolved(v: boolean) {
    onChange({ ...filters, onlySolved: v ? true : undefined });
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Filter size={12} className="text-fg-muted" />
          <span className="font-mono text-2xs uppercase tracking-widest text-fg-muted">
            Filters
          </span>
        </div>
        {active && (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onChange(clearFilters())}
            leading={<X size={10} />}
          >
            Clear
          </Button>
        )}
      </div>

      <FilterGroup
        label="Industry"
        options={options.industries}
        selected={filters.industries ?? []}
        onToggle={(v) => toggle('industries', v)}
      />
      <FilterGroup
        label="Category"
        options={options.categories}
        selected={filters.categories ?? []}
        onToggle={(v) => toggle('categories', v)}
      />
      <FilterGroup
        label="Difficulty"
        options={options.difficulties}
        selected={filters.difficulties ?? []}
        onToggle={(v) => toggle('difficulties', v)}
      />
      <FilterGroup
        label="Framework"
        options={options.frameworks}
        selected={filters.frameworks ?? []}
        onToggle={(v) => toggle('frameworks', v)}
        defaultOpen={false}
      />
      <FilterGroup
        label="Source"
        options={options.publishers}
        selected={filters.publishers ?? []}
        onToggle={(v) => toggle('publishers', v)}
        defaultOpen={false}
      />

      <div className="border-t border-line pt-3">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="map-only-solved" className="text-sm text-fg cursor-pointer">
            Solved only
          </label>
          <Switch
            id="map-only-solved"
            checked={Boolean(filters.onlySolved)}
            onCheckedChange={setSolved}
          />
        </div>
      </div>
    </div>
  );
}

interface FilterGroupProps {
  label: string;
  options: Array<{ value: string; count: number }>;
  selected: string[];
  onToggle: (value: string) => void;
  defaultOpen?: boolean;
}

function FilterGroup({ label, options, selected, onToggle, defaultOpen = true }: FilterGroupProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  if (options.length === 0) return null;
  return (
    <div className="border-t border-line pt-3 first:border-t-0 first:pt-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between gap-2 w-full text-left"
      >
        <span className="flex items-center gap-2 font-mono text-2xs uppercase tracking-widest text-fg-muted">
          {label}
          {selected.length > 0 && (
            <StatusPill tone="accent" size="xs">{selected.length}</StatusPill>
          )}
        </span>
        <ChevronDown
          size={11}
          className={cn(
            'text-fg-subtle transition-transform duration-fast',
            open && 'rotate-180',
          )}
        />
      </button>
      {open && (
        <div className="mt-2 flex items-center gap-1 flex-wrap">
          {options.map((opt) => {
            const isOn = selected.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onToggle(opt.value)}
                className={cn(
                  'inline-flex items-center gap-1 px-2 h-6 rounded-pill',
                  'border text-2xs font-mono tracking-wider',
                  'transition-colors duration-fast',
                  isOn
                    ? 'border-accent bg-accent text-accent-fg'
                    : 'border-line bg-bg-panel text-fg-muted hover:border-line-strong hover:text-fg',
                )}
              >
                {opt.value}
                <span className="opacity-60 tabular-nums">{opt.count}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------- Option derivation ----------

function buildOptions(nodes: MapNode[]) {
  const caseNodes = nodes.filter((n) => n.kind === 'case');
  return {
    industries: tally(caseNodes.map((n) => n.meta.industry).filter(Boolean) as string[]),
    categories: tally(caseNodes.map((n) => n.meta.category).filter(Boolean) as string[]),
    difficulties: tally(caseNodes.map((n) => n.meta.difficulty).filter(Boolean) as string[]),
    frameworks: tally(caseNodes.flatMap((n) => n.meta.frameworks ?? [])),
    publishers: tally(caseNodes.map((n) => n.meta.sourcePublisher).filter(Boolean) as string[]),
  };
}

function tally(values: string[]): Array<{ value: string; count: number }> {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count);
}
