'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, ExternalLink, Clock, ChevronRight } from 'lucide-react';
import { Container, PageHeader, Section } from '@/components/layout';
import { StatusPill } from '@/components/display/status-pill';
import { Tag } from '@/components/display/tag';
import { Card, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Callout } from '@/components/display/callout';
import { AssumptionProvider } from './AssumptionContext';
import { RelatedCases } from './RelatedCases';
import { ScratchPad } from './ScratchPad';
import type { Case } from '@/types';

/**
 * CaseRenderer — wraps the MDX case body in stateful chrome.
 *
 *   ┌────────────────────────────────┬───────────┐
 *   │  Header + source + tags        │           │
 *   │  Clarifying questions          │           │
 *   │  MDX content (with chips)      │  Related  │
 *   │  Common mistakes               │  cases    │
 *   │  Variants                      │           │
 *   │  Scratch pad                   │           │
 *   └────────────────────────────────┴───────────┘
 *
 * The full body is wrapped in <AssumptionProvider> so AssumptionChips +
 * LiveNumbers anywhere inside share state.
 */

export interface CaseRendererProps {
  caseRecord: Case;
  /** The MDX content (already compiled by parent server component) */
  children: React.ReactNode;
}

export function CaseRenderer({ caseRecord: c, children }: CaseRendererProps) {
  return (
    <AssumptionProvider>
      <div className="py-8">
        <Container width="xl">
          {/* Back to library */}
          <div className="mb-4">
            <Button asChild variant="ghost" size="sm" leading={<ArrowLeft size={12} />}>
              <Link href="/cases">Back to library</Link>
            </Button>
          </div>

          <PageHeader
            eyebrow={
              <div className="flex items-center gap-2 flex-wrap">
                <StatusPill tone="accent">{c.industry}</StatusPill>
                <StatusPill
                  tone={
                    c.difficulty === 'intro' || c.difficulty === 'standard'
                      ? 'success'
                      : c.difficulty === 'advanced'
                        ? 'warning'
                        : 'danger'
                  }
                  size="xs"
                >
                  {c.difficulty}
                </StatusPill>
                <span className="font-mono text-2xs uppercase tracking-wider text-fg-subtle flex items-center gap-1">
                  <Clock size={10} /> {c.timeEstimate}m
                </span>
                <span className="font-mono text-2xs uppercase tracking-wider text-fg-subtle">
                  · {c.source.publisher}
                  {c.source.year ? ` · ${c.source.year}` : ''}
                </span>
              </div>
            }
            title={c.title}
            description={c.problemStatement}
            meta={
              <div className="flex items-center gap-1 flex-wrap">
                {c.frameworks.map((f) => (
                  <Tag key={f} size="sm" tone="ghost">{f}</Tag>
                ))}
                {c.tags?.map((t) => (
                  <Tag key={t} size="sm" tone="ghost">{t}</Tag>
                ))}
              </div>
            }
            actions={
              c.source.url ? (
                <Button asChild variant="secondary" size="sm">
                  <a href={c.source.url} target="_blank" rel="noreferrer noopener">
                    Source <ExternalLink size={12} />
                  </a>
                </Button>
              ) : undefined
            }
          />

          {/* Clarifying questions */}
          {c.clarifyingQuestions && c.clarifyingQuestions.length > 0 && (
            <Section eyebrow="Clarifying questions" title="What a strong candidate asks">
              <Card variant="panel">
                <Accordion type="multiple" className="px-4">
                  {c.clarifyingQuestions.map((q, i) => (
                    <AccordionItem key={i} value={`q-${i}`}>
                      <AccordionTrigger>{q}</AccordionTrigger>
                      <AccordionContent>
                        <em>Develop your own answer — there's no canonical one.</em>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Card>
            </Section>
          )}

          {/* Main layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10">
            {/* Main column */}
            <article className="min-w-0 max-w-reading" style={{ fontSize: 'var(--text-md)' }}>
              {/* MDX body */}
              {children}

              {/* Common mistakes */}
              {c.commonMistakes && c.commonMistakes.length > 0 && (
                <Section eyebrow="Common mistakes" className="mt-12">
                  <Callout tone="warning">
                    <ul className="list-disc pl-5 space-y-1 [&>li]:my-0">
                      {c.commonMistakes.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </Callout>
                </Section>
              )}

              {/* Variants */}
              {c.variants && c.variants.length > 0 && (
                <Section eyebrow="Variants" title="Try a twist">
                  <div className="grid gap-2">
                    {c.variants.map((v, i) => (
                      <Card key={i} variant="panel">
                        <CardBody className="pt-4 pb-4 flex items-start justify-between gap-3">
                          <div className="text-sm text-fg leading-snug">{v}</div>
                          <ChevronRight size={14} className="text-fg-subtle shrink-0 mt-1" />
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                </Section>
              )}

              {/* Scratch pad */}
              <div className="mt-12">
                <ScratchPad slug={`case-${c.slug}`} />
              </div>
            </article>

            {/* Right rail */}
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
              <RelatedCases slug={c.slug} />

              <div className="mt-6">
                <Button asChild variant="ghost" size="sm" leading={<BookOpen size={12} />}>
                  <Link href={`/map?focus=${c.slug}`}>View in map</Link>
                </Button>
              </div>
            </aside>
          </div>
        </Container>
      </div>
    </AssumptionProvider>
  );
}
