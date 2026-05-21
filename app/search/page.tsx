'use client';

import * as React from 'react';
import Link from 'next/link';
import { useDebounce } from 'use-debounce';
import { Container, PageHeader, Section } from '@/components/layout';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { StatusPill } from '@/components/display/status-pill';
import { EmptyState } from '@/components/display/empty-state';
import { Callout } from '@/components/display/callout';
import { Search as SearchIcon, AlertTriangle } from 'lucide-react';
import {
  loadPagefind,
  pagefindSearch,
  type PagefindHit,
  type PagefindState,
} from '@/lib/search/pagefind';
import { useEmit } from '@/lib/event-bus';

/**
 * Search page — Pagefind-backed.
 *
 * Loads the static search index lazily on first interaction. In dev (no
 * Pagefind build), shows a friendly "index not built" callout instead of
 * failing.
 *
 * Listed alongside results: the index runs only after `npm run build`; in
 * production deployments it's always present.
 */

export default function SearchPage() {
  const [q, setQ] = React.useState('');
  const [debouncedQ] = useDebounce(q, 200);
  const [state, setState] = React.useState<PagefindState>({ kind: 'idle' });
  const [results, setResults] = React.useState<PagefindHit[]>([]);
  const [searching, setSearching] = React.useState(false);
  const emit = useEmit();

  // Lazy load on mount
  React.useEffect(() => {
    setState({ kind: 'loading' });
    void loadPagefind().then(setState);
  }, []);

  // Search on query change
  React.useEffect(() => {
    if (state.kind !== 'ready' || debouncedQ.trim().length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setSearching(true);
    void pagefindSearch(state.api, debouncedQ).then((hits) => {
      if (cancelled) return;
      setResults(hits);
      setSearching(false);
      void emit('search.query', { q: debouncedQ, resultCount: hits.length });
    });
    return () => {
      cancelled = true;
    };
  }, [debouncedQ, state, emit]);

  return (
    <div className="py-10">
      <Container width="lg">
        <PageHeader
          eyebrow={<StatusPill tone="accent">System 5 · Nervous</StatusPill>}
          title="Search"
          description="Static full-text search across modules, cases, frameworks, and resources. Powered by Pagefind, indexed at build time."
        />

        <Section>
          <div className="relative">
            <SearchIcon
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted pointer-events-none"
              aria-hidden
            />
            <Input
              size="lg"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for a module, case, framework, or term…"
              className="pl-9"
              autoFocus
            />
          </div>
          {state.kind === 'missing' && (
            <Callout tone="warning" hideIcon title="Index not built" className="mt-4">
              <div className="flex items-start gap-2">
                <AlertTriangle size={14} className="text-warning mt-1 shrink-0" />
                <div>
                  Pagefind runs as a postbuild step. Run{' '}
                  <code className="font-mono text-fg">npm run build</code> to
                  generate the index, then refresh. In production, the index
                  is always present.
                </div>
              </div>
            </Callout>
          )}
        </Section>

        {/* ---- Results ---- */}
        {state.kind === 'ready' && debouncedQ.trim().length >= 2 && (
          <Section
            eyebrow={searching ? 'Searching…' : `${results.length} result${results.length === 1 ? '' : 's'}`}
          >
            {results.length === 0 && !searching ? (
              <EmptyState
                title="No matches"
                description="Try a different word, or broaden your query."
              />
            ) : (
              <Card variant="panel">
                <ul>
                  {results.map((r) => (
                    <li key={r.id} className="border-b border-line last:border-b-0">
                      <Link
                        href={r.url}
                        className="block px-4 py-3 hover:bg-bg-elevated transition-colors duration-fast"
                      >
                        <div className="flex items-baseline justify-between gap-3 mb-1">
                          <h3 className="text-sm text-fg">
                            {r.meta.title ?? r.url}
                          </h3>
                          <code className="font-mono text-2xs text-fg-subtle">
                            {r.url}
                          </code>
                        </div>
                        <p
                          className="text-xs text-fg-muted leading-relaxed [&_mark]:bg-accent-soft [&_mark]:text-accent [&_mark]:px-0.5"
                          dangerouslySetInnerHTML={{ __html: r.excerpt }}
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </Section>
        )}

        {state.kind === 'ready' && debouncedQ.trim().length < 2 && (
          <EmptyState
            icon={<SearchIcon />}
            eyebrow="Ready"
            title="Start typing"
            description="Index loaded. Type at least 2 characters."
          />
        )}

        {state.kind === 'loading' && (
          <EmptyState
            eyebrow="Loading"
            title="Loading search index…"
            description="One-time fetch of the static index."
          />
        )}
      </Container>
    </div>
  );
}
