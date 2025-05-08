import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = false, className, ...props }, ref) => {
    const widthClass = fullWidth ? 'w-full' : '';
    const errorClass = error ? 'border-red-500' : 'border-gray-300';

    return (
      <div className={`mb-4 ${widthClass}`}>
        {label && (
          <label className="block text-gray-700 text-sm font-medium mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errorClass} ${className || ''}`}
          {...props}
        />
        {error && <p className="text-red-500 text-xs italic mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;