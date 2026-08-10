"use client";

import { useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Button } from "@/shared/components/ui/Button";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable";
import { DownloadIcon } from "@/shared/components/icons";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { useDepartments } from "@/modules/departments/hooks/useDepartments";
import { useReportPreview } from "@/modules/library/hooks/useReportPreview";
import { useReportDownload } from "@/modules/library/hooks/useReportDownload";
import { REPORT_DEFS, REPORT_KEYS, type ReportFilters, type ReportKey } from "@/modules/library/types/reports";

export default function LibraryReportsPage() {
  const [selectedKey, setSelectedKey] = useState<ReportKey>("inventory");
  const [filters, setFilters] = useState<ReportFilters>({});
  const { show } = useToast();

  const { data: departments } = useDepartments();
  const def = REPORT_DEFS[selectedKey];
  const { data: table, isLoading, error } = useReportPreview(selectedKey, filters);
  const pdfDownload = useReportDownload();
  const excelDownload = useReportDownload();

  const columns: DataTableColumn<Record<string, unknown>>[] =
    table?.columns.map((col) => ({ key: col.key, header: col.header })) ?? [];

  function selectReport(key: ReportKey) {
    setSelectedKey(key);
    setFilters({});
  }

  function handleDownload(format: "pdf" | "excel") {
    const mutation = format === "pdf" ? pdfDownload : excelDownload;
    mutation.mutate(
      { key: selectedKey, format, filters },
      {
        onError: (err: unknown) =>
          show(err instanceof ApiError ? err.message : "Something went wrong.", "error"),
      },
    );
  }

  const rows = table?.rows ?? [];

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Statutory and management reports, exportable as PDF or Excel."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <div className="flex flex-col gap-2">
          {REPORT_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => selectReport(key)}
              className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                key === selectedKey
                  ? "border-blue-300 bg-blue-50"
                  : "border-slate-200 bg-white hover:border-blue-200"
              }`}
            >
              <p className="text-sm font-semibold text-slate-900">{REPORT_DEFS[key].label}</p>
              <p className="mt-0.5 text-xs text-slate-500">{REPORT_DEFS[key].description}</p>
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-bold text-slate-900">{table?.title ?? def.label}</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={rows.length === 0}
                isPending={pdfDownload.isPending}
                onClick={() => handleDownload("pdf")}
              >
                <DownloadIcon className="h-4 w-4" /> PDF
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={rows.length === 0}
                isPending={excelDownload.isPending}
                onClick={() => handleDownload("excel")}
              >
                <DownloadIcon className="h-4 w-4" /> Excel
              </Button>
            </div>
          </div>

          {(def.supports.department || def.supports.dateRange) && (
            <div className="mb-4 flex flex-wrap items-center gap-3">
              {def.supports.department && (
                <SelectInput
                  className="w-auto"
                  value={filters.department_id ?? ""}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      department_id: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                >
                  <option value="">All departments</option>
                  {departments?.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </SelectInput>
              )}
              {def.supports.dateRange && (
                <>
                  <input
                    type="date"
                    value={filters.from ?? ""}
                    onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value || undefined }))}
                    className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  <span className="text-sm text-slate-400">to</span>
                  <input
                    type="date"
                    value={filters.to ?? ""}
                    onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value || undefined }))}
                    className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </>
              )}
            </div>
          )}

          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(row, index) => (row.accession as string) ?? index}
            isLoading={isLoading}
            error={error instanceof ApiError ? error.message : error ? "Failed to load report." : null}
            emptyMessage="No records for this report."
          />
        </div>
      </div>
    </div>
  );
}
