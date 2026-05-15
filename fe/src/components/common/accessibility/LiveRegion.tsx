import React from 'react';

/**
 * ARIA live region for dynamic content announcements
 * WCAG 2.1 - 4.1.3 Status Messages
 */
interface LiveRegionProps {
  message: string;
  type?: 'polite' | 'assertive';
  role?: 'status' | 'alert' | 'log';
}

export default function LiveRegion({ message, type = 'polite', role = 'status' }: LiveRegionProps) {
  return (
    <div
      aria-live={type}
      aria-atomic="true"
      role={role}
      className="sr-only"
    >
      {message}
    </div>
  );
}
