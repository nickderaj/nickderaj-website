/**
 * Theme resolution + persistence (PLAN §1.2 - dark default, light supported, no flash of the
 * wrong theme). `localStorage` access is wrapped in try/catch throughout: it can throw in private
 * browsing / storage-restricted contexts, and a theme preference is never worth crashing over.
 */

export type Theme = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'theme';

const THEME_ATTRIBUTE = 'data-theme';

/** Fires on `document` whenever the resolved theme changes, so multiple toggles stay in sync. */
export const THEME_CHANGE_EVENT = 'themechange';

function isTheme(value: unknown): value is Theme {
  return value === 'dark' || value === 'light';
}

/** Reads the explicitly stored preference, if any. Never throws. */
export function readStoredTheme(): Theme | null {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : null;
  } catch {
    return null;
  }
}

function writeStoredTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage unavailable (private browsing, quota, disabled) - the in-memory/DOM state below
    // still applies for the rest of the session, which is an acceptable degradation.
  }
}

/** Falls back to the OS preference when nothing has been explicitly chosen. */
export function readSystemTheme(): Theme {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'dark';
  }
}

/** Stored preference, else system preference, else dark (the site default). */
export function resolveTheme(): Theme {
  return readStoredTheme() ?? readSystemTheme();
}

/** Reads the theme currently applied to the document, defaulting to dark if unset. */
export function getAppliedTheme(): Theme {
  const attribute = document.documentElement.getAttribute(THEME_ATTRIBUTE);
  return isTheme(attribute) ? attribute : 'dark';
}

/** Applies a theme to `<html data-theme>` and notifies listeners. Does not persist it. */
export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
  document.dispatchEvent(new CustomEvent<Theme>(THEME_CHANGE_EVENT, { detail: theme }));
}

/** Applies and persists a theme choice - this is what a user-initiated toggle should call. */
export function setTheme(theme: Theme): void {
  applyTheme(theme);
  writeStoredTheme(theme);
}

/**
 * Inline script source for `index.html`, run before first paint, so the initial render never
 * flashes the wrong theme. Kept dependency-free and defensive: it must never throw, since a
 * thrown error here would otherwise block the rest of the page from parsing.
 *
 * Usage: drop `<script>${themeInitScript}</script>` directly in `<head>`, before any stylesheet
 * that reads `--ground`/`--text` etc.
 */
export const themeInitScript = `(function () {
  try {
    var stored = window.localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    var theme =
      stored === 'dark' || stored === 'light'
        ? stored
        : window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (error) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();`;
