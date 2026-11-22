import { scaleLinear, scaleLog, scaleTime } from 'd3-scale';
import { useEffect, useState } from 'react';

type G = 'main' | 'other' | 'china';
type Pair = { a: string; b: string; c: number };
type Member = { n: string; g: G; r: number };
type Rec = {
  id: string;
  name: string;
  day: number;
  week: number;
  twoWeek: number;
  px: [string, number][];
};
type BasketStat = { annVol: number; avgMemberVol: number; maxDD: number };
type Data = {
  within: Record<string, { full: { n: number; mean: number; pctNeg: number } }>;
  top: { pos: Pair[]; neg: Pair[]; nPairs: number; pctNeg: number };
  basket: Record<string, BasketStat>;
  worstSpxWeeks: Record<string, { weeksAvgUp: number; weeksCovered: number } | number>;
  recent: Rec[];
  named: { vsSpx: { name: string; spx: number; djp: number }[] };
  viz: {
    series: { id: string; name: string; g: G }[];
    matrix: (number | null)[][];
    vsBench: { id: string; spx: number | null; djp: number | null }[];
    curves: Record<string, [string, number][]>;
    weeks: [string, number, number, number][];
    worstWeeks: string[];
    episodeMembers: {
      label: string;
      from: string;
      to: string;
      spx: number;
      djp: number;
      members: Member[];
    }[];
  };
};

export type AltChartKind =
  | 'stats'
  | 'heatmap'
  | 'strip'
  | 'lollipop'
  | 'pairs'
  | 'curves'
  | 'drawdown'
  | 'volratio'
  | 'episodes'
  | 'scatter'
  | 'recent'
  | 'dumbbell';

const COLOR: Record<G, string> = {
  main: 'var(--chart-1)',
  other: 'var(--chart-2)',
  china: 'var(--chart-3)',
};
const LABEL: Record<G, string> = {
  main: 'Mainstream',
  other: 'Other futures',
  china: 'Chinese onshore',
};
const FG = 'var(--foreground)';
const MUTED = 'var(--muted-foreground)';

let cache: Promise<Data> | undefined;
const load = (dir: string): Promise<Data> =>
  (cache ??= fetch(`${dir}/alt-correlations.json`).then((r) => r.json() as Promise<Data>));

const c2 = (v: number) => v.toFixed(2).replace('-', '−');
const pc = (v: number, n = 0) => `${v > 0 ? '+' : ''}${(v * 100).toFixed(n)}%`.replace('-', '−');
const ms = (d: string) => new Date(`${d}T00:00:00Z`).getTime();
const f1 = (v: number) => v.toFixed(1);
const mean = (a: number[]) => a.reduce((s, v) => s + v, 0) / (a.length || 1);
const median = (a: number[]) => {
  const s = [...a].sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? (s[m] ?? 0) : ((s[m - 1] ?? 0) + (s[m] ?? 0)) / 2;
};
const pearson = (x: number[], y: number[]) => {
  const mx = mean(x);
  const my = mean(y);
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  x.forEach((v, i) => {
    const w = y[i] ?? 0;
    sxy += (v - mx) * (w - my);
    sxx += (v - mx) ** 2;
    syy += (w - my) ** 2;
  });
  return sxy / Math.sqrt(sxx * syy);
};
const jitter = (i: number, j = 0) => (((i * 7919 + j * 104729 + 13) % 997) / 997 - 0.5) * 2;
// Push labels apart vertically so they do not overlap, keeping them inside [lo, hi].
const spread = (ys: number[], gap: number, lo: number, hi: number) => {
  const order = ys.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y);
  const out = order.map((o) => o.y);
  out.forEach((y, k) => {
    out[k] = Math.max(y, k ? (out[k - 1] ?? 0) + gap : lo);
  });
  for (let k = out.length - 1; k >= 0; k--)
    out[k] = Math.min(out[k] ?? 0, k === out.length - 1 ? hi : (out[k + 1] ?? 0) - gap);
  const res: number[] = [];
  order.forEach((o, k) => {
    res[o.i] = out[k] ?? o.y;
  });
  return res;
};

const Figure = ({
  children,
  scroll,
  caption,
}: {
  children: React.ReactNode;
  scroll?: number;
  caption?: string;
}) => (
  <figure className="not-prose border-border bg-card my-8 rounded-lg border p-3">
    <div className="overflow-x-auto">
      <div style={scroll ? { minWidth: scroll } : undefined}>{children}</div>
    </div>
    {caption ? (
      <figcaption className="text-muted-foreground mt-2 font-mono text-[11px]">
        {caption}
      </figcaption>
    ) : null}
  </figure>
);

const Legend = ({ items }: { items: { label: string; color: string; ring?: boolean }[] }) => (
  <div className="text-muted-foreground mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px]">
    {items.map((it) => (
      <span key={it.label} className="inline-flex items-center gap-1.5">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={
            it.ring
              ? { border: `2px solid ${it.color}`, background: 'var(--card)' }
              : { background: it.color }
          }
        />
        {it.label}
      </span>
    ))}
  </div>
);

const GROUP_LEGEND = (['main', 'other', 'china'] as G[]).map((g) => ({
  label: LABEL[g],
  color: COLOR[g],
}));

