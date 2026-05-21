import type { InteractionEvent } from '@/types/interaction';
import { getDb } from '@/lib/db/db';

/** Builds per-module progress from module.* events. */
export async function applyModuleProgress(event: InteractionEvent): Promise<void> {
  const db = getDb();

  switch (event.kind) {
    case 'module.section.completed': {
      const { moduleSlug, sectionId } = event.payload;
      const existing = await db.modules.get(moduleSlug);
      const sections = new Set(existing?.sectionsCompleted ?? []);
      sections.add(sectionId);
      await db.modules.put({
        moduleSlug,
        sectionsCompleted: Array.from(sections),
        notes: existing?.notes ?? {},
        highlights: existing?.highlights ?? {},
        lastVisitedAt: event.at,
      });
      return;
    }
    case 'module.note.saved': {
      // The actual note text is held in the editor; we record visit-time + length.
      // (Real persistence of note bodies happens via the editor's own save flow,
      // which calls db.modules.put with the body in `notes`.)
      const { moduleSlug, sectionId } = event.payload;
      const existing = await db.modules.get(moduleSlug);
      await db.modules.put({
        moduleSlug,
        sectionsCompleted: existing?.sectionsCompleted ?? [],
        notes: { ...(existing?.notes ?? {}), [sectionId]: existing?.notes?.[sectionId] ?? '' },
        highlights: existing?.highlights ?? {},
        lastVisitedAt: event.at,
      });
      return;
    }
    case 'module.highlight.added': {
      const { moduleSlug, sectionId } = event.payload;
      const existing = await db.modules.get(moduleSlug);
      const sectionHighlights = existing?.highlights?.[sectionId] ?? [];
      await db.modules.put({
        moduleSlug,
        sectionsCompleted: existing?.sectionsCompleted ?? [],
        notes: existing?.notes ?? {},
        highlights: { ...(existing?.highlights ?? {}), [sectionId]: sectionHighlights },
        lastVisitedAt: event.at,
      });
      return;
    }
    default:
      return;
  }
}
