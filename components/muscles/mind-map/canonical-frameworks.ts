/**
 * Canonical framework trees.
 *
 * Each tree is a small data structure that drives the Framework Mind Map.
 * Trees are based on canonical, published frameworks — no invented branches.
 *
 * For System 6a we ship five fully-built trees:
 *   profitability, market-entry, mece, pyramid-principle, 3c
 *
 * The other 8 frameworks render a placeholder node + "expand in System 6a-2 or
 * Tissue passes" hint. The data structure is identical; only the contents are
 * stubbed for now.
 *
 * Source attribution:
 *   - Profitability, Market Entry, 3C  — Case in Point (Cosentino)
 *   - MECE, Pyramid Principle           — The Pyramid Principle (Minto)
 *   - Porter's 5F, Value Chain          — Competitive Strategy / Competitive Advantage (Porter)
 *   - 4P                                — Marketing Management (Kotler)
 *   - 7S                                — In Search of Excellence (Peters & Waterman, McKinsey)
 *
 * These are taught universally across MBA programs and case-interview prep.
 */

export interface FrameworkTreeNode {
  id: string;
  label: string;
  /** Optional one-liner shown on hover */
  hint?: string;
  children?: FrameworkTreeNode[];
}

export interface CanonicalFramework {
  slug: string;
  name: string;
  /** Citation for this framework's canonical source */
  source: { publisher: string; title: string; authors?: string[]; year?: number };
  root: FrameworkTreeNode;
}

