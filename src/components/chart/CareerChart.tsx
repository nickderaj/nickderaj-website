/**
 * The career chart (PLAN §1.1, §2.1; reworked to a candlestick chart - see fix #3 in the owner's
 * review). A single `<svg>` in one of two orientations, both driven by scroll `progress`. Purely
 * decorative: `aria-hidden="true"`, the real content lives in the role card `<ol>`.
 *
 *  - `horizontal` (≥1024px): the sticky pane. The whole career fits the drawn width; axes, year
 *    ticks, regime labels and the crosshair date readout all render.
 *  - `ticker` (<1024px): a full-bleed backdrop behind the role cards. The candle series is drawn
 *    `TICKER_WIDTH` wide - several phone screens - and this component pans a viewBox window
 *    across it from scroll progress, so scrolling the page down runs the tape sideways: history
 *    slides off the left edge of the screen, the playhead sits ~a third in, and the not-yet-
 *    reached future dims and fades out to the right, underneath the text. No labels or axes in
 *    this mode - see `RegimeBands` and `Crosshair`.
 *
 * The y-axis is deliberately unlabelled - no ticks, no title - since the candle series is not a
 * real measurement. The x (time) axis and the regime bands stay, because both are real.
 */

import Candlesticks from '@/components/chart/Candlesticks.tsx';
import Crosshair from '@/components/chart/Crosshair.tsx';
import { buildChartGeometry, type ChartOrientation } from '@/components/chart/geometry.ts';
import Markers from '@/components/chart/Markers.tsx';
import RegimeBands from '@/components/chart/RegimeBands.tsx';
import { candlePriceDomainBetween } from '@/lib/candles.ts';
import { ticks, yearTicks } from '@/lib/scales.ts';
import type { CareerEntry } from '@/types/content.ts';
import { useId, useMemo } from 'react';

const HORIZONTAL_WIDTH = 1000;
const HORIZONTAL_HEIGHT = 720;
const GRIDLINE_COUNT = 4;

/** Total drawn width of the ticker tape - ~3.6 windows, so most of it is always off-screen. */
const TICKER_WIDTH = 3600;
/** The slice of the tape visible at any one moment. */
const TICKER_WINDOW = 1000;
/**
 * Window height. Chosen against `TICKER_WINDOW` to land near a portrait phone's aspect ratio, so
 * `preserveAspectRatio="none"` barely distorts the candles.
 */
const TICKER_HEIGHT = 2000;
/**
 * Where in the window the scroll playhead sits. Well right of centre: the drawn past then fills
 * the left of the screen (and runs off it), while the dimmed, not-yet-reached future occupies the
 * right - which is exactly where the fade takes it out from behind the text.
 */
const TICKER_PLAYHEAD_FRACTION = 0.66;
const HORIZONTAL_MAX_BODY_WIDTH = 6;
/**
 * Not simply `HORIZONTAL_MAX_BODY_WIDTH * unitScale`: the tape's months are further apart than
 * the desktop pane's, so scaling the cap by the same factor would butt the bars up against each
 * other. This keeps roughly a body's width of air between them.
 */
const TICKER_MAX_BODY_WIDTH = 12;
/**
 * How much of the tape is already printed at `progress === 0`. The playhead anchors the pan, so
 * without a head start the top of the section would show a blank screen - the career has no
 * history yet at its own first month. Nudging the playhead forward puts a couple of years of tape
 * on screen from the outset; nothing reads it as "wrong" because the ticker draws no date labels.
 */
const TICKER_LEAD_IN = 0.18;
/** Kept low: this sits behind body copy, and the text has to stay the loudest thing on screen. */
const TICKER_OPACITY = 0.7;

export type CareerChartProps = {
  entries: readonly CareerEntry[];
  orientation: ChartOrientation;
  /** 0..1: how much of the chart is "drawn" (revealed), and where the crosshair sits. */
  progress: number;
  /** id of the currently active career entry, or null if none. */
  activeEntryId: string | null;
  className?: string;
};

