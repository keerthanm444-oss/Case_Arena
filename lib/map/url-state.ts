import type { MapViewMode, MapSavedView } from '@/types';

/**
 * URL state for /map.
 *
 *   ?view=web&industry=retail,tech&difficulty=advanced&framework=profitability&solved=1
 *
 * Filters serialize to comma-joined values, omitting empty arrays. The
 * resulting URLs are shareable + bookmarkable.
 */

export type MapFiltersState = MapSavedView['filters'];

export interface MapUrlState {
  view: MapViewMode;
  filters: MapFiltersState;
  /** Slugs in the Compare Tray, in order */
  pinned: string[];
  /** Optional focused node id (e.g. when navigating from /cases/[slug]) */
  focus?: string;
}

const DEFAULT_VIEW: MapViewMode = 'web';

function listParam(s: string | null): string[] | undefined {
  if (!s) return undefined;
  const arr = s.split(',').map((x) => x.trim()).filter(Boolean);
  return arr.length === 0 ? undefined : arr;
}

export function readMapUrlState(search: URLSearchParams): MapUrlState {
  const view = (search.get('view') as MapViewMode | null) ?? DEFAULT_VIEW;
  return {
    view: (['web', 'branch', 'matrix'].includes(view) ? view : DEFAULT_VIEW) as MapViewMode,
    filters: {
      industries: listParam(search.get('industry')) as MapFiltersState['industries'],
      categories: listParam(search.get('category')) as MapFiltersState['categories'],
      difficulties: listParam(search.get('difficulty')) as MapFiltersState['difficulties'],
      frameworks: listParam(search.get('framework')) as MapFiltersState['frameworks'],
      publishers: listParam(search.get('publisher')) as MapFiltersState['publishers'],
      onlySolved: search.get('solved') === '1' ? true : undefined,
      tags: listParam(search.get('tag')) as MapFiltersState['tags'],
    },
    pinned: listParam(search.get('pinned')) ?? [],
    focus: search.get('focus') ?? undefined,
  };
}

export function writeMapUrlState(state: MapUrlState): string {
  const params = new URLSearchParams();
  if (state.view && state.view !== DEFAULT_VIEW) params.set('view', state.view);
  if (state.filters.industries?.length) params.set('industry', state.filters.industries.join(','));
  if (state.filters.categories?.length) params.set('category', state.filters.categories.join(','));
  if (state.filters.difficulties?.length) params.set('difficulty', state.filters.difficulties.join(','));
  if (state.filters.frameworks?.length) params.set('framework', state.filters.frameworks.join(','));
  if (state.filters.publishers?.length) params.set('publisher', state.filters.publishers.join(','));
  if (state.filters.onlySolved) params.set('solved', '1');
  if (state.filters.tags?.length) params.set('tag', state.filters.tags.join(','));
  if (state.pinned.length) params.set('pinned', state.pinned.join(','));
  if (state.focus) params.set('focus', state.focus);
  return params.toString();
}

/** Whether the filter object excludes anything */
export function hasActiveFilters(f: MapFiltersState): boolean {
  return Boolean(
    f.industries?.length ||
      f.categories?.length ||
      f.difficulties?.length ||
      f.frameworks?.length ||
      f.publishers?.length ||
      f.tags?.length ||
      f.onlySolved,
  );
}

export function clearFilters(): MapFiltersState {
  return {};
}
