'use client';

import * as React from 'react';
import Link from 'next/link';
import { ExternalLink, Clock, Pin, PinOff } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { StatusPill } from '@/components/display/status-pill';
import { Tag } from '@/components/display/tag';
import type { MapNode } from '@/types';

/**
 * NodeCard — the hover/click preview surface shared by all three views.
 *
 * Two variants:
 *   - inline (default) — fits inside a hover tooltip
 *   - panel — full card for the right-side detail panel
 */

export interface NodeCardProps {
  node: MapNode;
  variant?: 'inline' | 'panel';
  isPinned?: boolean;
  onPin?: () => void;
  onUnpin?: () => void;
}

export function NodeCard({ node, variant = 'inline', isPinned, onPin, onUnpin }: NodeCardProps) {
  const isCase = node.kind === 'case';
  const slug = node.id.replace(/^case:/, '');
  const m = node.meta;

  return (
    <div
      className={cn(
        'flex flex-col gap-2',
        variant === 'panel' && 'p-3',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="font-mono text-2xs uppercase tracking-widest text-fg-muted">
            {node.kind}
            {node.sublabel && ` · ${node.sublabel}`}
          </div>
          <div className={cn(
            'text-fg leading-snug',
            variant === 'panel' ? 'text-md mt-1' : 'text-sm',
          )}>
            {node.label}
          </div>
        </div>
        {variant === 'panel' && (onPin || onUnpin) && (
          <Button
            variant="ghost"
            size="xs"
            onClick={isPinned ? onUnpin : onPin}
            leading={isPinned ? <PinOff size={11} /> : <Pin size={11} />}
            aria-label={isPinned ? 'Unpin' : 'Pin to compare tray'}
          >
            {isPinned ? 'Unpin' : 'Pin'}
          </Button>
        )}
      </div>

      {isCase && (
        <>
          <div className="flex items-center gap-1 flex-wrap">
            {m.industry && <StatusPill tone="accent" size="xs">{m.industry}</StatusPill>}
            {m.difficulty && (
              <StatusPill
                size="xs"
                tone={
                  m.difficulty === 'intro' || m.difficulty === 'standard'
                    ? 'success'
                    : m.difficulty === 'advanced'
                      ? 'warning'
                      : 'danger'
                }
              >
                {m.difficulty}
              </StatusPill>
            )}
            {m.solved && <StatusPill tone="success" size="xs">solved</StatusPill>}
            {typeof m.timeEstimate === 'number' && (
              <span className="font-mono text-2xs text-fg-subtle flex items-center gap-0.5">
                <Clock size={9} /> {m.timeEstimate}m
              </span>
            )}
          </div>

          {m.frameworks && m.frameworks.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {m.frameworks.map((f) => (
                <Tag key={f} size="sm" tone="ghost">{f}</Tag>
              ))}
            </div>
          )}

          {variant === 'panel' && (
            <Button asChild variant="primary" size="sm" className="mt-2 self-start">
              <Link href={`/cases/${slug}`}>
                Open case <ExternalLink size={11} />
              </Link>
            </Button>
          )}
        </>
      )}
    </div>
  );
}
