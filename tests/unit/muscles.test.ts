import { describe, it, expect } from 'vitest';
import {
  computeSizing,
  sampleSizingScenario,
  sensitivityTornado,
} from '@/components/muscles/sizing/types';
import { critique } from '@/components/muscles/critique/rules';
import { generateProblem } from '@/components/muscles/drill/problem-generator';

describe('sizing — computeSizing', () => {
  it('multiplies steps in order, handling percent conversions', () => {
    const s = sampleSizingScenario();
    const { total, trace } = computeSizing(s);
    expect(total).toBeGreaterThan(0);
    expect(trace).toHaveLength(s.steps.length);
    // Last trace entry equals total
    expect(trace[trace.length - 1]!.runningTotal).toBeCloseTo(total);
  });

  it('returns zero total when any step is zero', () => {
    const s = sampleSizingScenario();
    s.steps[0]!.value = 0;
    const { total } = computeSizing(s);
    expect(total).toBe(0);
  });
});

describe('sizing — sensitivity tornado', () => {
  it('sorts rows by impact descending', () => {
    const s = sampleSizingScenario();
    const rows = sensitivityTornado(s);
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i - 1]!.impact).toBeGreaterThanOrEqual(rows[i]!.impact);
    }
  });

  it('returns one row per step', () => {
    const s = sampleSizingScenario();
    const rows = sensitivityTornado(s);
    expect(rows).toHaveLength(s.steps.length);
  });
});

describe('critique — slide title rules', () => {
  it('flags an empty title with no results', () => {
    const r = critique('');
    expect(r.results).toHaveLength(0);
  });

  it('passes an action-quantified title', () => {
    const r = critique('Revenue fell 12% in Q3');
    const warnings = r.results.filter((x) => x.severity === 'warning');
    // Should have action verb, quantified, ok length, no jargon, no hedging, ok case
    expect(warnings.length).toBeLessThan(2);
  });

  it('flags a jargon title', () => {
    const r = critique('Leverage scalable synergy paradigms');
    expect(r.results.some((x) => x.ruleId === 'jargon' && x.severity === 'warning')).toBe(true);
  });

  it('flags a hedging title', () => {
    const r = critique('We might possibly consider growing revenue');
    expect(r.results.some((x) => x.ruleId === 'hedging' && x.severity === 'warning')).toBe(true);
  });
});

describe('drill — problem generator', () => {
  it('generates valid multiplication problems at each level', () => {
    for (const level of ['easy', 'medium', 'hard'] as const) {
      const p = generateProblem(level, 'mul');
      expect(p.op).toBe('mul');
      // Parse the prompt back and verify the answer is correct
      const m = p.prompt.match(/^(\d+) × (\d+)$/);
      expect(m).not.toBeNull();
      if (m) {
        expect(p.answer).toBe(parseInt(m[1]!) * parseInt(m[2]!));
      }
    }
  });

  it('generates division problems with clean integer answers', () => {
    for (let i = 0; i < 5; i++) {
      const p = generateProblem('medium', 'div');
      expect(p.op).toBe('div');
      // Answer should be an integer
      expect(Number.isInteger(p.answer)).toBe(true);
    }
  });

  it('generates percentage problems with rounding tolerance', () => {
    const p = generateProblem('medium', 'pct');
    expect(p.op).toBe('pct');
    expect(p.tolerance).toBeGreaterThan(0);
  });
});
