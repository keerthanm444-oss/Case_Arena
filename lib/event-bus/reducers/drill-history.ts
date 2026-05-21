import type { InteractionEvent } from '@/types/interaction';
import { getDb } from '@/lib/db/db';
import { nanoid } from 'nanoid';

/** Persists drill results and rolls up the skill heatmap.
 *
 *  Drill events include `details` that may carry per-op breakdowns (mental
 *  math) or framework/industry tags (quiz). When present, we update the
 *  skill table so the dashboard heatmap reflects weak spots.
 */
export async function applyDrillHistory(event: InteractionEvent): Promise<void> {
  const db = getDb();

  if (event.kind === 'drill.completed') {
    const { drillId, score, durationSec } = event.payload;
    await db.drills.put({
      id: drillId || nanoid(8),
      drillType: 'mental-math',
      at: event.at,
      score,
      details: { durationSec },
    });
    return;
  }

  if (event.kind === 'quiz.completed') {
    const { score, questions } = event.payload;
    await db.drills.put({
      id: nanoid(8),
      drillType: 'framework-quiz',
      at: event.at,
      score,
      details: { questions },
    });
    return;
  }

  if (event.kind === 'critique.run') {
    const { title, passedChecks, totalChecks } = event.payload;
    await db.drills.put({
      id: nanoid(8),
      drillType: 'slide-critique',
      at: event.at,
      score: totalChecks > 0 ? passedChecks / totalChecks : 0,
      details: { title, passedChecks, totalChecks },
    });
    return;
  }

  // Skill heatmap updates from `case.solved.toggled` — solving an advanced
  // case in a (framework, industry) cell counts as a positive attempt.
  if (event.kind === 'case.solved.toggled') {
    const { caseSlug, solved } = event.payload;
    // We don't have the case's (framework, industry) here; in System 7 the
    // case page will dispatch a follow-up `skill.recorded` event with both.
    // For now we record the raw fact in a generic heatmap row using slug.
    // The dashboard (System 6b) joins these against the case registry.
    const key = `attempt:${caseSlug}`;
    const existing = await db.skill.get(key);
    const attempts = (existing?.attempts ?? 0) + 1;
    const avgScore =
      ((existing?.avgScore ?? 0) * (attempts - 1) + (solved ? 1 : 0)) / attempts;
    await db.skill.put({
      key,
      framework: 'tbd',
      industry: 'tbd',
      attempts,
      avgScore,
      lastAt: event.at,
    });
    return;
  }
}
