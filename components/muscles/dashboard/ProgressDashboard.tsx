'use client';

import * as React from 'react';
import Link from 'next/link';
import { Flame, Eye, TrendingUp, Target, BookOpen, Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Container, PageHeader, Section, Stack } from '@/components/layout';
import { KPITile } from '@/components/display/kpi-tile';
import { StatusPill } from '@/components/display/status-pill';
import { EmptyState } from '@/components/display/empty-state';
import { Sparkline } from '@/components/display/sparkline';
import {
  useDrillHistory,
  useRecentlyViewed,
  useAllModuleProgress,
} from '@/lib/db/hooks';
import { MODULE_SPINE } from '@/lib/content/modules';
import { TOOLS } from '@/lib/content/tools';
import { AnimatedContainer, AnimatedSection } from '@/components/ui/animated-section';

/**
 * Progress Dashboard — Level 3 statefulness payoff.
 *
 * Reads from the Dexie tables populated by the event-bus reducers and
 * surfaces:
 *   - Activity (recently viewed, drill score sparkline)
 *   - Streaks (consecutive-day drill activity)
 *   - Module progress (sections completed across the 12 modules)
 *   - Recommended next (heuristic: weakest module + a tool that helps)
 */

export function ProgressDashboard() {
  const drillHistory = useDrillHistory(undefined, 30);
  const recent = useRecentlyViewed(8);
  const moduleProgress = useAllModuleProgress();

  // Streak calc — consecutive distinct days with at least one drill
  const streak = React.useMemo(() => {
    if (!drillHistory || drillHistory.length === 0) return 0;
    const days = new Set(drillHistory.map((d) => d.at.slice(0, 10)));
    let count = 0;
    let cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    while (days.has(cursor.toISOString().slice(0, 10))) {
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }, [drillHistory]);

  // Drill score trend (last 20)
  const drillTrend = React.useMemo(() => {
    if (!drillHistory) return [];
    return drillHistory
      .slice(0, 20)
      .reverse()
      .map((d) => d.score);
  }, [drillHistory]);

  // Module sections completed
  const sectionsDone = React.useMemo(() => {
    if (!moduleProgress) return 0;
    return moduleProgress.reduce((acc, m) => acc + m.sectionsCompleted.length, 0);
  }, [moduleProgress]);

  // Pick a recommended next — first module without progress, then a tool
  const recommendation = React.useMemo(() => {
    if (!moduleProgress) return null;
    const doneSlugs = new Set(
      moduleProgress.filter((m) => m.sectionsCompleted.length > 0).map((m) => m.moduleSlug),
    );
    const nextModule = MODULE_SPINE.find((m) => !doneSlugs.has(m.slug));
    if (nextModule) {
      return {
        kind: 'module' as const,
        slug: nextModule.slug,
        title: nextModule.title,
        href: `/modules/${nextModule.slug}`,
        why: 'Next module in the curriculum spine you haven\'t opened yet.',
      };
    }
    return {
      kind: 'tool' as const,
      slug: 'mental-math',
      title: 'Mental Math Drill',
      href: '/tools/mental-math',
      why: 'You\'ve started every module — sharpen execution with a drill.',
    };
  }, [moduleProgress]);

  const avgScore =
    drillHistory && drillHistory.length > 0
      ? drillHistory.reduce((acc, d) => acc + d.score, 0) / drillHistory.length
      : 0;

  return (
    <AnimatedContainer className="py-8">
      <Container width="xl">
        <PageHeader
          eyebrow={<StatusPill tone="accent">System 6b · Dashboard</StatusPill>}
          title="Your dashboard"
          description="All metrics derive from the local event log. Nothing is sent to any server."
        />

        {/* KPI band */}
        <AnimatedSection>
          <Section eyebrow="At a glance">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <KPITile
                label="Streak"
                value={streak > 0 ? `${streak}d` : '—'}
                sub={streak > 0 ? 'consecutive days' : 'start today'}
                variant={streak > 0 ? 'accent' : 'default'}
              />
              <KPITile
                label="Drills run"
                value={drillHistory?.length ?? 0}
                sub={`avg ${Math.round(avgScore * 100)}%`}
                trend={drillTrend.length > 1 ? <Sparkline data={drillTrend} tone="accent" area /> : undefined}
              />
              <KPITile
                label="Module sections"
                value={sectionsDone}
                sub="completed"
              />
              <KPITile
                label="Recently viewed"
                value={recent?.length ?? 0}
                sub="pages remembered"
              />
            </div>
          </Section>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
          {/* Recommended next */}
          <AnimatedSection className="lg:col-span-2">
            <Section eyebrow="Recommended next">
              {recommendation ? (
                <Card variant="accent">
                  <CardBody className="pt-4 pb-4">
                    <Stack direction="row" gap={3} align="center">
                      <Target size={18} className="text-accent" />
                      <div className="flex-1">
                        <div className="font-mono text-2xs uppercase tracking-widest text-fg-muted">
                          {recommendation.kind === 'module' ? 'Module' : 'Tool'}
                        </div>
                        <div className="text-md text-fg">{recommendation.title}</div>
                        <div className="text-sm text-fg-muted mt-1">{recommendation.why}</div>
                      </div>
                      <Button asChild variant="primary" size="md">
                        <Link href={recommendation.href}>Open</Link>
                      </Button>
                    </Stack>
                  </CardBody>
                </Card>
              ) : (
                <EmptyState
                  title="Dashboard loading…"
                  description="Reading from local IndexedDB."
                />
              )}
            </Section>
          </AnimatedSection>

          {/* Recent activity */}
          <AnimatedSection>
            <Section
              eyebrow="Recent activity"
              title="Recently viewed"
            >
              {recent === undefined ? (
                <EmptyState title="Loading…" />
              ) : recent.length === 0 ? (
                <EmptyState
                  icon={<Eye />}
                  eyebrow="Nothing yet"
                  title="No recent pages"
                  description="Visit any module, case, or tool to start your trail."
                />
              ) : (
                <Card variant="panel">
                  <ul>
                    {recent.map((r) => {
                      const meta = describeView(r.kind, r.slug);
                      return (
                        <li key={r.key} className="border-b border-line last:border-b-0">
                          <Link
                            href={meta.href}
                            className="grid grid-cols-[4rem_1fr_auto] gap-3 items-center px-3 py-2 hover:bg-bg-elevated transition-colors duration-fast"
                          >
                            <StatusPill tone="outline" size="xs">{r.kind}</StatusPill>
                            <div className="min-w-0">
                              <div className="text-sm text-fg truncate">{meta.title}</div>
                            </div>
                            <span className="font-mono text-2xs text-fg-subtle tabular-nums">
                              {timeAgo(r.visitedAt)}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </Card>
              )}
            </Section>
          </AnimatedSection>

          {/* Recent drills */}
          <AnimatedSection>
            <Section
              eyebrow="Drill history"
              title="Recent drills"
            >
              {drillHistory === undefined ? (
                <EmptyState title="Loading…" />
              ) : drillHistory.length === 0 ? (
                <EmptyState
                  icon={<Flame />}
                  eyebrow="No drills yet"
                  title="Start a mental math drill"
                  description="Drills feed the streak counter and the weak-spot detector."
                  actions={
                    <Button asChild variant="primary" size="sm">
                      <Link href="/tools/mental-math">Open drill</Link>
                    </Button>
                  }
                />
              ) : (
                <Card variant="panel">
                  <ul>
                    {drillHistory.slice(0, 8).map((d) => (
                      <li key={d.id} className="border-b border-line last:border-b-0">
                        <div className="grid grid-cols-[1fr_auto_auto] gap-3 items-center px-3 py-2">
                          <span className="text-sm text-fg capitalize">
                            {d.drillType.replace('-', ' ')}
                          </span>
                          <div className="relative h-2 bg-bg-elevated rounded-sm overflow-hidden min-w-[100px]">
                            <div
                              className={cn(
                                'absolute inset-y-0 left-0',
                                d.score >= 0.8 ? 'bg-success' : d.score >= 0.5 ? 'bg-warning' : 'bg-danger',
                              )}
                              style={{ width: `${d.score * 100}%` }}
                            />
                          </div>
                          <span className="font-mono text-2xs text-fg-muted tabular-nums">
                            {Math.round(d.score * 100)}%
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </Section>
          </AnimatedSection>
        </div>
      </Container>
    </AnimatedContainer>
  );
}

function describeView(kind: string, slug: string): { title: string; href: string } {
  if (kind === 'module') {
    const m = MODULE_SPINE.find((x) => x.slug === slug);
    return { title: m?.title ?? slug, href: `/modules/${slug}` };
  }
  if (kind === 'tool') {
    const t = TOOLS.find((x) => x.slug === slug);
    return { title: t?.name ?? slug, href: `/tools/${slug}` };
  }
  return { title: slug, href: `/${kind}s/${slug}` };
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}
