/**
 * Derives the career chart's regime bands (PLAN §1.3 item 1) from `career.ts` `regime` fields -  * never hardcoded dates. Contiguous chronological entries sharing a regime are merged into one
 * band; entries with `regime: null` (education) are skipped and simply leave a gap.
 */

import { monthIndex, parseYearMonth, resolveYearMonth, type YearMonth } from '@/lib/scales.ts';
import type { CareerEntry } from '@/types/content.ts';

export type CareerRegime = NonNullable<CareerEntry['regime']>;

export type RegimeBand = {
  regime: CareerRegime;
  label: string;
  rangeLabel: string;
  startMonth: number;
  endMonth: number;
};

const REGIME_LABELS: Record<CareerRegime, string> = {
  commodities: 'PHYSICAL COMMODITIES',
  software: 'SOFTWARE ENGINEERING',
  quant: 'QUANT',
};

type OpenBand = {
  regime: CareerRegime;
  startYearMonth: YearMonth;
  endYearMonth: YearMonth;
  endIsPresent: boolean;
};

/** Builds the ordered list of regime bands by walking entries in chronological order. */
export function buildRegimeBands(entries: readonly CareerEntry[]): RegimeBand[] {
  const chronological = [...entries].sort(
    (a, b) => monthIndex(parseYearMonth(a.start)) - monthIndex(parseYearMonth(b.start)),
  );

  const openBands: OpenBand[] = [];

  for (const entry of chronological) {
    if (entry.regime === null) continue;
    const startYearMonth = parseYearMonth(entry.start);
    const endYearMonth = resolveYearMonth(entry.end);
    const endIsPresent = entry.end === 'present';

    const current = openBands[openBands.length - 1];
    if (current?.regime === entry.regime) {
      if (monthIndex(endYearMonth) > monthIndex(current.endYearMonth)) {
        current.endYearMonth = endYearMonth;
        current.endIsPresent = endIsPresent;
      }
    } else {
      openBands.push({ regime: entry.regime, startYearMonth, endYearMonth, endIsPresent });
    }
  }

  return openBands.map((band) => ({
    regime: band.regime,
    label: REGIME_LABELS[band.regime],
    rangeLabel: formatRangeLabel(band),
    startMonth: monthIndex(band.startYearMonth),
    endMonth: monthIndex(band.endYearMonth),
  }));
}

function formatRangeLabel(band: OpenBand): string {
  const startYear = band.startYearMonth.year;
  const endYear = band.endYearMonth.year;
  if (band.endIsPresent) return `${String(startYear)}–`;
  if (startYear === endYear) return String(startYear);
  return `${String(startYear)}–${String(endYear)}`;
}
