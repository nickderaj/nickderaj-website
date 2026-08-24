/**
 * The career chart (PLAN §1.1, §2.1; reworked to a candlestick chart - see fix #3 in the owner's
 * review). One `<svg>` in one of two orientations. Purely decorative: `aria-hidden="true"`, the
 * real content lives in the role card `<ol>`.
 *
 *  - `horizontal` (≥1024px): the sticky pane. The whole career fits the drawn width; axes, year
 *    ticks, regime labels and the crosshair date readout all render, and scroll `progress` drives
 *    a progressive reveal.
 *  - `ticker` (<1024px): a full-bleed backdrop behind the role cards, drawn `TICKER_WIDTH` wide -
 *    3.6 phone screens - and slid sideways as the page scrolls down, so the tape runs off the left
 *    edge of the screen and fades out to the right, underneath the text. `progress` alone decides
 *    which slice is on screen; the caller feeds it a value that is already part-way along when the
 *    section appears and only completes once it has left (see `Timeline.tsx`).
 *
 * The ticker is deliberately **static**: no reveal, no crosshair, no rescaling. Everything that
 * used to move against the tape has been removed or baked into the geometry, so the SVG renders
 * once and the pan is a single `transform` on a memoised subtree - a compositor job, not a React
 * one. Driving it the obvious way instead (a `viewBox` that follows scroll state) re-rendered
 * ~470 nodes per frame and stuttered badly on a phone.
 *
 * The y-axis is deliberately unlabelled - no ticks, no title - since the candle series is not a
 * real measurement. The x (time) axis and the regime bands stay, because both are real.
 */

import Candlesticks from '@/components/chart/Candlesticks.tsx';
import Crosshair from '@/components/chart/Crosshair.tsx';
import { buildChartGeometry, type ChartOrientation } from '@/components/chart/geometry.ts';
import Markers from '@/components/chart/Markers.tsx';
import RegimeBands from '@/components/chart/RegimeBands.tsx';
import { ticks, yearTicks } from '@/lib/scales.ts';
import type { CareerEntry } from '@/types/content.ts';
import { useLayoutEffect, useMemo, useRef } from 'react';

const HORIZONTAL_WIDTH = 1000;
const HORIZONTAL_HEIGHT = 720;
const HORIZONTAL_MAX_BODY_WIDTH = 6;
const GRIDLINE_COUNT = 4;

/** Total drawn width of the ticker tape - 3.6 windows, so most of it is always off-screen. */
const TICKER_WIDTH = 3600;
/** The slice of the tape visible at any one moment. */
const TICKER_WINDOW = 1000;
/**
 * Window height. Chosen against `TICKER_WINDOW` to land near a portrait phone's aspect ratio, so
 * `preserveAspectRatio="none"` barely distorts the candles.
 */
const TICKER_HEIGHT = 2000;
/**
 * Not simply `HORIZONTAL_MAX_BODY_WIDTH * unitScale`: the tape's months are further apart than
 * the desktop pane's, so scaling the cap by the same factor would butt the bars up against each
 * other. This keeps roughly a body's width of air between them.
 */
const TICKER_MAX_BODY_WIDTH = 12;
/** Months framed together on the tape - one window's worth, so each screen fills its height. */
const TICKER_FRAMING_HALF_WINDOW = 22;
/** Kept low: this sits behind body copy, and the text has to stay the loudest thing on screen. */
const TICKER_OPACITY = 0.85;
/**
 * How far the tape travels, as a percentage of its own width: a full 100%, so it ends with even
 * its last candle carried off the left edge rather than parking on its final window with a few
 * bars still on screen. A percentage translate resolves against the element's own border box, so
 * the pan needs no measurement of the viewport and survives resize with no JS.
 */
const TICKER_PAN_SPAN_PERCENT = 100;
/**
 * Solid where the tape runs off the left of the screen, gone by the right, where the text is - and
 * softened at the top and bottom so the pinned panel never reads as a cropped rectangle where it
 * enters and leaves the section.
 *
 * Both are CSS masks on nested wrappers, which multiply, rather than one SVG `<mask>` doing both.
 * That is a performance decision, not a style one: an SVG mask forced the whole 3.6-screen-wide
 * tape to be re-rasterised on every scroll frame (measured at ~25ms/frame of pure repaint on a
 * throttled phone profile), while CSS masks stay on the compositor and cost nothing.
 */
const TICKER_FADE_X = 'linear-gradient(to right, #000 0%, #000 52%, transparent 96%)';
const TICKER_FADE_Y =
  'linear-gradient(to bottom, transparent 0%, #000 10%, #000 90%, transparent 100%)';

export type CareerChartProps = {
  entries: readonly CareerEntry[];
  orientation: ChartOrientation;
  /** 0..1: how much of the chart is "drawn" (revealed), and where the crosshair sits. */
  progress: number;
  /** id of the currently active career entry, or null if none. */
  activeEntryId: string | null;
  // Explicitly `| undefined` so the orientation split below can forward it as a plain prop under
  // `exactOptionalPropertyTypes`.
  className?: string | undefined;
};

export default function CareerChart({
  entries,
  orientation,
  progress,
  activeEntryId,
  className,
}: CareerChartProps) {
  return orientation === 'ticker' ? (
    <TickerChart
      entries={entries}
      progress={progress}
      activeEntryId={activeEntryId}
      className={className}
    />
  ) : (
    <HorizontalChart
      entries={entries}
      progress={progress}
      activeEntryId={activeEntryId}
      className={className}
    />
  );
}

