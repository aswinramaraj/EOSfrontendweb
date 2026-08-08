"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@/shared/components/icons";
import { SelectInput } from "@/shared/components/ui/SelectInput";

interface FacultyPaginationBarProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

// Windowed page-number list with ellipses for large page counts — always
// shows first, last, current, and current's immediate neighbors.
function getPageNumbers(current: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const keep = new Set([1, totalPages, current - 1, current, current + 1]);
  const sorted = Array.from(keep)
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);

  const result: (number | "ellipsis")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push("ellipsis");
    result.push(p);
    prev = p;
  }
  return result;
}

// Distinct from the shared PaginationBar (Previous/Next only) — this list
// page's design calls for a page-size selector and numbered page buttons,
// so it gets its own component rather than bending the shared one (which
// Library's pages also render as-is).
export function FacultyPaginationBar({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
}: FacultyPaginationBarProps) {
  if (total === 0) return null;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const pages = getPageNumbers(page, totalPages);

  return (
    // No border-t here — rendered as DataTable's `footer` slot, which
    // already supplies the separator so this reads as part of the same
    // card instead of a second, disconnected block underneath it.
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
      <div className="flex items-center gap-3 text-slate-500">
        <span>
          Showing {start}–{end} of {total}
        </span>
        <span className="flex items-center gap-1.5">
          Rows
          {/* See FacultyFiltersBar's comment — SelectInput's internal
              w-full needs a constrained wrapper, not a same-element
              width override, to actually shrink. */}
          <div className="w-18">
            <SelectInput
              aria-label="Rows per page"
              className="py-1"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </SelectInput>
          </div>
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <span key={`ellipsis-${i}`} className="px-1.5 text-slate-400">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium ${
                p === page ? "bg-blue-700 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {p}
            </button>
          ),
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
