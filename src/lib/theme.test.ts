import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  applyTheme,
  getAppliedTheme,
  readStoredTheme,
  resolveTheme,
  setTheme,
  THEME_STORAGE_KEY,
  themeInitScript,
} from './theme.ts';

describe('theme', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('applyTheme sets data-theme on <html>', () => {
    applyTheme('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(getAppliedTheme()).toBe('light');

    applyTheme('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('setTheme persists to localStorage and applies the attribute', () => {
    setTheme('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(readStoredTheme()).toBe('light');
  });

  it('resolveTheme prefers a stored preference over the system preference', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
    window.localStorage.setItem(THEME_STORAGE_KEY, 'light');
    expect(resolveTheme()).toBe('light');
  });

  it('resolveTheme falls back to the system preference when nothing is stored', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
    expect(resolveTheme()).toBe('dark');

    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    expect(resolveTheme()).toBe('light');
  });

  it('readStoredTheme never throws even if localStorage access throws', () => {
    const getItem = vi.spyOn(Object.getPrototypeOf(window.localStorage) as Storage, 'getItem');
    getItem.mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(readStoredTheme()).toBeNull();
  });

  it('exposes a self-contained inline script for index.html', () => {
    expect(themeInitScript).toContain('data-theme');
    expect(themeInitScript).toContain(THEME_STORAGE_KEY);
  });
});
