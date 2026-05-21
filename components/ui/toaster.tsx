'use client';

import * as React from 'react';
import * as RT from '@radix-ui/react-toast';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useUIStore } from '@/lib/store';

const TONE_ICON = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertCircle,
};

const TONE_COLOR = {
  info: 'text-info',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
};

/**
 * Toaster — mount once at the app root. Reads the toast queue from the
 * UI store and renders Radix Toasts for each. The UI store auto-dismisses
 * after 4s; the close button dismisses immediately.
 */
export function Toaster() {
  const toasts = useUIStore((s) => s.toasts);
  const dismiss = useUIStore((s) => s.dismissToast);

  return (
    <RT.Provider swipeDirection="right" duration={4000}>
      {toasts.map((t) => {
        const Icon = TONE_ICON[t.kind];
        return (
          <RT.Root
            key={t.id}
            open
            onOpenChange={(o) => !o && dismiss(t.id)}
            className={cn(
              'grid grid-cols-[auto_1fr_auto] items-start gap-3 p-3 pr-2',
              'rounded-md border border-line bg-bg-overlay backdrop-blur-md shadow-3',
              'data-[state=open]:animate-in data-[state=open]:slide-in-from-right',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out',
              'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]',
              'data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-transform',
            )}
          >
            <Icon size={16} className={cn('mt-0.5 shrink-0', TONE_COLOR[t.kind])} aria-hidden />
            <RT.Description className="text-sm text-fg leading-snug">
              {t.text}
            </RT.Description>
            <RT.Close
              className={cn(
                'shrink-0 rounded-sm p-1 text-fg-muted hover:text-fg hover:bg-bg-panel',
                'transition-colors duration-fast',
              )}
              aria-label="Dismiss"
            >
              <X size={14} />
            </RT.Close>
          </RT.Root>
        );
      })}
      <RT.Viewport
        className={cn(
          'fixed bottom-4 right-4 z-toast flex flex-col gap-2',
          'max-w-[420px] w-full max-w-[calc(100vw-2rem)]',
          'outline-none',
        )}
      />
    </RT.Provider>
  );
}