/* ---------- Stat tiles ---------- */
function Stats({ d }: { d: Data }) {
  const other = d.within.other?.full.mean ?? 0;
  const main = d.within.main?.full.mean ?? 0;
  const o = d.basket.other;
  const w = d.worstSpxWeeks.other;
  const up = typeof w === 'object' ? `${String(w.weeksAvgUp)} of ${String(w.weeksCovered)}` : '–';
  const tiles = [
    {
      big: c2(other),
      label: 'average pairwise correlation among 19 other futures',
      c: COLOR.other,
    },
    {
      big: c2(main),
      label: 'average pairwise correlation among 9 mainstream commodities',
      c: COLOR.main,
    },
    {
      big: o ? `${String(Math.round((o.annVol / o.avgMemberVol) * 100))}%` : '–',
      label: 'other-futures basket volatility as a share of its members’ average',
      c: COLOR.other,
    },
    {
      big: up,
      label: 'of the 20 worst S&P 500 weeks in which the other-futures basket rose',
      c: COLOR.china,
    },
  ];
  return (
    <div className="not-prose my-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {tiles.map((t) => (
        <div key={t.label} className="border-border bg-card rounded-lg border p-3">
          <div className="font-mono text-3xl font-semibold tracking-tight" style={{ color: t.c }}>
            {t.big}
          </div>
          <div className="text-muted-foreground mt-1 text-xs leading-snug">{t.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Heatmap ---------- */
const heat = (v: number | null, diag: boolean) => {
  if (diag) return 'var(--border)';
  if (v == null) return 'transparent';
  return v >= 0
    ? `color-mix(in oklab, var(--chart-1) ${String(Math.round(Math.min(1, v / 0.8) * 100))}%, var(--card))`
    : `color-mix(in oklab, var(--chart-2) ${String(Math.round(Math.min(1, -v / 0.25) * 100))}%, var(--card))`;
};

function Heatmap({ d }: { d: Data }) {
  const [hov, setHov] = useState<[number, number] | null>(null);
  const { series, matrix } = d.viz;
  const n = series.length;
  const cell = 14;
  const left = 152;
  const top = 44;
  const W = left + n * cell + 12;
  const H = top + n * cell + 38;
  const bands = (['main', 'other', 'china'] as G[]).map((g) => {
    const idx = series.map((s, i) => (s.g === g ? i : -1)).filter((i) => i >= 0);
    return { g, from: Math.min(...idx), to: Math.max(...idx) };
  });
  const a = hov ? series[hov[0]] : undefined;
  const b = hov ? series[hov[1]] : undefined;
  const v = hov ? (matrix[hov[0]]?.[hov[1]] ?? null) : null;
  return (
    <Figure
      scroll={640}
      caption="Weekly return correlations, 2006–2026. Hover a cell for the pair."
    >
      <svg
        viewBox={`0 0 ${String(W)} ${String(H)}`}
        className="h-auto w-full"
        role="img"
        aria-label="Correlation matrix of 40 commodity futures grouped as mainstream, other and Chinese onshore"
        onMouseLeave={() => {
          setHov(null);
        }}
      >
        <g fontFamily="var(--font-mono)" fontSize={8}>
          {bands.map((bd) => (
            <g key={bd.g}>
              <rect
                x={left + bd.from * cell}
                y={top - 14}
                width={(bd.to - bd.from + 1) * cell - 1}
                height={3}
                fill={COLOR[bd.g]}
              />
              <text
                x={left + bd.from * cell}
                y={top - 18}
                fill={COLOR[bd.g]}
                fontSize={9}
                fontWeight={600}
              >
                {`${LABEL[bd.g]} (${String(bd.to - bd.from + 1)})`}
              </text>
            </g>
          ))}
          {series.map((s, i) => (
            <text
              key={s.id}
              x={left - 5}
              y={top + i * cell + cell / 2 + 3}
              textAnchor="end"
              fill={hov?.[0] === i || hov?.[1] === i ? FG : COLOR[s.g]}
              fontWeight={hov?.[0] === i || hov?.[1] === i ? 700 : 400}
            >
              {s.name.length > 30 ? `${s.name.slice(0, 29)}…` : s.name}
            </text>
          ))}
          {matrix.map((row, i) =>
            row.map((val, j) => (
              <rect
                key={`${String(i)}-${String(j)}`}
                x={left + j * cell}
                y={top + i * cell}
                width={cell - 1}
                height={cell - 1}
                rx={1.5}
                fill={heat(val, i === j)}
                stroke={hov?.[0] === i && hov[1] === j ? FG : 'none'}
                onMouseEnter={() => {
                  setHov([i, j]);
                }}
              >
                <title>{`${series[i]?.name ?? ''} × ${series[j]?.name ?? ''}: ${val == null ? 'n/a' : c2(val)}`}</title>
              </rect>
            )),
          )}
          {a && b && v != null && (
            <text x={W - 12} y={10} textAnchor="end" fill={FG} fontSize={10} fontWeight={600}>
              {`${a.name} × ${b.name}: ${c2(v)}`}
            </text>
          )}
          {[-0.2, 0, 0.2, 0.4, 0.6, 0.8].map((lv, k) => (
            <g
              key={lv}
              transform={`translate(${String(left + k * 62)},${String(top + n * cell + 12)})`}
            >
              <rect width={14} height={10} rx={2} fill={heat(lv, false)} stroke="var(--border)" />
              <text x={19} y={9} fill={MUTED}>
                {c2(lv)}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </Figure>
  );
}

/* ---------- Strip plot of every pair ---------- */
const PAIR_ROWS: { k: string; label: string; color: string }[] = [
  { k: 'main-main', label: 'Mainstream × mainstream', color: COLOR.main },
  { k: 'other-other', label: 'Other × other', color: COLOR.other },
  { k: 'china-china', label: 'Chinese × Chinese', color: COLOR.china },
  { k: 'main-other', label: 'Mainstream × other', color: MUTED },
  { k: 'main-china', label: 'Mainstream × Chinese', color: MUTED },
  { k: 'other-china', label: 'Other × Chinese', color: MUTED },
];

function Strip({ d }: { d: Data }) {
  const { series, matrix } = d.viz;
  const byRow: Record<string, { v: number; t: string }[]> = {};
  series.forEach((sa, i) => {
    series.forEach((sb, j) => {
      if (j <= i) return;
      const v = matrix[i]?.[j];
      if (v == null) return;
      (byRow[`${sa.g}-${sb.g}`] ??= []).push({ v, t: `${sa.name} × ${sb.name}: ${c2(v)}` });
    });
  });
  const W = 720;
  const rowH = 52;
  const m = { l: 150, r: 20, t: 14, b: 30 };
  const H = m.t + PAIR_ROWS.length * rowH + m.b;
  const x = scaleLinear()
    .domain([-0.3, 0.95])
    .range([m.l, W - m.r]);
  return (
    <Figure
      scroll={560}
      caption="Each dot is one pair of series. The tick marks the mean of the row."
    >
      <svg
        viewBox={`0 0 ${String(W)} ${String(H)}`}
        className="h-auto w-full"
        role="img"
        aria-label="Distribution of pairwise correlations by pair type"
      >
        <g fontFamily="var(--font-mono)" fontSize={10} fill={MUTED}>
          {[-0.2, 0, 0.2, 0.4, 0.6, 0.8].map((t) => (
            <g key={t}>
              <line
                x1={x(t)}
                x2={x(t)}
                y1={m.t}
                y2={H - m.b}
                stroke="var(--border)"
                strokeDasharray={t === 0 ? undefined : '2 4'}
              />
              <text x={x(t)} y={H - m.b + 14} textAnchor="middle">
                {c2(t)}
              </text>
            </g>
          ))}
        </g>
        {PAIR_ROWS.map((row, r) => {
          const pts = byRow[row.k] ?? [];
          const cy = m.t + r * rowH + rowH / 2;
          const mu = mean(pts.map((p) => p.v));
          return (
            <g key={row.k}>
              <text
                x={m.l - 8}
                y={cy + 3}
                textAnchor="end"
                fontSize={10}
                fontFamily="var(--font-mono)"
                fill={FG}
              >
                {row.label}
              </text>
              {pts.map((p, k) => (
                <circle
                  key={p.t}
                  cx={x(p.v)}
                  cy={cy + jitter(k, r) * (rowH * 0.36)}
                  r={2.6}
                  fill={row.color}
                  fillOpacity={0.5}
                >
                  <title>{p.t}</title>
                </circle>
              ))}
              <line
                x1={x(mu)}
                x2={x(mu)}
                y1={cy - rowH * 0.45}
                y2={cy + rowH * 0.45}
                stroke={FG}
                strokeWidth={2}
              />
              <text
                x={x(mu) + 4}
                y={cy - rowH * 0.45 + 8}
                fontSize={10}
                fontWeight={600}
                fill={FG}
                fontFamily="var(--font-mono)"
              >
                {c2(mu)}
              </text>
            </g>
          );
        })}
      </svg>
    </Figure>
  );
}

/* ---------- Lollipop: correlation with equities and commodity benchmark ---------- */
function Lollipop({ d }: { d: Data }) {
  const rows = d.viz.vsBench
    .map((v, i) => ({ ...v, s: d.viz.series[i] }))
    .filter(
      (r): r is typeof r & { s: NonNullable<typeof r.s>; spx: number } => !!r.s && r.spx != null,
    )
    .sort((a, b) => b.spx - a.spx);
  const W = 720;
  const rh = 15;
  const m = { l: 190, r: 20, t: 16, b: 30 };
  const H = m.t + rows.length * rh + m.b;
  const x = scaleLinear()
    .domain([-0.25, 0.85])
    .range([m.l, W - m.r]);
  return (
    <Figure
      scroll={600}
      caption="Filled dot: correlation with the S&P 500. Ring: correlation with the Bloomberg commodity ETN."
    >
      <svg
        viewBox={`0 0 ${String(W)} ${String(H)}`}
        className="h-auto w-full"
        role="img"
        aria-label="Each series' weekly return correlation with the S&P 500 and with a commodity index"
      >
        <g fontFamily="var(--font-mono)" fontSize={10} fill={MUTED}>
          {[-0.2, 0, 0.2, 0.4, 0.6, 0.8].map((t) => (
            <g key={t}>
              <line
                x1={x(t)}
                x2={x(t)}
                y1={m.t - 4}
                y2={H - m.b}
                stroke="var(--border)"
                strokeDasharray={t === 0 ? undefined : '2 4'}
              />
              <text x={x(t)} y={H - m.b + 14} textAnchor="middle">
                {c2(t)}
              </text>
            </g>
          ))}
        </g>
        {rows.map((r, i) => {
          const cy = m.t + i * rh + rh / 2;
          return (
            <g key={r.id}>
              <text
                x={m.l - 8}
                y={cy + 3}
                textAnchor="end"
                fontSize={9}
                fontFamily="var(--font-mono)"
                fill={COLOR[r.s.g]}
              >
                {r.s.name.length > 32 ? `${r.s.name.slice(0, 31)}…` : r.s.name}
              </text>
              <line x1={x(0)} x2={x(r.spx)} y1={cy} y2={cy} stroke={COLOR[r.s.g]} strokeWidth={2} />
              <circle cx={x(r.spx)} cy={cy} r={4} fill={COLOR[r.s.g]}>
                <title>{`${r.s.name}: S&P 500 ${c2(r.spx)}`}</title>
              </circle>
              {r.djp != null && (
                <circle
                  cx={x(r.djp)}
                  cy={cy}
                  r={3.4}
                  fill="var(--card)"
                  stroke={MUTED}
                  strokeWidth={1.6}
                >
                  <title>{`${r.s.name}: commodity ETN ${c2(r.djp)}`}</title>
                </circle>
              )}
            </g>
          );
        })}
      </svg>
      <Legend items={GROUP_LEGEND} />
    </Figure>
  );
}

/* ---------- Diverging bars: most positive and most negative pairs ---------- */
function Pairs({ d }: { d: Data }) {
  const rows = [
    ...d.top.pos.map((p) => ({ ...p, pos: true })),
    ...d.top.neg.map((p) => ({ ...p, pos: false })),
  ];
  const W = 720;
  const rh = 17;
  const gap = 26;
  const m = { l: 290, r: 20, t: 12, b: 30 };
  const H = m.t + rows.length * rh + gap + m.b;
  const x = scaleLinear()
    .domain([-0.2, 1])
    .range([m.l, W - m.r]);
  const yOf = (i: number) => m.t + i * rh + (i >= d.top.pos.length ? gap : 0);
  return (
    <Figure
      scroll={620}
      caption="The 12 most positive and 12 most negative pairs among 780, on one scale."
    >
      <svg
        viewBox={`0 0 ${String(W)} ${String(H)}`}
        className="h-auto w-full"
        role="img"
        aria-label="Most positive and most negative pairwise correlations"
      >
        <g fontFamily="var(--font-mono)" fontSize={10} fill={MUTED}>
          {[-0.2, 0, 0.2, 0.4, 0.6, 0.8, 1].map((t) => (
            <g key={t}>
              <line
                x1={x(t)}
                x2={x(t)}
                y1={m.t}
                y2={H - m.b}
                stroke="var(--border)"
                strokeDasharray={t === 0 ? undefined : '2 4'}
              />
              <text x={x(t)} y={H - m.b + 14} textAnchor="middle">
                {c2(t)}
              </text>
            </g>
          ))}
        </g>
        {rows.map((r, i) => {
          const y = yOf(i);
          const x0 = x(0);
          const x1 = x(r.c);
          return (
            <g key={`${r.a}${r.b}`}>
              <text
                x={m.l - 8}
                y={y + rh / 2 + 2}
                textAnchor="end"
                fontSize={9}
                fontFamily="var(--font-mono)"
                fill={FG}
              >
                {`${r.a} / ${r.b}`.length > 52
                  ? `${`${r.a} / ${r.b}`.slice(0, 51)}…`
                  : `${r.a} / ${r.b}`}
              </text>
              <rect
                x={Math.min(x0, x1)}
                y={y + 2}
                width={Math.max(1.5, Math.abs(x1 - x0))}
                height={rh - 5}
                rx={2}
                fill={r.pos ? 'var(--chart-1)' : 'var(--chart-2)'}
              >
                <title>{`${r.a} / ${r.b}: ${c2(r.c)}`}</title>
              </rect>
              <text
                x={r.pos ? x1 + 4 : x0 + 5}
                y={y + rh / 2 + 2}
                textAnchor="start"
                fontSize={9}
                fontFamily="var(--font-mono)"
                fill={MUTED}
              >
                {c2(r.c)}
              </text>
            </g>
          );
        })}
      </svg>
    </Figure>
  );
}

/* ---------- Equity curves and drawdowns ---------- */
const CURVES: { id: string; label: string; color: string; dash?: string; w: number }[] = [
  { id: 'spx', label: 'S&P 500', color: FG, w: 1.8 },
  { id: 'main', label: 'Mainstream', color: COLOR.main, w: 1.8 },
  { id: 'other', label: 'Other futures', color: COLOR.other, w: 1.8 },
  { id: 'china', label: 'Chinese', color: COLOR.china, w: 1.8 },
  { id: 'djp', label: 'Commodity ETN', color: MUTED, dash: '4 3', w: 1.4 },
];

function Curves({ d, drawdown }: { d: Data; drawdown?: boolean }) {
  const W = 720;
  const H = drawdown ? 280 : 360;
  const m = { l: 46, r: 180, t: 14, b: 28 };
  const all = d.viz.curves;
  const dd = (pts: [string, number][]) => {
    let peak = 0;
    return pts.map(([dt, v]): [string, number] => {
      peak = Math.max(peak, v);
      return [dt, v / peak - 1];
    });
  };
  const list = CURVES.filter((c) => !drawdown || c.id !== 'china').map((c) => {
    const pts = all[c.id] ?? [];
    return { ...c, pts: drawdown ? dd(pts) : pts };
  });
  const x = scaleTime()
    .domain([new Date(ms('2006-01-01')), new Date(ms('2026-11-21'))])
    .range([m.l, W - m.r]);
  const yLin = scaleLinear()
    .domain([-0.85, 0])
    .range([H - m.b, m.t]);
  const yLog = scaleLog()
    .domain([40, 700])
    .range([H - m.b, m.t]);
  const y = (v: number) => (drawdown ? yLin(v) : yLog(v));
  const ticks = drawdown ? [0, -0.2, -0.4, -0.6, -0.8] : [50, 100, 200, 400];
  const lastY = list.map((s) => y(s.pts.at(-1)?.[1] ?? 100));
  const labY = spread(lastY, 13, m.t + 6, H - m.b);
  const path = (pts: [string, number][]) =>
    pts
      .map(([dt, v], i) => `${i ? 'L' : 'M'}${x(new Date(ms(dt))).toFixed(1)},${y(v).toFixed(1)}`)
      .join('');
  return (
    <Figure
      caption={
        drawdown
          ? 'Fall from the previous peak of each equal-weight basket, S&P 500 and commodity ETN.'
          : 'Growth of 100 invested in each equal-weight weekly basket (price returns, log scale). The Chinese basket ends in July 2024.'
      }
    >
      <svg
        viewBox={`0 0 ${String(W)} ${String(H)}`}
        className="h-auto w-full"
        role="img"
        aria-label={
          drawdown
            ? 'Drawdown chart of commodity baskets and the S&P 500'
            : 'Cumulative return chart of commodity baskets and the S&P 500'
        }
      >
        <g fontFamily="var(--font-mono)" fontSize={10} fill={MUTED}>
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={m.l}
                x2={W - m.r}
                y1={y(t)}
                y2={y(t)}
                stroke="var(--border)"
                strokeDasharray={t === 0 || t === 100 ? undefined : '2 4'}
              />
              <text x={m.l - 5} y={y(t) + 3} textAnchor="end">
                {drawdown ? `${String(t * 100)}%`.replace('-', '−') : String(t)}
              </text>
            </g>
          ))}
          {[2008, 2012, 2016, 2020, 2024].map((yr) => (
            <text key={yr} x={x(new Date(Date.UTC(yr, 0, 1)))} y={H - m.b + 15} textAnchor="middle">
              {yr}
            </text>
          ))}
        </g>
        {drawdown &&
          list
            .filter((s) => s.id === 'main' || s.id === 'other')
            .map((s) => (
              <path
                key={`a${s.id}`}
                d={`${path(s.pts)}L${x(new Date(ms('2026-11-21'))).toFixed(1)},${yLin(0).toFixed(1)}L${m.l.toFixed(1)},${yLin(0).toFixed(1)}Z`}
                fill={s.color}
                fillOpacity={0.14}
              />
            ))}
        {list.map((s) => (
          <path
            key={s.id}
            d={path(s.pts)}
            fill="none"
            stroke={s.color}
            strokeWidth={s.w}
            strokeDasharray={s.dash}
            strokeLinejoin="round"
          />
        ))}
        {list.map((s, i) => {
          const last = s.pts.at(-1)?.[1] ?? 0;
          const lab = drawdown
            ? pc(Math.min(...s.pts.map((p) => p[1])))
            : Math.round(last).toString();
          return (
            <text
              key={`l${s.id}`}
              x={W - m.r + 8}
              y={(labY[i] ?? 0) + 3}
              fontSize={11}
              fontWeight={600}
              fill={s.color}
              fontFamily="var(--font-mono)"
            >
              {drawdown ? `${s.label} low ${lab}` : `${s.label} ${lab}`}
            </text>
          );
        })}
      </svg>
    </Figure>
  );
}

/* ---------- Volatility: basket vs members ---------- */
function VolRatio({ d }: { d: Data }) {
  const rows = [
    { k: 'main', label: 'Mainstream (9)', g: 'main' as G },
    { k: 'other', label: 'Other futures (19)', g: 'other' as G },
    { k: 'china', label: 'Chinese (12)', g: 'china' as G },
  ];
  const W = 720;
  const rh = 62;
  const m = { l: 130, r: 110, t: 12, b: 30 };
  const H = m.t + rows.length * rh + m.b;
  const x = scaleLinear()
    .domain([0, 0.4])
    .range([m.l, W - m.r]);
  return (
    <Figure caption="Annualised volatility of weekly returns: the average member against the equal-weight basket.">
      <svg
        viewBox={`0 0 ${String(W)} ${String(H)}`}
        className="h-auto w-full"
        role="img"
        aria-label="Basket volatility compared with average member volatility"
      >
        <g fontFamily="var(--font-mono)" fontSize={10} fill={MUTED}>
          {[0, 0.1, 0.2, 0.3, 0.4].map((t) => (
            <g key={t}>
              <line
                x1={x(t)}
                x2={x(t)}
                y1={m.t}
                y2={H - m.b}
                stroke="var(--border)"
                strokeDasharray={t === 0 ? undefined : '2 4'}
              />
              <text
                x={x(t)}
                y={H - m.b + 14}
                textAnchor="middle"
              >{`${String(Math.round(t * 100))}%`}</text>
            </g>
          ))}
        </g>
        {rows.map((r, i) => {
          const b = d.basket[r.k];
          if (!b) return null;
          const y = m.t + i * rh;
          return (
            <g key={r.k}>
              <text
                x={m.l - 8}
                y={y + rh / 2 + 3}
                textAnchor="end"
                fontSize={11}
                fontFamily="var(--font-mono)"
                fill={FG}
              >
                {r.label}
              </text>
              <rect
                x={m.l}
                y={y + 8}
                width={x(b.avgMemberVol) - m.l}
                height={16}
                rx={2}
                fill={COLOR[r.g]}
                fillOpacity={0.35}
              />
              <text
                x={x(b.avgMemberVol) + 5}
                y={y + 20}
                fontSize={10}
                fontFamily="var(--font-mono)"
                fill={MUTED}
              >
                {`members ${f1(b.avgMemberVol * 100)}%`}
              </text>
              <rect
                x={m.l}
                y={y + 30}
                width={x(b.annVol) - m.l}
                height={16}
                rx={2}
                fill={COLOR[r.g]}
              />
              <text
                x={x(b.annVol) + 5}
                y={y + 42}
                fontSize={10}
                fontWeight={600}
                fontFamily="var(--font-mono)"
                fill={FG}
              >
                {`basket ${f1(b.annVol * 100)}% (${String(Math.round((b.annVol / b.avgMemberVol) * 100))}%)`}
              </text>
            </g>
          );
        })}
      </svg>
    </Figure>
  );
}

/* ---------- Beeswarm per stress episode ---------- */
function Episodes({ d }: { d: Data }) {
  const eps = d.viz.episodeMembers;
  const W = 720;
  const rh = 104;
  const m = { l: 128, r: 16, t: 22, b: 28 };
  const H = m.t + eps.length * rh + m.b;
  const x = scaleLinear()
    .domain([-0.65, 0.7])
    .range([m.l, W - m.r]);
  const lane: Record<G, number> = { main: -26, other: 0, china: 26 };
  return (
    <Figure
      scroll={560}
      caption="Each dot is one futures series, in three lanes by group. Solid line: S&P 500. Dashed: commodity ETN. Small bar in a lane: that group's median."
    >
      <svg
        viewBox={`0 0 ${String(W)} ${String(H)}`}
        className="h-auto w-full"
        role="img"
        aria-label="Price change of each commodity future in four market stress episodes"
      >
        <g fontFamily="var(--font-mono)" fontSize={10} fill={MUTED}>
          {[-0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6].map((t) => (
            <g key={t}>
              <line
                x1={x(t)}
                x2={x(t)}
                y1={m.t}
                y2={H - m.b}
                stroke="var(--border)"
                strokeDasharray={t === 0 ? undefined : '2 4'}
              />
              <text x={x(t)} y={H - m.b + 14} textAnchor="middle">
                {pc(t)}
              </text>
            </g>
          ))}
        </g>
        {eps.map((e, r) => {
          const cy = m.t + r * rh + rh / 2;
          return (
            <g key={e.label}>
              {r > 0 && (
                <line x1={4} x2={W - 4} y1={cy - rh / 2} y2={cy - rh / 2} stroke="var(--border)" />
              )}
              <text
                x={m.l - 10}
                y={cy - 2}
                textAnchor="end"
                fontSize={11}
                fontWeight={600}
                fill={FG}
                fontFamily="var(--font-mono)"
              >
                {e.label}
              </text>
              <text
                x={m.l - 10}
                y={cy + 11}
                textAnchor="end"
                fontSize={9}
                fill={MUTED}
                fontFamily="var(--font-mono)"
              >
                {`${e.from.slice(0, 7)} → ${e.to.slice(0, 7)}`}
              </text>
              {(['main', 'other', 'china'] as G[]).map((g) => {
                const ms2 = e.members.filter((q) => q.g === g);
                if (!ms2.length) return null;
                const med = median(ms2.map((q) => q.r));
                return (
                  <g key={g}>
                    {ms2.map((q, k) => (
                      <circle
                        key={q.n}
                        cx={x(q.r)}
                        cy={cy + lane[g] + jitter(k, r) * 7}
                        r={3.6}
                        fill={COLOR[g]}
                        fillOpacity={0.8}
                      >
                        <title>{`${q.n}: ${pc(q.r)}`}</title>
                      </circle>
                    ))}
                    <rect
                      x={x(med) - 1.5}
                      y={cy + lane[g] - 12}
                      width={3}
                      height={24}
                      rx={1}
                      fill={COLOR[g]}
                    >
                      <title>{`${LABEL[g]} median ${pc(med)}`}</title>
                    </rect>
                  </g>
                );
              })}
              <line
                x1={x(e.spx)}
                x2={x(e.spx)}
                y1={cy - rh / 2 + 6}
                y2={cy + rh / 2 - 6}
                stroke={FG}
                strokeWidth={2.2}
              />
              <text
                x={x(e.spx) + 4}
                y={cy - rh / 2 + 15}
                fontSize={9}
                fontWeight={700}
                fill={FG}
                fontFamily="var(--font-mono)"
              >
                {`S&P ${pc(e.spx)}`}
              </text>
              <line
                x1={x(e.djp)}
                x2={x(e.djp)}
                y1={cy - rh / 2 + 6}
                y2={cy + rh / 2 - 6}
                stroke={MUTED}
                strokeWidth={1.6}
                strokeDasharray="4 3"
              />
              <text
                x={x(e.djp) + 4}
                y={cy + rh / 2 - 9}
                fontSize={9}
                fill={MUTED}
                fontFamily="var(--font-mono)"
              >
                {`ETN ${pc(e.djp)}`}
              </text>
            </g>
          );
        })}
      </svg>
      <Legend items={GROUP_LEGEND} />
    </Figure>
  );
}

/* ---------- Scatter: basket vs S&P 500 weekly returns ---------- */
function Scatter({ d }: { d: Data }) {
  const worst = new Set(d.viz.worstWeeks);
  const W = 720;
  const H = 330;
  const pw = 318;
  const m = { l: 44, t: 28, b: 34 };
  const panels = [
    { idx: 2, label: 'Mainstream basket', color: COLOR.main },
    { idx: 3, label: 'Other-futures basket', color: COLOR.other },
  ];
  const plotW = pw - m.l - 8;
  const xs = scaleLinear().domain([-0.21, 0.15]).range([0, plotW]);
  const plotH = H - m.t - m.b;
  const ys = scaleLinear().domain([-0.14, 0.12]).range([plotH, 0]);
  return (
    <Figure caption="Each dot is one week since 2006: S&P 500 return on the x-axis, basket return on the y-axis. Red: the 20 worst S&P weeks.">
      <svg
        viewBox={`0 0 ${String(W)} ${String(H)}`}
        className="h-auto w-full"
        role="img"
        aria-label="Weekly commodity basket returns plotted against weekly S&P 500 returns"
      >
        {panels.map((p, pi) => {
          const pts = d.viz.weeks.map((w) => ({ d: w[0], s: w[1], y: w[p.idx as 2 | 3] }));
          const r = pearson(
            pts.map((q) => q.s),
            pts.map((q) => q.y),
          );
          const ox = pi * (pw + 28) + m.l;
          return (
            <g key={p.label} transform={`translate(${String(ox)},${String(m.t)})`}>
              <text
                x={-m.l + 4}
                y={-12}
                fontSize={12}
                fontWeight={600}
                fill={p.color}
                fontFamily="var(--font-mono)"
              >
                {`${p.label}  r = ${c2(r)}`}
              </text>
              <g fontFamily="var(--font-mono)" fontSize={9} fill={MUTED}>
                {[-0.1, 0, 0.1].map((t) => (
                  <g key={t}>
                    <line
                      x1={0}
                      x2={plotW}
                      y1={ys(t)}
                      y2={ys(t)}
                      stroke="var(--border)"
                      strokeDasharray={t === 0 ? undefined : '2 4'}
                    />
                    <text x={-5} y={ys(t) + 3} textAnchor="end">
                      {pc(t)}
                    </text>
                  </g>
                ))}
                {[-0.2, -0.1, 0, 0.1].map((t) => (
                  <g key={t}>
                    <line
                      x1={xs(t)}
                      x2={xs(t)}
                      y1={0}
                      y2={plotH}
                      stroke="var(--border)"
                      strokeDasharray={t === 0 ? undefined : '2 4'}
                    />
                    <text x={xs(t)} y={plotH + 13} textAnchor="middle">
                      {pc(t)}
                    </text>
                  </g>
                ))}
              </g>
              {pts
                .filter((q) => !worst.has(q.d))
                .map((q) => (
                  <circle
                    key={q.d}
                    cx={xs(q.s)}
                    cy={ys(q.y)}
                    r={1.7}
                    fill={p.color}
                    fillOpacity={0.4}
                  />
                ))}
              {pts
                .filter((q) => worst.has(q.d))
                .map((q) => (
                  <circle
                    key={q.d}
                    cx={xs(q.s)}
                    cy={ys(q.y)}
                    r={3.6}
                    fill="var(--chart-3)"
                    stroke="var(--card)"
                    strokeWidth={0.8}
                  >
                    <title>{`${q.d}: S&P ${pc(q.s, 1)}, basket ${pc(q.y, 1)}`}</title>
                  </circle>
                ))}
            </g>
          );
        })}
      </svg>
    </Figure>
  );
}

/* ---------- Sparkline small multiples ---------- */
const RECENT_ORDER: [string, 'eq' | 'main' | 'named'][] = [
  ['spx', 'eq'],
  ['ndx', 'eq'],
  ['djp', 'main'],
  ['gold', 'main'],
  ['copper', 'main'],
  ['wti', 'main'],
  ['natgas', 'main'],
  ['alu', 'main'],
  ['ttf', 'named'],
  ['iron', 'named'],
  ['hrc', 'named'],
  ['krbn', 'named'],
  ['kcca', 'named'],
  ['bdry', 'named'],
  ['coal', 'named'],
  ['ura', 'named'],
];
const RC = { eq: FG, main: COLOR.main, named: COLOR.other };

function Recent({ d }: { d: Data }) {
  return (
    <div className="not-prose my-8">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {RECENT_ORDER.map(([id, kind]) => {
          const r = d.recent.find((q) => q.id === id);
          if (!r || r.px.length < 2) return null;
          const base = r.px[0]?.[1] ?? 1;
          const pts = r.px.map(([dt, v]) => [dt, (v / base) * 100] as [string, number]);
          const w = 160;
          const h = 96;
          const x = scaleLinear()
            .domain([0, pts.length - 1])
            .range([6, w - 6]);
          const y = scaleLinear()
            .domain([78, 122])
            .range([h - 8, 40]);
          const last = pts.at(-1)?.[1] ?? 100;
          return (
            <figure key={id} className="border-border bg-card rounded-lg border p-2">
              <svg
                viewBox={`0 0 ${String(w)} ${String(h)}`}
                className="h-auto w-full"
                role="img"
                aria-label={`${r.name} from 6 to 20 November`}
              >
                <text
                  x={6}
                  y={12}
                  fontSize={9.5}
                  fontWeight={600}
                  fill={FG}
                  fontFamily="var(--font-mono)"
                >
                  {r.name.length > 24 ? `${r.name.slice(0, 23)}…` : r.name}
                </text>
                <line
                  x1={6}
                  x2={w - 6}
                  y1={y(100)}
                  y2={y(100)}
                  stroke="var(--border)"
                  strokeDasharray="3 3"
                />
                <path
                  d={pts
                    .map(
                      ([, v], i) =>
                        `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(Math.min(122, Math.max(78, v))).toFixed(1)}`,
                    )
                    .join('')}
                  fill="none"
                  stroke={RC[kind]}
                  strokeWidth={1.8}
                  strokeLinejoin="round"
                />
                <circle
                  cx={x(pts.length - 1)}
                  cy={y(Math.min(122, Math.max(78, last)))}
                  r={2.8}
                  fill={RC[kind]}
                />
                <text
                  x={6}
                  y={30}
                  textAnchor="start"
                  fontSize={13}
                  fontWeight={700}
                  fill={RC[kind]}
                  fontFamily="var(--font-mono)"
                >
                  {pc(last / 100 - 1, 1)}
                </text>
              </svg>
            </figure>
          );
        })}
      </div>
      <div className="text-muted-foreground mt-2 font-mono text-[11px]">
        Daily closes indexed to 100 on 6 Nov 2026, same scale in every panel.
      </div>
      <Legend
        items={[
          { label: 'Equities', color: FG },
          { label: 'Mainstream commodities', color: COLOR.main },
          { label: 'Niche-market proxies', color: COLOR.other },
        ]}
      />
    </div>
  );
}

/* ---------- Dumbbell: named-market proxies vs S&P and commodity ETN ---------- */
function Dumbbell({ d }: { d: Data }) {
  const rows = [...d.named.vsSpx].sort((a, b) => b.spx - a.spx);
  const W = 720;
  const rh = 30;
  const m = { l: 220, r: 20, t: 14, b: 30 };
  const H = m.t + rows.length * rh + m.b;
  const x = scaleLinear()
    .domain([-0.25, 0.65])
    .range([m.l, W - m.r]);
  return (
    <Figure
      scroll={560}
      caption="Weekly return correlation of each proxy with the S&P 500 and the Bloomberg commodity ETN, from January 2024."
    >
      <svg
        viewBox={`0 0 ${String(W)} ${String(H)}`}
        className="h-auto w-full"
        role="img"
        aria-label="Correlation of niche-market proxies with equities and commodities"
      >
        <g fontFamily="var(--font-mono)" fontSize={10} fill={MUTED}>
          {[-0.2, 0, 0.2, 0.4, 0.6].map((t) => (
            <g key={t}>
              <line
                x1={x(t)}
                x2={x(t)}
                y1={m.t}
                y2={H - m.b}
                stroke="var(--border)"
                strokeDasharray={t === 0 ? undefined : '2 4'}
              />
              <text x={x(t)} y={H - m.b + 14} textAnchor="middle">
                {c2(t)}
              </text>
            </g>
          ))}
        </g>
        {rows.map((r, i) => {
          const cy = m.t + i * rh + rh / 2;
          return (
            <g key={r.name}>
              <text
                x={m.l - 8}
                y={cy + 3}
                textAnchor="end"
                fontSize={10}
                fontFamily="var(--font-mono)"
                fill={FG}
              >
                {r.name}
              </text>
              <line
                x1={x(r.spx)}
                x2={x(r.djp)}
                y1={cy}
                y2={cy}
                stroke={MUTED}
                strokeOpacity={0.5}
                strokeWidth={3}
                strokeLinecap="round"
              />
              <circle cx={x(r.spx)} cy={cy} r={5} fill={FG}>
                <title>{`${r.name}: S&P 500 ${c2(r.spx)}`}</title>
              </circle>
              <circle cx={x(r.djp)} cy={cy} r={5} fill={COLOR.main}>
                <title>{`${r.name}: commodity ETN ${c2(r.djp)}`}</title>
              </circle>
            </g>
          );
        })}
      </svg>
      <Legend
        items={[
          { label: 'S&P 500', color: FG },
          { label: 'Bloomberg commodity ETN', color: COLOR.main },
        ]}
      />
    </Figure>
  );
}

export function AltCorrelationChart({
  kind,
  dataDir = '/data',
}: {
  kind: AltChartKind;
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
  switch (kind) {
    case 'stats':
      return <Stats d={data} />;
    case 'heatmap':
      return <Heatmap d={data} />;
    case 'strip':
      return <Strip d={data} />;
    case 'lollipop':
      return <Lollipop d={data} />;
    case 'pairs':
      return <Pairs d={data} />;
    case 'curves':
      return <Curves d={data} />;
    case 'drawdown':
      return <Curves d={data} drawdown />;
    case 'volratio':
      return <VolRatio d={data} />;
    case 'episodes':
      return <Episodes d={data} />;
    case 'scatter':
      return <Scatter d={data} />;
    case 'recent':
      return <Recent d={data} />;
    case 'dumbbell':
      return <Dumbbell d={data} />;
  }
}
