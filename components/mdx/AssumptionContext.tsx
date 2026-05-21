'use client';

import * as React from 'react';

/**
 * AssumptionContext — page-scoped reactive state for case pages.
 *
 * Each AssumptionChip in the MDX registers a named assumption with default
 * value. Toggling a chip flips its `active` state (or cycles through preset
 * values). LiveNumber components read from the same registry and recompute
 * a formula whenever any assumption changes.
 *
 *   <AssumptionChip name="growth_rate" base={0.05} alt={0.10} />
 *   <AssumptionChip name="margin"      base={0.20} alt={0.15} />
 *   <LiveNumber compute="growth_rate * 100 * margin * 100" prefix="$" suffix="M" />
 *
 * Formulas are evaluated with a small safe-eval that only resolves names and
 * standard arithmetic — no general JS execution. See `evalFormula`.
 */

export type AssumptionValue = number | string | boolean;

export interface Assumption {
  /** Stable key referenced by LiveNumber formulas */
  name: string;
  /** Current value used in evaluations */
  value: AssumptionValue;
  /** The "default" snapshot — useful for diffing/UI */
  base: AssumptionValue;
  /** Friendly label for the chip */
  label?: string;
  /** Optional unit shown in the chip ("%", "$M", ...) */
  unit?: string;
  /** When the chip is "active", value = alt; otherwise value = base */
  alt?: AssumptionValue;
}

interface AssumptionContextValue {
  assumptions: Record<string, Assumption>;
  /** Register on mount; idempotent on stable identity */
  register: (a: Assumption) => void;
  /** Update an existing assumption's value */
  setValue: (name: string, value: AssumptionValue) => void;
  /** Toggle a chip — flips between base + alt */
  toggle: (name: string) => void;
  /** Read a value as a number (with sensible coercions) */
  asNumber: (name: string) => number;
}

const Ctx = React.createContext<AssumptionContextValue | null>(null);

export function AssumptionProvider({ children }: { children: React.ReactNode }) {
  const [assumptions, setAssumptions] = React.useState<Record<string, Assumption>>({});

  const register = React.useCallback((a: Assumption) => {
    setAssumptions((prev) => {
      // Don't overwrite if already registered with the same shape
      const existing = prev[a.name];
      if (
        existing &&
        existing.value === a.value &&
        existing.base === a.base &&
        existing.alt === a.alt
      ) {
        return prev;
      }
      return { ...prev, [a.name]: { ...a } };
    });
  }, []);

  const setValue = React.useCallback((name: string, value: AssumptionValue) => {
    setAssumptions((prev) => {
      const cur = prev[name];
      if (!cur) return prev;
      return { ...prev, [name]: { ...cur, value } };
    });
  }, []);

  const toggle = React.useCallback((name: string) => {
    setAssumptions((prev) => {
      const cur = prev[name];
      if (!cur || cur.alt === undefined) return prev;
      const next = cur.value === cur.base ? cur.alt : cur.base;
      return { ...prev, [name]: { ...cur, value: next } };
    });
  }, []);

  const asNumber = React.useCallback(
    (name: string): number => {
      const a = assumptions[name];
      if (!a) return 0;
      if (typeof a.value === 'number') return a.value;
      if (typeof a.value === 'boolean') return a.value ? 1 : 0;
      const parsed = parseFloat(a.value);
      return Number.isFinite(parsed) ? parsed : 0;
    },
    [assumptions],
  );

  const value = React.useMemo<AssumptionContextValue>(
    () => ({ assumptions, register, setValue, toggle, asNumber }),
    [assumptions, register, setValue, toggle, asNumber],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Hook for reading the context. Returns a "passive" version that doesn't
 *  throw if used outside a provider — pages without case state still render. */
export function useAssumptions(): AssumptionContextValue {
  const ctx = React.useContext(Ctx);
  if (ctx) return ctx;
  return {
    assumptions: {},
    register: () => {},
    setValue: () => {},
    toggle: () => {},
    asNumber: () => 0,
  };
}

// ---------- Safe formula evaluator ----------

/**
 * Evaluate a formula in terms of named assumptions.
 *
 * Allowed tokens:
 *   - Numbers (123, 1.5, -.25)
 *   - Identifiers (registered assumption names) — resolve to numeric values
 *   - Operators: + - * / % ( ) Math.min / Math.max / Math.round / Math.abs
 *
 * Anything else fails closed (returns NaN). The implementation tokenizes +
 * parses; it does NOT use eval/new Function with arbitrary input.
 */
const FUNC_WHITELIST: Record<string, (...args: number[]) => number> = {
  min: (...a) => Math.min(...a),
  max: (...a) => Math.max(...a),
  round: (n) => Math.round(n),
  abs: (n) => Math.abs(n),
  floor: (n) => Math.floor(n),
  ceil: (n) => Math.ceil(n),
  pow: (a, b) => Math.pow(a, b),
};

export function evalFormula(
  formula: string,
  resolveName: (name: string) => number,
): number {
  try {
    const tokens = tokenize(formula);
    if (tokens.length === 0) return 0;
    const [val, rest] = parseExpr(tokens, 0, resolveName);
    if (rest !== tokens.length) return NaN;
    return val;
  } catch {
    return NaN;
  }
}

type Tok =
  | { t: 'num'; v: number }
  | { t: 'id'; v: string }
  | { t: 'op'; v: '+' | '-' | '*' | '/' | '%' }
  | { t: 'lp' }
  | { t: 'rp' }
  | { t: 'comma' };

function tokenize(s: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i]!;
    if (/\s/.test(c)) { i++; continue; }
    if (c === '(') { out.push({ t: 'lp' }); i++; continue; }
    if (c === ')') { out.push({ t: 'rp' }); i++; continue; }
    if (c === ',') { out.push({ t: 'comma' }); i++; continue; }
    if ('+-*/%'.includes(c)) {
      out.push({ t: 'op', v: c as '+' | '-' | '*' | '/' | '%' });
      i++;
      continue;
    }
    if (/[0-9.]/.test(c)) {
      let j = i + 1;
      while (j < s.length && /[0-9.]/.test(s[j]!)) j++;
      out.push({ t: 'num', v: parseFloat(s.slice(i, j)) });
      i = j;
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i + 1;
      while (j < s.length && /[A-Za-z0-9_]/.test(s[j]!)) j++;
      out.push({ t: 'id', v: s.slice(i, j) });
      i = j;
      continue;
    }
    throw new Error(`unexpected char ${c}`);
  }
  return out;
}

