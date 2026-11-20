import avatar from '@/assets/avatar.png';
import { NavLink } from 'react-router';
import { ThemeToggle } from './ThemeToggle.tsx';

const navClass = ({ isActive }: { isActive: boolean }) =>
  `hover:text-foreground transition-colors ${isActive ? 'text-foreground' : ''}`;

export function Header() {
  return (
    <>
      <a
        href="#main"
        className="focus-visible:bg-card focus-visible:text-foreground focus-visible:border-border sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-2 focus-visible:left-2 focus-visible:z-50 focus-visible:rounded-md focus-visible:border focus-visible:px-3 focus-visible:py-2 focus-visible:font-mono focus-visible:text-xs"
      >
        Skip to content
      </a>
      <header className="border-border bg-background/80 sticky top-0 z-20 border-b backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
          <NavLink to="/" className="flex items-center gap-2.5 text-sm font-medium">
            <img src={avatar} alt="" className="border-border h-7 w-7 rounded-md border" />
            Nick de Raj
          </NavLink>
          <nav className="text-muted-foreground flex items-center gap-5 font-mono text-xs">
            <NavLink to="/" end className={navClass}>
              cv
            </NavLink>
            <NavLink to="/blog" className={navClass}>
              blog
            </NavLink>
            <ThemeToggle />
          </nav>
        </div>
      </header>
    </>
  );
}
