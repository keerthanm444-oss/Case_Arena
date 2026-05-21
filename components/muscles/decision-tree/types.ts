/**
 * Decision tree types + expected value calculation.
 *
 * Standard decision-analysis structure:
 *   - Decision nodes  — the actor's choice
 *   - Chance nodes    — random outcomes with probabilities that sum to 1
 *   - Leaf nodes      — terminal payoffs
 *
 * EV is computed bottom-up:
 *   - Leaf EV = payoff
 *   - Chance EV = Σ(p_i × child_EV_i)
 *   - Decision EV = max(child_EV) — actor picks the best option
 *
 * For the optimal path: at each Decision node, we record which child won.
 */

export type DecisionNodeKind = 'decision' | 'chance' | 'leaf';

export interface DecisionTreeNode {
  id: string;
  kind: DecisionNodeKind;
  label: string;
  /** For chance children — probability of being chosen by nature */
  probability?: number;
  /** For leaves — terminal payoff */
  payoff?: number;
  /** Optional unit (default: $) */
  unit?: string;
  children?: DecisionTreeNode[];
}

export interface EVResult {
  /** EV at each node, keyed by id */
  evByNode: Record<string, number>;
  /** Optimal child at each decision node */
  optimalChild: Record<string, string>;
  /** Total tree EV (at root) */
  rootEV: number;
}

/** Compute EV bottom-up. Pure — no mutation. */
export function computeEV(root: DecisionTreeNode): EVResult {
  const evByNode: Record<string, number> = {};
  const optimalChild: Record<string, string> = {};

  function evOf(n: DecisionTreeNode): number {
    if (n.kind === 'leaf') {
      const v = n.payoff ?? 0;
      evByNode[n.id] = v;
      return v;
    }
    const kids = n.children ?? [];
    if (kids.length === 0) {
      evByNode[n.id] = 0;
      return 0;
    }
    if (n.kind === 'chance') {
      let total = 0;
      for (const k of kids) {
        total += (k.probability ?? 0) * evOf(k);
      }
      evByNode[n.id] = total;
      return total;
    }
    // decision: max
    let best = -Infinity;
    let bestId = kids[0]!.id;
    for (const k of kids) {
      const v = evOf(k);
      if (v > best) {
        best = v;
        bestId = k.id;
      }
    }
    optimalChild[n.id] = bestId;
    evByNode[n.id] = best;
    return best;
  }

  const rootEV = evOf(root);
  return { evByNode, optimalChild, rootEV };
}

/** Validate that chance-node children sum to ~1.0 (within 1% tolerance). */
export interface ProbCheck {
  nodeId: string;
  sum: number;
  ok: boolean;
}

export function checkProbabilities(root: DecisionTreeNode): ProbCheck[] {
  const out: ProbCheck[] = [];
  function walk(n: DecisionTreeNode) {
    const kids = n.children ?? [];
    if (n.kind === 'chance' && kids.length > 0) {
      const sum = kids.reduce((acc, k) => acc + (k.probability ?? 0), 0);
      out.push({
        nodeId: n.id,
        sum,
        ok: Math.abs(sum - 1) < 0.01,
      });
    }
    for (const k of kids) walk(k);
  }
  walk(root);
  return out;
}

/** Auto-normalize chance branch probabilities so they sum to 1. */
export function normalizeProbabilities(root: DecisionTreeNode): DecisionTreeNode {
  function fix(n: DecisionTreeNode): DecisionTreeNode {
    const kids = (n.children ?? []).map(fix);
    if (n.kind === 'chance' && kids.length > 0) {
      const total = kids.reduce((acc, k) => acc + (k.probability ?? 0), 0);
      if (total > 0) {
        return {
          ...n,
          children: kids.map((k) => ({
            ...k,
            probability: (k.probability ?? 0) / total,
          })),
        };
      }
      // No probabilities set; distribute equally
      const p = 1 / kids.length;
      return { ...n, children: kids.map((k) => ({ ...k, probability: p })) };
    }
    return { ...n, children: kids };
  }
  return fix(root);
}

/** Sample tree used to bootstrap the decision tree page. */
export function sampleDecisionTree(): DecisionTreeNode {
  return {
    id: 'root',
    kind: 'decision',
    label: 'Launch new product?',
    children: [
      {
        id: 'launch',
        kind: 'chance',
        label: 'Launch',
        children: [
          {
            id: 'launch-hit',
            kind: 'leaf',
            label: 'Hit ($30M)',
            probability: 0.4,
            payoff: 30,
            unit: '$M',
          },
          {
            id: 'launch-ok',
            kind: 'leaf',
            label: 'OK ($5M)',
            probability: 0.4,
            payoff: 5,
            unit: '$M',
          },
          {
            id: 'launch-flop',
            kind: 'leaf',
            label: 'Flop (−$10M)',
            probability: 0.2,
            payoff: -10,
            unit: '$M',
          },
        ],
      },
      {
        id: 'wait',
        kind: 'leaf',
        label: 'Wait (status quo, $0M)',
        payoff: 0,
        unit: '$M',
      },
    ],
  };
}
