/**
 * Subscribes to a CSS media query and re-renders on change.
 *
 * Used by the career timeline to *mount* only the chart the current viewport can actually show.
 * Hiding the other one with a `hidden`/`lg:hidden` class is not enough: a `display: none` subtree
 * is still reconciled by React on every render, and the timeline re-renders on every scroll frame,
 * so the phone was paying to diff a ~470-node desktop chart it could never see.
 *
 * Falls back to `false` where `matchMedia` is unavailable.
 */

import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia(query);
    const handleChange = (): void => {
      setMatches(media.matches);
    };
    handleChange();
    media.addEventListener('change', handleChange);
    return () => {
      media.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}
