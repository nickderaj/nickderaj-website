/**
 * Shared SVG plotting geometry for the career chart. `CareerChart`, `RegimeBands`, `Markers`, and
 * `Crosshair` all build their pixel positions from this one module so the drawn path, the bands,
 * the dots, and the crosshair can never drift apart (PLAN §2.1).
 */

import {
  buildCareerSeries,
  linearScale,
  type CareerSeries,
  type LinearScale,
} from '@/lib/scales.ts';
import type { CareerEntry } from '@/types/content.ts';

export type ChartOrientation = 'horizontal' | 'vertical';

export type ChartPadding = { top: number; right: number; bottom: number; left: number };

export const DEFAULT_HORIZONTAL_PADDING: ChartPadding = {
  top: 56,
  right: 24,
  bottom: 40,
  left: 56,
};
export const DEFAULT_VERTICAL_PADDING: ChartPadding = { top: 16, right: 8, bottom: 16, left: 8 };

export type ChartGeometry = {
  orientation: ChartOrientation;
  width: number;
  height: number;
  padding: ChartPadding;
  series: CareerSeries;
  /** Scale for the time axis (month index -> pixels), in the axis's own pixel space. */
  timeScale: LinearScale;
  /** Scale for the value axis (cumulative months -> pixels), in the axis's own pixel space. */
  valueScale: LinearScale;
  /** Projects a (month index, cumulative months) pair to an {x, y} SVG point, orientation-aware. */
  toPoint: (monthIndex: number, cumulativeMonths: number) => { x: number; y: number };
  /** The full drawn path as a straight-segment polyline `d` attribute (no curve smoothing). */
  pathD: string;
  /** Total path length in SVG user units — for stroke-dasharray/dashoffset progressive drawing. */
  pathLength: number;
};

/** Builds the geometry for a career chart at a given size/orientation from a set of entries. */
export function buildChartGeometry(
  entries: readonly CareerEntry[],
  orientation: ChartOrientation,
  width: number,
  height: number,
  padding: ChartPadding = orientation === 'horizontal'
    ? DEFAULT_HORIZONTAL_PADDING
    : DEFAULT_VERTICAL_PADDING,
): ChartGeometry {
  const series = buildCareerSeries(entries);
  const { xDomain, yDomain } = series;

  let timeScale: LinearScale;
  let valueScale: LinearScale;
  let toPoint: (monthIndex: number, cumulativeMonths: number) => { x: number; y: number };

  if (orientation === 'horizontal') {
    timeScale = linearScale(xDomain, [padding.left, width - padding.right]);
    // Inverted range: higher cumulative experience draws higher up the chart.
    valueScale = linearScale(yDomain, [height - padding.bottom, padding.top]);
    toPoint = (monthIndex, cumulativeMonths) => ({
      x: timeScale(monthIndex),
      y: valueScale(cumulativeMonths),
    });
  } else {
    // Vertical/transposed: time runs top-to-bottom, cumulative experience runs left-to-right
    // within the narrow gutter.
    timeScale = linearScale(xDomain, [padding.top, height - padding.bottom]);
    valueScale = linearScale(yDomain, [padding.left, width - padding.right]);
    toPoint = (monthIndex, cumulativeMonths) => ({
      x: valueScale(cumulativeMonths),
      y: timeScale(monthIndex),
    });
  }

  const points = series.series.map((point) => toPoint(point.x, point.y));
  const pathD = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${String(point.x)},${String(point.y)}`)
    .join(' ');
  const pathLength = polylineLength(points);

  return {
    orientation,
    width,
    height,
    padding,
    series,
    timeScale,
    valueScale,
    toPoint,
    pathD,
    pathLength,
  };
}

function polylineLength(points: readonly { x: number; y: number }[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    const previous = points[i - 1];
    const current = points[i];
    if (!previous || !current) continue;
    total += Math.hypot(current.x - previous.x, current.y - previous.y);
  }
  return total;
}
