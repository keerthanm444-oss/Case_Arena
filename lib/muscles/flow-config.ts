/**
 * Shared React Flow configuration.
 *
 * React Flow's default look is generic; we override extensively to match
 * the Case Arena design language. Colors come from CSS variables so all
 * three themes work without per-theme code.
 *
 * Apply by importing the CSS once at the top of any page that mounts a
 * React Flow canvas, and using the proMode + theme constants below.
 */

import type { CSSProperties } from 'react';

/** Default options applied to every ReactFlow instance */
export const FLOW_DEFAULTS = {
  /** Fit view on mount + pad nicely */
  fitView: true,
  fitViewOptions: { padding: 0.18, includeHiddenNodes: false, duration: 240 },
  /** Snap to a coarse grid for tidy alignment */
  snapToGrid: true,
  snapGrid: [12, 12] as [number, number],
  /** Smooth deceleration on pan */
  panOnDrag: true,
  /** Faster zoom feel */
  zoomActivationKeyCode: null,
  minZoom: 0.3,
  maxZoom: 2,
  defaultViewport: { x: 0, y: 0, zoom: 1 },
  /** Disable selection-box on drag — feels wrong for trees */
  selectionOnDrag: false,
  /** Use bezier edges by default */
  defaultEdgeOptions: {
    type: 'smoothstep',
    animated: false,
    style: { stroke: 'var(--line-strong)', strokeWidth: 1.5 },
  },
} as const;

/** Background + Controls + MiniMap props that match our themes */
export const BACKGROUND_PROPS = {
  variant: 'dots' as const,
  gap: 16,
  size: 1.2,
  color: 'var(--line)',
} as const;

export const MINIMAP_STYLE: CSSProperties = {
  background: 'var(--bg-panel)',
  border: '1px solid var(--line)',
  borderRadius: 4,
};

export const CONTROLS_STYLE: CSSProperties = {
  background: 'var(--bg-overlay)',
  border: '1px solid var(--line)',
  borderRadius: 4,
  overflow: 'hidden',
  boxShadow: 'var(--shadow-2)',
};

/** Tones for node accents — semantic, theme-aware */
export const NODE_TONES = {
  neutral: {
    bg: 'var(--bg-elevated)',
    border: 'var(--line-strong)',
    text: 'var(--fg)',
    accent: 'var(--fg-muted)',
  },
  accent: {
    bg: 'var(--accent-soft)',
    border: 'var(--accent)',
    text: 'var(--fg)',
    accent: 'var(--accent)',
  },
  success: {
    bg: 'var(--bg-elevated)',
    border: 'var(--success)',
    text: 'var(--fg)',
    accent: 'var(--success)',
  },
  warning: {
    bg: 'var(--bg-elevated)',
    border: 'var(--warning)',
    text: 'var(--fg)',
    accent: 'var(--warning)',
  },
  danger: {
    bg: 'var(--bg-elevated)',
    border: 'var(--danger)',
    text: 'var(--fg)',
    accent: 'var(--danger)',
  },
  muted: {
    bg: 'var(--bg-panel)',
    border: 'var(--line)',
    text: 'var(--fg-muted)',
    accent: 'var(--fg-subtle)',
  },
} as const;

export type NodeTone = keyof typeof NODE_TONES;
