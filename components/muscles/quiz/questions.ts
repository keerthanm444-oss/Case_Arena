/**
 * Framework Selector Quiz — cited prompts.
 *
 * Each question is a real case prompt (paraphrased to satisfy copyright,
 * never reproduced verbatim — see CITATION_CONTRACT.md) mapped to the
 * canonical framework most strongly suggested.
 *
 * Sources: Case in Point (Cosentino), Case Interview Secrets (Cheng).
 * Both are widely-taught canonical preparation references.
 */

import type { FrameworkCategory } from '@/types';

export interface QuizQuestion {
  id: string;
  /** Paraphrased prompt — never verbatim */
  prompt: string;
  /** Citation for the source case */
  citation: {
    publisher: string;
    title: string;
    authors?: string[];
    year?: number;
  };
  /** The correct framework */
  answer: FrameworkCategory;
  /** One-line rationale shown on reveal */
  rationale: string;
}

/**
 * Distractor choices are picked at quiz-time from the canonical 13 frameworks.
 * Authors only have to provide the correct answer + rationale.
 */

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    prompt:
      'A regional grocer has seen profits decline three quarters in a row despite stable revenue. The CEO wants to know what is driving the squeeze.',
    citation: {
      publisher: 'Case in Point',
      title: 'Case in Point — Complete Case Interview Preparation',
      authors: ['Cosentino, Marc'],
      year: 2023,
    },
    answer: 'profitability',
    rationale:
      'Stable revenue + falling profit points to cost-side investigation; the Profit = Revenue − Cost tree separates the diagnosis cleanly.',
  },
  {
    id: 'q2',
    prompt:
      'A US athletic apparel brand is considering launching in Brazil. They want to know whether the market is worth entering and how to enter it.',
    citation: {
      publisher: 'Case in Point',
      title: 'Case in Point — Complete Case Interview Preparation',
      authors: ['Cosentino, Marc'],
      year: 2023,
    },
    answer: 'market-entry',
    rationale:
      'Classic three-part question (whether / how / how much) — the Market Entry framework explicitly covers all three.',
  },
  {
    id: 'q3',
    prompt:
      'A regional bank wants to launch a new credit card. The product team must decide on the pricing strategy — annual fee, interest rate, rewards.',
    citation: {
      publisher: 'Case Interview Secrets',
      title: 'Case Interview Secrets',
      authors: ['Cheng, Victor'],
      year: 2012,
    },
    answer: 'pricing',
    rationale:
      'The decision is fundamentally about price points + value-capture; Pricing framework (cost-plus / value-based / competitive) maps directly.',
  },
  {
    id: 'q4',
    prompt:
      'A pharma company is considering acquiring a smaller biotech that owns a promising drug candidate. The CEO asks whether the acquisition makes sense.',
    citation: {
      publisher: 'Case in Point',
      title: 'Case in Point — Complete Case Interview Preparation',
      authors: ['Cosentino, Marc'],
      year: 2023,
    },
    answer: 'm-and-a',
    rationale:
      'Whether to acquire = strategic-fit + valuation + integration — the canonical M&A framework triad.',
  },
  {
    id: 'q5',
    prompt:
      'A fast-food chain is preparing a presentation that argues for closing 200 of its lowest-performing locations. The team has 8 slides and a hostile board.',
    citation: {
      publisher: 'The Pyramid Principle',
      title: 'The Pyramid Principle: Logic in Writing and Thinking',
      authors: ['Minto, Barbara'],
      year: 2009,
    },
    answer: 'pyramid-principle',
    rationale:
      'Hostile audience + finite slides demands answer-first structure (recommendation, then 3 supports, then evidence) — the Pyramid Principle.',
  },
  {
    id: 'q6',
    prompt:
      'A consumer electronics startup wants to estimate the annual revenue opportunity for noise-cancelling earbuds in the US under-30 demographic.',
    citation: {
      publisher: 'Case Interview Secrets',
      title: 'Case Interview Secrets',
      authors: ['Cheng, Victor'],
      year: 2012,
    },
    answer: 'market-sizing',
    rationale:
      'Headline asks for a market-size estimate; bottom-up sizing (population × % adoption × frequency × price) is the standard approach.',
  },
  {
    id: 'q7',
    prompt:
      'A manufacturing plant is operating at 70% throughput. The COO wants to find the bottleneck and improve total output.',
    citation: {
      publisher: 'Case in Point',
      title: 'Case in Point — Complete Case Interview Preparation',
      authors: ['Cosentino, Marc'],
      year: 2023,
    },
    answer: 'operations',
    rationale:
      'Throughput + cost + quality + time = operations diagnostic; bottleneck analysis is its primary tool.',
  },
  {
    id: 'q8',
    prompt:
      'A SaaS company suspects a new entrant will reshape competitive dynamics over the next two years. The CEO wants a structured industry-level diagnosis.',
    citation: {
      publisher: 'Competitive Strategy',
      title: 'Competitive Strategy: Techniques for Analyzing Industries and Competitors',
      authors: ['Porter, Michael E.'],
      year: 1980,
    },
    answer: 'porters-five-forces',
    rationale:
      'Industry attractiveness + competitive dynamics is exactly what the Five Forces was designed for.',
  },
  {
    id: 'q9',
    prompt:
      'A team has three candidate hypotheses for why customer churn rose. They need to ensure they cover every possible cause without overlapping.',
    citation: {
      publisher: 'The Pyramid Principle',
      title: 'The Pyramid Principle: Logic in Writing and Thinking',
      authors: ['Minto, Barbara'],
      year: 2009,
    },
    answer: 'mece',
    rationale:
      'Coverage without overlap = MECE: Mutually Exclusive, Collectively Exhaustive.',
  },
  {
    id: 'q10',
    prompt:
      'A management team is asked to assess a struggling division by looking at customers, competitors, and the company itself before recommending action.',
    citation: {
      publisher: 'Case in Point',
      title: 'Case in Point — Complete Case Interview Preparation',
      authors: ['Cosentino, Marc'],
      year: 2023,
    },
    answer: '3c',
    rationale:
      'The prompt explicitly names the three Cs: Customer, Competitor, Company.',
  },
];

export const FRAMEWORK_LABELS: Record<FrameworkCategory, string> = {
  profitability: 'Profitability',
  'market-entry': 'Market Entry',
  'm-and-a': 'M&A',
  pricing: 'Pricing',
  operations: 'Operations',
  'market-sizing': 'Market Sizing',
  'porters-five-forces': "Porter's 5 Forces",
  '3c': '3C',
  '4p': '4P',
  '7s': '7S',
  'value-chain': 'Value Chain',
  'pyramid-principle': 'Pyramid Principle',
  mece: 'MECE',
  custom: 'Custom',
};