export default function CareerChart({
  entries,
  orientation,
  progress,
  activeEntryId,
  className,
}: CareerChartProps) {
  const isTicker = orientation === 'ticker';
  const width = isTicker ? TICKER_WIDTH : HORIZONTAL_WIDTH;
  const height = isTicker ? TICKER_HEIGHT : HORIZONTAL_HEIGHT;

  const baseGeometry = useMemo(
    () => buildChartGeometry(entries, orientation, width, height),
    [entries, orientation, width, height],
  );

  const clampedProgress = Math.min(1, Math.max(0, progress));
  const revealProgress = isTicker
    ? TICKER_LEAD_IN + clampedProgress * (1 - TICKER_LEAD_IN)
    : clampedProgress;
  const [domainStart, domainEnd] = baseGeometry.xDomain;
  const playheadMonth = domainStart + revealProgress * (domainEnd - domainStart);

  // The ticker rescales its y axis to whatever months are on screen. Without it the full 13-year
  // range is crushed into one phone screen and every window reads as a near-flat line.
  const visibleMonths =
    ((domainEnd - domainStart) * TICKER_WINDOW) /
    (TICKER_WIDTH - baseGeometry.padding.left - baseGeometry.padding.right);
  const windowStartMonth = playheadMonth - TICKER_PLAYHEAD_FRACTION * visibleMonths;
  const tickerPriceDomain = useMemo(
    () =>
      candlePriceDomainBetween(
        baseGeometry.candles,
        windowStartMonth,
        windowStartMonth + visibleMonths,
      ),
    [baseGeometry.candles, windowStartMonth, visibleMonths],
  );

  const geometry = useMemo(
    () =>
      isTicker
        ? buildChartGeometry(entries, orientation, width, height, {
            priceDomain: tickerPriceDomain,
          })
        : baseGeometry,
    [isTicker, baseGeometry, entries, orientation, width, height, tickerPriceDomain],
  );

  const yearTickList = useMemo(() => yearTicks(geometry.xDomain), [geometry.xDomain]);
  const gridlines = useMemo(
    () => (isTicker ? [] : ticks(geometry.priceDomain, GRIDLINE_COUNT)),
    [isTicker, geometry.priceDomain],
  );

  // Ids are per-instance: the desktop pane and the mobile ticker are both in the DOM at once
  // (one is hidden by a media query), so hardcoded gradient/mask ids would collide.
  const maskPrefix = useId();

  const chart = (
    <>
      <RegimeBands entries={entries} geometry={geometry} />

      {!isTicker && (
        <g>
          {/* Faint horizontal gridlines only - no value labels, this axis isn't a real scale. */}
          {gridlines.map((tick) => (
            <line
              key={tick}
              x1={geometry.padding.left}
              x2={width - geometry.padding.right}
              y1={geometry.valueScale(tick)}
              y2={geometry.valueScale(tick)}
              stroke="var(--color-border)"
              strokeWidth={1}
              opacity={0.4}
            />
          ))}
          <line
            x1={geometry.padding.left}
            x2={width - geometry.padding.right}
            y1={height - geometry.padding.bottom}
            y2={height - geometry.padding.bottom}
            stroke="var(--color-border)"
            strokeWidth={1}
          />
          {yearTickList.map((tick) => (
            <text
              key={tick.year}
              x={geometry.timeScale(tick.monthIndex)}
              y={height - geometry.padding.bottom + 20}
              fontFamily="var(--font-mono)"
              fontSize={10}
              textAnchor="middle"
              fill="var(--color-muted)"
            >
              {tick.year}
            </text>
          ))}
        </g>
      )}

      <Candlesticks
        geometry={geometry}
        playheadMonth={playheadMonth}
        maxBodyWidth={isTicker ? TICKER_MAX_BODY_WIDTH : HORIZONTAL_MAX_BODY_WIDTH}
        strokeWidth={geometry.unitScale}
      />

      <Markers geometry={geometry} activeEntryId={activeEntryId} />
      <Crosshair geometry={geometry} progress={revealProgress} />
    </>
  );

  if (!isTicker) {
    return (
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${String(width)} ${String(height)}`}
        preserveAspectRatio="none"
        width="100%"
        height="100%"
        className={className}
      >
        {chart}
      </svg>
    );
  }

  // Pan the window so the playhead holds a fixed spot on screen and the tape slides under it. The
  // pan is deliberately unclamped: at either end of the scroll the tape simply runs past the
  // screen edge, which is what a real tape does.
  const panX =
    Math.round(
      (geometry.timeScale(playheadMonth) - TICKER_PLAYHEAD_FRACTION * TICKER_WINDOW) * 100,
    ) / 100;
  const fadeXId = `${maskPrefix}-fade-x`;
  const fadeYId = `${maskPrefix}-fade-y`;
  const maskXId = `${maskPrefix}-mask-x`;
  const maskYId = `${maskPrefix}-mask-y`;

  return (
    <svg
      aria-hidden="true"
      viewBox={`${String(panX)} 0 ${String(TICKER_WINDOW)} ${String(TICKER_HEIGHT)}`}
      preserveAspectRatio="none"
      width="100%"
      height="100%"
      className={className}
    >
      <defs>
        {/* Solid at the left edge (where the tape runs off-screen), gone by the right, so the
            chart never fights the role-card text it sits behind. */}
        <linearGradient
          id={fadeXId}
          gradientUnits="userSpaceOnUse"
          x1={panX}
          y1={0}
          x2={panX + TICKER_WINDOW}
          y2={0}
        >
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        {/* Softens the top and bottom edges of the sticky panel where it enters/leaves the
            section, so the backdrop never reads as a cropped rectangle. */}
        <linearGradient
          id={fadeYId}
          gradientUnits="userSpaceOnUse"
          x1={0}
          y1={0}
          x2={0}
          y2={TICKER_HEIGHT}
        >
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.12" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.88" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask
          id={maskXId}
          maskUnits="userSpaceOnUse"
          x={panX}
          y={0}
          width={TICKER_WINDOW}
          height={TICKER_HEIGHT}
        >
          <rect
            x={panX}
            y={0}
            width={TICKER_WINDOW}
            height={TICKER_HEIGHT}
            fill={`url(#${fadeXId})`}
          />
        </mask>
        <mask
          id={maskYId}
          maskUnits="userSpaceOnUse"
          x={panX}
          y={0}
          width={TICKER_WINDOW}
          height={TICKER_HEIGHT}
        >
          <rect
            x={panX}
            y={0}
            width={TICKER_WINDOW}
            height={TICKER_HEIGHT}
            fill={`url(#${fadeYId})`}
          />
        </mask>
      </defs>

      {/* Nested masks multiply, giving the horizontal and vertical fades in one pass. */}
      <g mask={`url(#${maskXId})`} opacity={TICKER_OPACITY}>
        <g mask={`url(#${maskYId})`}>{chart}</g>
      </g>
    </svg>
  );
}
