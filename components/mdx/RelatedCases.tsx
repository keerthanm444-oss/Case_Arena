'use client';

import * as React from 'react';
import Link from 'next/link';
import { Network } from 'lucide-react';
import { cn } from '@/lib/cn';
import { StatusPill } from '@/components/display/status-pill';
import { Tag } from '@/components/display/tag';
import { getCaseBySlug } from '@/lib/content/cases';
import { getMapGraph } from '@/lib/content/map-builder';

/**
 * <RelatedCases slug="electrolight" /> — finds and lists every case that
 * shares a framework, industry, or explicit relation with the current case.
 *
 * Used at the bottom of every case page; can also be used inline elsewhere.
 */

export interface RelatedCasesProps {
  slug: string;
  /** Maximum number of related cases to show (default 5) */
  limit?: number;
}

interface RelatedRow {
  slug: string;
  weight: number;
  reasons: string[];
}

export function RelatedCases({ slug, limit = 5 }: RelatedCasesProps) {
  const cur = getCaseBySlug(slug);
  if (!cur) return null;

  const graph = getMapGraph();
  // Compute weighted neighbors
  const map = new Map<string, RelatedRow>();
  for (const edge of graph.edges) {
    if (edge.source !== slug && edge.target !== slug) continue;
    const other = edge.source === slug ? edge.target : edge.source;
    if (other === slug) continue;
    const w =
      edge.kind === 'related-case' ? 3 :
      edge.kind === 'shared-framework' ? 2 :
      edge.kind === 'shared-industry' ? 1 :
      1;
    const existing = map.get(other) ?? { slug: other, weight: 0, reasons: [] };
    existing.weight += w;
    if (!existing.reasons.includes(edge.kind)) existing.reasons.push(edge.kind);
    map.set(other, existing);
  }
  const rows = Array.from(map.values())
    .sort((a, b) => b.weight - a.weight)
    .slice(0, limit);

  if (rows.length === 0) {
    return null;
  }

  return (
    <aside aria-label="Related cases">
      <div className="font-mono text-2xs uppercase tracking-widest text-fg-muted mb-2 flex items-center gap-2">
        <Network size={11} />
        Related cases
      </div>
      <ul className="grid gap-2">
        {rows.map((r) => {
          const c = getCaseBySlug(r.slug);
          if (!c) return null;
          return (
            <li key={r.slug}>
              <Link
                href={`/cases/${r.slug}`}
                className={cn(
                  'block px-3 py-2 rounded-md border border-line bg-bg-panel',
                  'hover:border-line-strong hover:bg-bg-elevated transition-colors duration-fast',
                )}
              >
                <div className="text-sm text-fg leading-snug mb-1">{c.title}</div>
                <div className="flex items-center gap-1 flex-wrap">
                  <Tag size="sm" tone="ghost">{c.industry}</Tag>
                  <StatusPill size="xs" tone="outline">{c.difficulty}</StatusPill>
                  {r.reasons.map((reason) => (
                    <StatusPill key={reason} size="xs" tone="neutral">
                      {reason.replace(/-/g, ' ')}
                    </StatusPill>
                  ))}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
