'use client';

import * as React from 'react';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { cn } from '@/lib/cn';
import { Card, CardBody } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MuscleToolbar } from '@/components/muscles/shared/MuscleToolbar';
import { KPITile } from '@/components/display/kpi-tile';
import { Callout } from '@/components/display/callout';
import { critique } from './rules';
import { useEmit } from '@/lib/event-bus';

/**
 * SlideCritique — paste a slide title, see rule-based feedback in real time.
 *
 * No LLM. Rule-based heuristics from canonical slide-craft references.
 * Each rule emits a result (passed / warning / suggestion) — visible live.
 * Emits `critique.run` events on every meaningful title change.
 */

const SAMPLES = [
  'Revenue fell 12% in Q3 driven by retail volume decline',
  'Our recommendation: enter Brazil via JV with local partner',
  'Synergy opportunities',
  'Trend analysis',
  'WE MIGHT WANT TO POSSIBLY CONSIDER LEVERAGING SCALABLE SYNERGIES',
];

export function SlideCritique() {
  const [title, setTitle] = React.useState('');
  const [debounced] = useDebounce(title, 250);
  const emit = useEmit();

  const result = React.useMemo(() => critique(debounced), [debounced]);

  React.useEffect(() => {
    if (!debounced.trim()) return;
    void emit('critique.run', {
      title: debounced.trim().slice(0, 80),
      passedChecks: result.passed,
      totalChecks: result.total,
    });
  }, [debounced, result.passed, result.total, emit]);

  return (
    <div className="flex flex-col gap-3">
      <MuscleToolbar />

      <Card variant="panel" className="rounded-t-none border-t-0 -mt-3">
        <CardBody className="pt-4 grid gap-5">
          <div>
            <label className="font-mono text-2xs uppercase tracking-widest text-fg-muted block mb-2">
              Slide title
            </label>
            <Input
              size="lg"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='Paste a slide title…  e.g. "Revenue fell 12% in Q3"'
              autoFocus
            />
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span className="font-mono text-2xs uppercase tracking-wider text-fg-subtle">
                Try:
              </span>
              {SAMPLES.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setTitle(s)}
                  className="text-xs text-fg-muted hover:text-accent hover:underline underline-offset-2 transition-colors duration-fast"
                >
                  "{s.slice(0, 40)}{s.length > 40 ? '…' : ''}"
                </button>
              ))}
            </div>
          </div>

          {debounced.trim() && (
            <>
              {/* Score */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <KPITile
                  label="Checks passed"
                  value={`${result.passed} / ${result.total}`}
                  variant={result.passed === result.total ? 'accent' : 'default'}
                  size="sm"
                />
                <KPITile
                  label="Warnings"
                  value={result.results.filter((r) => r.severity === 'warning').length}
                  size="sm"
                />
                <KPITile
                  label="Word count"
                  value={debounced.trim().split(/\s+/).length}
                  size="sm"
                />
              </div>

              {/* Rule list */}
              <div className="grid gap-1.5">
                {result.results.map((r) => (
                  <div
                    key={r.ruleId}
                    className={cn(
                      'flex items-start gap-3 px-3 py-2 rounded-md border',
                      r.severity === 'note' && 'border-success/30 bg-success/5',
                      r.severity === 'warning' && 'border-warning/30 bg-warning/5',
                      r.severity === 'error' && 'border-danger/30 bg-danger/5',
                    )}
                  >
                    {r.severity === 'note' && (
                      <CheckCircle2 size={14} className="text-success mt-0.5 shrink-0" />
                    )}
                    {r.severity === 'warning' && (
                      <AlertTriangle size={14} className="text-warning mt-0.5 shrink-0" />
                    )}
                    {r.severity === 'error' && (
                      <Info size={14} className="text-danger mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-fg">{r.message}</div>
                      {r.suggestion && (
                        <div className="text-xs text-fg-muted mt-1 italic">
                          {r.suggestion}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Callout tone="note" hideIcon>
                <span className="font-mono text-2xs uppercase tracking-wider text-fg-muted">
                  Why action titles ·
                </span>{' '}
                In a hostile boardroom you have one shot to land the point.
                A descriptive title ("Revenue trend") asks the reader to
                interpret; an action title ("Revenue fell 12%") delivers the
                answer first. See <code className="font-mono">Pyramid Principle (Minto)</code>.
              </Callout>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
