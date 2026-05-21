'use client';

import { useEventLogStore } from '@/lib/store/event-log-store';

/**
 * <DevEventLog /> — a small bottom-right panel that shows the last few
 * events flowing through the bus. Renders only when NODE_ENV !== 'production'.
 *
 * Mount once in app/layout.tsx (later — System 5 hooks it up alongside the
 * workspace shell). In production builds it's a no-op.
 */

export function DevEventLog() {
  if (process.env.NODE_ENV === 'production') return null;
  const recent = useEventLogStore((s) => s.recent);
  const last5 = recent.slice(-5).reverse();

  if (last5.length === 0) {
    return (
      <aside
        aria-label="Event log (dev)"
        style={{
          position: 'fixed',
          bottom: 12,
          right: 12,
          maxWidth: 360,
          padding: '8px 10px',
          background: 'var(--bg-panel)',
          border: '1px solid var(--line)',
          borderRadius: 4,
          fontFamily: 'var(--font-mono-stack)',
          fontSize: 11,
          color: 'var(--fg-subtle)',
          zIndex: 400,
          pointerEvents: 'none',
        }}
      >
        event-bus: idle
      </aside>
    );
  }

  return (
    <aside
      aria-label="Event log (dev)"
      style={{
        position: 'fixed',
        bottom: 12,
        right: 12,
        maxWidth: 360,
        padding: '6px 10px',
        background: 'var(--bg-panel)',
        border: '1px solid var(--line)',
        borderRadius: 4,
        fontFamily: 'var(--font-mono-stack)',
        fontSize: 11,
        color: 'var(--fg-muted)',
        zIndex: 400,
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--fg-subtle)',
          marginBottom: 4,
        }}
      >
        event log (last 5)
      </div>
      {last5.map((e, i) => (
        <div key={i} style={{ color: 'var(--fg)' }}>
          <span style={{ color: 'var(--accent)' }}>{e.kind}</span>
          <span style={{ color: 'var(--fg-subtle)', marginLeft: 6 }}>
            {new Date(e.at).toLocaleTimeString()}
          </span>
        </div>
      ))}
    </aside>
  );
}
