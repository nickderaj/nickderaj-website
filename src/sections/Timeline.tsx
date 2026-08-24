/**
 * The career timeline section - the site's centrepiece (PLAN §1, §2.1). A candlestick chart
 * rendered as an SVG (decorative, `aria-hidden`) alongside the real content: an `<ol>` of role
 * cards. Exactly two responsive layouts (the middle "tablet ribbon" variant was removed - it
 * rendered on top of the text at 768–1023px):
 *
 *  - ≥1024px: two columns, sticky full-height chart pane left (~55%), scrolling cards right.
 *  - <1024px (mobile AND tablet): the chart becomes a full-bleed sticky ticker tape *behind* the
 *    full-width cards. It pans sideways with scroll progress, running off the left edge of the
 *    screen and fading out towards the right so it never competes with the text.
 *
 * Card order differs by layout:
 *
 *  - ≥1024px: CHRONOLOGICAL (Bristol first, Goldman last), so scrolling down tracks the sticky
 *    pane's left-to-right time axis.
 *  - <1024px: REVERSE-CHRONOLOGICAL (Goldman first, Bristol last), the order a CV is read in on a
 *    phone. The tape behind it keeps running left, like a real ticker - it is texture, not a
 *    second reading of the card stack.
 *
 * `career.ts` itself stays most-recent-first for other consumers (CV, `/data`) - this section
 * sorts only at the point of rendering.
 *
 * No props - this section owns its own data (`career.ts`) and scroll-progress wiring.
 */

import CareerChart from '@/components/chart/CareerChart.tsx';
import RoleCard from '@/components/timeline/RoleCard.tsx';
import { career } from '@/content/career.ts';
import { monthIndex, parseYearMonth } from '@/lib/scales.ts';
import { useMediaQuery } from '@/lib/useMediaQuery.ts';
import { useScrollProgress } from '@/lib/useScrollProgress.ts';
import { useEffect, useMemo, useRef, useState } from 'react';

const NAV_KEYS_FORWARD = new Set(['j', 'ArrowDown']);
const NAV_KEYS_BACKWARD = new Set(['k', 'ArrowUp']);
/** Tailwind's `lg` breakpoint - the one place the two timeline layouts diverge. */
const DESKTOP_QUERY = '(min-width: 1024px)';

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

export default function Timeline() {
  // Oldest-first. This is the order the chart's time axis is built from in both layouts; the card
  // stack reverses it below 1024px (see the header comment). `career.ts` itself stays sorted
  // most-recent-first for other consumers (the CV, `/data`, the command palette).
  const chronological = useMemo(
    () =>
      [...career].sort(
        (a, b) => monthIndex(parseYearMonth(a.start)) - monthIndex(parseYearMonth(b.start)),
      ),
    [],
  );
  const { progress, crossingProgress, activeIndex, containerRef, itemRef } = useScrollProgress();

  // Mount only the chart this viewport can show. `hidden`/`lg:hidden` alone still leaves the other
  // one in the tree, and this section re-renders on every scroll frame - so the phone was paying
  // to reconcile a desktop chart it could never see, on top of drawing its own.
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  // The chart's geometry is always built from the chronological list (its x axis is time); only
  // the card stack flips below 1024px.
  const entries = useMemo(
    () => (isDesktop ? chronological : [...chronological].reverse()),
    [chronological, isDesktop],
  );

  const sectionRef = useRef<HTMLElement | null>(null);
  const cardElementsRef = useRef<(HTMLLIElement | null)[]>([]);
  const [sectionInView, setSectionInView] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => {
      setSectionInView(entry?.isIntersecting ?? false);
    });
    observer.observe(section);
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!sectionInView) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (isTypingTarget(event.target)) return;
      const isForward = NAV_KEYS_FORWARD.has(event.key);
      const isBackward = NAV_KEYS_BACKWARD.has(event.key);
      if (!isForward && !isBackward) return;

      event.preventDefault();
      const current = activeIndex < 0 ? 0 : activeIndex;
      const nextIndex = Math.min(entries.length - 1, Math.max(0, current + (isForward ? 1 : -1)));
      cardElementsRef.current[nextIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [sectionInView, activeIndex, entries.length]);

  const activeEntry = activeIndex >= 0 ? entries[activeIndex] : undefined;
  const activeEntryId = activeEntry?.id ?? null;

  // `crossingProgress`, not `progress`: the tape is meant to read as something that has been
  // running all along, so it is already part-way across when the section scrolls into view and
  // keeps running until the section has left the top of the screen - rather than starting dead
  // still at the section's top edge and stopping dead at its bottom.
  const tickerProgress = crossingProgress;

  return (
    <section
      id="experience"
      ref={sectionRef}
      aria-labelledby="timeline-heading"
      className="bg-grid-paper relative"
    >
      <h2 id="timeline-heading" className="sr-only">
        Career timeline
      </h2>

      {/*
       * Below 1024px: the ticker tape, full-bleed and pinned to the viewport, painted behind the
       * cards. `absolute inset-0` bounds it to this section; the inner `sticky` element is what
       * holds it still while the tape pans. Nothing on *this* path may set `overflow-hidden` -
       * that would turn an ancestor into the sticky scrollport and freeze the pan. (The tape's own
       * clipping wrapper is inside `CareerChart`, below the sticky element, which is safe.)
       */}
      {!isDesktop && (
        <div
          data-ticker
          data-print-hide
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          <div className="sticky top-0 h-screen w-full">
            <CareerChart
              entries={chronological}
              orientation="ticker"
              progress={tickerProgress}
              activeEntryId={activeEntryId}
              className="h-full w-full"
            />
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:flex lg:gap-12 lg:px-8"
      >
        {/* Desktop (≥1024px): sticky full-height chart pane, left ~55%. */}
        <div className="hidden lg:sticky lg:top-0 lg:block lg:h-screen lg:w-[55%] lg:shrink-0">
          {isDesktop && (
            <CareerChart
              entries={chronological}
              orientation="horizontal"
              progress={progress}
              activeEntryId={activeEntryId}
              className="h-full w-full"
            />
          )}
        </div>

        <div className="min-w-0 lg:flex-1">
          <ol className="min-w-0 space-y-8">
            {entries.map((entry, index) => (
              <li
                key={entry.id}
                ref={(node) => {
                  cardElementsRef.current[index] = node;
                  itemRef(index)(node);
                }}
              >
                <RoleCard entry={entry} isActive={entry.id === activeEntryId} />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
