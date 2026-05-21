# System 3 — Wiring Guide

> Practical reference for components built in Systems 4+. Reading this once
> means you'll never need to ask "where does X live" again.

## Emitting an event

```tsx
'use client';
import { useEmit } from '@/lib/event-bus';

export function SolvedToggle({ caseSlug }: { caseSlug: string }) {
  const emit = useEmit();
  return (
    <button
      onClick={async () => {
        await emit('case.solved.toggled', { caseSlug, solved: true, selfRating: 4 });
      }}
    >
      Mark solved
    </button>
  );
}
```

That single call:
1. Persists the event to Dexie's `events` table
2. Updates the in-memory recent-events ring (visible in the DevEventLog panel)
3. Fans out to reducers: `case.solved.toggled` updates the `cases` table AND
   the `skill` heatmap

## Reading derived state

```tsx
'use client';
import { useCaseProgress, useRecentlyViewed } from '@/lib/db/hooks';

export function CaseHeader({ slug }: { slug: string }) {
  const progress = useCaseProgress(slug);
  if (!progress) return null; // SSR / first paint
  return <span>{progress.solved ? 'Solved' : 'Open'}</span>;
}

export function Sidebar() {
  const recent = useRecentlyViewed(5);
  return recent?.map(r => <a href={`/${r.kind}s/${r.slug}`} key={r.key}>{r.slug}</a>);
}
```

## Reading preferences

```tsx
'use client';
import { usePreferences } from '@/lib/store';

export function ThemeSwitcher() {
  const { theme, setTheme } = usePreferences();
  return (
    <select value={theme} onChange={(e) => setTheme(e.target.value as any)}>
      <option value="terminal">Terminal</option>
      <option value="boardroom">Boardroom</option>
      <option value="daylight">Daylight</option>
    </select>
  );
}
```

`setTheme` does three things atomically: updates the store, persists to
localStorage, and sets the `data-theme` attribute on `<html>` (which is what
actually swaps the CSS variables).

## Adding a new event kind

1. Add the new kind to the `InteractionEventKind` union in `types/interaction.ts`
2. Add a payload variant to the `InteractionEvent` discriminated union
3. Either extend an existing reducer in `lib/event-bus/reducers/` to handle
   the new kind, or create a new reducer and register it in `bus.ts`'s
   `reducers` array
4. The Vitest suite in `tests/unit/event-bus.test.ts` will fail-compile if
   your payload shape is wrong — that's the safety net

## Adding a new Dexie table

1. Add the row interface to `lib/db/db.ts`
2. Bump the `version()` number and add the table schema string
3. Add a `Table<...>` field to the `CaseArenaDb` class
4. Add a hook in `lib/db/hooks.ts` if components will read it
5. Update `resetDb()` and `exportSnapshot()` to include the new table

## The linter

```bash
npm run lint:citations           # check, exit 1 on errors
NODE_ENV=production npm run build  # blocks if any needsVerification=true
```

Rules enforced (see `docs/CITATION_CONTRACT.md`):

- Citation Zod schema (publisher whitelist, year range, kebab-case id)
- Quote length ≤ 15 words
- One quote per source per page
- `<Citation id="...">` resolves to a frontmatter entry
- In production, no `needsVerification: true` survives
- Numeric/factual claims outside `<Citation>` → warning (or error in
  `strictCitations: true` mode)

## Adding MDX content

Drop a file into `content/modules/` or `content/cases/`. The loader picks it
up automatically; no registry edit required. Frontmatter must match the
respective Zod schema in `lib/schemas/index.ts`.

Example minimum case frontmatter:

```yaml
---
id: my-case
slug: my-case
title: My Case
industry: retail
category: profitability
difficulty: standard
timeEstimate: 45
frameworks: [profitability]
tags: [test]
solved: false
source:
  id: hbs-source-id
  type: academic
  publisher: Harvard Business School
  title: Original case title
  year: 2024
citations: []
relatedCases: []
---
```

## SSR safety

`getDb()` and the React-side hooks (`useLiveQuery`, `useEmit`) all guard
against the server. The Dexie instance is constructed lazily on first
client-side access. Effect-time access is fine; module-top-level access
from a server component is not.
