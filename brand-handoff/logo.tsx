import { cn } from '@/lib/utils';

/**
 * CORE wordmark — "Full stop" direction.
 * The square period is the brand. It is always square, always solid,
 * always sits on the baseline, and is never rotated or rounded.
 *
 * <Logo />                          indigo on light
 * <Logo tone="inverse" />           white on indigo/ink
 * <Logo dot="accent" size="lg" />   cowrie stop, for the footer and app icon
 */
export function Logo({
  size = 'md',
  tone = 'brand',
  dot = 'match',
  className,
}: {
  size?: 'sm' | 'md' | 'lg';
  tone?: 'brand' | 'inverse' | 'ink';
  dot?: 'match' | 'accent';
  className?: string;
}) {
  const type = {
    sm: 'text-[14px]',
    md: 'text-[24px]',
    lg: 'text-[56px]',
  }[size];

  const square = {
    sm: 'h-[3px] w-[3px]',
    md: 'h-[5px] w-[5px]',
    lg: 'h-[12px] w-[12px]',
  }[size];

  const color = {
    brand: 'text-primary',
    inverse: 'text-white',
    ink: 'text-foreground',
  }[tone];

  return (
    <span className={cn('inline-flex items-end gap-px', color, className)}>
      <span className={cn('font-heading font-extrabold leading-[0.82] tracking-[-0.05em]', type)}>
        CORE
      </span>
      <span
        aria-hidden
        className={cn(square, 'mb-px', dot === 'accent' ? 'bg-accent' : 'bg-current')}
      />
      <span className="sr-only">CORE</span>
    </span>
  );
}
