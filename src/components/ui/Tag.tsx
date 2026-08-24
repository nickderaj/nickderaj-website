import { forwardRef, type ComponentPropsWithoutRef } from 'react';

export type TagProps = ComponentPropsWithoutRef<'span'>;

/** Small mono tech tag - a bordered pill, no fill, no colour beyond the border/text tokens. */
export const Tag = forwardRef<HTMLSpanElement, TagProps>(({ className = '', ...rest }, ref) => {
  return (
    <span
      ref={ref}
      className={`border-border text-muted inline-flex items-center rounded-sm border px-1.5 py-0.5 font-mono text-[0.6875rem] tracking-wide uppercase ${className}`}
      {...rest}
    />
  );
});

Tag.displayName = 'Tag';
