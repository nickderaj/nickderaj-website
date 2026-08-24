/**
 * A thin line at the playhead with a mono date readout - a charting-terminal cursor that follows
 * scroll progress (PLAN §1.3 item 2).
 *
 * The mobile ticker draws the line but not the readout: its viewBox is stretched to the phone's
 * aspect ratio (`preserveAspectRatio="none"`), which would distort glyphs, and a date label
 * behind the role-card text would be clutter rather than signal.
 */

import type { ChartGeometry } from '@/components/chart/geometry.ts';
import { candleValueAt } from '@/lib/candles.ts';

const MONTH_LABELS = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
] as const;

export type CrosshairProps = {
  geometry: ChartGeometry;
  /** 0..1 progress across the chart's time domain. */
  progress: number;
};

function formatMonthIndexLabel(monthIndexValue: number): string {
  const rounded = Math.round(monthIndexValue);
  const year = Math.floor(rounded / 12);
  const month = ((rounded % 12) + 12) % 12;
  const label = MONTH_LABELS[month] ?? 'JAN';
  return `${label} ${String(year)}`;
}

export default function Crosshair({ geometry, progress }: CrosshairProps) {
  const { orientation, width, height, padding, xDomain, candles, unitScale } = geometry;
  const [domainStart, domainEnd] = xDomain;
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const playheadMonth = domainStart + clampedProgress * (domainEnd - domainStart);
  const value = candleValueAt(candles, playheadMonth);
  const point = geometry.toPoint(playheadMonth, value);
  const dateLabel = formatMonthIndexLabel(playheadMonth);

  return (
    <g>
      <line
        x1={point.x}
        x2={point.x}
        y1={padding.top}
        y2={height - padding.bottom}
        stroke="var(--color-accent)"
        strokeWidth={unitScale}
        strokeDasharray={`${String(2 * unitScale)},${String(3 * unitScale)}`}
        opacity={0.7}
      />
      {orientation === 'horizontal' && (
        <text
          x={Math.min(width - padding.right - 4, point.x + 6)}
          y={padding.top - 12}
          fontFamily="var(--font-mono)"
          fontSize={10}
          fill="var(--color-accent)"
          textAnchor="start"
        >
          {dateLabel}
        </text>
      )}
    </g>
  );
}
