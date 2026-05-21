import type { Citation } from './citation';

/**
 * Frameworks are first-class objects, not just text. A user can fork the
 * canonical version of a framework into a personal variant — that fork
 * becomes available in every tool, embedded mind map, and case page.
 * This is the Level 4 generative loop: user-created content is treated
 * exactly like built-in content.
 */

export type FrameworkCategory =
  | 'profitability'
  | 'market-entry'
  | 'm-and-a'
  | 'pricing'
  | 'operations'
  | 'market-sizing'
  | 'porters-five-forces'
  | '3c'
  | '4p'
  | '7s'
  | 'value-chain'
  | 'pyramid-principle'
  | 'mece'
  | 'custom';

/** A node in a framework's tree representation. Used by the mind map view. */
export interface FrameworkNode {
  id: string;
  label: string;
  /** Optional short prompt the user can practice against */
  prompt?: string;
  /** Optional explanation shown on hover/expand */
  explanation?: string;
  children?: FrameworkNode[];
}

export interface Framework {
  id: string;
  slug: string;
  name: string;
  category: FrameworkCategory;
  /** Plain-language description of when to use this framework */
  whenToUse: string;
  /** When NOT to use it — equally important */
  whenNotToUse?: string;
  /** Tree structure rendered as mind map */
  tree: FrameworkNode;
  /** Each framework must cite its origin */
  citations: Citation[];
  /** If this is a user-forked variant, points to the canonical parent */
  forkedFrom?: string;
  /** ISO timestamp; only present on user forks */
  createdAt?: string;
  /** Tags for cross-referencing in the case map */
  tags?: string[];
}
