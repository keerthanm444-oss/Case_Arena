import type { Citation } from './citation';
import type { FrameworkCategory } from './framework';

/**
 * Case type — engineered for Level 2+ interactivity.
 *
 * A case is NOT a static essay. It's a reactive document: assumptions are
 * toggleable chips, quant inputs are sliders, the recommendation recomputes
 * live. The data model below carries every piece of state needed for that.
 */

export type CaseIndustry =
  | 'retail'
  | 'cpg'
  | 'tech-saas'
  | 'tech-consumer'
  | 'financial-services'
  | 'healthcare'
  | 'pharma'
  | 'energy'
  | 'manufacturing'
  | 'transportation'
  | 'media'
  | 'telecom'
  | 'food-and-beverage'
  | 'airline'
  | 'hospitality'
  | 'social-impact'
  | 'public-sector'
  | 'education';

export type CaseDifficulty = 'intro' | 'standard' | 'advanced' | 'final-round';

export type CaseCategory =
  | 'profitability'
  | 'market-entry'
  | 'm-and-a'
  | 'pricing'
  | 'operations'
  | 'market-sizing'
  | 'social-impact'
  | 'investment-decision'
  | 'turnaround'
  | 'new-product';

/**
 * A toggleable assumption on a case page. When the user toggles it on/off,
 * the page's reactive store applies deltas: numbers shift, tree branches
 * highlight or grey, the recommendation re-derives. THIS is what makes
 * cases manipulable rather than static.
 */
export interface CaseAssumption {
  id: string;
  label: string;
  /** Default toggle state */
  default: boolean;
  /** Plain-language description of what flipping this changes */
  effectDescription: string;
  /** Optional numeric deltas, keyed by metric id, applied when ON */
  numericDeltas?: Record<string, number>;
  /** Branches in the embedded issue tree this assumption activates */
  activatesBranches?: string[];
}

/**
 * A quant input is a slider on the case page. The reactive store recomputes
 * derived metrics any time one is moved.
 */
export interface CaseQuantInput {
  id: string;
  label: string;
  unit?: string;
  /** [min, default, max] */
  range: [number, number, number];
  step?: number;
  /** Citation backing the default value (real cases have real numbers) */
  citationId?: string;
}

/**
 * Derived metric — computed from inputs. Stored as a typed expression so
 * the renderer can both display the formula AND recompute on input change.
 */
export interface CaseDerivedMetric {
  id: string;
  label: string;
  unit?: string;
  /** Reference to other metric / input ids, e.g. ["revenue", "*", "margin"] */
  expression: string;
  /** Optional human-readable formula display */
  display?: string;
}

/** Pre-seeded issue tree node, editable on the page */
export interface CaseIssueTreeNode {
  id: string;
  label: string;
  /** Optional note shown when node is expanded */
  note?: string;
  /** Branch id this node belongs to, for assumption-driven highlighting */
  branchId?: string;
  children?: CaseIssueTreeNode[];
}

export interface CaseRecommendation {
  /** Primary recommendation, in 1-2 sentences */
  primary: string;
  /** Bullet list of supporting reasons */
  rationale: string[];
  /** Risks that must be addressed */
  risks: string[];
  /** Concrete next steps */
  nextSteps: string[];
}

export interface CaseJudgeNotes {
  /** Real, published rubric only. If no rubric exists, this section is omitted. */
  rubricCitationId: string;
  /** What top teams emphasized */
  whatTopTeamsDid: string[];
  /** Common point loss */
  commonPointLoss: string[];
}

export interface Case {
  // ---- Identity ----
  id: string;
  slug: string;
  title: string;
  /** Real source attribution — required */
  source: Citation;

  // ---- Classification ----
  industry: CaseIndustry;
  category: CaseCategory;
  difficulty: CaseDifficulty;
  /** Frameworks this case primarily exercises */
  frameworks: FrameworkCategory[];
  /** Estimated time to solve, in minutes */
  timeEstimate: number;
  /** Tags for search and the case map graph */
  tags: string[];

  // ---- Reactive content ----
  /** Paraphrased problem statement — never verbatim from source */
  problemStatement: string;
  /** Clarifying questions a strong candidate would ask */
  clarifyingQuestions: string[];
  /** Toggleable assumption chips on the page */
  assumptions: CaseAssumption[];
  /** Quant slider inputs */
  quantInputs: CaseQuantInput[];
  /** Derived metrics that recompute from inputs */
  derivedMetrics: CaseDerivedMetric[];
  /** Pre-seeded but editable issue tree */
  issueTree: CaseIssueTreeNode;

  // ---- Resolution ----
  /** Recommended framework with rationale */
  frameworkRationale: string;
  /** The recommendation — may reference derived metrics by id */
  recommendation: CaseRecommendation;
  /** Optional, only if real published rubric exists */
  judgeNotes?: CaseJudgeNotes;
  /** Mistakes commonly made on this case */
  commonMistakes: string[];
  /** Variant prompts — modifications the user can practice */
  variants: string[];

  // ---- Graph relationships (feed the case map) ----
  /** Explicit related case slugs. Bidirectional edges auto-generated by the
   *  graph builder in System 3. */
  relatedCases: string[];

  // ---- Meta ----
  /** Set in MDX frontmatter; only present after full solution is authored */
  solved: boolean;
  /** ISO timestamp of last revision */
  updatedAt: string;
}

/** Slim shape used for listings, the map graph, and search results */
export interface CaseSummary {
  id: string;
  slug: string;
  title: string;
  industry: CaseIndustry;
  category: CaseCategory;
  difficulty: CaseDifficulty;
  frameworks: FrameworkCategory[];
  timeEstimate: number;
  sourcePublisher: string;
  solved: boolean;
  tags: string[];
}
