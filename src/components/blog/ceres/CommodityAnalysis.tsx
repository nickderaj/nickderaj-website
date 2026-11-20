// @ts-nocheck -- ported from the Ceres blog; kept as-is rather than rewritten for this repo's stricter tsconfig.
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import {
  Bar,
  BarChart,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SeriesData {
  name: string;
  color: string;
  data: (number | null)[];
}

interface ReferenceLineData {
  y: number;
  label?: string;
  color: string;
  strokeDasharray?: string;
}

interface ChartData {
  title: string;
  type?: 'line' | 'histogram';
  series: SeriesData[];
  bins?: number[];
  referenceLines?: ReferenceLineData[];
  xAxis: { label: string; data?: (number | string)[] };
  yAxis: { label: string; format?: 'currency' | 'number' | 'percent' };
}

interface SignalIndicator {
  id: string;
  name: string;
  signal: 'Buy' | 'Sell' | 'Neutral';
  value: string;
  strength: number;
}

interface CommodityData {
  meta: {
    name: string;
    ticker: string;
    category: string;
    lastPrice: number;
    lastDate: string;
  };
  dates: string[];
  signals: {
    overall: 'Bullish' | 'Bearish' | 'Neutral';
    indicators: SignalIndicator[];
  };
  charts: Record<string, ChartData>;
}

interface CommodityListItem {
  slug: string;
  name: string;
  category: string;
}

interface CommodityList {
  commodities: CommodityListItem[];
}

// ---------------------------------------------------------------------------
// Module-level store (shared between Selector and Charts)
// ---------------------------------------------------------------------------

type Period = '1M' | '3M' | '6M' | '1Y' | '2Y' | '5Y';

interface StoreState {
  commodity: string;
  period: Period;
}

let state: StoreState = { commodity: 'gold', period: '5Y' };
const listeners = new Set<() => void>();

const commodityStore = {
  getSnapshot: () => state,
  subscribe: (cb: () => void) => {
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  },
  setCommodity: (slug: string) => {
    state = { ...state, commodity: slug };
    listeners.forEach((fn) => fn());
  },
  setPeriod: (p: Period) => {
    state = { ...state, period: p };
    listeners.forEach((fn) => fn());
  },
};

const PERIOD_DAYS: Record<Period, number> = {
  '1M': 22,
  '3M': 65,
  '6M': 130,
  '1Y': 252,
  '2Y': 504,
  '5Y': Infinity,
};

const PERIODS: Period[] = ['1M', '3M', '6M', '1Y', '2Y', '5Y'];

// ---------------------------------------------------------------------------
// Lazy glob for commodity data (NOT eager — avoids bundling all files)
// ---------------------------------------------------------------------------

const commodityModules = import.meta.glob<CommodityData>([
  '/src/content/posts/02-commodity-price-analysis/commodity-data/*.json',
  '!/src/content/posts/02-commodity-price-analysis/commodity-data/commodity-list.json',
]);

// Eagerly load the commodity list (small file)
const commodityListModules = import.meta.glob<CommodityList>(
  '/src/content/posts/02-commodity-price-analysis/commodity-data/commodity-list.json',
  { eager: true },
);
const commodityListData: CommodityList = Object.values(commodityListModules)[0] ?? {
  commodities: [],
};

// ---------------------------------------------------------------------------
// Catppuccin Mocha colors
// ---------------------------------------------------------------------------

const COLORS = {
  base: '#1e1e2e',
  text: '#cdd6f4',
  subtext: '#a6adc8',
  surface: '#313244',
};

// ---------------------------------------------------------------------------
// Shared chart helpers
// ---------------------------------------------------------------------------

function formatValue(
  value: number,
  format: 'currency' | 'number' | 'percent' = 'currency',
): string {
  switch (format) {
    case 'currency':
      return `$${value.toFixed(2)}`;
    case 'percent':
      return `${value.toFixed(2)}%`;
    case 'number':
      return value.toFixed(2);
  }
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string | number;
  chartType?: 'line' | 'histogram';
  bins?: number[];
  valueFormat?: 'currency' | 'number' | 'percent';
  xAxisData?: (number | string)[];
}

function CustomTooltip({
  active,
  payload,
  label,
  chartType,
  bins,
  valueFormat,
  xAxisData,
}: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  let xLabel: string;
  if (chartType === 'histogram' && bins) {
    xLabel = `${bins[Number(label)].toFixed(1)}% to ${bins[Number(label) + 1].toFixed(1)}%`;
  } else if (xAxisData && typeof xAxisData[0] === 'string') {
    xLabel = String(label);
  } else {
    xLabel = `Day ${label}`;
  }

  return (
    <div
      style={{
        backgroundColor: COLORS.base,
        border: `1px solid ${COLORS.surface}`,
        borderRadius: '6px',
        padding: '10px 14px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      }}
    >
      <p style={{ color: COLORS.subtext, margin: '0 0 6px 0', fontSize: '12px' }}>{xLabel}</p>
      {payload.map((entry, index) => (
        <p
          key={index}
          style={{
            color: entry.color,
            margin: '2px 0',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          {entry.name}:{' '}
          {chartType === 'histogram' ? entry.value : formatValue(entry.value, valueFormat)}
        </p>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// IndicatorChart — renders a single chart (line or histogram)
// ---------------------------------------------------------------------------

function IndicatorChart({ chart }: { chart: ChartData }) {
  const [crosshairX, setCrosshairX] = useState<number | null>(null);

  const handleMouseMove = useCallback((s: unknown) => {
    const ev = s as { activeTooltipIndex?: number | string | null };
    if (typeof ev?.activeTooltipIndex === 'number') {
      setCrosshairX(ev.activeTooltipIndex);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setCrosshairX(null);
  }, []);

  const isHistogram = chart.type === 'histogram';
  const valueFormat = chart.yAxis.format ?? 'currency';

  const transformedData = useMemo(() => {
    if (isHistogram) {
      return chart.series[0].data.map((_, index) => {
        const point: Record<string, number | null> = { index };
        chart.series.forEach((series) => {
          point[series.name] = series.data[index];
        });
        return point;
      });
    }
    return (
      chart.xAxis.data?.map((x, index) => {
        const point: Record<string, number | string | null> = { day: x };
        chart.series.forEach((series) => {
          point[series.name] = series.data[index];
        });
        return point;
      }) || []
    );
  }, [chart, isHistogram]);

  const xDataKey = isHistogram ? 'index' : 'day';

  return (
    <figure className="my-6 sm:my-8">
      <div
        className="rounded-lg border p-4 sm:p-6"
        style={{ backgroundColor: COLORS.base, borderColor: COLORS.surface }}
      >
        <h3
          className="mb-4 text-center text-sm font-bold sm:text-base"
          style={{ color: COLORS.text }}
        >
          {chart.title}
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          {isHistogram ? (
            <BarChart
              data={transformedData}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              barCategoryGap="0%"
            >
              <XAxis
                dataKey={xDataKey}
                stroke={COLORS.subtext}
                tick={{ fill: COLORS.subtext, fontSize: 10 }}
                tickFormatter={(value) =>
                  chart.bins ? `${chart.bins[value]?.toFixed(0)}%` : value
                }
                interval={4}
                axisLine={{ stroke: COLORS.surface }}
                tickLine={{ stroke: COLORS.surface }}
                label={{
                  value: chart.xAxis.label,
                  position: 'insideBottom',
                  offset: -5,
                  fill: COLORS.subtext,
                  fontSize: 12,
                }}
              />
              <YAxis
                stroke={COLORS.subtext}
                tick={{ fill: COLORS.subtext, fontSize: 10 }}
                axisLine={{ stroke: COLORS.surface }}
                tickLine={{ stroke: COLORS.surface }}
                label={{
                  value: chart.yAxis.label,
                  angle: -90,
                  position: 'insideLeft',
                  fill: COLORS.subtext,
                  fontSize: 12,
                }}
              />
              <Tooltip
                content={<CustomTooltip chartType="histogram" bins={chart.bins} />}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />
              <Legend wrapperStyle={{ color: COLORS.text }} iconType="square" />
              {chart.series.map((series) => (
                <Bar
                  key={series.name}
                  dataKey={series.name}
                  fill={series.color}
                  fillOpacity={0.6}
                  stroke={COLORS.surface}
                  strokeWidth={0.5}
                />
              ))}
            </BarChart>
          ) : (
            <LineChart
              data={transformedData}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <XAxis
                dataKey={xDataKey}
                stroke={COLORS.subtext}
                tick={{ fill: COLORS.subtext, fontSize: 10 }}
                axisLine={{ stroke: COLORS.surface }}
                tickLine={{ stroke: COLORS.surface }}
              />
              <YAxis
                orientation="right"
                stroke={COLORS.subtext}
                tick={{ fill: COLORS.subtext, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => formatValue(value, valueFormat)}
                domain={['auto', 'auto']}
              />
              <Tooltip
                content={
                  <CustomTooltip
                    chartType="line"
                    valueFormat={valueFormat}
                    xAxisData={chart.xAxis.data}
                  />
                }
                cursor={false}
              />
              <Legend wrapperStyle={{ color: COLORS.text }} iconType="line" />
              {crosshairX !== null && (
                <ReferenceLine
                  x={crosshairX}
                  stroke={COLORS.subtext}
                  strokeDasharray="3 3"
                  strokeOpacity={0.7}
                />
              )}
              {chart.referenceLines?.map((refLine, i) => (
                <ReferenceLine
                  key={`ref-${i}`}
                  y={refLine.y}
                  stroke={refLine.color}
                  strokeDasharray={refLine.strokeDasharray ?? '6 3'}
                  strokeOpacity={0.7}
                  label={
                    refLine.label
                      ? {
                          value: refLine.label,
                          fill: refLine.color,
                          fontSize: 10,
                          position: 'right',
                        }
                      : undefined
                  }
                />
              ))}
              {chart.series.map((series) => (
                <Line
                  key={series.name}
                  type="monotone"
                  dataKey={series.name}
                  stroke={series.color}
                  strokeWidth={1.5}
                  dot={false}
                  connectNulls
                  activeDot={{
                    r: 5,
                    fill: series.color,
                    stroke: COLORS.base,
                    strokeWidth: 2,
                  }}
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// SignalDashboard — grid of signal cards
// ---------------------------------------------------------------------------

function SignalBadge({ signal }: { signal: 'Buy' | 'Sell' | 'Neutral' }) {
  const colors: Record<string, { bg: string; text: string }> = {
    Buy: { bg: 'rgba(166, 227, 161, 0.2)', text: '#a6e3a1' },
    Sell: { bg: 'rgba(243, 139, 168, 0.2)', text: '#f38ba8' },
    Neutral: { bg: 'rgba(88, 91, 112, 0.2)', text: '#a6adc8' },
  };
  const c = colors[signal];
  return (
    <span
      className="inline-block rounded px-2 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {signal}
    </span>
  );
}

function OverallBadge({ signal }: { signal: 'Bullish' | 'Bearish' | 'Neutral' }) {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    Bullish: { bg: 'rgba(166, 227, 161, 0.15)', text: '#a6e3a1', border: '#a6e3a1' },
    Bearish: { bg: 'rgba(243, 139, 168, 0.15)', text: '#f38ba8', border: '#f38ba8' },
    Neutral: { bg: 'rgba(88, 91, 112, 0.15)', text: '#a6adc8', border: '#585b70' },
  };
  const c = colors[signal];
  return (
    <span
      className="inline-block rounded-md border px-3 py-1 text-sm font-bold"
      style={{ backgroundColor: c.bg, color: c.text, borderColor: c.border }}
    >
      {signal}
    </span>
  );
}

function SignalDashboard({ signals }: { signals: CommodityData['signals'] }) {
  return (
    <div className="my-6 sm:my-8">
      <div className="mb-4 flex items-center gap-3">
        <h3 className="font-lovato text-lg font-semibold text-[#f5f5f0] sm:text-xl">
          Signal Summary
        </h3>
        <OverallBadge signal={signals.overall} />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {signals.indicators.map((ind) => (
          <div
            key={ind.id}
            className="rounded-lg border p-3 sm:p-4"
            style={{
              backgroundColor:
                ind.signal === 'Buy'
                  ? 'rgba(166, 227, 161, 0.06)'
                  : ind.signal === 'Sell'
                    ? 'rgba(243, 139, 168, 0.06)'
                    : 'rgba(88, 91, 112, 0.06)',
              borderColor: '#313244',
            }}
          >
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-sm font-semibold text-[#f5f5f0]">{ind.name}</span>
              <SignalBadge signal={ind.signal} />
            </div>
            <p className="text-xs leading-relaxed text-[#a6adc8]">{ind.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper to generate heading IDs (matches MarkdownRenderer logic)
// ---------------------------------------------------------------------------

function generateHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// ---------------------------------------------------------------------------
// Chart section descriptions
// ---------------------------------------------------------------------------

const CHART_SECTIONS: {
  id: string;
  heading: string;
  description: string;
}[] = [
  {
    id: 'sma',
    heading: 'Moving Averages',
    description:
      'Simple Moving Averages (SMA) smooth price data to identify trends. The 20-day SMA tracks short-term momentum, the 50-day captures medium-term direction, and the 200-day represents the long-term trend. A golden cross (SMA 20 crossing above SMA 200) is bullish; a death cross (below) is bearish.',
  },
  {
    id: 'macd',
    heading: 'MACD',
    description:
      'The Moving Average Convergence Divergence (MACD) measures momentum using the difference between two exponential moving averages (EMA 12 and EMA 26). When the MACD line crosses above the signal line and the histogram is rising, it signals bullish momentum. The histogram shows the divergence between MACD and its signal line.',
  },
  {
    id: 'rsi',
    heading: 'RSI',
    description:
      "The Relative Strength Index (RSI) is a momentum oscillator ranging from 0 to 100. Readings below 30 indicate oversold conditions (potential buying opportunity), while readings above 70 suggest overbought conditions (potential selling pressure). This implementation uses Wilder's smoothing method (exponential moving average with alpha = 1/14).",
  },
  {
    id: 'bollinger',
    heading: 'Bollinger Bands',
    description:
      'Bollinger Bands consist of a 20-period SMA (middle band) with upper and lower bands at 2 standard deviations. When price approaches the lower band (%B < 0.2), it may be oversold; near the upper band (%B > 0.8), it may be overbought. Band width expansion signals increased volatility.',
  },
  {
    id: 'atr',
    heading: 'Average True Range',
    description:
      'The Average True Range (ATR) measures market volatility using the greatest of: current high minus low, absolute current high minus previous close, or absolute current low minus previous close. Low ATR relative to the average (< 0.5x) suggests a breakout may be imminent; high ATR (> 1.5x) indicates elevated risk.',
  },
  {
    id: 'zscore',
    heading: 'Z-Score',
    description:
      'The Z-Score measures how many standard deviations the current price is from its 20-period rolling mean. A Z-Score below -1.5 suggests the price is significantly below its recent average (potential mean reversion buy), while above 1.5 suggests it is extended above the mean (potential reversion sell).',
  },
  {
    id: 'drawdown',
    heading: 'Drawdown & Returns',
    description:
      'Drawdown measures the decline from a historical peak in cumulative returns. It shows the worst-case loss an investor would have experienced from any high point. Understanding drawdown profiles is essential for risk management and position sizing.',
  },
  {
    id: 'returns-dist',
    heading: 'Returns Distribution',
    description:
      'The daily returns distribution reveals the statistical properties of price movements. Most commodity returns follow a roughly normal distribution but with heavier tails (leptokurtosis), meaning extreme moves occur more frequently than a normal distribution would predict.',
  },
];

// ---------------------------------------------------------------------------
// CommoditySelector — dropdown + period selector
// ---------------------------------------------------------------------------

export function CommoditySelector() {
  const { commodity, period } = useSyncExternalStore(
    commodityStore.subscribe,
    commodityStore.getSnapshot,
  );
  const list = (commodityListData as CommodityList).commodities;

  // Group by category
  const grouped = useMemo(() => {
    const groups: Record<string, CommodityListItem[]> = {};
    list.forEach((c) => {
      if (!groups[c.category]) groups[c.category] = [];
      groups[c.category].push(c);
    });
    return groups;
  }, [list]);

  return (
    <div className="my-6 flex flex-col gap-3 sm:my-8 sm:flex-row">
      <div className="flex-1">
        <label className="mb-1.5 block text-xs font-semibold tracking-wider text-[#a6adc8] uppercase">
          Commodity
        </label>
        <select
          value={commodity}
          onChange={(e) => commodityStore.setCommodity(e.target.value)}
          className="w-full cursor-pointer rounded-lg border px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#89b4fa]/50 focus:outline-none"
          style={{
            backgroundColor: '#1e1e2e',
            borderColor: '#313244',
            color: '#cdd6f4',
          }}
        >
          {Object.entries(grouped).map(([category, items]) => (
            <optgroup key={category} label={category}>
              {items.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      <div className="sm:w-40">
        <label className="mb-1.5 block text-xs font-semibold tracking-wider text-[#a6adc8] uppercase">
          Period
        </label>
        <select
          value={period}
          onChange={(e) => commodityStore.setPeriod(e.target.value as Period)}
          className="w-full cursor-pointer rounded-lg border px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#89b4fa]/50 focus:outline-none"
          style={{
            backgroundColor: '#1e1e2e',
            borderColor: '#313244',
            color: '#cdd6f4',
          }}
        >
          {PERIODS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Slice chart data by period
// ---------------------------------------------------------------------------

function sliceChartByPeriod(chart: ChartData, days: number): ChartData {
  if (days === Infinity) return chart;

  const slicedSeries = chart.series.map((s) => ({
    ...s,
    data: s.data.slice(-days),
  }));

  const slicedXData = chart.xAxis.data?.slice(-days);

  return {
    ...chart,
    series: slicedSeries,
    xAxis: { ...chart.xAxis, data: slicedXData },
  };
}

// ---------------------------------------------------------------------------
// CommodityCharts — main content area
// ---------------------------------------------------------------------------

export function CommodityCharts() {
  const { commodity, period } = useSyncExternalStore(
    commodityStore.subscribe,
    commodityStore.getSnapshot,
  );
  const cacheRef = useRef<Record<string, CommodityData>>({});
  const [data, setData] = useState<CommodityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Check cache first
    if (cacheRef.current[commodity]) {
      setData(cacheRef.current[commodity]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const modulePath = `/src/content/posts/02-commodity-price-analysis/commodity-data/${commodity}.json`;
    const loader = commodityModules[modulePath];

    if (!loader) {
      setError(`No data found for ${commodity}`);
      setLoading(false);
      return;
    }

    loader().then(
      (mod) => {
        if (cancelled) return;
        // Vite glob returns { default: ... } for JSON
        const resolved = (mod as { default?: CommodityData }).default ?? (mod as CommodityData);
        cacheRef.current[commodity] = resolved;
        setData(resolved);
        setLoading(false);
      },
      (err) => {
        if (cancelled) return;
        setError(String(err));
        setLoading(false);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [commodity]);

  const days = PERIOD_DAYS[period];

  // Memoize sliced charts
  const slicedCharts = useMemo(() => {
    if (!data) return null;
    const result: Record<string, ChartData> = {};
    for (const [key, chart] of Object.entries(data.charts)) {
      // Don't slice histograms — they're computed from all data
      if (chart.type === 'histogram') {
        result[key] = chart;
      } else {
        result[key] = sliceChartByPeriod(chart, days);
      }
    }
    return result;
  }, [data, days]);

  if (loading) {
    return (
      <div className="my-8 space-y-6">
        {/* Skeleton loader */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border p-6"
            style={{ backgroundColor: '#1e1e2e', borderColor: '#313244' }}
          >
            <div className="mx-auto mb-4 h-4 w-48 rounded bg-[#313244]" />
            <div className="h-[350px] rounded bg-[#313244]/50" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !data || !slicedCharts) {
    return (
      <div className="my-8 rounded-lg bg-red-900/20 p-4 text-sm text-red-400">
        {error || 'Failed to load commodity data'}
      </div>
    );
  }

  // Find signal for a given chart section
  const getSignalForChart = (chartId: string): SignalIndicator | undefined => {
    return data.signals.indicators.find((ind) => ind.id === chartId);
  };

  return (
    <div className="my-6">
      {/* Meta info */}
      <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#a6adc8]">
        <span>
          <span className="font-semibold text-[#f5f5f0]">{data.meta.name}</span>{' '}
          <span className="text-[#585b70]">({data.meta.ticker})</span>
        </span>
        <span>
          Last:{' '}
          <span className="font-medium text-[#f9e2af]">
            ${data.meta.lastPrice.toLocaleString()}
          </span>
        </span>
        <span>as of {data.meta.lastDate}</span>
      </div>

      {/* Signal dashboard */}
      <SignalDashboard signals={data.signals} />

      {/* Chart sections */}
      {CHART_SECTIONS.map((section) => {
        const chart = slicedCharts[section.id];
        if (!chart) return null;

        const signal = getSignalForChart(section.id);

        return (
          <div key={section.id} className="mb-8 sm:mb-12">
            <h3
              id={generateHeadingId(section.heading)}
              className="font-lovato mt-4 mb-2 scroll-mt-24 text-lg font-semibold text-[#f5f5f0] sm:mt-6 sm:text-xl"
            >
              {section.heading}
            </h3>
            <p className="mb-3 text-sm leading-relaxed text-[#cdd6f4] sm:mb-4 sm:text-base">
              {section.description}
            </p>
            <IndicatorChart chart={chart} />
            {signal && (
              <div
                className="mt-2 flex items-center gap-3 rounded-lg border px-4 py-3"
                style={{
                  backgroundColor:
                    signal.signal === 'Buy'
                      ? 'rgba(166, 227, 161, 0.08)'
                      : signal.signal === 'Sell'
                        ? 'rgba(243, 139, 168, 0.08)'
                        : 'rgba(88, 91, 112, 0.08)',
                  borderColor: '#313244',
                }}
              >
                <SignalBadge signal={signal.signal} />
                <span className="text-sm text-[#cdd6f4]">{signal.value}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
