/**
 * Shared SVG plotting geometry for the career chart. `CareerChart`, `RegimeBands`, `Markers`, and
 * `Crosshair` all build their pixel positions from this one module so the drawn candles, the
 * bands, the dots, and the crosshair can never drift apart (PLAN §2.1).
 *
 * The plotted "price" series is decorative market texture (`src/lib/candles.ts`), not real data —
 * see that module's header comment. What IS real here: the x (time) domain, the career-marker
 * months, and the regime bands, all derived from `career.ts`.
 */

import { candlePriceDomain, generateCandles, type Candle } from '@/lib/candles.ts';
import {
  linearScale,
  monthIndex,
  parseYearMonth,
  resolveYearMonth,
  type LinearScale,
} from '@/lib/scales.ts';
import type { CareerEntry } from '@/types/content.ts';

export type ChartOrientation = 'horizontal' | 'vertical';

export type ChartPadding = { top: number; right: number; bottom: number; left: number };

export const DEFAULT_HORIZONTAL_PADDING: ChartPadding = {
  top: 56,
  right: 24,
  bottom: 40,
  left: 24,
};
export const DEFAULT_VERTICAL_PADDING: ChartPadding = { top: 16, right: 8, bottom: 16, left: 8 };

/** A resolved plotting position for one career entry, on the same axes as the candle series. */
export type EntryMarker = {
  id: string;
  /** Month index — the entry's start month. */
  x: number;
  /** Price of the candle at this month — purely a y-position, not a real measurement. */
  y: number;
  scope: number;
  kind: CareerEntry['kind'];
};

export type ChartGeometry = {
  orientation: ChartOrientation;
  width: number;
  height: number;
  padding: ChartPadding;
  /** [earliest start month index, latest end month index (or now, for 'present')]. */
  xDomain: readonly [number, number];
  /** [min low, max high] of the decorative candle series. */
  priceDomain: readonly [number, number];
  /** The decorative monthly OHLC candle series spanning the full career (see `lib/candles.ts`). */
  candles: Candle[];
  /** One marker per entry (work, education, and milestone). */
  markers: EntryMarker[];
  /** Scale for the time axis (month index -> pixels), in the axis's own pixel space. */
  timeScale: LinearScale;
  /** Scale for the value axis (price -> pixels), in the axis's own pixel space. */
  valueScale: LinearScale;
  /** Projects a (month index, price) pair to an {x, y} SVG point, orientation-aware. */
  toPoint: (monthIndex: number, price: number) => { x: number; y: number };
  /** A simple polyline through candle closes — used for the mobile vertical spine variant. */
  spinePathD: string;
  /** Total spine path length in SVG user units — for stroke-dasharray/dashoffset reveal. */
  spinePathLength: number;
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
  const chronological = [...entries].sort(
    (a, b) => monthIndex(parseYearMonth(a.start)) - monthIndex(parseYearMonth(b.start)),
  );

  const xDomain: readonly [number, number] =
    chronological.length === 0
      ? [0, 0]
      : [
          Math.min(...chronological.map((entry) => monthIndex(parseYearMonth(entry.start)))),
          Math.max(...chronological.map((entry) => monthIndex(resolveYearMonth(entry.end)))),
        ];

  const transitionMonths = new Set(
    chronological
      .filter((entry) => entry.kind === 'work')
      .map((entry) => monthIndex(parseYearMonth(entry.start))),
  );

  const candles = generateCandles(xDomain[0], xDomain[1], transitionMonths);
  const priceDomain = candlePriceDomain(candles);

  let timeScale: LinearScale;
  let valueScale: LinearScale;
  let toPoint: (monthIndex: number, price: number) => { x: number; y: number };

  if (orientation === 'horizontal') {
    timeScale = linearScale(xDomain, [padding.left, width - padding.right]);
    // Inverted range: a higher price draws higher up the chart.
    valueScale = linearScale(priceDomain, [height - padding.bottom, padding.top]);
    toPoint = (month, price) => ({ x: timeScale(month), y: valueScale(price) });
  } else {
    // Vertical/transposed: time runs top-to-bottom, price runs left-to-right within the gutter.
    timeScale = linearScale(xDomain, [padding.top, height - padding.bottom]);
    valueScale = linearScale(priceDomain, [padding.left, width - padding.right]);
    toPoint = (month, price) => ({ x: valueScale(price), y: timeScale(month) });
  }

  const closeAt = (month: number): number => {
    // One candle per month across the whole domain, so an entry's start month always has an
    // exact candle — falling back to the nearest endpoint only matters for degenerate/empty input.
    const exact = candles.find((candle) => candle.month === month);
    if (exact) return exact.close;
    return candles[0]?.close ?? 0;
  };

  const markers: EntryMarker[] = chronological.map((entry) => {
    const entryStart = monthIndex(parseYearMonth(entry.start));
    return {
      id: entry.id,
      x: entryStart,
      y: closeAt(entryStart),
      scope: entry.scope,
      kind: entry.kind,
    };
  });

  const closePoints = candles.map((candle) => toPoint(candle.month, candle.close));
  const spinePathD = closePoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${String(point.x)},${String(point.y)}`)
    .join(' ');
  const spinePathLength = polylineLength(closePoints);

  return {
    orientation,
    width,
    height,
    padding,
    xDomain,
    priceDomain,
    candles,
    markers,
    timeScale,
    valueScale,
    toPoint,
    spinePathD,
    spinePathLength,
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
