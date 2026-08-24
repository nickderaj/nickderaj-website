import { describe, expect, it } from 'vitest';
import { formatPeriod, formatTenure, tenureMonths } from './format.ts';

describe('tenureMonths', () => {
  it('computes whole months between two ISO year-months', () => {
    expect(tenureMonths('2022-09', '2023-09')).toBe(12);
    expect(tenureMonths('2024-01', '2024-04')).toBe(3);
    expect(tenureMonths('2017-04', '2020-09')).toBe(41);
  });

  it('treats "present" as the current year-month', () => {
    const now = new Date();
    const nowKey = `${String(now.getFullYear())}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    expect(tenureMonths(nowKey, 'present')).toBe(0);
  });

  it('never returns a negative value', () => {
    expect(tenureMonths('2025-01', '2024-01')).toBe(0);
  });

  it('throws on malformed input', () => {
    expect(() => tenureMonths('2024-1', 'present')).toThrow();
    expect(() => tenureMonths('2024-13', 'present')).toThrow();
  });
});

describe('formatTenure', () => {
  it('formats years and months', () => {
    expect(formatTenure(28)).toBe('2y 4m');
  });

  it('formats whole years with no remainder', () => {
    expect(formatTenure(24)).toBe('2y');
  });

  it('formats sub-year durations as months only', () => {
    expect(formatTenure(3)).toBe('3m');
  });

  it('formats zero as "0m"', () => {
    expect(formatTenure(0)).toBe('0m');
  });
});

describe('formatPeriod', () => {
  it('formats a year-granularity period with "present"', () => {
    expect(formatPeriod('2023-09', 'present')).toBe('2023 - PRESENT');
  });

  it('formats a year-granularity period with a fixed end', () => {
    expect(formatPeriod('2017-04', '2020-09')).toBe('2017 - 2020');
  });

  it('formats a month-granularity period', () => {
    expect(formatPeriod('2024-01', '2024-04', 'month')).toBe('JAN 2024 - APR 2024');
  });
});
