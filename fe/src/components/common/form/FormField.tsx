import React from 'react';

/**
 * Accessible form field wrapper with proper labeling and error messages
 * WCAG 2.1 - 1.3.1 Info and Relationships, 3.3.2 Labels or Instructions
 */
interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export default function FormField({
  id,
  label,
  error,
  required = false,
  hint,
  children,
  className = '',
}: FormFieldProps) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [
    hint ? hintId : null,
    error ? errorId : null,
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`${className}`}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1.5"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>
        )}
        {required && (
          <span className="sr-only"> (bắt buộc)</span>
        )}
      </label>

      {hint && (
        <p id={hintId} className="text-xs text-gray-500 mb-1">
          {hint}
        </p>
      )}

      {/* Clone child element to inject accessibility props */}
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<any>, {
            id,
            'aria-invalid': error ? 'true' : undefined,
            'aria-describedby': describedBy,
            'aria-required': required || undefined,
          })
        : children
      }

      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
          <span className="sr-only">Lỗi: </span>
          {error}
        </p>
      )}
    </div>
  );
}
