# Citation Contract

> The single defining rule of Case Arena: **every factual claim has a source.**
> This document is the authoritative spec for what counts as a citation, how
> they're authored, and how the build-time linter enforces them.

## The rule, stated once

If a sentence makes a claim about the real world — a number, a framework, a
quote, a judge rubric, a case problem, a price, a competition result — it must
be wrapped in a `<Citation>` whose `id` resolves to a `Citation` object in the
file's frontmatter. The linter rejects builds that contain unsourced factual
claims.

```mdx
<Citation id="hbs-electrolight-2018">
The Electro-Light case asks teams to size a new sports drink market.
</Citation>
```

## What counts as a source

Sources must come from the approved publisher list in
`types/citation.ts → APPROVED_PUBLISHERS`. The full set:

**Academic** · Harvard Business School / Harvard Business Review · Ivey
Publishing · MIT Sloan LearningEdge & SMR · Wharton · Darden · Kellogg · Tuck ·
INSEAD · Stanford GSB · Yale SOM

**Consulting firm** · McKinsey & Company · Boston Consulting Group · Bain &
Company · Deloitte · Oliver Wyman · Roland Berger · Kearney

**Competition archives** · HULT Prize · Deloitte NUCC · KPMG ICC · CFA Institute ·
Map the System · McKinsey Venture Academy · RSM STAR · HEC Montreal ICC · John
Molson MBA ICC · Champions Trophy · Aspire Leaders

**Books** · Case in Point (Cosentino) · Case Interview Secrets (Cheng) · The
Pyramid Principle (Minto) · Crafting Persuasion · Lords of Strategy (Kiechel) ·
Competitive Strategy (Porter)

If a needed source is not in this list, either:

1. Add it to `APPROVED_PUBLISHERS` with reviewer sign-off (PR description must
   justify the addition), OR
2. Flag the citation `needsVerification: true` — the linter blocks production
   builds that contain unresolved verification flags.

## Required citation shape

```ts
{
  id: 'mck-electrolight',                    // kebab-case, unique
  type: 'consulting-firm',
  publisher: 'McKinsey & Company',           // must be in APPROVED_PUBLISHERS
  title: 'Electro-Light Sample Case',
  year: 2017,
  locator: 'pp. 4-12',                       // page, slide, paragraph
  url: 'https://www.mckinsey.com/...',
  quote: 'A new sports drink for athletes',  // ≤15 words, paraphrase-first
}
```

## Quotation rules (copyright-safe)

- **Paraphrase first.** Use direct quotes only when wording is essential.
- **15-word ceiling per quote.** Hard limit; the Zod schema rejects longer.
- **One quote per source per page.** Enforced by linter.
- **Never reproduce case problem statements verbatim.** Always paraphrase;
  always link to the original.

## What the linter checks (`scripts/verify-citations.ts`, built in System 3)

1. Every Citation object validates against the Zod schema in `lib/schemas/citation.ts`.
2. Every citation id used in MDX (`<Citation id="...">`) exists in that file's
   frontmatter.
3. Every quote is ≤15 words.
4. No more than one quote per source per page.
5. Every publisher is in `APPROVED_PUBLISHERS` OR has `needsVerification: true`.
6. In production builds (`NODE_ENV=production`), any `needsVerification: true`
   fails the build.
7. Numeric claims outside `<Citation>` wrappers (regex heuristic) warn; if the
   page is tagged `strictCitations: true` in frontmatter, they fail.

## Drafting flow

While writing, you may use `needsVerification: true` to draft fast:

```ts
{
  id: 'pending-rubric-2024',
  publisher: 'TBD — checking with competition organizers',
  title: 'KPMG ICC 2024 final round rubric',
  needsVerification: true,
}
```

Before merging, that flag must be cleared with a verified source — or the
citation deleted along with every claim it supports.

## The non-negotiable

If a source for a claim cannot be located, **delete the claim.** Never invent.
The whole project's credibility rests on this single rule.