// Recursive-descent parser; cursor returned is index after consumed.
function parseExpr(toks: Tok[], cursor: number, resolve: (n: string) => number): [number, number] {
  let [left, c] = parseTerm(toks, cursor, resolve);
  while (c < toks.length) {
    const t = toks[c];
    if (!t || t.t !== 'op' || (t.v !== '+' && t.v !== '-')) break;
    const op = t.v;
    const [right, c2] = parseTerm(toks, c + 1, resolve);
    left = op === '+' ? left + right : left - right;
    c = c2;
  }
  return [left, c];
}
function parseTerm(toks: Tok[], cursor: number, resolve: (n: string) => number): [number, number] {
  let [left, c] = parseFactor(toks, cursor, resolve);
  while (c < toks.length) {
    const t = toks[c];
    if (!t || t.t !== 'op' || (t.v !== '*' && t.v !== '/' && t.v !== '%')) break;
    const op = t.v;
    const [right, c2] = parseFactor(toks, c + 1, resolve);
    left = op === '*' ? left * right : op === '/' ? left / right : left % right;
    c = c2;
  }
  return [left, c];
}
function parseFactor(toks: Tok[], cursor: number, resolve: (n: string) => number): [number, number] {
  const t = toks[cursor];
  if (!t) throw new Error('unexpected end');
  if (t.t === 'op' && (t.v === '-' || t.v === '+')) {
    const [v, c] = parseFactor(toks, cursor + 1, resolve);
    return [t.v === '-' ? -v : v, c];
  }
  if (t.t === 'num') return [t.v, cursor + 1];
  if (t.t === 'lp') {
    const [v, c] = parseExpr(toks, cursor + 1, resolve);
    if (toks[c]?.t !== 'rp') throw new Error('missing )');
    return [v, c + 1];
  }
  if (t.t === 'id') {
    const next = toks[cursor + 1];
    if (next?.t === 'lp') {
      // function call
      const fn = FUNC_WHITELIST[t.v];
      if (!fn) throw new Error(`unknown fn ${t.v}`);
      const args: number[] = [];
      let c = cursor + 2;
      if (toks[c]?.t !== 'rp') {
        while (c < toks.length) {
          const [v, c2] = parseExpr(toks, c, resolve);
          args.push(v);
          c = c2;
          if (toks[c]?.t === 'comma') { c++; continue; }
          break;
        }
      }
      if (toks[c]?.t !== 'rp') throw new Error('missing )');
      return [fn(...args), c + 1];
    }
    return [resolve(t.v), cursor + 1];
  }
  throw new Error('parse error');
}
