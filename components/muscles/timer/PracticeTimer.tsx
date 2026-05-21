'use client';

import * as React from 'react';
import { Play, Pause, SkipForward, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { MuscleToolbar } from '@/components/muscles/shared/MuscleToolbar';
import { KPITile } from '@/components/display/kpi-tile';
import { StatusPill } from '@/components/display/status-pill';
import { usePreferences } from '@/lib/store/preferences-store';
import { useEmit } from '@/lib/event-bus';

/**
 * PracticeTimer — phase-based countdown.
 *
 * Default phases mirror the canonical case-interview pacing:
 *   Read (60s) → Structure (90s) → Analyze (240s) → Recommend (60s)
 *
 * Configurable; user can edit phase lengths. Audio cues at phase boundaries
 * via the Web Audio API (gated by prefs.timerSounds).
 */

interface Phase {
  id: string;
  label: string;
  /** Duration in seconds */
  seconds: number;
}

const DEFAULT_PHASES: Phase[] = [
  { id: 'read', label: 'Read', seconds: 60 },
  { id: 'structure', label: 'Structure', seconds: 90 },
  { id: 'analyze', label: 'Analyze', seconds: 240 },
  { id: 'recommend', label: 'Recommend', seconds: 60 },
];

export function PracticeTimer() {
  const [phases, setPhases] = React.useState<Phase[]>(DEFAULT_PHASES);
  const [idx, setIdx] = React.useState(0);
  const [secondsLeft, setSecondsLeft] = React.useState(DEFAULT_PHASES[0]!.seconds);
  const [running, setRunning] = React.useState(false);
  const audioCtx = React.useRef<AudioContext | null>(null);
  const prefSounds = usePreferences((s) => s.timerSounds);
  const setPrefSounds = usePreferences((s) => s.setTimerSounds);
  const emit = useEmit();

  const phase = phases[idx];
  const totalSec = phases.reduce((acc, p) => acc + p.seconds, 0);
  const elapsedTotal =
    phases.slice(0, idx).reduce((acc, p) => acc + p.seconds, 0) +
    ((phase?.seconds ?? 0) - secondsLeft);

  // Tick
  React.useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          beep();
          // Advance phase or finish
          setIdx((i) => {
            if (i + 1 >= phases.length) {
              setRunning(false);
              void emit('timer.session.completed', {
                totalSec,
                phases: phases.length,
              });
              return i;
            }
            return i + 1;
          });
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, idx, phases.length]);

  // When phase changes mid-run, reset secondsLeft to new phase's full length
  React.useEffect(() => {
    if (running && phase) setSecondsLeft(phase.seconds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  function start() {
    setRunning(true);
  }
  function pause() {
    setRunning(false);
  }
  function skip() {
    if (!phase) return;
    if (idx + 1 >= phases.length) {
      setRunning(false);
      setSecondsLeft(0);
      return;
    }
    setIdx(idx + 1);
  }
  function reset() {
    setRunning(false);
    setIdx(0);
    setSecondsLeft(phases[0]!.seconds);
  }

  function beep() {
    if (!prefSounds) return;
    try {
      if (!audioCtx.current) {
        const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtx.current = new Ctx();
      }
      const ctx = audioCtx.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 700;
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.02);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.32);
    } catch {
      // ignore
    }
  }

  function updatePhase(id: string, seconds: number) {
    setPhases((arr) =>
      arr.map((p) => (p.id === id ? { ...p, seconds: Math.max(5, seconds) } : p)),
    );
  }

  const pct = phase ? ((phase.seconds - secondsLeft) / phase.seconds) * 100 : 0;
  const totalPct = (elapsedTotal / Math.max(1, totalSec)) * 100;

  return (
    <div className="flex flex-col gap-3">
      <MuscleToolbar
        actions={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPrefSounds(!prefSounds)}
              leading={prefSounds ? <Volume2 size={12} /> : <VolumeX size={12} />}
            >
              {prefSounds ? 'Sound on' : 'Sound off'}
            </Button>
            <Button variant="ghost" size="sm" onClick={reset} leading={<RotateCcw size={12} />}>
              Reset
            </Button>
          </>
        }
      />

      <Card variant="panel" className="rounded-t-none border-t-0 -mt-3">
        <CardBody className="pt-5">
          {/* Big timer */}
          <div className="text-center mb-6">
            <div className="font-mono text-2xs uppercase tracking-widest text-fg-muted mb-1">
              {phase ? phase.label : '—'}
              {phase && (
                <StatusPill tone="outline" size="xs" className="ml-2">
                  {idx + 1} / {phases.length}
                </StatusPill>
              )}
            </div>
            <div
              className="font-numeric tabular-nums text-fg leading-none mb-3"
              style={{ fontSize: '4.5rem' }}
            >
              {fmtTime(secondsLeft)}
            </div>
            <Progress value={pct} className="max-w-md mx-auto" />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {!running ? (
              <Button variant="primary" size="lg" onClick={start} leading={<Play size={14} />}>
                {idx === 0 && secondsLeft === phases[0]!.seconds ? 'Start' : 'Resume'}
              </Button>
            ) : (
              <Button variant="secondary" size="lg" onClick={pause} leading={<Pause size={14} />}>
                Pause
              </Button>
            )}
            <Button variant="ghost" size="lg" onClick={skip} leading={<SkipForward size={14} />}>
              Skip
            </Button>
          </div>

          {/* Total progress + per-phase config */}
          <div className="border-t border-line pt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-2xs uppercase tracking-widest text-fg-muted">
                Total · {fmtTime(elapsedTotal)} / {fmtTime(totalSec)}
              </span>
              <span className="font-mono text-2xs text-fg-subtle tabular-nums">
                {Math.round(totalPct)}%
              </span>
            </div>
            <Progress value={totalPct} tone="success" className="mb-5" />

            <div className="grid gap-2">
              <div className="font-mono text-2xs uppercase tracking-widest text-fg-muted">
                Phases (edit to customize)
              </div>
              {phases.map((p, i) => (
                <div
                  key={p.id}
                  className={cn(
                    'grid grid-cols-[1fr_auto_auto] gap-2 items-center px-3 py-1.5 rounded-sm border',
                    i === idx ? 'border-accent-soft bg-accent-soft' : 'border-line bg-bg-elevated',
                  )}
                >
                  <span className="text-sm text-fg">{p.label}</span>
                  <Input
                    size="sm"
                    type="number"
                    value={p.seconds}
                    onChange={(e) => updatePhase(p.id, parseInt(e.target.value || '0') || 0)}
                    className="w-20 text-right font-numeric"
                    min={5}
                    disabled={running}
                  />
                  <span className="font-mono text-2xs text-fg-subtle">sec</span>
                </div>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function fmtTime(s: number): string {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}
