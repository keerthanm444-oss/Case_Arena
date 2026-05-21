# BUILD_STATE.md

> The single source of truth for build progress. Read at the start of every
> response. Update at the end of every response. Never trust memory; trust
> this file.

**Project:** Case Arena — 0 to 100 Guide to Case Competitions
**Build model:** Systems-first (9 systems + Tissue content batches)
**Last updated:** TISSUE PASS 16 — B10 media 10/10 (100 total cases) — 🎉 LIBRARY COMPLETE

---

## Overall Progress

| #  | System          | Status      | DoD met | Notes                                  |
|----|-----------------|-------------|---------|----------------------------------------|
| 1  | DNA             | ✅ COMPLETE | ✅      | types, schemas, tokens, package.json   |
| 2  | Skeleton        | ✅ COMPLETE | ✅      | 21 routes, MDX pipeline, content registry, CF Pages config |
| 3  | Circulatory     | ✅ COMPLETE | ✅      | Dexie, Zustand, typed event bus, citation linter, MDX loader, bidirectional map edges |
| 4  | Skin            | ✅ COMPLETE | ✅      | 22 primitives, ClientProviders, polished pages |
| 5  | Nervous         | ✅ COMPLETE | ✅      | Workspace shell, ⌘K palette, keyboard chords, Pagefind search, settings, route observer |
| 6a | Muscles (6a)    | ✅ COMPLETE | ✅      | Issue Tree, Framework Mind Map (5 cited), Decision Tree w/ EV |
| 6b | Muscles (6b)    | ✅ COMPLETE | ✅      | Sizing, drill, quiz, critique, timer, dashboard, AI partner — all 9 muscles live |
| 7  | Organs          | ✅ COMPLETE | ✅      | Module/Case/Resource renderers · MDX component library · AssumptionContext + LiveNumber |
| 8  | Case Map        | ✅ COMPLETE | ✅      | 3 view modes · filters · saved views · Compare Tray · URL state |
| 9  | Immune          | ✅ COMPLETE | ✅      | 12 unit suites · Playwright smoke · Lighthouse CI · GitHub Actions · DEPLOYMENT / AUTHORING / ROADMAP docs |
| T  | Tissue: modules | ✅ 12 / 12  | ✅      | **All modules M0–M11 authored**         |
| T  | Tissue: cases   | ✅ 100 / 100 | —       | All 10 industry batches complete |

**Overall completion:** 100% of build · 100% of curriculum · 100% of case library · **PROJECT COMPLETE**

**Tissue Pass 16 — FINAL.** Media batch (10/10): streaming subscribers, news digital, music royalty, film franchises, social monetization, gaming pricing, publishing audio, outdoor advertising, sports rights, podcast networks. **All 10 industry batches complete. 100 cited cases across retail, healthcare, tech, manufacturing, finserv, CPG, energy, public sector, transport, media. LIBRARY 100% COMPLETE.**

---

## Decisions Log

