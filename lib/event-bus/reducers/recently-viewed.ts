import type { InteractionEvent } from '@/types/interaction';
import { getDb } from '@/lib/db/db';

const MAX_RECENTLY_VIEWED = 30;

/** Builds the recently-viewed rail. Capped at MAX_RECENTLY_VIEWED entries. */
export async function applyRecentlyViewed(event: InteractionEvent): Promise<void> {
  const db = getDb();

  // Only certain events register as "views"
  let kind: 'module' | 'case' | 'framework' | 'tool' | null = null;
  let slug: string | null = null;

  switch (event.kind) {
    case 'page.viewed': {
      // /modules/[slug], /cases/[slug], /tools/[slug] all qualify
      const m = event.payload.path.match(/^\/(modules|cases|tools)\/([^/]+)\/?$/);
      if (m) {
        kind = m[1] === 'modules' ? 'module' : m[1] === 'cases' ? 'case' : 'tool';
        slug = m[2] ?? null;
      }
      break;
    }
    case 'case.opened':
      kind = 'case';
      slug = event.payload.caseSlug;
      break;
    case 'mindmap.framework.forked':
      kind = 'framework';
      slug = event.payload.parentFrameworkId;
      break;
    default:
      return;
  }

  if (!kind || !slug) return;

  const key = `${kind}:${slug}`;
  await db.recent.put({
    key,
    kind,
    slug,
    visitedAt: event.at,
  });

  // Trim to cap
  const count = await db.recent.count();
  if (count > MAX_RECENTLY_VIEWED) {
    const oldest = await db.recent
      .orderBy('visitedAt')
      .limit(count - MAX_RECENTLY_VIEWED)
      .toArray();
    await db.recent.bulkDelete(oldest.map((r) => r.key));
  }
}
