'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';

/**
 * Sparkline — tiny inline trend line.
 *
 * Pure SVG, no Recharts dep (Recharts is heavy; reserve for full charts).
 * Stroke color matches `--accent` by default.
 *
 * The dashboard in System 6b will introduce Sparkbar and SparkArea variants
 * that share this base.
 */

export interface SparklineProps extends React.SVGAttributes<SVGSVGElement> {
  data: number[];
  /** Pixel dimensions */
  width?: number;
  height?: number;
  /** Stroke + fill source. 'accent' | 'success' | 'danger' | 'fg' */
  tone?: 'accent' | 'success' | 'danger' | 'fg' | 'muted';
  /** Optional filled area under line */
  area?: boolean;
}

const TONE_VAR: Record<NonNullable<SparklineProps['tone']>, string> = {
  accent: 'var(--accent)',
  success: 'var(--success)',
  danger: 'var(--danger)',
  fg: 'var(--fg)',
  muted: 'var(--fg-muted)',
};

export function Sparkline({
  data,
  width = 80,
  height = 24,
  tone = 'accent',
  area = false,
  className,
  ...rest
}: SparklineProps) {
  if (data.length === 0) {
    return (
      <svg width={width} height={height} className={className} aria-hidden {...rest} />
    );
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = data.length > 1 ? width / (data.length - 1) : width;

  const points = data
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * (height - 2) - 1;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const path = `M ${points.replace(/ /g, ' L ')}`;
  const areaPath = `${path} L ${width},${height} L 0,${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('overflow-visible', className)}
      aria-label="Sparkline"
      {...rest}
    >
      {area && <path d={areaPath} fill={TONE_VAR[tone]} opacity={0.18} />}
      <path
        d={path}
        fill="none"
        stroke={TONE_VAR[tone]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