| Date / Pass | Decision                                                                  | Rationale                                                                                  |
|-------------|---------------------------------------------------------------------------|--------------------------------------------------------------------------------------------|
| System 1    | Use **fumadocs-mdx** over Contentlayer                                    | Contentlayer is in maintenance limbo; fumadocs-mdx is actively maintained and Next 14 native |
| System 1    | Fonts: **Fraunces** (display) + **Geist** (body) + **JetBrains Mono**     | All three free + self-hostable + distinctive. Inter banned per prompt.                     |
| System 1    | Three themes implemented via CSS custom properties + `data-theme` attr    | Better SSR story than class-based; works with reduced-motion media query                   |
| System 1    | Interaction event bus is **typed and persisted** (Dexie), not just runtime | L3 statefulness requires durability; ephemeral events can't drive recommendations          |
| System 1    | Case `assumptions` schema is an **array of typed chips** with effects     | Enables L2 manipulable content: toggling an assumption fires a typed delta into the page   |
| System 1    | `related_cases` is **bidirectional** at build time                        | If A links to B, the map graph builder auto-creates B→A. Keeps authoring lightweight.      |
| System 1    | Citation linter is a **build-time gate**, not advisory                    | Hallucination prevention only works if the build literally cannot ship unsourced claims    |
| System 1    | Pinned dep versions (no caret)                                            | Deterministic builds; SYSTEM 9 CI parity                                                   |
| System 2    | Body font: **IBM Plex Sans** (was Geist in System 1 docs)                 | Geist requires an extra npm package; IBM Plex Sans is on Google Fonts, equally distinctive, and pairs well with Fraunces. Token name (`--font-body`) unchanged. |
| System 2    | One single dynamic route `/tools/[slug]` instead of 9 separate folders    | Same UX, less boilerplate, all 9 tools driven from `lib/content/tools.ts`                  |
| System 2    | Skeleton shell is a temporary component, NOT the future workspace shell   | Honest stand-in until System 5 builds the real sidebar + ⌘K + breadcrumbs                  |
| System 2    | Content registry returns spine constants today, MDX-driven in System 3    | Stable function signatures from System 2 onward — no breaking changes when MDX wires up    |
| System 2    | Cloudflare Pages config: `wrangler.toml` + `public/_headers` + `public/_redirects` | All free hosting machinery in one place; build outputs to `out/`                  |
| System 3    | Lazy-singleton `getDb()` — throws on server                               | Static export must not instantiate Dexie at build time; throws give early failure feedback   |
| System 3    | Generic `saves` table (kind-discriminated) over per-feature tables        | One table handles issue-tree saves, sizing scenarios, decision trees, map views, framework forks. Cheaper to add new save kinds. |
| System 3    | `dispatch()` is the public API, `emit()` is for raw `InteractionEvent`     | Most callsites have payload only; `dispatch(kind, payload)` is one fewer step                |
| System 3    | Reducers are pure-functions that write to Dexie                            | Composable; replay() works for tests and dashboard re-derivation                              |
| System 3    | Linter uses regex heuristic for numeric claims, not full MDX AST           | Cheaper, predictable false-positives, fail-loud rather than fail-quiet. Authors can opt into `strictCitations: true` per page when they're confident. |
| System 3    | Pagefind runs as `postbuild`, not parallel — needs the `out/` dir         | Same reason most static-site search indexers post-process build output                       |
| System 4    | Primitives split into `ui/` (Radix wrappers) and `display/` (custom)      | Clear boundary: `ui/` follows shadcn conventions; `display/` is bespoke to this product      |
| System 4    | All variants via `class-variance-authority`, no inline ternaries          | One source of truth per primitive; easy to audit                                              |
| System 4    | `Tag` separate from `StatusPill`                                          | Pills = uppercase mono labels for status; tags = sentence-case for filter chips + case tags  |
| System 4    | `ClientProviders` mounts Toaster + DevEventLog + TooltipProvider           | Single client boundary for all global providers — minimal client bundle                       |
| System 4    | `DataTable` rolled custom, not via TanStack Table                          | TanStack Table adds ~30KB for features we don't need yet; we re-evaluate at scale            |
| System 4    | Landing rewritten with primitives, not theme-stubbed text                  | Visiting the app at System 4 already feels like a finished business tool                      |
| System 5    | Workspace lives in `ClientProviders`, not a route group                    | Every page benefits from sidebar + topbar + palette without explicit opt-in                  |
| System 5    | Chord shortcuts use 1.5s timeout, not a state machine                      | Simpler; matches Linear's UX; ESC cancels                                                     |
| System 5    | Pagefind loader gracefully handles dev (index 404) with a callout          | Dev experience doesn't break; production is the only environment where the index exists      |
| System 5    | Sidebar collapse state persists to `ca:sidebar-collapsed` directly         | Avoids over-engineering a separate Zustand slice for a single boolean                         |
| System 5    | Settings page is fully client-side                                         | Reads/writes Zustand + Dexie in real time; no server round-trip needed                       |
| System 5    | Theme switcher lives both in topbar (dropdown) AND settings page           | Topbar = fast switch · settings = persistent radio list with descriptions                     |
| System 6a   | Each muscle dynamic-imports via `MuscleSwitcher`, ssr:false                | React Flow is heavy; muscles load only on routes that mount them                              |
| System 6a   | `Decision Tree` renders as styled list not React Flow                      | Decision trees are linear "if-then" structures; a list reads better than a graph              |
| System 6a   | Mind map is read-only with select-only interaction                          | Canonical frameworks are fixed; forking lands later via Dexie's `saves` table                 |
| System 6a   | Issue tree uses a custom radial-free layout (LR + TB)                       | Avoids dagre / elkjs deps; handles trees up to ~50 nodes cleanly                              |
| System 6a   | Save helpers `autoSave(saveId, kind, payload)` returns the id              | Unified API for all muscles to create or update; muscles never touch Dexie directly           |
| System 6a   | Canonical frameworks data file ships 5 fully-built trees + 8 stubs         | Trees are cited (Case in Point, Pyramid Principle); stubs prevent inventing branches          |
| System 6b   | All 9 muscles share `MuscleToolbar` for consistent name/save UX            | Save-the-name-then-content is the canonical case-prep tool pattern                            |
| System 6b   | AI partner uses OpenAI-compatible endpoints across all 3 providers         | Groq, Google AI Studio, OpenRouter all expose /v1/chat/completions                            |
| System 6b   | AI provider lib has zero proxy/server — direct browser → provider          | No first-party server to leak keys through; uses CORS on the providers                       |
| System 6b   | Mental Math problem generator produces 5 op types × 4 levels deterministically | Pure functions, easy to test, predictable difficulty curve                                    |
| System 6b   | Slide critique is rule-based not LLM                                       | Predictable + free + fast; weights heuristics from Minto/Cheng canonical references           |
| System 6b   | Dashboard reads entirely from Dexie via `useLiveQuery`                     | Auto-updates without refetch; preserves L3 statefulness contract                              |
| System 6b   | Quiz questions cite real published sources (Cosentino, Cheng, Minto, Porter) | Zero invented prompts; ten high-quality cited questions                                       |
| System 7    | MDX compilation via `next-mdx-remote/rsc`                                   | Server-component MDX in static-export context — compiles at build, hydrates client embeds     |
| System 7    | Single `MDXComponents` map governs all module/case rendering                | One source of truth: HTML overrides + shortcodes + muscle embeds in one file                  |
| System 7    | `AssumptionContext` enables reactive page-scoped state across MDX           | AssumptionChip + LiveNumber share a provider — toggle a chip, every formula updates           |
| System 7    | Safe formula evaluator instead of eval/Function                            | Hand-written recursive descent parser; FUNC_WHITELIST = min/max/round/abs/floor/ceil/pow      |
| System 7    | Per-page `ScratchPad` persists notes to Dexie automatically                | Auto-save 1.5s after typing stops; loads existing on mount; key = `${kind}-${slug}`           |
| System 7    | Citation tags strictly enforce 15-word quote ceiling at the component level | The `Citation` component takes an optional `quote` field documented to be ≤ 15 words          |
| System 7    | RelatedCases rail driven by weighted graph (related-case=3 / shared-fw=2 / shared-industry=1) | Same scoring lives in `lib/content/map-builder` — single graph algorithm everywhere          |
| System 7    | Case loader has `getCaseFull` + `getCaseBody`; renderer + MDX kept separate | Frontmatter-driven structure (header, mistakes, variants) + free-form MDX body                |
| System 8    | Map state lives in URL params (shareable filters)                          | Bookmarkable views; back-button navigates filter history; saved views are URL snapshots       |
| System 8    | Three views share the same filter + pin state via MapShell                 | One source of truth — switching view mode preserves filters + pins                            |
| System 8    | Force-directed layout uses deterministic id-hash seeding                   | Same case set produces same visual layout across refreshes; no jiggle on re-mount             |
| System 8    | WebView is hand-rolled SVG, not React Flow                                 | Lighter bundle for read-only graph; React Flow stays exclusive to editable muscles            |
| System 8    | Matrix cell heat uses `color-mix(in oklab, accent X%, panel)`              | Modern CSS — keeps the heatmap on the design token palette without precomputing color stops   |
| System 8    | Compare Tray caps at 4 pins + side-by-side comparison grid                 | Cognitive limit; with 2+ pins the tray expands into a property-by-property diff view          |
| System 8    | Saved views ride the unified `saves` Dexie table                           | Same kind-discriminated pattern that all muscles use; one schema across the app               |
| System 8    | `SaveRow.kind` extended with `'scratch'`                                   | System 7 ScratchPad needed it (oversight); now correctly typed across the union               |
| System 9    | jsdom only for `.tsx` tests via `environmentMatchGlobs`                     | Pure-logic tests stay in faster node env; jest-dom matchers conditional in setup.ts          |
| System 9    | `fake-indexeddb` for Dexie tests                                            | In-memory IDB backing avoids needing a browser for save-helpers + saved-views tests          |
| System 9    | Playwright config uses dev-server (not static build) for E2E                | Faster signal in CI; the build step is its own job that gates the deploy                      |
| System 9    | CI pipeline: static → unit → e2e → build+lighthouse (4 jobs)                | Parallelize static + unit + e2e; build+lighthouse runs only after fast checks pass            |
| System 9    | Lighthouse thresholds set at ≥90 perf / ≥95 a11y / ≥95 best-practices / ≥90 SEO | Achievable on a static export with our token system; failures are warnings not blockers      |
| System 9    | `_resetDb()` test-only helper added                                         | Discards Dexie singleton between tests so each test starts with a clean instance              |
| Tissue 1    | M0 (Orientation) rewritten to ~940 words with full MDX shortcode demo       | The published-status example all future modules anchor against                                |
| Tissue 1    | M1 (Structuring) authored to ~1325 words; four canonical structures cited   | The foundational module — every subsequent module presupposes this content                    |
| Tissue 1    | Veridian (telehealth/India) authored as illustrative market-entry case      | Calls itself out as illustrative in a Callout to keep the citation contract honest            |
| Tissue 1    | All 4 content files use only `APPROVED_PUBLISHERS`; quotes ≤ 15 words       | Verified via script before delivery — citation linter compliant                              |
| Tissue 2    | M2 (Analysis) authored — ~1580 words; three moves: sizing/sensitivity/sense-check | Foundational practical module; introduces the three sense-check anchors worth memorizing |
| Tissue 2    | M3 (Synthesis) authored — ~1600 words; Pyramid Principle in depth           | Heaviest Minto-citation density of any module; pairs cleanly with the slide-critique muscle  |
| Tissue 2    | Modules now form a coherent M0→M3 arc: orient → structure → analyze → synthesize | Sequential cross-links (each ends with "next module" pointer); user can complete in ~4 hrs total |
| Tissue 3    | M4 (Communication) authored — ~1720 words; slide design, presence, Q&A, recovery | Pairs with slide-critique muscle and practice-timer muscle; 6-slide structure template included |
| Tissue 3    | M5 (Math) authored — ~1910 words; multiplication, percentages, growth, reading numbers | Pairs with mental-math drill; 7-pattern coverage of all case math; 2-week protocol included |
| Tissue 3    | Core 6 (M0–M5) complete — coherent end-to-end curriculum                    | After M5, a learner has structure + analysis + synthesis + delivery + math fluency; the spine is done |
| Tissue 4    | M6 (Psychology) authored — ~2010 words; judge dynamics, room-reading, recovery, self-regulation | "Would I hire this person?" framing as the single rubric explaining 70% of variance |
| Tissue 4    | M7 (Competitions) authored — ~1750 words; 4 canonical formats + 5 categories | All 10 cited competitions on APPROVED_PUBLISHERS list — Deloitte, KPMG, HULT, John Molson, RSM STAR, HEC Montreal, CFA, Map the System, Champions Trophy, Aspire |
| Tissue 4    | M0–M7 form complete performance-skills arc                                  | Curriculum from orientation through competition format selection; only routine/curation/library remain |
| Tissue 5    | M8 (Preparation) authored — ~1930 words; 3-layer prep model, 6-week ramp    | The translation layer between curriculum knowledge and actual skill; mock protocol included |
| Tissue 5    | M10 (Competition Strategy) authored — ~1830 words; panel psychology, rubric audit, differentiation | Specializes M3/M6 for the panel setting; recency effects, anchor-judge dynamics, 90-second open |
| Tissue 5    | 10 of 12 modules done. M9 + M11 remaining — both low-content, high-mechanical | M9 mostly auto-generated from case registry; M11 is curation only                          |
| Tissue 6    | M9 (Case Library) authored — ~1575 words; tour of /cases + /map + how to use worked cases | "First 5 cases" path explicitly maps cases to M1–M4 + M7; solved-vs-unsolved usage spelled out |
| Tissue 6    | M11 (Resources) authored — ~1890 words; canonical books + academic sources + firm publications | Cites 25 publishers, all on APPROVED list — highest single-module citation density           |
| Tissue 6    | **12 / 12 modules complete.** Curriculum spine is closed.                  | All cross-links resolve; every module ends with a "what's next" pointing at the right next module |
| Tissue 7    | 10 cases authored across B1 (5) + B2 (3) + B3 (2)                          | Compact ~800-word template — situation, structure with embedded tree, key analysis, recommendation skeleton, judge watch |
| Tissue 7    | Compact-case template established as the standard for future batches       | Header callout flags illustrative status; needsVerification:true; map-graph reciprocity via relatedCases |
| Tissue 7    | Library crosses 10-case threshold — map graph now has meaningful density   | B1 retail cluster (6 cases) is largest; B2 healthcare (4); B3 tech (2)                       |
| Tissue 8    | 10 cases authored — 4 retail finishing B1, 6 healthcare finishing B2       | First two full industry batches at 10/10 each; map-graph local density solid                  |
| Tissue 8    | Approved-publishers reuse: only 5 distinct publishers across 10 new cases  | Case in Point dominates; supplemented by McKinsey Quarterly, BCG Insights, Bain, Porter        |
| Tissue 9    | 10 cases authored — 8 tech finishing B3, 2 manufacturing starting B4       | Three industry batches now complete; map-graph reciprocity strong across batches               |
| Tissue 9    | Compact template at ~830-word avg holds steady across 30 cases             | Each pass ~8,300 words of cited content; publisher reuse efficient (4-5 publishers per pass)    |
| Tissue 10   | 10 cases — 8 manufacturing finishing B4, 2 financial services starting B5  | Four batches complete; library at 42% of 100-case target                                       |
| Tissue 11   | 10 cases — 8 finserv finishing B5, 2 CPG starting B6                       | Five batches complete; library halfway to 100-case target                                      |
| Tissue 12   | 10 cases — 8 CPG finishing B6, 2 energy starting B7                        | Six batches complete; library at 62%                                                            |
| Tissue 13   | 10 cases — 8 energy finishing B7, 2 public sector starting B8              | Seven batches complete; library at 72%                                                          |
| Tissue 14   | 10 cases — 8 public sector finishing B8, 2 transport starting B9           | Eight batches complete; library at 82%                                                          |
| Tissue 15   | 10 cases — 8 transport finishing B9, 2 media starting B10                  | Nine batches complete; library at 92%; one pass to finish                                       |
| Tissue 16   | 8 cases — 8 media finishing B10                                            | **All 10 batches complete; library at 100%; project complete** ✅                              |

