import type {
  CaseDifficulty,
  CaseIndustry,
  CaseCategory,
} from './case';
import type { FrameworkCategory } from './framework';

/**
 * Map graph contract. The map (SYSTEM 8) renders from these structures.
 * The graph is built deterministically from case + framework + module
 * frontmatter at build time, via lib/map-builder (created in SYSTEM 3).
 */

export type MapNodeKind = 'case' | 'framework' | 'industry' | 'module';

export type MapViewMode = 'web' | 'branch' | 'matrix';

export interface MapNode {
  id: string;
  kind: MapNodeKind;
  label: string;
  /** Optional sublabel — e.g. publisher for case nodes */
  sublabel?: string;
  /** Visual weight; case map sizes nodes by viewCount + difficulty */
  weight: number;
  /** All metadata needed for filters */
  meta: {
    industry?: CaseIndustry;
    category?: CaseCategory;
    difficulty?: CaseDifficulty;
    frameworks?: FrameworkCategory[];
    timeEstimate?: number;
    solved?: boolean;
    sourcePublisher?: string;
    tags?: string[];
  };
  /** Position hints for branch + matrix views (filled by layout pass) */
  layout?: {
    web?: { x: number; y: number };
    branch?: { depth: number; siblingIndex: number };
    matrix?: { row: number; col: number };
  };
}

export type MapEdgeKind =
  | 'shares-framework'
  | 'shares-industry'
  | 'related-explicit'  // from frontmatter `relatedCases`
  | 'parent-child'      // for branch view hierarchy
  | 'taught-in';        // case → module that references it

export interface MapEdge {
  id: string;
  source: string;
  target: string;
  kind: MapEdgeKind;
  /** Edge weight (0..1). Higher = stronger relationship. */
  weight: number;
  /** Label shown on hover, e.g. "Profitability + Retail" */
  label?: string;
}

export interface MapGraph {
  nodes: MapNode[];
  edges: MapEdge[];
  /** Build timestamp so the client knows when to invalidate Dexie cache */
  builtAt: string;
}

/** Saved view — persisted to Dexie. The user can save filter+layout combos. */
export interface MapSavedView {
  id: string;
  name: string;
  mode: MapViewMode;
  filters: {
    industries?: CaseIndustry[];
    categories?: CaseCategory[];
    difficulties?: CaseDifficulty[];
    frameworks?: FrameworkCategory[];
    publishers?: string[];
    onlySolved?: boolean;
    tags?: string[];
  };
  /** Node IDs pinned to the Compare Tray */
  pinned: string[];
  createdAt: string;
}
