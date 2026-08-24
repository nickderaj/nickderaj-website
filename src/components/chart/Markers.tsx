/**
 * One dot per career entry, positioned from the exact same scale functions used to draw the path
 * (`geometry.toPoint`) so markers can never drift off the line. Radius derives from `scope`
 * (PLAN §1.1 - scope drives marker weight only, never a plotted axis value).
 */

import type { ChartGeometry } from '@/components/chart/geometry.ts';

const MIN_RADIUS = 3;
const MAX_RADIUS = 8;
const ACTIVE_RING_PADDING = 4;

export type MarkersProps = {
  geometry: ChartGeometry;
  activeEntryId: string | null;
};

function radiusForScope(scope: number): number {
  const clamped = Math.min(1, Math.max(0, scope));
  return MIN_RADIUS + clamped * (MAX_RADIUS - MIN_RADIUS);
}

export default function Markers({ geometry, activeEntryId }: MarkersProps) {
  const { unitScale } = geometry;

  return (
    <g>
      {geometry.markers.map((marker) => {
        const point = geometry.toPoint(marker.x, marker.y);
        const radius = radiusForScope(marker.scope) * unitScale;
        const isActive = marker.id === activeEntryId;

        return (
          <g key={marker.id}>
            {isActive && (
              <circle
                cx={point.x}
                cy={point.y}
                r={radius + ACTIVE_RING_PADDING * unitScale}
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth={1.5 * unitScale}
                opacity={0.5}
              />
            )}
            <circle
              cx={point.x}
              cy={point.y}
              r={radius}
              fill={isActive ? 'var(--color-accent)' : 'var(--color-ground)'}
              stroke={isActive ? 'var(--color-accent)' : 'var(--color-muted)'}
              strokeWidth={isActive ? 0 : 1.5 * unitScale}
            />
          </g>
        );
      })}
    </g>
  );
}
