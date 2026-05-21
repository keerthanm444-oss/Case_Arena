import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Container, PageHeader } from '@/components/layout';
import { StatusPill } from '@/components/display/status-pill';
import { TOOLS, getAllToolSlugs, getToolBySlug, type ToolSlug } from '@/lib/content/tools';
import { MuscleSwitcher } from '@/components/muscles/MuscleSwitcher';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllToolSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const t = getToolBySlug(slug);
  if (!t) return { title: 'Tool not found' };
  return { title: t.name, description: t.tagline };
}

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  return (
    <div className="py-8">
      <Container width="xl">
        <PageHeader
          eyebrow={<StatusPill tone="accent">{tool.arrives}</StatusPill>}
          title={tool.name}
          description={tool.tagline}
          meta={
            tool.requires ? (
              <div className="font-mono text-2xs uppercase tracking-wider text-fg-subtle">
                Requires · {tool.requires}
              </div>
            ) : null
          }
        />
        <MuscleSwitcher slug={tool.slug as ToolSlug} />
      </Container>
    </div>
  );
}
