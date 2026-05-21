# Deployment

> Target: **Cloudflare Pages** (free tier). Case Arena is built for static
> export — no server, no edge runtime, no database. The whole app deploys
> as a folder of files.

## Why Cloudflare Pages

- **Free** — generous free tier (unlimited bandwidth, 500 builds/month).
- **Fast** — edge cache hits in <50ms globally.
- **No vendor lock** — the build output is plain static files; you can
  drop them on any CDN (Netlify, GitHub Pages, S3, Vercel) without
  changing the app.

## Prerequisites

- Node 20+ locally
- A GitHub account
- A Cloudflare account (free is fine)

## One-time setup

### 1. Fork or clone the repo

```bash
git clone https://github.com/YOUR_USER/case-arena.git
cd case-arena
npm install
```

### 2. Verify it builds locally

```bash
npm run build
```

This runs the citation linter, builds Next.js into static HTML in `./out/`,
and indexes the content for full-text search with Pagefind. A clean run
ends with the Pagefind summary. Any citation violation aborts the build.

### 3. Connect to Cloudflare Pages

In the Cloudflare dashboard:

1. Workers & Pages → **Create application** → **Pages** → **Connect to Git**.
2. Authorize Cloudflare to read your fork.
3. Pick the repository.
4. Build settings:
   | Setting               | Value                          |
   |-----------------------|--------------------------------|
   | Framework preset      | **None** (we manage it ourselves) |
   | Build command         | `npm run build`                |
   | Build output dir      | `out`                          |
   | Root directory        | `/`                            |
   | Node version          | `20` (set as env var `NODE_VERSION=20`) |
5. Save and deploy.

The first build takes ~3 minutes. Subsequent commits to `main` redeploy
automatically.

### 4. Custom domain (optional)

In your Cloudflare Pages project → **Custom domains** → **Set up a custom
domain**. If the apex domain is already on Cloudflare DNS, just type it;
otherwise add the suggested CNAME at your DNS provider.

## What's in the output

```
out/
├── index.html                       Landing
├── modules/<slug>/index.html        Each module — pre-rendered
├── cases/<slug>/index.html          Each case — pre-rendered
├── tools/<slug>/index.html          Each muscle entry point
├── map/index.html                   Case map shell (hydrates client-side)
├── _next/...                        JS + CSS bundles
└── _pagefind/...                    Full-text search index
```

Total weight before cases is ~600KB gzipped. Each authored case adds about
~10KB to the bundle (frontmatter + body).

## Headers + redirects

`public/_headers` and `public/_redirects` ship with the repo and Cloudflare
Pages reads them automatically. They:

- Set long cache (`Cache-Control: public, max-age=31536000, immutable`)
  on hashed `_next/static/*` assets.
- Set short cache (`Cache-Control: public, max-age=0, must-revalidate`)
  on HTML.
- Redirect `/cases/` → `/cases` (trailing-slash hygiene).

If you customize either, validate after deploy via:

```bash
curl -I https://your-domain.example/_next/static/foo.js | grep -i cache
```

## Environment variables

Case Arena needs zero environment variables at build time. The optional AI
Case Partner uses **the user's own key**, stored in localStorage on the
client. No keys travel through your server.

## Self-hosted (no Cloudflare)

The output folder is a plain static site. After `npm run build`, you can:

- **Serve locally** — `npx serve out` (or any HTTP server)
- **GitHub Pages** — push the `out/` folder to a `gh-pages` branch
- **Netlify** — drag-and-drop the `out/` folder to dashboard
- **S3 + CloudFront** — sync to bucket, set CloudFront origin
- **Your own server** — drop the folder behind nginx, no server-side code needed

## Updating content

Add a file at `content/cases/<slug>.mdx` or `content/modules/<slug>.mdx`,
commit, push. Cloudflare Pages rebuilds and redeploys automatically.

See [AUTHORING.md](./AUTHORING.md) for the frontmatter schema and citation
requirements.

## Troubleshooting

**Build fails at citation lint.** A citation violates the contract — see
the error message and the offending file. Common cause: unverified
publisher without `needsVerification: true`.

**Build fails at TypeScript.** Run `npm run typecheck` locally.

**Pagefind step fails.** Pagefind needs `out/` to exist — make sure the
preceding `next build` succeeded. Pagefind runs from `npx pagefind`; if
the binary is missing, run `npm install` again.

**Page loads but interactivity is broken.** Check the browser console.
Almost always a missing client-component boundary. Make sure components
using hooks have `'use client'` at the top.

**Map page is blank.** The map is client-rendered via dynamic import with
`ssr: false`. It needs JavaScript enabled.
