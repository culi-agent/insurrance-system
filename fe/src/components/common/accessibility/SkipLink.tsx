import React from 'react';

/**
 * Skip navigation link for keyboard users
 * WCAG 2.1 - 2.4.1 Bypass Blocks
 */
export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg focus:font-medium focus:shadow-lg focus:outline-none"
    >
      Chuyển đến nội dung chính
    </a>
  );
}
