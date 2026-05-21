/**
 * Case content registry — wired to the MDX loader as of System 3.
 *
 * Cases ship as MDX in `content/cases/<slug>.mdx`. Each file's frontmatter
 * conforms to the case Zod schema (lib/schemas/index.ts). This module reads
 * frontmatter only — the body is compiled by the case renderer in System 7.
 */

import type {
  CaseSummary,
  CaseIndustry,
  CaseCategory,
  CaseDifficulty,
  FrameworkCategory,
} from '@/types';


function toSummary(fm: Record<string, unknown>, slug: string): CaseSummary | null {
  if (typeof fm.title !== 'string') return null;
  if (typeof fm.industry !== 'string') return null;
  if (typeof fm.category !== 'string') return null;
  if (typeof fm.difficulty !== 'string') return null;

  const sourcePublisher =
    typeof fm.source === 'object' &&
    fm.source !== null &&
    'publisher' in fm.source &&
    typeof (fm.source as { publisher: unknown }).publisher === 'string'
      ? ((fm.source as { publisher: string }).publisher)
      : 'unknown';

  return {
    id: (fm.id as string) ?? slug,
    slug,
    title: fm.title,
    industry: fm.industry as CaseIndustry,
    category: fm.category as CaseCategory,
    difficulty: fm.difficulty as CaseDifficulty,
    frameworks: Array.isArray(fm.frameworks)
      ? (fm.frameworks as FrameworkCategory[])
      : [],
    timeEstimate: typeof fm.timeEstimate === 'number' ? fm.timeEstimate : 30,
    sourcePublisher,
    solved: Boolean(fm.solved),
    tags: Array.isArray(fm.tags) ? (fm.tags as string[]) : [],
  };
}

export async function getAllCases(): Promise<CaseSummary[]> {
  let authored = new Map<string, Record<string, unknown>>();
  if (typeof window === 'undefined') {
    try {
      const { readMDXCollection } = await import('./loaders/mdx-loader');
      for (const doc of readMDXCollection('cases')) {
        authored.set(doc.slug, doc.frontmatter);
      }
    } catch (e) {
      // ignore during client builds
    }
  }
  const map = authored;
  return CASE_SPINE.map((c) => {
    const fm = map.get(c.slug);
    const status = (fm?.status as CaseSummary['status']) ?? ('draft' as const);
    const timeEstimate = typeof fm?.timeEstimate === 'number' ? (fm.timeEstimate as number) : c.timeEstimate;
    return {
      id: c.id,
      slug: c.slug,
      title: (fm?.title as string) ?? c.title,
      industry: (fm?.industry as CaseIndustry) ?? c.industry,
      category: (fm?.category as CaseCategory) ?? c.category,
      difficulty: (fm?.difficulty as CaseDifficulty) ?? c.difficulty,
      frameworks: Array.isArray(fm?.frameworks) ? (fm.frameworks as FrameworkCategory[]) : [],
      timeEstimate,
      sourcePublisher: c.sourcePublisher,
      solved: Boolean(fm?.solved),
      tags: Array.isArray(fm?.tags) ? (fm.tags as string[]) : [],
      status,
    };
  });
}
  try {
    return readMDXCollection('cases')
      .map((d) => toSummary(d.frontmatter, d.slug))
      .filter((c): c is CaseSummary => c !== null);
  } catch {
    return [];
  }
}

export function getCaseBySlug(slug: string): CaseSummary | null {
  return getAllCases().find((c) => c.slug === slug) ?? null;
}

export function getAllCaseSlugs(): string[] {
  return getAllCases().map((c) => c.slug);
}

// ---------- Filters ----------

export interface CaseFilters {
  industries?: CaseIndustry[];
  categories?: CaseCategory[];
  difficulties?: CaseDifficulty[];
  frameworks?: FrameworkCategory[];
  publishers?: string[];
  onlySolved?: boolean;
  tags?: string[];
  search?: string;
}

