import { Container, PageHeader } from '@/components/layout';
import { StatusPill } from '@/components/display/status-pill';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/cn';

/**
 * SkeletonPage — content portion of a page-under-construction.
 *
 * As of System 5, the Workspace shell (sidebar + topbar + breadcrumbs) is
 * mounted in the root layout. SkeletonPage is now only the page body: the
 * hero, the "arriving on this page" list, and any children.
 *
 * The `route` prop and old topbar are gone — breadcrumbs come from the
 * actual URL via the Workspace's Breadcrumbs component.
 */

interface SkeletonPageProps {
  title: string;
  subtitle: string;
  poweredBy: string;
  upcoming?: string[];
  children?: React.ReactNode;
  /** When true, page owns its own hero (used by landing) */
  hideHero?: boolean;
  /** Skip props from earlier signature; tolerated for back-compat */
  route?: string;
}

export function SkeletonPage({
  title,
  subtitle,
  poweredBy,
  upcoming,
  children,
  hideHero,
}: SkeletonPageProps) {
  return (
    <div className="py-10">
      {!hideHero ? (
        <Container width="reading">
          <PageHeader
            eyebrow={<StatusPill tone="accent">{poweredBy}</StatusPill>}
            title={title}
            description={subtitle}
          />

          {upcoming && upcoming.length > 0 && (
            <section className="mb-12">
              <h2 className="font-mono text-2xs uppercase tracking-widest text-fg-muted mb-3">
                Arriving on this page
              </h2>
              <Card variant="panel">
                <ul>
                  {upcoming.map((item, i) => (
                    <li
                      key={i}
                      className={cn(
                        'flex items-start gap-3 px-4 py-3 text-sm text-fg',
                        'border-b border-line last:border-b-0',
                      )}
                    >
                      <span className="font-mono text-2xs text-fg-subtle mt-1 select-none tabular-nums">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </section>
          )}

          {children}
        </Container>
      ) : (
        children
      )}
    </div>
  );
}
