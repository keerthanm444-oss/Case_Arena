'use client';

import dynamic from 'next/dynamic';
import type { ToolSlug } from '@/lib/content/tools';

/**
 * MuscleSwitcher — given a tool slug, renders the correct muscle.
 *
 * Each muscle is dynamic-imported with ssr:false. React Flow, html-to-image,
 * the audio API, etc. — none of these can run on the server.
 */

const IssueTreeBuilder = dynamic(
  () => import('./issue-tree/IssueTreeBuilder').then((m) => m.IssueTreeBuilder),
  { ssr: false, loading: () => <MuscleLoading name="Issue Tree Builder" /> },
);
const FrameworkMindMap = dynamic(
  () => import('./mind-map/FrameworkMindMap').then((m) => m.FrameworkMindMap),
  { ssr: false, loading: () => <MuscleLoading name="Framework Mind Map" /> },
);
const DecisionTree = dynamic(
  () => import('./decision-tree/DecisionTree').then((m) => m.DecisionTree),
  { ssr: false, loading: () => <MuscleLoading name="Decision Tree" /> },
);
const SizingCalculator = dynamic(
  () => import('./sizing/SizingCalculator').then((m) => m.SizingCalculator),
  { ssr: false, loading: () => <MuscleLoading name="Market Sizing Calculator" /> },
);
const MentalMathDrill = dynamic(
  () => import('./drill/MentalMathDrill').then((m) => m.MentalMathDrill),
  { ssr: false, loading: () => <MuscleLoading name="Mental Math Drill" /> },
);
const FrameworkQuiz = dynamic(
  () => import('./quiz/FrameworkQuiz').then((m) => m.FrameworkQuiz),
  { ssr: false, loading: () => <MuscleLoading name="Framework Quiz" /> },
);
const SlideCritique = dynamic(
  () => import('./critique/SlideCritique').then((m) => m.SlideCritique),
  { ssr: false, loading: () => <MuscleLoading name="Slide Critique" /> },
);
const PracticeTimer = dynamic(
  () => import('./timer/PracticeTimer').then((m) => m.PracticeTimer),
  { ssr: false, loading: () => <MuscleLoading name="Practice Timer" /> },
);
const AICasePartner = dynamic(
  () => import('./ai-partner/AICasePartner').then((m) => m.AICasePartner),
  { ssr: false, loading: () => <MuscleLoading name="AI Case Partner" /> },
);

export function MuscleSwitcher({ slug }: { slug: ToolSlug }) {
  switch (slug) {
    case 'issue-tree':       return <IssueTreeBuilder />;
    case 'mind-map':         return <FrameworkMindMap />;
    case 'decision-tree':    return <DecisionTree />;
    case 'sizing':           return <SizingCalculator />;
    case 'mental-math':      return <MentalMathDrill />;
    case 'framework-quiz':   return <FrameworkQuiz />;
    case 'slide-critique':   return <SlideCritique />;
    case 'timer':            return <PracticeTimer />;
    case 'ai-partner':       return <AICasePartner />;
  }
}

function MuscleLoading({ name }: { name: string }) {
  return (
    <div
      className="grid place-items-center h-[50vh] border border-line rounded-md bg-bg-panel"
      role="status"
      aria-live="polite"
    >
      <div className="text-center">
        <div className="font-mono text-2xs uppercase tracking-widest text-fg-muted mb-2">
          Loading
        </div>
        <div className="font-display text-md text-fg">{name}</div>
      </div>
    </div>
  );
}
