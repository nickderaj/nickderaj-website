import { describe, expect, it } from 'vitest';
import { candlePriceDomain, candleValueAt, generateCandles, mulberry32 } from './candles.ts';

describe('mulberry32', () => {
  it('is deterministic: the same seed always yields the same sequence', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const seqA = Array.from({ length: 5 }, () => a());
    const seqB = Array.from({ length: 5 }, () => b());
    expect(seqA).toEqual(seqB);
  });

  it('yields floats in [0, 1)', () => {
    const random = mulberry32(1);
    for (let i = 0; i < 100; i += 1) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('produces different sequences for different seeds', () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    expect(a()).not.toBe(b());
  });
});

describe('generateCandles', () => {
  it('is deterministic across repeated calls with the same inputs', () => {
    const transitions = new Set([5, 10]);
    const first = generateCandles(0, 20, transitions);
    const second = generateCandles(0, 20, transitions);
    expect(first).toEqual(second);
  });

  it('produces one candle per month in the inclusive range', () => {
    const candles = generateCandles(0, 11, new Set());
    expect(candles).toHaveLength(12);
    expect(candles[0]?.month).toBe(0);
    expect(candles[candles.length - 1]?.month).toBe(11);
  });

  it('returns an empty array when the range is invalid', () => {
    expect(generateCandles(10, 5, new Set())).toEqual([]);
  });

  it('every candle has high >= max(open, close) and low <= min(open, close)', () => {
    const candles = generateCandles(0, 100, new Set([20, 50, 80]));
    for (const candle of candles) {
      expect(candle.high).toBeGreaterThanOrEqual(Math.max(candle.open, candle.close));
      expect(candle.low).toBeLessThanOrEqual(Math.min(candle.open, candle.close));
      expect(candle.low).toBeGreaterThan(0);
    }
  });

  it('marks exactly the given transition months, and only those, as transitions', () => {
    const transitions = new Set([3, 7]);
    const candles = generateCandles(0, 10, transitions);
    const flagged = candles.filter((c) => c.isTransition).map((c) => c.month);
    expect(flagged.sort((a, b) => a - b)).toEqual([3, 7]);
  });

  it('renders a transition month as a conspicuous up spike, taller than the surrounding noise', () => {
    const transitions = new Set([50]);
    const candles = generateCandles(0, 100, transitions);
    const transitionCandle = candles.find((c) => c.month === 50);
    expect(transitionCandle).toBeDefined();
    expect(transitionCandle?.close).toBeGreaterThan(transitionCandle?.open ?? 0);

    const transitionBody = Math.abs((transitionCandle?.close ?? 0) - (transitionCandle?.open ?? 0));
    const otherBodies = candles
      .filter((c) => c.month !== 50)
      .map((c) => Math.abs(c.close - c.open));
    const averageOtherBody = otherBodies.reduce((sum, b) => sum + b, 0) / otherBodies.length;
    expect(transitionBody).toBeGreaterThan(averageOtherBody * 3);
  });

  it('is not monotonic — the series has genuine ups and downs', () => {
    const candles = generateCandles(0, 120, new Set());
    let increases = 0;
    let decreases = 0;
    for (let i = 1; i < candles.length; i += 1) {
      const previous = candles[i - 1];
      const current = candles[i];
      if (!previous || !current) continue;
      if (current.close > previous.close) increases += 1;
      if (current.close < previous.close) decreases += 1;
    }
    expect(increases).toBeGreaterThan(0);
    expect(decreases).toBeGreaterThan(0);
  });

  it('produces the same output regardless of call site or timing (no Math.random dependency)', () => {
    const runs = Array.from({ length: 3 }, () => generateCandles(0, 30, new Set([10])));
    expect(runs[0]).toEqual(runs[1]);
    expect(runs[1]).toEqual(runs[2]);
  });
});

describe('candlePriceDomain', () => {
  it('returns [0, 1] for an empty series', () => {
    expect(candlePriceDomain([])).toEqual([0, 1]);
  });

  it('returns the min low and max high across all candles', () => {
    const candles = generateCandles(0, 50, new Set([25]));
    const [low, high] = candlePriceDomain(candles);
    for (const candle of candles) {
      expect(candle.low).toBeGreaterThanOrEqual(low);
      expect(candle.high).toBeLessThanOrEqual(high);
    }
  });
});

describe('candleValueAt', () => {
  it('returns 0 for an empty series', () => {
    expect(candleValueAt([], 5)).toBe(0);
  });

  it('clamps to the first/last close outside the series domain', () => {
    const candles = generateCandles(0, 10, new Set());
    const first = candles[0];
    const last = candles[candles.length - 1];
    expect(candleValueAt(candles, -100)).toBe(first?.close);
    expect(candleValueAt(candles, 1000)).toBe(last?.close);
  });

  it('interpolates linearly between adjacent candle closes', () => {
    const candles = [
      { month: 0, open: 100, high: 110, low: 90, close: 100, isTransition: false },
      { month: 10, open: 100, high: 120, low: 100, close: 110, isTransition: false },
    ];
    expect(candleValueAt(candles, 5)).toBeCloseTo(105);
  });
});
