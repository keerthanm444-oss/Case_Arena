/**
 * Dexie database — the persistent substrate for everything user-generated.
 *
 * Tables map directly to types/user.ts and types/interaction.ts. The event
 * log table is the spine of Level 3 statefulness; all other tables are
 * derived state that reducers populate by consuming events.
 *
 * SSR safety: the Dexie instance is constructed lazily so it never runs
 * during static export. Use `getDb()` inside client code or effects.
 */

import Dexie, { type Table } from 'dexie';
import type { InteractionEvent } from '@/types/interaction';

// ---------- Row types (DB-shape, distinct from app types) ----------

/** Events are stored as discriminated-union JSON. Indexed by `at` for range
 *  queries; by `kind` for reducer-specific filters; by id for dedup. */
export interface EventRow {
  /** Auto-incremented primary key */
  id?: number;
  /** ISO timestamp — indexed */
  at: string;
  /** Event kind — indexed for kind-specific reducers */
  kind: InteractionEvent['kind'];
  /** Full event payload — narrowed via `kind` */
  event: InteractionEvent;
}

export interface ModuleProgressRow {
  /** Primary key — module slug */
  moduleSlug: string;
  sectionsCompleted: string[];
  notes: Record<string, string>;
  highlights: Record<
    string,
    Array<{ start: number; end: number; text: string }>
  >;
  lastVisitedAt: string;
}

export interface CaseProgressRow {
  /** Primary key — case slug */
  caseSlug: string;
  opened: boolean;
  attempted: boolean;
  solved: boolean;
  selfRating?: number;
  timeSpentSeconds: number;
  treeSaveIds: string[];
  scratchPad?: string;
  lastVisitedAt: string;
}

export interface DrillRow {
  id: string;
  drillType: 'mental-math' | 'framework-quiz' | 'slide-critique';
  at: string;
  /** [0, 1] */
  score: number;
  /** Op-level details for weak-spot detection */
  details: Record<string, unknown>;
}

/** Generic saves table — issue trees, sizing scenarios, decision trees,
 *  map views, custom frameworks. Discriminated by `kind`. */
export interface SaveRow {
  id: string;
  kind:
    | 'issue-tree'
    | 'sizing-scenario'
    | 'decision-tree'
    | 'map-view'
    | 'framework-fork'
    | 'scratch';
  name: string;
  /** Foreign relation — e.g. caseSlug for tree saves */
  contextRef?: string;
  /** Payload — schema depends on `kind` (validated by individual muscles) */
  payload: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface RecentlyViewedRow {
  /** Composite primary key: `${kind}:${slug}` */
  key: string;
  kind: 'module' | 'case' | 'framework' | 'tool';
  slug: string;
  visitedAt: string;
}

/** Per-(framework, industry) heatmap cell. Derived from drill + case events. */
export interface SkillHeatRow {
  /** Composite key: `${framework}:${industry}` */
  key: string;
  framework: string;
  industry: string;
  /** Number of attempts */
  attempts: number;
  /** Avg score in [0, 1] */
  avgScore: number;
  /** Most recent ISO timestamp */
  lastAt: string;
}

// ---------- Database class ----------

class CaseArenaDb extends Dexie {
  events!: Table<EventRow, number>;
  modules!: Table<ModuleProgressRow, string>;
  cases!: Table<CaseProgressRow, string>;
  drills!: Table<DrillRow, string>;
  saves!: Table<SaveRow, string>;
  recent!: Table<RecentlyViewedRow, string>;
  skill!: Table<SkillHeatRow, string>;

  constructor() {
    super('case-arena');
    this.version(1).stores({
      // Schema strings: `&` primary key, `,` separators, prefix-` ` = no-index
      events: '++id, at, kind',
      modules: '&moduleSlug, lastVisitedAt',
      cases: '&caseSlug, lastVisitedAt, solved',
      drills: '&id, drillType, at',
      saves: '&id, kind, contextRef, updatedAt',
      recent: '&key, kind, visitedAt',
      skill: '&key, framework, industry, lastAt',
    });
  }
}

// ---------- Lazy singleton (SSR-safe) ----------

let _db: CaseArenaDb | null = null;

export function getDb(): CaseArenaDb {
  if (typeof window === 'undefined') {
    throw new Error(
      'getDb() called on the server. Use it inside client components or effects only.',
    );
  }
  if (!_db) _db = new CaseArenaDb();
  return _db;
}

/** Convenience: clear all data (used by Settings → Reset). Confirms required. */
export async function resetDb(): Promise<void> {
  const db = getDb();
  await Promise.all([
    db.events.clear(),
    db.modules.clear(),
    db.cases.clear(),
    db.drills.clear(),
    db.saves.clear(),
    db.recent.clear(),
    db.skill.clear(),
  ]);
}

/** Test-only: discard the singleton + reopen. Used by Vitest to give each
 *  test a clean database when running with fake-indexeddb. NOT for app code. */
export async function _resetDb(): Promise<void> {
  if (_db) {
    try {
      _db.close();
    } catch {
      // ignore — already closed
    }
  }
  _db = null;
}

/** Convenience: export full snapshot for backup / debug. */
export async function exportSnapshot() {
  const db = getDb();
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    events: await db.events.toArray(),
    modules: await db.modules.toArray(),
    cases: await db.cases.toArray(),
    drills: await db.drills.toArray(),
    saves: await db.saves.toArray(),
    recent: await db.recent.toArray(),
    skill: await db.skill.toArray(),
  };
}
