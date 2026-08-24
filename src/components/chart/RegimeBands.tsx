/**
 * Faint labelled background bands marking the three career regimes (PLAN §1.3 item 1). Boundaries
 * are derived from `career.ts` `regime` fields via `buildRegimeBands` - never hardcoded dates.
 */

import type { ChartGeometry } from '@/components/chart/geometry.ts';
import { buildRegimeBands } from '@/components/chart/regimes.ts';
import type { CareerEntry } from '@/types/content.ts';
import { useMemo } from 'react';

export type RegimeBandsProps = {
  entries: readonly CareerEntry[];
  geometry: ChartGeometry;
};

export default function RegimeBands({ entries, geometry }: RegimeBandsProps) {
  const bands = useMemo(() => buildRegimeBands(entries), [entries]);
  const { orientation, width, height, padding, timeScale } = geometry;

  return (
    <g>
      {bands.map((band) => {
        const start = timeScale(band.startMonth);
        const end = timeScale(band.endMonth);

        if (orientation === 'horizontal') {
          const x = Math.min(start, end);
          const bandWidth = Math.abs(end - start);
          // Narrow bands (a short regime near the right edge) cannot fit the full label without
          // colliding with the next one, so drop the date range first and the label second.
          const charWidth = 6.7; // 9px mono + 0.12em tracking, measured
          const available = bandWidth - 12;
          const full = `${band.label} · ${band.rangeLabel}`;
          const labelText =
            full.length * charWidth <= available
              ? full
              : band.label.length * charWidth <= available
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
                strokeWidth={1}
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
        }

        // Vertical (mobile) orientation: a narrow gutter has no room for readable labels, so
        // render just the tinted strip and a boundary tick - same data, no label clutter.
        const y = Math.min(start, end);
        const bandHeight = Math.abs(end - start);
        return (
          <g key={band.regime + String(band.startMonth)}>
            <rect
              x={padding.left}
              y={y}
              width={Math.max(0, width - padding.left - padding.right)}
              height={bandHeight}
              fill="var(--color-accent)"
              opacity={0.05}
            />
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={y}
              y2={y}
              stroke="var(--color-border)"
              strokeWidth={1}
            />
          </g>
        );
      })}
    </g>
  );
}
