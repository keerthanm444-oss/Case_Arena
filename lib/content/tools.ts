/**
 * Tools (muscles) registry.
 *
 * The full set of interactive tools the app exposes. The tools index page
 * (/tools) renders this list. Each tool's actual implementation arrives in
 * System 6 — Muscles.
 */

export type ToolSlug =
  | 'issue-tree'
  | 'mind-map'
  | 'decision-tree'
  | 'sizing'
  | 'mental-math'
  | 'framework-quiz'
  | 'slide-critique'
  | 'timer'
  | 'ai-partner';

export interface ToolEntry {
  slug: ToolSlug;
  name: string;
  tagline: string;
  /** Build system that owns this tool */
  arrives: 'System 6a' | 'System 6b';
  /** Whether this tool requires anything optional (e.g. a BYO key) */
  requires?: string;
}

export const TOOLS: ReadonlyArray<ToolEntry> = [
  {
    slug: 'issue-tree',
    name: 'Issue Tree Builder',
    tagline: 'Drag-to-expand structuring canvas; save, export, scaffold from prompt',
    arrives: 'System 6a',
  },
  {
    slug: 'mind-map',
    name: 'Framework Mind Map',
    tagline: 'Editable radial map per framework; fork your own variants',
    arrives: 'System 6a',
  },
  {
    slug: 'decision-tree',
    name: 'Decision Tree',
    tagline: 'Probability + payoff sliders, live EV, sensitivity tornado',
    arrives: 'System 6a',
  },
  {
    slug: 'sizing',
    name: 'Market Sizing Calculator',
    tagline: 'Every assumption a slider; named scenarios; sensitivity charts',
    arrives: 'System 6b',
  },
  {
    slug: 'mental-math',
    name: 'Mental Math Drill',
    tagline: 'Timed, leveled, streak-tracked; surfaces weak operations',
    arrives: 'System 6b',
  },
  {
    slug: 'framework-quiz',
    name: 'Framework Selector Quiz',
    tagline: 'Real prompts from cited cases; build personal accuracy stats',
    arrives: 'System 6b',
  },
  {
    slug: 'slide-critique',
    name: 'Slide Title Critique',
    tagline: 'Rule-based checks: action title, quantification, parallel structure',
    arrives: 'System 6b',
  },
  {
    slug: 'timer',
    name: 'Practice Timer',
    tagline: 'Phase pacing (read → structure → analyze → recommend)',
    arrives: 'System 6b',
  },
  {
    slug: 'ai-partner',
    name: 'AI Case Partner',
    tagline: 'Socratic partner for live practice — fully optional',
    arrives: 'System 6b',
    requires: 'Your own free-tier API key (Groq / Google AI Studio / OpenRouter)',
  },
];

export function getToolBySlug(slug: string): ToolEntry | null {
  return TOOLS.find((t) => t.slug === slug) ?? null;
}

export function getAllToolSlugs(): ToolSlug[] {
  return TOOLS.map((t) => t.slug);
}
