import { defineCollections, defineConfig, frontmatterSchema } from 'fumadocs-mdx/config';
import { z } from 'zod';

/**
 * Content collections — wired to the Zod schemas from System 1.
 * The actual schemas live in lib/schemas/index.ts; here we define how
 * fumadocs-mdx reads files from /content and validates frontmatter.
 *
 * In System 3, the content registry (lib/content/*) will consume these
 * collections and expose typed accessors to the UI.
 */

// We intentionally keep these frontmatter schemas LIGHTER than the full
// runtime schemas — they only validate the minimum needed to enumerate
// content. Full validation runs in System 3 via lib/schemas/*.
const moduleFrontmatter = frontmatterSchema.extend({
  id: z.string(),
  slug: z.string(),
  order: z.number().int().nonnegative(),
  title: z.string(),
  tagline: z.string(),
  summary: z.string(),
  estimatedMinutes: z.number().int().positive(),
  status: z.enum(['draft', 'verified', 'published']).default('draft'),
});

const caseFrontmatter = frontmatterSchema.extend({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  industry: z.string(),
  category: z.string(),
  difficulty: z.string(),
  frameworks: z.array(z.string()).default([]),
  timeEstimate: z.number().int().positive(),
  tags: z.array(z.string()).default([]),
  solved: z.boolean().default(false),
  relatedCases: z.array(z.string()).default([]),
});

const resourceFrontmatter = frontmatterSchema.extend({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  kind: z.enum(['book', 'channel', 'community', 'tool', 'archive']),
  publisher: z.string(),
  url: z.string().url(),
  tags: z.array(z.string()).default([]),
});

export const modules = defineCollections({
  type: 'doc',
  dir: 'content/modules',
  schema: moduleFrontmatter,
});

export const cases = defineCollections({
  type: 'doc',
  dir: 'content/cases',
  schema: caseFrontmatter,
});

export const resources = defineCollections({
  type: 'doc',
  dir: 'content/resources',
  schema: resourceFrontmatter,
});

export default defineConfig({
  mdxOptions: {
    // remark / rehype plugins are added in System 3 (Circulatory) when the
    // pipeline gets wired up to the renderers. For now, just compile.
  },
});
