import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';

export type SectionHeadingProps = {
  /** Uppercase mono label, e.g. "EXPERIENCE". Casing is applied via CSS, pass any case in. */
  label: string;
  /** Optional index shown before the label, e.g. `1` renders as "01 / EXPERIENCE". */
  index?: number;
  /** Optional trailing content, right-aligned on the rule line (e.g. a count or a date range). */
  trailing?: ReactNode;
  headingId?: string;
} & Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'id'>;

/**
 * Mono, uppercase, letter-spaced section label with the rule-line treatment (PLAN §1.2). Renders
 * an `<h2>` so section landmarks stay in the document outline regardless of visual placement.
 */
export const SectionHeading = forwardRef<HTMLDivElement, SectionHeadingProps>(
  ({ label, index, trailing, headingId, className = '', ...rest }, ref) => {
    const indexLabel = index === undefined ? null : String(index).padStart(2, '0');

    return (
      <div ref={ref} className={`flex flex-col gap-3 ${className}`} {...rest}>
        <div className="flex items-baseline justify-between gap-4">
          <h2
            id={headingId}
            className="text-muted font-mono text-xs font-medium tracking-[0.2em] uppercase sm:text-sm"
          >
            {indexLabel !== null && (
              <span aria-hidden="true" className="text-accent">
                {indexLabel} /{' '}
              </span>
            )}
            {label}
          </h2>
          {trailing !== undefined && (
            <div className="text-muted font-mono text-xs tracking-wide uppercase">{trailing}</div>
          )}
        </div>
        <div className="bg-border h-px w-full" />
      </div>
    );
  },
);

SectionHeading.displayName = 'SectionHeading';
