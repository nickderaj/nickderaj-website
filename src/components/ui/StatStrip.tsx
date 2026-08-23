import { forwardRef, type ComponentPropsWithoutRef } from 'react';

export type StatStripItem = {
  label: string;
  value: string;
};

export type StatStripProps = {
  items: StatStripItem[];
} & Omit<ComponentPropsWithoutRef<'dl'>, 'children'>;

/**
 * Mono label/value pairs separated by middots (PLAN §2.2's `TENURE 2y 4m · STACK … · TEAM 6`
 * treatment). Wraps cleanly on mobile — each pair is a single inline-flex unit so a label never
 * breaks away from its value.
 */
export const StatStrip = forwardRef<HTMLDListElement, StatStripProps>(
  ({ items, className = '', ...rest }, ref) => {
    return (
      <dl
        ref={ref}
        className={`flex flex-wrap items-baseline gap-x-2 gap-y-1 font-mono text-xs tracking-wide sm:text-sm ${className}`}
        {...rest}
      >
        {items.map((item, itemIndex) => (
          <div key={`${item.label}-${item.value}`} className="flex items-baseline gap-1.5">
            {itemIndex > 0 && (
              <span aria-hidden="true" className="text-muted">
                ·
              </span>
            )}
            <dt className="text-muted uppercase">{item.label}</dt>
            <dd className="text-text">{item.value}</dd>
          </div>
        ))}
      </dl>
    );
  },
);

StatStrip.displayName = 'StatStrip';
