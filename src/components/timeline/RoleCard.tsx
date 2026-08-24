/**
 * One role/education card - the anatomy specified in PLAN §2.2: mono period, role · org, a rule,
 * a mono stat strip (tenure · stack · team), summary prose, then outcome highlight lines.
 * Restrained: no colour beyond the accent marker dot and links.
 */

import { formatPeriod, formatTenure, tenureMonths } from '@/lib/format.ts';
import type { CareerEntry } from '@/types/content.ts';

export type RoleCardProps = {
  entry: CareerEntry;
  isActive: boolean;
};

export default function RoleCard({ entry, isActive }: RoleCardProps) {
  const tenure = formatTenure(tenureMonths(entry.start, entry.end));
  const period = formatPeriod(entry.start, entry.end);

  return (
    // Below `lg` the ticker tape runs behind these cards, so the fill is near-opaque to keep the
    // copy comfortably readable - the tape reads through the gaps between cards, and only as a
    // faint texture within them. Desktop has nothing behind the cards, so it keeps the lighter fill.
    <article
      className={`border-border bg-surface/85 lg:bg-surface/40 rounded-lg border p-6 transition-colors duration-200 sm:p-8 ${
        isActive ? 'border-accent/60' : ''
      }`}
      aria-current={isActive ? 'step' : undefined}
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-muted font-mono text-xs tracking-[0.12em] tabular-nums">{period}</p>
        <span
          aria-hidden="true"
          className={`mt-1 size-2 shrink-0 rounded-full ${isActive ? 'bg-accent' : 'bg-muted'}`}
        />
      </div>

      <h3 className="text-text mt-2 text-lg font-medium sm:text-xl">
        {entry.role} <span className="text-muted">·</span> {entry.org}
      </h3>

      <hr className="border-border my-4" />

      <dl className="text-muted flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs">
        <div className="flex gap-2">
          <dt className="tracking-[0.08em]">TENURE</dt>
          <dd className="text-text tabular-nums">{tenure}</dd>
        </div>
        {entry.stack.length > 0 && (
          <div className="flex gap-2">
            <dt className="tracking-[0.08em]">STACK</dt>
            <dd className="text-text">{entry.stack.join(' · ')}</dd>
          </div>
        )}
        {entry.teamSize !== undefined && (
          <div className="flex gap-2">
            <dt className="tracking-[0.08em]">TEAM</dt>
            <dd className="text-text tabular-nums">{entry.teamSize}</dd>
          </div>
        )}
      </dl>

      <p className="text-text mt-4 text-sm leading-relaxed sm:text-base">{entry.summary}</p>

      {entry.highlights.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {entry.highlights.map((highlight) => (
            <li key={highlight} className="text-text flex gap-2 text-sm leading-relaxed">
              <span aria-hidden="true" className="text-accent">
                →
              </span>
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
      )}

      {entry.links && entry.links.length > 0 && (
        <p className="mt-4 flex flex-wrap gap-4 font-mono text-xs">
          {entry.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent decoration-accent/40 hover:decoration-accent underline underline-offset-4"
            >
              {link.label}
            </a>
          ))}
        </p>
      )}
    </article>
  );
}
