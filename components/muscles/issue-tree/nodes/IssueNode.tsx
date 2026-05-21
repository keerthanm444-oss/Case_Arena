'use client';

import * as React from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { NODE_TONES, type NodeTone } from '@/lib/muscles/flow-config';

/**
 * IssueNode — custom React Flow node for the Issue Tree.
 *
 * Renders a tonal pill-shaped box with the label as an editable contenteditable
 * field. Inline + and 🗑 buttons appear on hover.
 *
 * The node communicates with the parent IssueTreeBuilder via custom data
 * handlers (data.onAddChild, data.onDelete, data.onLabelChange).
 */

export interface IssueNodeData {
  label: string;
  tone?: NodeTone;
  note?: string;
  isRoot?: boolean;
  readOnly?: boolean;
  /** Wired by parent — typed via React Flow's `data` channel */
  onAddChild?: (id: string) => void;
  onDelete?: (id: string) => void;
  onLabelChange?: (id: string, newLabel: string) => void;
}

export const IssueNode = React.memo(function IssueNode({
  id,
  data,
  selected,
}: NodeProps<IssueNodeData>) {
  const tone = NODE_TONES[data.tone ?? 'neutral'];
  const [editing, setEditing] = React.useState(false);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  function commit(value: string) {
    setEditing(false);
    if (value !== data.label) data.onLabelChange?.(id, value || 'Untitled');
  }

  React.useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  return (
    <div
      className={cn(
        'group relative rounded-md border-2 transition-colors duration-fast',
        'min-w-[180px] max-w-[280px]',
        selected ? 'shadow-3' : 'shadow-1',
      )}
      style={{
        background: tone.bg,
        borderColor: selected ? tone.accent : tone.border,
        color: tone.text,
      }}
      onDoubleClick={() => !data.readOnly && setEditing(true)}
    >
      {/* Left handle (incoming) — only on non-root nodes */}
      {!data.isRoot && (
        <Handle
          type="target"
          position={Position.Left}
          style={{
            background: tone.accent,
            border: 'none',
            width: 6,
            height: 6,
          }}
        />
      )}

      <div className="px-3 py-2">
        {editing ? (
          <textarea
            ref={inputRef}
            defaultValue={data.label}
            onBlur={(e) => commit(e.currentTarget.value.trim())}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                commit((e.target as HTMLTextAreaElement).value.trim());
              }
              if (e.key === 'Escape') {
                e.preventDefault();
                setEditing(false);
              }
            }}
            className={cn(
              'w-full bg-transparent resize-none outline-none',
              'text-sm leading-snug',
              'font-body',
            )}
            rows={Math.min(3, Math.ceil(data.label.length / 30) || 1)}
            aria-label="Edit node label"
          />
        ) : (
          <div className="text-sm leading-snug whitespace-pre-wrap break-words">
            {data.label}
          </div>
        )}
        {data.note && !editing && (
          <div className="text-2xs text-fg-subtle mt-1 italic">{data.note}</div>
        )}
      </div>

      {/* Right handle (outgoing) */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: tone.accent,
          border: 'none',
          width: 6,
          height: 6,
        }}
      />

      {/* Hover actions — add child, delete (root can't be deleted) */}
      {!data.readOnly && (
        <div
          className={cn(
            'absolute -right-2 top-1/2 -translate-y-1/2 translate-x-full',
            'flex flex-col gap-1 opacity-0 group-hover:opacity-100',
            'transition-opacity duration-fast',
          )}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              data.onAddChild?.(id);
            }}
            title="Add child (Tab)"
            className={cn(
              'w-5 h-5 grid place-items-center rounded-sm',
              'bg-bg-elevated border border-line text-fg-muted',
              'hover:text-accent hover:border-accent transition-colors duration-fast',
            )}
          >
            <Plus size={11} />
          </button>
          {!data.isRoot && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                data.onDelete?.(id);
              }}
              title="Delete node (⌫)"
              className={cn(
                'w-5 h-5 grid place-items-center rounded-sm',
                'bg-bg-elevated border border-line text-fg-muted',
                'hover:text-danger hover:border-danger transition-colors duration-fast',
              )}
            >
              <Trash2 size={11} />
            </button>
          )}
        </div>
      )}
    </div>
  );
});
