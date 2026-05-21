'use client';

import * as React from 'react';
import { ExternalLink } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/cn';

/**
 * <Citation> — inline reference badge.
 *
 *   <Citation publisher="HBS" title="Acme Co" year={2023} url="..." quote="Profit fell" />
 *
 * Renders as a small [HBS · 2023] pill. Click opens a popover with full meta.
 * Strict on quote length (≤ 15 words per CITATION_CONTRACT.md).
 */

export interface CitationProps {
  publisher: string;
  title: string;
  authors?: string[] | string;
  year?: number;
  url?: string;
  /** Optional short quote — STRICTLY ≤ 15 words. */
  quote?: string;
  /** Optional page reference */
  page?: string;
  /** Number badge (auto-incremented by the container if you prefer) */
  n?: number | string;
}

export function Citation({ publisher, title, authors, year, url, quote, page, n }: CitationProps) {
  const author = Array.isArray(authors) ? authors.join(', ') : authors;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-baseline gap-0.5 px-1 -mx-0.5 rounded-sm',
            'font-mono text-2xs tracking-wider shadow-sm hover:-translate-y-[1px]',
            'border border-accent-soft bg-accent-soft text-accent',
            'hover:bg-accent hover:text-accent-fg transition-all duration-fast align-baseline',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
          )}
          aria-label={`Citation: ${publisher} — ${title}`}
        >
          {n !== undefined && <span>{n}</span>}
          {n === undefined && <span>{publisher}</span>}
          {year && <span className="opacity-80">·{year}</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent className="max-w-sm">
        <div className="space-y-2">
          <div className="font-mono text-2xs uppercase tracking-widest text-fg-muted">
            {publisher}
            {year && ` · ${year}`}
          </div>
          <div className="text-sm text-fg leading-snug">{title}</div>
          {author && (
            <div className="text-xs text-fg-muted italic">{author}</div>
          )}
          {page && (
            <div className="text-2xs font-mono text-fg-subtle">p. {page}</div>
          )}
          {quote && (
            <div className="text-xs italic border-l-2 border-l-accent pl-2 text-fg-muted leading-relaxed">
              “{quote}”
            </div>
          )}
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
            >
              View source <ExternalLink size={10} />
            </a>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
