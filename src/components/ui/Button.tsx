import { forwardRef, type ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'ghost';

export type ButtonProps = {
  variant?: ButtonVariant;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-ground border-transparent hover:opacity-90',
  ghost: 'bg-transparent text-text border-border-strong hover:border-accent hover:text-accent',
};

/**
 * The one button variant set for the site (PLAN task 1): a real `<button>` so it gets native
 * keyboard/AT behaviour for free, a visible focus ring, and a ≥44px touch target.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', type = 'button', className = '', ...rest }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border px-4 font-mono text-xs font-medium tracking-wide uppercase transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${className}`}
        {...rest}
      />
    );
  },
);

Button.displayName = 'Button';
