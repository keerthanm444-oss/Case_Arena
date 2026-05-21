export default function Loading() {
  return (
    <div className="skeleton-page">
      <header className="skeleton-topbar">
        <span>Case Arena</span>
        <span className="font-mono text-2xs">loading…</span>
      </header>
      <main className="skeleton-content">
        <div className="max-w-reading mx-auto">
          {/* Three deliberately neutral skeleton bars — no spinners */}
          <div
            className="h-3 w-24 mb-8 rounded-pill"
            style={{ background: 'var(--bg-elevated)' }}
          />
          <div
            className="h-12 w-3/4 mb-4 rounded-md"
            style={{ background: 'var(--bg-elevated)' }}
          />
          <div
            className="h-12 w-1/2 mb-12 rounded-md"
            style={{ background: 'var(--bg-elevated)' }}
          />
          <div className="grid gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-4 rounded-sm"
                style={{
                  background: 'var(--bg-elevated)',
                  width: `${100 - i * 8}%`,
                }}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
