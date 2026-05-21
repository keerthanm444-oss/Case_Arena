'use client';

import * as React from 'react';
import { Play, RotateCcw, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Callout } from '@/components/display/callout';
import { KPITile } from '@/components/display/kpi-tile';
import { StatusPill } from '@/components/display/status-pill';
import { MuscleToolbar } from '@/components/muscles/shared/MuscleToolbar';
import {
  type DrillLevel,
  type DrillProblem,
  type DrillOp,
  type OpStats,
  generateProblem,
} from './problem-generator';
import { useEmit } from '@/lib/event-bus';

/**
 * MentalMathDrill — timed mental-math practice.
 *
 * Flow:
 *   - Pick a level + (optionally) constrain to one operation
 *   - Press Start → first problem appears + timer starts
 *   - Type the answer + Enter → mark correct/incorrect, advance
 *   - Session ends when user stops; summary panel shows per-op accuracy
 *
 * Emits `drill.completed` on every session end. Op-level breakdown lands
 * in the dashboard's skill heatmap via the drill-history reducer.
 */

const LEVELS: DrillLevel[] = ['easy', 'medium', 'hard', 'insane'];
const OP_LABELS: Record<DrillOp, string> = {
  mul: 'Multiplication',
  div: 'Division',
  pct: 'Percentages',
  addsub: 'Addition / subtraction',
  growth: 'Compound growth',
};
const OP_ORDER: DrillOp[] = ['mul', 'div', 'pct', 'addsub', 'growth'];

interface SessionResult {
  problem: DrillProblem;
  given: number | null;
  correct: boolean;
  timeSec: number;
}

