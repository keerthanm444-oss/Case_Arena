/**
 * Framework registry.
 *
 * Canonical frameworks are defined as TypeScript constants here (not MDX)
 * because they're a closed, finite set that every other surface — mind map
 * tool, case pages, framework quiz, AI partner system prompt — must read
 * from. User-forked variants live in Dexie (System 3) and merge in at
 * runtime via the same accessor.
 *
 * System 2: only the spine list (slugs + names). Full tree structures
 * arrive in System 6 (Muscles) alongside the mind-map renderer.
 */

import type { FrameworkCategory } from '@/types';

export interface FrameworkSpineEntry {
  id: string;
  slug: string;
  name: string;
  category: FrameworkCategory;
  /** One-liner shown in framework picker */
  tagline: string;
}

export const FRAMEWORK_SPINE: ReadonlyArray<FrameworkSpineEntry> = [
  { id: 'fw-prof',   slug: 'profitability',       name: 'Profitability',       category: 'profitability',       tagline: 'Revenue × Margin diagnosis' },
  { id: 'fw-entry',  slug: 'market-entry',        name: 'Market Entry',        category: 'market-entry',        tagline: 'Whether, how, and how much' },
  { id: 'fw-mna',    slug: 'm-and-a',             name: 'M&A',                 category: 'm-and-a',             tagline: 'Strategic fit, valuation, integration' },
  { id: 'fw-price',  slug: 'pricing',             name: 'Pricing',             category: 'pricing',             tagline: 'Cost-plus, value-based, competitive' },
  { id: 'fw-ops',    slug: 'operations',          name: 'Operations',          category: 'operations',          tagline: 'Throughput, cost, quality, time' },
  { id: 'fw-sizing', slug: 'market-sizing',       name: 'Market Sizing',       category: 'market-sizing',       tagline: 'Top-down vs bottom-up' },
  { id: 'fw-p5f',    slug: 'porters-five-forces', name: "Porter's Five Forces",category: 'porters-five-forces', tagline: 'Industry attractiveness' },
  { id: 'fw-3c',     slug: '3c',                  name: '3C',                  category: '3c',                  tagline: 'Customer, Competitor, Company' },
  { id: 'fw-4p',     slug: '4p',                  name: '4P Marketing Mix',    category: '4p',                  tagline: 'Product, Price, Place, Promotion' },
  { id: 'fw-7s',     slug: '7s',                  name: 'McKinsey 7S',         category: '7s',                  tagline: 'Strategy, Structure, Systems, Style, Staff, Skills, Shared values' },
  { id: 'fw-vc',     slug: 'value-chain',         name: 'Value Chain',         category: 'value-chain',         tagline: 'Primary + support activities' },
  { id: 'fw-pp',     slug: 'pyramid-principle',   name: 'Pyramid Principle',   category: 'pyramid-principle',   tagline: 'Answer-first, grouped support' },
  { id: 'fw-mece',   slug: 'mece',                name: 'MECE',                category: 'mece',                tagline: 'Mutually exclusive, collectively exhaustive' },
];

export function getAllFrameworks(): readonly FrameworkSpineEntry[] {
  return FRAMEWORK_SPINE;
}

export function getFrameworkBySlug(slug: string): FrameworkSpineEntry | null {
  return FRAMEWORK_SPINE.find((f) => f.slug === slug) ?? null;
}
