import { describe, expect, it } from 'vitest';
import type { CareerEntry } from '@/types/content.ts';
import {
  buildCareerSeries,
  linearScale,
  monthIndex,
  monthsBetween,
  parseYearMonth,
  seriesValueAt,
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
    const domain: [number, number] = [monthIndex({ year: 2013, month: 9 }), monthIndex({ year: 2016, month: 6 })];
    const result = yearTicks(domain);
    expect(result.map((t) => t.year)).toEqual([2014, 2015, 2016]);
  });
});

const workEntry = (
  overrides: Partial<CareerEntry> & Pick<CareerEntry, 'id' | 'start' | 'end'>,
): CareerEntry => ({
  role: 'Role',
  org: 'Org',
  location: 'Location',
  kind: 'work',
  regime: null,
  scope: 0.5,
  stack: [],
  summary: '',
  highlights: [],
  ...overrides,
});

describe('seriesValueAt', () => {
  it('linearly interpolates within an accruing segment', () => {
    const series = [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
    ];
    expect(seriesValueAt(series, 5)).toBe(5);
  });

  it('is flat across a gap segment (equal y at both ends)', () => {
    const series = [
      { x: 0, y: 6 },
      { x: 10, y: 6 },
    ];
    expect(seriesValueAt(series, 4)).toBe(6);
    expect(seriesValueAt(series, 10)).toBe(6);
  });

  it('clamps to the first/last value outside the series domain', () => {
    const series = [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
    ];
    expect(seriesValueAt(series, -5)).toBe(0);
    expect(seriesValueAt(series, 50)).toBe(10);
  });

  it('returns 0 for an empty series', () => {
    expect(seriesValueAt([], 5)).toBe(0);
  });
});

describe('buildCareerSeries', () => {
  it('returns an empty series for no entries', () => {
    const result = buildCareerSeries([]);
    expect(result.series).toEqual([]);
    expect(result.markers).toEqual([]);
    expect(result.xDomain).toEqual([0, 0]);
    expect(result.yDomain).toEqual([0, 0]);
  });

  it('accrues cumulative months only across work entries', () => {
    const entries: CareerEntry[] = [
      workEntry({ id: 'a', start: '2020-01', end: '2020-07' }), // 6 months work
      workEntry({ id: 'b', start: '2020-07', end: '2020-09', kind: 'education' }), // 2 months, no accrual
      workEntry({ id: 'c', start: '2020-09', end: '2021-01' }), // 4 months work
    ];
    const { series, yDomain } = buildCareerSeries(entries);
    expect(yDomain).toEqual([0, 10]);
    const last = series[series.length - 1];
    expect(last?.y).toBe(10);
  });

  it('renders a flat plateau across an employment gap, not interpolation', () => {
    const entries: CareerEntry[] = [
      workEntry({ id: 'first', start: '2017-04', end: '2020-09' }),
      // gap: 2020-09 -> 2021-08, no entry covers this span
      workEntry({ id: 'second', start: '2021-08', end: '2022-09' }),
    ];
    const { series } = buildCareerSeries(entries);

    const gapStart = monthIndex(parseYearMonth('2020-09'));
    const gapEnd = monthIndex(parseYearMonth('2021-08'));

    const valueAt = (x: number): number | undefined => {
      // Reconstruct the step-function value at x from the ordered series points.
      let value: number | undefined;
      for (const point of series) {
        if (point.x <= x) value = point.y;
      }
      return value;
    };

    const valueAtGapStart = valueAt(gapStart);
    const valueAtGapEnd = valueAt(gapEnd);
    expect(valueAtGapStart).toBe(valueAtGapEnd);
    expect(valueAtGapStart).toBe(monthsBetween('2017-04', '2020-09'));

    // No series point strictly between the gap's start and end should show a higher value —
    // i.e. the plateau, not a ramp.
    const midGapPoints = series.filter((point) => point.x > gapStart && point.x < gapEnd);
    for (const point of midGapPoints) {
      expect(point.y).toBe(valueAtGapStart);
    }
  });

  it('places every marker exactly on the series path', () => {
    const entries: CareerEntry[] = [
      workEntry({ id: 'a', start: '2017-04', end: '2020-09' }),
      workEntry({ id: 'b', start: '2021-08', end: '2022-09' }),
      workEntry({ id: 'edu', start: '2013-09', end: '2016-06', kind: 'education' }),
    ];
    const { series, markers } = buildCareerSeries(entries);

    const valueAt = (x: number): number | undefined => {
      let value: number | undefined;
      for (const point of series) {
        if (point.x <= x) value = point.y;
      }
      return value;
    };

    for (const marker of markers) {
      expect(marker.y).toBe(valueAt(marker.x));
    }
  });

  it('computes an x domain spanning the earliest start to the latest end (present resolves to now)', () => {
    const entries: CareerEntry[] = [
      workEntry({ id: 'a', start: '2013-09', end: '2016-06', kind: 'education' }),
      workEntry({ id: 'b', start: '2024-05', end: 'present' }),
    ];
    const { xDomain } = buildCareerSeries(entries);
    expect(xDomain[0]).toBe(monthIndex(parseYearMonth('2013-09')));
    const now = new Date();
    expect(xDomain[1]).toBe(monthIndex({ year: now.getFullYear(), month: now.getMonth() + 1 }));
  });

  it('is monotonic non-decreasing across the whole series', () => {
    const entries: CareerEntry[] = [
      workEntry({ id: 'a', start: '2017-04', end: '2020-09' }),
      workEntry({ id: 'b', start: '2021-08', end: '2022-09' }),
      workEntry({ id: 'c', start: '2022-09', end: '2023-09' }),
    ];
    const { series } = buildCareerSeries(entries);
    for (let i = 1; i < series.length; i += 1) {
      const previous = series[i - 1];
      const current = series[i];
      expect(current?.y).toBeGreaterThanOrEqual(previous?.y ?? 0);
      expect(current?.x).toBeGreaterThanOrEqual(previous?.x ?? 0);
    }
  });
});
