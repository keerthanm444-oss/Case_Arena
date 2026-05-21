'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Card } from '@/components/ui/card';
import { MODULE_SPINE } from '@/lib/content/modules';

/**
 * <PrevNext currentSlug="orientation" /> — auto-derives previous + next
 * modules from MODULE_SPINE order. Both cards link straight to the next page.
 */

export interface PrevNextProps {
  currentSlug: string;
}

export function PrevNext({ currentSlug }: PrevNextProps) {
  const idx = MODULE_SPINE.findIndex((m) => m.slug === currentSlug);
  if (idx === -1) return null;
  const prev = idx > 0 ? MODULE_SPINE[idx - 1] : null;
  const next = idx + 1 < MODULE_SPINE.length ? MODULE_SPINE[idx + 1] : null;

  return (
    <nav
      className="grid grid-cols-1 md:grid-cols-2 gap-3 my-10"
      aria-label="Module navigation"
    >
      {prev ? (
        <Link href={`/modules/${prev.slug}`} className="group">
          <Card variant="panel" interactive className="h-full">
            <div className="p-4 flex flex-col gap-1">
              <span className="flex items-center gap-1.5 font-mono text-2xs uppercase tracking-widest text-fg-muted">
                <ArrowLeft size={11} /> Previous
              </span>
              <span className="font-mono text-2xs text-fg-subtle">{prev.id}</span>
              <span className="text-sm text-fg group-hover:text-accent transition-colors duration-fast">
                {prev.title}
              </span>
            </div>
          </Card>
        </Link>
      ) : (
        <div aria-hidden />
      )}
      {next ? (
        <Link href={`/modules/${next.slug}`} className="group">
          <Card variant="panel" interactive className="h-full md:text-right">
            <div className="p-4 flex flex-col gap-1">
              <span className="flex items-center justify-end gap-1.5 font-mono text-2xs uppercase tracking-widest text-fg-muted">
                Next <ArrowRight size={11} />
              </span>
              <span className="font-mono text-2xs text-fg-subtle">{next.id}</span>
              <span className="text-sm text-fg group-hover:text-accent transition-colors duration-fast">
                {next.title}
              </span>
            </div>
          </Card>
        </Link>
      ) : (
        <div aria-hidden />
      )}
    </nav>
  );
}
