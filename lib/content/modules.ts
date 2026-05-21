/**
 * Module content registry.
 *
 * System 2 stage: returns empty / placeholder data because no MDX has been
 * authored yet. In System 3 (Circulatory) this file will be wired to the
 * fumadocs-mdx loader via `source.config.ts` collections and will return
 * fully-validated content. The function signatures here are STABLE — they
 * will not change between System 2 and System 3, so downstream code can
 * import from this module today.
 */

import type { ModuleSummary } from '@/types';
import { readMDXCollection } from './loaders/mdx-loader';

/** Curriculum spine — the canonical order. Drives module nav even before
 *  any content is authored, so empty shells render in the correct sequence. */
export const MODULE_SPINE: ReadonlyArray<{
  id: string;
  slug: string;
  order: number;
  title: string;
  tagline: string;
  estimatedMinutes: number;
}> = [
  {
    id: 'M0',
    slug: 'orientation',
    order: 0,
    title: 'Orientation',
    tagline: 'What case competitions are and why they matter',
    estimatedMinutes: 25,
  },
  {
    id: 'M1',
    slug: 'business-literacy',
    order: 1,
    title: 'Business Literacy & Mental Math',
    tagline: 'P&L fluency, unit economics, fast arithmetic',
    estimatedMinutes: 90,
  },
  {
    id: 'M2',
    slug: 'structuring',
    order: 2,
    title: 'Structuring',
    tagline: 'MECE, issue trees, hypothesis-driven thinking',
    estimatedMinutes: 75,
  },
  {
    id: 'M3',
    slug: 'frameworks',
    order: 3,
    title: 'Frameworks',
    tagline: 'Profitability, Market Entry, M&A, Pricing, Ops, Sizing',
    estimatedMinutes: 120,
  },
  {
    id: 'M4',
    slug: 'quantitative',
    order: 4,
    title: 'Quantitative Mastery',
    tagline: 'Sizing patterns, NPV, payback, sensitivity',
    estimatedMinutes: 100,
  },
  {
    id: 'M5',
    slug: 'qualitative',
    order: 5,
    title: 'Qualitative Excellence',
    tagline: 'Creativity, recommendations, executive presence',
    estimatedMinutes: 80,
  },
  {
    id: 'M6',
    slug: 'slide-craft',
    order: 6,
    title: 'Slide Craft',
    tagline: 'Action titles, ghost decks, McKinsey slide grammar',
    estimatedMinutes: 90,
  },
  {
    id: 'M7',
    slug: 'team-dynamics',
    order: 7,
    title: 'Team Dynamics',
    tagline: 'Roles, time-boxing, conflict resolution',
    estimatedMinutes: 60,
  },
  {
    id: 'M8',
    slug: 'presentation',
    order: 8,
    title: 'Live Presentation & Q&A',
    tagline: 'Voice, pacing, handling hostile judges, recovery',
    estimatedMinutes: 70,
  },
  {
    id: 'M9',
    slug: 'case-library',
    order: 9,
    title: 'Case Library',
    tagline: '100 real cases across 10 industries',
    estimatedMinutes: 0, // computed from solved cases
  },
  {
    id: 'M10',
    slug: 'competition-strategy',
    order: 10,
    title: 'Competition Strategy',
    tagline: 'Judge psychology, scoring rubrics, what wins',
    estimatedMinutes: 60,
  },
  {
    id: 'M11',
    slug: 'resources',
    order: 11,
    title: 'Resources Hub',
    tagline: 'Books, channels, communities, mock partners',
    estimatedMinutes: 30,
  },
];

/** All module summaries in canonical order. Authored MDX overrides spine
 *  defaults for `status` and `estimatedMinutes`. */
export function getAllModules(): ModuleSummary[] {
  const authored = new Map<string, Record<string, unknown>>();
  try {
    for (const doc of readMDXCollection('modules')) {
      authored.set(doc.slug, doc.frontmatter);
    }
  } catch {
    // Build-time only. On client, the spine is the source.
  }
  return MODULE_SPINE.map((m) => {
    const fm = authored.get(m.slug);
    const status =
      (fm?.status as ModuleSummary['status']) ?? ('draft' as const);
    const estimatedMinutes =
      typeof fm?.estimatedMinutes === 'number'
        ? (fm.estimatedMinutes as number)
        : m.estimatedMinutes;
    return {
      id: m.id,
      slug: m.slug,
      order: m.order,
      title: (fm?.title as string) ?? m.title,
      tagline: (fm?.tagline as string) ?? m.tagline,
      estimatedMinutes,
      status,
    };
  });
}

/** Look up a module by slug. Merges spine + MDX frontmatter. */
export function getModuleBySlug(slug: string): ModuleSummary | null {
  const all = getAllModules();
  return all.find((m) => m.slug === slug) ?? null;
}

/** All slugs — used by Next.js generateStaticParams */
export function getAllModuleSlugs(): string[] {
  return MODULE_SPINE.map((m) => m.slug);
}

/** Read the MDX body for a module. Returns a friendly placeholder when no
 *  MDX file has been authored yet (Tissue passes will populate /content/modules). */
export async function getModuleBody(slug: string): Promise<string> {
  const doc = (await import('./loaders/mdx-loader')).findMDXBySlug('modules', slug);
  if (doc) return doc.body;
  const m = getModuleBySlug(slug);
  return [
    `## This module is on the way`,
    ``,
    `**${m?.title ?? slug}** is in the curriculum spine but its content has not been authored yet. The module shell, navigation, scratch pad, and table of contents all work — they're waiting on content to populate.`,
    ``,
    `Authoring happens in **Tissue passes** (M0–M11). When the corresponding \`.mdx\` file lands in \`/content/modules/${slug}.mdx\`, this page becomes the real module — no code changes required.`,
    ``,
    `### What this module will cover`,
    ``,
    m?.tagline ? `> ${m.tagline}` : '',
    ``,
    `In the meantime:`,
    `- Use the [interactive tools](/tools) to practice individual skills`,
    `- Browse the [case library](/cases) for worked examples`,
    `- Check the [case map](/map) for the relationship graph`,
  ].join('\n');
}
