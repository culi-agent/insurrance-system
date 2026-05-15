/**
 * Accessibility testing utilities
 * Only loaded in development mode for runtime a11y checks
 */

/**
 * Initialize axe-core for development accessibility testing
 * Reports WCAG violations in the browser console
 */
export async function initA11yTesting(): Promise<void> {
  if (import.meta.env.DEV) {
    try {
      const axe = await import('@axe-core/react');
      const React = await import('react');
      const ReactDOM = await import('react-dom');

      axe.default(React.default, ReactDOM, 1000, {
        rules: [
          // WCAG 2.1 Level A + AA rules
          { id: 'color-contrast', enabled: true },
          { id: 'label', enabled: true },
          { id: 'button-name', enabled: true },
          { id: 'image-alt', enabled: true },
          { id: 'link-name', enabled: true },
          { id: 'heading-order', enabled: true },
          { id: 'landmark-one-main', enabled: true },
          { id: 'page-has-heading-one', enabled: true },
          { id: 'region', enabled: true },
          { id: 'aria-allowed-attr', enabled: true },
          { id: 'aria-required-attr', enabled: true },
          { id: 'aria-valid-attr', enabled: true },
          { id: 'aria-valid-attr-value', enabled: true },
          { id: 'focus-order-semantics', enabled: true },
        ],
      });

      console.log('[A11y] axe-core accessibility testing enabled');
    } catch (error) {
      console.warn('[A11y] Could not load axe-core:', error);
    }
  }
}

/**
 * WCAG 2.1 contrast ratio checker
 * AA requires: 4.5:1 for normal text, 3:1 for large text
 * AAA requires: 7:1 for normal text, 4.5:1 for large text
 */
export function getContrastRatio(foreground: string, background: string): number {
  const fgLuminance = getRelativeLuminance(foreground);
  const bgLuminance = getRelativeLuminance(background);
  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

function getRelativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((v) => {
    v = v / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Check if element meets minimum touch target size (44x44px)
 * WCAG 2.5.5 Target Size
 */
export function checkTouchTarget(element: HTMLElement): {
  passes: boolean;
  width: number;
  height: number;
} {
  const rect = element.getBoundingClientRect();
  return {
    passes: rect.width >= 44 && rect.height >= 44,
    width: rect.width,
    height: rect.height,
  };
}
