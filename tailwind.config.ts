import type { Config } from 'tailwindcss';
import { spacing, typeScale, radii, motion } from './lib/tokens';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx,mdx}',
    './components/**/*.{ts,tsx}',
    './content/**/*.{md,mdx}',
    './lib/**/*.{ts,tsx}',
  ],
  darkMode: ['selector', '[data-theme="terminal"], [data-theme="boardroom"]'],
  theme: {
    // Override defaults — never accept default Tailwind colors
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      // semantic tokens map to CSS vars, so every utility class is theme-aware
      bg:            'var(--bg)',
      'bg-elevated': 'var(--bg-elevated)',
      'bg-sunken':   'var(--bg-sunken)',
      'bg-panel':    'var(--bg-panel)',
      'bg-overlay':  'var(--bg-overlay)',
      fg:            'var(--fg)',
      'fg-muted':    'var(--fg-muted)',
      'fg-subtle':   'var(--fg-subtle)',
      'fg-inverse':  'var(--fg-inverse)',
      line:          'var(--line)',
      'line-strong': 'var(--line-strong)',
      accent:        'var(--accent)',
      'accent-fg':   'var(--accent-fg)',
      'accent-soft': 'var(--accent-soft)',
      success:       'var(--success)',
      warning:       'var(--warning)',
      danger:        'var(--danger)',
      info:          'var(--info)',
      // viz palette
      'viz-1': 'var(--viz-1)', 'viz-2': 'var(--viz-2)',
      'viz-3': 'var(--viz-3)', 'viz-4': 'var(--viz-4)',
      'viz-5': 'var(--viz-5)', 'viz-6': 'var(--viz-6)',
      'viz-7': 'var(--viz-7)', 'viz-8': 'var(--viz-8)',
    },
    spacing,
    borderRadius: radii,
    fontFamily: {
      display: 'var(--font-display-stack)',
      body:    'var(--font-body-stack)',
      mono:    'var(--font-mono-stack)',
      numeric: 'var(--numeric-font)',
    },
    fontSize: Object.fromEntries(
      Object.entries(typeScale).map(([k, v]) => [k, [v, { lineHeight: '1.5' }]]),
    ),
    extend: {
      transitionDuration: {
        instant: `${motion.instant}ms`,
        fast:    `${motion.fast}ms`,
        base:    `${motion.base}ms`,
        medium:  `${motion.medium}ms`,
        slow:    `${motion.slow}ms`,
      },
      transitionTimingFunction: {
        'ease-out-custom':   'cubic-bezier(0.2, 0.8, 0.2, 1)',
        emphasized:          'cubic-bezier(0.34, 0.69, 0.1, 1)',
        spring:              'cubic-bezier(0.5, 1.6, 0.4, 1)',
      },
      maxWidth: {
        reading: 'var(--reading-width)',
      },
      zIndex: {
        base:    'var(--z-base)',
        raised:  'var(--z-raised)',
        sticky:  'var(--z-sticky)',
        overlay: 'var(--z-overlay)',
        modal:   'var(--z-modal)',
        palette: 'var(--z-palette)',
        toast:   'var(--z-toast)',
      },
      letterSpacing: {
        tightest: 'var(--tracking-tightest)',
        tighter:  'var(--tracking-tighter)',
        tight:    'var(--tracking-tight)',
        normal:   'var(--tracking-normal)',
        wide:     'var(--tracking-wide)',
        wider:    'var(--tracking-wider)',
        widest:   'var(--tracking-widest)',
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        glow: '0 0 20px rgba(var(--accent-rgb), 0.15)',
        premium: '0 10px 40px -10px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
