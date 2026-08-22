interface SecretaryFieldProps {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Small-caps label + control, matching the design's `.field` treatment
 * (uppercase gray label above the input) — distinct from the shared
 * FormField (sentence-case label) used by Library/Hostel forms.
 */
export function SecretaryField({ label, error, className, children }: SecretaryFieldProps) {
  return (
    <div className={className}>
      <label className="mb-[6px] block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
