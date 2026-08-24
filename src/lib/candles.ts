/**
 * Deterministic decorative "price" texture for the career chart (fixes the chart-as-decoration
 * defect: a single monotonic line reads as an infographic, not a chart). This produces a monthly
 * OHLC candle series spanning the whole career.
 *
 * IMPORTANT - this is NOT real data. It does not represent earnings, performance, or any measured
 * quantity. It exists purely so the chart reads as a market chart. The one piece of real signal
 * plotted here is *when* career transitions happened: every work entry's start month is forced
 * into a tall green "transition" spike, so the eye lands on job changes. Everything else is
 * seeded noise. `/data` states this plainly (see `src/sections/DataPage.tsx`).
 *
 * Determinism: `generateCandles` is a pure function seeded by `mulberry32` (no `Math.random()`
 * anywhere) - identical (start, end, transitions, seed) always produces byte-identical output, on
 * every render, every reload, and in tests.
 */

export type Candle = {
  /** Absolute month index (see `lib/scales.ts` `monthIndex`) - one candle per calendar month. */
  month: number;
  open: number;
  high: number;
  low: number;
  close: number;
  /** True for a job-change month: rendered as a conspicuous tall up (green) spike candle. */
  isTransition: boolean;
};

/** The fixed seed used everywhere the chart is rendered - do not derive this from time/randomness. */
export const CANDLE_SEED = 0x5eed_1234;

const BASE_PRICE = 100;
const MONTHLY_VOLATILITY = 0.05;
const MEAN_REVERSION_STRENGTH = 0.05;
const WICK_FACTOR = 0.4;
/** Post-final-transition: near-flat range, so the current role reads as consolidation. */
const CONSOLIDATION_VOLATILITY = 0.006;
const CONSOLIDATION_WICK_FACTOR = 0.25;
const TRANSITION_JUMP = 0.32;
const MIN_PRICE = 1;

/**
 * mulberry32 - a tiny, fast, deterministic PRNG. Given the same 32-bit seed it always yields the
 * same sequence of floats in `[0, 1)`. Used instead of `Math.random()` so the chart is identical
 * across renders, reloads, and test runs.
 */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type GenerateCandlesOptions = {
  seed?: number;
};

/**
 * Builds one monthly OHLC candle per month index in `[startMonth, endMonth]` (inclusive). Months
 * in `transitionMonths` are forced into a tall up-move spike (a long green body, clearly taller
 * than the surrounding noise) instead of the random walk - these are the anchor points career
 * markers attach to. All other months follow a mildly mean-reverting random walk so the series
 * has genuine drawdowns and recoveries rather than drifting monotonically.
 */
export function generateCandles(
  startMonth: number,
  endMonth: number,
  transitionMonths: ReadonlySet<number>,
  options: GenerateCandlesOptions = {},
): Candle[] {
  const { seed = CANDLE_SEED } = options;
  if (endMonth < startMonth) return [];

  const random = mulberry32(seed);
  const candles: Candle[] = [];
  let open = BASE_PRICE;
  // After the final career transition the series consolidates sideways. Mean reversion would drag
  // it back toward BASE_PRICE, which reads as a decline in the current role - so it is dropped
  // here in favour of a tight, directionless range.
  const lastTransition = transitionMonths.size === 0 ? -Infinity : Math.max(...transitionMonths);

  for (let month = startMonth; month <= endMonth; month += 1) {
    const isTransition = transitionMonths.has(month);
    const isConsolidating = month > lastTransition;
    const close = isTransition
      ? open * (1 + TRANSITION_JUMP)
      : isConsolidating
        ? consolidationClose(open, random())
        : randomWalkClose(open, random());

    const bodyHigh = Math.max(open, close);
    const bodyLow = Math.min(open, close);
    const bodyRange = Math.max(bodyHigh - bodyLow, open * 0.01);
    const wickFactor = isConsolidating ? CONSOLIDATION_WICK_FACTOR : WICK_FACTOR;
    const upperWickRatio = isTransition ? 0.15 : wickFactor * random();
    const lowerWickRatio = isTransition ? 0.05 : wickFactor * random();

    candles.push({
      month,
      open,
      close,
      high: bodyHigh + bodyRange * upperWickRatio,
      low: Math.max(MIN_PRICE, bodyLow - bodyRange * lowerWickRatio),
      isTransition,
    });

    open = close;
  }

  return candles;
}

