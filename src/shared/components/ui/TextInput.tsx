import { forwardRef, type InputHTMLAttributes } from "react";

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean };

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ hasError, className = "", ...rest }, ref) => (
    <input
      ref={ref}
      className={`w-full rounded-md border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-tint ${
        hasError ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-primary"
      } ${className}`}
      {...rest}
    />
  ),
);

TextInput.displayName = "TextInput";
