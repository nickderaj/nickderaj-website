import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  THEME_CHANGE_EVENT,
  getAppliedTheme,
  resolveTheme,
  setTheme,
  type Theme,
} from '@/lib/theme.ts';

/**
 * Icon-button theme toggle. Assumes the inline script from `src/lib/theme.ts`
 * (`themeInitScript`) has already stamped `data-theme` on `<html>` before React mounts, so the
 * first render reads the real applied theme rather than guessing and re-rendering.
 */
export function ThemeToggle() {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof document === 'undefined') {
      return 'dark';
    }
    return document.documentElement.hasAttribute('data-theme') ? getAppliedTheme() : resolveTheme();
  });

  useEffect(() => {
    const handleChange = (event: Event) => {
      if (!(event instanceof CustomEvent)) {
        return;
      }
      const detail: unknown = event.detail;
      if (detail === 'dark' || detail === 'light') {
        setThemeState(detail);
      }
    };
    document.addEventListener(THEME_CHANGE_EVENT, handleChange);
    return () => {
      document.removeEventListener(THEME_CHANGE_EVENT, handleChange);
    };
  }, []);

  const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
  const Icon = theme === 'dark' ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={() => {
        setTheme(nextTheme);
      }}
      aria-label={`Switch to ${nextTheme} theme`}
      title={`Switch to ${nextTheme} theme`}
      className="inline-flex size-11 items-center justify-center rounded-sm border border-border-strong text-text transition-colors duration-150 hover:border-accent hover:text-accent"
    >
      <Icon aria-hidden="true" className="size-4" />
    </button>
  );
}
