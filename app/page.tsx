import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  Layers,
  Network,
  Wrench,
  Keyboard,
} from 'lucide-react';
import { Container, PageHeader, Section, Stack } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Callout } from '@/components/display/callout';
import { KPITile } from '@/components/display/kpi-tile';
import { StatusPill } from '@/components/display/status-pill';
import { Sparkline } from '@/components/display/sparkline';
import { Kbd } from '@/components/ui/kbd';
import { MODULE_SPINE } from '@/lib/content/modules';
import { TOOLS } from '@/lib/content/tools';
import { getAllCases } from '@/lib/content/cases';

import { AnimatedContainer, AnimatedSection } from '@/components/ui/animated-section';

export default function HomePage() {
  const caseCount = getAllCases().length;

  return (
    <AnimatedContainer className="py-10">
      <Container width="xl">
        <PageHeader
          eyebrow={
            <Stack direction="row" gap={2}>
              <StatusPill tone="success" dot>
                Build · 9 / 9 complete
              </StatusPill>
              <StatusPill tone="success" dot>
                Curriculum · 12 / 12 live
              </StatusPill>
              <StatusPill tone="accent">100 cases · complete</StatusPill>
            </Stack>
          }
          title={
            <>
              A zero-to-100 guide to{' '}
              <span style={{ color: 'var(--accent)' }}>case competitions.</span>
            </>
          }
          description="A fully interactive, hallucination-free learning platform. 12 modules, 100 real cases from HBS · Ivey · McKinsey · BCG · HULT Prize · CFA Research Challenge, 9 muscles, a navigable case map. Free to host. Free to use."
          actions={
            <Stack direction="row" gap={2}>
              <Button asChild variant="primary" size="lg">
                <Link href="/modules">
                  Start at M0 <ArrowRight size={14} />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/map">View case map</Link>
              </Button>
            </Stack>
          }
        />

        {/* ---- Keyboard hint banner — new in System 5 ---- */}
        <AnimatedSection>
          <Callout tone="tip" title="Keyboard-driven" className="mb-10">
            Press <Kbd combo>⌘ K</Kbd> to open the command palette,{' '}
            <Kbd>?</Kbd> for the shortcut sheet, or{' '}
            <Kbd combo>g m</Kbd> to jump to modules. Press{' '}
            <Kbd>t</Kbd> to cycle through Terminal, Boardroom, and Daylight themes.
          </Callout>
        </AnimatedSection>

        {/* ---- KPI band ---- */}
        <AnimatedSection>
          <Section eyebrow="Build status">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <KPITile
                label="Modules authored"
                value="12 / 12"
                sub="Curriculum spine complete · M0 → M11"
                variant="accent"
                trend={<Sparkline data={[0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]} tone="accent" area />}
              />
              <KPITile
                label="Test suites"
                value="11"
                sub="Vitest + Playwright + Lighthouse"
              />
              <KPITile
                label="Cases authored"
                value={`${caseCount} / 100`}
                sub="Acme Coffee · Veridian"
                delta={{ value: '+1', direction: 'up' }}
              />
              <KPITile
                label="MDX components"
                value="9"
                sub="Callout · Citation · embeds"
              />
            </div>
          </Section>
        </AnimatedSection>

        {/* ---- Curriculum spine ---- */}
        <AnimatedSection>
          <Section
            eyebrow="Curriculum spine"
            title="Twelve modules · 0 → 100"
            description="Linear if you're new. Jump anywhere if you've prepped before. Every concept paired with an embedded interactive tool."
            actions={
              <Button asChild variant="ghost" size="sm">
                <Link href="/modules">
                  Full curriculum <ArrowRight size={12} />
                </Link>
              </Button>
            }
          >
            <Card variant="panel">
              <ul>
                {MODULE_SPINE.map((m) => (
                  <li
                    key={m.id}
                    className="border-b border-line last:border-b-0"
                  >
                    <Link
                      href={`/modules/${m.slug}`}
                      className="grid grid-cols-[3rem_1fr_auto_3.5rem] items-baseline gap-4 px-4 py-3 hover:bg-bg-elevated transition-colors duration-fast"
                    >
                      <span className="font-mono text-2xs text-fg-subtle tabular-nums">{m.id}</span>
                      <span className="text-fg text-sm">{m.title}</span>
                      <span className="text-fg-muted text-xs hidden md:block">{m.tagline}</span>
                      <span
                        className="font-mono text-2xs text-fg-subtle text-right tabular-nums"
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                      >
                        {m.estimatedMinutes > 0 ? `${m.estimatedMinutes}m` : '—'}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          </Section>
        </AnimatedSection>

        {/* ---- Tools ---- */}
        <AnimatedSection>
          <Section
            eyebrow="Interactive tools"
            title="Nine reusable muscles"
            description="Built once, embedded everywhere. Issue trees, mind maps, decision trees, sizing calculator, mental math drill, framework quiz, slide critique, timer, optional AI partner."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {TOOLS.map((t) => (
                <Card key={t.slug} interactive variant="panel">
                  <Link href={`/tools/${t.slug}`} className="block">
                    <CardHeader>
                      <div className="flex items-baseline justify-between gap-3">
                        <CardTitle>{t.name}</CardTitle>
                        <StatusPill tone="outline" size="xs">
                          {t.arrives}
                        </StatusPill>
                      </div>
                      <CardDescription>{t.tagline}</CardDescription>
                    </CardHeader>
                  </Link>
                </Card>
              ))}
            </div>
          </Section>
        </AnimatedSection>

        {/* ---- Pillars ---- */}
        <AnimatedSection>
          <Section eyebrow="Engineering pillars">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <Card>
                <CardHeader>
                  <ShieldCheck size={16} className="text-accent mb-2" />
                  <CardTitle>Zero hallucinations</CardTitle>
                  <CardDescription>
                    Build-time citation linter blocks unsourced claims.
                    100% real, cited content.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Layers size={16} className="text-accent mb-2" />
                  <CardTitle>Systems-first</CardTitle>
                  <CardDescription>
                    Skeleton → Circulatory → Skin → Nervous → each layer complete
                    before the next.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Network size={16} className="text-accent mb-2" />
                  <CardTitle>Typed event bus</CardTitle>
                  <CardDescription>
                    30+ event kinds, persisted to IndexedDB, fan out to
                    derived state via pure reducers.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Wrench size={16} className="text-accent mb-2" />
                  <CardTitle>Self-hostable, free</CardTitle>
                  <CardDescription>
                    Next.js static export → Cloudflare Pages. No accounts,
                    no backend, no paid APIs.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </Section>
        </AnimatedSection>

        {/* ---- The non-negotiable ---- */}
        <AnimatedSection>
          <Section>
            <Callout tone="tip" title="The non-negotiable">
              Every case, framework, statistic, judge rubric, and resource in this
              app cites a real, verifiable source. The build literally cannot
              ship pages with unsourced claims — see{' '}
              <code className="font-mono text-fg">docs/CITATION_CONTRACT.md</code>.
              No fabricated content. Ever.
            </Callout>
          </Section>
        </AnimatedSection>

        {/* ---- Footer hint ---- */}
        <AnimatedSection className="mt-12 mb-8 flex items-center justify-between text-xs text-fg-subtle">
          <span className="font-mono uppercase tracking-widest flex items-center gap-2">
            <Keyboard size={11} /> 6 of 9 systems · muscles part 1 live
          </span>
          <span className="font-mono">case-arena · v0.6</span>
        </AnimatedSection>
      </Container>
    </AnimatedContainer>
  );
}
