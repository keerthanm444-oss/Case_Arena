'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { getCaseBySlug } from '@/lib/content/cases';

/**
 * <CaseLink slug="electrolight">Electrolight pricing</CaseLink>
 *
 * Links to /cases/[slug] with a tooltip preview of metadata if the case
 * is registered. If the case isn't authored yet, renders as inert text
 * with a "TBD" note — useful for cross-references that haven't landed yet.
 */

export interface CaseLinkProps {
  slug: string;
  children?: React.ReactNode;
}

export function CaseLink({ slug, children }: CaseLinkProps) {
  const c = getCaseBySlug(slug);
  if (!c) {
    return (
      <span
        className={cn(
          'inline-flex items-baseline gap-0.5 align-baseline',
          'text-fg-muted line-through decoration-wavy decoration-fg-subtle',
        )}
        title={`Case not yet authored: ${slug}`}
      >
        {children ?? slug}
      </span>
    );
  }
  const label = children ?? c.title;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={`/cases/${slug}`}
          className={cn(
            'inline-flex items-baseline gap-0.5 align-baseline',
            'text-fg underline decoration-accent-soft underline-offset-2',
            'hover:decoration-accent transition-colors duration-fast',
          )}
        >
          {label}
          <ArrowUpRight size={11} className="opacity-60" />
        </Link>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <div className="space-y-0.5">
          <div className="font-display text-xs text-fg">{c.title}</div>
          <div className="font-mono opacity-80">
            {c.industry} · {c.difficulty} · {c.estimatedMinutes}m
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
