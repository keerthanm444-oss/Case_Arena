import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import * as React from 'react';
import {
  AssumptionProvider,
  useAssumptions,
} from '@/components/mdx/AssumptionContext';

/**
 * AssumptionContext is the runtime that powers case-page reactivity. These
 * tests pin the registration / toggle / value-resolution behavior so the
 * MDX `<AssumptionChip>` ↔ `<LiveNumber>` contract stays correct.
 */

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(AssumptionProvider, null, children);
}

describe('AssumptionContext — registration', () => {
  it('registers a new assumption on first call', () => {
    const { result } = renderHook(() => useAssumptions(), { wrapper });
    act(() => {
      result.current.register({
        name: 'growth',
        value: 0.05,
        base: 0.05,
        alt: 0.1,
      });
    });
    expect(result.current.assumptions.growth).toBeDefined();
    expect(result.current.assumptions.growth!.value).toBe(0.05);
  });

  it('is idempotent for unchanged registrations', () => {
    const { result } = renderHook(() => useAssumptions(), { wrapper });
    act(() => {
      result.current.register({
        name: 'growth',
        value: 0.05,
        base: 0.05,
        alt: 0.1,
      });
    });
    const first = result.current.assumptions;
    act(() => {
      result.current.register({
        name: 'growth',
        value: 0.05,
        base: 0.05,
        alt: 0.1,
      });
    });
    // Same object reference — no needless re-renders downstream
    expect(result.current.assumptions).toBe(first);
  });
});

describe('AssumptionContext — toggle', () => {
  it('flips between base and alt', () => {
    const { result } = renderHook(() => useAssumptions(), { wrapper });
    act(() => {
      result.current.register({
        name: 'margin',
        value: 0.2,
        base: 0.2,
        alt: 0.15,
      });
    });
    act(() => result.current.toggle('margin'));
    expect(result.current.assumptions.margin!.value).toBe(0.15);
    act(() => result.current.toggle('margin'));
    expect(result.current.assumptions.margin!.value).toBe(0.2);
  });

  it('is a no-op when no alt is provided', () => {
    const { result } = renderHook(() => useAssumptions(), { wrapper });
    act(() => {
      result.current.register({
        name: 'constant',
        value: 42,
        base: 42,
      });
    });
    act(() => result.current.toggle('constant'));
    expect(result.current.assumptions.constant!.value).toBe(42);
  });

  it('is a no-op when the name is unknown', () => {
    const { result } = renderHook(() => useAssumptions(), { wrapper });
    act(() => result.current.toggle('nonexistent'));
    expect(result.current.assumptions).toEqual({});
  });
});

describe('AssumptionContext — asNumber', () => {
  it('coerces booleans + strings to numbers', () => {
    const { result } = renderHook(() => useAssumptions(), { wrapper });
    act(() => {
      result.current.register({ name: 'b', value: true, base: true });
      result.current.register({ name: 's', value: '3.14', base: '3.14' });
    });
    expect(result.current.asNumber('b')).toBe(1);
    expect(result.current.asNumber('s')).toBeCloseTo(3.14);
  });

  it('returns 0 for missing names (safe default for formulas)', () => {
    const { result } = renderHook(() => useAssumptions(), { wrapper });
    expect(result.current.asNumber('missing')).toBe(0);
  });

  it('returns 0 for unparseable strings', () => {
    const { result } = renderHook(() => useAssumptions(), { wrapper });
    act(() => {
      result.current.register({ name: 'x', value: 'not-a-number', base: 'not-a-number' });
    });
    expect(result.current.asNumber('x')).toBe(0);
  });
});

describe('AssumptionContext — passive fallback', () => {
  it('returns a stub context when no provider is present', () => {
    const { result } = renderHook(() => useAssumptions());
    // No provider — passive object that doesn't throw, all ops noop
    expect(result.current.assumptions).toEqual({});
    expect(() => {
      result.current.register({ name: 'x', value: 1, base: 1 });
      result.current.toggle('x');
      result.current.setValue('x', 2);
    }).not.toThrow();
    expect(result.current.asNumber('x')).toBe(0);
  });
});
