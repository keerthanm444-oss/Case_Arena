import { describe, it, expect } from 'vitest';
import {
  computeEV,
  checkProbabilities,
  normalizeProbabilities,
  sampleDecisionTree,
  type DecisionTreeNode,
} from '@/components/muscles/decision-tree/types';

describe('decision tree — computeEV', () => {
  it('returns leaf payoff for a single-node tree', () => {
    const t: DecisionTreeNode = {
      id: 'a',
      kind: 'leaf',
      label: 'x',
      payoff: 42,
    };
    const r = computeEV(t);
    expect(r.rootEV).toBe(42);
  });

  it('computes weighted EV at a chance node', () => {
    const t: DecisionTreeNode = {
      id: 'a',
      kind: 'chance',
      label: 'flip',
      children: [
        { id: 'h', kind: 'leaf', label: 'heads', probability: 0.5, payoff: 10 },
        { id: 't', kind: 'leaf', label: 'tails', probability: 0.5, payoff: -2 },
      ],
    };
    const r = computeEV(t);
    expect(r.rootEV).toBeCloseTo(4); // 0.5 * 10 + 0.5 * (-2)
  });

  it('picks max child at a decision node', () => {
    const t: DecisionTreeNode = {
      id: 'd',
      kind: 'decision',
      label: 'pick',
      children: [
        { id: 'low', kind: 'leaf', label: 'low', payoff: 3 },
        { id: 'high', kind: 'leaf', label: 'high', payoff: 9 },
      ],
    };
    const r = computeEV(t);
    expect(r.rootEV).toBe(9);
    expect(r.optimalChild['d']).toBe('high');
  });

  it('handles the sample tree correctly', () => {
    // sample tree: Launch (0.4*30 + 0.4*5 + 0.2*-10 = 12) vs Wait (0)
    // Optimal = Launch, EV = 12
    const r = computeEV(sampleDecisionTree());
    expect(r.rootEV).toBeCloseTo(12);
    expect(r.optimalChild['root']).toBe('launch');
  });
});

describe('decision tree — probability checks', () => {
  it('flags chance nodes whose children do not sum to 1', () => {
    const t: DecisionTreeNode = {
      id: 'c',
      kind: 'chance',
      label: 'bad',
      children: [
        { id: 'a', kind: 'leaf', label: 'a', probability: 0.3, payoff: 0 },
        { id: 'b', kind: 'leaf', label: 'b', probability: 0.4, payoff: 0 },
      ],
    };
    const checks = checkProbabilities(t);
    expect(checks).toHaveLength(1);
    expect(checks[0]!.ok).toBe(false);
    expect(checks[0]!.sum).toBeCloseTo(0.7);
  });

  it('normalizes a chance node to sum to 1', () => {
    const t: DecisionTreeNode = {
      id: 'c',
      kind: 'chance',
      label: 'normalize',
      children: [
        { id: 'a', kind: 'leaf', label: 'a', probability: 0.3, payoff: 0 },
        { id: 'b', kind: 'leaf', label: 'b', probability: 0.4, payoff: 0 },
      ],
    };
    const fixed = normalizeProbabilities(t);
    const checks = checkProbabilities(fixed);
    expect(checks[0]!.ok).toBe(true);
    expect(checks[0]!.sum).toBeCloseTo(1);
  });
});
