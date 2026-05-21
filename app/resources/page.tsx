'use client';

import * as React from 'react';
import { ExternalLink, BookMarked, Headphones, Users, Newspaper, Library as LibraryIcon, Search } from 'lucide-react';
import { Container, PageHeader, Section } from '@/components/layout';
import { Input } from '@/components/ui/input';
import { Tag } from '@/components/display/tag';
import { StatusPill } from '@/components/display/status-pill';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/display/empty-state';
import { Callout } from '@/components/display/callout';
import { cn } from '@/lib/cn';

type ResourceKind = 'book' | 'podcast' | 'channel' | 'community' | 'article' | 'tool';

interface Resource {
  id: string;
  kind: ResourceKind;
  title: string;
  by?: string;
  url?: string;
  blurb: string;
  tags: string[];
  cost: 'free' | 'paid' | 'mixed';
}

const SEED: Resource[] = [
  {
    id: 'cosentino',
    kind: 'book',
    title: 'Case in Point',
    by: 'Marc Cosentino',
    blurb: 'The canonical case-interview prep book. Profitability tree, market entry, M&A frameworks.',
    tags: ['fundamentals', 'frameworks'],
    cost: 'paid',
  },
  {
    id: 'minto',
    kind: 'book',
    title: 'The Pyramid Principle',
    by: 'Barbara Minto',
    blurb: 'McKinsey-developed structured thinking. Answer-first, supports beneath. Required reading.',
    tags: ['structure', 'communication'],
    cost: 'paid',
  },
  {
    id: 'cheng',
    kind: 'book',
    title: 'Case Interview Secrets',
    by: 'Victor Cheng',
    blurb: 'Friendlier than Cosentino. Strong on the mechanics of structuring a fresh problem.',
    tags: ['fundamentals'],
    cost: 'paid',
  },
  {
    id: 'porter',
    kind: 'book',
    title: 'Competitive Strategy',
    by: 'Michael Porter',
    blurb: "Five Forces, generic strategies. Heavyweight reference — read selectively.",
    tags: ['frameworks', 'strategy'],
    cost: 'paid',
  },
];

const KIND_LABELS: Record<ResourceKind, string> = {
  book: 'Books',
  podcast: 'Podcasts',
  channel: 'Channels',
  community: 'Communities',
  article: 'Articles',
  tool: 'Tools',
};
const KIND_ICONS: Record<ResourceKind, React.ComponentType<{ size?: number; className?: string }>> = {
  book: BookMarked,
  podcast: Headphones,
  channel: Newspaper,
  community: Users,
  article: Newspaper,
  tool: LibraryIcon,
};
const KINDS = Object.keys(KIND_LABELS) as ResourceKind[];

