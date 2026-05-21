import * as React from 'react';
import { Container, PageHeader } from '@/components/layout';
import { StatusPill } from '@/components/display/status-pill';
import { Tag } from '@/components/display/tag';
import { Card } from '@/components/ui/card';
import { TableOfContents } from './TableOfContents';
import { PrevNext } from './PrevNext';
import { MDXContent } from './MDXContent';
import { ScratchPad } from './ScratchPad';
import type { ModuleRecord } from '@/types/module';

/**
 * ModuleRenderer — server component that lays out a single module page.
 *
 *   ┌──────────────────────────────────┬──────────┐
 *   │  Header (id, title, meta, tags) │          │
 *   │----------------------------------│          │
 *   │  MDX content                     │   TOC    │
 *   │  ScratchPad                      │   (rail) │
 *   │  PrevNext                        │          │
 *   └──────────────────────────────────┴──────────┘
 *
 * On mobile the TOC collapses to a top section.
 */

export interface ModuleRendererProps {
  module: ModuleRecord;
  body: string;
}

export function ModuleRenderer({ module: m, body }: ModuleRendererProps) {
  return (
    <div className="py-8">
      <Container width="xl">
        <PageHeader
          eyebrow={
            <div className="flex items-center gap-2">
              <StatusPill tone="accent">{m.id}</StatusPill>
              <StatusPill tone="outline" size="xs">
                {m.status}
              </StatusPill>
              {m.estimatedMinutes > 0 && (
                <span className="font-mono text-2xs uppercase tracking-wider text-fg-subtle">
                  {m.estimatedMinutes} min
                </span>
              )}
            </div>
          }
          title={m.title}
          description={m.tagline}
          meta={
            m.tags && m.tags.length > 0 ? (
              <div className="flex items-center gap-1 flex-wrap">
                {m.tags.map((t) => (
                  <Tag key={t} size="sm" tone="ghost">
                    {t}
                  </Tag>
                ))}
              </div>
            ) : null
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-10 mb-4">
          {/* Main column */}
          <article
            className="min-w-0 max-w-reading"
            style={{ fontSize: 'var(--text-md)' }}
          >
            <MDXContent source={body} />

            {/* Per-page scratch pad — always appears at the bottom of the article */}
            <div className="mt-12">
              <ScratchPad slug={`module-${m.slug}`} />
            </div>

            <PrevNext currentSlug={m.slug} />
          </article>

          {/* Right rail — TOC */}
          <aside
            className="hidden lg:block"
            style={{
              position: 'sticky',
              top: 'calc(var(--topbar-h) + 16px)',
              alignSelf: 'start',
              maxHeight: 'calc(100dvh - var(--topbar-h) - 32px)',
              overflowY: 'auto',
            }}
          >
            <TableOfContents source={body} />
          </aside>

          {/* Mobile TOC — collapsible-style accordion, shown above content */}
          <aside className="lg:hidden order-first">
            <Card variant="panel" className="mb-2">
              <details className="group">
                <summary className="cursor-pointer px-3 py-2 text-sm text-fg flex items-center justify-between">
                  <span className="font-mono text-2xs uppercase tracking-widest text-fg-muted">
                    On this page
                  </span>
                  <span className="font-mono text-2xs text-fg-subtle group-open:rotate-90 transition-transform">
                    ›
                  </span>
                </summary>
                <div className="px-3 pb-3">
                  <TableOfContents source={body} label="" />
                </div>
              </details>
            </Card>
          </aside>
        </div>
      </Container>
    </div>
  );
}
