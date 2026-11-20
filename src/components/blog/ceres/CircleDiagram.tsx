// @ts-nocheck -- ported from the Ceres blog; kept as-is rather than rewritten for this repo's stricter tsconfig.
const N = 6;
const RADIUS = 120;
const CX = 160;
const CY = 160;
const DOT_R = 6;

function pointOnCircle(index: number, total: number): { x: number; y: number } {
  const angle = (2 * Math.PI * index) / total - Math.PI / 2;
  return { x: CX + RADIUS * Math.cos(angle), y: CY + RADIUS * Math.sin(angle) };
}

function label(index: number, startIndex: number, total: number): string {
  const offset = ((index - startIndex + total) % total) + 1;
  if (offset === 1) return 'i';
  if (offset === 2) return 'i+1';
  if (offset === 3) return 'i+2';
  if (offset === total) return 'i-1';
  if (offset === total - 1) return 'i-2';
  return `${offset}`;
}

function arcPath(startAngle: number, endAngle: number, r: number): string {
  const x1 = CX + r * Math.cos(startAngle);
  const y1 = CY + r * Math.sin(startAngle);
  const x2 = CX + r * Math.cos(endAngle);
  const y2 = CY + r * Math.sin(endAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M ${CX} ${CY} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

export function CircleDiagram() {
  const startIndex = 0;
  const startAngle = (2 * Math.PI * startIndex) / N - Math.PI / 2;
  const endAngle = startAngle + Math.PI;

  const points = Array.from({ length: N }, (_, i) => ({
    ...pointOnCircle(i, N),
    label: label(i, startIndex, N),
    inSemicircle: true,
  }));

  const labelOffset = 22;

  return (
    <figure className="ceres-chart">
      <div className="ceres-chart__header">
        <div className="ceres-chart__title">
          N Points on a Circle: Clockwise Semicircle from Point i
        </div>
      </div>
      <div className="flex justify-center py-4">
        <svg width="320" height="320" viewBox="0 0 320 320">
          {/* Semicircle fill */}
          <path d={arcPath(startAngle, endAngle, RADIUS)} fill="#a6e3a1" fillOpacity={0.15} />

          {/* Semicircle arc highlight */}
          <path
            d={`M ${CX + RADIUS * Math.cos(startAngle)} ${CY + RADIUS * Math.sin(startAngle)} A ${RADIUS} ${RADIUS} 0 1 1 ${CX + RADIUS * Math.cos(endAngle)} ${CY + RADIUS * Math.sin(endAngle)}`}
            fill="none"
            stroke="#a6e3a1"
            strokeWidth={3}
            strokeOpacity={0.8}
          />

          {/* Full circle outline */}
          <circle
            cx={CX}
            cy={CY}
            r={RADIUS}
            fill="none"
            stroke="#585b70"
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />

          {/* Semicircle boundary lines */}
          <line
            x1={CX}
            y1={CY}
            x2={CX + RADIUS * Math.cos(startAngle)}
            y2={CY + RADIUS * Math.sin(startAngle)}
            stroke="#a6e3a1"
            strokeWidth={1}
            strokeOpacity={0.5}
            strokeDasharray="4 3"
          />
          <line
            x1={CX}
            y1={CY}
            x2={CX + RADIUS * Math.cos(endAngle)}
            y2={CY + RADIUS * Math.sin(endAngle)}
            stroke="#a6e3a1"
            strokeWidth={1}
            strokeOpacity={0.5}
            strokeDasharray="4 3"
          />

          {/* Arrow showing clockwise direction */}
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="4" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#a6adc8" />
            </marker>
          </defs>
          <path
            d={`M ${CX + (RADIUS + 16) * Math.cos(startAngle + 0.3)} ${CY + (RADIUS + 16) * Math.sin(startAngle + 0.3)} A ${RADIUS + 16} ${RADIUS + 16} 0 0 1 ${CX + (RADIUS + 16) * Math.cos(startAngle + 0.9)} ${CY + (RADIUS + 16) * Math.sin(startAngle + 0.9)}`}
            fill="none"
            stroke="#a6adc8"
            strokeWidth={1.5}
            markerEnd="url(#arrowhead)"
          />

          {/* Points */}
          {points.map((p, idx) => {
            const angle = (2 * Math.PI * idx) / N - Math.PI / 2;
            const lx = CX + (RADIUS + labelOffset) * Math.cos(angle);
            const ly = CY + (RADIUS + labelOffset) * Math.sin(angle);
            return (
              <g key={idx}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={DOT_R}
                  fill={idx === startIndex ? '#f9e2af' : '#89b4fa'}
                  stroke="#0a0a0a"
                  strokeWidth={2}
                />
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={idx === startIndex ? '#f9e2af' : '#cdd6f4'}
                  fontSize={12}
                  fontFamily="monospace"
                  fontWeight={idx === startIndex ? 700 : 400}
                >
                  {p.label}
                </text>
              </g>
            );
          })}

          {/* Semicircle label */}
          <text x={CX} y={CY + 20} textAnchor="middle" fill="#a6e3a1" fontSize={11} opacity={0.9}>
            semicircle
          </text>
        </svg>
      </div>
      <figcaption className="ceres-chart__caption">
        If all N points lie in a semicircle, exactly one point (i, shown in yellow) is the
        &ldquo;leftmost&rdquo; - all other points i+1, i+2, &hellip; fall clockwise within 180
        degrees. There are N choices for which point is leftmost, and each has probability 1/2
        <sup>N-1</sup>, giving P = N / 2<sup>N-1</sup>.
      </figcaption>
    </figure>
  );
}
