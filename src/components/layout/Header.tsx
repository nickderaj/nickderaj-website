import { ThemeToggle } from './ThemeToggle.tsx';

type NavLink = {
  href: string;
  label: string;
};

/**
 * Anchor targets this header links to. The corresponding sections (owned by other agents) must
 * render an element with a matching `id` for these links — and for the skip link's `#main` — to
 * land anywhere.
 */
const NAV_LINKS: NavLink[] = [
  { href: '#experience', label: 'Experience' },
  { href: '#projects', label: 'Projects' },
  { href: '#toolkit', label: 'Toolkit' },
  { href: '#contact', label: 'Contact' },
];

/**
 * Minimal fixed header: skip link, mono name at left, section anchors + theme toggle at right.
 * On mobile the anchors stay a single compact row (horizontally scrollable if they ever overflow)
 * rather than collapsing into a menu overlay.
 */
export function Header() {
  return (
    <>
      <a
        href="#main"
        className="focus-visible:border-border-strong focus-visible:bg-surface focus-visible:text-text sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-2 focus-visible:left-2 focus-visible:z-50 focus-visible:rounded-sm focus-visible:border focus-visible:px-3 focus-visible:py-2 focus-visible:font-mono focus-visible:text-xs focus-visible:uppercase"
      >
        Skip to content
      </a>
      <header className="bg-ground/90 border-border sticky top-0 z-40 border-b backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <a
            href="#top"
            className="text-text shrink-0 font-mono text-sm font-medium tracking-wide whitespace-nowrap sm:text-base"
          >
            Nick de Raj
          </a>
          <nav
            aria-label="Section"
            className="flex h-full min-w-0 items-stretch gap-4 overflow-x-auto"
          >
            <ul className="flex items-stretch gap-4 sm:gap-6">
              {NAV_LINKS.map((link) => (
                <li key={link.href} className="flex">
                  <a
                    href={link.href}
                    className="text-muted hover:text-accent flex h-full items-center font-mono text-xs tracking-wide uppercase transition-colors duration-150 sm:text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex items-center">
              <ThemeToggle />
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
