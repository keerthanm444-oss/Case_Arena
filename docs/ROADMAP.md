# Roadmap

> The build (Systems 1–9) is complete. What remains is **content**.

## Where we are

The app is feature-complete. Every interactive surface is wired:
- 9 muscles (issue tree, mind map, decision tree, sizing, drill, quiz,
  critique, timer, dashboard, AI partner)
- MDX renderers for modules + cases
- Full-screen case map with three view modes
- Citation linter that gates every build
- Tests + CI + deployment docs

Add one MDX file to `content/cases/<slug>.mdx` and a new fully-styled,
fully-interactive case page exists. The app is content-rate-limited from
here on.

## What remains: Tissue passes

Twelve modules and ~100 cases. Each is its own MDX file. Roughly 110
authoring sessions; expect each to take 30–90 minutes including citation
verification.

### Modules (M0–M11)

| ID  | Slug                       | Status     | Notes                                              |
|-----|----------------------------|------------|----------------------------------------------------|
| M0  | orientation                | ✅ done    | Published — full module with MDX shortcode demo    |
| M1  | structuring                | ✅ done    | Published — issue trees, MECE, 4 canonical structures |
| M2  | analysis                   | ✅ done    | Published — sizing, sensitivity, sense-checking    |
| M3  | synthesis                  | ✅ done    | Published — Pyramid Principle, answer-first, no hedging |
| M4  | communication              | ✅ done    | Published — slide design, presence, Q&A, recovery  |
| M5  | math                       | ✅ done    | Published — mental arithmetic, percentages, growth, reading numbers |
| M6  | psychology                 | ✅ done    | Published — judge dynamics, room-reading, recovery, self-regulation |
| M7  | competitions               | ✅ done    | Published — 4 formats, 5 categories, what each round tests, how to pick |
| M8  | preparation                | ✅ done    | Published — 3-layer prep, drill routines, 6-week ramp, mock protocol |
| M9  | case-library               | ✅ done    | Published — tour of /cases + /map, how to read worked cases, first-5 path |
| M10 | competition-strategy       | ✅ done    | Published — panel psychology, rubric audit, 90-second open, differentiation |
| M11 | resources                  | ✅ done    | Published — canonical books + academic sources + firm publications + vetting framework |

### Cases (target: 100)

Plan: **ten batches of ten**, organized by industry. Each batch is one
focused session and ends with a citation-linted PR.

| Batch | Industry           | Status     | Suggested sources                              |
|-------|--------------------|------------|------------------------------------------------|
| B1    | Retail             | 10 / 10 ✅ | Cosentino, Cheng, HBS supermarket cases        |
| B2    | Healthcare         | 10 / 10 ✅ | HBS hospital ops, Ivey clinic decisions, telehealth |
| B3    | Tech / SaaS        | 10 / 10 ✅ | McKinsey + BCG SaaS market entry, pricing      |
| B4    | Manufacturing      | 0 / 10     | Operations / value-chain / supply-chain cases  |
| B5    | Financial Services | 0 / 10     | Banking, fintech, insurance product strategy   |
| B6    | Consumer Goods     | 10 / 10 ✅ | CPG profitability, brand portfolio, P&L cases  |
| B7    | Energy             | 10 / 10 ✅ | Oil + gas, renewables, utility strategy        |
| B8    | Public Sector      | 10 / 10 ✅ | Nonprofit ops, government program design       |
| B9    | Transport          | 10 / 10 ✅ | Airlines, logistics, ride-sharing              |
| B10   | Media + Ent        | 0 / 10     | Streaming, gaming, music distribution          |

For each case:
1. Find a real published source (link in the citation).
2. Paraphrase the prompt (never verbatim).
3. Set the difficulty + frameworks + tags.
4. Optionally add assumption chips + live numbers if quant matters.
5. Add `relatedCases` to a few same-industry or same-framework siblings.
6. Run `npm run build` locally to confirm citation lint passes.

### Resources hub (M11 contents)

A separate Tissue pass to populate `content/resources/`. Each MDX entry
covers a book, podcast, channel, community, or tool. The same citation
rules apply — every entry is a real, identifiable resource with a
working link.

## Post-content polish (optional)

These are nice-to-haves that don't block shipping content:

- **Print stylesheet** for case pages — judges often want to study cases
  offline. A `@media print` block would land the whole case on one page
  with the assumption chips frozen.
- **Mobile force-graph perf** — the WebView simulates at 60fps fine on
  desktop but stutters on lower-end phones with 100+ nodes. Consider
  pre-computing the simulation and shipping positions as static JSON.
- **Spaced-repetition for flashcards** — the framework quiz could
  remember the user's weak frameworks and over-sample them across
  future sessions. (Dexie schema supports it; we just don't read it yet.)
- **Multi-user mode** — currently single-user via local Dexie. A simple
  multi-tenant mode would only require an auth provider + namespacing
  Dexie keys; the rest of the app is already client-only.

## Long-tail

After 100 cases + 11 fully-authored modules, the app reaches a natural
v1.0. From there:

- **More canonical frameworks** — Blue Ocean, Three Horizons, Lean Canvas
- **Industry deep-dives** — interactive modules per industry beyond cases
- **Video transcripts** — pair the modules with searchable video
- **AI Case Partner** v2 — preset partner personalities (BCG senior,
  McKinsey associate, hostile board member)

None of these are blocking. They're long-tail; the v1.0 product stands on
its own.
