/**
 * Market sizing model.
 *
 * A scenario is an ordered chain of "steps". Each step has a label, a
 * value (the slider), a unit, and an optional sensitivity range used by
 * the tornado. The result is the running product of all values.
 *
 *   Total population × % adults × % coffee drinkers × cups/year × $/cup
 *
 * The model deliberately supports only multiplicative chains (the dominant
 * shape of consulting market-sizing problems). Additive variants live in
 * a future "compound model".
 */

export interface SizingStep {
  id: string;
  label: string;
  /** Current slider value */
  value: number;
  unit?: string;
  /** Slider [min, max, step] */
  range: [number, number, number];
  /** Optional citation backing the default */
  citationId?: string;
  /** Optional note shown beneath the slider */
  note?: string;
  /** When true, this step's value is interpreted as a percentage (×0.01 in product) */
  isPercent?: boolean;
}

export interface SizingScenario {
  version: 1;
  /** Friendly name */
  name: string;
  /** What we're sizing — used as the headline */
  prompt: string;
  steps: SizingStep[];
  /** Currency / unit for the final answer */
  resultUnit?: string;
}

/** Compute the running product. Returns total + step-by-step trace. */
export function computeSizing(s: SizingScenario): {
  total: number;
  trace: Array<{ step: SizingStep; runningTotal: number }>;
} {
  let running = 1;
  const trace: Array<{ step: SizingStep; runningTotal: number }> = [];
  for (const step of s.steps) {
    const v = step.isPercent ? step.value / 100 : step.value;
    running *= v;
    trace.push({ step, runningTotal: running });
  }
  return { total: running, trace };
}

/** Sensitivity: for each step, swing ±20% and measure impact on the total.
 *  Returns sorted descending by impact magnitude. */
export interface SensitivityRow {
  stepId: string;
  label: string;
  baseTotal: number;
  totalAtLow: number;
  totalAtHigh: number;
  /** Absolute impact = (high - low) / baseTotal */
  impact: number;
}

export function sensitivityTornado(s: SizingScenario, swing = 0.2): SensitivityRow[] {
  const { total: baseTotal } = computeSizing(s);
  const rows: SensitivityRow[] = [];
  for (const step of s.steps) {
    const low: SizingScenario = {
      ...s,
      steps: s.steps.map((x) =>
        x.id === step.id ? { ...x, value: x.value * (1 - swing) } : x,
      ),
    };
    const high: SizingScenario = {
      ...s,
      steps: s.steps.map((x) =>
        x.id === step.id ? { ...x, value: x.value * (1 + swing) } : x,
      ),
    };
    const t1 = computeSizing(low).total;
    const t2 = computeSizing(high).total;
    rows.push({
      stepId: step.id,
      label: step.label,
      baseTotal,
      totalAtLow: t1,
      totalAtHigh: t2,
      impact: baseTotal === 0 ? 0 : Math.abs((t2 - t1) / baseTotal),
    });
  }
  return rows.sort((a, b) => b.impact - a.impact);
}

/** A pre-baked sample sizing problem — US coffee shop market.
 *  Defaults sourced from public-domain statistics; user can override. */
export function sampleSizingScenario(): SizingScenario {
  return {
    version: 1,
    name: 'US coffee shop market',
    prompt: 'Size the annual US coffee shop market (revenue).',
    resultUnit: '$',
    steps: [
      {
        id: 's-pop',
        label: 'US population',
        value: 333_000_000,
        unit: 'people',
        range: [300_000_000, 350_000_000, 1_000_000],
        note: 'Order of magnitude; refine in clarifying questions',
      },
      {
        id: 's-adult',
        label: '% adults (18+)',
        value: 76,
        isPercent: true,
        range: [60, 90, 1],
        unit: '%',
      },
      {
        id: 's-drinkers',
        label: '% coffee drinkers',
        value: 60,
        isPercent: true,
        range: [40, 80, 1],
        unit: '%',
      },
      {
        id: 's-shop',
        label: '% who buy at coffee shops (vs. home)',
        value: 50,
        isPercent: true,
        range: [20, 80, 1],
        unit: '%',
      },
      {
        id: 's-freq',
        label: 'Cups per week per shop-buyer',
        value: 3,
        unit: 'cups/week',
        range: [1, 10, 1],
      },
      {
        id: 's-weeks',
        label: 'Weeks per year',
        value: 50,
        unit: 'weeks',
        range: [48, 52, 1],
      },
      {
        id: 's-price',
        label: 'Average price per cup',
        value: 5,
        unit: '$',
        range: [3, 8, 0.25],
      },
    ],
  };
}