export function filterCases(filters: CaseFilters): CaseSummary[] {
  const all = getAllCases();
  return all.filter((c) => {
    if (filters.industries?.length && !filters.industries.includes(c.industry))
      return false;
    if (filters.categories?.length && !filters.categories.includes(c.category))
      return false;
    if (filters.difficulties?.length && !filters.difficulties.includes(c.difficulty))
      return false;
    if (filters.publishers?.length && !filters.publishers.includes(c.sourcePublisher))
      return false;
    if (filters.onlySolved && !c.solved) return false;
    if (filters.frameworks?.length) {
      const hit = c.frameworks.some((f) => filters.frameworks!.includes(f));
      if (!hit) return false;
    }
    if (filters.tags?.length) {
      const hit = c.tags.some((t) => filters.tags!.includes(t));
      if (!hit) return false;
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (
        !c.title.toLowerCase().includes(q) &&
        !c.tags.some((t) => t.toLowerCase().includes(q))
      ) {
        return false;
      }
    }
    return true;
  });
}

/** Get the raw frontmatter for a case — used by the case map builder to
 *  read `relatedCases` arrays. */
export function getCaseFrontmatter(slug: string): Record<string, unknown> | null {
  try {
    const doc = readMDXCollection('cases').find((d) => d.slug === slug);
    return doc?.frontmatter ?? null;
  } catch {
    return null;
  }
}

import { findMDXBySlug } from './loaders/mdx-loader';
import type { Case } from '@/types';

/** Read the full Case record from MDX frontmatter. Returns null when the
 *  file is missing (no MDX authored yet) — the page should render a stub. */
export function getCaseFull(slug: string): Case | null {
  const doc = findMDXBySlug('cases', slug);
  if (!doc) return null;
  const fm = doc.frontmatter;
  if (typeof fm.title !== 'string') return null;

  return {
    id: (fm.id as string) ?? slug,
    slug,
    title: fm.title,
    source:
      (fm.source as Case['source']) ??
      { publisher: 'unknown' as const, title: fm.title, year: 0 },
    industry: (fm.industry as Case['industry']) ?? 'other',
    category: (fm.category as Case['category']) ?? 'profitability',
    difficulty: (fm.difficulty as Case['difficulty']) ?? 'standard',
    frameworks: Array.isArray(fm.frameworks) ? (fm.frameworks as Case['frameworks']) : [],
    timeEstimate: typeof fm.timeEstimate === 'number' ? fm.timeEstimate : 30,
    tags: Array.isArray(fm.tags) ? (fm.tags as string[]) : [],
    problemStatement: (fm.problemStatement as string) ?? '',
    clarifyingQuestions: Array.isArray(fm.clarifyingQuestions)
      ? (fm.clarifyingQuestions as string[])
      : [],
    assumptions: Array.isArray(fm.assumptions) ? (fm.assumptions as Case['assumptions']) : [],
    quantInputs: Array.isArray(fm.quantInputs) ? (fm.quantInputs as Case['quantInputs']) : [],
    derivedMetrics: Array.isArray(fm.derivedMetrics) ? (fm.derivedMetrics as Case['derivedMetrics']) : [],
    issueTree:
      (fm.issueTree as Case['issueTree']) ??
      { id: 'root', label: fm.title, children: [] },
    frameworkRationale: (fm.frameworkRationale as string) ?? '',
    recommendation:
      (fm.recommendation as Case['recommendation']) ??
      { headline: '', supports: [] },
    judgeNotes: fm.judgeNotes as Case['judgeNotes'] | undefined,
    commonMistakes: Array.isArray(fm.commonMistakes) ? (fm.commonMistakes as string[]) : [],
    variants: Array.isArray(fm.variants) ? (fm.variants as string[]) : [],
    relatedCases: Array.isArray(fm.relatedCases) ? (fm.relatedCases as string[]) : [],
    solved: Boolean(fm.solved),
    updatedAt: (fm.updatedAt as string) ?? new Date().toISOString(),
  };
}

/** Read the raw MDX body for a case. Returns a stub when the file is missing. */
export async function getCaseBody(slug: string): Promise<string> {
  const doc = findMDXBySlug('cases', slug);
  if (doc) return doc.body;
  return [
    `## Case in progress`,
    ``,
    `**${slug}** is not yet authored in \`/content/cases/${slug}.mdx\`. The case-page shell, related-cases rail, scratch pad, and assumption / live-number wiring all work — they're waiting on content.`,
    ``,
    `Until the case is authored, you can:`,
    `- Practice on the [interactive tools](/tools)`,
    `- Explore the [case map](/map)`,
  ].join('\n');
}
