import * as React from 'react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { mdxComponents } from './MDXComponents';

/**
 * MDXContent — compiles + renders an MDX body string via next-mdx-remote/rsc.
 *
 * This is a SERVER component that runs at build time during static export.
 * Client components inside the components map (chips, embeds, etc.) hydrate
 * correctly in the final HTML.
 *
 * Plugins:
 *   - remark-gfm                  : tables, task lists, strikethrough
 *   - rehype-slug                 : heading ids
 *   - rehype-autolink-headings    : in-page anchor links on hover
 */

const REMARK_PLUGINS = [remarkGfm];
const REHYPE_PLUGINS: Array<unknown> = [
  rehypeSlug,
  [
    rehypeAutolinkHeadings,
    {
      behavior: 'append',
      properties: {
        className: ['heading-anchor'],
        ariaLabel: 'Anchor',
      },
    },
  ],
];

export interface MDXContentProps {
  /** Raw MDX body string (already split from frontmatter) */
  source: string;
}

export function MDXContent({ source }: MDXContentProps) {
  return (
    <MDXRemote
      source={source}
      components={mdxComponents}
      options={{
        parseFrontmatter: false,
        mdxOptions: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          remarkPlugins: REMARK_PLUGINS as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          rehypePlugins: REHYPE_PLUGINS as any,
        },
      }}
    />
  );
}
