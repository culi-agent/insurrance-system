import React, { forwardRef } from 'react';

/**
 * Accessible input component
 * WCAG 2.1 - 1.3.5 Identify Input Purpose, 4.1.2 Name, Role, Value
 */
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ error, className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`input-field ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''} ${className}`}
        {...props}
      />
    );
  },
);

FormInput.displayName = 'FormInput';
export default FormInput;
