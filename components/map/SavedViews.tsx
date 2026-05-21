'use client';

import * as React from 'react';
import { Bookmark, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusPill } from '@/components/display/status-pill';
import {
  listSavedViews,
  saveView,
  deleteSavedView,
} from '@/lib/map/saved-views';
import { useUIStore } from '@/lib/store';
import type { MapSavedView, MapViewMode } from '@/types';
import type { MapFiltersState } from '@/lib/map/url-state';

export interface SavedViewsProps {
  /** Current view mode (used when saving) */
  view: MapViewMode;
  /** Current filters (used when saving) */
  filters: MapFiltersState;
  /** Current pinned ids (used when saving) */
  pinned: string[];
  /** Called when the user activates a saved view */
  onApply: (view: MapSavedView) => void;
}

export function SavedViews({ view, filters, pinned, onApply }: SavedViewsProps) {
  const [saved, setSaved] = React.useState<MapSavedView[]>([]);
  const [creating, setCreating] = React.useState(false);
  const [name, setName] = React.useState('');
  const toast = useUIStore((s) => s.toast);

  React.useEffect(() => {
    void refresh();
  }, []);

  async function refresh() {
    try {
      const list = await listSavedViews();
      setSaved(list);
    } catch {
      // ignore (Dexie may be unavailable at first render)
    }
  }

  async function commit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const v: MapSavedView = {
      id: `mv-${Date.now()}`,
      name: trimmed,
      mode: view,
      filters,
      pinned,
      createdAt: new Date().toISOString(),
    };
    try {
      await saveView(v);
      setName('');
      setCreating(false);
      await refresh();
      toast('success', `Saved view · ${trimmed}`);
    } catch {
      toast('danger', 'Could not save view');
    }
  }

  async function remove(id: string) {
    await deleteSavedView(id);
    await refresh();
  }

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 font-mono text-2xs uppercase tracking-widest text-fg-muted">
          <Bookmark size={12} /> Saved views
        </span>
        {!creating && (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setCreating(true)}
            leading={<Plus size={10} />}
          >
            Save current
          </Button>
        )}
      </div>

      {creating && (
        <div className="grid gap-1.5">
          <Input
            size="sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="View name…"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') void commit();
              if (e.key === 'Escape') { setCreating(false); setName(''); }
            }}
          />
          <div className="flex items-center gap-1 justify-end">
            <Button variant="ghost" size="xs" onClick={() => { setCreating(false); setName(''); }}>
              Cancel
            </Button>
            <Button variant="primary" size="xs" onClick={() => void commit()} disabled={!name.trim()}>
              Save
            </Button>
          </div>
        </div>
      )}

      {saved.length === 0 ? (
        !creating && (
          <p className="text-2xs text-fg-subtle italic">
            No saved views yet. Set up filters and click "Save current".
          </p>
        )
      ) : (
        <ul className="grid gap-1">
          {saved.map((v) => (
            <li key={v.id} className="grid grid-cols-[1fr_auto] gap-2 items-center">
              <button
                type="button"
                onClick={() => onApply(v)}
                className={cn(
                  'min-w-0 text-left px-2 py-1.5 rounded-md',
                  'border border-line bg-bg-panel hover:bg-bg-elevated transition-colors duration-fast',
                )}
              >
                <div className="text-sm text-fg truncate">{v.name}</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <StatusPill size="xs" tone="outline">{v.mode}</StatusPill>
                  {v.pinned.length > 0 && (
                    <span className="text-2xs text-fg-subtle">
                      {v.pinned.length} pinned
                    </span>
                  )}
                </div>
              </button>
              <button
                type="button"
                onClick={() => void remove(v.id)}
                className="text-fg-subtle hover:text-danger transition-colors duration-fast"
                aria-label={`Delete view ${v.name}`}
              >
                <Trash2 size={11} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
