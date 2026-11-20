// @ts-nocheck -- ported from the Ceres blog; kept as-is rather than rewritten for this repo's stricter tsconfig.
// ---------------------------------------------------------------------------
// Technical Analysis Library
// Pure functions operating on number arrays
// ---------------------------------------------------------------------------

/** Simple Moving Average */
export function sma(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) {
        sum += data[j];
      }
      result.push(sum / period);
    }
  }
  return result;
}

/** Exponential Moving Average */
export function ema(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  const k = 2 / (period + 1);

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else if (i === period - 1) {
      // Seed with SMA
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[j];
      }
      result.push(sum / period);
    } else {
      const prev = result[i - 1] as number;
      result.push(data[i] * k + prev * (1 - k));
    }
  }
  return result;
}

/** MACD - returns { macdLine, signalLine, histogram } */
export interface MACDResult {
  macdLine: (number | null)[];
  signalLine: (number | null)[];
  histogram: (number | null)[];
}

export function macd(data: number[], fast = 12, slow = 26, signal = 9): MACDResult {
  const emaFast = ema(data, fast);
  const emaSlow = ema(data, slow);

  // MACD line = EMA(fast) - EMA(slow)
  const macdLine: (number | null)[] = data.map((_, i) => {
    const f = emaFast[i];
    const s = emaSlow[i];
    if (f == null || s == null) return null;
    return f - s;
  });

  // Signal line = EMA of MACD line (only over non-null values)
  const nonNullStart = macdLine.findIndex((v) => v != null);
  const macdValues = macdLine.slice(nonNullStart).map((v) => v as number);
  const signalEma = ema(macdValues, signal);

  const signalLine: (number | null)[] = new Array(nonNullStart).fill(null);
  signalLine.push(...signalEma);

  // Histogram = MACD - Signal
  const histogram: (number | null)[] = data.map((_, i) => {
    const m = macdLine[i];
    const s = signalLine[i];
    if (m == null || s == null) return null;
    return m - s;
  });

  return { macdLine, signalLine, histogram };
}

/** Bollinger Bands - returns { upper, middle, lower, percentB } */
export interface BollingerResult {
  upper: (number | null)[];
  middle: (number | null)[];
  lower: (number | null)[];
  percentB: (number | null)[];
}

export function bollingerBands(data: number[], period = 20, mult = 2): BollingerResult {
  const middle = sma(data, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];
  const percentB: (number | null)[] = [];

  for (let i = 0; i < data.length; i++) {
    const m = middle[i];
    if (m == null) {
      upper.push(null);
      lower.push(null);
      percentB.push(null);
    } else {
      let sumSq = 0;
      for (let j = i - period + 1; j <= i; j++) {
        sumSq += (data[j] - m) ** 2;
      }
      const stdDev = Math.sqrt(sumSq / period);
      const u = m + mult * stdDev;
      const l = m - mult * stdDev;
      upper.push(u);
      lower.push(l);
      percentB.push(u !== l ? (data[i] - l) / (u - l) : 0.5);
    }
  }

  return { upper, middle, lower, percentB };
}

/** RSI using Wilder's smoothing */
export function rsi(data: number[], period = 14): (number | null)[] {
  const result: (number | null)[] = [];

  if (data.length < period + 1) {
    return new Array(data.length).fill(null);
  }

  // Calculate gains and losses
  const gains: number[] = [];
  const losses: number[] = [];
  for (let i = 1; i < data.length; i++) {
    const change = data[i] - data[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? -change : 0);
  }

  // First value: simple average
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 0; i < period; i++) {
    avgGain += gains[i];
    avgLoss += losses[i];
  }
  avgGain /= period;
  avgLoss /= period;

  // Fill nulls for warmup period
  for (let i = 0; i <= period; i++) {
    result.push(null);
  }

  // First RSI
  const firstRS = avgLoss === 0 ? 100 : avgGain / avgLoss;
  result.push(100 - 100 / (1 + firstRS));

  // Subsequent values using Wilder's smoothing
  for (let i = period + 1; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result.push(100 - 100 / (1 + rs));
  }

  return result;
}

/** Normalize prices to a base index (base = 100) */
export function normalize(data: number[], baseIndex = 0): number[] {
  const baseValue = data[baseIndex];
  if (baseValue === 0) return data.map(() => 100);
  return data.map((v) => (v / baseValue) * 100);
}

/** Calculate percentage return */
export function calculateReturn(start: number, end: number): number {
  if (start === 0) return 0;
  return ((end - start) / start) * 100;
}

// ---------------------------------------------------------------------------
// Signal determination
// ---------------------------------------------------------------------------

export type Signal = 'Bullish' | 'Bearish' | 'Neutral';

export interface SignalResult {
  signal: Signal;
  value: string;
}

/** MACD signal: checks MACD vs signal line and histogram direction */
export function macdSignal(macdResult: MACDResult): SignalResult {
  const { macdLine, signalLine, histogram } = macdResult;
  const len = macdLine.length;

  const m = macdLine[len - 1];
  const s = signalLine[len - 1];
  const h = histogram[len - 1];
  const hPrev = histogram[len - 2];

  if (m == null || s == null || h == null) {
    return { signal: 'Neutral', value: 'Insufficient data' };
  }

  const crossover = m > s;
  const histRising = hPrev != null && h > hPrev;
  const histPositive = h > 0;

  if (crossover && histPositive && histRising) {
    return { signal: 'Bullish', value: `MACD above signal, histogram rising (${h.toFixed(2)})` };
  }
  if (!crossover && !histPositive && !histRising) {
    return { signal: 'Bearish', value: `MACD below signal, histogram falling (${h.toFixed(2)})` };
  }
  if (crossover) {
    return { signal: 'Bullish', value: `MACD above signal (${m.toFixed(2)} vs ${s.toFixed(2)})` };
  }
  if (!crossover) {
    return { signal: 'Bearish', value: `MACD below signal (${m.toFixed(2)} vs ${s.toFixed(2)})` };
  }
  return { signal: 'Neutral', value: `MACD: ${m.toFixed(2)}, Signal: ${s.toFixed(2)}` };
}

