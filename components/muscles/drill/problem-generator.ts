/**
 * Mental math problem generator.
 *
 * Op categories cover the standard case-prep math diet:
 *   - mul     : 2-digit × 2-digit, 2-digit × 3-digit
 *   - div     : large ÷ small with clean quotients
 *   - pct     : "X% of Y" and "Y is what % of Z"
 *   - addsub  : 4-digit chained ops
 *   - growth  : compound growth at small percentages
 *
 * Difficulty levels shift ranges + introduce more digits.
 */

export type DrillOp = 'mul' | 'div' | 'pct' | 'addsub' | 'growth';
export type DrillLevel = 'easy' | 'medium' | 'hard' | 'insane';

export interface DrillProblem {
  id: string;
  op: DrillOp;
  prompt: string;
  answer: number;
  /** Acceptable tolerance for fractional answers (e.g. 1% of answer) */
  tolerance: number;
  /** Suggested time-to-answer in seconds (used for "fast"/"slow" tags) */
  targetSec: number;
}

function rint(lo: number, hi: number): number {
  return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}
function rfloat(lo: number, hi: number, decimals = 1): number {
  const f = Math.pow(10, decimals);
  return Math.round((Math.random() * (hi - lo) + lo) * f) / f;
}
function id() {
  return Math.random().toString(36).slice(2, 8);
}

const RANGES: Record<DrillLevel, { mulA: [number, number]; mulB: [number, number]; div: [number, number]; pct: [number, number]; pctVal: [number, number]; addsubLen: number; addsubMag: number; growthYears: number; }> = {
  easy:   { mulA: [11, 19], mulB: [11, 19], div: [12, 144],   pct: [10, 50],  pctVal: [100, 1000],     addsubLen: 3, addsubMag: 100,    growthYears: 3 },
  medium: { mulA: [12, 99], mulB: [12, 99], div: [100, 999],  pct: [5, 50],   pctVal: [1_000, 10_000], addsubLen: 4, addsubMag: 1_000,  growthYears: 5 },
  hard:   { mulA: [25, 99], mulB: [25, 99], div: [1000, 9999],pct: [1, 50],   pctVal: [10_000, 100_000], addsubLen: 5, addsubMag: 10_000, growthYears: 7 },
  insane: { mulA: [50, 999],mulB: [25, 199],div: [10_000, 99_999], pct: [1, 50],   pctVal: [100_000, 1_000_000], addsubLen: 6, addsubMag: 100_000, growthYears: 10 },
};

export function generateProblem(level: DrillLevel, op?: DrillOp): DrillProblem {
  const opPick = op ?? (['mul', 'div', 'pct', 'addsub', 'growth'][rint(0, 4)] as DrillOp);
  const r = RANGES[level];

  switch (opPick) {
    case 'mul': {
      const a = rint(r.mulA[0], r.mulA[1]);
      const b = rint(r.mulB[0], r.mulB[1]);
      return {
        id: id(),
        op: 'mul',
        prompt: `${a} × ${b}`,
        answer: a * b,
        tolerance: 0,
        targetSec: level === 'easy' ? 8 : level === 'medium' ? 15 : 25,
      };
    }
    case 'div': {
      // Build a clean problem: pick quotient, pick divisor, multiply for dividend.
      const q = rint(11, 99);
      const d = rint(5, 25);
      const n = q * d;
      return {
        id: id(),
        op: 'div',
        prompt: `${n.toLocaleString()} ÷ ${d}`,
        answer: q,
        tolerance: 0,
        targetSec: level === 'easy' ? 10 : 18,
      };
    }
    case 'pct': {
      const p = rint(r.pct[0], r.pct[1]);
      const v = rint(r.pctVal[0], r.pctVal[1]);
      const ans = (p / 100) * v;
      return {
        id: id(),
        op: 'pct',
        prompt: `${p}% of ${v.toLocaleString()}`,
        answer: Math.round(ans),
        tolerance: Math.max(1, Math.round(ans * 0.005)),
        targetSec: level === 'easy' ? 8 : 14,
      };
    }
    case 'addsub': {
      const ops = ['+', '−'] as const;
      let prompt = '';
      let total = 0;
      for (let i = 0; i < r.addsubLen; i++) {
        const v = rint(r.addsubMag / 2, r.addsubMag * 2);
        if (i === 0) {
          prompt = `${v.toLocaleString()}`;
          total = v;
        } else {
          const o = ops[rint(0, 1)]!;
          prompt += ` ${o} ${v.toLocaleString()}`;
          total = o === '+' ? total + v : total - v;
        }
      }
      return {
        id: id(),
        op: 'addsub',
        prompt,
        answer: total,
        tolerance: 0,
        targetSec: 12 + r.addsubLen * 4,
      };
    }
    case 'growth': {
      const principal = rint(1000, 10_000) * 100;
      const rate = rfloat(2, 10, 1);
      const years = r.growthYears;
      const factor = Math.pow(1 + rate / 100, years);
      const ans = Math.round(principal * factor);
      return {
        id: id(),
        op: 'growth',
        prompt: `${principal.toLocaleString()} grown at ${rate}% for ${years} years`,
        answer: ans,
        tolerance: Math.round(ans * 0.03), // 3% tolerance
        targetSec: 25,
      };
    }
  }
}

/** Op accuracy snapshot — used by the drill summary + dashboard heatmap. */
export interface OpStats {
  op: DrillOp;
  attempts: number;
  correct: number;
  avgTimeSec: number;
}
