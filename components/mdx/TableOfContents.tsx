'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';

/**
 * TableOfContents — extracts H2/H3 headers from raw markdown and renders
 * a sticky rail of in-page anchors.
 *
 * Heading IDs are produced via a slugify identical to rehype-slug so links
 * line up with the anchors generated when MDX is compiled.
 */

interface TocEntry {
  level: 2 | 3;
  text: string;
  id: string;
}

export interface TableOfContentsProps {
  /** Raw MDX body (the same string we feed to MDXRemote) */
  source: string;
  /** Optional title shown above */
  label?: string;
  /** Optional max nesting depth — default both H2 + H3 */
  depth?: 2 | 3;
}

const HEADING_RE = /^(#{2,3})\s+(.+?)\s*$/gm;

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function TableOfContents({ source, label = 'On this page', depth = 3 }: TableOfContentsProps) {
  const entries = React.useMemo(() => {
    const out: TocEntry[] = [];
    const seen = new Set<string>();
    let m: RegExpExecArray | null;
    HEADING_RE.lastIndex = 0;
    while ((m = HEADING_RE.exec(source))) {
      const level = m[1]!.length as 2 | 3;
      if (level > depth) continue;
      const text = m[2]!.trim();
      let id = slugify(text);
      // Disambiguate dup slugs the same way rehype-slug does
      let n = 1;
      while (seen.has(id)) {
        id = `${slugify(text)}-${n++}`;
      }
      seen.add(id);
      out.push({ level, text, id });
    }
    return out;
  }, [source, depth]);

  const [active, setActive] = React.useState<string>(entries[0]?.id ?? '');

  // Track which heading is visible via IntersectionObserver
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const targets = entries
      .map((e) => document.getElementById(e.id))
      .filter((x): x is HTMLElement => !!x);
    if (targets.length === 0) return;
    const io = new IntersectionObserver(
      (records) => {
        for (const r of records) {
          if (r.isIntersecting) setActive(r.target.id);
        }
      },
      { rootMargin: '-15% 0px -75% 0px', threshold: 0 },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [entries]);

  if (entries.length === 0) return null;

  return (
    <nav
      className="text-sm"
      aria-label="Table of contents"
    >
      <div className="font-mono text-2xs uppercase tracking-widest text-fg-muted mb-2">
        {label}
      </div>
      <ul className="grid gap-0.5">
        {entries.map((e) => (
          <li key={e.id} className={e.level === 3 ? 'pl-3' : ''}>
            <a
              href={`#${e.id}`}
              className={cn(
                'block px-2 py-1 rounded-sm transition-colors duration-fast',
                'border-l border-transparent',
                active === e.id
                  ? 'text-fg border-l-accent bg-bg-panel'
                  : 'text-fg-muted hover:text-fg hover:bg-bg-panel',
              )}
            >
              {e.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
