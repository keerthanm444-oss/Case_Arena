'use client';

import * as React from 'react';
import { ChevronRight, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { KPITile } from '@/components/display/kpi-tile';
import { StatusPill } from '@/components/display/status-pill';
import { Callout } from '@/components/display/callout';
import { MuscleToolbar } from '@/components/muscles/shared/MuscleToolbar';
import {
  type SizingScenario,
  computeSizing,
  sampleSizingScenario,
  sensitivityTornado,
} from './types';
import { autoSave } from '@/lib/muscles/save-helpers';
import { useEmit } from '@/lib/event-bus';
import { useUIStore } from '@/lib/store';

/**
 * SizingCalculator — every assumption is a slider; result + step trace
 * update live. Sensitivity tornado shows which inputs swing the answer most.
 */

export interface SizingCalculatorProps {
  initialScenario?: SizingScenario;
  contextRef?: string;
  readOnly?: boolean;
  existingSaveId?: string;
  embedded?: boolean;
  className?: string;
}

export function SizingCalculator({
  initialScenario,
  contextRef,
  readOnly,
  existingSaveId,
  embedded,
  className,
}: SizingCalculatorProps) {
  const [scenario, setScenario] = React.useState<SizingScenario>(
    () => initialScenario ?? sampleSizingScenario(),
  );
  const [saveId, setSaveId] = React.useState<string | null>(existingSaveId ?? null);
  const [dirty, setDirty] = React.useState(false);
  const emit = useEmit();
  const toast = useUIStore((s) => s.toast);

  const { total, trace } = React.useMemo(() => computeSizing(scenario), [scenario]);
  const tornado = React.useMemo(() => sensitivityTornado(scenario), [scenario]);

  function updateStep(id: string, value: number) {
    setScenario((s) => ({
      ...s,
      steps: s.steps.map((st) => (st.id === id ? { ...st, value } : st)),
    }));
    setDirty(true);
    void emit('sizing.scenario.saved', { name: scenario.name, result: total });
  }

  function handleReset() {
    setScenario(sampleSizingScenario());
    setSaveId(null);
    setDirty(false);
  }

  async function handleSave() {
    const id = await autoSave(saveId, 'sizing-scenario', {
      name: scenario.name,
      contextRef,
      data: scenario,
    });
    setSaveId(id);
    setDirty(false);
    void emit('sizing.scenario.saved', { name: scenario.name, result: total });
    toast('success', `Saved · ${scenario.name}`);
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <MuscleToolbar
        name={scenario.name}
        onNameChange={(name) => {
          setScenario((s) => ({ ...s, name }));
          setDirty(true);
        }}
        dirty={dirty}
        saved={!!saveId && !dirty}
        readOnly={readOnly}
        readOnlyLabel={`Read-only · ${scenario.name}`}
        onSave={handleSave}
        compact={embedded}
        actions={
          !readOnly && (
            <Button variant="ghost" size="sm" onClick={handleReset} leading={<RotateCcw size={12} />}>
              Reset
            </Button>
          )
        }
      />

      <Card variant="panel" className="rounded-t-none border-t-0 -mt-3">
        <div className="p-4">
          {/* Headline / prompt */}
          <div className="mb-4">
            <div className="font-mono text-2xs uppercase tracking-widest text-fg-muted mb-1">
              Problem
            </div>
            <h3 className="text-md text-fg leading-snug">{scenario.prompt}</h3>
          </div>

          {/* KPI band */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-5">
            <KPITile
              label="Total estimate"
              value={formatBigNumber(total, scenario.resultUnit)}
              sub={`${scenario.steps.length} steps`}
              variant="accent"
              size="sm"
            />
            <KPITile
              label="Largest sensitivity"
              value={tornado[0]?.label ?? '—'}
              sub={tornado[0] ? `${(tornado[0].impact * 100).toFixed(0)}% swing` : ''}
              size="sm"
            />
            <KPITile
              label="Smallest sensitivity"
              value={tornado[tornado.length - 1]?.label ?? '—'}
              sub={tornado[tornado.length - 1] ? `${(tornado[tornado.length - 1]!.impact * 100).toFixed(0)}% swing` : ''}
              size="sm"
            />
          </div>

          {/* Step chain */}
          <div className="grid gap-3">
            {scenario.steps.map((step, idx) => (
              <div key={step.id} className="grid grid-cols-[2rem_1fr_auto] gap-3 items-start">
                <div className="font-mono text-2xs text-fg-subtle pt-1 tabular-nums">
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <div>
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <label className="text-sm text-fg">{step.label}</label>
                    <span className="font-numeric tabular-nums text-sm text-fg">
                      {formatValue(step.value, step.unit, step.isPercent)}
                    </span>
                  </div>
                  <Slider
                    value={[step.value]}
                    onValueChange={(v) => updateStep(step.id, v[0] ?? step.value)}
                    min={step.range[0]}
                    max={step.range[1]}
                    step={step.range[2]}
                    disabled={readOnly}
                  />
                  {step.note && (
                    <div className="text-2xs text-fg-subtle mt-1 italic">{step.note}</div>
                  )}
                </div>
                <div className="font-mono text-2xs text-fg-muted text-right pt-1 min-w-[6rem] tabular-nums">
                  = {formatBigNumber(trace[idx]?.runningTotal ?? 0, scenario.resultUnit)}
                </div>
              </div>
            ))}
          </div>

          {/* Tornado */}
          <div className="mt-6">
            <div className="font-mono text-2xs uppercase tracking-widest text-fg-muted mb-2">
              Sensitivity tornado (±20% swing per input)
            </div>
            <Tornado rows={tornado} maxImpact={tornado[0]?.impact ?? 0} />
          </div>

          {!embedded && (
            <Callout tone="note" hideIcon className="mt-4">
              <span className="font-mono text-2xs uppercase tracking-wider text-fg-muted">
                Reading the tornado ·
              </span>{' '}
              Bars at top swing the answer most. In presentation, highlight the
              top 2 — those are the assumptions judges will challenge.
            </Callout>
          )}
        </div>
      </Card>
    </div>
  );
}

function Tornado({
  rows,
  maxImpact,
}: {
  rows: ReturnType<typeof sensitivityTornado>;
  maxImpact: number;
}) {
  if (maxImpact === 0) {
    return <div className="text-sm text-fg-muted">No variation — adjust sliders to see sensitivity.</div>;
  }
  return (
    <div className="grid gap-1.5">
      {rows.map((r) => (
        <div key={r.stepId} className="grid grid-cols-[1fr_auto] gap-3 items-center">
          <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
            <span className="text-xs text-fg truncate">{r.label}</span>
            <div className="relative h-3 bg-bg-panel rounded-sm overflow-hidden min-w-[160px] max-w-[320px] w-full">
              <div
                className="absolute inset-y-0 left-0 bg-accent"
                style={{ width: `${(r.impact / maxImpact) * 100}%` }}
              />
            </div>
          </div>
          <span className="font-numeric tabular-nums text-2xs text-fg-muted min-w-[3rem] text-right">
            {(r.impact * 100).toFixed(0)}%
          </span>
        </div>
      ))}
    </div>
  );
}

// ---------- formatting ----------

function formatValue(v: number, unit?: string, isPercent?: boolean): string {
  if (isPercent) return `${Math.round(v)}%`;
  return formatBigNumber(v, unit);
}

function formatBigNumber(v: number, unit?: string): string {
  const pre = unit === '$' ? '$' : '';
  const post = unit && unit !== '$' ? ` ${unit}` : '';
  const abs = Math.abs(v);
  if (abs >= 1e12) return `${pre}${(v / 1e12).toFixed(2)}T${post}`;
  if (abs >= 1e9) return `${pre}${(v / 1e9).toFixed(2)}B${post}`;
  if (abs >= 1e6) return `${pre}${(v / 1e6).toFixed(2)}M${post}`;
  if (abs >= 1e3) return `${pre}${(v / 1e3).toFixed(1)}K${post}`;
  return `${pre}${v.toFixed(unit === '$' ? 2 : 0)}${post}`;
}
