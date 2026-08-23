/**
 * Small hand-rolled scale helpers for the career chart (PLAN §2.1 — no `d3` dependency for a
 * single line chart). Everything here is a pure function: given a career entry array, produce
 * the time domain, the cumulative-experience series, and per-entry marker positions, all derived
 * from the SAME linear scale functions so the drawn path and the markers can never drift apart.
 */

import type { CareerEntry } from '@/types/content.ts';

export type YearMonth = { year: number; month: number };

const YEAR_MONTH_PATTERN = /^(\d{4})-(\d{2})$/;

/** Parses a 'YYYY-MM' string. Throws on malformed input — this is a content-authoring bug. */
export function parseYearMonth(value: string): YearMonth {
  const match = YEAR_MONTH_PATTERN.exec(value);
  if (!match) {
    throw new Error(`Expected an ISO 'YYYY-MM' date, received "${value}"`);
  }
  const yearString = match[1];
  const monthString = match[2];
  if (yearString === undefined || monthString === undefined) {
    throw new Error(`Expected an ISO 'YYYY-MM' date, received "${value}"`);
  }
  const year = Number(yearString);
  const month = Number(monthString);
  if (month < 1 || month > 12) {
    throw new Error(`Month out of range in "${value}"`);
  }
  return { year, month };
}

