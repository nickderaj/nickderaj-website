import { ExternalLink } from '@/components/ui/index.ts';
import { Link } from 'react-router';

/** One line: name, year, links, and a restrained "built with" credit. */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-border border-t">
      <div className="text-muted mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-6 font-mono text-xs tracking-wide sm:px-6">
        <p>Nick de Raj &copy; {year}</p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <ExternalLink href="https://github.com/nickderaj" showIcon={false} className="min-h-11">
            GitHub
          </ExternalLink>
          <ExternalLink
            href="https://www.linkedin.com/in/nickderaj"
            showIcon={false}
            className="min-h-11"
          >
            LinkedIn
          </ExternalLink>
          <Link
            to="/data"
            className="text-muted hover:text-accent min-h-11 underline decoration-1 underline-offset-4 transition-colors duration-150"
          >
            /data
          </Link>
          <span>Built with React, Vite &amp; Tailwind.</span>
        </div>
      </div>
    </footer>
  );
}
