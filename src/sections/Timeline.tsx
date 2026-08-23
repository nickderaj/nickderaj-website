/**
 * The career timeline section — the site's centrepiece (PLAN §1, §2.1). A single continuous
 * cumulative-experience curve rendered as an SVG (decorative, `aria-hidden`) alongside the real
 * content: an `<ol>` of role cards. Responsive per PLAN §2.1:
 *
 *  - ≥1024px: two columns, sticky full-height chart pane left (~55%), scrolling cards right.
 *  - 768–1023px: chart collapses to a slim horizontal progress ribbon under the header.
 *  - <768px: chart becomes a vertical curve in a ~48px left gutter, transposed axes.
 *
 * No props — this section owns its own data (`career.ts`) and scroll-progress wiring.
 */

import CareerChart from '@/components/chart/CareerChart.tsx';
import RoleCard from '@/components/timeline/RoleCard.tsx';
import { career } from '@/content/career.ts';
import { useScrollProgress } from '@/lib/useScrollProgress.ts';
import { useEffect, useRef, useState } from 'react';

const NAV_KEYS_FORWARD = new Set(['j', 'ArrowDown']);
const NAV_KEYS_BACKWARD = new Set(['k', 'ArrowUp']);

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

export default function Timeline() {
  const entries = career;
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

      {/* Tablet (768–1023px): horizontal progress ribbon pinned under the header. */}
      <div className="border-border bg-ground/90 sticky top-0 z-10 hidden h-20 border-b backdrop-blur md:block lg:hidden">
        <CareerChart
          entries={entries}
          orientation="horizontal"
          progress={progress}
          activeEntryId={activeEntryId}
          className="h-full w-full"
        />
      </div>

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
          {/* Mobile (<768px): vertical curve in a ~48px left gutter. */}
          <div className="w-12 shrink-0 md:hidden" aria-hidden="true">
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
