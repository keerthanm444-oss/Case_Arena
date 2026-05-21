// source.config.ts
import { defineCollections, defineConfig, frontmatterSchema } from "fumadocs-mdx/config";
import { z } from "zod";
var moduleFrontmatter = frontmatterSchema.extend({
  id: z.string(),
  slug: z.string(),
  order: z.number().int().nonnegative(),
  title: z.string(),
  tagline: z.string(),
  summary: z.string(),
  estimatedMinutes: z.number().int().positive(),
  status: z.enum(["draft", "verified", "published"]).default("draft")
});
var caseFrontmatter = frontmatterSchema.extend({
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
  relatedCases: z.array(z.string()).default([])
});
var resourceFrontmatter = frontmatterSchema.extend({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  kind: z.enum(["book", "channel", "community", "tool", "archive"]),
  publisher: z.string(),
  url: z.string().url(),
  tags: z.array(z.string()).default([])
});
var modules = defineCollections({
  type: "doc",
  dir: "content/modules",
  schema: moduleFrontmatter
});
var cases = defineCollections({
  type: "doc",
  dir: "content/cases",
  schema: caseFrontmatter
});
var resources = defineCollections({
  type: "doc",
  dir: "content/resources",
  schema: resourceFrontmatter
});
var source_config_default = defineConfig({
  mdxOptions: {
    // remark / rehype plugins are added in System 3 (Circulatory) when the
    // pipeline gets wired up to the renderers. For now, just compile.
  }
});
export {
  cases,
  source_config_default as default,
  modules,
  resources
};
