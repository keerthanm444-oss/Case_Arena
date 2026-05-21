import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllCaseSlugs, getCaseBySlug, getCaseFull, getCaseBody } from '@/lib/content/cases';
import { MODULE_SPINE } from '@/lib/content/modules'; // ensure modules registry is in graph
import { CaseRenderer } from '@/components/mdx/CaseRenderer';
import { MDXContent } from '@/components/mdx/MDXContent';
import { Container, PageHeader } from '@/components/layout';
import { Callout } from '@/components/display/callout';
import { StatusPill } from '@/components/display/status-pill';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  // generateStaticParams must return at least one item even when the case
  // library is empty — Next.js requires it for `output: 'export'`.
  const slugs = getAllCaseSlugs();
  if (slugs.length === 0) {
    // Use 'demo' as a placeholder; rendered as the "not yet authored" stub.
    return [{ slug: 'demo' }];
  }
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const c = getCaseBySlug(slug);
  if (!c) return { title: 'Case not found' };
  return { title: c.title, description: `${c.industry} · ${c.difficulty}` };
}

export default async function CasePage({ params }: PageProps) {
  const { slug } = await params;
  void MODULE_SPINE.length; // keep modules registry referenced
  const full = getCaseFull(slug);
  const body = await getCaseBody(slug);

  if (!full) {
    // No MDX authored — show graceful stub
    return (
      <div className="py-10">
        <Container width="lg">
          <PageHeader
            eyebrow={<StatusPill tone="warning">Stub</StatusPill>}
            title={slug}
            description="Case not yet authored. The page shell + scratch pad still work."
          />
          <Callout tone="note" hideIcon>
            Add <code>content/cases/{slug}.mdx</code> to populate this case.
            The frontmatter schema is defined in <code>lib/schemas/index.ts</code>.
          </Callout>
        </Container>
      </div>
    );
  }

  return (
    <CaseRenderer caseRecord={full}>
      <MDXContent source={body} />
    </CaseRenderer>
  );
}
