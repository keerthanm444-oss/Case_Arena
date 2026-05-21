'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { MODULE_SPINE } from '@/lib/content/modules';
import { TOOLS } from '@/lib/content/tools';
import { FRAMEWORK_SPINE } from '@/lib/content/frameworks';

/**
 * Breadcrumbs — auto-derived from `usePathname()`.
 *
 * Resolves friendly labels for dynamic segments:
 *   /modules/[slug]  → looks up MODULE_SPINE
 *   /tools/[slug]    → looks up TOOLS
 *   /cases/[slug]    → can't resolve (no MDX at runtime); shows slug as-is
 *
 * Renders nothing on the home page.
 */

interface Crumb {
  label: string;
  href?: string;
}

const SECTION_LABELS: Record<string, string> = {
  modules: 'Modules',
  cases: 'Cases',
  map: 'Case Map',
  tools: 'Tools',
  resources: 'Resources',
  dashboard: 'Dashboard',
  search: 'Search',
  settings: 'Settings',
};

function buildCrumbs(pathname: string): Crumb[] {
  if (pathname === '/' || pathname === '') return [];

  const segments = pathname.split('/').filter(Boolean);
  const crumbs: Crumb[] = [];

  if (segments.length === 0) return crumbs;

  const section = segments[0] ?? '';
  const sectionLabel = SECTION_LABELS[section] ?? section;
  const sectionHref = `/${section}`;
  crumbs.push({
    label: sectionLabel,
    href: segments.length > 1 ? sectionHref : undefined,
  });

  if (segments.length > 1) {
    const slug = segments[1] ?? '';
    if (section === 'modules') {
      const m = MODULE_SPINE.find((mm) => mm.slug === slug);
      crumbs.push({ label: m ? `${m.id} · ${m.title}` : slug });
    } else if (section === 'tools') {
      const t = TOOLS.find((tt) => tt.slug === slug);
      crumbs.push({ label: t?.name ?? slug });
    } else if (section === 'cases') {
      crumbs.push({ label: slug });
    } else {
      crumbs.push({ label: slug });
    }
  }

  return crumbs;
}

export function Breadcrumbs() {
  const pathname = usePathname() ?? '/';
  const crumbs = buildCrumbs(pathname);

  if (crumbs.length === 0) return null;

  return (
    <nav
      className="flex items-center gap-1 text-fg-muted"
      aria-label="Breadcrumb"
    >
      <Link
        href="/"
        className="font-mono text-2xs uppercase tracking-wider hover:text-fg transition-colors duration-fast"
      >
        Home
      </Link>
      {crumbs.map((c, i) => (
        <React.Fragment key={i}>
          <ChevronRight
            size={11}
            className="text-fg-subtle shrink-0"
            aria-hidden
          />
          {c.href ? (
            <Link
              href={c.href}
              className="font-mono text-2xs uppercase tracking-wider hover:text-fg transition-colors duration-fast"
            >
              {c.label}
            </Link>
          ) : (
            <span
              className={cn(
                'font-mono text-2xs uppercase tracking-wider truncate max-w-[24ch]',
                i === crumbs.length - 1 && 'text-fg',
              )}
            >
              {c.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
