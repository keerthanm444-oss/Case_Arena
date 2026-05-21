/**
 * Citation contract
 * ----------------
 * Every factual claim, statistic, framework attribution, case problem, judge
 * rubric, or quoted phrase MUST be wrapped in a typed Citation. The build-time
 * linter (scripts/verify-citations.ts) refuses to ship pages with bare
 * numeric/factual claims that lack a <Citation> wrapper.
 */

export type SourceType =
  | 'academic'          // HBS, Ivey, MIT Sloan, Wharton, Darden, etc.
  | 'consulting-firm'   // McKinsey, BCG, Bain, Deloitte, etc.
  | 'competition'       // HULT, KPMG ICC, CFA Research Challenge, etc.
  | 'book'              // Case in Point, Pyramid Principle, etc.
  | 'journal'           // HBR, MIT Sloan Management Review, etc.
  | 'firm-report';      // McKinsey Global Institute, BCG analyses

/** Whitelist of approved publishers. The linter checks against this set. */
export const APPROVED_PUBLISHERS = [
  // Academic
  'Harvard Business School',
  'Harvard Business Review',
  'Ivey Publishing',
  'MIT Sloan LearningEdge',
  'MIT Sloan Management Review',
  'Wharton',
  'Darden Business Publishing',
  'Kellogg School of Management',
  'Tuck School of Business',
  'INSEAD',
  'Stanford Graduate School of Business',
  'Yale School of Management',
  // Consulting firms
  'McKinsey & Company',
  'Boston Consulting Group',
  'Bain & Company',
  'Deloitte',
  'Oliver Wyman',
  'Roland Berger',
  'Kearney',
  // Competitions
  'HULT Prize Foundation',
  'Deloitte National Undergraduate Case Competition',
  'KPMG International Case Competition',
  'CFA Institute',
  'Map the System',
  'McKinsey Venture Academy',
  'RSM STAR Case Competition',
  'HEC Montreal International Case Competition',
  'John Molson MBA International Case Competition',
  'Champions Trophy Case Competition',
  'Aspire Leaders Program',
  // Books
  'Case in Point',
  'Case Interview Secrets',
  'The Pyramid Principle',
  'Crafting Persuasion',
  'Lords of Strategy',
  'Competitive Strategy',
] as const;

export type ApprovedPublisher = (typeof APPROVED_PUBLISHERS)[number];

export interface Citation {
  /** Unique slug, used for deduplication and footnote ordering */
  id: string;
  type: SourceType;
  publisher: ApprovedPublisher | string; // string allowed only if [VERIFY]-flagged
  /** Required fields */
  title: string;
  /** Authors as a list of "Last, First" or "Last, F." */
  authors?: string[];
  year?: number;
  /** Page or chapter for books, slide # for decks, paragraph for articles */
  locator?: string;
  /** Stable URL to the source; required for online sources, optional for books */
  url?: string;
  /** Verbatim quoted text — MUST be ≤15 words. Linter enforces. */
  quote?: string;
  /** Soft flag the author sets while drafting; linter blocks the build if any
   *  citation has unresolved [VERIFY] markers in production mode. */
  needsVerification?: boolean;
}

/** A claim is what a Citation supports. The MDX <Citation> component wraps
 *  the claim and renders a footnote. The linter pairs claims to citations. */
export interface Claim {
  text: string;
  citationIds: string[];
}
