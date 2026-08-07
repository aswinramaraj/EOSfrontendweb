"use client";

import { useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Button } from "@/shared/components/ui/Button";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable";
import { CheckIcon, DownloadIcon } from "@/shared/components/icons";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { useHostels } from "@/modules/hostel/hooks/useHostels";
import { useHostelReportPreview } from "@/modules/hostel/hooks/useReportPreview";
import { useHostelReportDownload } from "@/modules/hostel/hooks/useReportDownload";
import {
  HOSTEL_REPORT_DEFS,
  HOSTEL_REPORT_KEYS,
  type HostelReportFilters,
  type HostelReportKey,
} from "@/modules/hostel/types/reports";

export default function HostelReportsPage() {
  const [selectedKey, setSelectedKey] = useState<HostelReportKey>("occupancy");
  const [filters, setFilters] = useState<HostelReportFilters>({});
  const { show } = useToast();

  const { data: hostels } = useHostels();
  const def = HOSTEL_REPORT_DEFS[selectedKey];
  const { data: table, isLoading, error } = useHostelReportPreview(selectedKey, filters);
  const pdfDownload = useHostelReportDownload();
  const excelDownload = useHostelReportDownload();

  const columns: DataTableColumn<Record<string, unknown>>[] =
    table?.columns.map((col) => ({ key: col.key, header: col.header })) ?? [];
  const rows = table?.rows ?? [];

  function selectReport(key: HostelReportKey) {
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

  const hostelName = hostels?.find((h) => h.id === filters.hostel_id)?.name;

  return (
    <div>
      <PageHeader title="Reports" description="Statutory and management reports, exportable as PDF or Excel." />

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="text-base font-bold text-slate-900">Build a report</h3>
        <p className="mt-1 text-sm text-slate-500">
          Pick a report and the period. Only records dated between the two dates are exported,
          where a report supports a date range.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {HOSTEL_REPORT_KEYS.map((key) => {
            const isSelected = key === selectedKey;
            return (
              <button
                key={key}
                onClick={() => selectReport(key)}
                className={`flex items-start gap-2.5 rounded-lg border px-4 py-3 text-left transition-colors ${
                  isSelected ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white hover:border-blue-200"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border ${
                    isSelected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300"
                  }`}
                >
                  {isSelected && <CheckIcon className="h-3 w-3" />}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-slate-900">
                    {HOSTEL_REPORT_DEFS[key].label}
                  </span>
                  <span className="block text-xs text-slate-500">{HOSTEL_REPORT_DEFS[key].description}</span>
                </span>
              </button>
            );
          })}
        </div>

        {(def.supports.hostel || def.supports.dateRange) && (
          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-wrap items-end gap-3">
              {def.supports.hostel && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Hostel</p>
                  <SelectInput
                    className="w-auto"
                    value={filters.hostel_id ?? ""}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        hostel_id: e.target.value ? Number(e.target.value) : undefined,
                      }))
                    }
                  >
                    <option value="">All hostels</option>
                    {hostels?.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} ({h.code})
                      </option>
                    ))}
                  </SelectInput>
                </div>
              )}
              {def.supports.dateRange && (
                <>
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Start date
                    </p>
                    <input
                      type="date"
                      value={filters.from ?? ""}
                      onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value || undefined }))}
                      className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      End date
                    </p>
                    <input
                      type="date"
                      value={filters.to ?? ""}
                      onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value || undefined }))}
                      className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <p className="text-sm text-slate-500">
                {def.label}
                {hostelName ? ` · ${hostelName}` : ""}
              </p>
              <Button
                variant="primary"
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
        )}
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-base font-bold text-slate-900">{table?.title ?? def.label}</h3>
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(row, index) => (row.student_id_no as string) ?? index}
          isLoading={isLoading}
          error={error instanceof ApiError ? error.message : error ? "Failed to load report." : null}
          emptyMessage="No records for this report."
        />
      </div>
    </div>
  );
}
