/**
 * Date/duration helpers for career entries. Every value in `career.ts` uses ISO 'YYYY-MM' for
 * `start`/`end` (or the literal 'present' for `end`), so all parsing here is anchored to that
 * one format rather than a general date parser.
 */

const MONTH_LABELS = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
] as const;

const YEAR_MONTH_PATTERN = /^(\d{4})-(\d{2})$/;

type YearMonth = { year: number; month: number };

/** Parses a 'YYYY-MM' string. Throws on malformed input — this is a content-authoring bug. */
function parseYearMonth(value: string): YearMonth {
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

function monthIndex({ year, month }: YearMonth): number {
  return year * 12 + (month - 1);
}

/**
 * Total whole months between `start` (inclusive) and `end` (exclusive), where `end` may be the
 * literal 'present' to measure up to the current month. Never negative.
 */
export function tenureMonths(start: string, end: string | 'present'): number {
  const startYearMonth = parseYearMonth(start);
  const endYearMonth = end === 'present' ? currentYearMonth() : parseYearMonth(end);
  return Math.max(0, monthIndex(endYearMonth) - monthIndex(startYearMonth));
}

/** Formats a month count as "2y 4m", "2y", or "4m". Zero months renders as "0m". */
export function formatTenure(months: number): string {
  const totalMonths = Math.max(0, Math.round(months));
  const years = Math.floor(totalMonths / 12);
  const remainderMonths = totalMonths % 12;

  if (years === 0) {
    return `${String(remainderMonths)}m`;
  }
  if (remainderMonths === 0) {
    return `${String(years)}y`;
  }
  return `${String(years)}y ${String(remainderMonths)}m`;
}

export type PeriodGranularity = 'year' | 'month';

function formatYearMonthLabel(yearMonth: YearMonth, granularity: PeriodGranularity): string {
  if (granularity === 'year') {
    return String(yearMonth.year);
  }
  const monthLabel = MONTH_LABELS[yearMonth.month - 1] ?? 'INVALID';
  return `${monthLabel} ${String(yearMonth.year)}`;
}

/**
 * Formats a `start`/`end` pair for display, e.g. `formatPeriod('2023-09', 'present')` →
 * "2023 — PRESENT". Pass `granularity: 'month'` for the fuller "SEP 2023 — PRESENT" form used in
 * role card detail views.
 */
export function formatPeriod(
  start: string,
  end: string | 'present',
  granularity: PeriodGranularity = 'year',
): string {
  const startLabel = formatYearMonthLabel(parseYearMonth(start), granularity);
  const endLabel =
    end === 'present' ? 'PRESENT' : formatYearMonthLabel(parseYearMonth(end), granularity);
  return `${startLabel} — ${endLabel}`;
}
