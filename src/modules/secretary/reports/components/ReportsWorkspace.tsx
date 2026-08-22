"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/Button";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { CheckIcon, DownloadIcon, FileTextIcon, SecretaryBellIcon, SecretaryCalendarIcon } from "@/shared/components/icons";
import { useReportPreview } from "../hooks/useReportPreview";
import { useReportDownload } from "../hooks/useReportDownload";
import { useReportsSummary } from "../hooks/useReportsSummary";
import {
  SECRETARY_REPORT_DEFS,
  SECRETARY_REPORT_KEYS,
  type SecretaryReportFilters,
  type SecretaryReportKey,
} from "../types";

const TODAY_LABEL = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export function ReportsWorkspace() {
  const [selectedKey, setSelectedKey] = useState<SecretaryReportKey>(SECRETARY_REPORT_KEYS[0]);
  const [filters, setFilters] = useState<SecretaryReportFilters>({});
  const { show } = useToast();

  const { data: summary } = useReportsSummary();
  const def = SECRETARY_REPORT_DEFS[selectedKey];
  const { data: table, isLoading, error } = useReportPreview(selectedKey, filters);
  const pdfDownload = useReportDownload();
  const excelDownload = useReportDownload();

  const columns: DataTableColumn<Record<string, unknown>>[] =
    table?.columns.map((col) => ({ key: col.key, header: col.header })) ?? [];

  function selectReport(key: SecretaryReportKey) {
    setSelectedKey(key);
    setFilters({});
  }

  function handleDownload(format: "pdf" | "excel") {
    const mutation = format === "pdf" ? pdfDownload : excelDownload;
    mutation.mutate(
      { key: selectedKey, format, filters },
      { onError: (err: unknown) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error") },
    );
  }

  const rows = table?.rows ?? [];
  const pills = summary
    ? [
        { value: summary.requests_this_month, label: "requests this month" },
        { value: summary.pending_approvals, label: "pending approvals" },
        { value: summary.upcoming_bookings, label: "upcoming bookings" },
      ]
    : [];

  return (
    <div className="mx-auto max-w-[1080px]">
      <div className="mb-6 flex items-center gap-3.5">
        <div className="flex-1 text-center">
          <div className="text-2xl font-semibold tracking-[-0.02em] text-slate-900">Reports</div>
          <div className="text-sm text-slate-600">Generate and Download Reports</div>
        </div>
        <button
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[#E3E8EF] text-slate-500"
          title="Notifications"
          type="button"
        >
          <SecretaryBellIcon className="h-[18px] w-[18px]" />
        </button>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-[#E3E8EF] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)]">
        <span className="flex items-center gap-[10px] rounded-[14px] border border-[#E3E8EF] px-4 py-[10px] text-[15px] font-semibold text-slate-900">
          <SecretaryCalendarIcon className="h-[17px] w-[17px] text-blue-600" />
          {TODAY_LABEL}
        </span>
        {pills.map((p) => (
          <span
            key={p.label}
            className="flex items-center gap-2 rounded-[14px] border border-slate-300 px-4 py-[10px] text-sm text-slate-600"
          >
            <strong className="text-[15.5px] text-slate-900">{p.value}</strong> {p.label}
          </span>
        ))}
      </div>

      <div className="rounded-2xl border border-[#E3E8EF] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="flex items-center gap-[10px] border-b border-[#E3E8EF] px-5 py-4">
          <FileTextIcon className="h-[17px] w-[17px] text-blue-600" />
          <div className="text-[15.5px] font-semibold text-slate-900">Report Contents</div>
          <span className="text-[12.5px] text-slate-500">Select what to include</span>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4 p-5">
          {SECRETARY_REPORT_KEYS.map((key) => {
            const checked = key === selectedKey;
            const reportDef = SECRETARY_REPORT_DEFS[key];
            return (
              <button
                key={key}
                onClick={() => selectReport(key)}
                className={`flex items-start gap-3 rounded-[14px] border p-4 text-left transition-colors ${
                  checked ? "border-blue-600 bg-blue-50" : "border-slate-300 bg-white hover:border-blue-300"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border ${
                    checked ? "border-blue-600 bg-blue-600" : "border-slate-400 bg-white"
                  }`}
                >
                  {checked && <CheckIcon className="h-3 w-3 text-white" />}
                </span>
                <span>
                  <span className="block text-[15px] font-semibold text-slate-900">{reportDef.label}</span>
                  <span className="mt-0.5 block text-[13px] text-slate-600">{reportDef.description}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4 px-5 pb-5">
          <div className="flex flex-wrap gap-4">
            <div className="w-[190px]">
              <label className="mb-[6px] block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                From date
              </label>
              <input
                type="date"
                value={filters.from ?? ""}
                onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value || undefined }))}
                className="w-full rounded-md border border-[#E3E8EF] px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="w-[190px]">
              <label className="mb-[6px] block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                To date
              </label>
              <input
                type="date"
                value={filters.to ?? ""}
                onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value || undefined }))}
                className="w-full rounded-md border border-[#E3E8EF] px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="w-[170px]">
              <label className="mb-[6px] block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Status
              </label>
              <select
                value={filters.status ?? ""}
                onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value || undefined }))}
                className="w-full rounded-md border border-[#E3E8EF] bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="">All</option>
                {def.statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2.5">
            <button
              disabled={rows.length === 0}
              onClick={() => handleDownload("excel")}
              className="flex items-center gap-2 rounded-[10px] border border-blue-200 bg-blue-50 px-4 py-[11px] text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
            >
              {excelDownload.isPending ? "Downloading…" : "Excel"}
            </button>
            <Button
              variant="primary"
              className="rounded-xl px-[22px] py-3 text-[15px]"
              disabled={rows.length === 0}
              isPending={pdfDownload.isPending}
              onClick={() => handleDownload("pdf")}
            >
              <DownloadIcon className="h-4 w-4" /> Download report
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(row, index) => (row.id as string | number) ?? index}
          isLoading={isLoading}
          error={error instanceof ApiError ? error.message : error ? "Failed to load report." : null}
          emptyMessage="No records for this report."
        />
      </div>
    </div>
  );
}
