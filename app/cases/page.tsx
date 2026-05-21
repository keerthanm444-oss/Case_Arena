import type { Metadata } from 'next';
import { Database, ExternalLink } from 'lucide-react';
import { SkeletonPage } from '@/components/skeleton/SkeletonPage';
import { EmptyState } from '@/components/display/empty-state';
import { Button } from '@/components/ui/button';
import { getAllCases } from '@/lib/content/cases';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cases',
  description: '100 real cases from HBS, Ivey, McKinsey, BCG, HULT, and more.',
};

export default function CasesIndexPage() {
  const cases = getAllCases();
  return (
    <SkeletonPage
      route="/cases"
      title="Case library"
      subtitle="Authored from approved sources only — HBS, Ivey, MIT Sloan, McKinsey, BCG, Bain, HULT Prize, CFA Research Challenge, and more. Every case carries a citation."
      poweredBy="System 7 · Organs + Tissue (cases)"
      upcoming={[
        'Sortable, filterable case table (industry, framework, difficulty, source, solved)',
        'Per-case page with toggleable assumptions, slider inputs, live recommendations',
        'Pre-seeded but editable issue trees',
        '"Related cases" rail driven by the case map graph',
        'Variant generator — spawn modified prompts from any case',
      ]}
    >
      <EmptyState
        icon={<Database />}
        eyebrow="Tissue passes pending"
        title={
          cases.length === 0
            ? 'No cases authored yet'
            : `${cases.length} cases authored`
        }
        description="The case library populates in batches of 10 across 10 industries, every case cited from an approved publisher. Until then, the case map and dashboard show graceful empty states."
        actions={
          <>
            <Button asChild variant="secondary" size="sm">
              <Link href="/map">View map</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/modules/case-library">
                See plan <ExternalLink size={12} />
              </Link>
            </Button>
          </>
        }
      />
    </SkeletonPage>
  );
}
