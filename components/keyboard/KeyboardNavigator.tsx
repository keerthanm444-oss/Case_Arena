'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/lib/store';
import { usePreferences, type ThemeId } from '@/lib/store/preferences-store';
import { useEmit } from '@/lib/event-bus';
import { KeyboardHints } from './KeyboardHints';

/**
 * KeyboardNavigator — global hotkey listener.
 *
 * Single-key shortcuts (when not focused in an input):
 *   ⌘K / Ctrl+K   → toggle command palette
 *   ?             → open keyboard hints dialog
 *   [             → toggle sidebar collapsed
 *   ESC           → close all overlays
 *
 * Chord shortcuts (press `g`, then a letter within 1.5s):
 *   g h  → /
 *   g m  → /modules
 *   g c  → /cases
 *   g x  → /map
 *   g t  → /tools
 *   g r  → /resources
 *   g d  → /dashboard
 *   g s  → /settings
 *
 * Theme cycle:
 *   t            → cycle Terminal → Boardroom → Daylight → Terminal
 */

const CHORD_TIMEOUT_MS = 1500;
const CHORDS: Record<string, string> = {
  h: '/',
  m: '/modules',
  c: '/cases',
  x: '/map',
  t: '/tools',
  r: '/resources',
  d: '/dashboard',
  s: '/settings',
};

function isEditable(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

export interface KeyboardNavigatorProps {
  onToggleSidebar: () => void;
}

export function KeyboardNavigator({ onToggleSidebar }: KeyboardNavigatorProps) {
  const router = useRouter();
  const togglePalette = useUIStore((s) => s.togglePalette);
  const closePalette = useUIStore((s) => s.closePalette);
  const closeAllToasts = useUIStore.getState; // unused but kept reference for future

  const theme = usePreferences((s) => s.theme);
  const setTheme = usePreferences((s) => s.setTheme);
  const emit = useEmit();

  const [hintsOpen, setHintsOpen] = React.useState(false);
  const chordPrefix = React.useRef<string | null>(null);
  const chordTimer = React.useRef<number | null>(null);

  React.useEffect(() => {
    function clearChord() {
      chordPrefix.current = null;
      if (chordTimer.current) {
        window.clearTimeout(chordTimer.current);
        chordTimer.current = null;
      }
    }

    function onKey(e: KeyboardEvent) {
      // Modifier-based: ⌘K / Ctrl+K
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        togglePalette();
        clearChord();
        return;
      }

      // Bail if user is typing
      if (isEditable(e.target)) {
        clearChord();
        return;
      }

      // Avoid intercepting when modifiers are held (except handled above)
      if (e.altKey || e.metaKey || e.ctrlKey) return;

      const key = e.key;

      // ESC — close everything
      if (key === 'Escape') {
        closePalette();
        setHintsOpen(false);
        clearChord();
        return;
      }

      // ? — open hints (Shift+/)
      if (key === '?') {
        e.preventDefault();
        setHintsOpen(true);
        clearChord();
        return;
      }

      // [ — toggle sidebar
      if (key === '[') {
        e.preventDefault();
        onToggleSidebar();
        clearChord();
        return;
      }

      // t — cycle theme (only if not in a chord)
      if (key === 't' && chordPrefix.current !== 'g') {
        e.preventDefault();
        const order: ThemeId[] = ['terminal', 'boardroom', 'daylight'];
        const idx = order.indexOf(theme);
        const next = order[(idx + 1) % order.length]!;
        setTheme(next);
        void emit('theme.changed', { theme: next });
        clearChord();
        return;
      }

      // Chord prefix
      if (key === 'g') {
        chordPrefix.current = 'g';
        if (chordTimer.current) window.clearTimeout(chordTimer.current);
        chordTimer.current = window.setTimeout(clearChord, CHORD_TIMEOUT_MS);
        return;
      }

      // Chord completion
      if (chordPrefix.current === 'g') {
        const path = CHORDS[key.toLowerCase()];
        if (path) {
          e.preventDefault();
          router.push(path);
        }
        clearChord();
      }
    }

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (chordTimer.current) window.clearTimeout(chordTimer.current);
    };
  }, [router, togglePalette, closePalette, onToggleSidebar, theme, setTheme, emit]);

  return <KeyboardHints open={hintsOpen} onOpenChange={setHintsOpen} />;
}
