'use client';

import * as React from 'react';
import { ChevronRight, RotateCcw, Check, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Callout } from '@/components/display/callout';
import { KPITile } from '@/components/display/kpi-tile';
import { StatusPill } from '@/components/display/status-pill';
import { MuscleToolbar } from '@/components/muscles/shared/MuscleToolbar';
import { QUIZ_QUESTIONS, FRAMEWORK_LABELS } from './questions';
import type { FrameworkCategory } from '@/types';
import { useEmit } from '@/lib/event-bus';

/**
 * FrameworkQuiz — 10-question multi-choice from real cited prompts.
 *
 *   Each question shows 4 framework choices (correct + 3 random distractors)
 *   Pick one → reveal + rationale → next
 *   Summary at end: accuracy + per-framework accuracy
 */

const ALL_FRAMEWORKS: FrameworkCategory[] = [
  'profitability', 'market-entry', 'm-and-a', 'pricing',
  'operations', 'market-sizing', 'porters-five-forces',
  '3c', '4p', '7s', 'value-chain', 'pyramid-principle', 'mece',
];

function pickDistractors(correct: FrameworkCategory, n = 3): FrameworkCategory[] {
  const pool = ALL_FRAMEWORKS.filter((f) => f !== correct);
  const out: FrameworkCategory[] = [];
  while (out.length < n && pool.length) {
    const i = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(i, 1)[0]!);
  }
  return out;
}

