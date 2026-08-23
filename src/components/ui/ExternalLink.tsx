import { ArrowUpRight } from 'lucide-react';
import { forwardRef, type ComponentPropsWithoutRef } from 'react';

export type ExternalLinkProps = {
  href: string;
  /** Hide the trailing arrow glyph — the underline treatment still applies. Default `true`. */
  showIcon?: boolean;
} & Omit<ComponentPropsWithoutRef<'a'>, 'href' | 'target' | 'rel'>;

/**
 * Anchor for links that leave the site: forces `target="_blank" rel="noopener noreferrer"`
 * (PLAN §5.5), an accent underline treatment, a small arrow-out icon, and a screen-reader-only
 * "(opens in a new tab)" suffix so the behaviour is announced, not just implied visually.
 */
export const ExternalLink = forwardRef<HTMLAnchorElement, ExternalLinkProps>(
  ({ href, showIcon = true, className = '', children, ...rest }, ref) => {
    return (
      <a
        ref={ref}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`group inline-flex items-center gap-1 text-text underline decoration-accent decoration-1 underline-offset-4 transition-colors duration-150 hover:text-accent ${className}`}
        {...rest}
      >
        {children}
        {showIcon && (
          <ArrowUpRight
            aria-hidden="true"
            className="size-[1em] shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        )}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  },
);

ExternalLink.displayName = 'ExternalLink';
