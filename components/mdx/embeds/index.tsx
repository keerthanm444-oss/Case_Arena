'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Callout } from '@/components/display/callout';
import type { IssueTreeData } from '@/components/muscles/issue-tree/types';
import type { DecisionTreeNode } from '@/components/muscles/decision-tree/types';

/**
 * Muscle embeds — drop a muscle inline in MDX.
 *
 *   <IssueTreeEmbed slug="electrolight-tree" />
 *   <IssueTreeEmbed slug="..." initialData={...} />     pre-seeded
 *   <IssueTreeEmbed slug="..." readOnly />              for published answers
 *
 *   <MindMapEmbed framework="profitability" />
 *
 *   <DecisionTreeEmbed slug="launch-vs-wait" initialData={...} />
 *
 * All three lazy-load their underlying muscle to keep the module page light.
 */

// ---- Lazy underlying muscles ----

const IssueTreeBuilder = dynamic(
  () => import('@/components/muscles/issue-tree/IssueTreeBuilder').then((m) => m.IssueTreeBuilder),
  { ssr: false, loading: () => <EmbedSkeleton label="Issue tree" /> },
);
const FrameworkMindMap = dynamic(
  () => import('@/components/muscles/mind-map/FrameworkMindMap').then((m) => m.FrameworkMindMap),
  { ssr: false, loading: () => <EmbedSkeleton label="Mind map" /> },
);
const DecisionTree = dynamic(
  () => import('@/components/muscles/decision-tree/DecisionTree').then((m) => m.DecisionTree),
  { ssr: false, loading: () => <EmbedSkeleton label="Decision tree" /> },
);

// ---- IssueTreeEmbed ----

export interface IssueTreeEmbedProps {
  slug: string;
  initialData?: IssueTreeData;
  initialName?: string;
  readOnly?: boolean;
  height?: number;
}

export function IssueTreeEmbed({
  slug,
  initialData,
  initialName,
  readOnly,
  height = 420,
}: IssueTreeEmbedProps) {
  return (
    <div className="my-6">
      <IssueTreeBuilder
        initialData={initialData}
        initialName={initialName ?? `Tree · ${slug}`}
        contextRef={slug}
        readOnly={readOnly}
        embedded
        height={height}
      />
    </div>
  );
}

// ---- MindMapEmbed ----

export interface MindMapEmbedProps {
  framework: string;
  height?: number;
}

export function MindMapEmbed({ framework, height = 480 }: MindMapEmbedProps) {
  return (
    <div className="my-6">
      <FrameworkMindMap initialSlug={framework} embedded height={height} />
    </div>
  );
}

// ---- DecisionTreeEmbed ----

export interface DecisionTreeEmbedProps {
  slug: string;
  initialData?: DecisionTreeNode;
  initialName?: string;
  readOnly?: boolean;
}

export function DecisionTreeEmbed({
  slug,
  initialData,
  initialName,
  readOnly,
}: DecisionTreeEmbedProps) {
  return (
    <div className="my-6">
      <DecisionTree
        initialData={initialData}
        initialName={initialName ?? `Decision · ${slug}`}
        contextRef={slug}
        readOnly={readOnly}
        embedded
      />
    </div>
  );
}

// ---- Embed-not-found ----

export function MuscleEmbedMissing({ name }: { name: string }) {
  return (
    <Callout tone="warning" title="Embed not available" className="my-4">
      Unknown muscle: <code>{name}</code>. Check the spelling.
    </Callout>
  );
}

function EmbedSkeleton({ label }: { label: string }) {
  return (
    <div
      className={cn(
        'grid place-items-center h-[320px]',
        'border border-line rounded-md bg-bg-panel',
      )}
      role="status"
    >
      <div className="text-center">
        <Sparkles size={14} className="text-fg-subtle mx-auto mb-2 animate-pulse" />
        <div className="font-mono text-2xs uppercase tracking-widest text-fg-muted">
          Loading {label}
        </div>
      </div>
    </div>
  );
}
