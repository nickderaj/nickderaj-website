/**
 * Renders the decorative candle series (`lib/candles.ts`) as OHLC bars: a wick from high to low
 * and a body from open to close, green for an up month and red for a down month, using the
 * `--color-candle-up` / `--color-candle-down` tokens.
 *
 * Candles at or before the scroll playhead render at full opacity ("drawn"); candles after it are
 * heavily dimmed, so the reveal reads the same way the old progressive line draw did.
 *
 * `maxBodyWidth` / `strokeWidth` are in the caller's SVG user units. The mobile ticker draws into
 * a much wider coordinate space than the desktop pane (it is several screens wide and panned), so
 * it scales both up to keep the on-screen bar and wick weights comparable.
 */

import type { ChartGeometry } from '@/components/chart/geometry.ts';

const DIMMED_OPACITY = 0.12;
const MIN_BODY_HEIGHT = 1;
const DEFAULT_MAX_BODY_WIDTH = 6;
const BODY_WIDTH_RATIO = 0.7;

export type CandlesticksProps = {
  geometry: ChartGeometry;
  /** Month index of the scroll playhead - candles after this are dimmed. */
  playheadMonth: number;
  /** Cap on candle body width in SVG user units. */
  maxBodyWidth?: number;
  /** Wick stroke width in SVG user units. */
  strokeWidth?: number;
};

export default function Candlesticks({
  geometry,
  playheadMonth,
  maxBodyWidth = DEFAULT_MAX_BODY_WIDTH,
  strokeWidth = 1,
}: CandlesticksProps) {
  const { candles, timeScale, valueScale } = geometry;
  if (candles.length < 2) return null;

  // Candle width: the pixel span between two month ticks, minus a thin gap, capped so a sparse
  // domain (unit tests, tiny fixtures) doesn't produce absurdly wide bars. Read off the scale's
  // domain/range rather than `timeScale(1) - timeScale(0)`: month indices are absolute (year*12,
  // so ~24_000), both 0 and 1 clamp to the left edge, and that difference is always 0.
  const [domainStart, domainEnd] = timeScale.domain;
  const [rangeStart, rangeEnd] = timeScale.range;
  const monthSpanPx =
    domainEnd === domainStart ? 0 : Math.abs((rangeEnd - rangeStart) / (domainEnd - domainStart));
  const bodyWidth = Math.max(1, Math.min(maxBodyWidth, monthSpanPx * BODY_WIDTH_RATIO));

  return (
    <g>
      {candles.map((candle) => {
        const x = timeScale(candle.month);
        const isUp = candle.close >= candle.open;
        const color = isUp ? 'var(--color-candle-up)' : 'var(--color-candle-down)';
        const revealed = candle.month <= playheadMonth;

        const openY = valueScale(candle.open);
        const closeY = valueScale(candle.close);
        const highY = valueScale(candle.high);
        const lowY = valueScale(candle.low);
        const bodyTop = Math.min(openY, closeY);
        const bodyHeight = Math.max(MIN_BODY_HEIGHT, Math.abs(closeY - openY));

        return (
          <g
            key={candle.month}
            data-candle={String(candle.month)}
            opacity={revealed ? 1 : DIMMED_OPACITY}
          >
            <line x1={x} x2={x} y1={highY} y2={lowY} stroke={color} strokeWidth={strokeWidth} />
            <rect
              x={x - bodyWidth / 2}
              y={bodyTop}
              width={bodyWidth}
              height={bodyHeight}
              fill={color}
            />
          </g>
        );
      })}
    </g>
  );
}
