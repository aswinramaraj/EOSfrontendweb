import { forwardRef, type SelectHTMLAttributes } from "react";

type SelectInputProps = SelectHTMLAttributes<HTMLSelectElement> & { hasError?: boolean };

export const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
  ({ hasError, className = "", children, ...rest }, ref) => (
    <select
      ref={ref}
      className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 ${
        hasError ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-blue-600"
      } ${className}`}
      {...rest}
    >
      {children}
    </select>
  ),
);

SelectInput.displayName = "SelectInput";
