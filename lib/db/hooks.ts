/**
 * React hooks for Dexie. Thin wrappers over `useLiveQuery` (Dexie reactive
 * queries that re-render when the underlying table changes).
 *
 * SSR-safe: each hook returns `undefined` during the first render and only
 * after hydration does the actual query run. Components that consume these
 * should render a skeleton state for `undefined`.
 */

'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { getDb } from './db';
import type {
  CaseProgressRow,
  ModuleProgressRow,
  RecentlyViewedRow,
  SkillHeatRow,
  DrillRow,
  SaveRow,
} from './db';

// ---------- Progress ----------

export function useModuleProgress(slug: string): ModuleProgressRow | undefined {
  return useLiveQuery(() => getDb().modules.get(slug), [slug]);
}

export function useAllModuleProgress(): ModuleProgressRow[] | undefined {
  return useLiveQuery(() => getDb().modules.toArray());
}

export function useCaseProgress(slug: string): CaseProgressRow | undefined {
  return useLiveQuery(() => getDb().cases.get(slug), [slug]);
}

export function useSolvedCaseCount(): number | undefined {
  return useLiveQuery(() =>
    getDb()
      .cases.where('solved')
      .equals(1 as unknown as boolean) // Dexie quirk: booleans index as 0/1
      .count(),
  );
}

// ---------- Recently viewed ----------

export function useRecentlyViewed(
  limit = 10,
): RecentlyViewedRow[] | undefined {
  return useLiveQuery(() =>
    getDb()
      .recent.orderBy('visitedAt')
      .reverse()
      .limit(limit)
      .toArray(),
  );
}

// ---------- Drills ----------

export function useDrillHistory(
  drillType?: DrillRow['drillType'],
  limit = 50,
): DrillRow[] | undefined {
  return useLiveQuery(async () => {
    const db = getDb();
    if (drillType) {
      return db.drills
        .where('drillType')
        .equals(drillType)
        .reverse()
        .limit(limit)
        .toArray();
    }
    return db.drills.orderBy('at').reverse().limit(limit).toArray();
  }, [drillType, limit]);
}

// ---------- Skill heatmap ----------

export function useSkillHeatmap(): SkillHeatRow[] | undefined {
  return useLiveQuery(() => getDb().skill.toArray());
}

// ---------- Saves ----------

export function useSavesByKind(
  kind: SaveRow['kind'],
  contextRef?: string,
): SaveRow[] | undefined {
  return useLiveQuery(async () => {
    const db = getDb();
    let q = db.saves.where('kind').equals(kind);
    const rows = await q.reverse().sortBy('updatedAt');
    if (contextRef) return rows.filter((r) => r.contextRef === contextRef);
    return rows;
  }, [kind, contextRef]);
}
