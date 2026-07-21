/**
 * Responsive Layout Components
 * Mobile-first responsive design for all breakpoints
 * Fixes for Critical Issue #3 (Responsive Layout)
 */

import { ReactNode } from 'react';

/**
 * Breakpoint sizes (pixels)
 * Mobile-first approach
 */
export const BREAKPOINTS = {
  xs: 320,   // Small phones
  sm: 480,   // Large phones
  md: 768,   // Tablets
  lg: 1024,  // Desktop
  xl: 1280,  // Large desktop
} as const;

/**
 * MediaQuery constants for use in CSS
 */
export const MQ = {
  xs: `@media (min-width: ${BREAKPOINTS.xs}px)`,
  sm: `@media (min-width: ${BREAKPOINTS.sm}px)`,
  md: `@media (min-width: ${BREAKPOINTS.md}px)`,
  lg: `@media (min-width: ${BREAKPOINTS.lg}px)`,
  xl: `@media (min-width: ${BREAKPOINTS.xl}px)`,
  landscape: '@media (orientation: landscape)',
  portrait: '@media (orientation: portrait)',
  smallHeight: '@media (max-height: 500px)',
} as const;

/**
 * ResponsiveGrid - Auto-responsive grid layout
 * Desktop: 3 columns
 * Tablet: 2 columns
 * Mobile: 1 column
 */
export function ResponsiveGrid({
  children,
  minColWidth = '250px',
  gap = '1rem',
}: {
  children: ReactNode;
  minColWidth?: string;
  gap?: string;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${minColWidth}, 1fr))`,
        gap,
      }}
      className="w-full"
    >
      {children}
    </div>
  );
}

/**
 * ResponsiveContainer - Full-width container with responsive padding
 * Mobile: 12px padding
 * Tablet: 16px padding
 * Desktop: 24px padding
 */
export function ResponsiveContainer({
  children,
  maxWidth = '100%',
}: {
  children: ReactNode;
  maxWidth?: string;
}) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth,
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: 'var(--space-3)',
        paddingRight: 'var(--space-3)',
      }}
      className="sm:px-4 md:px-6"
    >
      {children}
    </div>
  );
}

/**
 * ResponsiveTwoColumn - Responsive two-column layout
 * Mobile: Single column
 * Tablet: Two columns (1fr, 0.58fr)
 * Desktop: Two columns (1fr, 0.58fr)
 */
export function ResponsiveTwoColumn({
  left,
  right,
  gap = '1rem',
}: {
  left: ReactNode;
  right: ReactNode;
  gap?: string;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap,
      }}
      className="w-full"
    >
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}

/**
 * ResponsiveStack - Responsive flex stack (vertical on mobile, horizontal on desktop)
 * Mobile: Column (vertical)
 * Desktop: Row (horizontal)
 */
export function ResponsiveStack({
  children,
  direction = 'column-to-row',
  gap = '1rem',
  justifyContent = 'flex-start',
}: {
  children: ReactNode;
  direction?: 'column' | 'row' | 'column-to-row';
  gap?: string;
  justifyContent?: string;
}) {
  const flexDir = {
    column: 'flex-col',
    row: 'flex-row',
    'column-to-row': 'flex-col md:flex-row',
  }[direction];

  return (
    <div
      style={{
        display: 'flex',
        gap,
        justifyContent,
      }}
      className={`w-full ${flexDir}`}
    >
      {children}
    </div>
  );
}

/**
 * TouchFriendlyButton - Ensures minimum 44x44px touch target
 * WCAG AAA standard for mobile accessibility
 */
export function TouchFriendlyButton({
  children,
  onClick,
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        minHeight: '44px',
        minWidth: '44px',
        padding: '0.75rem 1rem',
      }}
      className="px-4 py-3 rounded-md font-semibold transition-colors"
    >
      {children}
    </button>
  );
}

/**
 * HiddenOnMobile - Hide element on mobile, show on tablet+
 */
export function HiddenOnMobile({ children }: { children: ReactNode }) {
  return <div className="hidden md:block">{children}</div>;
}

/**
 * HiddenOnDesktop - Hide element on desktop, show on mobile
 */
export function HiddenOnDesktop({ children }: { children: ReactNode }) {
  return <div className="md:hidden">{children}</div>;
}

/**
 * SafeAreaInset - Respects safe-area-inset (notches, home indicator)
 * Important for mobile apps and PWAs
 */
export function SafeAreaContainer({
  children,
  position = 'all',
}: {
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'all';
}) {
  const paddingStyle = {
    top: 'max(1rem, env(safe-area-inset-top))',
    bottom: 'max(1rem, env(safe-area-inset-bottom))',
    left: 'max(1rem, env(safe-area-inset-left))',
    right: 'max(1rem, env(safe-area-inset-right))',
  };

  const styles =
    position === 'all'
      ? {
          paddingTop: paddingStyle.top,
          paddingBottom: paddingStyle.bottom,
          paddingLeft: paddingStyle.left,
          paddingRight: paddingStyle.right,
        }
      : {
          ['padding' + (position.charAt(0).toUpperCase() + position.slice(1)) as any]:
            paddingStyle[position],
        };

  return <div style={styles}>{children}</div>;
}

/**
 * ResponsiveImage - Image that respects device pixel ratio
 * and lazy loads
 */
export function ResponsiveImage({
  src,
  alt,
  width,
  height,
  srcSet,
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  srcSet?: string;
}) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      srcSet={srcSet}
      loading="lazy"
      decoding="async"
      style={{
        maxWidth: '100%',
        height: 'auto',
        display: 'block',
      }}
    />
  );
}

/**
 * ViewportMeta - Component to set viewport meta tags for mobile
 * Should be used in <head>
 */
export function ViewportMeta() {
  return (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="theme-color" content="#1f7a4d" />
    </>
  );
}

/**
 * CSS Helper for responsive text
 * Example: getResponsiveSize(12, 16) returns text that scales from 12px to 16px
 */
export function getResponsiveSize(mobileSize: number, desktopSize: number): string {
  const slope = (desktopSize - mobileSize) / (1280 - 320);
  const intercept = mobileSize - slope * 320;
  return `clamp(${mobileSize}px, calc(${intercept}px + ${slope * 100}vw), ${desktopSize}px)`;
}

/**
 * Example usage in CSS:
 * h1 { font-size: getResponsiveSize(24, 48); }
 * Results in fluid scaling between 24px and 48px
 */