/** A sideways step: a tight, unbiased range with no drift, used after the final transition. */
function consolidationClose(open: number, roll: number): number {
  const shock = (roll - 0.5) * 2 * CONSOLIDATION_VOLATILITY;
  return Math.max(MIN_PRICE, open * (1 + shock));
}

/** One random-walk step with mild mean reversion toward `BASE_PRICE`, floored above zero. */
function randomWalkClose(open: number, roll: number): number {
  const meanReversion = ((BASE_PRICE - open) / BASE_PRICE) * MEAN_REVERSION_STRENGTH;
  const shock = (roll - 0.5) * 2 * MONTHLY_VOLATILITY;
  return Math.max(MIN_PRICE, open * (1 + shock + meanReversion));
}

/** The [min low, max high] price range spanned by a candle series. `[0, 1]` for an empty series. */
export function candlePriceDomain(candles: readonly Candle[]): readonly [number, number] {
  if (candles.length === 0) return [0, 1];
  let low = Infinity;
  let high = -Infinity;
  for (const candle of candles) {
    if (candle.low < low) low = candle.low;
    if (candle.high > high) high = candle.high;
  }
  return [low, high];
}

/**
 * Minimum height of a windowed domain, as a fraction of the window's own price level. Auto-scaling
 * a near-flat stretch to fill the plot would turn the deliberate post-transition consolidation
 * into fake volatility, so quiet windows stay quiet - and a dead-flat one never collapses to a
 * zero-height domain the scale would divide by.
 */
const MIN_WINDOW_SPAN_RATIO = 0.06;

/**
 * The price range covered by the candles inside `[startMonth, endMonth]`, centred on that range's
 * midpoint and widened by `padRatio` at each end so the extremes don't sit flush against the plot
 * edges. Used by the mobile ticker to auto-scale to the window it is currently showing; without
 * it, thirteen years of range are squeezed onto one phone screen and every window reads flat.
 *
 * Never narrower than `MIN_WINDOW_SPAN_RATIO`. Falls back to the whole series' range when the
 * window contains no candles.
 */
export function candlePriceDomainBetween(
  candles: readonly Candle[],
  startMonth: number,
  endMonth: number,
  padRatio = 0.1,
): readonly [number, number] {
  let low = Infinity;
  let high = -Infinity;
  for (const candle of candles) {
    if (candle.month < startMonth || candle.month > endMonth) continue;
    if (candle.low < low) low = candle.low;
    if (candle.high > high) high = candle.high;
  }
  if (low === Infinity || high === -Infinity) return candlePriceDomain(candles);

  const middle = (high + low) / 2;
  const span = Math.max(
    (high - low) * (1 + 2 * padRatio),
    Math.abs(middle) * MIN_WINDOW_SPAN_RATIO,
  );
  return [middle - span / 2, middle + span / 2];
}

/**
 * Linearly interpolates the candle series' close price at an arbitrary month index - matches what
 * the drawn candles/spine represent at that point. Used to place the crosshair readout in between
 * candle months. Clamps to the first/last close outside the series' domain.
 */
export function candleValueAt(candles: readonly Candle[], month: number): number {
  if (candles.length === 0) return 0;
  const first = candles[0];
  if (!first || month <= first.month) return first?.close ?? 0;
  const last = candles[candles.length - 1];
  if (last && month >= last.month) return last.close;

  for (let i = 1; i < candles.length; i += 1) {
    const previous = candles[i - 1];
    const current = candles[i];
    if (!previous || !current) continue;
    if (month <= current.month) {
      const span = current.month - previous.month;
      const ratio = span === 0 ? 0 : (month - previous.month) / span;
      return previous.close + ratio * (current.close - previous.close);
    }
  }
  return last?.close ?? 0;
}
