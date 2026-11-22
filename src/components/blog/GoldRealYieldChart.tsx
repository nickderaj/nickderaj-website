import { scaleLinear, scaleLog, scaleTime } from 'd3-scale';
import { useEffect, useState } from 'react';

type Row = { d: string; gold: number; real: number; line: number; ratio: number };
type Stats = {
  intercept: number;
  slope: number;
  r2: number;
  miss: number;
  lastInBand: string;
  ratioPeak: number;
  ratioPeakDate: string;
};
type Data = { stats: Stats; rows: Row[] };
type Loaded = Data & { first: Row; last: Row };

export type GoldChartKind = 'scatter' | 'ratio' | 'overlay';

const W = 720;
const H = 380;
const M = { top: 16, right: 56, bottom: 36, left: 56 };
const BREAK = '2022-01-01';
const GOLD = 'var(--chart-1)';
const REAL = 'var(--chart-2)';
const POST = 'var(--chart-3)';

let cache: Promise<Data> | undefined;
const load = (dir: string): Promise<Data> =>
  (cache ??= fetch(`${dir}/weekly.json`).then((r) => r.json() as Promise<Data>));

const t = (d: string) => new Date(`${d}T00:00:00Z`).getTime();
const usd = (v: number) => `$${Math.round(v).toLocaleString('en-US')}`;
const fmtDate = (d: string) =>
  new Date(`${d}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });

function path(pts: [number, number][]): string {
  return pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('');
}

function Axis({
  ticks,
  pos,
  fmt,
  side,
  length,
}: {
  ticks: number[];
  pos: (v: number) => number;
  fmt: (v: number) => string;
  side: 'left' | 'right' | 'bottom';
  length: number;
}) {
  return (
    <g className="text-muted-foreground" fontSize="11" fontFamily="var(--font-mono)">
      {ticks.map((v) =>
        side === 'bottom' ? (
          <text key={v} x={pos(v)} y={H - M.bottom + 18} textAnchor="middle" fill="currentColor">
            {fmt(v)}
          </text>
        ) : (
          <g key={v}>
            {side === 'left' && (
              <line
                x1={M.left}
                x2={M.left + length}
                y1={pos(v)}
                y2={pos(v)}
                stroke="var(--border)"
              />
            )}
            <text
              x={side === 'left' ? M.left - 8 : W - M.right + 8}
              y={pos(v) + 4}
              textAnchor={side === 'left' ? 'end' : 'start'}
              fill="currentColor"
            >
              {fmt(v)}
            </text>
          </g>
        ),
      )}
    </g>
  );
}

function Note({
  x,
  y,
  lines,
  anchor = 'end',
}: {
  x: number;
  y: number;
  lines: string[];
  anchor?: 'end' | 'start';
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize="11"
      fill="var(--foreground)"
      stroke="var(--card)"
      strokeWidth={3}
      paintOrder="stroke"
    >
      {lines.map((l, i) => (
        <tspan key={l} x={x} dy={i ? 14 : 0}>
          {l}
        </tspan>
      ))}
    </text>
  );
}

const yearTicks = (a: number, b: number, step = 4) => {
  const out: number[] = [];
  for (let y = 2006; y <= 2026; y += step) {
    const v = t(`${String(y)}-01-01`);
    if (v >= a && v <= b) out.push(v);
  }
  return out;
};

function Scatter({ data }: { data: Loaded }) {
  const { rows, stats, last } = data;
  const x = scaleLinear()
    .domain([-1.5, 3.5])
    .range([M.left, W - M.right]);
  const y = scaleLog()
    .domain([400, 5000])
    .range([H - M.bottom, M.top]);
  const fitAt = (r: number) => stats.intercept * Math.exp(stats.slope * r);
  const x0 = -1.2;
  const x1 = 2.8;
  return (
    <>
      <Axis
        ticks={[500, 1000, 2000, 4000]}
        pos={y}
        fmt={usd}
        side="left"
        length={W - M.left - M.right}
      />
      <Axis
        ticks={[-1, 0, 1, 2, 3]}
        pos={x}
        fmt={(v) => `${String(v)}%`}
        side="bottom"
        length={0}
      />
      {rows.map((r) => (
        <circle
          key={r.d}
          cx={x(r.real)}
          cy={y(r.gold)}
          r={2.6}
          fill={r.d < BREAK ? REAL : POST}
          fillOpacity={0.55}
        />
      ))}
      <line
        x1={x(x0)}
        y1={y(fitAt(x0))}
        x2={x(x1)}
        y2={y(fitAt(x1))}
        stroke="var(--foreground)"
        strokeWidth={2}
      />
      <circle cx={x(last.real)} cy={y(last.gold)} r={5} fill="none" stroke={POST} strokeWidth={2} />
      <Note
        x={x(last.real) - 10}
        y={y(last.gold) + 4}
        lines={[`${last.d}: ${usd(last.gold)}`, `at ${last.real.toFixed(2)}% real yield`]}
      />
      <Note x={x(last.real) - 10} y={y(last.line) - 6} lines={[`line says ${usd(last.line)}`]} />
      <text x={M.left + 8} y={M.top + 14} fontSize="11" fill="var(--foreground)">
        2006–2021 fit: gold = {Math.round(stats.intercept).toLocaleString()} × e^(
        {stats.slope.toFixed(2)} × yield)
      </text>
    </>
  );
}

function Ratio({ data }: { data: Loaded }) {
  const { rows, stats } = data;
  const x = scaleTime()
    .domain([t(data.first.d), t(data.last.d)])
    .range([M.left, W - M.right]);
  const y = scaleLog()
    .domain([0.5, 8])
    .range([H - M.bottom, M.top]);
  const band = Math.exp(2 * stats.miss);
  const bandTop = y(band);
  const bandBottom = y(1 / band);
  const inBand = rows.find((r) => r.d === stats.lastInBand);
  const peak = rows.find((r) => r.d === stats.ratioPeakDate);
  const px = (d: string) => x(new Date(`${d}T00:00:00Z`));
  return (
    <>
      <Axis
        ticks={[0.5, 1, 2, 4, 8]}
        pos={y}
        fmt={(v) => `${String(v)}×`}
        side="left"
        length={W - M.left - M.right}
      />
      <Axis
        ticks={yearTicks(t(data.first.d), t(data.last.d))}
        pos={(v) => x(v)}
        fmt={(v) => String(new Date(v).getUTCFullYear())}
        side="bottom"
        length={0}
      />
      <rect
        x={M.left}
        y={bandTop}
        width={W - M.left - M.right}
        height={bandBottom - bandTop}
        fill={REAL}
        fillOpacity={0.14}
      />
      <line
        x1={M.left}
        x2={W - M.right}
        y1={y(1)}
        y2={y(1)}
        stroke="var(--muted-foreground)"
        strokeDasharray="4 3"
      />
      <path
        d={path(rows.map((r) => [px(r.d), y(r.ratio)]))}
        fill="none"
        stroke={GOLD}
        strokeWidth={1.8}
      />
      {inBand && (
        <circle
          cx={px(inBand.d)}
          cy={y(inBand.ratio)}
          r={4}
          fill={GOLD}
          stroke="var(--background)"
          strokeWidth={1.5}
        />
      )}
      {inBand && (
        <Note
          x={px(inBand.d) - 8}
          y={y(inBand.ratio) - 28}
          lines={['last inside band:', fmtDate(inBand.d)]}
        />
      )}
      {peak && (
        <circle
          cx={px(peak.d)}
          cy={y(peak.ratio)}
          r={4}
          fill={POST}
          stroke="var(--background)"
          strokeWidth={1.5}
        />
      )}
      {peak && (
        <Note
          x={px(peak.d) - 8}
          y={y(peak.ratio) + 4}
          lines={[`${peak.ratio.toFixed(1)}× the line`, 'Sep 2026']}
        />
      )}
      <text
        x={M.left + 6}
        y={bandBottom + 14}
        fontSize="11"
        fill="var(--muted-foreground)"
        stroke="var(--card)"
        strokeWidth={3}
        paintOrder="stroke"
      >
        band: ±2 standard deviations (±{Math.round(2 * stats.miss * 100)}% in logs)
      </text>
    </>
  );
}

function Overlay({ data }: { data: Loaded }) {
  const { rows } = data;
  const x = scaleTime()
    .domain([t(data.first.d), t(data.last.d)])
    .range([M.left, W - M.right]);
  const yG = scaleLinear()
    .domain([0, 5000])
    .range([H - M.bottom, M.top]);
  const yR = scaleLinear()
    .domain([-1.5, 4.5])
    .range([H - M.bottom, M.top]);
  const px = (d: string) => x(new Date(`${d}T00:00:00Z`));
  const brk = x(new Date(`${BREAK}T00:00:00Z`));
  return (
    <>
      <Axis
        ticks={[0, 1000, 2000, 3000, 4000, 5000]}
        pos={yG}
        fmt={usd}
        side="left"
        length={W - M.left - M.right}
      />
      <Axis
        ticks={[-1, 0, 1, 2, 3, 4]}
        pos={yR}
        fmt={(v) => `${String(v)}%`}
        side="right"
        length={0}
      />
      <Axis
        ticks={yearTicks(t(data.first.d), t(data.last.d))}
        pos={(v) => x(v)}
        fmt={(v) => String(new Date(v).getUTCFullYear())}
        side="bottom"
        length={0}
      />
      <line
        x1={brk}
        x2={brk}
        y1={M.top}
        y2={H - M.bottom}
        stroke="var(--muted-foreground)"
        strokeDasharray="4 3"
      />
      <text x={brk + 6} y={M.top + 12} fontSize="11" fill="var(--muted-foreground)">
        2022
      </text>
      <path
        d={path(rows.map((r) => [px(r.d), yR(r.real)]))}
        fill="none"
        stroke={REAL}
        strokeWidth={1.8}
      />
      <path
        d={path(rows.map((r) => [px(r.d), yG(r.gold)]))}
        fill="none"
        stroke={GOLD}
        strokeWidth={1.8}
      />
      <text x={M.left + 200} y={M.top + 14} fontSize="12" fontWeight={600} fill={GOLD}>
        Gold (left, $/oz)
      </text>
      <text x={M.left + 200} y={M.top + 30} fontSize="12" fontWeight={600} fill={REAL}>
        10y real yield (right, %)
      </text>
    </>
  );
}

export function GoldRealYieldChart({
  kind,
  dataDir = '/data/gold-real-yields',
}: {
  kind: GoldChartKind;
  dataDir?: string;
}) {
  const [data, setData] = useState<Data>();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    load(dataDir).then(setData, () => {
      setFailed(true);
    });
  }, [dataDir]);

  if (failed) {
    return (
      <div className="text-muted-foreground my-6 font-mono text-xs">Chart data failed to load.</div>
    );
  }
  if (!data) {
    return <div className="text-muted-foreground my-6 font-mono text-xs">Loading chart…</div>;
  }
  const first = data.rows[0];
  const last = data.rows.at(-1);
  if (!first || !last) return null;
  const loaded: Loaded = { ...data, first, last };
  const label = {
    scatter: 'Scatter of weekly gold price against 10-year real yield, 2006 to 2026',
    ratio: 'Gold divided by the 2006–2021 real-yield line, log scale, 2006 to 2026',
    overlay: 'Gold price and 10-year real yield as two lines, 2006 to 2026',
  }[kind];
  return (
    <figure className="not-prose border-border bg-card my-8 rounded-lg border p-3">
      <svg
        viewBox={`0 0 ${String(W)} ${String(H)}`}
        role="img"
        aria-label={label}
        className="h-auto w-full"
      >
        {kind === 'scatter' && <Scatter data={loaded} />}
        {kind === 'ratio' && <Ratio data={loaded} />}
        {kind === 'overlay' && <Overlay data={loaded} />}
      </svg>
      {kind === 'scatter' && (
        <div className="text-muted-foreground mt-1 flex gap-4 font-mono text-xs">
          <span>
            <span style={{ color: REAL }}>●</span> 2006–2021
          </span>
          <span>
            <span style={{ color: POST }}>●</span> 2022–2026
          </span>
        </div>
      )}
    </figure>
  );
}
