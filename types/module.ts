import type { Citation } from './citation';

/**
 * Module = a unit of curriculum (M0..M11). Each module is an MDX file in
 * /content/modules. The frontmatter conforms to this shape; the body
 * embeds interactive muscles via MDX components (built in System 6).
 */

export type ModuleStatus = 'draft' | 'verified' | 'published';

export interface ModuleSection {
  /** Used as anchor and TOC entry */
  id: string;
  title: string;
  /** Estimated reading + practice time in minutes */
  estimatedMinutes: number;
}

export interface ModulePrerequisite {
  /** slug of the prerequisite module */
  slug: string;
  /** Whether it's hard required (blocking) or soft suggested */
  hard: boolean;
}

export interface Module {
  id: string;             // e.g. "M3"
  slug: string;           // e.g. "frameworks"
  order: number;          // sort order in the curriculum
  title: string;
  /** One-line hook shown in nav + landing */
  tagline: string;
  /** Longer summary used in module list + map metadata */
  summary: string;
  /** Total estimated time, in minutes */
  estimatedMinutes: number;
  /** What the learner can do after completing the module */
  learningOutcomes: string[];
  /** Prerequisites by slug */
  prerequisites: ModulePrerequisite[];
  /** TOC entries — must mirror the MDX section structure */
  sections: ModuleSection[];
  /** All citations referenced in this module */
  citations: Citation[];
  /** Interactive muscles embedded in this module — used by the linter to
   *  verify the L2 interactivity rule (every module embeds ≥1 muscle) */
  embeddedMuscles: string[];
  /** Cases this module directly references; feeds the map */
  linkedCases: string[];
  status: ModuleStatus;
  updatedAt: string;
}

/** Slim shape for nav and search */
export interface ModuleSummary {
  id: string;
  slug: string;
  order: number;
  title: string;
  tagline: string;
  estimatedMinutes: number;
  status: ModuleStatus;
}
