import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllModuleSlugs, getModuleBySlug, getModuleBody } from '@/lib/content/modules';
import { ModuleRenderer } from '@/components/mdx/ModuleRenderer';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllModuleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const m = getModuleBySlug(slug);
  if (!m) return { title: 'Module not found' };
  return {
    title: `${m.id} · ${m.title}`,
    description: m.tagline,
  };
}

export default async function ModulePage({ params }: PageProps) {
  const { slug } = await params;
  const m = getModuleBySlug(slug);
  if (!m) notFound();
  const body = await getModuleBody(slug);
  return <ModuleRenderer module={m} body={body} />;
}
