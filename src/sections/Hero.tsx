import { Download, Mail } from 'lucide-react';
import { useState } from 'react';
import { ExternalLink } from '@/components/ui/index.ts';

/**
 * Assembled client-side from parts, and only joined at render time via a lazy `useState`
 * initializer (never a module-level string), so the address doesn't sit in the page as a single
 * plain-text token for a naive scraper to lift (PLAN §5.5). Trivial to defeat deliberately, cheap
 * to defeat accidentally — good enough for a personal site.
 */
const EMAIL_USER = 'nickderaj';
const EMAIL_DOMAIN = 'gmail.com';

function useObfuscatedEmail(): string | null {
  const [email] = useState<string | null>(() =>
    typeof window === 'undefined' ? null : `${EMAIL_USER}@${EMAIL_DOMAIN}`,
  );
  return email;
}

/**
 * Section 0 (PLAN §2): name, positioning line, location, and links. Content is kept to roughly
 * the left half of the viewport on wide screens so the Timeline section's chart — which sits
 * directly below and is visually continuous with this section — has room to read as a single
 * spine rather than competing with a full-width hero.
 */
export default function Hero() {
  const email = useObfuscatedEmail();

  return (
    <section
      id="top"
      aria-label="Introduction"
      className="bg-grid-paper relative flex min-h-[calc(100dvh-3.5rem)] items-center border-b border-border"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="max-w-xl lg:max-w-2xl">
          <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">
            Singapore
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-text sm:text-5xl lg:text-6xl">
            Nick de Raj
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-text sm:text-xl">
            Full-stack and quantitative developer at Goldman Sachs. Previously ran a physical
            commodities business trading palm oil on forward contracts, and built a crypto market
            maker from scratch. Now researching commodity futures.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-1 font-mono text-sm">
            <ExternalLink href="https://github.com/nickderaj" className="min-h-11">
              GitHub
            </ExternalLink>
            <ExternalLink href="https://www.linkedin.com/in/nickderaj" className="min-h-11">
              LinkedIn
            </ExternalLink>
            <ExternalLink href="/nick-de-raj-cv.pdf" className="min-h-11">
              <Download aria-hidden="true" className="size-[1em]" />
              CV
            </ExternalLink>
            {email ? (
              <a
                href={`mailto:${email}`}
                className="group inline-flex min-h-11 items-center gap-1.5 text-text underline decoration-accent decoration-1 underline-offset-4 transition-colors duration-150 hover:text-accent"
              >
                <Mail aria-hidden="true" className="size-[1em]" />
                {email}
              </a>
            ) : (
              <span aria-hidden="true" className="inline-flex min-h-11 items-center gap-1.5 text-muted">
                <Mail aria-hidden="true" className="size-[1em]" />
                Email
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
