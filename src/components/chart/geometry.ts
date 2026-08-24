/**
 * Shared SVG plotting geometry for the career chart. `CareerChart`, `RegimeBands`, `Markers`, and
 * `Crosshair` all build their pixel positions from this one module so the drawn candles, the
 * bands, the dots, and the crosshair can never drift apart (PLAN §2.1).
 *
 * The plotted "price" series is decorative market texture (`src/lib/candles.ts`), not real data -
 * see that module's header comment. What IS real here: the x (time) domain, the career-marker
 * months, and the regime bands, all derived from `career.ts`.
 *
 * Two orientations, both with time on the x axis and price on the y axis - they differ only in
 * scale, not in projection:
 *
 *  - `horizontal`: the desktop sticky pane. The whole career fits the drawn width.
 *  - `ticker`: the mobile full-bleed backdrop. The career is drawn several screens wide and
 *    `CareerChart` pans a viewBox window across it, so scrolling down slides the tape sideways.
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

export type ChartOrientation = 'horizontal' | 'ticker';

export type ChartPadding = { top: number; right: number; bottom: number; left: number };

export const DEFAULT_HORIZONTAL_PADDING: ChartPadding = {
  top: 56,
  right: 24,
  bottom: 40,
  left: 24,
};
/**
 * The ticker draws edge to edge horizontally - it is meant to run off both sides of the phone
 * screen - so it has no left/right padding. The generous top/bottom keeps the series clear of the
 * viewport edges, where it would otherwise read as a cropped band rather than a backdrop.
 */
export const DEFAULT_TICKER_PADDING: ChartPadding = { top: 140, right: 0, bottom: 140, left: 0 };

/**
 * SVG user units per notional "desktop unit", per orientation. The ticker's coordinate space is
 * several screens wide, so a 1-unit stroke there would render sub-pixel. Every component that
 * draws a fixed-size feature (wick width, marker radius, crosshair dashes) multiplies its
 * constants by `geometry.unitScale`, which is the only place this ratio is defined.
 */
const UNIT_SCALE: Record<ChartOrientation, number> = { horizontal: 1, ticker: 2.4 };

/** A resolved plotting position for one career entry, on the same axes as the candle series. */
export type EntryMarker = {
  id: string;
  /** Month index - the entry's start month. */
  x: number;
  /** Price of the candle at this month - purely a y-position, not a real measurement. */
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
  /** Projects a (month index, price) pair to an {x, y} SVG point. */
  toPoint: (monthIndex: number, price: number) => { x: number; y: number };
  /** Multiplier for fixed-size features (strokes, radii) so they read the same on screen. */
  unitScale: number;
};

export type ChartGeometryOptions = {
  padding?: ChartPadding;
  /**
   * Overrides the y (price) domain, which otherwise spans the whole series. The ticker passes the
   * extremes of its currently visible month window here so the tape auto-scales as it pans, the
   * way a real chart does - without it, thirteen years of range are squeezed into one screen and
   * any given window reads as a flat line.
   */
  priceDomain?: readonly [number, number];
};

/** Builds the geometry for a career chart at a given size/orientation from a set of entries. */
export function buildChartGeometry(
  entries: readonly CareerEntry[],
  orientation: ChartOrientation,
  width: number,
  height: number,
  options: ChartGeometryOptions = {},
): ChartGeometry {
  const padding =
    options.padding ??
    (orientation === 'horizontal' ? DEFAULT_HORIZONTAL_PADDING : DEFAULT_TICKER_PADDING);
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
  const priceDomain = options.priceDomain ?? candlePriceDomain(candles);

  const timeScale = linearScale(xDomain, [padding.left, width - padding.right]);
  // Inverted range: a higher price draws higher up the chart.
  const valueScale = linearScale(priceDomain, [height - padding.bottom, padding.top]);
  const toPoint = (month: number, price: number) => ({
    x: timeScale(month),
    y: valueScale(price),
  });

  const closeAt = (month: number): number => {
    // One candle per month across the whole domain, so an entry's start month always has an
    // exact candle - falling back to the nearest endpoint only matters for degenerate/empty input.
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
    unitScale: UNIT_SCALE[orientation],
  };
}
