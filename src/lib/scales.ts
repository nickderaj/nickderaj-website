/**
 * Small hand-rolled scale helpers for the career chart (PLAN §2.1 - no `d3` dependency). Pure
 * date/domain/scale primitives: parsing 'YYYY-MM' career dates, a linear `domain -> range` scale
 * with `.invert()`, and axis tick generation. The chart's plotted values themselves (the
 * decorative candle series) live in `src/lib/candles.ts`; `src/components/chart/geometry.ts`
 * combines both into the geometry the chart, markers, and crosshair all share.
 */

export type YearMonth = { year: number; month: number };

const YEAR_MONTH_PATTERN = /^(\d{4})-(\d{2})$/;

/** Parses a 'YYYY-MM' string. Throws on malformed input - this is a content-authoring bug. */
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

/** Absolute month index (year*12 + zero-based month) - a monotonic integer time axis. */
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