export function MentalMathDrill() {
  const [level, setLevel] = React.useState<DrillLevel>('medium');
  const [opFilter, setOpFilter] = React.useState<DrillOp | 'all'>('all');
  const [sessionLength, setSessionLength] = React.useState(10);

  const [running, setRunning] = React.useState(false);
  const [current, setCurrent] = React.useState<DrillProblem | null>(null);
  const [results, setResults] = React.useState<SessionResult[]>([]);
  const [answer, setAnswer] = React.useState('');
  const startedAt = React.useRef<number>(0);
  const sessionStart = React.useRef<number>(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const emit = useEmit();

  function nextProblem() {
    const p = generateProblem(level, opFilter === 'all' ? undefined : opFilter);
    setCurrent(p);
    setAnswer('');
    startedAt.current = Date.now();
    setTimeout(() => inputRef.current?.focus(), 30);
  }

  function startSession() {
    setResults([]);
    sessionStart.current = Date.now();
    setRunning(true);
    nextProblem();
  }

  function endSession() {
    setRunning(false);
    const totalSec = (Date.now() - sessionStart.current) / 1000;
    const correct = results.filter((r) => r.correct).length;
    const score = results.length === 0 ? 0 : correct / results.length;
    void emit('drill.completed', {
      drillId: `mm-${Date.now()}`,
      score,
      durationSec: Math.round(totalSec),
    });
  }

  function submitAnswer() {
    if (!current) return;
    const given = parseFloat(answer.replace(/[, ]/g, ''));
    if (Number.isNaN(given)) return;
    const correct = Math.abs(given - current.answer) <= current.tolerance;
    const timeSec = (Date.now() - startedAt.current) / 1000;
    const nextResults = [...results, { problem: current, given, correct, timeSec }];
    setResults(nextResults);
    if (nextResults.length >= sessionLength) {
      // Auto-end
      setRunning(false);
      const score = nextResults.filter((r) => r.correct).length / nextResults.length;
      void emit('drill.completed', {
        drillId: `mm-${Date.now()}`,
        score,
        durationSec: Math.round((Date.now() - sessionStart.current) / 1000),
      });
    } else {
      nextProblem();
    }
  }

  function reset() {
    setRunning(false);
    setCurrent(null);
    setResults([]);
    setAnswer('');
  }

  const opStats = React.useMemo(() => buildOpStats(results), [results]);
  const correct = results.filter((r) => r.correct).length;
  const elapsed = running
    ? Math.floor((Date.now() - sessionStart.current) / 1000)
    : 0;

  return (
    <div className="flex flex-col gap-3">
      <MuscleToolbar
        actions={
          running ? (
            <Button variant="ghost" size="sm" onClick={endSession}>
              End session
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={reset} leading={<RotateCcw size={12} />}>
              Reset
            </Button>
          )
        }
      />

      <Card variant="panel" className="rounded-t-none border-t-0 -mt-3">
        <CardBody className="pt-4">
          {/* Settings + Start (only when not running and no results yet) */}
          {!running && results.length === 0 && (
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="font-mono text-2xs uppercase tracking-widest text-fg-muted block mb-2">
                  Level
                </label>
                <div className="flex gap-1 flex-wrap">
                  {LEVELS.map((l) => (
                    <Button
                      key={l}
                      variant={level === l ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setLevel(l)}
                    >
                      {l}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="font-mono text-2xs uppercase tracking-widest text-fg-muted block mb-2">
                  Operation
                </label>
                <select
                  value={opFilter}
                  onChange={(e) => setOpFilter(e.target.value as DrillOp | 'all')}
                  className="h-9 px-3 w-full rounded-md border border-line bg-bg-elevated text-fg text-sm"
                >
                  <option value="all">All operations</option>
                  {OP_ORDER.map((op) => (
                    <option key={op} value={op}>{OP_LABELS[op]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-mono text-2xs uppercase tracking-widest text-fg-muted block mb-2">
                  Session length
                </label>
                <Input
                  type="number"
                  value={sessionLength}
                  onChange={(e) => setSessionLength(parseInt(e.target.value || '10') || 10)}
                  min={5}
                  max={50}
                />
              </div>
              <div className="md:col-span-3 flex justify-end mt-2">
                <Button variant="primary" size="lg" onClick={startSession} leading={<Play size={14} />}>
                  Start · {sessionLength} problems
                </Button>
              </div>
            </div>
          )}

          {/* Live drill */}
          {running && current && (
            <div className="grid gap-4">
              {/* Status band */}
              <div className="grid grid-cols-3 gap-2">
                <KPITile label="Problem" value={`${results.length + 1} / ${sessionLength}`} size="sm" />
                <KPITile label="Correct" value={`${correct} / ${results.length}`} size="sm" />
                <KPITile label="Elapsed" value={`${elapsed}s`} size="sm" />
              </div>

              {/* The problem */}
              <div
                className={cn(
                  'rounded-md border border-accent-soft bg-accent-soft',
                  'p-6 text-center',
                )}
              >
                <div className="font-mono text-2xs uppercase tracking-widest text-fg-muted mb-2">
                  {OP_LABELS[current.op]} · target {current.targetSec}s
                </div>
                <div
                  className="font-display text-fg leading-none mb-4"
                  style={{ fontSize: '3rem', fontVariationSettings: "'opsz' 96, 'SOFT' 0" }}
                >
                  {current.prompt}
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitAnswer();
                  }}
                  className="flex items-center justify-center gap-2"
                >
                  <Input
                    ref={inputRef}
                    size="lg"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Your answer"
                    className="max-w-[200px] text-center font-numeric tabular-nums text-lg"
                    inputMode="decimal"
                    autoFocus
                  />
                  <Button type="submit" variant="primary" size="lg">
                    Submit <ChevronRight size={14} />
                  </Button>
                </form>
              </div>

              {/* Last few results */}
              {results.length > 0 && (
                <div className="grid gap-1">
                  {results.slice(-3).reverse().map((r, i) => (
                    <ResultRow key={r.problem.id + i} r={r} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Summary */}
          {!running && results.length > 0 && (
            <SessionSummary
              results={results}
              opStats={opStats}
              onRestart={startSession}
              onReset={reset}
            />
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function ResultRow({ r }: { r: SessionResult }) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 px-3 py-1.5 rounded-sm',
        'border border-line bg-bg-elevated',
        'text-sm',
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <StatusPill tone={r.correct ? 'success' : 'danger'} size="xs">
          {r.correct ? '✓' : '✗'}
        </StatusPill>
        <span className="text-fg truncate font-numeric">{r.problem.prompt}</span>
        <span className="text-fg-subtle">=</span>
        <span className="text-fg-muted font-numeric tabular-nums">
          {r.given ?? '—'}
          {!r.correct && (
            <span className="text-fg-subtle"> (was {r.problem.answer.toLocaleString()})</span>
          )}
        </span>
      </div>
      <span className="font-mono text-2xs text-fg-subtle tabular-nums shrink-0">
        {r.timeSec.toFixed(1)}s
      </span>
    </div>
  );
}

function SessionSummary({
  results,
  opStats,
  onRestart,
  onReset,
}: {
  results: SessionResult[];
  opStats: OpStats[];
  onRestart: () => void;
  onReset: () => void;
}) {
  const correct = results.filter((r) => r.correct).length;
  const accuracy = results.length === 0 ? 0 : correct / results.length;
  const avgTime = results.reduce((a, r) => a + r.timeSec, 0) / Math.max(1, results.length);

  const weakest = [...opStats]
    .filter((s) => s.attempts > 0)
    .sort((a, b) => a.correct / a.attempts - b.correct / b.attempts)[0];

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-3 gap-2">
        <KPITile
          label="Accuracy"
          value={`${Math.round(accuracy * 100)}%`}
          sub={`${correct} of ${results.length}`}
          variant="accent"
          size="sm"
        />
        <KPITile label="Avg time" value={`${avgTime.toFixed(1)}s`} size="sm" />
        <KPITile
          label="Weakest op"
          value={weakest ? OP_LABELS[weakest.op].split(' ')[0]! : '—'}
          sub={weakest ? `${Math.round((weakest.correct / weakest.attempts) * 100)}% correct` : ''}
          size="sm"
        />
      </div>

      <Card variant="panel">
        <CardHeader>
          <CardTitle>By operation</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 grid gap-1.5">
          {opStats.map((s) => {
            if (s.attempts === 0) return null;
            const acc = s.correct / s.attempts;
            return (
              <div key={s.op} className="grid grid-cols-[1fr_auto_auto] gap-3 items-center">
                <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                  <span className="text-sm text-fg">{OP_LABELS[s.op]}</span>
                  <div className="relative h-2 bg-bg-elevated rounded-sm overflow-hidden min-w-[120px] max-w-[240px] w-full">
                    <div
                      className={cn(
                        'absolute inset-y-0 left-0',
                        acc >= 0.8 ? 'bg-success' : acc >= 0.5 ? 'bg-warning' : 'bg-danger',
                      )}
                      style={{ width: `${acc * 100}%` }}
                    />
                  </div>
                </div>
                <span className="font-mono text-2xs text-fg-muted tabular-nums">
                  {Math.round(acc * 100)}%
                </span>
                <span className="font-mono text-2xs text-fg-subtle tabular-nums">
                  {s.avgTimeSec.toFixed(1)}s
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      <Callout tone="tip" title="Tip">
        Weak ops are your highest-leverage practice. Re-run drill with that
        operation filtered to drill it specifically.
      </Callout>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onReset}>
          New settings
        </Button>
        <Button variant="primary" size="sm" onClick={onRestart}>
          Run again
        </Button>
      </div>
    </div>
  );
}

function buildOpStats(results: SessionResult[]): OpStats[] {
  const map = new Map<DrillOp, OpStats>();
  for (const r of results) {
    const op = r.problem.op;
    const cur = map.get(op) ?? { op, attempts: 0, correct: 0, avgTimeSec: 0 };
    cur.attempts += 1;
    if (r.correct) cur.correct += 1;
    cur.avgTimeSec = (cur.avgTimeSec * (cur.attempts - 1) + r.timeSec) / cur.attempts;
    map.set(op, cur);
  }
  return OP_ORDER.map(
    (op) => map.get(op) ?? { op, attempts: 0, correct: 0, avgTimeSec: 0 },
  );
}
