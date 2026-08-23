import { forwardRef, type ComponentPropsWithoutRef } from 'react';

export type TagProps = ComponentPropsWithoutRef<'span'>;

/** Small mono tech tag — a bordered pill, no fill, no colour beyond the border/text tokens. */
export const Tag = forwardRef<HTMLSpanElement, TagProps>(({ className = '', ...rest }, ref) => {
  return (
    <span
      ref={ref}
      className={`inline-flex items-center rounded-sm border border-border px-1.5 py-0.5 font-mono text-[0.6875rem] tracking-wide text-muted uppercase ${className}`}
      {...rest}
    />
  );
});

Tag.displayName = 'Tag';
