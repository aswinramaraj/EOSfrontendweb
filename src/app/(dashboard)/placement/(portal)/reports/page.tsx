"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { StatCard } from "@/shared/components/ui/StatCard";
import { Button } from "@/shared/components/ui/Button";
import { SegmentedControl } from "@/shared/components/ui/SegmentedControl";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable";
import {
  BarChartIcon,
  CheckIcon,
  ChevronLeftIcon,
  DownloadIcon,
  PeopleIcon,
  RupeeIcon,
  XIcon,
} from "@/shared/components/icons";
import { ApiError } from "@/shared/lib/api-client";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { useReportsSummary } from "@/modules/placement/hooks/useReportsSummary";
import { useBatches } from "@/modules/placement/hooks/useBatches";
import { useReportDownload } from "@/modules/placement/hooks/useReportDownload";
import type { ClassPlacementRecord, DepartmentPlacementRecord, ReportView } from "@/modules/placement/types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ReportsPage() {
  const [view, setView] = useState<ReportView>("class");
  const [batchId, setBatchId] = useState<number | "all">("all");
  // Set by clicking a department in the department-wise table — narrows the
  // class-wise table to just that department's classes, so "department →
  // its classes → a class's students" reads as one drill-down instead of
  // three unrelated views.
  const [departmentDrilldown, setDepartmentDrilldown] = useState<string | null>(null);
  const { data: batches } = useBatches();
  const { data, isLoading, error } = useReportsSummary(batchId === "all" ? undefined : batchId);
  const { show } = useToast();
  const pdfDownload = useReportDownload();
  const excelDownload = useReportDownload();

  function handleDownload(format: "pdf" | "excel") {
    const mutation = format === "pdf" ? pdfDownload : excelDownload;
    mutation.mutate(
      {
        view,
        format,
        batchId: batchId === "all" ? undefined : batchId,
        department: view === "class" ? (departmentDrilldown ?? undefined) : undefined,
      },
      {
        onError: (err: unknown) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error"),
      },
    );
  }

  function handleViewChange(next: ReportView) {
    setView(next);
    setDepartmentDrilldown(null);
  }

  function handleDepartmentClick(department: string) {
    setDepartmentDrilldown(department);
    setView("class");
  }

  const classColumns: DataTableColumn<ClassPlacementRecord>[] = [
    {
      key: "className",
      header: "Class",
      render: (row) => (
        <Link
          href={`/placement/students?class=${encodeURIComponent(row.className)}`}
          className="font-semibold text-blue-700 hover:underline"
        >
          {row.className}
        </Link>
      ),
    },
    { key: "students", header: "Students" },
    { key: "placed", header: "Placed" },
    { key: "highestLpa", header: "Highest", render: (row) => `₹${row.highestLpa} LPA` },
  ];

  const departmentColumns: DataTableColumn<DepartmentPlacementRecord>[] = [
    {
      key: "department",
      header: "Department",
      render: (row) => (
        <button
          type="button"
          onClick={() => handleDepartmentClick(row.department)}
          className="font-semibold text-blue-700 hover:underline"
        >
          {row.department}
        </button>
      ),
    },
    { key: "students", header: "Students" },
    { key: "placed", header: "Placed" },
    { key: "highestLpa", header: "Highest", render: (row) => `₹${row.highestLpa} LPA` },
  ];

  const visibleClassWise = departmentDrilldown
    ? (data?.classWise ?? []).filter((c) => c.departmentName === departmentDrilldown)
    : (data?.classWise ?? []);

  return (
    <div>
      {departmentDrilldown && view === "class" && (
        <button
          type="button"
          onClick={() => setDepartmentDrilldown(null)}
          className="mb-3 flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline"
        >
          <ChevronLeftIcon className="h-4 w-4" /> Back to Department-wise
        </button>
      )}

      <PageHeader
        title="Placement Reports"
        description={data ? `Updated ${formatDate(data.updatedOn)}` : undefined}
      />

      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof ApiError ? error.message : "Failed to load reports."}
        </p>
      )}

      {!isLoading && data && (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Eligible students"
              value={data.eligibleStudents.toLocaleString("en-IN")}
              icon={PeopleIcon}
              caption={`+${data.eligibleStudentsYoy} vs last year`}
            />
            <StatCard
              label="Placed"
              value={data.placed.toLocaleString("en-IN")}
              icon={CheckIcon}
              caption={`+${data.placedYoyPct}% vs last year`}
            />
            <div className="flex min-h-32.5 flex-col justify-between gap-4 rounded-lg border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-700 text-white">
                  <BarChartIcon className="h-5 w-5" />
                </span>
                <span className="text-3xl font-bold tracking-tight text-slate-900">{data.placementRate}%</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Placement rate</p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-blue-500" style={{ width: `${data.placementRate}%` }} />
                </div>
              </div>
            </div>
            <StatCard
              label="Highest / average"
              value={`₹${data.highestLpa} LPA`}
              icon={RupeeIcon}
              caption={`Average ₹${data.averageLpa} LPA`}
            />
          </div>

          <div className="mt-6 mb-4">
            <SegmentedControl
              value={view}
              onChange={handleViewChange}
              options={[
                { value: "class", label: "Class-wise" },
                { value: "department", label: "Department-wise" },
              ]}
            />
          </div>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {view === "class" ? "Class-wise placement records" : "Department-wise placement records"}
              </h3>
              <p className="text-xs text-slate-500">
                {batchId === "all"
                  ? "All batches"
                  : (batches?.find((b) => b.id === batchId)?.name ?? "Selected batch")}
              </p>
              {departmentDrilldown && view === "class" && (
                <button
                  type="button"
                  onClick={() => setDepartmentDrilldown(null)}
                  className="mt-1.5 flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                >
                  {departmentDrilldown} <XIcon className="h-3 w-3" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <SelectInput
                className="w-40"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value === "all" ? "all" : Number(e.target.value))}
              >
                <option value="all">All batches</option>
                {batches?.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </SelectInput>
              <Button
                variant="secondary"
                size="sm"
                isPending={pdfDownload.isPending}
                onClick={() => handleDownload("pdf")}
              >
                <DownloadIcon className="h-4 w-4" /> PDF
              </Button>
              <Button
                variant="secondary"
                size="sm"
                isPending={excelDownload.isPending}
                onClick={() => handleDownload("excel")}
              >
                <DownloadIcon className="h-4 w-4" /> Excel
              </Button>
            </div>
          </div>

          {view === "class" ? (
            <DataTable columns={classColumns} rows={visibleClassWise} rowKey={(row) => row.className} />
          ) : (
            <DataTable columns={departmentColumns} rows={data.departmentWise} rowKey={(row) => row.department} />
          )}
        </>
      )}
    </div>
  );
}
