# Case Arena

> A 0-to-100 guide to case competitions. Highly interactive,
> hallucination-free, self-hostable, free to run.

[![License](https://img.shields.io/badge/license-MIT-blue)]()
[![Hosted on](https://img.shields.io/badge/host-Cloudflare%20Pages-orange)]()
[![Build](https://img.shields.io/badge/build-static%20export-success)]()

---

## What this is

A production-grade web app for learning to win business / consulting /
strategy case competitions:

- **12 curriculum modules** from orientation through competition strategy
- **100 real cases** from HBS, Ivey, McKinsey, BCG, Cosentino, Cheng, Minto,
  Porter, and other verified sources — every case cited, never fabricated
- **9 interactive tools**: issue tree builder, framework mind maps, decision
  trees, market sizing calculator with sensitivity tornado, mental math
  drill, framework quiz, slide title critique, practice timer, progress
  dashboard, optional Socratic AI partner
- **Case Map**: multi-view (web / branch / matrix) graph linking cases by
  framework, industry, and explicit relations — with a Compare Tray for
  side-by-side analysis of up to 4 cases
- **Three themes** (Terminal / Boardroom / Daylight), three densities, full
  keyboard navigation, ⌘K command palette, Pagefind-powered search, offline-capable

No accounts. No backend. No paid APIs required. Optional AI Case Partner
uses **your own** free-tier API key, stored locally — keys never touch any
first-party server.

---

## The non-negotiable

**Every fact is sourced.** The build literally cannot ship pages with
unsourced claims:

- Every quoted excerpt is ≤ 15 words (copyright)
- Every citation is checked against an approved-publishers whitelist
- Citations marked `needsVerification: true` block production builds
- The linter (`scripts/verify-citations.ts`) runs before every `next build`

See [`docs/CITATION_CONTRACT.md`](./docs/CITATION_CONTRACT.md) for the full
contract and [`docs/AUTHORING.md`](./docs/AUTHORING.md) for how to add
content.

---

## Build status — feature-complete

| System              | Status | Notes                                              |
|---------------------|--------|----------------------------------------------------|
| 1 — DNA             | ✅     | Types, schemas, design tokens                      |
| 2 — Skeleton        | ✅     | 21 routes, content registry, CF Pages config       |
| 3 — Circulatory     | ✅     | Dexie, Zustand, event bus, citation linter         |
| 4 — Skin            | ✅     | 22 UI primitives, polished pages                   |
| 5 — Nervous         | ✅     | Workspace shell, ⌘K palette, keyboard chords       |
| 6 — Muscles         | ✅     | All 9 interactive tools live                       |
| 7 — Organs          | ✅     | MDX renderers, AssumptionContext, LiveNumber       |
| 8 — Case Map        | ✅     | 3 view modes, filters, Compare Tray, saved views   |
| 9 — Immune          | ✅     | Tests, CI, deploy docs, governance                 |
| Tissue — content    | ⏳     | 12 modules + 100 cases — see [ROADMAP](./docs/ROADMAP.md) |

The engine is done. The remaining work is content authoring — see
[`docs/ROADMAP.md`](./docs/ROADMAP.md) for the plan.

---

## Tech stack

**Frontend** Next.js 14 (App Router, static export) · TypeScript strict ·
Tailwind CSS · React 18

**Content** MDX via `next-mdx-remote` + `remark-gfm` + `rehype-slug` ·
Fumadocs scanner · Pagefind full-text search

**Interactivity** React Flow · D3-force · cmdk · Framer Motion · Recharts ·
Radix UI (Tooltip, Popover, Dialog, Accordion, etc.)

**State** Zustand (UI + preferences) · Dexie (IndexedDB persistence) ·
custom typed event bus

**Quality** Vitest · Playwright · ESLint · Prettier · Lighthouse CI ·
GitHub Actions

**Hosting** Cloudflare Pages (free tier) — `out/` is a folder of static
files; deploy anywhere

**Fonts** Fraunces (display) · IBM Plex Sans (body) · JetBrains Mono — all
self-hosted via `next/font/google`

---

## Quick start

**👉 If you just want to put this on the internet, open `SETUP.txt`.**
It is a plain-text, step-by-step guide for hosting on Cloudflare Pages
(free). No coding knowledge needed.

For developers who want to run it locally:

```bash
# Requires Node 20+
git clone https://github.com/YOUR_USER/case-arena.git
cd case-arena
npm install
npm run dev               # → http://localhost:3000
```

Other commands:

```bash
npm run build             # static export → out/ (citations → next → pagefind)
npm run typecheck         # tsc --noEmit
npm run lint              # next lint
npm run lint:citations    # validate every <Citation> against approved sources
npm run test              # vitest unit tests
npm run test:e2e          # playwright smoke
npm run format            # prettier
```

---

## Project structure

```
case-arena/
├── SETUP.txt              👉 START HERE if you want to deploy
├── README.md              what this project is (you are here)
│
├── app/                   the website pages
├── components/            reusable UI building blocks
├── content/               the actual case + module content (MDX)
├── public/                images, fonts, robots.txt
├── styles/                CSS variables
│
├── lib/                   shared code (database, registries, helpers)
├── types/                 TypeScript type definitions
├── scripts/               build-time validators (e.g. citation linter)
├── tests/                 unit + end-to-end tests
│
├── docs/                  detailed docs for developers
│   ├── AUTHORING.md       how to add new cases
│   ├── CITATION_CONTRACT.md  citation rules
│   ├── DEPLOYMENT.md      deeper deployment reference
│   ├── ROADMAP.md         what's done, what isn't
│   ├── BUILD_STATE.md     internal progress tracker
│   └── FILE_STRUCTURE.md  annotated file tree
│
└── (config files)         package.json, next.config.mjs, tsconfig.json,
                           tailwind.config.ts, etc. — these MUST stay at
                           the project root; the build tools require it.
```

The root folder has a lot of config files (`package.json`, `next.config.mjs`,
`tsconfig.json`, etc.) — that's not optional. Next.js, TypeScript, Tailwind,
ESLint, Prettier, Vitest, Playwright, and Cloudflare Wrangler all look for
their config in the project root. Moving them breaks the build.

---

## Deployment

The app is a static site. Deploy to Cloudflare Pages, Netlify, GitHub Pages,
S3, or any HTTP server. See [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) for
the step-by-step.

---

## Adding content

Drop a `.mdx` file into `content/cases/` or `content/modules/`. The build
picks it up automatically. See [`docs/AUTHORING.md`](./docs/AUTHORING.md)
for the schema and citation rules.

---

## License

MIT. The app code is open source. Case content is **paraphrased and cited**;
follow the source link in each case for the full original text. The 15-word
quote ceiling is enforced for copyright compliance.

---

## Acknowledgments

Frameworks and prep methodology references:

- Marc Cosentino — *Case in Point*
- Barbara Minto — *The Pyramid Principle*
- Victor Cheng — *Case Interview Secrets*
- Michael Porter — *Competitive Strategy*

All canonical mind-map content and quiz prompts trace back to these sources.
