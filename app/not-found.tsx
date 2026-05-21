import Link from 'next/link';
import { SkeletonPage } from '@/components/skeleton/SkeletonPage';

export default function NotFound() {
  return (
    <SkeletonPage
      route="/404"
      title="Not found"
      subtitle="That route doesn't exist in the current build. If you're looking for a module or case that hasn't been authored yet, check the modules index — every page in the curriculum spine is reachable."
      poweredBy="System 2 · Skeleton"
    >
      <div className="flex gap-3">
        <Link
          href="/"
          className="pill"
          data-tone="accent"
          style={{ textTransform: 'none', fontSize: 'var(--text-sm)' }}
        >
          ← Back to landing
        </Link>
        <Link
          href="/modules"
          className="pill"
          style={{ textTransform: 'none', fontSize: 'var(--text-sm)' }}
        >
          Modules index
        </Link>
      </div>
    </SkeletonPage>
  );
}