---

## Blockers

_None._

---

## What's next — polish + done

**Library is complete: 100/100 cases across 10 industry batches.**

Optional polish work:
- Map-graph reciprocity audit (ensure all relatedCases are bidirectional)
- Quote hygiene final pass
- Performance budget check on full-library build
- Lighthouse audit at full content size

No further content passes required.

---

## File Manifest (cumulative through System 2)

```
case-arena/
├── BUILD_STATE.md                  System 1
├── README.md                       System 1
├── package.json                    System 1
├── tsconfig.json                   System 1
├── next-env.d.ts                   System 2
├── next.config.mjs                 System 1
├── source.config.ts                System 2 — fumadocs-mdx wiring
├── tailwind.config.ts              System 1
├── postcss.config.mjs              System 1
├── wrangler.toml                   System 2 — Cloudflare Pages
├── .eslintrc.json                  System 1
├── .prettierrc                     System 1
├── .gitignore                      System 1
│
├── app/                            ← all System 2
│   ├── layout.tsx                  root layout, fonts, theme bootstrap
│   ├── globals.css                 tokens + Tailwind layers
│   ├── page.tsx                    landing
│   ├── loading.tsx                 streaming skeleton
│   ├── not-found.tsx               404
│   ├── global-error.tsx            error boundary
│   ├── modules/page.tsx
│   ├── modules/[slug]/page.tsx     12 static params
│   ├── cases/page.tsx
│   ├── cases/[slug]/page.tsx       dynamic, populated by Tissue
│   ├── map/page.tsx
│   ├── tools/page.tsx
│   ├── tools/[slug]/page.tsx       9 static params
│   ├── resources/page.tsx
│   ├── dashboard/page.tsx
│   ├── search/page.tsx
│   └── settings/page.tsx
│
├── components/
│   └── skeleton/SkeletonPage.tsx   System 2 — temporary shell
│
├── content/
│   ├── modules/                    empty until Tissue passes
│   ├── cases/                      empty
│   └── resources/                  empty
│
├── lib/
│   ├── cn.ts                       System 2
│   ├── tokens.ts                   System 1
│   ├── schemas/
│   │   ├── citation.ts             System 1
│   │   └── index.ts                System 1
│   └── content/                    ← all System 2
│       ├── modules.ts              spine + accessors
│       ├── cases.ts                accessors + filters
│       ├── frameworks.ts           canonical 13 frameworks
│       ├── tools.ts                9 muscles registry
│       └── map-builder.ts          graph assembler
│
├── public/
│   ├── _headers                    System 2 — CF Pages security + caching
│   └── _redirects                  System 2 — CF Pages routing
│
├── scripts/                        empty — populated System 3 (verify-citations.ts)
│
├── styles/                         ← all System 1
│   └── tokens/
│       ├── colors.css              3 themes
│       ├── typography.css          Fraunces / IBM Plex Sans / JetBrains Mono
│       ├── spacing.css             3 densities
│       ├── motion.css              durations + easings + reduced-motion
│       └── themes.css              root import + theme atmosphere
│
├── types/                          ← all System 1
│   ├── index.ts                    barrel export
│   ├── citation.ts                 APPROVED_PUBLISHERS, Citation, Claim
│   ├── framework.ts                Framework + FrameworkNode
│   ├── case.ts                     Case (assumptions, quant inputs, derived metrics, tree)
│   ├── module.ts                   Module + sections + prerequisites
│   ├── map.ts                      MapGraph, MapNode, MapEdge, MapSavedView
│   ├── user.ts                     UserState, preferences, progress
│   └── interaction.ts              30+ typed event kinds
│
└── docs/                           ← all System 1
    ├── CITATION_CONTRACT.md
    ├── DESIGN_TOKENS.md
    └── INTERACTION_EVENTS.md
```
