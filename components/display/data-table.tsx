'use client';

import * as React from 'react';
import { ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * DataTable — sortable, density-aware, sticky-header table.
 *
 * Generic over T. Columns declare:
 *   - key       (unique field name)
 *   - header    (label, or function returning ReactNode)
 *   - cell      (function returning the cell's body)
 *   - sortValue (function returning a comparable value)
 *   - align     ('left' | 'right' | 'center')
 *   - width     (CSS width hint)
 *   - sticky    (sticky left for the first column on horizontal scroll)
 *
 * The component owns sort state. Filtering happens upstream — pass a
 * filtered `data` array.
 */

export type SortDir = 'asc' | 'desc';

export interface DataColumn<T> {
  key: string;
  header: React.ReactNode | ((info: { sortDir?: SortDir }) => React.ReactNode);
  cell: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number | boolean | null | undefined;
  align?: 'left' | 'right' | 'center';
  width?: string;
  sticky?: boolean;
  /** Column-level density override */
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataColumn<T>[];
  /** Function returning a stable row key */
  rowKey: (row: T) => string;
  /** Default sort */
  defaultSort?: { key: string; dir: SortDir };
  /** Per-row click handler */
  onRowClick?: (row: T) => void;
  /** Custom row classnames */
  rowClassName?: (row: T) => string | undefined;
  /** Empty state slot */
  empty?: React.ReactNode;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  rowKey,
  defaultSort,
  onRowClick,
  rowClassName,
  empty,
  className,
}: DataTableProps<T>) {
  const [sort, setSort] = React.useState<{ key: string; dir: SortDir } | undefined>(
    defaultSort,
  );

  const sorted = React.useMemo(() => {
    if (!sort) return data;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return data;
    const copy = [...data];
    copy.sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (av < bv) return sort.dir === 'asc' ? -1 : 1;
      if (av > bv) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [data, columns, sort]);

  function toggleSort(key: string) {
    setSort((s) => {
      if (s?.key !== key) return { key, dir: 'asc' };
      if (s.dir === 'asc') return { key, dir: 'desc' };
      return undefined;
    });
  }

  if (data.length === 0 && empty) {
    return <>{empty}</>;
  }

  return (
    <div
      className={cn(
        'rounded-md border border-line bg-bg-panel overflow-auto',
        className,
      )}
    >
      <table className="w-full border-collapse text-sm">
        <thead className="bg-bg-elevated">
          <tr className="border-b border-line">
            {columns.map((col) => {
              const sortable = !!col.sortValue;
              const isSorted = sort?.key === col.key;
              const dir = isSorted ? sort?.dir : undefined;
              const Icon = !sortable
                ? null
                : isSorted && dir === 'asc'
                  ? ArrowUp
                  : isSorted && dir === 'desc'
                    ? ArrowDown
                    : ChevronsUpDown;
              return (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    'sticky top-0 z-raised',
                    'px-3 py-2 font-mono text-2xs uppercase tracking-widest text-fg-muted',
                    'border-b border-line bg-bg-elevated',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                    col.sticky && 'sticky left-0',
                    col.className,
                  )}
                  style={{ width: col.width }}
                >
                  {sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      className={cn(
                        'inline-flex items-center gap-1.5',
                        'hover:text-fg transition-colors duration-fast',
                        isSorted && 'text-fg',
                      )}
                    >
                      {typeof col.header === 'function' ? col.header({ sortDir: dir }) : col.header}
                      {Icon && <Icon size={11} className="opacity-60" aria-hidden />}
                    </button>
                  ) : (
                    <>{typeof col.header === 'function' ? col.header({}) : col.header}</>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                'border-b border-line last:border-b-0',
                'transition-colors duration-fast',
                onRowClick && 'cursor-pointer hover:bg-bg-elevated',
                rowClassName?.(row),
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    'px-3 py-2 text-fg align-middle',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                    col.sticky && 'sticky left-0 bg-bg-panel',
                    col.className,
                  )}
                >
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