function HorizontalChart({
  entries,
  progress,
  activeEntryId,
  className,
}: Omit<CareerChartProps, 'orientation'>) {
  const geometry = useMemo(
    () => buildChartGeometry(entries, 'horizontal', HORIZONTAL_WIDTH, HORIZONTAL_HEIGHT),
    [entries],
  );

  const clampedProgress = Math.min(1, Math.max(0, progress));
  const [domainStart, domainEnd] = geometry.xDomain;
  const playheadMonth = domainStart + clampedProgress * (domainEnd - domainStart);

  const yearTickList = useMemo(() => yearTicks(geometry.xDomain), [geometry.xDomain]);
  const gridlines = useMemo(
    () => ticks(geometry.priceDomain, GRIDLINE_COUNT),
    [geometry.priceDomain],
  );

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${String(HORIZONTAL_WIDTH)} ${String(HORIZONTAL_HEIGHT)}`}
      preserveAspectRatio="none"
      width="100%"
      height="100%"
      className={className}
    >
      <RegimeBands entries={entries} geometry={geometry} />

      <g>
        {/* Faint horizontal gridlines only - no value labels, this axis isn't a real scale. */}
        {gridlines.map((tick) => (
          <line
            key={tick}
            x1={geometry.padding.left}
            x2={HORIZONTAL_WIDTH - geometry.padding.right}
            y1={geometry.valueScale(tick)}
            y2={geometry.valueScale(tick)}
            stroke="var(--color-border)"
            strokeWidth={1}
            opacity={0.4}
          />
        ))}
        <line
          x1={geometry.padding.left}
          x2={HORIZONTAL_WIDTH - geometry.padding.right}
          y1={HORIZONTAL_HEIGHT - geometry.padding.bottom}
          y2={HORIZONTAL_HEIGHT - geometry.padding.bottom}
          stroke="var(--color-border)"
          strokeWidth={1}
        />
        {yearTickList.map((tick) => (
          <text
            key={tick.year}
            x={geometry.timeScale(tick.monthIndex)}
            y={HORIZONTAL_HEIGHT - geometry.padding.bottom + 20}
            fontFamily="var(--font-mono)"
            fontSize={10}
            textAnchor="middle"
            fill="var(--color-muted)"
          >
            {tick.year}
          </text>
        ))}
      </g>

      <Candlesticks
        geometry={geometry}
        playheadMonth={playheadMonth}
        maxBodyWidth={HORIZONTAL_MAX_BODY_WIDTH}
        strokeWidth={geometry.unitScale}
      />
      <Markers geometry={geometry} activeEntryId={activeEntryId} />
      <Crosshair geometry={geometry} progress={clampedProgress} />
    </svg>
  );
}

function TickerChart({
  entries,
  progress,
  activeEntryId,
  className,
}: Omit<CareerChartProps, 'orientation'>) {
  const geometry = useMemo(
    () =>
      buildChartGeometry(entries, 'ticker', TICKER_WIDTH, TICKER_HEIGHT, {
        localFramingHalfWindow: TICKER_FRAMING_HALF_WINDOW,
      }),
    [entries],
  );

  // The tape itself. Nothing here depends on `progress`, so this subtree is built once (and again
  // only when the active entry changes - seven times over the whole section, not once per frame).
  const tape = useMemo(
    () => (
      <>
        <RegimeBands entries={entries} geometry={geometry} />
        <Candlesticks
          geometry={geometry}
          maxBodyWidth={TICKER_MAX_BODY_WIDTH}
          strokeWidth={geometry.unitScale}
        />
        <Markers geometry={geometry} activeEntryId={activeEntryId} />
      </>
    ),
    [entries, geometry, activeEntryId],
  );

  // The pan is written straight to the DOM rather than rendered. React still re-runs this
  // component on every frame (its `progress` prop changes), but `tape` is memoised, so the only
  // work per frame is one style write on one element - which the compositor then handles.
  const tapeRef = useRef<SVGSVGElement | null>(null);
  useLayoutEffect(() => {
    const element = tapeRef.current;
    if (!element) return;
    const clamped = Math.min(1, Math.max(0, progress));
    element.style.transform = `translate3d(${(-clamped * TICKER_PAN_SPAN_PERCENT).toFixed(3)}%, 0, 0)`;
  }, [progress]);

  return (
    <div
      className={`relative overflow-hidden ${className ?? ''}`}
      style={{
        opacity: TICKER_OPACITY,
        maskImage: TICKER_FADE_Y,
        WebkitMaskImage: TICKER_FADE_Y,
      }}
    >
      <div
        className="absolute inset-0"
        style={{ maskImage: TICKER_FADE_X, WebkitMaskImage: TICKER_FADE_X }}
      >
        <svg
          ref={tapeRef}
          aria-hidden="true"
          viewBox={`0 0 ${String(TICKER_WIDTH)} ${String(TICKER_HEIGHT)}`}
          preserveAspectRatio="none"
          height="100%"
          // `max-w-none` is load-bearing: `globals.css` caps every `svg` at `max-width: 100%`,
          // which silently squashed the whole tape into a single screen - the pan then ran a
          // compressed tape and left candles parked on screen at the end of its travel.
          className="absolute inset-y-0 left-0 max-w-none will-change-transform"
          style={{ width: `${String((TICKER_WIDTH / TICKER_WINDOW) * 100)}%` }}
        >
          {tape}
        </svg>
      </div>
    </div>
  );
}
