import React, { useRef, useEffect } from 'react';

/**
 * Focus trap for modal dialogs and overlays
 * WCAG 2.1 - 2.4.3 Focus Order
 */
interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
  onEscape?: () => void;
}

export default function FocusTrap({ children, active = true, onEscape }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;

    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    // Focus first element on mount
    firstFocusable?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && onEscape) {
        onEscape();
        return;
      }

      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [active, onEscape]);

  return <div ref={containerRef}>{children}</div>;
}
