#!/usr/bin/env node
/**
 * scripts/verify-citations.ts
 *
 * The build-time citation linter. Run as `npm run lint:citations`. Returns
 * non-zero on any violation. Wired into the `npm run build` script so the
 * build literally cannot ship unsourced claims.
 *
 * Checks (per the citation contract):
 *   1. Each citation object validates against Zod schema (publisher,
 *      year range, ≤15-word quote, etc.)
 *   2. Every <Citation id="..."> referenced in MDX body resolves to a
 *      citation in that file's frontmatter.
 *   3. No more than one quote per source per page.
 *   4. In production (NODE_ENV=production), any citation with
 *      `needsVerification: true` fails the build.
 *   5. Heuristic: numeric/factual claims outside <Citation> wrappers warn;
 *      if frontmatter has `strictCitations: true`, they error.
 *
 * Exit codes:
 *   0  — clean
 *   1  — violation(s) found
 *   2  — internal linter error (e.g. unreadable file)
 */

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { CitationSchema } from '../lib/schemas/citation';

const ROOT = process.cwd();
const CONTENT_DIRS = ['content/modules', 'content/cases', 'content/resources'];

interface Violation {
  file: string;
  line?: number;
  rule: string;
  message: string;
  severity: 'error' | 'warning';
}

const violations: Violation[] = [];

function addError(file: string, rule: string, message: string, line?: number) {
  violations.push({ file, rule, message, severity: 'error', line });
}
function addWarning(file: string, rule: string, message: string, line?: number) {
  violations.push({ file, rule, message, severity: 'warning', line });
}

const isProd = process.env.NODE_ENV === 'production';

function scan(absPath: string) {
  const relPath = path.relative(ROOT, absPath);
  const raw = fs.readFileSync(absPath, 'utf8');
  const { data: frontmatter, content: body } = matter(raw);

  // ---- 1. Validate citation objects in frontmatter ----
  const citations: unknown[] = Array.isArray(frontmatter.citations)
    ? (frontmatter.citations as unknown[])
    : frontmatter.source
      ? [frontmatter.source]
      : [];

  const validCitationIds = new Set<string>();

  for (const c of citations) {
    const parsed = CitationSchema.safeParse(c);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        addError(
          relPath,
          'citation-schema',
          `${issue.path.join('.')}: ${issue.message}`,
        );
      }
      continue;
    }
    validCitationIds.add(parsed.data.id);

    // Rule 4: production must not ship needsVerification
    if (parsed.data.needsVerification && isProd) {
      addError(
        relPath,
        'unresolved-verification',
        `Citation "${parsed.data.id}" still has needsVerification=true. Resolve or remove before production build.`,
      );
    }
  }

  // ---- 2. Every <Citation id="..."> in body resolves ----
  const refRegex = /<Citation[^>]*\sid=["']([^"']+)["'][^>]*>/g;
  const refsSeen = new Map<string, number>(); // citationId -> count
  let m: RegExpExecArray | null;
  while ((m = refRegex.exec(body)) !== null) {
    const id = m[1]!;
    refsSeen.set(id, (refsSeen.get(id) ?? 0) + 1);
    if (!validCitationIds.has(id)) {
      const lineNum = body.slice(0, m.index).split('\n').length;
      addError(
        relPath,
        'unknown-citation-ref',
        `<Citation id="${id}"> references a citation not declared in frontmatter.`,
        lineNum,
      );
    }
  }

  // ---- 3. ≤ 1 quote per source per page ----
  // The Zod schema already enforces ≤15 words per quote; the per-page-per-
  // source ceiling has to be checked across all citations on this page.
  const quoteCounts = new Map<string, number>();
  for (const c of citations) {
    if (typeof c === 'object' && c !== null && 'id' in c && 'quote' in c) {
      const { id, quote } = c as { id: unknown; quote: unknown };
      if (typeof quote === 'string' && quote.trim().length > 0) {
        quoteCounts.set(
          String(id),
          (quoteCounts.get(String(id)) ?? 0) + 1,
        );
      }
    }
  }
  for (const [id, n] of quoteCounts) {
    if (n > 1) {
      addError(
        relPath,
        'multiple-quotes-per-source',
        `Citation "${id}" has ${n} quoted excerpts on this page. Max 1 per source per page.`,
      );
    }
  }

  // ---- 5. Heuristic: numeric/factual claims outside <Citation> ----
  // Looks for sentences containing a number, currency, or percent that are
  // not wrapped in or immediately preceded by a <Citation>. This is a
  // warning by default, error if frontmatter.strictCitations === true.
  const strict = frontmatter.strictCitations === true;
  // Strip code fences + MDX components so we don't false-positive on JSX props
  const prose = body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<Citation[\s\S]*?<\/Citation>/g, '__CITED__')
    .replace(/<[A-Z][\w]*\b[^>]*\/?>/g, '');

  const sentenceRegex = /([^.!?\n]*[.!?])/g;
  let s: RegExpExecArray | null;
  while ((s = sentenceRegex.exec(prose)) !== null) {
    const sentence = s[1] ?? '';
    if (sentence.includes('__CITED__')) continue;
    // Match: numbers, currency, percent, units like $1B, 47%, $100M, 2024
    const looksNumeric =
      /(\$\d[\d,.]*[KMBT]?)|(\d+(\.\d+)?%)|(\d{4})\b|\b(\d+\.\d+)\b/.test(
        sentence,
      );
    if (looksNumeric) {
      const issue = strict ? addError : addWarning;
      issue(
        relPath,
        'unsourced-numeric-claim',
        `Possible unsourced factual claim: "${sentence.trim().slice(0, 80)}…"`,
      );
    }
  }
}

function walkContentRoots() {
  for (const dir of CONTENT_DIRS) {
    const abs = path.join(ROOT, dir);
    if (!fs.existsSync(abs)) continue;
    for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
      if (entry.isFile() && /\.mdx?$/.test(entry.name)) {
        try {
          scan(path.join(abs, entry.name));
        } catch (err) {
          console.error(`[linter] Failed to scan ${entry.name}:`, err);
          process.exit(2);
        }
      }
    }
  }
}

walkContentRoots();

const errors = violations.filter((v) => v.severity === 'error');
const warnings = violations.filter((v) => v.severity === 'warning');

if (violations.length === 0) {
  console.log('\n✓ Citation linter passed — all claims sourced.');
  process.exit(0);
}

console.log('\nCitation linter report\n' + '─'.repeat(60));
for (const v of violations) {
  const icon = v.severity === 'error' ? '✗' : '⚠';
  const lineSuffix = v.line ? `:${v.line}` : '';
  console.log(
    `${icon} [${v.rule}] ${v.file}${lineSuffix}\n    ${v.message}`,
  );
}
console.log('─'.repeat(60));
console.log(
  `${errors.length} error(s), ${warnings.length} warning(s).` +
    (errors.length > 0 ? '  ✗ Build blocked.' : '  ✓ Warnings only.'),
);

process.exit(errors.length > 0 ? 1 : 0);
