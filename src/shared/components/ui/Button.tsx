import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "dangerSolid" | "ghost";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isPending?: boolean;
}

const VARIANT_STYLES: Record<Variant, string> = {
  primary: "bg-blue-700 text-white hover:bg-blue-800 disabled:bg-blue-300",
  secondary:
    "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:text-slate-400",
  danger:
    "border border-red-200 bg-white text-red-700 hover:bg-red-50 disabled:text-red-300",
  dangerSolid: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",
  ghost: "text-blue-700 hover:bg-blue-50 disabled:text-blue-300",
};

const SIZE_STYLES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "secondary", size = "md", isPending = false, disabled, className = "", children, ...rest },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isPending}
        className={`inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors disabled:cursor-not-allowed ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${className}`}
        {...rest}
      >
        {isPending && (
          <span
            className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
