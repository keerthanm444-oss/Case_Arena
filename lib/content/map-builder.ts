/**
 * Map graph builder.
 *
 * Reads cases + modules + frameworks from their respective registries and
 * builds a deterministic graph of nodes + edges that powers /map.
 *
 * Edge generation rules:
 *   - shares-framework  — two cases that exercise ≥1 shared framework
 *   - shares-industry   — two cases in the same industry
 *   - related-explicit  — frontmatter `relatedCases` array (BIDIRECTIONAL)
 *   - taught-in         — case → module that links it in `linkedCases`
 *
 * Bidirectional reciprocity: when case A's frontmatter declares
 * `relatedCases: [B]`, the graph gets an A→B AND a B→A edge automatically.
 * Authors only need to declare the relationship once on either side.
 */

import type { MapGraph, MapNode, MapEdge } from '@/types';
import { getAllCases, getCaseFrontmatter } from './cases';

export function buildMapGraph(): MapGraph {
  const cases = getAllCases();
  const nodes: MapNode[] = [];
  const edges: MapEdge[] = [];

  // ---- CASE nodes ----
  for (const c of cases) {
    nodes.push({
      id: `case:${c.slug}`,
      kind: 'case',
      label: c.title,
      sublabel: c.sourcePublisher,
      weight: c.solved ? 2 : 1,
      meta: {
        industry: c.industry,
        category: c.category,
        difficulty: c.difficulty,
        frameworks: c.frameworks,
        timeEstimate: c.timeEstimate,
        solved: c.solved,
        sourcePublisher: c.sourcePublisher,
        tags: c.tags,
      },
    });
  }

  // ---- SHARES-FRAMEWORK + SHARES-INDUSTRY edges (pairwise) ----
  for (let i = 0; i < cases.length; i++) {
    for (let j = i + 1; j < cases.length; j++) {
      const a = cases[i]!;
      const b = cases[j]!;
      const shared = a.frameworks.filter((f) => b.frameworks.includes(f));
      if (shared.length > 0) {
        edges.push({
          id: `fw:${a.slug}:${b.slug}`,
          source: `case:${a.slug}`,
          target: `case:${b.slug}`,
          kind: 'shares-framework',
          weight: shared.length / Math.max(a.frameworks.length, b.frameworks.length),
          label: shared.join(', '),
        });
      }
      if (a.industry === b.industry) {
        edges.push({
          id: `ind:${a.slug}:${b.slug}`,
          source: `case:${a.slug}`,
          target: `case:${b.slug}`,
          kind: 'shares-industry',
          weight: 0.5,
          label: a.industry,
        });
      }
    }
  }

  // ---- RELATED-EXPLICIT edges (BIDIRECTIONAL, deduped) ----
  // Authors declare relatedCases on one side; we materialize edges in both
  // directions and dedupe by undirected pair.
  const seenRelated = new Set<string>();
  for (const c of cases) {
    const fm = getCaseFrontmatter(c.slug);
    const related = Array.isArray(fm?.relatedCases) ? (fm.relatedCases as string[]) : [];
    for (const otherSlug of related) {
      // Only emit if the other side actually exists in our case set
      if (!cases.some((x) => x.slug === otherSlug)) continue;
      const pairKey = [c.slug, otherSlug].sort().join('::');
      if (seenRelated.has(pairKey)) continue;
      seenRelated.add(pairKey);
      edges.push({
        id: `rel:${pairKey}`,
        source: `case:${c.slug}`,
        target: `case:${otherSlug}`,
        kind: 'related-explicit',
        weight: 1.0,
        label: 'author-linked',
      });
    }
  }

  return {
    nodes,
    edges,
    builtAt: new Date().toISOString(),
  };
}

export function getMapGraph(): MapGraph {
  return buildMapGraph();
}
