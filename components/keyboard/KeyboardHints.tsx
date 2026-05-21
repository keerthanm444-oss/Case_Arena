'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
} from '@/components/ui/dialog';
import { Kbd } from '@/components/ui/kbd';

/**
 * KeyboardHints — a dialog listing all shortcuts.
 *
 * Opens via `?` (KeyboardNavigator). Grouped by purpose.
 */

const GROUPS: Array<{
  label: string;
  rows: Array<{ keys: string[]; description: string }>;
}> = [
  {
    label: 'Global',
    rows: [
      { keys: ['⌘ K'], description: 'Open command palette' },
      { keys: ['?'], description: 'Open this dialog' },
      { keys: ['['], description: 'Toggle sidebar' },
      { keys: ['t'], description: 'Cycle theme (Terminal → Boardroom → Daylight)' },
      { keys: ['ESC'], description: 'Close any open overlay' },
    ],
  },
  {
    label: 'Navigation (chords)',
    rows: [
      { keys: ['g', 'h'], description: 'Home' },
      { keys: ['g', 'm'], description: 'Modules' },
      { keys: ['g', 'c'], description: 'Cases' },
      { keys: ['g', 'x'], description: 'Case map' },
      { keys: ['g', 't'], description: 'Tools' },
      { keys: ['g', 'r'], description: 'Resources' },
      { keys: ['g', 'd'], description: 'Dashboard' },
      { keys: ['g', 's'], description: 'Settings' },
    ],
  },
  {
    label: 'Command palette',
    rows: [
      { keys: ['↑', '↓'], description: 'Move selection' },
      { keys: ['↵'], description: 'Execute' },
      { keys: ['ESC'], description: 'Close' },
    ],
  },
];

export function KeyboardHints({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent side="center" className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>
            Press <Kbd>?</Kbd> anywhere outside an input to bring this up.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="grid gap-6">
          {GROUPS.map((g) => (
            <section key={g.label}>
              <div className="font-mono text-2xs uppercase tracking-widest text-fg-muted mb-2">
                {g.label}
              </div>
              <ul className="grid gap-1">
                {g.rows.map((row, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-3 py-1.5 px-2 rounded-sm hover:bg-bg-panel transition-colors duration-fast"
                  >
                    <span className="text-sm text-fg">{row.description}</span>
                    <span className="flex items-center gap-1">
                      {row.keys.map((k, j) => (
                        <React.Fragment key={j}>
                          {j > 0 && (
                            <span className="text-fg-subtle text-2xs">then</span>
                          )}
                          <Kbd combo={k.length > 1}>{k}</Kbd>
                        </React.Fragment>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
