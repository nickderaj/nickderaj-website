import { PostList } from '@/components/PostList.tsx';
import { career } from '@/content/career.ts';
import { projects } from '@/content/projects/index.ts';
import { skills } from '@/content/skills.ts';
import { posts } from '@/lib/posts.ts';
import { ArrowRight, ChevronDown, Mail } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { useDocumentMeta } from './useDocumentMeta.ts';

const SUMMARY =
  'Full-stack and quant developer, currently at Goldman Sachs. Previously in Oil and Power Markets, transitioned into tech via AI and crypto gaming and trading startups. Now researching quant strategies.';

const MAX_POSTS = 5;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatMonth(iso: string): string {
  const [year, month] = iso.split('-');
  return `${MONTHS[Number(month) - 1] ?? ''} ${year ?? ''}`;
}

function formatPeriod(start: string, end: string): string {
  return `${formatMonth(start)} — ${end === 'present' ? 'Present' : formatMonth(end)}`;
}

/** Assembled at render time so the address isn't a plain-text token in the shipped bundle. */
const EMAIL = ['nickderaj', 'gmail.com'].join('@');

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.7 5.4-5.27 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M18.9 2H22l-7.6 8.7L23 22h-6.8l-5.3-6.9L4.8 22H1.7l8.1-9.3L1 2h7l4.8 6.3L18.9 2Zm-1.2 18h1.9L7.1 3.9H5.1L17.7 20Z" />
    </svg>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-20">
      <h2 className="text-muted-foreground mb-6 font-mono text-xs tracking-[0.2em] uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function Home() {
  useDocumentMeta('Nick de Raj — Full-Stack Developer & Researcher', SUMMARY);
  const work = career.filter((c) => c.kind === 'work');
  const education = career.filter((c) => c.kind === 'education');

  const socials = [
    { href: `mailto:${EMAIL}`, label: 'Email', Icon: Mail },
    { href: 'https://github.com/nickderaj', label: 'GitHub', Icon: GithubIcon },
    { href: 'https://www.linkedin.com/in/nickderaj', label: 'LinkedIn', Icon: LinkedinIcon },
    { href: 'https://x.com/nickderaj', label: 'X', Icon: XIcon },
  ];

  return (
    <main id="main" className="mx-auto max-w-3xl px-6 pt-16">
      <section>
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Nick de Raj</h1>
          <p className="text-primary mt-1 font-mono text-sm">
            Full-Stack Developer &amp; Researcher
          </p>
          <p className="text-muted-foreground mt-1 font-mono text-xs">London, UK</p>
        </div>
      </section>
      <p className="text-muted-foreground mt-8 max-w-2xl leading-relaxed">{SUMMARY}</p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        {socials.map(({ href, label, Icon }) => (
          <a
            key={label}
            href={href}
            {...(href.startsWith('mailto') ? {} : { target: '_blank', rel: 'noreferrer' })}
            aria-label={label}
            className="border-border text-muted-foreground hover:border-primary hover:text-foreground rounded-md border p-2.5 transition-colors"
          >
            <Icon className="h-4 w-4" />
          </a>
        ))}
      </div>

      <Section title="Recent writing">
        <PostList posts={posts.slice(0, MAX_POSTS)} />
        {posts.length > MAX_POSTS && (
          <Link
            to="/blog"
            className="text-muted-foreground hover:text-foreground mt-4 inline-flex items-center gap-1 font-mono text-xs"
          >
            See more <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </Section>

      <Section title="Experience">
        <ol className="border-border relative space-y-3 border-l pl-6">
          {work.map((e) => (
            <li key={e.id} className="relative">
              <span className="border-primary bg-background absolute top-3 -left-[29px] h-2.5 w-2.5 rounded-full border" />
              <details className="group border-border rounded-lg border">
                <summary className="hover:bg-secondary/40 flex cursor-pointer list-none flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-lg px-4 py-3 [&::-webkit-details-marker]:hidden">
                  <h3 className="flex items-center gap-2 font-medium">
                    <ChevronDown
                      aria-hidden="true"
                      className="text-muted-foreground h-4 w-4 shrink-0 -rotate-90 transition-transform group-open:rotate-0"
                    />
                    <span>
                      {e.role} <span className="text-muted-foreground">· {e.org}</span>
                    </span>
                  </h3>
                  <span className="text-muted-foreground font-mono text-xs">
                    {formatPeriod(e.start, e.end)}
                  </span>
                </summary>
                <div className="px-4 pb-4">
                  <ul className="text-muted-foreground space-y-1.5 text-sm">
                    {e.highlights.map((h) => (
                      <li key={h} className="before:text-primary before:mr-2 before:content-['▸']">
                        {h}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {e.stack.map((s) => (
                      <span
                        key={s}
                        className="bg-secondary text-secondary-foreground rounded px-1.5 py-0.5 font-mono text-[11px]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Projects">
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((p) => (
            <a
              key={p.id}
              href={p.links[0]?.href}
              target="_blank"
              rel="noreferrer"
              className="border-border hover:border-primary rounded-lg border p-4 transition-colors"
            >
              <div className="font-mono text-sm">{p.title}</div>
              <p className="text-muted-foreground mt-2 text-xs leading-relaxed">{p.thesis}</p>
              <div className="text-primary mt-3 font-mono text-[11px]">
                {p.tags.slice(0, 4).join(' · ')}
              </div>
            </a>
          ))}
        </div>
      </Section>

      <Section title="Education">
        <div className="space-y-5">
          {education.map((e) => (
            <div key={e.id}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-medium">
                  {e.role} <span className="text-muted-foreground">· {e.org}</span>
                </h3>
                <span className="text-muted-foreground font-mono text-xs">
                  {e.start.slice(0, 4)} — {e.end.slice(0, 4)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Skills">
        <dl className="space-y-3 text-sm">
          {skills.map(({ group, items }) => (
            <div key={group} className="grid gap-1 sm:grid-cols-[170px_1fr] sm:gap-4">
              <dt className="text-muted-foreground font-mono text-xs">{group}</dt>
              <dd>{items.join(', ')}</dd>
            </div>
          ))}
        </dl>
      </Section>
    </main>
  );
}
