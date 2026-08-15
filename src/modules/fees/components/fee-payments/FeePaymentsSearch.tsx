"use client";

import { SearchIcon } from "@/shared/components/icons";

interface FeePaymentsSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function FeePaymentsSearch({ value, onChange }: FeePaymentsSearchProps) {
  return (
    <label className="relative block w-full max-w-xs">
      <span className="sr-only">Search by student name, register no., roll no., email</span>
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by student name, register no., roll no., email..."
        className="h-9 w-full rounded-[var(--r-md)] border border-[var(--border-default)] bg-white pl-9 pr-3 text-[13px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] focus:border-[var(--c-primary-500)] focus:shadow-[0_0_0_4px_var(--c-primary-100)]"
      />
    </label>
  );
}
