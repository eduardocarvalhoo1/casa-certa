import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  { label, id, error, className = '', ...props },
  ref
) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        aria-invalid={error ? 'true' : undefined}
        className={`rounded-lg border px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 ${
          error
            ? 'border-red-400 focus:ring-red-300'
            : 'border-neutral-300 focus:ring-neutral-400'
        }`}
        {...props}
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
});

export default Input;
