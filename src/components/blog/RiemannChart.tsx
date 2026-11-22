import { scaleLinear, scaleLog } from 'd3-scale';
import { useState, type PointerEvent } from 'react';

export type RiemannChartKind = 'industries' | 'witnesses' | 'residues' | 'race' | 'outlook';

const mono = { fontFamily: 'var(--font-mono)' } as const;
const f = (v: number) => v.toFixed(1);
const readout = 'text-muted-foreground mt-2 min-h-5 font-mono text-xs';

/* ------------------------------------------------------------------ */
/* Real data: one sieve to 1,000,000, shared by the two prime charts. */
/* ------------------------------------------------------------------ */

const N = 1_000_000;
type PrimeData = { race: [number, number][]; lastDigit: Record<1 | 3 | 7 | 9, number> };
let primeCache: PrimeData | undefined;

function primeData(): PrimeData {
  if (primeCache) return primeCache;
  const composite = new Uint8Array(N + 1);
  const samples = new Set<number>();
  for (let i = 0; i <= 500; i++) samples.add(Math.round(10 ** (1 + (5 * i) / 500)));
  const race: [number, number][] = [];
  const lastDigit = { 1: 0, 3: 0, 7: 0, 9: 0 };
  let lead = 0; // primes ≡ 3 (mod 4) minus primes ≡ 1 (mod 4)
  for (let x = 2; x <= N; x++) {
    if (composite[x] === 0) {
      for (let m = x * x; m <= N; m += x) composite[m] = 1;
      if (x % 4 === 3) lead++;
      else if (x % 4 === 1) lead--;
      const d = x % 10;
      if (d === 1 || d === 3 || d === 7 || d === 9) lastDigit[d]++;
    }
    if (samples.has(x)) race.push([x, lead]);
  }
  primeCache = { race, lastDigit };
  return primeCache;
}

/* ------------------------------------------------------------------ */
/* Editorial estimates (judgement, not measurements) - see the post.   */
/* ------------------------------------------------------------------ */

const INDUSTRIES = [
  {
    name: 'Computational number theory',
    pct: 30,
    color: 'var(--chart-1)',
    note: 'primality, modular roots, finite-field factoring',
  },
  {
    name: 'Algebraic number theory',
    pct: 25,
    color: 'var(--chart-2)',
    note: 'class groups and class numbers',
  },
  {
    name: 'Prime distribution',
    pct: 20,
    color: 'var(--chart-3)',
    note: 'primes in residue classes, gaps, least witnesses',
  },
  {
    name: 'Arithmetic geometry',
    pct: 12,
    color: 'var(--chart-4)',
    note: 'L-functions of elliptic curves, rational points',
  },
  {
    name: 'Cryptography analysis',
    pct: 6,
    color: 'var(--chart-5)',
    note: 'parameter choice, class-group based schemes',
  },
  {
    name: 'Everything else',
    pct: 7,
    color: 'var(--muted-foreground)',
    note: 'symbolic computation, ML for maths, physics analogies',
  },
];

const OUTLOOK = [
  { name: 'Algorithmic number theory', x: 0.93, y: 0.4, dx: 4, dy: 22, anchor: 'end' },
  { name: 'Arithmetic geometry', x: 0.74, y: 0.66, dx: -8, dy: -12, anchor: 'end' },
  { name: 'Cryptographic analysis', x: 0.66, y: 0.5, dx: 10, dy: 4, anchor: 'start' },
  { name: 'Pseudorandomness', x: 0.55, y: 0.3, dx: 10, dy: 4, anchor: 'start' },
  { name: 'Coding theory', x: 0.47, y: 0.18, dx: 10, dy: 4, anchor: 'start' },
  { name: 'ML for mathematics', x: 0.38, y: 0.55, dx: 10, dy: 4, anchor: 'start' },
  { name: 'Physics / quantum', x: 0.14, y: 0.93, dx: 12, dy: 4, anchor: 'start' },
] as const;

/* ------------------------------------------------------------------ */

