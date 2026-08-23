/**
 * The career timeline section — the site's centrepiece (PLAN §1, §2.1). A candlestick chart
 * rendered as an SVG (decorative, `aria-hidden`) alongside the real content: an `<ol>` of role
 * cards. Exactly two responsive layouts (the middle "tablet ribbon" variant was removed — it
 * rendered on top of the text at 768–1023px):
 *
 *  - ≥1024px: two columns, sticky full-height chart pane left (~55%), scrolling cards right.
 *  - <1024px (mobile AND tablet): chart becomes a vertical spine in a ~48px left gutter.
 *
 * Cards render in CHRONOLOGICAL order (Bristol first, Goldman last) so scrolling down tracks the
 * chart's left-to-right time axis. `career.ts` itself stays most-recent-first for other consumers
 * (CV, `/data`) — this section sorts only at the point of rendering.
 *
 * No props — this section owns its own data (`career.ts`) and scroll-progress wiring.
 */

import CareerChart from '@/components/chart/CareerChart.tsx';
import RoleCard from '@/components/timeline/RoleCard.tsx';
import { career } from '@/content/career.ts';
import { monthIndex, parseYearMonth } from '@/lib/scales.ts';
import { useScrollProgress } from '@/lib/useScrollProgress.ts';
import { useEffect, useMemo, useRef, useState } from 'react';

const NAV_KEYS_FORWARD = new Set(['j', 'ArrowDown']);
const NAV_KEYS_BACKWARD = new Set(['k', 'ArrowUp']);

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

export default function Timeline() {
  // Render order is chronological (scroll down = forward in time, matching the chart's
  // left-to-right time axis) even though `career.ts` stays sorted most-recent-first for other
  // consumers (the CV, `/data`, the command palette).
  const entries = useMemo(
    () =>
      [...career].sort(
        (a, b) => monthIndex(parseYearMonth(a.start)) - monthIndex(parseYearMonth(b.start)),
      ),
    [],
  );
  const { progress, activeIndex, containerRef, itemRef } = useScrollProgress();

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

      <div
        ref={containerRef}
        className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:flex lg:gap-12 lg:px-8"
      >
        {/* Desktop (≥1024px): sticky full-height chart pane, left ~55%. */}
        <div className="hidden lg:sticky lg:top-0 lg:block lg:h-screen lg:w-[55%] lg:shrink-0">
          <CareerChart
            entries={entries}
            orientation="horizontal"
            progress={progress}
            activeEntryId={activeEntryId}
            className="h-full w-full"
          />
        </div>

        <div className="flex min-w-0 gap-4 lg:flex-1 lg:gap-0">
          {/* Below 1024px (mobile AND tablet): vertical spine in a ~48px left gutter. */}
          <div className="w-12 shrink-0 lg:hidden" aria-hidden="true">
            <CareerChart
              entries={entries}
              orientation="vertical"
              progress={progress}
              activeEntryId={activeEntryId}
              className="h-full w-full"
            />
          </div>

          <ol className="min-w-0 flex-1 space-y-8">
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