export const CANONICAL_FRAMEWORKS: Record<string, CanonicalFramework> = {
  profitability: {
    slug: 'profitability',
    name: 'Profitability',
    source: {
      publisher: 'Case in Point',
      title: 'Case in Point — Complete Case Interview Preparation',
      authors: ['Cosentino, Marc'],
      year: 2023,
    },
    root: {
      id: 'p-root',
      label: 'Profit = Revenue − Cost',
      hint: 'Diagnose drops by separating top-line and cost-side drivers.',
      children: [
        {
          id: 'p-rev',
          label: 'Revenue',
          children: [
            {
              id: 'p-rev-vol',
              label: 'Volume',
              hint: 'Units / customers / transactions',
              children: [
                { id: 'p-rev-vol-mkt', label: 'Market growth or decline' },
                { id: 'p-rev-vol-share', label: 'Our share of that market' },
                { id: 'p-rev-vol-channels', label: 'Channel mix' },
              ],
            },
            {
              id: 'p-rev-price',
              label: 'Price',
              hint: 'Realized price per unit',
              children: [
                { id: 'p-rev-price-list', label: 'List price' },
                { id: 'p-rev-price-disc', label: 'Discounts / promotions' },
                { id: 'p-rev-price-mix', label: 'Product mix shift' },
              ],
            },
          ],
        },
        {
          id: 'p-cost',
          label: 'Cost',
          children: [
            {
              id: 'p-cost-var',
              label: 'Variable cost',
              hint: 'Scales with volume',
              children: [
                { id: 'p-cost-var-cogs', label: 'COGS / raw materials' },
                { id: 'p-cost-var-labor', label: 'Direct labor' },
                { id: 'p-cost-var-ship', label: 'Shipping / fulfillment' },
              ],
            },
            {
              id: 'p-cost-fixed',
              label: 'Fixed cost',
              hint: 'Independent of volume in short run',
              children: [
                { id: 'p-cost-fixed-ovh', label: 'Overhead / SG&A' },
                { id: 'p-cost-fixed-rd', label: 'R&D' },
                { id: 'p-cost-fixed-mkt', label: 'Marketing / brand' },
              ],
            },
          ],
        },
      ],
    },
  },

  'market-entry': {
    slug: 'market-entry',
    name: 'Market Entry',
    source: {
      publisher: 'Case in Point',
      title: 'Case in Point — Complete Case Interview Preparation',
      authors: ['Cosentino, Marc'],
      year: 2023,
    },
    root: {
      id: 'me-root',
      label: 'Should we enter?',
      hint: 'Whether → How → How much',
      children: [
        {
          id: 'me-attr',
          label: 'Is the market attractive?',
          children: [
            { id: 'me-attr-size', label: 'Size + growth' },
            { id: 'me-attr-comp', label: 'Competitive intensity' },
            { id: 'me-attr-margins', label: 'Industry margins' },
            { id: 'me-attr-regs', label: 'Regulatory / barriers' },
          ],
        },
        {
          id: 'me-fit',
          label: 'Can we win there?',
          children: [
            { id: 'me-fit-cap', label: 'Capability fit' },
            { id: 'me-fit-brand', label: 'Brand permission' },
            { id: 'me-fit-cost', label: 'Cost advantage' },
            { id: 'me-fit-channel', label: 'Channel access' },
          ],
        },
        {
          id: 'me-how',
          label: 'How do we enter?',
          children: [
            { id: 'me-how-build', label: 'Build (greenfield)' },
            { id: 'me-how-buy', label: 'Buy (acquire)' },
            { id: 'me-how-partner', label: 'Partner (JV / license)' },
          ],
        },
        {
          id: 'me-econ',
          label: 'Are the economics worth it?',
          children: [
            { id: 'me-econ-invest', label: 'Required investment' },
            { id: 'me-econ-payback', label: 'Payback period' },
            { id: 'me-econ-npv', label: 'NPV / IRR' },
            { id: 'me-econ-risk', label: 'Risk-adjusted return' },
          ],
        },
      ],
    },
  },

  '3c': {
    slug: '3c',
    name: '3C — Customer, Competitor, Company',
    source: {
      publisher: 'Case in Point',
      title: 'Case in Point — Complete Case Interview Preparation',
      authors: ['Cosentino, Marc'],
      year: 2023,
    },
    root: {
      id: '3c-root',
      label: 'Strategic situation',
      children: [
        {
          id: '3c-cust',
          label: 'Customer',
          children: [
            { id: '3c-cust-segments', label: 'Segments + needs' },
            { id: '3c-cust-wtp', label: 'Willingness to pay' },
            { id: '3c-cust-trends', label: 'Behavioral trends' },
          ],
        },
        {
          id: '3c-comp',
          label: 'Competitor',
          children: [
            { id: '3c-comp-direct', label: 'Direct competitors' },
            { id: '3c-comp-indirect', label: 'Substitutes' },
            { id: '3c-comp-moves', label: 'Recent strategic moves' },
          ],
        },
        {
          id: '3c-co',
          label: 'Company',
          children: [
            { id: '3c-co-strengths', label: 'Capabilities + assets' },
            { id: '3c-co-gaps', label: 'Gaps + weaknesses' },
            { id: '3c-co-finance', label: 'Financial position' },
          ],
        },
      ],
    },
  },

  mece: {
    slug: 'mece',
    name: 'MECE',
    source: {
      publisher: 'The Pyramid Principle',
      title: 'The Pyramid Principle: Logic in Writing and Thinking',
      authors: ['Minto, Barbara'],
      year: 2009,
    },
    root: {
      id: 'mece-root',
      label: 'MECE structuring',
      hint: 'Mutually Exclusive, Collectively Exhaustive',
      children: [
        {
          id: 'mece-me',
          label: 'Mutually Exclusive',
          hint: 'No overlap between branches',
          children: [
            { id: 'mece-me-clear', label: 'Each branch has clear, distinct scope' },
            { id: 'mece-me-test', label: 'Test: can any item fit in two boxes?' },
          ],
        },
        {
          id: 'mece-ce',
          label: 'Collectively Exhaustive',
          hint: 'No gaps; covers the full problem',
          children: [
            { id: 'mece-ce-cover', label: 'All possibilities accounted for' },
            { id: 'mece-ce-test', label: 'Test: is there an "other" we miss?' },
          ],
        },
      ],
    },
  },

  'pyramid-principle': {
    slug: 'pyramid-principle',
    name: 'Pyramid Principle',
    source: {
      publisher: 'The Pyramid Principle',
      title: 'The Pyramid Principle: Logic in Writing and Thinking',
      authors: ['Minto, Barbara'],
      year: 2009,
    },
    root: {
      id: 'pp-root',
      label: 'Answer first',
      hint: 'Lead with the recommendation',
      children: [
        {
          id: 'pp-key',
          label: 'Key supports (3–5)',
          hint: 'Each support is a substantive reason',
          children: [
            { id: 'pp-key-1', label: 'Support 1' },
            { id: 'pp-key-2', label: 'Support 2' },
            { id: 'pp-key-3', label: 'Support 3' },
          ],
        },
        {
          id: 'pp-evidence',
          label: 'Evidence under each support',
          hint: 'Data, analysis, case-specific facts',
          children: [
            { id: 'pp-ev-data', label: 'Quantitative evidence' },
            { id: 'pp-ev-qual', label: 'Qualitative evidence' },
            { id: 'pp-ev-precedent', label: 'Precedent / analogy' },
          ],
        },
      ],
    },
  },
};

const STUB_FRAMEWORKS = [
  'm-and-a', 'pricing', 'operations', 'market-sizing',
  'porters-five-forces', '4p', '7s', 'value-chain',
];

for (const slug of STUB_FRAMEWORKS) {
  CANONICAL_FRAMEWORKS[slug] = {
    slug,
    name: slug,
    source: {
      publisher: 'TBD',
      title: 'Stub — full tree authored in Tissue passes',
    },
    root: {
      id: `${slug}-root`,
      label: `${slug} (stub)`,
      hint: 'Full tree arrives in later passes.',
    },
  };
}

export function getCanonicalFramework(slug: string): CanonicalFramework | null {
  return CANONICAL_FRAMEWORKS[slug] ?? null;
}