/** Bollinger Bands signal: checks %B position */
export function bollingerSignal(bb: BollingerResult): SignalResult {
  const len = bb.percentB.length;
  const pB = bb.percentB[len - 1];

  if (pB == null) {
    return { signal: 'Neutral', value: 'Insufficient data' };
  }

  if (pB < 0.2) {
    return { signal: 'Bullish', value: `%B = ${pB.toFixed(2)} (near lower band — oversold)` };
  }
  if (pB > 0.8) {
    return { signal: 'Bearish', value: `%B = ${pB.toFixed(2)} (near upper band — overbought)` };
  }
  return { signal: 'Neutral', value: `%B = ${pB.toFixed(2)} (within bands)` };
}

/** RSI signal: checks overbought/oversold */
export function rsiSignal(rsiValues: (number | null)[]): SignalResult {
  const len = rsiValues.length;
  const current = rsiValues[len - 1];

  if (current == null) {
    return { signal: 'Neutral', value: 'Insufficient data' };
  }

  if (current < 30) {
    return { signal: 'Bullish', value: `RSI = ${current.toFixed(1)} (oversold)` };
  }
  if (current > 70) {
    return { signal: 'Bearish', value: `RSI = ${current.toFixed(1)} (overbought)` };
  }
  return { signal: 'Neutral', value: `RSI = ${current.toFixed(1)}` };
}

/** SMA crossover signal: SMA(20) vs SMA(50) */
export function smaCrossSignal(sma20: (number | null)[], sma50: (number | null)[]): SignalResult {
  const len = sma20.length;
  const s20 = sma20[len - 1];
  const s50 = sma50[len - 1];

  if (s20 == null || s50 == null) {
    return { signal: 'Neutral', value: 'Insufficient data' };
  }

  if (s20 > s50) {
    return {
      signal: 'Bullish',
      value: `SMA(20) above SMA(50) (${s20.toFixed(2)} > ${s50.toFixed(2)})`,
    };
  }
  if (s20 < s50) {
    return {
      signal: 'Bearish',
      value: `SMA(20) below SMA(50) (${s20.toFixed(2)} < ${s50.toFixed(2)})`,
    };
  }
  return { signal: 'Neutral', value: `SMA(20) = SMA(50) (${s20.toFixed(2)})` };
}

/** Determine overall signal from individual signals */
export function overallSignal(signals: Signal[]): Signal {
  let bullish = 0;
  let bearish = 0;
  for (const s of signals) {
    if (s === 'Bullish') bullish++;
    if (s === 'Bearish') bearish++;
  }
  if (bullish > bearish) return 'Bullish';
  if (bearish > bullish) return 'Bearish';
  return 'Neutral';
}

// ---------------------------------------------------------------------------
// Pattern detection (simplified)
// ---------------------------------------------------------------------------

export interface PatternResult {
  name: string;
  signal: Signal;
  description: string;
}

export function detectSimplePatterns(prices: number[]): PatternResult[] {
  const patterns: PatternResult[] = [];
  const len = prices.length;
  if (len < 10) return patterns;

  // Trend detection
  const recent = prices.slice(-10);
  const first = recent[0];
  const last = recent[recent.length - 1];
  const changePct = ((last - first) / first) * 100;

  if (changePct > 3) {
    patterns.push({
      name: 'Uptrend',
      signal: 'Bullish',
      description: `+${changePct.toFixed(1)}% over last 10 sessions`,
    });
  } else if (changePct < -3) {
    patterns.push({
      name: 'Downtrend',
      signal: 'Bearish',
      description: `${changePct.toFixed(1)}% over last 10 sessions`,
    });
  }

  // Simple double-top detection (look for two peaks near the same level)
  if (len >= 20) {
    const window = prices.slice(-20);
    const peaks: number[] = [];
    for (let i = 1; i < window.length - 1; i++) {
      if (window[i] > window[i - 1] && window[i] > window[i + 1]) {
        peaks.push(window[i]);
      }
    }
    if (peaks.length >= 2) {
      const lastTwo = peaks.slice(-2);
      const diff = Math.abs(lastTwo[0] - lastTwo[1]) / lastTwo[0];
      if (diff < 0.02) {
        patterns.push({
          name: 'Double Top',
          signal: 'Bearish',
          description: `Two peaks near ${lastTwo[0].toFixed(2)} within 2%`,
        });
      }
    }

    // Simple double-bottom detection
    const troughs: number[] = [];
    for (let i = 1; i < window.length - 1; i++) {
      if (window[i] < window[i - 1] && window[i] < window[i + 1]) {
        troughs.push(window[i]);
      }
    }
    if (troughs.length >= 2) {
      const lastTwo = troughs.slice(-2);
      const diff = Math.abs(lastTwo[0] - lastTwo[1]) / lastTwo[0];
      if (diff < 0.02) {
        patterns.push({
          name: 'Double Bottom',
          signal: 'Bullish',
          description: `Two troughs near ${lastTwo[0].toFixed(2)} within 2%`,
        });
      }
    }
  }

  return patterns;
}
