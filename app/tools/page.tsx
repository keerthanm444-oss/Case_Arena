import Link from 'next/link';
import type { Metadata } from 'next';
import {
  GitBranch, Network, GitMerge, Calculator,
  Timer, ListChecks, Presentation, Clock, Bot,
} from 'lucide-react';
import { SkeletonPage } from '@/components/skeleton/SkeletonPage';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatusPill } from '@/components/display/status-pill';
import { TOOLS, type ToolSlug } from '@/lib/content/tools';

export const metadata: Metadata = {
  title: 'Tools',
  description:
    'Interactive muscles — issue tree builder, mind map, decision tree, sizing calc, mental math drill, framework quiz, slide critique, timer, AI partner.',
};

const ICONS: Record<ToolSlug, React.ComponentType<{ size?: number; className?: string }>> = {
  'issue-tree': GitBranch,
  'mind-map': Network,
  'decision-tree': GitMerge,
  sizing: Calculator,
  'mental-math': Timer,
  'framework-quiz': ListChecks,
  'slide-critique': Presentation,
  timer: Clock,
  'ai-partner': Bot,
};

export default function ToolsIndexPage() {
  return (
    <SkeletonPage
      route="/tools"
      title="Interactive tools"
      subtitle="Nine reusable muscles. Each one is embeddable inside modules and case pages — built once, used everywhere. Every interaction persists to the local event bus."
      poweredBy="System 6 · Muscles"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {TOOLS.map((t) => {
          const Icon = ICONS[t.slug];
          return (
            <Card key={t.slug} variant="panel" interactive className="overflow-hidden">
              <Link href={`/tools/${t.slug}`} className="block">
                <CardHeader>
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {Icon && <Icon size={14} className="text-accent" />}
                      <CardTitle>{t.name}</CardTitle>
                    </div>
                    <StatusPill tone="outline" size="xs">
                      {t.arrives}
                    </StatusPill>
                  </div>
                  <CardDescription>{t.tagline}</CardDescription>
                  {t.requires && (
                    <div className="font-mono text-2xs uppercase tracking-wider text-fg-subtle mt-2">
                      Requires · {t.requires}
                    </div>
                  )}
                </CardHeader>
              </Link>
            </Card>
          );
        })}
      </div>
    </SkeletonPage>
  );
}
