import { scaleLog, scaleTime } from 'd3-scale';
import { useEffect, useState } from 'react';

type Stat = { id: string; name: string; r2: number; miss: number; lastRatio: number };
type Point = [string, number, number]; // date, price, ratio to 2006-2021 real-yield line
type Data = { stats: Stat[]; series: Record<string, Point[]> };

export type CommodityChartKind = 'multiples' | 'precious';

const BREAK = '2022-01-01';
const COLORS: Record<string, string> = {
  gold: 'var(--chart-1)',
  silver: 'var(--chart-2)',
  palladium: 'var(--chart-5)',
};
const LO = 0.25;
const HI = 8;

let cache: Promise<Data> | undefined;
const load = (dir: string): Promise<Data> =>
  (cache ??= fetch(`${dir}/commodities.json`).then((r) => r.json() as Promise<Data>));

const ms = (d: string) => new Date(`${d}T00:00:00Z`).getTime();
const f = (v: number) => v.toFixed(1);
const line = (pts: [number, number][]) =>
  pts.map(([x, y], i) => `${i ? 'L' : 'M'}${f(x)},${f(y)}`).join('');

function Panel({
  w,
  h,
  pad,
  series,
  miss,
  title,
  sub,
  color,
  extra,
  ticks,
  big,
}: {
  w: number;
  h: number;
  pad: { l: number; r: number; t: number; b: number };
  series: { id: string; pts: Point[]; color: string }[];
  miss?: number;
  title?: string;
  sub?: string;
  color?: string;
  extra?: React.ReactNode;
  ticks: number[];
  big?: boolean;
}) {
  const first = series[0]?.pts[0];
  const last = series[0]?.pts.at(-1);
  if (!first || !last) return null;
  const x = scaleTime()
    .domain([new Date(ms(first[0])), new Date(ms(last[0]))])
    .range([pad.l, w - pad.r]);
  const y = scaleLog()
    .domain([LO, HI])
    .range([h - pad.b, pad.t]);
  const fs = big ? 11 : 9;
  const years = big ? [2010, 2014, 2018, 2022, 2026] : [2010, 2018, 2026];
  return (
    <svg
      viewBox={`0 0 ${String(w)} ${String(h)}`}
      className="h-auto w-full"
      role="img"
      aria-label={title ?? 'Ratio chart'}
    >
      <g fontFamily="var(--font-mono)" fontSize={fs} fill="var(--muted-foreground)">
        {ticks.map((v) => (
          <g key={v}>
            <line x1={pad.l} x2={w - pad.r} y1={y(v)} y2={y(v)} stroke="var(--border)" />
            <text x={pad.l - 4} y={y(v) + 3} textAnchor="end">{`${String(v)}×`}</text>
          </g>
        ))}
        {years.map((yr) => (
          <text
            key={yr}
            x={x(new Date(Date.UTC(yr, 0, 1)))}
            y={h - pad.b + fs + 6}
            textAnchor="middle"
          >
            {yr}
          </text>
        ))}
      </g>
      {miss !== undefined && (
        <rect
          x={pad.l}
          width={w - pad.l - pad.r}
          y={y(Math.exp(2 * miss))}
          height={y(Math.exp(-2 * miss)) - y(Math.exp(2 * miss))}
          fill="var(--chart-2)"
          fillOpacity={0.14}
        />
      )}
      <line
        x1={pad.l}
        x2={w - pad.r}
        y1={y(1)}
        y2={y(1)}
        stroke="var(--muted-foreground)"
        strokeDasharray="3 3"
      />
      <line
        x1={x(new Date(ms(BREAK)))}
        x2={x(new Date(ms(BREAK)))}
        y1={pad.t}
        y2={h - pad.b}
        stroke="var(--muted-foreground)"
        strokeDasharray="3 3"
        strokeOpacity={0.6}
      />
      {series.map((s) => (
        <path
          key={s.id}
          d={line(s.pts.map((p) => [x(new Date(ms(p[0]))), y(Math.min(HI, Math.max(LO, p[2])))]))}
          fill="none"
          stroke={s.color}
          strokeWidth={big ? 1.8 : 1.4}
        />
      ))}
      {title && (
        <text x={pad.l + 4} y={pad.t + 12} fontSize={12} fontWeight={600} fill="var(--foreground)">
          {title}
          <tspan fontSize={10} fontWeight={400} fill={color ?? 'var(--muted-foreground)'} dx={6}>
            {sub}
          </tspan>
        </text>
      )}
      {extra}
    </svg>
  );
}

export function CommodityRatioChart({
  kind,
  dataDir = '/data/gold-real-yields',
}: {
  kind: CommodityChartKind;
  dataDir?: string;
}) {
  const [data, setData] = useState<Data>();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    load(dataDir).then(setData, () => {
      setFailed(true);
    });
  }, [dataDir]);

  if (failed)
    return (
      <div className="text-muted-foreground my-6 font-mono text-xs">Chart data failed to load.</div>
    );
  if (!data)
    return <div className="text-muted-foreground my-6 font-mono text-xs">Loading chart…</div>;

  if (kind === 'multiples') {
    return (
      <div className="not-prose my-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {data.stats.map((s) => (
          <figure key={s.id} className="border-border bg-card rounded-lg border p-2">
            <Panel
              w={240}
              h={170}
              pad={{ l: 30, r: 6, t: 6, b: 20 }}
              series={[
                { id: s.id, pts: data.series[s.id] ?? [], color: COLORS[s.id] ?? 'var(--chart-1)' },
              ]}
              miss={s.miss}
              title={s.name}
              sub={`R² ${s.r2.toFixed(2)}`}
              ticks={[0.5, 1, 2, 4]}
            />
          </figure>
        ))}
      </div>
    );
  }

  const ids = ['gold', 'silver', 'palladium'];
  const series = ids.map((id) => ({ id, pts: data.series[id] ?? [], color: COLORS[id] ?? '' }));
  const stat = (id: string) => data.stats.find((s) => s.id === id);
  const W = 720;
  const H = 380;
  const pad = { l: 44, r: 90, t: 16, b: 30 };
  const xEnd = W - pad.r;
  const y = scaleLog()
    .domain([LO, HI])
    .range([H - pad.b, pad.t]);
  return (
    <figure className="not-prose border-border bg-card my-8 rounded-lg border p-3">
      <Panel
        w={W}
        h={H}
        pad={pad}
        big
        series={series}
        ticks={[0.25, 0.5, 1, 2, 4, 8]}
        extra={series.map((s) => {
          const r = stat(s.id)?.lastRatio ?? 1;
          return (
            <text
              key={s.id}
              x={xEnd + 6}
              y={y(Math.min(HI, r)) + 4}
              fontSize={12}
              fontWeight={600}
              fill={s.color}
            >
              {`${stat(s.id)?.name ?? s.id} ${r.toFixed(1)}×`}
            </text>
          );
        })}
      />
    </figure>
  );
}
