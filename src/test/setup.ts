import '@testing-library/jest-dom/vitest';

/**
 * jsdom (the test DOM) doesn't implement `IntersectionObserver`. The career timeline
 * (`useScrollProgress`) uses it to track which role card is active, so any test that mounts the
 * full app tree needs at least a no-op stand-in — this is intentionally the simplest possible
 * shape, not a behavioural mock (no test here asserts on intersection callbacks).
 */
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: readonly number[] = [];
  disconnect(): void {
    // no-op: nothing is ever observed in tests.
  }
  observe(): void {
    // no-op: no test here asserts on intersection callbacks.
  }
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  unobserve(): void {
    // no-op: see `observe`.
  }
}

if (typeof globalThis.IntersectionObserver === 'undefined') {
  globalThis.IntersectionObserver = MockIntersectionObserver;
}

/**
 * jsdom also doesn't implement `window.matchMedia`. Several hooks/components (theme resolution,
 * `useScrollProgress`'s reduced-motion check) call it directly, so tests need at least a
 * non-throwing stand-in. Individual test files may still override this with a more specific mock
 * (e.g. one that returns `matches: true`) via `window.matchMedia = vi.fn()...`.
 */
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {
        // deprecated MediaQueryList API — intentionally unimplemented in this stand-in.
      },
      removeListener: () => {
        // deprecated MediaQueryList API — intentionally unimplemented in this stand-in.
      },
      addEventListener: () => {
        // no-op: no test here asserts on media-query change events.
      },
      removeEventListener: () => {
        // no-op: see `addEventListener`.
      },
      dispatchEvent: () => false,
    }) satisfies MediaQueryList;
}