export default function ResourcesPage() {
  const [q, setQ] = React.useState('');
  const [kindFilter, setKindFilter] = React.useState<ResourceKind | 'all'>('all');
  const [tagFilter, setTagFilter] = React.useState<string | null>(null);

  const allTags = React.useMemo(() => {
    const set = new Set<string>();
    for (const r of SEED) for (const t of r.tags) set.add(t);
    return Array.from(set).sort();
  }, []);

  const filtered = React.useMemo(() => {
    return SEED.filter((r) => {
      if (kindFilter !== 'all' && r.kind !== kindFilter) return false;
      if (tagFilter && !r.tags.includes(tagFilter)) return false;
      if (q.trim()) {
        const needle = q.toLowerCase();
        if (
          !r.title.toLowerCase().includes(needle) &&
          !r.blurb.toLowerCase().includes(needle) &&
          !(r.by ?? '').toLowerCase().includes(needle)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [q, kindFilter, tagFilter]);

  return (
    <div className="py-10">
      <Container width="xl">
        <PageHeader
          eyebrow={<StatusPill tone="accent">System 7 · Resources</StatusPill>}
          title="Resources hub"
          description="Curated books, podcasts, channels, communities, and tools. Every resource cited; nothing fabricated. Library populates in Tissue passes."
        />

        <Section>
          <div className="grid gap-3 md:grid-cols-[1fr_auto] items-start">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted pointer-events-none" aria-hidden />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search resources…" className="pl-9" />
            </div>
            <div className="flex flex-wrap gap-1">
              <FilterPill active={kindFilter === 'all'} onClick={() => setKindFilter('all')}>All</FilterPill>
              {KINDS.map((k) => {
                const Icon = KIND_ICONS[k];
                return (
                  <FilterPill
                    key={k}
                    active={kindFilter === k}
                    onClick={() => setKindFilter(kindFilter === k ? 'all' : k)}
                    leading={<Icon size={11} />}
                  >
                    {KIND_LABELS[k]}
                  </FilterPill>
                );
              })}
            </div>
          </div>

          {allTags.length > 0 && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="font-mono text-2xs uppercase tracking-widest text-fg-subtle">Tags</span>
              {allTags.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTagFilter(tagFilter === t ? null : t)}
                  className={cn(
                    'inline-flex items-center px-2 h-5 rounded-pill text-2xs',
                    'border transition-colors duration-fast',
                    tagFilter === t
                      ? 'border-accent bg-accent text-accent-fg'
                      : 'border-line bg-bg-panel text-fg-muted hover:border-line-strong hover:text-fg',
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </Section>

        <Section eyebrow={`${filtered.length} resources`}>
          {filtered.length === 0 ? (
            <EmptyState title="No matches" description="Try a different filter or clear the search." />
          ) : (
            <div className="grid gap-2">
              {filtered.map((r) => {
                const Icon = KIND_ICONS[r.kind];
                return (
                  <Card key={r.id} variant="panel" interactive className="overflow-hidden">
                    <a
                      href={r.url ?? '#'}
                      target={r.url ? '_blank' : undefined}
                      rel={r.url ? 'noreferrer noopener' : undefined}
                      className="block px-4 py-3"
                    >
                      <div className="grid grid-cols-[1.5rem_1fr_auto] gap-3 items-start">
                        <Icon size={14} className="text-accent mt-0.5" />
                        <div className="min-w-0">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-fg text-sm font-medium">{r.title}</span>
                            {r.by && <span className="text-fg-muted text-xs italic">{r.by}</span>}
                            <StatusPill tone="outline" size="xs">{KIND_LABELS[r.kind].slice(0, -1)}</StatusPill>
                            <StatusPill tone={r.cost === 'free' ? 'success' : r.cost === 'paid' ? 'neutral' : 'outline'} size="xs">
                              {r.cost}
                            </StatusPill>
                          </div>
                          <p className="text-xs text-fg-muted mt-1 leading-relaxed">{r.blurb}</p>
                          <div className="flex items-center gap-1 mt-2 flex-wrap">
                            {r.tags.map((t) => (<Tag key={t} size="sm" tone="ghost">{t}</Tag>))}
                          </div>
                        </div>
                        {r.url && <ExternalLink size={12} className="text-fg-subtle shrink-0 mt-1" />}
                      </div>
                    </a>
                  </Card>
                );
              })}
            </div>
          )}
        </Section>

        <Section>
          <Callout tone="note" hideIcon>
            <span className="font-mono text-2xs uppercase tracking-wider text-fg-muted">Tissue pass pending ·</span>{' '}
            Full library lands across Tissue passes. Resources will be authored as MDX in <code>/content/resources/</code> with the same citation rules as cases.
          </Callout>
        </Section>
      </Container>
    </div>
  );
}

function FilterPill({
  active, onClick, leading, children,
}: {
  active: boolean;
  onClick: () => void;
  leading?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 h-7 rounded-md text-xs',
        'border transition-colors duration-fast',
        active
          ? 'border-accent bg-accent text-accent-fg'
          : 'border-line bg-bg-panel text-fg-muted hover:border-line-strong hover:text-fg',
      )}
    >
      {leading}
      {children}
    </button>
  );
}
