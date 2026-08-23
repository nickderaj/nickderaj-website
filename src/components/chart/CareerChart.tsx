/**
 * The career chart (PLAN §1.1, §2.1; reworked to a candlestick chart — see fix #3 in the owner's
 * review). A single responsive `<svg>`. Horizontal orientation draws a dense monthly OHLC candle
 * series (`Candlesticks`, decorative market texture — see `lib/candles.ts`); the narrow mobile
 * vertical gutter draws a simplified spine instead, since candle bodies don't read at ~48px wide.
 * Both are driven by scroll `progress`. Purely decorative: `aria-hidden="true"`, the real content
 * lives in the role card `<ol>`.
 *
 * The y-axis is deliberately unlabelled — no ticks, no title — since the candle series is not a
 * real measurement. The x (time) axis and the regime bands stay, because both are real.
 */

import Candlesticks from '@/components/chart/Candlesticks.tsx';
import Crosshair from '@/components/chart/Crosshair.tsx';
import { buildChartGeometry, type ChartOrientation } from '@/components/chart/geometry.ts';
import Markers from '@/components/chart/Markers.tsx';
import RegimeBands from '@/components/chart/RegimeBands.tsx';
import { ticks, yearTicks } from '@/lib/scales.ts';
import type { CareerEntry } from '@/types/content.ts';
import { useMemo } from 'react';

const HORIZONTAL_WIDTH = 1000;
const HORIZONTAL_HEIGHT = 720;
const VERTICAL_WIDTH = 48;
const VERTICAL_HEIGHT = 1400;
const GRIDLINE_COUNT = 4;

export type CareerChartProps = {
  entries: readonly CareerEntry[];
  orientation: ChartOrientation;
  /** 0..1: how much of the chart is "drawn" (revealed), and where the crosshair sits. */
  progress: number;
  /** id of the currently active career entry, or null if none. */
  activeEntryId: string | null;
  className?: string;
};

export default function CareerChart({
  entries,
  orientation,
  progress,
  activeEntryId,
  className,
}: CareerChartProps) {
  const width = orientation === 'horizontal' ? HORIZONTAL_WIDTH : VERTICAL_WIDTH;
  const height = orientation === 'horizontal' ? HORIZONTAL_HEIGHT : VERTICAL_HEIGHT;

  const geometry = useMemo(
    () => buildChartGeometry(entries, orientation, width, height),
    [entries, orientation, width, height],
  );

  const clampedProgress = Math.min(1, Math.max(0, progress));
  const [domainStart, domainEnd] = geometry.xDomain;
  const playheadMonth = domainStart + clampedProgress * (domainEnd - domainStart);
  const spineDashOffset = geometry.spinePathLength * (1 - clampedProgress);

  const showAxes = orientation === 'horizontal';
  const yearTickList = useMemo(() => yearTicks(geometry.xDomain), [geometry.xDomain]);
  const gridlines = useMemo(
    () => (showAxes ? ticks(geometry.priceDomain, GRIDLINE_COUNT) : []),
    [showAxes, geometry.priceDomain],
  );

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
          {/* Faint horizontal gridlines only — no value labels, this axis isn't a real scale. */}
          {gridlines.map((tick) => (
            <line
              key={tick}
              x1={geometry.padding.left}
              x2={width - geometry.padding.right}
              y1={geometry.valueScale(tick)}
              y2={geometry.valueScale(tick)}
              stroke="var(--color-border)"
              strokeWidth={1}
              opacity={0.4}
            />
          ))}
          <line
            x1={geometry.padding.left}
            x2={width - geometry.padding.right}
            y1={height - geometry.padding.bottom}
            y2={height - geometry.padding.bottom}
            stroke="var(--color-border)"
            strokeWidth={1}
          />
          {yearTickList.map((tick) => (
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
        </g>
      )}

      {orientation === 'horizontal' ? (
        <Candlesticks geometry={geometry} playheadMonth={playheadMonth} />
      ) : (
        <path
          d={geometry.spinePathD}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray={geometry.spinePathLength}
          strokeDashoffset={spineDashOffset}
        />
      )}

      <Markers geometry={geometry} activeEntryId={activeEntryId} />
      <Crosshair geometry={geometry} progress={clampedProgress} />
    </svg>
  );
}
