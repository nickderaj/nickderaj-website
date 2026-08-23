import { Download, Mail } from 'lucide-react';
import { useState } from 'react';
import { ExternalLink, SectionHeading } from '@/components/ui/index.ts';

const EMAIL_USER = 'nickderaj';
const EMAIL_DOMAIN = 'gmail.com';

/**
 * Section 4 (PLAN §2): terse — one line plus email, CV download, GitHub, LinkedIn. The email is
 * assembled client-side (same approach as Hero) rather than shipped as a plain string.
 */
export default function Contact() {
  const [email] = useState<string | null>(() =>
    typeof window === 'undefined' ? null : `${EMAIL_USER}@${EMAIL_DOMAIN}`,
  );

  return (
    <section id="contact" aria-labelledby="contact-heading">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionHeading index={4} label="Contact" headingId="contact-heading" />
        <div className="mt-10 max-w-xl">
          <p className="text-base leading-relaxed text-text sm:text-lg">
            Open to conversations about quant research and engineering roles. The fastest way to
            reach me is email.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-1 font-mono text-sm">
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
            <ExternalLink href="/nick-de-raj-cv.pdf" className="min-h-11">
              <Download aria-hidden="true" className="size-[1em]" />
              Download CV
            </ExternalLink>
            <ExternalLink href="https://github.com/nickderaj" className="min-h-11">
              GitHub
            </ExternalLink>
            <ExternalLink href="https://www.linkedin.com/in/nickderaj" className="min-h-11">
              LinkedIn
            </ExternalLink>
          </div>
        </div>
      </div>
    </section>
  );
}
