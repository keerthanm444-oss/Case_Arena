/**
 * MDX content loader — scans /content/{modules,cases,resources} at build
 * time, parses frontmatter via gray-matter, and validates against the Zod
 * schemas from System 1.
 *
 * IMPORTANT: this module uses Node `fs` and runs ONLY during build / dev
 * server. It must never be imported by client components. The content
 * registry files (lib/content/modules.ts etc.) are the public API; this
 * loader is their private implementation.
 *
 * Pattern: cache-on-first-call. Next 14's static export materializes pages
 * top-down, so each loader runs N times for N pages; caching prevents
 * redundant filesystem walks.
 */

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const CONTENT_ROOT = path.join(process.cwd(), 'content');

export interface RawMDXDoc {
  /** Relative path from CONTENT_ROOT (without extension) */
  relPath: string;
  /** Slug = filename without extension */
  slug: string;
  /** Raw frontmatter object */
  frontmatter: Record<string, unknown>;
  /** MDX body */
  body: string;
  /** Absolute path on disk */
  absPath: string;
}

const cache = new Map<string, RawMDXDoc[]>();

/** Read all MDX files under `content/<subdir>/`. Returns parsed docs. */
export function readMDXCollection(subdir: 'modules' | 'cases' | 'resources'): RawMDXDoc[] {
  const cached = cache.get(subdir);
  if (cached) return cached;

  const dir = path.join(CONTENT_ROOT, subdir);
  if (!fs.existsSync(dir)) {
    cache.set(subdir, []);
    return [];
  }

  const docs: RawMDXDoc[] = [];
  for (const entry of fs.readdirSync(dir)) {
    if (!entry.endsWith('.mdx') && !entry.endsWith('.md')) continue;
    const absPath = path.join(dir, entry);
    const stat = fs.statSync(absPath);
    if (!stat.isFile()) continue;

    const raw = fs.readFileSync(absPath, 'utf8');
    const parsed = matter(raw);
    const slug =
      (parsed.data?.slug as string) ?? entry.replace(/\.(mdx?|md)$/, '');

    docs.push({
      relPath: path.join(subdir, entry.replace(/\.(mdx?|md)$/, '')),
      slug,
      frontmatter: parsed.data,
      body: parsed.content,
      absPath,
    });
  }

  cache.set(subdir, docs);
  return docs;
}

/** Find one doc by slug. Returns null if absent. */
export function findMDXBySlug(
  subdir: 'modules' | 'cases' | 'resources',
  slug: string,
): RawMDXDoc | null {
  return readMDXCollection(subdir).find((d) => d.slug === slug) ?? null;
}

/** Clear cache — used by tests + dev hot reload. */
export function _resetMDXCache() {
  cache.clear();
}
