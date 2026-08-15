"use client";

import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "@/shared/components/icons";

interface FeePaymentsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  pageSize: number;
}

export function FeePaymentsPagination({
  currentPage,
  totalPages,
  totalResults,
  pageSize,
}: FeePaymentsPaginationProps) {
  const rangeStart = (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, totalResults);

  const pageNumbers = [1, 2, 3, 4, 5];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
      <p className="text-[13px] text-[var(--text-tertiary)]">
        Showing {rangeStart}–{rangeEnd} of {totalResults.toLocaleString("en-IN")}
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="flex h-8 w-8 items-center justify-center rounded-[var(--r-md)] border border-[var(--border-default)] text-[var(--text-tertiary)] hover:bg-[var(--c-gray-50)] disabled:opacity-40"
        >
          <ChevronLeftIcon className="h-3.5 w-3.5" />
        </button>

        {pageNumbers.map((page) => (
          <button
            key={page}
            type="button"
            aria-current={page === currentPage ? "page" : undefined}
            className={`flex h-8 w-8 items-center justify-center rounded-[var(--r-md)] text-[13px] font-medium transition-colors ${
              page === currentPage
                ? "bg-[var(--c-primary-600)] text-white"
                : "text-[var(--text-secondary)] hover:bg-[var(--c-gray-50)]"
            }`}
          >
            {page}
          </button>
        ))}

        <span className="px-1 text-[13px] text-[var(--text-tertiary)]">…</span>

        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-[var(--r-md)] text-[13px] font-medium text-[var(--text-secondary)] hover:bg-[var(--c-gray-50)]"
        >
          {totalPages}
        </button>

        <button
          type="button"
          aria-label="Next page"
          className="flex h-8 w-8 items-center justify-center rounded-[var(--r-md)] border border-[var(--border-default)] text-[var(--text-tertiary)] hover:bg-[var(--c-gray-50)]"
        >
          <ChevronRightIcon className="h-3.5 w-3.5" />
        </button>
      </div>

      <label className="relative block">
        <span className="sr-only">Results per page</span>
        <select
          value={pageSize}
          disabled
          className="h-8 appearance-none rounded-[var(--r-md)] border border-[var(--border-default)] bg-white pl-3 pr-8 text-[13px] text-[var(--text-secondary)] outline-none disabled:cursor-not-allowed"
        >
          <option>{pageSize} / page</option>
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-tertiary)]" />
      </label>
    </div>
  );
}
