import Link from 'next/link';
import type { Metadata } from 'next';
import { SkeletonPage } from '@/components/skeleton/SkeletonPage';
import { Card } from '@/components/ui/card';
import { StatusPill } from '@/components/display/status-pill';
import { getAllModules } from '@/lib/content/modules';

export const metadata: Metadata = {
  title: 'Modules',
  description: '12-module curriculum from orientation to competition strategy.',
};

export default function ModulesIndexPage() {
  const modules = getAllModules();
  return (
    <SkeletonPage
      route="/modules"
      title="Curriculum"
      subtitle="Twelve modules. Linear if you're starting fresh; jump anywhere if you have prep behind you. Every concept paired with an embedded interactive tool."
      poweredBy="System 7 · Organs"
    >
      <Card variant="panel" className="overflow-hidden">
        <ul>
          {modules.map((m) => (
            <li key={m.id} className="border-b border-line last:border-b-0">
              <Link
                href={`/modules/${m.slug}`}
                className="grid grid-cols-[3rem_1fr_auto_4rem] items-baseline gap-4 px-4 py-4 hover:bg-bg-elevated transition-colors duration-fast"
              >
                <span className="font-mono text-2xs text-fg-subtle tabular-nums">
                  {m.id}
                </span>
                <div>
                  <div className="text-fg text-sm mb-0.5">{m.title}</div>
                  <div className="text-fg-muted text-xs">{m.tagline}</div>
                </div>
                <StatusPill tone={m.status === 'published' ? 'success' : 'outline'} size="xs">
                  {m.status}
                </StatusPill>
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
    </SkeletonPage>
  );
}
