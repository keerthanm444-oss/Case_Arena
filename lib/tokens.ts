/**
 * tokens.ts — Single source of truth for design tokens in TS-land.
 * Tailwind config consumes this; runtime code (chart palettes, motion
 * presets) also reads from here. Keep in lock-step with styles/tokens/*.
 */

export const themes = ['terminal', 'boardroom', 'daylight'] as const;
export type ThemeId = (typeof themes)[number];

export const densities = ['comfortable', 'compact', 'dense'] as const;
export type Density = (typeof densities)[number];

/** Semantic color tokens — names match CSS variables in colors.css */
export const semanticColors = [
  'bg',
  'bg-elevated',
  'bg-sunken',
  'bg-panel',
  'bg-overlay',
  'fg',
  'fg-muted',
  'fg-subtle',
  'fg-inverse',
  'line',
  'line-strong',
  'accent',
  'accent-fg',
  'accent-soft',
  'success',
  'warning',
  'danger',
  'info',
  'selection-bg',
  'selection-fg',
  'ring',
  'ring-offset',
] as const;

/** Data viz palette — 8 distinguishable hues per theme */
export const vizPaletteVars = [
  '--viz-1','--viz-2','--viz-3','--viz-4',
  '--viz-5','--viz-6','--viz-7','--viz-8',
] as const;

/** Type scale tokens */
export const typeScale = {
  '2xs':  '0.6875rem',
  xs:     '0.75rem',
  sm:     '0.8125rem',
  base:   '0.9375rem',
  md:     '1.0625rem',
  lg:     '1.25rem',
  xl:     '1.5rem',
  '2xl':  '1.875rem',
  '3xl':  '2.375rem',
  '4xl':  '3rem',
  '5xl':  '3.75rem',
  '6xl':  '5rem',
} as const;

/** Spacing scale */
export const spacing = {
  0:    '0',
  px:   '1px',
  '0.5':'2px',
  1:    '4px',
  2:    '8px',
  3:    '12px',
  4:    '16px',
  5:    '20px',
  6:    '24px',
  8:    '32px',
  10:   '40px',
  12:   '48px',
  16:   '64px',
  20:   '80px',
  24:   '96px',
  32:   '128px',
} as const;

/** Motion durations (ms) */
export const motion = {
  instant: 0,
  fast:    120,
  base:    180,
  medium:  240,
  slow:    360,
  slower:  560,
} as const;

/** Easings */
export const easings = {
  out:        [0.2, 0.8, 0.2, 1],
  in:         [0.8, 0, 0.8, 0.2],
  inOut:      [0.65, 0, 0.35, 1],
  emphasized: [0.34, 0.69, 0.1, 1],
  spring:     [0.5, 1.6, 0.4, 1],
} as const;

/** Radii */
export const radii = {
  none:  '0',
  sm:    '4px',
  md:    '8px',
  lg:    '12px',
  xl:    '16px',
  pill:  '9999px',
} as const;

/** Z scale */
export const zIndex = {
  base:    0,
  raised:  10,
  sticky:  30,
  overlay: 100,
  modal:   200,
  palette: 300,
  toast:   400,
} as const;
