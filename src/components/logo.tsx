import { cn } from '@/lib/utils';

/**
 * CORE wordmark — "Full stop" direction.
 * The square period is the brand. It is always square, always solid,
 * sits exactly at the end of CORE on the font baseline (never under or detached).
 *
 * <Logo />                          indigo on light
 * <Logo tone="inverse" />           white on indigo/ink
 * <Logo dot="accent" size="lg" />   cowrie stop, for the footer and app icon
 */
export interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | number;
  tone?: 'brand' | 'inverse' | 'ink';
  dot?: 'match' | 'accent';
  showText?: boolean;
  className?: string;
}

export function Logo({
  size = 'md',
  tone = 'brand',
  dot = 'match',
  showText = true,
  className,
}: LogoProps) {
  // Normalize numeric sizes for backwards compatibility
  const normalizedSize: 'sm' | 'md' | 'lg' =
    typeof size === 'number'
      ? size <= 20
        ? 'sm'
        : size <= 44
        ? 'md'
        : 'lg'
      : size;

  const type = {
    sm: 'text-[15px]',
    md: 'text-[24px]',
    lg: 'text-[52px]',
  }[normalizedSize];

  const square = {
    sm: 'h-[3px] w-[3px]',
    md: 'h-[4.5px] w-[4.5px]',
    lg: 'h-[9px] w-[9px]',
  }[normalizedSize];

  const color = {
    brand: 'text-primary',
    inverse: 'text-white',
    ink: 'text-foreground',
  }[tone];

  return (
    <span
      className={cn(
        'inline-flex items-baseline font-heading font-extrabold tracking-[-0.05em] leading-none select-none',
        type,
        color,
        className
      )}
    >
      {showText && <span>CORE</span>}
      <span
        aria-hidden
        className={cn(
          square,
          'inline-block ml-0.5 self-baseline translate-y-[-0.08em]',
          dot === 'accent' ? 'bg-accent' : 'bg-current'
        )}
      />
      <span className="sr-only">CORE</span>
    </span>
  );
}
