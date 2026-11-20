import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type Series = { name: string; color: string; data: (number | null)[] };
type ChartData = {
  title: string;
  type?: 'line' | 'area' | 'histogram';
  series: Series[];
  xAxis: { data?: (number | string)[] };
  yAxis: { format?: 'currency' | 'percent'; decimals?: number };
  referenceLines?: { y: number; color: string; label?: string; strokeDasharray?: string }[];
  markers?: { x: number | string; y: number; type: 'long' | 'short'; label?: string }[];
};

const chartLoaders = import.meta.glob<ChartData>('/src/content/posts/*/charts/*.json', {
  import: 'default',
});

const axisProps = {
  stroke: 'var(--muted-foreground)',
  tick: { fill: 'var(--muted-foreground)', fontSize: 11, fontFamily: 'var(--font-mono)' },
  tickLine: false,
  axisLine: { stroke: 'var(--border)' },
} as const;

function formatY(value: number, format?: string, decimals?: number): string {
  if (format === 'currency') {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(value);
  }
  if (format === 'percent') {
    return `${value.toFixed(2)}%`;
  }
  if (decimals != null) {
    return value.toFixed(decimals);
  }
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 4 }).format(value);
}

type TipProps = {
  active?: boolean;
  payload?: { name?: string; value?: number | string; color?: string }[];
  label?: string | number;
};

function makeTooltip(data: ChartData, xLabels: (number | string)[]) {
  return function ChartTooltip({ active, payload, label }: TipProps) {
    if (!active || !payload?.length) {
      return null;
    }
    const xLabel = typeof label === 'number' ? (xLabels[label] ?? label) : label;
    return (
      <div className="border-border bg-popover rounded-md border px-3 py-2 font-mono text-xs">
        <div className="text-muted-foreground mb-1">{String(xLabel)}</div>
        {payload
          .filter((p) => typeof p.value === 'number')
          .map((p) => (
            <div key={p.name} className="flex items-center justify-between gap-3">
              <span style={{ color: p.color }}>{p.name}</span>
              <span className="tabular-nums">
                {formatY(p.value as number, data.yAxis.format, data.yAxis.decimals)}
              </span>
            </div>
          ))}
      </div>
    );
  };
}

function ReferenceItems({ data }: { data: ChartData }) {
  return (
    <>
      {data.referenceLines?.map((rl, i) => (
        <ReferenceLine
          key={`ref-${String(i)}`}
          y={rl.y}
          stroke={rl.color}
          strokeDasharray={rl.strokeDasharray ?? '6 3'}
          strokeOpacity={0.7}
          {...(rl.label
            ? {
                label: {
                  value: rl.label,
                  fill: rl.color,
                  fontSize: 10,
                  position: 'right' as const,
                },
              }
            : {})}
        />
      ))}
      {data.markers?.map((m, i) => (
        <ReferenceDot
          key={`m-${String(i)}`}
          x={m.x}
          y={m.y}
          r={4}
          fill={m.type === 'long' ? '#4ade80' : '#f87171'}
          stroke="var(--background)"
          strokeWidth={1}
          {...(m.label
            ? {
                label: {
                  value: m.label,
                  fill: 'var(--foreground)',
                  fontSize: 10,
                  position: 'top' as const,
                },
              }
            : {})}
        />
      ))}
    </>
  );
}

export function PostChart({
  src,
  postSlug,
  caption,
}: {
  src: string;
  postSlug: string;
  caption?: string;
}) {
  const path = `/src/content/posts/${postSlug}/charts/${src}.json`;
  const [loaded, setLoaded] = useState<{ path: string; data: ChartData | null } | null>(null);
  useEffect(() => {
    const load = chartLoaders[path];
    let cancelled = false;
    void (load ? load() : Promise.resolve(null)).then((data) => {
      if (!cancelled) {
        setLoaded({ path, data });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [path]);
  const data = loaded?.path === path ? loaded.data : undefined;
  const xLabels = useMemo(() => data?.xAxis.data ?? [], [data]);

  if (data === undefined) {
    return <div className="border-border bg-card my-8 h-96 rounded-lg border" aria-busy="true" />;
  }
  if (data === null) {
    return <p className="text-destructive text-sm">Chart not found: {src}</p>;
  }

  const isBar = data.type === 'histogram';
  const rows = Array.from({ length: data.series[0]?.data.length ?? 0 }, (_, i) => {
    const row: Record<string, number | string | null> = { x: isBar ? String(xLabels[i] ?? i) : i };
    for (const s of data.series) {
      row[s.name] = s.data[i] ?? null;
    }
    return row;
  });
  const margin = { top: 5, right: 20, left: 0, bottom: 5 };
  const yTick = (v: number) => formatY(v, data.yAxis.format, data.yAxis.decimals);
  const tooltip = makeTooltip(data, xLabels);

  const xAxis = isBar ? (
    <XAxis dataKey="x" {...axisProps} />
  ) : (
    <XAxis
      dataKey="x"
      {...axisProps}
      interval="preserveStartEnd"
      tickFormatter={(v: number) => String(xLabels[v] ?? v)}
    />
  );
  const yAxis = <YAxis {...axisProps} tickFormatter={yTick} domain={['auto', 'auto']} />;
  const common = (
    <>
      <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
      {xAxis}
      {yAxis}
      <Tooltip content={tooltip as never} cursor={false} />
      <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: 11 }} />
      <ReferenceItems data={data} />
    </>
  );

  let chart;
  if (isBar) {
    chart = (
      <BarChart data={rows} margin={margin}>
        {common}
        {data.series.map((s) => (
          <Bar
            key={s.name}
            dataKey={s.name}
            fill={s.color}
            fillOpacity={0.6}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    );
  } else if (data.type === 'area') {
    chart = (
      <AreaChart data={rows} margin={margin}>
        {common}
        {data.series.map((s) => (
          <Area
            key={s.name}
            type="monotone"
            dataKey={s.name}
            stroke={s.color}
            fill={s.color}
            fillOpacity={0.2}
            connectNulls
            isAnimationActive={false}
          />
        ))}
      </AreaChart>
    );
  } else {
    chart = (
      <LineChart data={rows} margin={margin}>
        {common}
        {data.series.map((s) => (
          <Line
            key={s.name}
            type="monotone"
            dataKey={s.name}
            stroke={s.color}
            strokeWidth={1.5}
            dot={false}
            connectNulls
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    );
  }

  return (
    <figure className="not-prose border-border bg-card my-8 rounded-lg border p-4">
      <div className="text-muted-foreground mb-3 font-mono text-xs tracking-wider uppercase">
        {data.title}
      </div>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chart}
        </ResponsiveContainer>
      </div>
      {caption ? (
        <figcaption className="text-muted-foreground mt-3 text-sm">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
