import { describe, expect, it } from 'vitest';
import {
  linearScale,
  monthIndex,
  monthsBetween,
  parseYearMonth,
  ticks,
  yearTicks,
} from './scales.ts';

describe('parseYearMonth', () => {
  it('parses a valid ISO year-month', () => {
    expect(parseYearMonth('2024-05')).toEqual({ year: 2024, month: 5 });
  });

  it('throws on malformed input', () => {
    expect(() => parseYearMonth('2024-5')).toThrow();
    expect(() => parseYearMonth('2024-13')).toThrow();
    expect(() => parseYearMonth('not-a-date')).toThrow();
  });
});

describe('monthIndex', () => {
  it('is monotonic across year boundaries', () => {
    const dec = monthIndex({ year: 2023, month: 12 });
    const jan = monthIndex({ year: 2024, month: 1 });
    expect(jan).toBe(dec + 1);
  });
});

describe('monthsBetween', () => {
  it('computes whole months between two ISO dates', () => {
    expect(monthsBetween('2022-09', '2023-09')).toBe(12);
    expect(monthsBetween('2017-04', '2020-09')).toBe(41);
  });

  it('never returns a negative value', () => {
    expect(monthsBetween('2025-01', '2024-01')).toBe(0);
  });
});

describe('linearScale', () => {
  it('maps domain to range linearly', () => {
    const scale = linearScale([0, 10], [0, 100]);
    expect(scale(0)).toBe(0);
    expect(scale(5)).toBe(50);
    expect(scale(10)).toBe(100);
  });

  it('inverts range back to domain', () => {
    const scale = linearScale([0, 10], [0, 100]);
    expect(scale.invert(50)).toBe(5);
    expect(scale.invert(0)).toBe(0);
    expect(scale.invert(100)).toBe(10);
  });

  it('clamps values outside the domain/range by default', () => {
    const scale = linearScale([0, 10], [0, 100]);
    expect(scale(-5)).toBe(0);
    expect(scale(15)).toBe(100);
    expect(scale.invert(-10)).toBe(0);
    expect(scale.invert(200)).toBe(10);
  });

  it('supports an inverted range (e.g. for a flipped y-axis)', () => {
    const scale = linearScale([0, 10], [100, 0]);
    expect(scale(0)).toBe(100);
    expect(scale(10)).toBe(0);
    expect(scale(5)).toBe(50);
  });

  it('does not clamp when clamp is disabled', () => {
    const scale = linearScale([0, 10], [0, 100], { clamp: false });
    expect(scale(15)).toBe(150);
    expect(scale(-5)).toBe(-50);
  });
});

describe('ticks', () => {
  it('generates evenly spaced ticks including both ends', () => {
    expect(ticks([0, 10], 3)).toEqual([0, 5, 10]);
  });

  it('returns the single domain start for a degenerate domain', () => {
    expect(ticks([5, 5], 4)).toEqual([5]);
  });

  it('returns an empty array for a non-positive count', () => {
    expect(ticks([0, 10], 0)).toEqual([]);
  });
});

describe('yearTicks', () => {
  it('produces one tick per whole calendar year in the domain', () => {
    const domain: [number, number] = [
      monthIndex({ year: 2013, month: 9 }),
      monthIndex({ year: 2016, month: 6 }),
    ];
    const result = yearTicks(domain);
    expect(result.map((t) => t.year)).toEqual([2014, 2015, 2016]);
  });
});
