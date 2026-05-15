import React from 'react';

/**
 * Accessible loading spinner
 * WCAG 2.1 - 4.1.3 Status Messages (aria-live for loading states)
 */
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export default function LoadingSpinner({
  size = 'md',
  className = '',
  label = 'Đang tải...',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      role="status"
      aria-live="polite"
    >
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-200 border-t-primary-600`}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
