import { forwardRef, type InputHTMLAttributes } from "react";

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean };

// Tailwind's cascade doesn't respect JSX string order — a plain `w-20` passed
// via `className` can still lose to this component's own `w-full` depending
// on generated CSS order, silently stretching the input full-width. Only
// default to `w-full` when the caller hasn't specified its own width.
const WIDTH_CLASS_PATTERN = /(?:^|\s)(?:[a-z]+:)*w-\S+/;

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ hasError, className = "", ...rest }, ref) => (
    <input
      ref={ref}
      className={`${WIDTH_CLASS_PATTERN.test(className) ? "" : "w-full"} rounded-md border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-tint ${
        hasError ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-primary"
      } ${className}`}
      {...rest}
    />
  ),
);

TextInput.displayName = "TextInput";
