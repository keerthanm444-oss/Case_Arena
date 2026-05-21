import type { InteractionEvent } from '@/types/interaction';
import { getDb, type CaseProgressRow } from '@/lib/db/db';

/** Builds per-case progress from case.* events. */
export async function applyCaseProgress(event: InteractionEvent): Promise<void> {
  const db = getDb();

  const get = (slug: string) => db.cases.get(slug);
  const blank = (slug: string, at: string): CaseProgressRow => ({
    caseSlug: slug,
    opened: false,
    attempted: false,
    solved: false,
    timeSpentSeconds: 0,
    treeSaveIds: [],
    lastVisitedAt: at,
  });

  switch (event.kind) {
    case 'case.opened': {
      const { caseSlug } = event.payload;
      const existing = (await get(caseSlug)) ?? blank(caseSlug, event.at);
      await db.cases.put({ ...existing, opened: true, lastVisitedAt: event.at });
      return;
    }
    case 'case.assumption.toggled':
    case 'case.input.changed':
    case 'case.tree.edited': {
      const { caseSlug } = event.payload;
      const existing = (await get(caseSlug)) ?? blank(caseSlug, event.at);
      await db.cases.put({
        ...existing,
        opened: true,
        attempted: true,
        lastVisitedAt: event.at,
      });
      return;
    }
    case 'case.scratch.saved': {
      // The page's text editor calls db.cases.put with `scratchPad` text. This
      // event just refreshes lastVisitedAt + attempted flag.
      const { caseSlug } = event.payload;
      const existing = (await get(caseSlug)) ?? blank(caseSlug, event.at);
      await db.cases.put({
        ...existing,
        attempted: true,
        lastVisitedAt: event.at,
      });
      return;
    }
    case 'case.solved.toggled': {
      const { caseSlug, solved, selfRating } = event.payload;
      const existing = (await get(caseSlug)) ?? blank(caseSlug, event.at);
      await db.cases.put({
        ...existing,
        opened: true,
        attempted: true,
        solved,
        selfRating: selfRating ?? existing.selfRating,
        lastVisitedAt: event.at,
      });
      return;
    }
    default:
      return;
  }
}