function shuffle<T>(a: T[]): T[] {
  const copy = [...a];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

interface QuizAnswer {
  questionId: string;
  chosen: FrameworkCategory;
  correct: FrameworkCategory;
  isRight: boolean;
}

export function FrameworkQuiz() {
  const [idx, setIdx] = React.useState(0);
  const [answers, setAnswers] = React.useState<QuizAnswer[]>([]);
  const [chosen, setChosen] = React.useState<FrameworkCategory | null>(null);
  const emit = useEmit();

  // Generate a stable shuffled set + distractors per question per session
  const session = React.useMemo(() => {
    return QUIZ_QUESTIONS.map((q) => ({
      q,
      options: shuffle([q.answer, ...pickDistractors(q.answer)]),
    }));
  }, []);

  const current = session[idx];
  const done = idx >= session.length;
  const lastAnswer = answers[answers.length - 1];

  function commit(choice: FrameworkCategory) {
    if (!current || chosen) return;
    setChosen(choice);
    const isRight = choice === current.q.answer;
    setAnswers((a) => [
      ...a,
      { questionId: current.q.id, chosen: choice, correct: current.q.answer, isRight },
    ]);
  }

  function next() {
    setChosen(null);
    const nextIdx = idx + 1;
    setIdx(nextIdx);
    if (nextIdx >= session.length) {
      const correct = answers.filter((a) => a.isRight).length + (lastAnswer?.isRight ? 0 : 0);
      const score =
        (answers.filter((a) => a.isRight).length) / session.length;
      void emit('quiz.completed', { score, questions: session.length });
    }
  }

  function reset() {
    setIdx(0);
    setAnswers([]);
    setChosen(null);
  }

  const correctCount = answers.filter((a) => a.isRight).length;

  return (
    <div className="flex flex-col gap-3">
      <MuscleToolbar
        actions={
          <Button variant="ghost" size="sm" onClick={reset} leading={<RotateCcw size={12} />}>
            Restart
          </Button>
        }
      />

      <Card variant="panel" className="rounded-t-none border-t-0 -mt-3">
        <CardBody className="pt-4">
          {!done && current && (
            <div className="grid gap-5">
              {/* Progress strip */}
              <div className="flex items-center justify-between">
                <div className="font-mono text-2xs uppercase tracking-widest text-fg-muted">
                  Question {idx + 1} / {session.length}
                </div>
                <div className="flex items-center gap-1">
                  {session.map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        'h-1 w-6 rounded-pill',
                        i < idx
                          ? answers[i]?.isRight
                            ? 'bg-success'
                            : 'bg-danger'
                          : i === idx
                            ? 'bg-accent'
                            : 'bg-line',
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Prompt */}
              <div className="rounded-md border border-line bg-bg-elevated p-5">
                <div className="font-mono text-2xs uppercase tracking-widest text-fg-muted mb-2">
                  Prompt — {current.q.citation.publisher}
                  {current.q.citation.year && ` · ${current.q.citation.year}`}
                </div>
                <p className="text-md leading-relaxed text-fg">{current.q.prompt}</p>
              </div>

              {/* Choices */}
              <div className="grid sm:grid-cols-2 gap-2">
                {current.options.map((opt) => {
                  const isChosen = chosen === opt;
                  const isCorrect = opt === current.q.answer;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => commit(opt)}
                      disabled={!!chosen}
                      className={cn(
                        'group text-left p-3 rounded-md border-2 transition-colors duration-fast',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
                        !chosen && 'hover:border-accent hover:bg-bg-elevated',
                        chosen && isCorrect && 'border-success bg-success/10',
                        chosen && isChosen && !isCorrect && 'border-danger bg-danger/10',
                        chosen && !isChosen && !isCorrect && 'border-line bg-bg-panel opacity-60',
                        !chosen && 'border-line bg-bg-panel',
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {chosen && isCorrect && <Check size={14} className="text-success" />}
                        {chosen && isChosen && !isCorrect && <X size={14} className="text-danger" />}
                        <span className="text-sm text-fg">
                          {FRAMEWORK_LABELS[opt]}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Reveal */}
              {chosen && (
                <Callout
                  tone={chosen === current.q.answer ? 'success' : 'note'}
                  title={chosen === current.q.answer ? 'Correct' : `Recommended · ${FRAMEWORK_LABELS[current.q.answer]}`}
                >
                  {current.q.rationale}
                </Callout>
              )}

              {chosen && (
                <div className="flex justify-end">
                  <Button variant="primary" size="md" onClick={next}>
                    {idx === session.length - 1 ? 'Finish' : 'Next'}{' '}
                    <ChevronRight size={14} />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Summary */}
          {done && <QuizSummary answers={answers} total={session.length} onReset={reset} />}
        </CardBody>
      </Card>
    </div>
  );
}

function QuizSummary({
  answers,
  total,
  onReset,
}: {
  answers: QuizAnswer[];
  total: number;
  onReset: () => void;
}) {
  const correct = answers.filter((a) => a.isRight).length;
  const acc = total === 0 ? 0 : correct / total;
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-3 gap-2">
        <KPITile
          label="Accuracy"
          value={`${Math.round(acc * 100)}%`}
          sub={`${correct} of ${total}`}
          variant="accent"
          size="sm"
        />
        <KPITile label="Questions" value={total} size="sm" />
        <KPITile label="Missed" value={total - correct} size="sm" />
      </div>

      <div className="grid gap-1.5">
        {answers.map((a) => {
          const q = QUIZ_QUESTIONS.find((qq) => qq.id === a.questionId);
          if (!q) return null;
          return (
            <div
              key={a.questionId}
              className="grid grid-cols-[auto_1fr_auto] gap-3 items-center px-3 py-2 rounded-sm border border-line bg-bg-panel"
            >
              {a.isRight ? (
                <Check size={14} className="text-success" />
              ) : (
                <X size={14} className="text-danger" />
              )}
              <span className="text-sm text-fg truncate">
                {q.prompt.slice(0, 70)}…
              </span>
              <StatusPill tone={a.isRight ? 'success' : 'outline'} size="xs">
                {FRAMEWORK_LABELS[a.correct]}
              </StatusPill>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button variant="primary" size="md" onClick={onReset}>
          Take again
        </Button>
      </div>
    </div>
  );
}
