/**
 * Scroll-driven state for the career timeline (PLAN §2.1). Two things, computed independently:
 *
 *  - `progress`: 0..1 progress of the viewport through a ref'd container element. Driven by a
 *    single rAF-throttled `scroll` listener — no scroll-jacking, native scrolling is untouched.
 *  - `activeIndex`: the index of the career entry currently "in view", via IntersectionObserver
 *    watching a set of item refs (the role cards). `-1` when nothing is registered yet.
 *
 * Both respect `prefers-reduced-motion`: when reduced motion is requested, `progress` is pinned
 * to `1` (chart renders complete and static, per PLAN §1.2/§6) while `activeIndex` tracking still
 * works, since it's about state (which card is current), not motion.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export type ScrollProgressResult = {
  /** 0..1 progress of the viewport through the container. Pinned to 1 under reduced motion. */
  progress: number;
  /** Index of the currently active (most in-view) item, or -1 if none is registered/visible. */
  activeIndex: number;
  /** Ref callback to attach to the scroll-progress container. */
  containerRef: (node: HTMLElement | null) => void;
  /** Ref callback factory — attach `itemRef(index)` to each trackable item (e.g. each role card). */
  itemRef: (index: number) => (node: HTMLElement | null) => void;
};

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** Progress of `container`'s scrollable span through the viewport, clamped to [0, 1]. */
function computeProgress(container: HTMLElement): number {
  const rect = container.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const totalScrollable = rect.height - viewportHeight;
  if (totalScrollable <= 0) {
    // Container is shorter than (or equal to) the viewport: fully "in progress" once its top has
    // reached the viewport top, otherwise not yet started.
    return rect.top <= 0 ? 1 : 0;
  }
  const scrolled = -rect.top;
  return Math.min(1, Math.max(0, scrolled / totalScrollable));
}

export function useScrollProgress(): ScrollProgressResult {
  const [progress, setProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerElementRef = useRef<HTMLElement | null>(null);
  const itemElementsRef = useRef<Map<number, HTMLElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const reducedMotionRef = useRef(false);

  const recomputeProgress = useCallback(() => {
    rafIdRef.current = null;
    const container = containerElementRef.current;
    if (!container) return;
    if (reducedMotionRef.current) {
      setProgress(1);
      return;
    }
    setProgress(computeProgress(container));
  }, []);

  const scheduleProgressUpdate = useCallback(() => {
    if (rafIdRef.current !== null) return;
    rafIdRef.current = window.requestAnimationFrame(recomputeProgress);
  }, [recomputeProgress]);

  const rebuildObserver = useCallback(() => {
    observerRef.current?.disconnect();

    const entries = [...itemElementsRef.current.entries()];
    if (entries.length === 0) {
      observerRef.current = null;
      return;
    }

    const visibleRatios = new Map<number, number>();

    const observer = new IntersectionObserver(
      (observedEntries) => {
        for (const observedEntry of observedEntries) {
          const target = observedEntry.target;
          const foundIndex = entries.find(([, element]) => element === target)?.[0];
          if (foundIndex === undefined) continue;
          visibleRatios.set(foundIndex, observedEntry.isIntersecting ? observedEntry.intersectionRatio : 0);
        }

        let bestIndex = -1;
        let bestRatio = 0;
        for (const [index, ratio] of visibleRatios) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestIndex = index;
          }
        }
        if (bestIndex !== -1) {
          setActiveIndex(bestIndex);
        }
      },
      {
        // A band around the viewport's vertical centre — a card is "active" once it crosses the
        // middle of the screen, which reads naturally while scrolling a tall card stack.
        rootMargin: '-40% 0px -40% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    for (const [, element] of entries) {
      observer.observe(element);
    }
    observerRef.current = observer;
  }, []);

  useEffect(() => {
    reducedMotionRef.current = prefersReducedMotion();
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (): void => {
      reducedMotionRef.current = media.matches;
      scheduleProgressUpdate();
    };
    media.addEventListener('change', handleChange);

    window.addEventListener('scroll', scheduleProgressUpdate, { passive: true });
    window.addEventListener('resize', scheduleProgressUpdate);
    scheduleProgressUpdate();

    return () => {
      media.removeEventListener('change', handleChange);
      window.removeEventListener('scroll', scheduleProgressUpdate);
      window.removeEventListener('resize', scheduleProgressUpdate);
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [scheduleProgressUpdate]);

  useEffect(
    () => () => {
      observerRef.current?.disconnect();
    },
    [],
  );

  const containerRef = useCallback(
    (node: HTMLElement | null) => {
      containerElementRef.current = node;
      scheduleProgressUpdate();
    },
    [scheduleProgressUpdate],
  );

  const itemRef = useCallback(
    (index: number) =>
      (node: HTMLElement | null): void => {
        if (node) {
          itemElementsRef.current.set(index, node);
        } else {
          itemElementsRef.current.delete(index);
        }
        rebuildObserver();
      },
    [rebuildObserver],
  );

  return { progress, activeIndex, containerRef, itemRef };
}
