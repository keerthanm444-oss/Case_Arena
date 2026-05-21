# Authoring

> The contract for landing new content in Case Arena. Every page in the app
> follows it. The build literally cannot ship pages that violate it.

## The North Star

**No hallucinations. Ever.**

Every framework, statistic, judge rubric, and case prompt in this app comes
from a real, cited source. The citation linter runs on every build and
refuses to compile content that violates the contract.

If you can't find the source, don't write the page. Use a stub or a
"TBD" note, not a guess.

## What lives where

```
content/
├── modules/<slug>.mdx       Curriculum modules (M0–M11)
├── cases/<slug>.mdx         Worked cases — one MDX per case
└── resources/<slug>.mdx     Books, podcasts, etc. (System 7 hub)
```

The filename's stem becomes the URL slug. So `content/cases/acme-coffee.mdx`
appears at `/cases/acme-coffee`.

## Frontmatter

### Modules

```yaml
---
id: M3                       # required · module canonical id
slug: structuring            # required · matches filename
title: Structuring           # required
tagline: How to build MECE trees under pressure
estimatedMinutes: 60         # rough completion time
status: published            # draft | verified | published
tags: [fundamentals, mece]
updatedAt: '2025-01-01'
---
```

### Cases

```yaml
---
id: c-acme-coffee
slug: acme-coffee-decline
title: 'Acme Coffee: stagnant revenue, falling profit'
source:                      # REQUIRED — every case needs a real source
  publisher: 'Case in Point'
  title: 'Case in Point — Complete Case Interview Preparation'
  authors: ['Cosentino, Marc']
  year: 2023
  needsVerification: false   # set true only while you verify; blocks prod build if left true
industry: retail             # see types/case.ts for the union
category: profitability      # see types/case.ts
difficulty: intro            # intro | standard | advanced | final-round
frameworks: [profitability, 3c]
timeEstimate: 35
tags: [profitability, retail, coffee]
problemStatement: |
  A regional 50-store specialty coffee chain has stagnant revenue but
  margin has compressed 30%...
clarifyingQuestions:
  - 'Is the stagnation across all stores or concentrated in markets?'
  - 'Has same-store traffic changed, or only ticket size?'
commonMistakes:
  - 'Jumping to cost-cutting without diagnosing what changed.'
variants:
  - 'Same problem, but revenue is DOWN 5% instead of flat.'
relatedCases: []             # explicit related-case slugs (bidirectional auto-edges)
solved: false                # set true only when full solution is authored
updatedAt: '2025-01-01'
---
```

## Citation rules

### 15-word quote ceiling

> Inside MDX, citation quotes are **≤ 15 words**. Hard cap. The schema
> rejects anything longer.

```mdx
<Citation
  publisher="HBS"
  title="Acme case"
  year={2023}
  quote="Revenue declined twelve percent in the third quarter"
/>
```

This rule keeps the build inside fair use even for in-copyright sources.
For longer excerpts, paraphrase and link to the source.

### Approved publishers

The whitelist lives in `types/citation.ts`. Adding a publisher requires
exactly two things:

1. The publisher is a real, identifiable entity (a journal, firm,
   competition, book, or established education site).
2. You add it to `APPROVED_PUBLISHERS` and the linter accepts it forever.

If you're unsure, set `needsVerification: true` in the citation; the build
will pass in development but fail in production until you confirm + add
the publisher to the whitelist.

### No invented prompts

If a case prompt comes from a real source, **paraphrase it** — never
reproduce verbatim, never invent details. The case at
`content/cases/acme-coffee-decline.mdx` is a good example: every fact
traces to a public published source.

## MDX shortcodes

Every shortcode is documented in `components/mdx/`. Most-used:

| Shortcode | When to use |
|-----------|-------------|
| `<Callout tone="...">` | Tip, warning, note, success — any boxed callout |
| `<Citation publisher="..." />` | Inline source reference (renders as a popover badge) |
| `<Framework slug="profitability">profit tree</Framework>` | Link a framework name to its mind map |
| `<AssumptionChip name="margin" base={0.2} alt={0.15} />` | Toggleable assumption (case bodies only) |
| `<LiveNumber compute="margin * 100" suffix="%" />` | Number that recomputes from assumption chips |
| `<IssueTreeEmbed slug="..." />` | Drop an editable issue tree inline |
| `<MindMapEmbed framework="profitability" />` | Drop the framework mind map inline |
| `<CaseLink slug="acme-coffee">other coffee case</CaseLink>` | Internal link with hover preview |
| `<ScratchPad slug="my-page" />` | Per-page notes textarea (auto-saved) |

## The reactive case pattern

The `AssumptionChip` + `LiveNumber` combo lets a case page have
interactive scenarios. Pattern:

```mdx
The current state has revenue at <AssumptionChip name="rev" base={200} unit="$M" />
and margins at <AssumptionChip name="margin" base={0.085} alt={0.12} label="margin" />.

<LiveNumber compute="rev * margin" prefix="$" suffix="M" large
            label="Operating profit" tone="accent" />
```

Toggling either chip recomputes the LiveNumber. Formulas use a safe parser
(no `eval`); see `components/mdx/AssumptionContext.tsx` for the function
whitelist (`min`, `max`, `round`, `abs`, `floor`, `ceil`, `pow`).

## Workflow

### Adding a case

1. Pick a real published case (HBS, Ivey, McKinsey, Cosentino, etc.).
2. Create `content/cases/<slug>.mdx` with the frontmatter template.
3. Paraphrase the problem statement — never copy verbatim.
4. Cite the source in the `source:` frontmatter object.
5. Write the body in MDX, using shortcodes as needed.
6. Add internal `<CaseLink>` references to related cases.
7. Run `npm run build` locally. If the citation linter passes, the case is live.

### Adding a module

1. Create `content/modules/<slug>.mdx`.
2. Use `## H2` for major sections, `### H3` for subsections — both
   become anchor links in the TOC rail.
3. Use `<Callout>` liberally to mark tips and warnings.
4. End each module with a "what's next" pointer.
5. Set `status: published` only when the page is complete + reviewed.

### Adding a framework

If the framework is one of the canonical 13, it's already in
`components/muscles/mind-map/canonical-frameworks.ts`. To add a new one:

1. Update `types/framework.ts` to add it to the union.
2. Add a fully-cited node tree to `canonical-frameworks.ts`.
3. Reference it from MDX with `<Framework slug="your-slug">`.

## Local development

```bash
npm run dev               # Hot-reload server at :3000
npm run lint:citations    # Just the citation check
npm run typecheck         # TypeScript only
npm test                  # Vitest unit suite
npm run test:e2e          # Playwright smoke
npm run build             # Full production build (citations → next → pagefind)
```

## Style notes

- Prefer short paragraphs. The reading surface is a focused study tool.
- Use `<Callout>` to break up long sections rather than nested headings.
- Number examples (1, 2, 3) when the order matters; bullets when it doesn't.
- Code blocks render in JetBrains Mono. Inline code wraps in a subtle pill.
- Use the `$$ math $$` block for math sparingly — most case math is
  arithmetic that reads cleaner as prose or a `<LiveNumber>`.

## What you cannot do

- ❌ Invent a case prompt.
- ❌ Cite a publisher that isn't real and verifiable.
- ❌ Quote more than 15 words from any source.
- ❌ Reproduce a paragraph verbatim, even from a public source.
- ❌ Use real names without citation.
- ❌ Ship `needsVerification: true` to production.

The linter catches the last three automatically. The first three are
your judgment.
