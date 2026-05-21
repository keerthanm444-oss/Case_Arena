/**
 * User state — what the app remembers across sessions. Stored entirely
 * client-side (Dexie + localStorage). No accounts, no server.
 *
 * This is the substrate for Level 3 statefulness: the dashboard, the case
 * recommendations, the weak-spot detection, and the "recently viewed" rail
 * all read from this state.
 */

export type ThemeId = 'terminal' | 'boardroom' | 'daylight';
export type Density = 'comfortable' | 'compact' | 'dense';

export interface UserPreferences {
  theme: ThemeId;
  density: Density;
  /** Respect prefers-reduced-motion, but user can override */
  reduceMotion: 'auto' | 'on' | 'off';
  /** Optional BYOK for the AI Case Partner — never sent to any server */
  aiPartner?: {
    provider: 'groq' | 'google' | 'openrouter';
    apiKeyLocalStorageKey: string; // we store the KEY's name, not the value here
    model?: string;
  };
  /** UI prefs */
  showKeyboardHints: boolean;
  caseTimerSounds: boolean;
}

export interface ModuleProgress {
  moduleSlug: string;
  /** Section ids marked understood */
  sectionsCompleted: string[];
  /** Notes the user took, keyed by section id */
  notes: Record<string, string>;
  /** Highlights, keyed by section id; each is a list of selected ranges */
  highlights: Record<string, Array<{ start: number; end: number; text: string }>>;
  lastVisitedAt: string;
}

export interface CaseProgress {
  caseSlug: string;
  /** Has the user opened the case page? */
  opened: boolean;
  /** Did they attempt the structure (interacted with issue tree)? */
  attempted: boolean;
  /** Did they mark it solved? */
  solved: boolean;
  /** Self-rated difficulty 1..5 */
  selfRating?: number;
  /** Time spent in seconds (across sessions) */
  timeSpentSeconds: number;
  /** Issue tree saves keyed by save id */
  treeSaveIds: string[];
  /** Free-text scratch pad */
  scratchPad?: string;
  lastVisitedAt: string;
}

export interface DrillResult {
  id: string;
  drillType: 'mental-math' | 'framework-quiz' | 'slide-critique';
  timestamp: string;
  /** Score in [0, 1] */
  score: number;
  /** Op-level results for granular weak-spot detection */
  details: Record<string, unknown>;
}

export interface UserState {
  preferences: UserPreferences;
  modules: Record<string, ModuleProgress>;
  cases: Record<string, CaseProgress>;
  drills: DrillResult[];
  /** Recently viewed items, capped at 20, in reverse chronological order */
  recentlyViewed: Array<{
    kind: 'module' | 'case' | 'framework' | 'tool';
    slug: string;
    visitedAt: string;
  }>;
  /** Custom user-forked frameworks */
  customFrameworkIds: string[];
}
