import { describe, it, expect } from 'vitest';
import { evalFormula } from '@/components/mdx/AssumptionContext';

describe('LiveNumber — evalFormula', () => {
  const resolve = (n: string) => ({ a: 10, b: 3, growth: 0.05, margin: 0.2 }[n] ?? 0);

  it('handles arithmetic', () => {
    expect(evalFormula('1 + 2 * 3', resolve)).toBe(7);
    expect(evalFormula('(1 + 2) * 3', resolve)).toBe(9);
    expect(evalFormula('10 - 7', resolve)).toBe(3);
    expect(evalFormula('20 / 4', resolve)).toBe(5);
    expect(evalFormula('10 % 3', resolve)).toBe(1);
  });

  it('resolves identifiers from the scope', () => {
    expect(evalFormula('a + b', resolve)).toBe(13);
    expect(evalFormula('growth * 100', resolve)).toBeCloseTo(5);
  });

  it('handles unary minus', () => {
    expect(evalFormula('-a + 5', resolve)).toBe(-5);
    expect(evalFormula('-(a - 5)', resolve)).toBe(-5);
  });

  it('calls whitelisted functions', () => {
    expect(evalFormula('max(a, b)', resolve)).toBe(10);
    expect(evalFormula('min(a, b)', resolve)).toBe(3);
    expect(evalFormula('round(growth * 100)', resolve)).toBe(5);
    expect(evalFormula('abs(-7)', resolve)).toBe(7);
    expect(evalFormula('pow(2, 3)', resolve)).toBe(8);
  });

  it('returns NaN for unknown identifiers? No — resolves to 0 by contract', () => {
    // Our resolve fallback returns 0 for unknown — formulas that reference
    // missing names just compute as if those were 0.
    expect(evalFormula('zzz + 5', resolve)).toBe(5);
  });

  it('returns NaN for malformed input', () => {
    expect(Number.isNaN(evalFormula('a + ', resolve))).toBe(true);
    expect(Number.isNaN(evalFormula('a +', resolve))).toBe(true);
    expect(Number.isNaN(evalFormula('a + )', resolve))).toBe(true);
  });

  it('returns 0 for empty string', () => {
    expect(evalFormula('', resolve)).toBe(0);
  });

  it('handles nested function calls', () => {
    expect(evalFormula('max(min(a, b), 7)', resolve)).toBe(7);
  });
});
