// @ts-nocheck -- ported from the Ceres blog; kept as-is rather than rewritten for this repo's stricter tsconfig.
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import {
  ComposedChart,
  Line,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PatternInfo {
  name: string;
  type: string;
  confidence: number;
  supportLevel: number | null;
  resistanceLevel: number | null;
  startDate: string | null;
  endDate: string | null;
}

interface SamplePrediction {
  direction: string;
  confidence: number;
  patterns: PatternInfo[];
  bullishScore: number;
  bearishScore: number;
}

interface SampleOutcome {
  actualDirection: string;
  priceAtMid: number;
  priceAtEnd: number;
  priceChangePct: number;
  priceChangeAbs: number;
  correct: boolean;
}

interface PeakTrough {
  index: number;
  price: number;
}

interface TrendlinePoint {
  index: number;
  price: number;
}

interface Trendline {
  role: string;
  points: TrendlinePoint[];
}

interface SampleChart {
  analysisDates: string[];
  testDates: string[];
  analysisPrices: number[];
  testPrices: number[];
  peaks: PeakTrough[];
  troughs: PeakTrough[];
  supportLines: number[];
  resistanceLines: number[];
  trendlines?: Trendline[];
}

interface SampleMeta {
  id: string;
  commodity: string;
  ticker: string;
  analysisStart: string;
  analysisMid: string;
  analysisEnd: string;
  windowLabel: string;
}

interface SampleData {
  meta: SampleMeta;
  prediction: SamplePrediction;
  outcome: SampleOutcome;
  chart: SampleChart;
}

interface PatternListItem {
  id: string;
  commodity: string;
  dateLabel: string;
  windowLabel: string;
}

interface PatternList {
  samples: PatternListItem[];
}

// ---------------------------------------------------------------------------
// Module-level store (shared between Selector & Display & ResultsTable)
// ---------------------------------------------------------------------------

interface StoreState {
  sampleId: string;
}

let state: StoreState = { sampleId: 'gold-2024-q1' };
const listeners = new Set<() => void>();

const patternStore = {
  getSnapshot: () => state,
  subscribe: (cb: () => void) => {
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  },
  setSample: (id: string) => {
    state = { ...state, sampleId: id };
    listeners.forEach((fn) => fn());
  },
};

// ---------------------------------------------------------------------------
// Lazy glob for individual sample files
// ---------------------------------------------------------------------------

const sampleModules = import.meta.glob<SampleData>([
  '/src/content/posts/04-pattern-recognition/pattern-data/*.json',
  '!/src/content/posts/04-pattern-recognition/pattern-data/pattern-list.json',
]);

// Eagerly load the small index file
const listModules = import.meta.glob<PatternList>(
  '/src/content/posts/04-pattern-recognition/pattern-data/pattern-list.json',
  { eager: true },
);
const patternListData: PatternList = Object.values(listModules)[0] ?? { samples: [] };

// ---------------------------------------------------------------------------
// Catppuccin Mocha colors
// ---------------------------------------------------------------------------

const COLORS = {
  base: '#1e1e2e',
  text: '#cdd6f4',
  subtext: '#a6adc8',
  surface: '#313244',
  blue: '#89b4fa',
  green: '#a6e3a1',
  red: '#f38ba8',
  yellow: '#f9e2af',
  muted: '#585b70',
  mauve: '#cba6f7',
  peach: '#fab387',
  teal: '#94e2d5',
};

const TRENDLINE_COLORS: Record<string, string> = {
  support: COLORS.teal,
  resistance: COLORS.peach,
  neckline: COLORS.yellow,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number): string {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function formatDateDay(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ---------------------------------------------------------------------------
// Custom Tooltip
// ---------------------------------------------------------------------------

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number | null; color: string }>;
  label?: string;
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const entries = payload.filter((e) => e.value != null);
  if (entries.length === 0) return null;

  const period = entries[0].name === 'Analysis' ? 'Analysis Period' : 'Test Period';

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
      <p style={{ color: COLORS.subtext, margin: '0 0 6px 0', fontSize: '12px' }}>
        {label} — {period}
      </p>
      {entries.map((entry, i) => (
        <p
          key={i}
          style={{
            color: entry.color,
            margin: '2px 0',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          {entry.name}: {formatCurrency(entry.value as number)}
        </p>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Direction badge
// ---------------------------------------------------------------------------

function DirectionBadge({ direction, size = 'md' }: { direction: string; size?: 'sm' | 'md' }) {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    BULLISH: { bg: 'rgba(166, 227, 161, 0.15)', text: COLORS.green, border: COLORS.green },
    BEARISH: { bg: 'rgba(243, 139, 168, 0.15)', text: COLORS.red, border: COLORS.red },
    NEUTRAL: { bg: 'rgba(88, 91, 112, 0.15)', text: COLORS.subtext, border: COLORS.muted },
  };
  const c = colors[direction] ?? colors.NEUTRAL;
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  return (
    <span
      className={`inline-block rounded-md border font-bold ${sizeClass}`}
      style={{ backgroundColor: c.bg, color: c.text, borderColor: c.border }}
    >
      {direction}
    </span>
  );
}

function CorrectBadge({ correct }: { correct: boolean }) {
  if (correct) {
    return (
      <span
        className="inline-block rounded px-2 py-0.5 text-xs font-semibold"
        style={{ backgroundColor: 'rgba(166, 227, 161, 0.2)', color: COLORS.green }}
      >
        ✓ Correct
      </span>
    );
  }
  return (
    <span
      className="inline-block rounded px-2 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: 'rgba(243, 139, 168, 0.2)', color: COLORS.red }}
    >
      ✗ Incorrect
    </span>
  );
}

// ---------------------------------------------------------------------------
// PatternSelector
// ---------------------------------------------------------------------------

export function PatternSelector() {
  const { sampleId } = useSyncExternalStore(patternStore.subscribe, patternStore.getSnapshot);
  const list = patternListData.samples;

  // Group by commodity
  const commodities = useMemo(() => {
    const set = new Set<string>();
    list.forEach((s) => set.add(s.commodity));
    return Array.from(set);
  }, [list]);

  // Find currently selected commodity
  const selected = list.find((s) => s.id === sampleId);
  const currentCommodity = selected?.commodity ?? commodities[0] ?? '';

  // Samples for current commodity
  const samplesForCommodity = useMemo(
    () => list.filter((s) => s.commodity === currentCommodity),
    [list, currentCommodity],
  );

  const handleCommodityChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const commodity = e.target.value;
      const first = list.find((s) => s.commodity === commodity);
      if (first) patternStore.setSample(first.id);
    },
    [list],
  );

  const handleSampleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    patternStore.setSample(e.target.value);
  }, []);

  const selectStyle = {
    backgroundColor: '#1e1e2e',
    borderColor: '#313244',
    color: '#cdd6f4',
  };

  return (
    <div className="my-6 flex flex-col gap-3 sm:my-8 sm:flex-row">
      <div className="flex-1">
        <label className="mb-1.5 block text-xs font-semibold tracking-wider text-[#a6adc8] uppercase">
          Commodity
        </label>
        <select
          value={currentCommodity}
          onChange={handleCommodityChange}
          className="w-full cursor-pointer rounded-lg border px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#89b4fa]/50 focus:outline-none"
          style={selectStyle}
        >
          {commodities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1">
        <label className="mb-1.5 block text-xs font-semibold tracking-wider text-[#a6adc8] uppercase">
          Date Range
        </label>
        <select
          value={sampleId}
          onChange={handleSampleChange}
          className="w-full cursor-pointer rounded-lg border px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#89b4fa]/50 focus:outline-none"
          style={selectStyle}
        >
          {samplesForCommodity.map((s) => (
            <option key={s.id} value={s.id}>
              {s.dateLabel}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PatternChart
// ---------------------------------------------------------------------------

function PatternChart({ data }: { data: SampleData }) {
  const { chart, meta } = data;

  // Build unified data points: analysis period + test period + trendlines
  const trendlines = useMemo(() => chart.trendlines ?? [], [chart.trendlines]);

  const chartData = useMemo(() => {
    const points: Array<Record<string, number | string | null>> = [];

    // Analysis period
    chart.analysisDates.forEach((date, i) => {
      points.push({ date, Analysis: chart.analysisPrices[i], Test: null });
    });

    // Overlap: last analysis point is also first test point for continuity
    if (chart.testDates.length > 0 && chart.analysisDates.length > 0) {
      const lastAnalysisPrice = chart.analysisPrices[chart.analysisPrices.length - 1];
      points[points.length - 1].Test = lastAnalysisPrice;
    }

    // Test period
    chart.testDates.forEach((date, i) => {
      points.push({ date, Analysis: null, Test: chart.testPrices[i] });
    });

    // Add trendline sparse series (values only at the line's key points)
    trendlines.forEach((tl, tlIdx) => {
      const key = `tl_${tlIdx}`;
      points.forEach((p) => {
        p[key] = null;
      });
      tl.points.forEach((pt) => {
        if (pt.index >= 0 && pt.index < points.length) {
          points[pt.index][key] = pt.price;
        }
      });
    });

    return points;
  }, [chart, trendlines]);

  // Mid-date for vertical reference line
  const midDate = meta.analysisMid;

  // Y-axis domain
  const allPrices = [...chart.analysisPrices, ...chart.testPrices];
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const padding = (maxPrice - minPrice) * 0.05;
  const yDomain: [number, number] = [Math.floor(minPrice - padding), Math.ceil(maxPrice + padding)];

  // Tick spacing for x-axis (show ~6-8 date labels)
  const tickInterval = Math.max(1, Math.floor(chartData.length / 7));

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
          {meta.commodity} — Pattern Analysis ({meta.windowLabel})
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={chartData}>
            <XAxis
              dataKey="date"
              stroke={COLORS.subtext}
              tick={{ fill: COLORS.subtext, fontSize: 10 }}
              axisLine={{ stroke: COLORS.surface }}
              tickLine={{ stroke: COLORS.surface }}
              interval={tickInterval}
              tickFormatter={(d: string) => {
                const dt = new Date(d + 'T00:00:00');
                return dt.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
              }}
            />
            <YAxis
              orientation="right"
              stroke={COLORS.subtext}
              tick={{ fill: COLORS.subtext, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              domain={yDomain}
              tickFormatter={(v: number) => formatCurrency(v)}
            />
            <Tooltip content={<ChartTooltip />} />

            {/* Vertical divider at mid-date */}
            <ReferenceLine
              x={midDate}
              stroke={COLORS.muted}
              strokeDasharray="6 3"
              label={{
                value: 'Test →',
                fill: COLORS.subtext,
                fontSize: 10,
                position: 'insideTopRight',
              }}
            />

            {/* Support lines */}
            {chart.supportLines.slice(0, 3).map((level, i) => (
              <ReferenceLine
                key={`support-${i}`}
                y={level}
                stroke={COLORS.green}
                strokeDasharray="4 4"
                strokeOpacity={0.5}
              />
            ))}

            {/* Resistance lines */}
            {chart.resistanceLines.slice(0, 3).map((level, i) => (
              <ReferenceLine
                key={`resistance-${i}`}
                y={level}
                stroke={COLORS.red}
                strokeDasharray="4 4"
                strokeOpacity={0.5}
              />
            ))}

            {/* Analysis period line */}
            <Line
              type="monotone"
              dataKey="Analysis"
              stroke={COLORS.blue}
              strokeWidth={2}
              dot={false}
              connectNulls={false}
              activeDot={{ r: 4, fill: COLORS.blue, stroke: COLORS.base, strokeWidth: 2 }}
            />

            {/* Test period line */}
            <Line
              type="monotone"
              dataKey="Test"
              stroke={COLORS.muted}
              strokeWidth={1.5}
              strokeDasharray="4 2"
              dot={false}
              connectNulls={false}
              activeDot={{ r: 4, fill: COLORS.muted, stroke: COLORS.base, strokeWidth: 2 }}
            />

            {/* Pattern trendlines */}
            {trendlines.map((tl, i) => (
              <Line
                key={`tl-${i}`}
                type="linear"
                dataKey={`tl_${i}`}
                stroke={TRENDLINE_COLORS[tl.role] ?? COLORS.mauve}
                strokeWidth={1.5}
                strokeOpacity={0.85}
                dot={false}
                connectNulls
                activeDot={false}
                legendType="none"
                isAnimationActive={false}
              />
            ))}

            {/* Peak markers */}
            {chart.peaks.map((peak, i) => {
              const date = chart.analysisDates[peak.index];
              if (!date) return null;
              return (
                <ReferenceDot
                  key={`peak-${i}`}
                  x={date}
                  y={peak.price}
                  r={4}
                  fill={COLORS.red}
                  stroke={COLORS.base}
                  strokeWidth={1}
                />
              );
            })}

            {/* Trough markers */}
            {chart.troughs.map((trough, i) => {
              const date = chart.analysisDates[trough.index];
              if (!date) return null;
              return (
                <ReferenceDot
                  key={`trough-${i}`}
                  x={date}
                  y={trough.price}
                  r={4}
                  fill={COLORS.green}
                  stroke={COLORS.base}
                  strokeWidth={1}
                />
              );
            })}
          </ComposedChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div
          className="mt-3 flex flex-wrap justify-center gap-4 text-xs"
          style={{ color: COLORS.subtext }}
        >
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4" style={{ backgroundColor: COLORS.blue }} />
            Analysis Period
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-0.5 w-4"
              style={{ backgroundColor: COLORS.muted, borderTop: `1px dashed ${COLORS.muted}` }}
            />
            Test Period
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: COLORS.red }}
            />
            Peaks
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: COLORS.green }}
            />
            Troughs
          </span>
          {trendlines.length > 0 && (
            <>
              {trendlines.some((t) => t.role === 'support') && (
                <span className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-0.5 w-4"
                    style={{ backgroundColor: COLORS.teal }}
                  />
                  Support Trend
                </span>
              )}
              {trendlines.some((t) => t.role === 'resistance') && (
                <span className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-0.5 w-4"
                    style={{ backgroundColor: COLORS.peach }}
                  />
                  Resistance Trend
                </span>
              )}
              {trendlines.some((t) => t.role === 'neckline') && (
                <span className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-0.5 w-4"
                    style={{ backgroundColor: COLORS.yellow }}
                  />
                  Neckline
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// PredictionCard
// ---------------------------------------------------------------------------

function PredictionCard({ data }: { data: SampleData }) {
  const { prediction, outcome, meta } = data;

  const priceChangeColor = outcome.priceChangePct >= 0 ? COLORS.green : COLORS.red;

  return (
    <div
      className="my-4 rounded-lg border p-4 sm:p-6"
      style={{ backgroundColor: COLORS.base, borderColor: COLORS.surface }}
    >
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Prediction */}
        <div>
          <h4
            className="mb-2 text-xs font-semibold tracking-wider uppercase"
            style={{ color: COLORS.subtext }}
          >
            Prediction
          </h4>
          <div className="mb-2 flex items-center gap-3">
            <DirectionBadge direction={prediction.direction} />
            <span className="text-sm" style={{ color: COLORS.text }}>
              {(prediction.confidence * 100).toFixed(0)}% confidence
            </span>
          </div>
          {prediction.patterns.length > 0 && (
            <div className="mt-2 space-y-1">
              {prediction.patterns.map((p, i) => (
                <div key={i} className="text-xs" style={{ color: COLORS.subtext }}>
                  <span
                    style={{
                      color: p.type === 'bullish' ? COLORS.green : COLORS.red,
                    }}
                  >
                    {p.name}
                  </span>{' '}
                  — {(p.confidence * 100).toFixed(0)}%
                  {p.startDate && p.endDate && (
                    <span style={{ color: COLORS.muted }}>
                      , {formatDateDay(p.startDate)} – {formatDateDay(p.endDate)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          {prediction.patterns.length === 0 && (
            <p className="text-xs" style={{ color: COLORS.muted }}>
              No patterns detected
            </p>
          )}
        </div>

        {/* Outcome */}
        <div className="sm:text-right">
          <h4
            className="mb-2 text-xs font-semibold tracking-wider uppercase"
            style={{ color: COLORS.subtext }}
          >
            Outcome ({formatDateShort(meta.analysisMid)} → {formatDateShort(meta.analysisEnd)})
          </h4>
          <div className="mb-2 flex items-center gap-3 sm:justify-end">
            <DirectionBadge direction={outcome.actualDirection} />
            <CorrectBadge correct={outcome.correct} />
          </div>
          <div className="space-y-0.5 text-sm" style={{ color: COLORS.text }}>
            <p>
              {formatCurrency(outcome.priceAtMid)} → {formatCurrency(outcome.priceAtEnd)}
            </p>
            <p style={{ color: priceChangeColor }}>
              {outcome.priceChangeAbs >= 0 ? '+' : ''}
              {formatCurrency(outcome.priceChangeAbs)} ({outcome.priceChangePct >= 0 ? '+' : ''}
              {outcome.priceChangePct.toFixed(2)}%)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PatternDisplay
// ---------------------------------------------------------------------------

export function PatternDisplay() {
  const { sampleId } = useSyncExternalStore(patternStore.subscribe, patternStore.getSnapshot);
  const cacheRef = useRef<Record<string, SampleData>>({});
  const [data, setData] = useState<SampleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (cacheRef.current[sampleId]) {
      setData(cacheRef.current[sampleId]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const modulePath = `/src/content/posts/04-pattern-recognition/pattern-data/${sampleId}.json`;
    const loader = sampleModules[modulePath];

    if (!loader) {
      setError(`No data found for ${sampleId}`);
      setLoading(false);
      return;
    }

    loader().then(
      (mod) => {
        if (cancelled) return;
        const resolved = (mod as { default?: SampleData }).default ?? (mod as SampleData);
        cacheRef.current[sampleId] = resolved;
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
  }, [sampleId]);

  if (loading) {
    return (
      <div className="my-8 space-y-6">
        <div
          className="animate-pulse rounded-lg border p-6"
          style={{ backgroundColor: '#1e1e2e', borderColor: '#313244' }}
        >
          <div className="mx-auto mb-4 h-4 w-48 rounded bg-[#313244]" />
          <div className="h-[400px] rounded bg-[#313244]/50" />
        </div>
        <div
          className="animate-pulse rounded-lg border p-6"
          style={{ backgroundColor: '#1e1e2e', borderColor: '#313244' }}
        >
          <div className="mb-3 h-4 w-32 rounded bg-[#313244]" />
          <div className="h-20 rounded bg-[#313244]/50" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="my-8 rounded-lg bg-red-900/20 p-4 text-sm text-red-400">
        {error || 'Failed to load pattern data'}
      </div>
    );
  }

  return (
    <div className="my-6">
      <PatternChart data={data} />
      <PredictionCard data={data} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// PatternResultsTable
// ---------------------------------------------------------------------------

export function PatternResultsTable() {
  const list = patternListData.samples;

  const cacheRef = useRef<Record<string, SampleData>>({});
  const [allData, setAllData] = useState<Record<string, SampleData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadAll = async () => {
      const results: Record<string, SampleData> = { ...cacheRef.current };
      const toLoad = list.filter((s) => !results[s.id]);

      await Promise.all(
        toLoad.map(async (item) => {
          const modulePath = `/src/content/posts/04-pattern-recognition/pattern-data/${item.id}.json`;
          const loader = sampleModules[modulePath];
          if (!loader) return;
          try {
            const mod = await loader();
            const resolved = (mod as { default?: SampleData }).default ?? (mod as SampleData);
            results[item.id] = resolved;
          } catch {
            // Skip failed loads
          }
        }),
      );

      if (!cancelled) {
        cacheRef.current = results;
        setAllData(results);
        setLoading(false);
      }
    };

    loadAll();

    return () => {
      cancelled = true;
    };
  }, [list]);

  const handleCardClick = useCallback((id: string) => {
    patternStore.setSample(id);
    // Scroll to the top of the pattern display
    const el = document.querySelector('[data-pattern-display]');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Aggregate stats
  const stats = useMemo(() => {
    const loaded = Object.values(allData);
    const correct = loaded.filter((d) => d.outcome.correct).length;
    const total = loaded.length;
    const avgConfidence =
      total > 0 ? loaded.reduce((sum, d) => sum + d.prediction.confidence, 0) / total : 0;
    return { correct, total, avgConfidence };
  }, [allData]);

  if (loading) {
    return (
      <div className="my-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border p-4"
              style={{ backgroundColor: '#1e1e2e', borderColor: '#313244' }}
            >
              <div className="mb-3 h-4 w-24 rounded bg-[#313244]" />
              <div className="h-12 rounded bg-[#313244]/50" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="my-6 sm:my-8" data-pattern-display>
      {/* Aggregate stats */}
      <div
        className="mb-4 rounded-lg border p-4 sm:p-5"
        style={{ backgroundColor: COLORS.base, borderColor: COLORS.surface }}
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <span style={{ color: COLORS.text }}>
            <span className="font-semibold">Accuracy:</span>{' '}
            <span
              style={{
                color: stats.correct / Math.max(1, stats.total) >= 0.5 ? COLORS.green : COLORS.red,
              }}
            >
              {stats.correct}/{stats.total} (
              {((stats.correct / Math.max(1, stats.total)) * 100).toFixed(0)}%)
            </span>
          </span>
          <span style={{ color: COLORS.text }}>
            <span className="font-semibold">Avg Confidence:</span>{' '}
            <span style={{ color: COLORS.yellow }}>{(stats.avgConfidence * 100).toFixed(0)}%</span>
          </span>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {list.map((item) => {
          const sample = allData[item.id];
          if (!sample) return null;

          const priceColor = sample.outcome.priceChangePct >= 0 ? COLORS.green : COLORS.red;

          return (
            <button
              key={item.id}
              onClick={() => handleCardClick(item.id)}
              className="cursor-pointer rounded-lg border p-3 text-left transition-colors hover:border-[#89b4fa]/50 sm:p-4"
              style={{
                backgroundColor: COLORS.base,
                borderColor: COLORS.surface,
              }}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold" style={{ color: COLORS.text }}>
                  {item.commodity}
                </span>
                <CorrectBadge correct={sample.outcome.correct} />
              </div>
              <p className="mb-2 text-xs" style={{ color: COLORS.subtext }}>
                {item.dateLabel}
              </p>
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <DirectionBadge direction={sample.prediction.direction} size="sm" />
                <span className="text-xs" style={{ color: COLORS.subtext }}>
                  →
                </span>
                <DirectionBadge direction={sample.outcome.actualDirection} size="sm" />
              </div>
              {sample.prediction.patterns.length > 0 && (
                <div className="mt-1 space-y-0.5 text-xs" style={{ color: COLORS.muted }}>
                  {sample.prediction.patterns.map((p, i) => (
                    <p key={i}>
                      {p.name}
                      {p.startDate && p.endDate && (
                        <span>
                          {' '}
                          ({formatDateDay(p.startDate)} – {formatDateDay(p.endDate)})
                        </span>
                      )}
                    </p>
                  ))}
                </div>
              )}
              <p className="mt-1 text-xs" style={{ color: priceColor }}>
                {sample.outcome.priceChangePct >= 0 ? '+' : ''}
                {sample.outcome.priceChangePct.toFixed(2)}%
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
