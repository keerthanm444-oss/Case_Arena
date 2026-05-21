'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In System 3, route this through the interaction event bus
    console.error('[case-arena] runtime error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          minHeight: '100dvh',
          display: 'grid',
          placeItems: 'center',
          padding: 24,
          background: '#07080A',
          color: '#E8ECEF',
          fontFamily: 'ui-monospace, monospace',
        }}
      >
        <div style={{ maxWidth: 560, textAlign: 'left' }}>
          <p
            style={{
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#FB7185',
              marginBottom: 16,
            }}
          >
            Runtime error
          </p>
          <h1 style={{ fontSize: 32, marginBottom: 12, fontFamily: 'serif' }}>
            Something derailed.
          </h1>
          <p style={{ color: '#8B95A2', marginBottom: 24, lineHeight: 1.5 }}>
            {error.message || 'An unexpected error occurred.'}
            {error.digest && ` (${error.digest})`}
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={reset}
              style={{
                padding: '8px 16px',
                background: '#F5A524',
                color: '#07080A',
                border: 'none',
                borderRadius: 4,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
            <Link
              href="/"
              style={{
                padding: '8px 16px',
                border: '1px solid rgba(232,236,239,0.18)',
                borderRadius: 4,
                fontSize: 13,
                color: '#E8ECEF',
              }}
            >
              Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
