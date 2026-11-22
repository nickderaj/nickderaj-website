import { scaleLog, scaleTime } from 'd3-scale';
import { useEffect, useState } from 'react';

type Stat = {
  id: string;
  name: string;
  r2: number;
  miss: number;
  lastRatio: number;
  group?: string;
  breakout?: boolean;
};
type Point = [string, number, number]; // date, price, ratio to 2006-2021 real-yield line
type Data = { stats: Stat[]; series: Record<string, Point[]> };

export type CommodityChartKind = 'multiples' | 'precious' | 'alternatives' | 'breakouts';

const BREAK = '2022-01-01';
const COLORS: Record<string, string> = {
  gold: 'var(--chart-1)',
  silver: 'var(--chart-2)',
  palladium: 'var(--chart-5)',
};
const LO = 0.25;
const HI = 8;

const cache = new Map<string, Promise<Data>>();
const load = (dir: string, file: string): Promise<Data> => {
  const url = `${dir}/${file}`;
  let p = cache.get(url);
  if (!p) {
    p = fetch(url).then((r) => r.json() as Promise<Data>);
    cache.set(url, p);
  }
  return p;
};

// alternatives.json spans 2006-2026; panels share one x-axis so short series don't stretch.
const ALT_DOMAIN: [string, string] = ['2006-01-01', '2026-11-13'];

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
  domain,
  ariaLabel,
}: {
  w: number;
  h: number;
  pad: { l: number; r: number; t: number; b: number };
  series: { id: string; pts: Point[]; color: string; opacity?: number; width?: number }[];
  miss?: number;
  title?: string;
  sub?: string;
  color?: string;
  extra?: React.ReactNode;
  ticks: number[];
  big?: boolean;
  domain?: [string, string];
  ariaLabel?: string;
}) {
  const first = series[0]?.pts[0];
  const last = series[0]?.pts.at(-1);
  if (!first || !last) return null;
  const x = scaleTime()
    .domain([new Date(ms(domain?.[0] ?? first[0])), new Date(ms(domain?.[1] ?? last[0]))])
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
      aria-label={ariaLabel ?? title ?? 'Ratio chart'}
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
          strokeWidth={s.width ?? (big ? 1.8 : 1.4)}
          strokeOpacity={s.opacity ?? 1}
          strokeLinejoin="round"
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

const STRONG: Record<string, string> = {
  gold: 'var(--chart-1)',
  tin: 'var(--chart-3)',
  cattle: 'var(--chart-2)',
  feeder: 'var(--chart-4)',
  glass: 'var(--chart-5)',
};
type Line = { id: string; name: string; pts: Point[]; color: string; strong: boolean };

// Every series of a category on one log chart. Strong lines are coloured and always labelled; the rest
// are grey and labelled only when the latest ratio is above 2x or below 0.6x (or the category is small).
function Combined({ lines, label }: { lines: Line[]; label?: string }) {
  const W = 720;
  const H = 400;
  const pad = { l: 44, r: 150, t: 16, b: 30 };
  const y = scaleLog()
    .domain([LO, HI])
    .range([H - pad.b, pad.t]);
  const latest = (l: Line) => l.pts.at(-1)?.[2] ?? 1;
  const shown = lines
    .filter((l) => l.strong || lines.length <= 5 || latest(l) >= 2 || latest(l) <= 0.6)
    .map((l) => ({ l, y0: y(Math.min(HI, Math.max(LO, latest(l)))) }))
    .sort((a, b) => a.y0 - b.y0);
  const GAP = 12;
  const ys: number[] = [];
  shown.forEach(({ y0 }, i) => ys.push(Math.max(y0, i ? (ys[i - 1] ?? 0) + GAP : y0)));
  for (let i = ys.length - 1; i >= 0; i--)
    ys[i] = Math.min(ys[i] ?? 0, i === ys.length - 1 ? H - pad.b : (ys[i + 1] ?? 0) - GAP);
  const series = [...lines]
    .sort((a, b) => Number(a.strong) - Number(b.strong))
    .map((l) => ({
      id: l.id,
      pts: l.pts,
      color: l.strong ? l.color : 'var(--muted-foreground)',
      opacity: l.strong ? 1 : 0.45,
      width: l.strong ? 2 : 1,
    }));
  return (
    <figure className="not-prose border-border bg-card my-8 rounded-lg border p-3">
      <Panel
        w={W}
        h={H}
        pad={pad}
        big
        series={series}
        ticks={[0.25, 0.5, 1, 2, 4, 8]}
        domain={ALT_DOMAIN}
        ariaLabel={`${label ?? 'Commodities'}: price divided by real-yield line`}
        extra={shown.map(({ l }, i) => (
          <text
            key={l.id}
            x={W - pad.r + 6}
            y={(ys[i] ?? 0) + 4}
            fontSize={l.strong ? 12 : 10}
            fontWeight={l.strong ? 600 : 400}
            fill={l.strong ? l.color : 'var(--muted-foreground)'}
          >
            {`${l.name} ${latest(l).toFixed(1)}×`}
          </text>
        ))}
      />
    </figure>
  );
}

export function CommodityRatioChart({
  kind,
  group,
  dataDir = '/data/gold-real-yields',
}: {
  kind: CommodityChartKind;
  group?: string;
  dataDir?: string;
}) {
  const [data, setData] = useState<Data>();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const files =
      kind === 'breakouts'
        ? ['alternatives.json', 'commodities.json']
        : [kind === 'alternatives' ? 'alternatives.json' : 'commodities.json'];
    Promise.all(files.map((file) => load(dataDir, file))).then(
      (parts) => {
        setData({
          stats: parts.flatMap((d) => d.stats),
          series: Object.assign({}, ...parts.map((d) => d.series)) as Data['series'],
        });
      },
      () => {
        setFailed(true);
      },
    );
  }, [dataDir, kind]);

  if (failed)
    return (
      <div className="text-muted-foreground my-6 font-mono text-xs">Chart data failed to load.</div>
    );
  if (!data)
    return <div className="text-muted-foreground my-6 font-mono text-xs">Loading chart…</div>;

  if (kind === 'alternatives' || kind === 'breakouts') {
    const stats =
      kind === 'breakouts'
        ? [...data.stats.filter((s) => s.id === 'gold'), ...data.stats.filter((s) => s.breakout)]
        : data.stats.filter((s) => s.group === group);
    const lines: Line[] = stats.map((s) => ({
      id: s.id,
      name: s.name,
      pts: data.series[s.id] ?? [],
      strong: kind === 'breakouts' || !!s.breakout,
      color: STRONG[s.id] ?? 'var(--chart-2)',
    }));
    return (
      <Combined
        lines={lines}
        label={kind === 'breakouts' ? 'Break-outs vs gold' : (group ?? 'Commodities')}
      />
    );
  }

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
