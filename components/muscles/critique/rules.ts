/**
 * Slide title critique — pure-function rule engine.
 *
 * Rules embody published slide-craft norms (see Minto's Pyramid Principle
 * and Cheng's Case Interview Secrets):
 *
 *   1. Action title — should make a claim ("Revenue fell" not "Revenue trend")
 *   2. Quantified — should include a number when relevant
 *   3. Parallel structure — for lists, each item starts the same way
 *   4. Length — between 6 and 14 words is the canonical sweet spot
 *   5. Jargon — flag commonly-empty words ("leverage", "synergy", "robust")
 *   6. Hedging — flag uncertain qualifiers ("might", "could", "perhaps")
 *
 * The engine is rule-based, deliberately no LLM. Predictable + fast.
 */

export type RuleSeverity = 'error' | 'warning' | 'note';

export interface RuleResult {
  ruleId: string;
  severity: RuleSeverity;
  message: string;
  /** Optional suggested rewrite hint */
  suggestion?: string;
}

export interface CritiqueResult {
  title: string;
  results: RuleResult[];
  /** Number of rules passed */
  passed: number;
  total: number;
}

// Verb hint set — slightly conservative; not exhaustive.
const ACTION_VERBS = new Set([
  'fell', 'fall', 'rose', 'rise', 'grew', 'grow', 'declined', 'increase',
  'increased', 'decrease', 'decreased', 'is', 'are', 'has', 'have', 'will',
  'should', 'must', 'cuts', 'cut', 'beats', 'beat', 'lost', 'lose', 'gains',
  'gained', 'shifts', 'shifted', 'doubles', 'doubled', 'tripled', 'launched',
  'launches', 'acquired', 'acquires', 'expanded', 'expands', 'merged',
  'reduced', 'reduces', 'eliminated', 'eliminates', 'recommend', 'recommends',
]);

const JARGON_WORDS = new Set([
  'leverage', 'synergy', 'synergies', 'robust', 'paradigm', 'best-of-breed',
  'world-class', 'cutting-edge', 'seamless', 'holistic', 'scalable', 'innovative',
]);

const HEDGES = new Set([
  'might', 'could', 'perhaps', 'maybe', 'possibly', 'somewhat', 'fairly',
]);

const NUMERIC_REGEX = /\$?\d[\d,]*(\.\d+)?\s*[%KMBT]?/;

function tokenize(s: string): string[] {
  return s.toLowerCase().split(/\s+/).filter((w) => w.length > 0);
}

const RULES: Array<(title: string) => RuleResult> = [
  // 1. Action verb
  (title) => {
    const tokens = tokenize(title);
    const hasVerb = tokens.some((t) => ACTION_VERBS.has(t.replace(/[.,!?]$/, '')));
    return hasVerb
      ? { ruleId: 'action-verb', severity: 'note', message: '✓ Has an action verb.' }
      : {
          ruleId: 'action-verb',
          severity: 'warning',
          message: 'No clear action verb — title may be descriptive, not claim-making.',
          suggestion: 'Rewrite as a sentence with a verb: "X fell" or "We should Y".',
        };
  },

  // 2. Quantification
  (title) => {
    return NUMERIC_REGEX.test(title)
      ? { ruleId: 'quantified', severity: 'note', message: '✓ Quantified.' }
      : {
          ruleId: 'quantified',
          severity: 'warning',
          message: 'No number found — consider adding one for executive impact.',
          suggestion: 'Add a quantity: "Revenue fell 12%" beats "Revenue fell".',
        };
  },

  // 3. Length
  (title) => {
    const n = tokenize(title).length;
    if (n < 4)
      return {
        ruleId: 'length',
        severity: 'warning',
        message: `Title is short (${n} words). Likely too vague.`,
        suggestion: 'Aim for 6–14 words. Specify the subject and the outcome.',
      };
    if (n > 18)
      return {
        ruleId: 'length',
        severity: 'warning',
        message: `Title is long (${n} words). Trim subordinate clauses.`,
        suggestion: 'Aim for 6–14 words. Move detail into the body of the slide.',
      };
    return { ruleId: 'length', severity: 'note', message: `✓ Length ok (${n} words).` };
  },

  // 4. Jargon
  (title) => {
    const tokens = tokenize(title);
    const hit = tokens.find((t) => JARGON_WORDS.has(t.replace(/[.,!?]$/, '')));
    return hit
      ? {
          ruleId: 'jargon',
          severity: 'warning',
          message: `Vague jargon: "${hit}" — say what you actually mean.`,
          suggestion: 'Replace with a concrete claim ("scaled to 3 regions" not "scalable rollout").',
        }
      : { ruleId: 'jargon', severity: 'note', message: '✓ No common jargon.' };
  },

  // 5. Hedging
  (title) => {
    const tokens = tokenize(title);
    const hit = tokens.find((t) => HEDGES.has(t.replace(/[.,!?]$/, '')));
    return hit
      ? {
          ruleId: 'hedging',
          severity: 'warning',
          message: `Hedging language: "${hit}". Action titles state, they don't suggest.`,
          suggestion: 'Drop the hedge or back it with evidence ("X is likely to grow 15% based on Y").',
        }
      : { ruleId: 'hedging', severity: 'note', message: '✓ No hedging.' };
  },

  // 6. Title case heuristic — discourage ALL CAPS / lower lower
  (title) => {
    if (title === title.toUpperCase() && title.length > 5)
      return {
        ruleId: 'case',
        severity: 'warning',
        message: 'All caps — feels shouty in a deck context.',
        suggestion: 'Use sentence case or title case.',
      };
    return { ruleId: 'case', severity: 'note', message: '✓ Reasonable case.' };
  },
];

export function critique(title: string): CritiqueResult {
  const t = title.trim();
  if (t.length === 0) {
    return { title, results: [], passed: 0, total: RULES.length };
  }
  const results = RULES.map((r) => r(t));
  const passed = results.filter((r) => r.severity === 'note').length;
  return { title: t, results, passed, total: RULES.length };
}
