'use client';

import * as React from 'react';
import { useDebounce } from 'use-debounce';
import { Save, FileText, Eraser } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { autoSave, listSaves, readSave } from '@/lib/muscles/save-helpers';
import { useEmit } from '@/lib/event-bus';

/**
 * <ScratchPad slug="case-electrolight" /> — a per-page notes textarea.
 *
 * Persists to Dexie's `saves` table with kind='scratch'. Loads existing
 * content on mount; auto-saves on idle (1.5s after typing stops).
 *
 * The slug should be unique per page. Typically `case-{slug}` or
 * `module-{slug}`.
 */

export interface ScratchPadProps {
  slug: string;
  /** Optional heading */
  title?: string;
  /** Placeholder when empty */
  placeholder?: string;
  /** Initial height in rows */
  rows?: number;
}

export function ScratchPad({
  slug,
  title = 'Scratch pad',
  placeholder = 'Take notes as you work through the case…',
  rows = 6,
}: ScratchPadProps) {
  const [text, setText] = React.useState('');
  const [debouncedText] = useDebounce(text, 1500);
  const [saveId, setSaveId] = React.useState<string | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const [savingState, setSavingState] = React.useState<'idle' | 'saving' | 'saved'>('idle');
  const emit = useEmit();

  // Load existing on mount
  React.useEffect(() => {
    void (async () => {
      try {
        const rows = await listSaves('scratch', slug);
        const existing = rows[0];
        if (existing) {
          const full = await readSave<string>(existing.id);
          if (full && typeof full.payload === 'string') {
            setText(full.payload);
            setSaveId(existing.id);
          }
        }
      } catch {
        // ignore
      } finally {
        setMounted(true);
      }
    })();
  }, [slug]);

  // Persist on debounced change
  React.useEffect(() => {
    if (!mounted) return;
    void (async () => {
      try {
        setSavingState('saving');
        const id = await autoSave(saveId, 'scratch', {
          name: `Scratch · ${slug}`,
          contextRef: slug,
          data: debouncedText,
        });
        setSaveId(id);
        setSavingState('saved');
        void emit('case.note.added', { caseSlug: slug, charCount: debouncedText.length });
      } catch {
        setSavingState('idle');
      }
    })();
  }, [debouncedText, mounted]); // eslint-disable-line react-hooks/exhaustive-deps

  function clear() {
    if (!confirm('Clear all notes for this page?')) return;
    setText('');
  }

  return (
    <Card variant="panel">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <FileText size={14} className="text-fg-muted" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-2 text-2xs font-mono uppercase tracking-wider text-fg-subtle">
            {savingState === 'saving' && <span>saving…</span>}
            {savingState === 'saved' && (
              <span className="text-success flex items-center gap-1">
                <Save size={11} /> saved
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <div className="px-4 pb-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={cn(
            'w-full bg-bg-elevated text-fg rounded-md border border-line',
            'placeholder:text-fg-subtle',
            'font-body text-sm leading-relaxed',
            'p-3 resize-vertical',
            'transition-colors duration-fast',
            'focus-visible:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
          )}
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="font-mono text-2xs text-fg-subtle">
            {text.length} chars · auto-saves locally
          </span>
          <Button
            variant="ghost"
            size="xs"
            onClick={clear}
            disabled={!text}
            leading={<Eraser size={10} />}
          >
            Clear
          </Button>
        </div>
      </div>
    </Card>
  );
}