function arc(cx: number, cy: number, r0: number, r1: number, a0: number, a1: number): string {
  const p = (r: number, a: number) => `${f(cx + r * Math.cos(a))},${f(cy + r * Math.sin(a))}`;
  const big = a1 - a0 > Math.PI ? 1 : 0;
  return `M${p(r1, a0)}A${String(r1)},${String(r1)} 0 ${String(big)} 1 ${p(r1, a1)}L${p(r0, a1)}A${String(r0)},${String(r0)} 0 ${String(big)} 0 ${p(r0, a0)}Z`;
}

function Industries() {
  const [hot, setHot] = useState<number | null>(null);
  const active = hot === null ? undefined : INDUSTRIES[hot];
  const slices = INDUSTRIES.map((s, i) => {
    const before = INDUSTRIES.slice(0, i).reduce((sum, t) => sum + t.pct, 0);
    const a0 = -Math.PI / 2 + (before / 100) * 2 * Math.PI;
    return { ...s, i, a0, a1: a0 + (s.pct / 100) * 2 * Math.PI };
  });
  return (
    <div className="not-prose my-8 flex flex-col items-center gap-6 sm:flex-row">
      <svg
        viewBox="0 0 260 260"
        className="h-auto w-full max-w-[260px] shrink-0"
        role="img"
        aria-label="Donut chart of where GRH is relied on, by field (editorial estimate)"
      >
        {slices.map((s) => (
          <path
            key={s.name}
            d={arc(130, 130, 78, hot === s.i ? 124 : 120, s.a0, s.a1)}
            fill={s.color}
            stroke="var(--background)"
            strokeWidth={2}
            opacity={hot === null || hot === s.i ? 1 : 0.45}
            onPointerEnter={() => {
              setHot(s.i);
            }}
            onPointerLeave={() => {
              setHot(null);
            }}
          />
        ))}
        <g textAnchor="middle" fill="var(--foreground)" style={mono}>
          <text x={130} y={active ? 128 : 134} fontSize={active ? 28 : 13}>
            {active ? `${String(active.pct)}%` : 'GRH reliance'}
          </text>
          {active ? null : (
            <text x={130} y={152} fontSize={10} fill="var(--muted-foreground)">
              by field
            </text>
          )}
        </g>
      </svg>
      <ul className="m-0 w-full list-none space-y-1 p-0">
        {INDUSTRIES.map((s, i) => (
          <li
            key={s.name}
            className={`flex items-baseline gap-3 rounded-md px-2 py-1.5 transition-colors ${hot === i ? 'bg-muted' : ''}`}
            onPointerEnter={() => {
              setHot(i);
            }}
            onPointerLeave={() => {
              setHot(null);
            }}
          >
            <span
              className="mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ background: s.color }}
            />
            <span className="flex-1 text-sm">
              <span className="font-medium">{s.name}</span>
              <span className="text-muted-foreground block text-xs">{s.note}</span>
            </span>
            <span className="font-mono text-sm tabular-nums">{s.pct}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Witnesses() {
  const w = 640;
  const h = 300;
  const pad = { l: 56, r: 16, t: 16, b: 34 };
  const [bits, setBits] = useState<number | null>(null);
  const x = scaleLinear()
    .domain([8, 2048])
    .range([pad.l, w - pad.r]);
  const y = scaleLinear()
    .domain([0, 320])
    .range([h - pad.b, pad.t]);
  const grh = (b: number) => Math.log10(2 * (b * Math.LN2) ** 2);
  const trial = (b: number) => (b / 2) * Math.log10(2);
  const xs = Array.from({ length: 128 }, (_, i) => 8 + (i * (2048 - 8)) / 127);
  const path = (fn: (b: number) => number) =>
    xs.map((b, i) => `${i ? 'L' : 'M'}${f(x(b))},${f(y(fn(b)))}`).join('');
  const move = (e: PointerEvent<SVGRectElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * (w - pad.l - pad.r) + pad.l;
    setBits(Math.max(8, Math.min(2048, Math.round(x.invert(px)))));
  };
  const shown = bits ?? 2048;
  const sci = (l: number) => `10^${String(Math.round(l))}`;
  return (
    <figure className="not-prose my-8">
      <svg
        viewBox={`0 0 ${String(w)} ${String(h)}`}
        className="h-auto w-full"
        role="img"
        aria-label="Miller test witnesses needed under GRH versus trial division, by key size"
      >
        <g fontSize={10} fill="var(--muted-foreground)" style={mono}>
          {[0, 100, 200, 300].map((v) => (
            <g key={v}>
              <line x1={pad.l} x2={w - pad.r} y1={y(v)} y2={y(v)} stroke="var(--border)" />
              <text x={pad.l - 6} y={y(v) + 3} textAnchor="end">{`10^${String(v)}`}</text>
            </g>
          ))}
          {[512, 1024, 1536, 2048].map((b) => (
            <text key={b} x={x(b)} y={h - 12} textAnchor="middle">
              {b === 2048 ? '2048' : `${String(b)} bit`}
            </text>
          ))}
        </g>
        <path d={path(trial)} fill="none" stroke="var(--chart-3)" strokeWidth={2} />
        <path d={path(grh)} fill="none" stroke="var(--chart-1)" strokeWidth={2} />
        <text
          x={x(1000) - 10}
          y={y(trial(1000)) + 4}
          textAnchor="end"
          fontSize={11}
          fill="var(--foreground)"
          style={mono}
        >
          trial division
        </text>
        <text x={x(1000)} y={y(grh(1000)) - 10} fontSize={11} fill="var(--foreground)" style={mono}>
          Miller test under GRH
        </text>
        <line x1={x(shown)} x2={x(shown)} y1={pad.t} y2={h - pad.b} stroke="var(--border)" />
        <circle
          cx={x(shown)}
          cy={y(trial(shown))}
          r={4}
          fill="var(--chart-3)"
          stroke="var(--background)"
          strokeWidth={2}
        />
        <circle
          cx={x(shown)}
          cy={y(grh(shown))}
          r={4}
          fill="var(--chart-1)"
          stroke="var(--background)"
          strokeWidth={2}
        />
        <rect
          x={pad.l}
          y={pad.t}
          width={w - pad.l - pad.r}
          height={h - pad.t - pad.b}
          fill="transparent"
          onPointerMove={move}
          onPointerLeave={() => {
            setBits(null);
          }}
        />
      </svg>
      <figcaption className={readout}>
        {`${String(shown)}-bit number: ≈ ${Math.round(2 * (shown * Math.LN2) ** 2).toLocaleString('en-US')} witnesses under GRH vs ≈ ${sci(trial(shown))} trial divisions`}
      </figcaption>
    </figure>
  );
}

function Residues() {
  const { lastDigit } = primeData();
  const [hot, setHot] = useState<number | null>(null);
  const digits = [1, 3, 7, 9] as const;
  const total = digits.reduce((s, d) => s + lastDigit[d], 0);
  const max = Math.max(...digits.map((d) => lastDigit[d]));
  const w = 640;
  const h = 220;
  const pad = { l: 48, r: 16, t: 16, b: 34 };
  const y = scaleLinear()
    .domain([0, max * 1.15])
    .range([h - pad.b, pad.t]);
  const bw = 72;
  const gap = (w - pad.l - pad.r - bw * 4) / 4;
  const active = hot === null ? undefined : digits[hot];
  return (
    <figure className="not-prose my-8">
      <svg
        viewBox={`0 0 ${String(w)} ${String(h)}`}
        className="h-auto w-full"
        role="img"
        aria-label="Count of primes below one million by last digit"
      >
        <g fontSize={10} fill="var(--muted-foreground)" style={mono}>
          {[0, 5000, 10000, 15000, 20000].map((v) => (
            <g key={v}>
              <line x1={pad.l} x2={w - pad.r} y1={y(v)} y2={y(v)} stroke="var(--border)" />
              <text x={pad.l - 6} y={y(v) + 3} textAnchor="end">
                {v.toLocaleString('en-US')}
              </text>
            </g>
          ))}
        </g>
        {digits.map((d, i) => {
          const bx = pad.l + gap / 2 + i * (bw + gap);
          const top = y(lastDigit[d]);
          return (
            <g
              key={d}
              onPointerEnter={() => {
                setHot(i);
              }}
              onPointerLeave={() => {
                setHot(null);
              }}
            >
              <rect
                x={bx - gap / 2}
                y={pad.t}
                width={bw + gap}
                height={h - pad.t - pad.b}
                fill="transparent"
              />
              <path
                d={`M${f(bx)},${f(h - pad.b)}V${f(top + 4)}Q${f(bx)},${f(top)} ${f(bx + 4)},${f(top)}H${f(bx + bw - 4)}Q${f(bx + bw)},${f(top)} ${f(bx + bw)},${f(top + 4)}V${f(h - pad.b)}Z`}
                fill="var(--chart-1)"
                opacity={hot === null || hot === i ? 1 : 0.5}
              />
              <text
                x={bx + bw / 2}
                y={h - 12}
                textAnchor="middle"
                fontSize={11}
                fill="var(--foreground)"
                style={mono}
              >
                {`…${String(d)}`}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className={readout}>
        {active === undefined
          ? 'Hover a bar'
          : `primes ending in ${String(active)}: ${lastDigit[active].toLocaleString('en-US')} (${((100 * lastDigit[active]) / total).toFixed(2)}% of the ${total.toLocaleString('en-US')} that aren’t 2 or 5)`}
      </figcaption>
    </figure>
  );
}

function Race() {
  const { race } = primeData();
  const w = 640;
  const h = 300;
  const pad = { l: 48, r: 16, t: 16, b: 34 };
  const [i, setI] = useState<number | null>(null);
  const ys = race.map((p) => p[1]);
  const lo = Math.min(...ys, 0);
  const hi = Math.max(...ys);
  const x = scaleLog()
    .domain([10, N])
    .range([pad.l, w - pad.r]);
  const y = scaleLinear()
    .domain([lo - 10, hi + 10])
    .range([h - pad.b, pad.t]);
  const d = race.map(([px, py], k) => `${k ? 'L' : 'M'}${f(x(px))},${f(y(py))}`).join('');
  const move = (e: PointerEvent<SVGRectElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * (w - pad.l - pad.r) + pad.l;
    const target = x.invert(px);
    let best = 0;
    race.forEach((p, k) => {
      const b = race[best];
      if (b && Math.abs(Math.log(p[0] / target)) < Math.abs(Math.log(b[0] / target))) best = k;
    });
    setI(best);
  };
  const cur = i === null ? undefined : race[i];
  const FLIP = 26861;
  return (
    <figure className="not-prose my-8">
      <svg
        viewBox={`0 0 ${String(w)} ${String(h)}`}
        className="h-auto w-full"
        role="img"
        aria-label="Lead of primes 3 mod 4 over primes 1 mod 4, up to one million"
      >
        <g fontSize={10} fill="var(--muted-foreground)" style={mono}>
          {y.ticks(5).map((v) => (
            <g key={v}>
              <line
                x1={pad.l}
                x2={w - pad.r}
                y1={y(v)}
                y2={y(v)}
                stroke={v === 0 ? 'var(--muted-foreground)' : 'var(--border)'}
              />
              <text x={pad.l - 6} y={y(v) + 3} textAnchor="end">
                {v}
              </text>
            </g>
          ))}
          {[10, 100, 1000, 10000, 100000, 1000000].map((v) => (
            <text key={v} x={x(v)} y={h - 12} textAnchor="middle">
              {v === 1000000 ? '1M' : v.toLocaleString('en-US')}
            </text>
          ))}
        </g>
        <path d={d} fill="none" stroke="var(--chart-2)" strokeWidth={2} />
        <line
          x1={x(FLIP)}
          x2={x(FLIP)}
          y1={pad.t}
          y2={h - pad.b}
          stroke="var(--chart-3)"
          strokeDasharray="3 3"
        />
        <text
          x={x(FLIP) - 6}
          y={pad.t + 12}
          textAnchor="end"
          fontSize={10}
          fill="var(--foreground)"
          style={mono}
        >
          26,861: the 1-mod-4 team first leads
        </text>
        {cur ? (
          <circle
            cx={x(cur[0])}
            cy={y(cur[1])}
            r={4}
            fill="var(--chart-2)"
            stroke="var(--background)"
            strokeWidth={2}
          />
        ) : null}
        <rect
          x={pad.l}
          y={pad.t}
          width={w - pad.l - pad.r}
          height={h - pad.t - pad.b}
          fill="transparent"
          onPointerMove={move}
          onPointerLeave={() => {
            setI(null);
          }}
        />
      </svg>
      <figcaption className={readout}>
        {cur
          ? `up to ${cur[0].toLocaleString('en-US')}: primes ≡ 3 (mod 4) lead by ${String(cur[1])}`
          : 'Hover the line. Above zero: more primes ending in 3 mod 4 than 1 mod 4. Log x-axis.'}
      </figcaption>
    </figure>
  );
}

function Outlook() {
  const w = 640;
  const h = 420;
  const pad = { l: 40, r: 16, t: 16, b: 40 };
  const [hot, setHot] = useState<number | null>(null);
  const x = scaleLinear()
    .domain([0, 1])
    .range([pad.l, w - pad.r]);
  const y = scaleLinear()
    .domain([0, 1])
    .range([h - pad.b, pad.t]);
  return (
    <figure className="not-prose my-8">
      <svg
        viewBox={`0 0 ${String(w)} ${String(h)}`}
        className="h-auto w-full"
        role="img"
        aria-label="Editorial map of where a GRH-linked discovery is most plausible"
      >
        <g stroke="var(--border)">
          <line x1={x(0.5)} x2={x(0.5)} y1={pad.t} y2={h - pad.b} />
          <line x1={pad.l} x2={w - pad.r} y1={y(0.5)} y2={y(0.5)} />
          <rect
            x={pad.l}
            y={pad.t}
            width={w - pad.l - pad.r}
            height={h - pad.t - pad.b}
            fill="none"
          />
        </g>
        <g fontSize={10} fill="var(--muted-foreground)" style={mono}>
          <text x={(pad.l + w - pad.r) / 2} y={h - 8} textAnchor="middle">
            closer to where GRH is already used →
          </text>
          <text transform={`translate(12 ${String(h / 2)}) rotate(-90)`} textAnchor="middle">
            headline impact if it works →
          </text>
        </g>
        {OUTLOOK.map((p, i) => (
          <g
            key={p.name}
            onPointerEnter={() => {
              setHot(i);
            }}
            onPointerLeave={() => {
              setHot(null);
            }}
          >
            <circle
              cx={x(p.x)}
              cy={y(p.y)}
              r={hot === i ? 9 : 7}
              fill="var(--chart-1)"
              stroke="var(--background)"
              strokeWidth={2}
            />
            <text
              x={x(p.x) + p.dx}
              y={y(p.y) + p.dy}
              textAnchor={p.anchor}
              fontSize={11}
              fill="var(--foreground)"
              style={mono}
              fontWeight={hot === i ? 700 : 400}
            >
              {p.name}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className={readout}>
        Positions are my judgement, not measurements. Top-right is the sweet spot.
      </figcaption>
    </figure>
  );
}

export function RiemannChart({ kind }: { kind: RiemannChartKind }) {
  switch (kind) {
    case 'industries':
      return <Industries />;
    case 'witnesses':
      return <Witnesses />;
    case 'residues':
      return <Residues />;
    case 'race':
      return <Race />;
    case 'outlook':
      return <Outlook />;
  }
}