function currentYearMonth(): YearMonth {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

/** Resolves a `start`/`end`-style date, where `end` may be the literal 'present'. */
export function resolveYearMonth(value: string | 'present'): YearMonth {
  return value === 'present' ? currentYearMonth() : parseYearMonth(value);
}

/** Absolute month index (year*12 + zero-based month) — a monotonic integer time axis. */
export function monthIndex({ year, month }: YearMonth): number {
  return year * 12 + (month - 1);
}

/** Whole months between two ISO 'YYYY-MM' values (or 'present'). Never negative. */
export function monthsBetween(start: string, end: string | 'present'): number {
  const startIndex = monthIndex(parseYearMonth(start));
  const endIndex = monthIndex(resolveYearMonth(end));
  return Math.max(0, endIndex - startIndex);
}

/** A linear scale: maps a domain interval to a range interval, both directions. Clamps by default. */
export type LinearScale = {
  (value: number): number;
  invert: (value: number) => number;
  domain: readonly [number, number];
  range: readonly [number, number];
};

export type LinearScaleOptions = {
  /** When true (default), output values are clamped to the range/domain edges. */
  clamp?: boolean;
};

/** Builds a linear scale function `domain -> range`, with an `.invert()` for `range -> domain`. */
export function linearScale(
  domain: readonly [number, number],
  range: readonly [number, number],
  options: LinearScaleOptions = {},
): LinearScale {
  const { clamp = true } = options;
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const domainSpan = d1 - d0;
  const rangeSpan = r1 - r0;

  const scale = ((value: number): number => {
    const ratio = domainSpan === 0 ? 0 : (value - d0) / domainSpan;
    const result = r0 + ratio * rangeSpan;
    if (!clamp) return result;
    const lo = Math.min(r0, r1);
    const hi = Math.max(r0, r1);
    return Math.min(hi, Math.max(lo, result));
  }) as LinearScale;

  scale.invert = (value: number): number => {
    const ratio = rangeSpan === 0 ? 0 : (value - r0) / rangeSpan;
    const result = d0 + ratio * domainSpan;
    if (!clamp) return result;
    const lo = Math.min(d0, d1);
    const hi = Math.max(d0, d1);
    return Math.min(hi, Math.max(lo, result));
  };

  scale.domain = domain;
  scale.range = range;

  return scale;
}

/** Generates `count` evenly spaced tick values across a domain, inclusive of both ends. */
export function ticks(domain: readonly [number, number], count: number): number[] {
  const [d0, d1] = domain;
  if (count <= 0) return [];
  if (count === 1 || d0 === d1) return [d0];
  const step = (d1 - d0) / (count - 1);
  return Array.from({ length: count }, (_, i) => d0 + step * i);
}

/** Generates one tick per calendar year covered by a month-index domain (PLAN chart year ticks). */
export function yearTicks(
  domain: readonly [number, number],
): { monthIndex: number; year: number }[] {
  const [d0, d1] = domain;
  const lo = Math.min(d0, d1);
  const hi = Math.max(d0, d1);
  const startYear = Math.ceil(lo / 12);
  const endYear = Math.floor(hi / 12);
  const result: { monthIndex: number; year: number }[] = [];
  for (let year = startYear; year <= endYear; year += 1) {
    result.push({ monthIndex: year * 12, year });
  }
  return result;
}

/** A point on the cumulative-experience series: a month index and the cumulative total at it. */
export type SeriesPoint = { x: number; y: number };

/** A resolved plotting position for one career entry, in the same units as the series. */
export type EntryMarker = {
  id: string;
  x: number;
  y: number;
  scope: number;
  kind: CareerEntry['kind'];
};

export type CareerSeries = {
  /** [earliest start month index, latest end month index (or now, for 'present')]. */
  xDomain: readonly [number, number];
  /** [0, total accrued work months]. */
  yDomain: readonly [number, number];
  /**
   * The cumulative-experience path as an ordered list of (month index, cumulative months) points.
   * Only 'work' entries accrue; gaps between work entries render as flat plateaus (no
   * interpolation across idle time), and education/milestone entries do not raise the line.
   */
  series: SeriesPoint[];
  /** One marker per entry (work, education, and milestone), positioned on/relative to the series. */
  markers: EntryMarker[];
};

/**
 * Builds the whole-career time series: the x (time) domain, the cumulative-months-of-experience
 * y series (work entries only — education never accrues), and a marker position per entry.
 *
 * Critical behaviour (PLAN §1.1, §2.1): employment gaps must render FLAT. The series is built by
 * walking entries in chronological order and only ever incrementing cumulative months across a
 * 'work' entry's own start→end span; time between entries (including gaps) contributes zero and
 * is represented as a flat segment at the running total.
 */
export function buildCareerSeries(entries: readonly CareerEntry[]): CareerSeries {
  if (entries.length === 0) {
    return { xDomain: [0, 0], yDomain: [0, 0], series: [], markers: [] };
  }

  const chronological = [...entries].sort(
    (a, b) => monthIndex(parseYearMonth(a.start)) - monthIndex(parseYearMonth(b.start)),
  );

  const xStart = Math.min(...chronological.map((entry) => monthIndex(parseYearMonth(entry.start))));
  const xEnd = Math.max(...chronological.map((entry) => monthIndex(resolveYearMonth(entry.end))));

  const series: SeriesPoint[] = [{ x: xStart, y: 0 }];
  const markers: EntryMarker[] = [];
  let cumulative = 0;

  for (const entry of chronological) {
    const entryStart = monthIndex(parseYearMonth(entry.start));
    const entryEnd = monthIndex(resolveYearMonth(entry.end));

    // Flat plateau up to this entry's start, at whatever the running total already is (this is
    // what keeps a gap — or a non-accruing education entry — from being interpolated).
    series.push({ x: entryStart, y: cumulative });

    // Marker sits at the entry's start, on the series value at that point in time — i.e. before
    // this entry's own contribution (if any) is added.
    markers.push({
      id: entry.id,
      x: entryStart,
      y: cumulative,
      scope: entry.scope,
      kind: entry.kind,
    });

    if (entry.kind === 'work') {
      cumulative += Math.max(0, entryEnd - entryStart);
      series.push({ x: entryEnd, y: cumulative });
    }
  }

  // Extend flat to the domain end so the path always spans the full x domain.
  const lastPoint = series[series.length - 1];
  if (lastPoint && lastPoint.x < xEnd) {
    series.push({ x: xEnd, y: cumulative });
  }

  return {
    xDomain: [xStart, xEnd],
    yDomain: [0, cumulative],
    series,
    markers,
  };
}

/**
 * Linear interpolation of the drawn series at an arbitrary x (month index) — matches what the
 * straight-line SVG path renders at that point. Used to place the crosshair readout in between
 * marker points. Flat within a gap (both bracketing points share the same y) falls out for free.
 */
export function seriesValueAt(series: readonly SeriesPoint[], x: number): number {
  if (series.length === 0) return 0;
  const first = series[0];
  if (!first || x <= first.x) return first?.y ?? 0;
  const last = series[series.length - 1];
  if (last && x >= last.x) return last.y;

  for (let i = 1; i < series.length; i += 1) {
    const previous = series[i - 1];
    const current = series[i];
    if (!previous || !current) continue;
    if (x <= current.x) {
      const span = current.x - previous.x;
      const ratio = span === 0 ? 0 : (x - previous.x) / span;
      return previous.y + ratio * (current.y - previous.y);
    }
  }
  return last?.y ?? 0;
}
