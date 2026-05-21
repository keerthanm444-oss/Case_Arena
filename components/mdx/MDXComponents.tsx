'use client';

import * as React from 'react';
import Link from 'next/link';
import type { MDXComponents } from 'mdx/types';
import { cn } from '@/lib/cn';

// Display + UI
import { Callout as DisplayCallout } from '@/components/display/callout';
import { Tag } from '@/components/display/tag';

// MDX building blocks
import { Citation } from './Citation';
import { Framework } from './Framework';
import { AssumptionChip } from './AssumptionChip';
import { LiveNumber } from './LiveNumber';
import { ScratchPad } from './ScratchPad';
import { CaseLink } from './CaseLink';
import {
  IssueTreeEmbed,
  MindMapEmbed,
  DecisionTreeEmbed,
} from './embeds';

/**
 * MDXComponents — the components map fed to MDXRemote.
 *
 * Includes:
 *   - HTML element overrides for prose styling (h1..h6, p, ul, ol, blockquote, code...)
 *   - Custom shortcodes (Callout, Citation, Framework, AssumptionChip, LiveNumber, ...)
 *   - Muscle embeds (IssueTreeEmbed, MindMapEmbed, DecisionTreeEmbed)
 *
 * The HTML overrides apply consistent prose styling without needing a
 * separate @tailwindcss/typography plugin — keeps the bundle small.
 */

export const mdxComponents: MDXComponents = {
  // ---------- Headings (rehype-slug assigns ids) ----------
  h1: (props) => (
    <h1
      {...props}
      className={cn(
        'font-display text-fg mt-12 mb-5 first:mt-0',
        'tracking-tight leading-tight',
      )}
      style={{
        fontSize: 'var(--text-3xl)',
        fontWeight: 400,
        fontVariationSettings: "'opsz' 96, 'SOFT' 50",
      }}
    />
  ),
  h2: (props) => (
    <h2
      {...props}
      className={cn(
        'font-display text-fg mt-10 mb-3 leading-snug tracking-tight',
        'scroll-mt-[calc(var(--topbar-h)+16px)]',
      )}
      style={{
        fontSize: 'var(--text-2xl)',
        fontWeight: 500,
        fontVariationSettings: "'opsz' 48, 'SOFT' 70",
      }}
    />
  ),
  h3: (props) => (
    <h3
      {...props}
      className={cn(
        'font-display text-fg mt-8 mb-2 leading-snug tracking-tight',
        'scroll-mt-[calc(var(--topbar-h)+16px)]',
      )}
      style={{
        fontSize: 'var(--text-xl)',
        fontWeight: 500,
        fontVariationSettings: "'opsz' 32, 'SOFT' 90",
      }}
    />
  ),
  h4: (props) => (
    <h4
      {...props}
      className="text-md font-medium text-fg mt-6 mb-2 leading-snug"
    />
  ),

  // ---------- Prose ----------
  p: (props) => (
    <p
      {...props}
      className="text-fg leading-relaxed my-4"
      style={{ fontSize: 'var(--text-md)' }}
    />
  ),
  a: ({ href, ...rest }) => {
    const internal = href?.startsWith('/');
    if (internal) {
      return (
        <Link
          href={href!}
          {...rest}
          className="text-fg underline decoration-accent-soft underline-offset-2 hover:decoration-accent transition-colors duration-fast"
        />
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        {...rest}
        className="text-fg underline decoration-accent-soft underline-offset-2 hover:decoration-accent transition-colors duration-fast"
      />
    );
  },
  ul: (props) => (
    <ul {...props} className="list-disc pl-6 my-4 marker:text-fg-subtle [&_li]:my-1" />
  ),
  ol: (props) => (
    <ol {...props} className="list-decimal pl-6 my-4 marker:text-fg-subtle [&_li]:my-1" />
  ),
  li: (props) => (
    <li
      {...props}
      className="text-fg leading-relaxed"
      style={{ fontSize: 'var(--text-md)' }}
    />
  ),
  blockquote: (props) => (
    <blockquote
      {...props}
      className={cn(
        "my-6 px-6 py-4 rounded-lg bg-bg-panel border border-line",
        "shadow-soft text-fg-muted italic relative overflow-hidden",
        "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-accent/80",
        "[&_p]:my-0"
      )}
    />
  ),
  hr: () => <hr className="my-8 border-line" />,
  strong: (props) => (
    <strong {...props} className="font-medium text-fg" />
  ),
  em: (props) => <em {...props} className="italic" />,
  code: ({ className, ...rest }: React.HTMLAttributes<HTMLElement>) => {
    // Inline code (when no className) vs fenced code (className like "language-ts")
    if (!className) {
      return (
        <code
          {...rest}
          className="font-mono text-2xs px-1.5 py-0.5 rounded-sm border border-line bg-bg-panel text-fg"
        />
      );
    }
    return (
      <code
        {...rest}
        className={cn(
          'font-mono text-xs block',
          className,
        )}
      />
    );
  },
  pre: (props) => (
    <pre
      {...props}
      className={cn(
        'font-mono text-xs leading-relaxed',
        'border border-line rounded-md bg-bg-panel',
        'p-4 my-5 overflow-x-auto',
      )}
    />
  ),
  table: (props) => (
    <div className="my-5 overflow-x-auto rounded-md border border-line">
      <table {...props} className="w-full text-sm border-collapse" />
    </div>
  ),
  thead: (props) => <thead {...props} className="bg-bg-panel" />,
  tr: (props) => <tr {...props} className="border-b border-line last:border-b-0" />,
  th: (props) => (
    <th
      {...props}
      className="text-left px-3 py-2 font-mono text-2xs uppercase tracking-widest text-fg-muted"
    />
  ),
  td: (props) => (
    <td {...props} className="px-3 py-2 text-fg align-baseline" />
  ),

  // ---------- Custom shortcodes ----------
  Callout: DisplayCallout,
  Citation,
  Framework,
  AssumptionChip,
  LiveNumber,
  ScratchPad,
  CaseLink,
  Tag,

  // Muscle embeds
  IssueTreeEmbed,
  MindMapEmbed,
  DecisionTreeEmbed,
};

// Re-export the type for any wrapper that wants to extend
export type { MDXComponents };
