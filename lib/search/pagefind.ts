/**
 * Pagefind client wrapper.
 *
 * Pagefind is loaded LAZILY from `/_pagefind/pagefind.js` at runtime, only
 * on the search page. The index doesn't exist in dev (Pagefind runs in
 * `postbuild`); the loader gracefully reports "index missing" in dev.
 *
 * All types here are narrow facades over the Pagefind public API; we don't
 * depend on the package types because Pagefind is loaded via dynamic
 * `import()` from a public URL, not via npm import resolution.
 */

export interface PagefindHit {
  id: string;
  score: number;
  url: string;
  excerpt: string;
  meta: Record<string, string>;
  /** Lazily-fetched body (sub_results) */
  raw_url?: string;
}

interface PagefindSearchResult {
  results: Array<{ id: string; data(): Promise<PagefindRawHit> }>;
}

interface PagefindRawHit {
  url: string;
  excerpt: string;
  meta: Record<string, string>;
  raw_url?: string;
  filters?: Record<string, string[]>;
  content?: string;
}

interface PagefindAPI {
  search(query: string): Promise<PagefindSearchResult>;
  options?(opts: { baseUrl?: string }): Promise<void>;
}

declare global {
  interface Window {
    __caPagefind?: PagefindAPI | null;
    __caPagefindLoadError?: string;
  }
}

export type PagefindState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'ready'; api: PagefindAPI }
  | { kind: 'missing' }
  | { kind: 'error'; message: string };

export async function loadPagefind(): Promise<PagefindState> {
  if (typeof window === 'undefined') return { kind: 'idle' };
  if (window.__caPagefind) return { kind: 'ready', api: window.__caPagefind };
  if (window.__caPagefindLoadError)
    return { kind: 'missing' };

  try {
    // Dynamic import with webpackIgnore to avoid build-time resolution errors.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const mod = await import(/* webpackIgnore: true */ '/_pagefind/pagefind.js');
    const api: PagefindAPI = mod.default ?? mod;
    if (api.options) {
      await api.options({ baseUrl: '/' });
    }
    window.__caPagefind = api;
    return { kind: 'ready', api };
  } catch (e) {
    window.__caPagefindLoadError = e instanceof Error ? e.message : 'unknown';
    return { kind: 'missing' };
  }
}

export async function pagefindSearch(
  api: PagefindAPI,
  q: string,
): Promise<PagefindHit[]> {
  if (!q.trim()) return [];
  const res = await api.search(q);
  // Pull at most 30 hits, hydrate each
  const slice = res.results.slice(0, 30);
  const hits = await Promise.all(slice.map((r) => r.data()));
  return hits.map((h, i) => ({
    id: slice[i]?.id ?? String(i),
    score: slice.length - i, // descending; Pagefind sorts by relevance
    url: h.url,
    excerpt: h.excerpt,
    meta: h.meta ?? {},
    raw_url: h.raw_url,
  }));
}
