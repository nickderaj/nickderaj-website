/**
 * Faint labelled background bands marking the three career regimes (PLAN §1.3 item 1). Boundaries
 * are derived from `career.ts` `regime` fields via `buildRegimeBands` - never hardcoded dates.
 *
 * The mobile ticker draws the tinted strips and boundary rules but no labels: it sits behind the
 * role-card text, where a second layer of type would only compete with it.
 */

import type { ChartGeometry } from '@/components/chart/geometry.ts';
import { buildRegimeBands } from '@/components/chart/regimes.ts';
import type { CareerEntry } from '@/types/content.ts';
import { useMemo } from 'react';

export type RegimeBandsProps = {
  entries: readonly CareerEntry[];
  geometry: ChartGeometry;
};

/** Width of one mono character at the label's size: 9px + 0.12em tracking, measured. */
const LABEL_CHAR_WIDTH = 6.7;

export default function RegimeBands({ entries, geometry }: RegimeBandsProps) {
  const bands = useMemo(() => buildRegimeBands(entries), [entries]);
  const { orientation, height, padding, timeScale, unitScale } = geometry;
  const showLabels = orientation === 'horizontal';

  return (
    <g>
      {bands.map((band) => {
        const start = timeScale(band.startMonth);
        const end = timeScale(band.endMonth);
        const x = Math.min(start, end);
        const bandWidth = Math.abs(end - start);

        // Narrow bands (a short regime near the right edge) cannot fit the full label without
        // colliding with the next one, so drop the date range first and the label second.
        const available = bandWidth - 12;
        const full = `${band.label} · ${band.rangeLabel}`;
        const labelText = !showLabels
          ? null
          : full.length * LABEL_CHAR_WIDTH <= available
            ? full
            : band.label.length * LABEL_CHAR_WIDTH <= available
              ? band.label
              : null;

        return (
          <g key={band.regime + String(band.startMonth)}>
            <rect
              x={x}
              y={padding.top}
              width={bandWidth}
              height={Math.max(0, height - padding.top - padding.bottom)}
              fill="var(--color-accent)"
              opacity={0.05}
            />
            <line
              x1={x}
              x2={x}
              y1={padding.top}
              y2={height - padding.bottom}
              stroke="var(--color-border)"
              strokeWidth={unitScale}
            />
            {labelText !== null && (
              <text
                x={x + 8}
                y={padding.top - 12}
                fontFamily="var(--font-mono)"
                fontSize={9}
                letterSpacing="0.12em"
                fill="var(--color-muted)"
              >
                {labelText}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}
