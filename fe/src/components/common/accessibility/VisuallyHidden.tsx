import React from 'react';

/**
 * Visually hidden content that remains accessible to screen readers
 * WCAG 2.1 - provides context for assistive technology
 */
interface VisuallyHiddenProps {
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
}

export default function VisuallyHidden({ children, as: Component = 'span' }: VisuallyHiddenProps) {
  return <Component className="sr-only">{children}</Component>;
}
