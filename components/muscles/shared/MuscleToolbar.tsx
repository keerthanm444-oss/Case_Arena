'use client';

import * as React from 'react';
import { Save, Lock } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StatusPill } from '@/components/display/status-pill';

/**
 * MuscleToolbar — the common header strip used by every muscle.
 *
 * Has: name input (if `name` controlled), save state pill, action slot.
 * Read-only mode shows a Lock label instead. Sets the consistent muscle UX
 * so users don't have to relearn the toolbar between tools.
 */

export interface MuscleToolbarProps {
  /** Optional name field — when omitted, no input is shown */
  name?: string;
  onNameChange?: (v: string) => void;
  namePlaceholder?: string;

  /** Dirty / saved indicator */
  dirty?: boolean;
  saved?: boolean;

  /** Right-side action area */
  actions?: React.ReactNode;

  /** When true, renders a read-only header instead of an editable one */
  readOnly?: boolean;
  readOnlyLabel?: string;

  /** Save handler — when provided, renders a Save button */
  onSave?: () => void;
  saveLabel?: string;

  /** Compact toolbar (used in embedded contexts) */
  compact?: boolean;

  className?: string;
}

export function MuscleToolbar({
  name,
  onNameChange,
  namePlaceholder,
  dirty,
  saved,
  actions,
  readOnly,
  readOnlyLabel,
  onSave,
  saveLabel = 'Save',
  compact,
  className,
}: MuscleToolbarProps) {
  if (readOnly) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 border border-line rounded-t-md bg-bg-panel',
          className,
        )}
      >
        <Lock size={11} className="text-fg-subtle" />
        <span className="font-mono text-2xs uppercase tracking-wider text-fg-muted">
          {readOnlyLabel ?? 'Read-only'}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 border border-line rounded-t-md bg-bg-panel',
        compact ? 'p-1.5' : 'p-2',
        className,
      )}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {name !== undefined && onNameChange && (
          <Input
            size="sm"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder={namePlaceholder}
            className="max-w-[280px]"
            aria-label="Name"
          />
        )}
        {dirty && <StatusPill tone="warning" size="xs">unsaved</StatusPill>}
        {!dirty && saved && <StatusPill tone="success" size="xs">saved</StatusPill>}
      </div>
      <div className="flex items-center gap-1">
        {actions}
        {onSave && (
          <Button variant="secondary" size="sm" onClick={onSave} leading={<Save size={12} />}>
            {saveLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
