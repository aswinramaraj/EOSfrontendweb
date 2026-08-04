"use client";

import { useEffect, useMemo, useState } from "react";
import { ApiError } from "@/shared/lib/api-client";
import { feePaymentsDashboardService } from "../../services/fee-payments-dashboard.service";
import { FeePaymentsSearch } from "./FeePaymentsSearch";
import { FeePaymentsFilters, type FeePaymentsFilterOptions } from "./FeePaymentsFilters";
import { FeePaymentsTable } from "./FeePaymentsTable";
import { FeePaymentsPagination } from "./FeePaymentsPagination";
import { ALL_FILTER_VALUE, type FeePaymentFiltersState, type FeePaymentRow } from "./types";

const DEFAULT_FILTERS: FeePaymentFiltersState = {
  programme: ALL_FILTER_VALUE,
  department: ALL_FILTER_VALUE,
  academicYear: ALL_FILTER_VALUE,
  batch: ALL_FILTER_VALUE,
  dueStatus: ALL_FILTER_VALUE,
};

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values.filter((value) => value && value !== "—"))).sort((a, b) =>
    a.localeCompare(b),
  );
}

interface FeePaymentsPanelProps {
  onViewStudent?: (row: FeePaymentRow) => void;
}

export function FeePaymentsPanel({ onViewStudent }: FeePaymentsPanelProps) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FeePaymentFiltersState>(DEFAULT_FILTERS);
  const [rows, setRows] = useState<FeePaymentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setLoadError(null);

    feePaymentsDashboardService
      .list()
      .then((data) => setRows(data))
      .catch((err: unknown) => {
        setLoadError(err instanceof ApiError ? err.message : "Failed to load fee payments dashboard.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filterOptions: FeePaymentsFilterOptions = useMemo(
    () => ({
      programme: uniqueSorted(rows.map((row) => row.programme)),
      department: uniqueSorted(rows.map((row) => row.department)),
      academicYear: uniqueSorted(rows.map((row) => row.academicYear)),
      batch: uniqueSorted(rows.map((row) => row.batch)),
      dueStatus: uniqueSorted(rows.map((row) => String(row.dueStatus))),
    }),
    [rows],
  );

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rows.filter((row) => {
      if (filters.programme !== ALL_FILTER_VALUE && row.programme !== filters.programme) return false;
      if (filters.department !== ALL_FILTER_VALUE && row.department !== filters.department) return false;
      if (filters.academicYear !== ALL_FILTER_VALUE && row.academicYear !== filters.academicYear) return false;
      if (filters.batch !== ALL_FILTER_VALUE && row.batch !== filters.batch) return false;
      if (filters.dueStatus !== ALL_FILTER_VALUE && String(row.dueStatus) !== filters.dueStatus) return false;

      if (query) {
        const haystack = `${row.studentName} ${row.registerNo}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      return true;
    });
  }, [rows, filters, search]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FeePaymentsSearch value={search} onChange={setSearch} />
        <FeePaymentsFilters
          filters={filters}
          options={filterOptions}
          onChange={setFilters}
          onClear={() => setFilters(DEFAULT_FILTERS)}
        />
      </div>

      {loadError ? (
        <p className="py-8 text-center text-sm text-red-600">{loadError}</p>
      ) : (
        <FeePaymentsTable rows={filteredRows} isLoading={isLoading} onViewStudent={onViewStudent} />
      )}

      <FeePaymentsPagination
        currentPage={1}
        totalPages={1}
        totalResults={filteredRows.length}
        pageSize={filteredRows.length}
      />
    </div>
  );
}
