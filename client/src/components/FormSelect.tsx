import React from 'react';
import { FieldError } from 'react-hook-form';

interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: FieldError;
  children: React.ReactNode;
}

const FormSelect = React.forwardRef<HTMLSelectElement, Props>(
  ({ label, error, id, children, ...rest }, ref) => {
    const selectId = id || rest.name;

    return (
      <div className="mb-4">
        <label htmlFor={selectId} className="block text-sm font-medium mb-1">{label}</label>
        <select
          ref={ref}
          id={selectId}
          className="border p-2 w-full"
          {...rest}
        >
          {children}
        </select>
        {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
      </div>
    );
  }
);

export default FormSelect;
