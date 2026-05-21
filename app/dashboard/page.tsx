import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

/**
 * Dashboard route — reads Dexie via the muscle component.
 * Dynamic-imported because the dashboard uses useLiveQuery (client-only).
 */

const ProgressDashboard = dynamic(
  () =>
    import('@/components/muscles/dashboard/ProgressDashboard').then(
      (m) => m.ProgressDashboard,
    ),
  { ssr: false },
);

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Streaks, drill scores, recently viewed, recommended next step.',
};

export default function DashboardPage() {
  return <ProgressDashboard />;
}
