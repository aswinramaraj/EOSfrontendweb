import { useState } from "react";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable";
import { PaginationBar } from "@/shared/components/ui/PaginationBar";
import { ApiError } from "@/shared/lib/api-client";
import { useIqacReportPreview } from "../../hooks/useReports";
import type { IqacReportFilters, IqacReportType } from "../../types/reports";

const PAGE_SIZE = 10;

interface ReportPreviewTableProps {
  type: IqacReportType;
  filters: IqacReportFilters;
}

export function ReportPreviewTable({ type, filters }: ReportPreviewTableProps) {
  const { data: table, isLoading, error } = useIqacReportPreview(type, filters);
  const [page, setPage] = useState(1);

  // The backend returns the report's full row set in one shot (it also
  // backs the Excel/PDF export, which needs everything) - pagination here
  // is purely a display slice over rows already in memory, reset whenever
  // the date range changes so a stale page number can't outrun new data.
  // Adjusted during render (React docs' pattern for resetting state when a
  // prop changes) rather than in an effect, which would cause an extra
  // cascading render.
  const [prevRange, setPrevRange] = useState({ from: filters.from, to: filters.to });
  if (prevRange.from !== filters.from || prevRange.to !== filters.to) {
    setPrevRange({ from: filters.from, to: filters.to });
    setPage(1);
  }

  const allRows = table?.rows ?? [];
  const total = allRows.length;
  const pageRows = allRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns: DataTableColumn<Record<string, unknown>>[] =
    table?.columns.map((col) => ({ key: col.key, header: col.header })) ?? [];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <h3 className="mb-4 text-base font-bold text-slate-900">{table?.title ?? "Report preview"}</h3>
      <DataTable
        columns={columns}
        rows={pageRows}
        rowKey={(_, index) => (page - 1) * PAGE_SIZE + index}
        isLoading={isLoading}
        error={error instanceof ApiError ? error.message : error ? "Failed to load report." : null}
        emptyMessage="No records for this report in the selected period."
      />
      {!isLoading && !error && (
        <PaginationBar page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
      )}
    </section>
  );
}
