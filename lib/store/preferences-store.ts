/**
 * Preferences store — persisted to localStorage.
 *
 * Mirrors the inline bootstrap script in app/layout.tsx. When this store
 * mutates, the corresponding DOM attribute on <html> updates so the CSS
 * variables switch immediately — no full re-render needed.
 *
 * Keys (intentionally short, namespaced):
 *   ca:theme           terminal | boardroom | daylight
 *   ca:density         comfortable | compact | dense
 *   ca:reduce-motion   auto | on | off
 *   ca:keyboard-hints  '1' | '0'
 *   ca:timer-sounds    '1' | '0'
 *   ca:ai:provider     groq | google | openrouter
 *   ca:ai:key          (the actual key value)
 *   ca:ai:model        (optional override)
 */

'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ThemeId = 'terminal' | 'boardroom' | 'daylight';
export type Density = 'comfortable' | 'compact' | 'dense';
export type MotionPref = 'auto' | 'on' | 'off';
export type AIProvider = 'groq' | 'google' | 'openrouter';

interface AIConfig {
  provider: AIProvider;
  /** Stored client-side only. Never sent to any first-party server. */
  apiKey: string;
  model?: string;
}

interface PrefsState {
  theme: ThemeId;
  density: Density;
  reduceMotion: MotionPref;
  showKeyboardHints: boolean;
  timerSounds: boolean;
  ai: AIConfig | null;

  setTheme: (t: ThemeId) => void;
  setDensity: (d: Density) => void;
  setReduceMotion: (m: MotionPref) => void;
  setKeyboardHints: (v: boolean) => void;
  setTimerSounds: (v: boolean) => void;
  setAI: (cfg: AIConfig | null) => void;
}

/** Apply preferences to the DOM. Called by store subscribers + on hydrate. */
function applyToDOM(p: Pick<PrefsState, 'theme' | 'density' | 'reduceMotion'>) {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  html.setAttribute('data-theme', p.theme);
  html.setAttribute('data-density', p.density);
  if (p.reduceMotion === 'on' || p.reduceMotion === 'off') {
    html.setAttribute('data-reduce-motion', p.reduceMotion);
  } else {
    html.removeAttribute('data-reduce-motion');
  }
}

export const usePreferences = create<PrefsState>()(
  persist(
    (set) => ({
      theme: 'terminal',
      density: 'comfortable',
      reduceMotion: 'auto',
      showKeyboardHints: true,
      timerSounds: false,
      ai: null,

      setTheme: (theme) => {
        set({ theme });
        applyToDOM({ theme, density: usePreferences.getState().density, reduceMotion: usePreferences.getState().reduceMotion });
      },
      setDensity: (density) => {
        set({ density });
        applyToDOM({ theme: usePreferences.getState().theme, density, reduceMotion: usePreferences.getState().reduceMotion });
      },
      setReduceMotion: (reduceMotion) => {
        set({ reduceMotion });
        applyToDOM({ theme: usePreferences.getState().theme, density: usePreferences.getState().density, reduceMotion });
      },
      setKeyboardHints: (showKeyboardHints) => set({ showKeyboardHints }),
      setTimerSounds: (timerSounds) => set({ timerSounds }),
      setAI: (ai) => set({ ai }),
    }),
    {
      name: 'ca:preferences',
      storage: createJSONStorage(() => localStorage),
      // Apply DOM attributes whenever the store rehydrates (after navigation)
      onRehydrateStorage: () => (state) => {
        if (state) applyToDOM(state);
      },
      // Skip AI key if persisted from a stale partial — version migrations
      version: 1,
    },
  ),
);
