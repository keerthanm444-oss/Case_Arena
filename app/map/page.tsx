import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { getMapGraph } from '@/lib/content/map-builder';

/**
 * /map — full-screen Case Map. Read graph at build time, render shell client-side.
 */

const MapShell = dynamic(
  () => import('@/components/map/MapShell').then((m) => m.MapShell),
  { ssr: false },
);

export const metadata: Metadata = {
  title: 'Case Map',
  description: 'Web · Branch · Matrix views over the case library, with comparison + saved views.',
};

export default function MapPage() {
  const graph = getMapGraph();
  return <MapShell graph={graph} />;
}
