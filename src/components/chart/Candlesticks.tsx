/**
 * Renders the decorative candle series (`lib/candles.ts`) as OHLC bars: a wick from high to low
 * and a body from open to close, green for an up month and red for a down month, using the
 * `--color-candle-up` / `--color-candle-down` tokens. Horizontal orientation only - the mobile
 * vertical gutter renders a simplified spine instead (candles don't read at ~48px wide; see
 * `CareerChart.tsx`).
 *
 * Candles at or before the scroll playhead render at full opacity ("drawn"); candles after it are
 * heavily dimmed, so the reveal reads the same way the old progressive line draw did.
 */

import type { ChartGeometry } from '@/components/chart/geometry.ts';

const DIMMED_OPACITY = 0.12;
const MIN_BODY_HEIGHT = 1;

export type CandlesticksProps = {
  geometry: ChartGeometry;
  /** Month index of the scroll playhead - candles after this are dimmed. */
  playheadMonth: number;
};

export default function Candlesticks({ geometry, playheadMonth }: CandlesticksProps) {
  const { candles, timeScale, valueScale } = geometry;
  if (candles.length < 2) return null;

  // Candle width: the pixel span between two month ticks, minus a thin gap, capped so a sparse
  // domain (unit tests, tiny fixtures) doesn't produce absurdly wide bars.
  const monthSpanPx = Math.abs(timeScale(1) - timeScale(0));
  const bodyWidth = Math.max(1, Math.min(6, monthSpanPx * 0.7));

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
          <g key={candle.month} opacity={revealed ? 1 : DIMMED_OPACITY}>
            <line x1={x} x2={x} y1={highY} y2={lowY} stroke={color} strokeWidth={1} />
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
