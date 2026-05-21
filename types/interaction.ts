/**
 * Interaction event bus contract.
 *
 * Every meaningful user action emits a typed event. The dashboard,
 * recommendations engine, weak-spot detector, and "related cases" rail
 * all read from this event log (persisted to Dexie).
 *
 * This is the spine of Level 3 statefulness — without a typed, durable
 * event stream, "the app remembers" stays a vibe instead of a feature.
 */

export type InteractionEventKind =
  // ---- Navigation ----
  | 'page.viewed'
  | 'palette.opened'
  | 'palette.action'
  | 'search.query'
  // ---- Module ----
  | 'module.section.completed'
  | 'module.note.saved'
  | 'module.highlight.added'
  // ---- Case ----
  | 'case.opened'
  | 'case.assumption.toggled'
  | 'case.input.changed'
  | 'case.tree.edited'
  | 'case.scratch.saved'
  | 'case.solved.toggled'
  | 'case.variant.spawned'
  // ---- Tools (Muscles) ----
  | 'tree.created'
  | 'tree.exported'
  | 'mindmap.framework.forked'
  | 'decision.tree.scenario.saved'
  | 'sizing.scenario.saved'
  | 'drill.completed'
  | 'quiz.completed'
  | 'critique.run'
  | 'timer.session.completed'
  // ---- Map ----
  | 'map.view.changed'
  | 'map.filter.applied'
  | 'map.compare.pinned'
  | 'map.compare.unpinned'
  | 'map.view.saved'
  | 'map.path.requested'
  // ---- Settings ----
  | 'theme.changed'
  | 'density.changed'
  | 'ai.partner.configured';

/**
 * Discriminated union. Every event carries strongly-typed payload.
 * The store (System 3) narrows on `kind` to apply reducers.
 */
export type InteractionEvent =
  | { kind: 'page.viewed'; at: string; payload: { path: string } }
  | { kind: 'palette.opened'; at: string; payload: Record<string, never> }
  | { kind: 'palette.action'; at: string; payload: { action: string; target?: string } }
  | { kind: 'search.query'; at: string; payload: { q: string; resultCount: number } }
  | { kind: 'module.section.completed'; at: string; payload: { moduleSlug: string; sectionId: string } }
  | { kind: 'module.note.saved'; at: string; payload: { moduleSlug: string; sectionId: string; length: number } }
  | { kind: 'module.highlight.added'; at: string; payload: { moduleSlug: string; sectionId: string } }
  | { kind: 'case.opened'; at: string; payload: { caseSlug: string } }
  | { kind: 'case.assumption.toggled'; at: string; payload: { caseSlug: string; assumptionId: string; value: boolean } }
  | { kind: 'case.input.changed'; at: string; payload: { caseSlug: string; inputId: string; value: number } }
  | { kind: 'case.tree.edited'; at: string; payload: { caseSlug: string; nodeCount: number } }
  | { kind: 'case.scratch.saved'; at: string; payload: { caseSlug: string; length: number } }
  | { kind: 'case.solved.toggled'; at: string; payload: { caseSlug: string; solved: boolean; selfRating?: number } }
  | { kind: 'case.variant.spawned'; at: string; payload: { caseSlug: string; variantIndex: number } }
  | { kind: 'tree.created'; at: string; payload: { context?: string; nodeCount: number } }
  | { kind: 'tree.exported'; at: string; payload: { format: 'png' | 'json' | 'md' } }
  | { kind: 'mindmap.framework.forked'; at: string; payload: { parentFrameworkId: string; newId: string } }
  | { kind: 'decision.tree.scenario.saved'; at: string; payload: { name: string; ev: number } }
  | { kind: 'sizing.scenario.saved'; at: string; payload: { name: string; result: number } }
  | { kind: 'drill.completed'; at: string; payload: { drillId: string; score: number; durationSec: number } }
  | { kind: 'quiz.completed'; at: string; payload: { score: number; questions: number } }
  | { kind: 'critique.run'; at: string; payload: { title: string; passedChecks: number; totalChecks: number } }
  | { kind: 'timer.session.completed'; at: string; payload: { totalSec: number; phases: number } }
  | { kind: 'map.view.changed'; at: string; payload: { mode: 'web' | 'branch' | 'matrix' } }
  | { kind: 'map.filter.applied'; at: string; payload: { filterCount: number } }
  | { kind: 'map.compare.pinned'; at: string; payload: { nodeId: string; trayCount: number } }
  | { kind: 'map.compare.unpinned'; at: string; payload: { nodeId: string; trayCount: number } }
  | { kind: 'map.view.saved'; at: string; payload: { viewId: string; name: string } }
  | { kind: 'map.path.requested'; at: string; payload: { fromNodeId: string; toNodeId: string; pathLength: number } }
  | { kind: 'theme.changed'; at: string; payload: { theme: 'terminal' | 'boardroom' | 'daylight' } }
  | { kind: 'density.changed'; at: string; payload: { density: 'comfortable' | 'compact' | 'dense' } }
  | { kind: 'ai.partner.configured'; at: string; payload: { provider: 'groq' | 'google' | 'openrouter' } };

/** Reducer signature implemented in System 3 */
export type InteractionEventReducer<S> = (state: S, event: InteractionEvent) => S;
