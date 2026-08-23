/**
 * The career equity-curve chart (PLAN §1.1, §2.1). A single responsive `<svg>` — the path draws
 * progressively via stroke-dasharray/stroke-dashoffset driven by scroll `progress`. Purely
 * decorative: `aria-hidden="true"`, the real content lives in the role card `<ol>`.
 */

import { useMemo } from 'react';
import Crosshair from '@/components/chart/Crosshair.tsx';
import { buildChartGeometry, type ChartOrientation } from '@/components/chart/geometry.ts';
import Markers from '@/components/chart/Markers.tsx';
import RegimeBands from '@/components/chart/RegimeBands.tsx';
import { yearTicks } from '@/lib/scales.ts';
import type { CareerEntry } from '@/types/content.ts';

const HORIZONTAL_WIDTH = 1000;
const HORIZONTAL_HEIGHT = 720;
const VERTICAL_WIDTH = 48;
const VERTICAL_HEIGHT = 1400;

export type CareerChartProps = {
  entries: readonly CareerEntry[];
  orientation: ChartOrientation;
  /** 0..1: how much of the path is drawn, and where the crosshair sits. */
  progress: number;
  /** id of the currently active career entry, or null if none. */
  activeEntryId: string | null;
  className?: string;
};

function formatYears(months: number): string {
  const years = months / 12;
  return years % 1 === 0 ? `${String(years)}y` : `${years.toFixed(1)}y`;
}

export default function CareerChart({ entries, orientation, progress, activeEntryId, className }: CareerChartProps) {
  const width = orientation === 'horizontal' ? HORIZONTAL_WIDTH : VERTICAL_WIDTH;
  const height = orientation === 'horizontal' ? HORIZONTAL_HEIGHT : VERTICAL_HEIGHT;

  const geometry = useMemo(
    () => buildChartGeometry(entries, orientation, width, height),
    [entries, orientation, width, height],
  );

  const clampedProgress = Math.min(1, Math.max(0, progress));
  const dashOffset = geometry.pathLength * (1 - clampedProgress);

  const showAxes = orientation === 'horizontal';
  const yTicks = useMemo(() => yearTicks(geometry.series.xDomain), [geometry.series.xDomain]);
  const [, yDomainEnd] = geometry.series.yDomain;
  const valueTicks = useMemo(() => {
    if (yDomainEnd <= 0) return [];
    const steps = 4;
    return Array.from({ length: steps + 1 }, (_, i) => (yDomainEnd / steps) * i);
  }, [yDomainEnd]);

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${String(width)} ${String(height)}`}
      preserveAspectRatio="none"
      width="100%"
      height="100%"
      className={className}
    >
      <RegimeBands entries={entries} geometry={geometry} />

      {showAxes && (
        <g>
          <line
            x1={geometry.padding.left}
            x2={width - geometry.padding.right}
            y1={height - geometry.padding.bottom}
            y2={height - geometry.padding.bottom}
            stroke="var(--color-border)"
            strokeWidth={1}
          />
          {yTicks.map((tick) => (
            <text
              key={tick.year}
              x={geometry.timeScale(tick.monthIndex)}
              y={height - geometry.padding.bottom + 20}
              fontFamily="var(--font-mono)"
              fontSize={10}
              textAnchor="middle"
              fill="var(--color-muted)"
            >
              {tick.year}
            </text>
          ))}
          {valueTicks.map((tick) => (
            <text
              key={tick}
              x={geometry.padding.left - 10}
              y={geometry.valueScale(tick) + 3}
              fontFamily="var(--font-mono)"
              fontSize={9}
              textAnchor="end"
              fill="var(--color-muted)"
              opacity={0.7}
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {formatYears(tick)}
            </text>
          ))}
        </g>
      )}

      <path
        d={geometry.pathD}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeDasharray={geometry.pathLength}
        strokeDashoffset={dashOffset}
      />

      <Markers geometry={geometry} activeEntryId={activeEntryId} />
      <Crosshair geometry={geometry} progress={clampedProgress} />
    </svg>
  );
}
