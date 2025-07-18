import React from 'react';
import { FieldError } from 'react-hook-form';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: FieldError;
}

const FormInput = React.forwardRef<HTMLInputElement, Props>(
  ({ label, error, id, ...rest }, ref) => {
    const inputId = id || rest.name;

    return (
      <div className="mb-4">
        <label htmlFor={inputId} className="block text-sm font-medium mb-1">{label}</label>
        <input
          ref={ref}
          id={inputId}
          className="border p-2 w-full"
          autoComplete="off"
          {...rest}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
      </div>
    );
  }
);

export default FormInput;
