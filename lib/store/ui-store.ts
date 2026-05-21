/**
 * UI store — ephemeral client UI state. Not persisted.
 *
 *   - palette open/close
 *   - active right-rail panel
 *   - transient toast queue
 *   - compare-tray (map) — actually this lives here even though it's a map
 *     concept, because it spans the page lifetime, not the visit
 */

'use client';

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface UIState {
  // Command palette
  paletteOpen: boolean;
  openPalette: () => void;
  closePalette: () => void;
  togglePalette: () => void;

  // Right-rail panel
  rail: 'progress' | 'related' | 'notes' | 'compare' | null;
  setRail: (rail: UIState['rail']) => void;

  // Compare tray (map)
  comparePinned: string[]; // up to 4 node ids
  pinForCompare: (nodeId: string) => 'added' | 'full' | 'duplicate';
  unpinFromCompare: (nodeId: string) => void;
  clearCompare: () => void;

  // Toasts
  toasts: Array<{ id: string; kind: 'info' | 'success' | 'warning' | 'danger'; text: string }>;
  toast: (kind: 'info' | 'success' | 'warning' | 'danger', text: string) => string;
  dismissToast: (id: string) => void;
}

const MAX_COMPARE_PINNED = 4;

export const useUIStore = create<UIState>()(
  subscribeWithSelector((set, get) => ({
    paletteOpen: false,
    openPalette: () => set({ paletteOpen: true }),
    closePalette: () => set({ paletteOpen: false }),
    togglePalette: () => set((s) => ({ paletteOpen: !s.paletteOpen })),

    rail: null,
    setRail: (rail) => set({ rail }),

    comparePinned: [],
    pinForCompare: (nodeId) => {
      const pinned = get().comparePinned;
      if (pinned.includes(nodeId)) return 'duplicate';
      if (pinned.length >= MAX_COMPARE_PINNED) return 'full';
      set({ comparePinned: [...pinned, nodeId] });
      return 'added';
    },
    unpinFromCompare: (nodeId) =>
      set((s) => ({ comparePinned: s.comparePinned.filter((n) => n !== nodeId) })),
    clearCompare: () => set({ comparePinned: [] }),

    toasts: [],
    toast: (kind, text) => {
      const id = String(Date.now()) + Math.random().toString(36).slice(2, 6);
      set((s) => ({ toasts: [...s.toasts, { id, kind, text }] }));
      // Auto-dismiss after 4s
      if (typeof window !== 'undefined') {
        window.setTimeout(() => get().dismissToast(id), 4000);
      }
      return id;
    },
    dismissToast: (id) =>
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  })),
);
