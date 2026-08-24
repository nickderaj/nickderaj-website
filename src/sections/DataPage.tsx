/**
 * `/data` (PLAN §1.3 item 6): "nothing here is hand-waved". Prints the actual computed values
 * that drive the career chart - the decorative candle series, marker positions, and regime bands -  * plus the raw project metadata, all derived live from `src/content` through the exact same
 * `src/components/chart/geometry.ts` / `src/lib/candles.ts` / `src/components/chart/regimes.ts`
 * functions the chart itself uses. Deliberately plain and monospace rather than styled: this
 * page's whole point is to look like raw output, not a marketing surface.
 *
 * HONESTY NOTE (see the callout below, rendered on the page): the candle series is generated,
 * seeded decorative texture, not real data. It does not represent earnings, performance, or any
 * measured quantity - the only real signal in it is which months are career-transition months.
 */

import { buildChartGeometry } from '@/components/chart/geometry.ts';
import { buildRegimeBands } from '@/components/chart/regimes.ts';
import { career } from '@/content/career.ts';
import { projects } from '@/content/projects/index.ts';
import { Link } from 'react-router';

function monthIndexToLabel(monthIndexValue: number): string {
  const year = Math.floor(monthIndexValue / 12);
  const month = ((monthIndexValue % 12) + 12) % 12;
  return `${String(year)}-${String(month + 1).padStart(2, '0')}`;
}

export default function DataPage() {
  const geometry = buildChartGeometry(career, 'horizontal', 1000, 720);
  const bands = buildRegimeBands(career);

  return (
    // A plain <div>, not <main> - App.tsx's `/data` route already wraps this in the page's one
    // <main id="main">; a second <main> here was a duplicate/nested landmark (axe:
    // landmark-no-duplicate-main, landmark-main-is-top-level, landmark-unique).
    <div className="text-text mx-auto max-w-4xl px-4 py-16 font-mono text-xs leading-relaxed sm:px-6 sm:text-sm">
      <p className="text-muted">
        <Link to="/" className="hover:text-accent underline underline-offset-2">
          ← nickderaj.com
        </Link>
      </p>
      <h1 className="mt-6 text-base font-semibold tracking-wide uppercase sm:text-lg">
        /data - computed source values
      </h1>
      <p className="text-muted mt-2 max-w-2xl">
        Everything on this page is computed at build/render time
      </p>
      <p className="border-accent/40 text-text mt-4 max-w-2xl border-l-2 pl-3">
        The candle series below is generated, seeded decorative texture, not real data. It does not
        represent earnings, performance, or any measured quantity. The one real signal plotted in it
        is <em>when</em>: every career transition (a new role starting) is marked as an{' '}
        <code>isTransition</code> candle. Source:{' '}
        <a
          href="https://github.com/nickderaj/nickderaj-website"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-accent underline underline-offset-2"
        >
          github.com/nickderaj/nickderaj-website
        </a>
        .
      </p>

      <section className="mt-10">
        <h2 className="text-accent tracking-wide uppercase">
          Decorative candle series ({String(geometry.candles.length)} monthly candles, generated -
          not real data)
        </h2>
        <p className="text-muted mt-1">
          x = month index ({monthIndexToLabel(geometry.xDomain[0])} ..{' '}
          {monthIndexToLabel(geometry.xDomain[1])}). Deterministic seeded PRNG (mulberry32); see{' '}
          <code>src/lib/candles.ts</code>.
        </p>
        <pre
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- see src/components/carousel/Carousel.tsx for the pattern this follows: a horizontally scrollable region needs to be reachable by keyboard (axe: scrollable-region-focusable) even though it isn't an interactive control.
          tabIndex={0}
          role="region"
          aria-label="Decorative candle series JSON"
          className="border-border mt-3 max-h-96 overflow-auto rounded border p-3"
        >
          {JSON.stringify(
            geometry.candles.map((candle) => ({
              date: monthIndexToLabel(candle.month),
              open: Number(candle.open.toFixed(2)),
              high: Number(candle.high.toFixed(2)),
              low: Number(candle.low.toFixed(2)),
              close: Number(candle.close.toFixed(2)),
              isTransition: candle.isTransition,
            })),
            null,
            2,
          )}
        </pre>
      </section>

      <section className="mt-10">
        <h2 className="text-accent tracking-wide uppercase">
          Career-transition anchors ({String(geometry.markers.length)})
        </h2>
        <p className="text-muted mt-1">
          Real: each marker&apos;s date and kind, from <code>career.ts</code>. Decorative: its
          plotted y position (a price from the generated candle series above, used only to place the
          dot).
        </p>
        <pre
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- see comment above.
          tabIndex={0}
          role="region"
          aria-label="Markers JSON"
          className="border-border mt-3 overflow-x-auto rounded border p-3"
        >
          {JSON.stringify(
            geometry.markers.map((marker) => ({
              id: marker.id,
              date: monthIndexToLabel(marker.x),
              scope: marker.scope,
              kind: marker.kind,
            })),
            null,
            2,
          )}
        </pre>
      </section>

      <section className="mt-10">
        <h2 className="text-accent tracking-wide uppercase">
          Regime bands ({String(bands.length)})
        </h2>
        <pre
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- see comment above.
          tabIndex={0}
          role="region"
          aria-label="Regime bands JSON"
          className="border-border mt-3 overflow-x-auto rounded border p-3"
        >
          {JSON.stringify(
            bands.map((band) => ({
              regime: band.regime,
              label: band.label,
              range: band.rangeLabel,
              start: monthIndexToLabel(band.startMonth),
              end: monthIndexToLabel(band.endMonth),
            })),
            null,
            2,
          )}
        </pre>
      </section>

      <section className="mt-10">
        <h2 className="text-accent tracking-wide uppercase">Career entries (raw)</h2>
        <pre
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- see comment above.
          tabIndex={0}
          role="region"
          aria-label="Career entries JSON"
          className="border-border mt-3 overflow-x-auto rounded border p-3"
        >
          {JSON.stringify(career, null, 2)}
        </pre>
      </section>

      <section className="mt-10">
        <h2 className="text-accent tracking-wide uppercase">Project metadata (raw)</h2>
        <pre
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- see comment above.
          tabIndex={0}
          role="region"
          aria-label="Project metadata JSON"
          className="border-border mt-3 overflow-x-auto rounded border p-3"
        >
          {JSON.stringify(
            projects.map((project) => ({
              id: project.id,
              slug: project.slug,
              title: project.title,
              thesis: project.thesis,
              period: project.period,
              tags: project.tags,
              links: project.links,
              spunOutOf: project.spunOutOf,
            })),
            null,
            2,
          )}
        </pre>
      </section>
    </div>
  );
}
