# Interaction Events

> The spine of Level 3 statefulness. Every meaningful user action emits a
> typed event. The dashboard, recommendations engine, weak-spot detector,
> and "related cases" rail all read from the event log.

## Why a typed event bus

A "stateful app" without a typed event substrate is just localStorage on
hard mode. The bus provides:

- **Durability.** Events persist to Dexie, survive reloads, fuel the dashboard.
- **Type safety.** Every event payload is narrowable via the discriminated
  union in `types/interaction.ts` — no `any` payloads, no string-typed kinds.
- **Replay.** Future analytics or "show me what I did last session" reads
  from a single log.
- **Single integration point.** Every muscle (issue tree, drill, map) emits
  to one bus instead of writing bespoke localStorage code.

## Event taxonomy

Events group into seven kinds:

1. **Navigation** — `page.viewed`, `palette.opened`, `palette.action`, `search.query`
2. **Module** — `module.section.completed`, `module.note.saved`, `module.highlight.added`
3. **Case** — `case.opened`, `case.assumption.toggled`, `case.input.changed`,
   `case.tree.edited`, `case.scratch.saved`, `case.solved.toggled`, `case.variant.spawned`
4. **Muscles (tools)** — `tree.*`, `mindmap.*`, `decision.tree.*`, `sizing.*`,
   `drill.completed`, `quiz.completed`, `critique.run`, `timer.session.completed`
5. **Map** — `map.view.changed`, `map.filter.applied`, `map.compare.pinned`,
   `map.compare.unpinned`, `map.view.saved`, `map.path.requested`
6. **Settings** — `theme.changed`, `density.changed`, `ai.partner.configured`

The full discriminated union lives in `types/interaction.ts`. Every event
carries `{ kind, at, payload }`.

## How features consume events

Each consumer is a pure reducer (System 3):

```ts
// example: the weak-spot detector
function weakSpotReducer(state: WeakSpots, event: InteractionEvent): WeakSpots {
  if (event.kind === 'drill.completed' && event.payload.score < 0.6) {
    return addWeakSpot(state, event.payload.drillId);
  }
  if (event.kind === 'case.solved.toggled' && event.payload.solved === false) {
    return addWeakSpot(state, event.payload.caseSlug);
  }
  return state;
}
```

This means the dashboard, the recommendations rail, and the "cases like the
last one you struggled with" panel all derive from the same event log without
shared mutable state.

## Privacy

All events are stored **client-side only** (Dexie IndexedDB). Nothing is sent
to any server. The optional AI Case Partner is the only feature that talks to
an external service, and even that uses the user's own BYO key sent directly
from the browser.

## Reducer registry

Implemented in System 3. List of derived state slices the bus feeds:

| Slice               | Derived from events                            |
|---------------------|------------------------------------------------|
| Recently viewed     | `page.viewed`, `case.opened`                   |
| Module progress     | `module.section.completed`, `module.note.saved`|
| Case progress       | `case.*`                                       |
| Drill history       | `drill.completed`, `quiz.completed`, `critique.run` |
| Skill heatmap       | `drill.completed` (op-level), `case.solved.toggled` |
| Weak spots          | `drill.completed`, `case.solved.toggled`, `quiz.completed` |
| Recommendation rail | All of the above + map graph                   |
| Map saved views     | `map.view.saved`                               |

## The rule

If a muscle, page, or tool changes user-visible state and the app should
remember it later, emit an event. If you're tempted to write to localStorage
directly, stop and add a new event kind to the discriminated union instead.
