"use client";

import { ChevronDownIcon, RefreshIcon } from "@/shared/components/icons";
import { ALL_FILTER_VALUE, type FeePaymentFiltersState } from "./types";

interface FilterSelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 appearance-none rounded-[var(--r-md)] border border-[var(--border-default)] bg-white pl-3 pr-8 text-[13px] text-[var(--text-secondary)] outline-none focus:border-[var(--c-primary-500)]"
      >
        <option value={ALL_FILTER_VALUE}>{label}: All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {label}: {option}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-tertiary)]" />
    </label>
  );
}

export interface FeePaymentsFilterOptions {
  programme: string[];
  department: string[];
  academicYear: string[];
  batch: string[];
  dueStatus: string[];
}

interface FeePaymentsFiltersProps {
  filters: FeePaymentFiltersState;
  options: FeePaymentsFilterOptions;
  onChange: (next: FeePaymentFiltersState) => void;
  onClear: () => void;
}

export function FeePaymentsFilters({ filters, options, onChange, onClear }: FeePaymentsFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterSelect
        label="Programme"
        value={filters.programme}
        options={options.programme}
        onChange={(value) => onChange({ ...filters, programme: value })}
      />
      <FilterSelect
        label="Department"
        value={filters.department}
        options={options.department}
        onChange={(value) => onChange({ ...filters, department: value })}
      />
      <FilterSelect
        label="Academic Year"
        value={filters.academicYear}
        options={options.academicYear}
        onChange={(value) => onChange({ ...filters, academicYear: value })}
      />
      <FilterSelect
        label="Batch"
        value={filters.batch}
        options={options.batch}
        onChange={(value) => onChange({ ...filters, batch: value })}
      />
      <FilterSelect
        label="Due Status"
        value={filters.dueStatus}
        options={options.dueStatus}
        onChange={(value) => onChange({ ...filters, dueStatus: value })}
      />

      <button
        type="button"
        onClick={onClear}
        className="flex h-9 items-center gap-1.5 rounded-[var(--r-md)] px-3 text-[13px] font-medium text-[var(--text-tertiary)] hover:bg-[var(--c-gray-100)]"
      >
        <RefreshIcon className="h-3.5 w-3.5" />
        Clear all
      </button>
    </div>
  );
}
