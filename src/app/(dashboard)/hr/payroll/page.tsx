"use client";

import { useMemo, useState } from "react";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { StatusPill, type PillTone } from "@/shared/components/ui/StatusPill";
import { Button } from "@/shared/components/ui/Button";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { CheckIcon, DownloadIcon, PlusIcon, RupeeIcon } from "@/shared/components/icons";
import { fullName } from "@/modules/faculty/lib/faculty-format";
import { HrPayrollFormModal } from "@/modules/hr/components/HrPayrollFormModal";
import { useHrPayroll, useMarkHrPayrollPaid } from "@/modules/hr/hooks/useHrPayroll";
import { useHrDashboard } from "@/modules/hr/hooks/useHrDashboard";
import { useHRPeriod, MONTH_LABELS } from "@/modules/hr/components/HRPeriodContext";
import { buildFacultyDepartmentLookup, exportPayrollReportPdf } from "@/modules/hr/lib/hr-report-pdfs";
import { facultyService } from "@/modules/faculty/services/faculty.service";
import { fetchAllPages } from "@/modules/faculty/lib/report-export";
import { HRPageHeader } from "@/modules/hr/components/ui/HRPageHeader";
import { HRStatCard } from "@/modules/hr/components/HRStatCard";
import { HRSegmentedTabs } from "@/modules/hr/components/ui/HRSegmentedTabs";
import { HRFilterBar } from "@/modules/hr/components/ui/HRFilterBar";
import { HRStackedRowsSkeleton, HRStatGridSkeleton } from "@/modules/hr/components/ui/HRSkeleton";

type PaidFilter = "all" | "paid" | "pending";

const STATUS_LABEL: Record<Exclude<PaidFilter, "all">, string> = {
  paid: "Verified",
  pending: "Pending",
};

const STATUS_TONE: Record<Exclude<PaidFilter, "all">, PillTone> = {
  paid: "green",
  pending: "amber",
};

function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function HRPayrollPage() {
  const { show } = useToast();
  const { month, year, setMonth, setYear, monthKey } = useHRPeriod();
  const [search, setSearch] = useState("");
  const [paidFilter, setPaidFilter] = useState<PaidFilter>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [exportPending, setExportPending] = useState(false);

  const { data, isLoading, error } = useHrPayroll({ month: monthKey, limit: 100 });
  const { data: dashboard } = useHrDashboard();
  const markPaid = useMarkHrPayrollPaid();

  const records = useMemo(() => data?.data ?? [], [data]);

  const counts = useMemo(
    () => ({
      total: records.length,
      paid: records.filter((r) => r.paid_at !== null).length,
      pending: records.filter((r) => r.paid_at === null).length,
      notAdded: Math.max(0, (dashboard?.payroll.total_active_faculty ?? 0) - records.length),
      totalGross: records.reduce((sum, r) => sum + r.gross_amount, 0),
      totalNet: records.reduce((sum, r) => sum + r.net_amount, 0),
    }),
    [records, dashboard],
  );
  const verifiedPercent = counts.total ? Math.round((counts.paid / counts.total) * 100) : 0;

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return records.filter((record) => {
      if (paidFilter === "paid" && record.paid_at === null) return false;
      if (paidFilter === "pending" && record.paid_at !== null) return false;
      if (record.faculty && query) {
        const name = fullName(record.faculty).toLowerCase();
        if (!name.includes(query)) return false;
      }
      return true;
    });
  }, [records, paidFilter, search]);

  function handleMarkPaid(id: number) {
    markPaid.mutate(
      { id, paidOn: new Date().toISOString().slice(0, 10) },
      {
        onSuccess: () => show("Marked as paid.", "success"),
        onError: (err: unknown) => show(err instanceof ApiError ? err.message : "Could not update.", "error"),
      },
    );
  }

  function resetFilters() {
    setSearch("");
    setPaidFilter("all");
  }

  async function handleExportRegister() {
    if (filtered.length === 0) {
      show("No payroll records to export for this month.", "info");
      return;
    }
    setExportPending(true);
    try {
      const { rows: allFaculty } = await fetchAllPages((page, limit) => facultyService.list({ page, limit }));
      const deptLookup = buildFacultyDepartmentLookup(allFaculty);
      await exportPayrollReportPdf(filtered, deptLookup, { month: `${MONTH_LABELS[month - 1]} ${year}` });
      show("Payroll register exported.", "success");
    } catch (err) {
      show(err instanceof ApiError ? err.message : "Couldn't generate the register.", "error");
    } finally {
      setExportPending(false);
    }
  }

  return (
    <div>
      <HRPageHeader
        title={`Payroll Run — ${MONTH_LABELS[month - 1]} ${year}`}
        description="Department-wise salary run — verify, apply deductions and release for faculty."
        actions={
          <>
            <Button variant="secondary" isPending={exportPending} onClick={handleExportRegister}>
              <DownloadIcon className="h-4 w-4" />
              Download register
            </Button>
            <Button variant="primary" onClick={() => setFormOpen(true)}>
              <PlusIcon className="h-4 w-4" />
              Add Record
            </Button>
          </>
        }
      />

      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof ApiError ? error.message : "Failed to load payroll."}
        </p>
      )}

      {isLoading ? (
        <div className="mb-5">
          <HRStatGridSkeleton count={4} />
        </div>
      ) : (
        <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <HRStatCard icon={RupeeIcon} iconClassName="bg-[#EEF2FF] text-[#2655DA]" label="Gross payable" value={formatRupees(counts.totalGross)} />
          <HRStatCard icon={RupeeIcon} iconClassName="bg-[#EEF2FF] text-[#2655DA]" label="Deductions" value={formatRupees(counts.totalGross - counts.totalNet)} />
          <HRStatCard icon={RupeeIcon} iconClassName="bg-[#EEF2FF] text-[#2655DA]" label="Net payable" value={formatRupees(counts.totalNet)} caption={`${counts.total} employees`} />
          <HRStatCard icon={CheckIcon} iconClassName="bg-[#EEF2FF] text-[#2655DA]" label="Verified" value={`${verifiedPercent}%`} caption={`${counts.paid} of ${counts.total} payslips`} />
        </div>
      )}

      <div className="mb-5">
        <HRSegmentedTabs
          value={paidFilter}
          onChange={setPaidFilter}
          options={[
            { value: "all", label: "All", count: counts.total },
            { value: "paid", label: "Verified", count: counts.paid },
            { value: "pending", label: "Pending", count: counts.pending },
          ]}
        />
      </div>

      <HRFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search department…"
        onReset={resetFilters}
        resultCount={{ showing: filtered.length, total: records.length, noun: "records" }}
        filters={
          <SelectInput
            className="w-auto"
            value={monthKey}
            onChange={(e) => {
              const [y, m] = e.target.value.split("-").map(Number);
              setYear(y);
              setMonth(m);
            }}
          >
            {Array.from({ length: 12 }, (_, i) => {
              const date = new Date();
              date.setMonth(date.getMonth() - i);
              const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
              return (
                <option key={value} value={value}>
                  {date.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                </option>
              );
            })}
          </SelectInput>
        }
      />

      {isLoading && <HRStackedRowsSkeleton rows={5} />}

      <div className="flex flex-col gap-4">
        {!isLoading &&
          filtered.map((record) => {
            const status: Exclude<PaidFilter, "all"> = record.paid_at !== null ? "paid" : "pending";
            return (
              <div key={record.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="grid grid-cols-[minmax(0,1fr)_112px_112px_96px_144px] items-center gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {record.faculty ? fullName(record.faculty) : "Unknown faculty"}
                    </p>
                    <p className="text-xs text-slate-500">{record.faculty?.designation ?? "—"}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-500">Gross Amount</p>
                    <p className="text-sm font-semibold text-slate-900">{formatRupees(record.gross_amount)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Net Amount</p>
                    <p className="text-sm font-bold text-green-700">{formatRupees(record.net_amount)}</p>
                  </div>
                  <div className="flex justify-end">
                    <StatusPill tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</StatusPill>
                  </div>
                  <div className="flex justify-end">
                    {status === "paid" ? (
                      <p className="text-right text-xs text-slate-500">
                        Paid on
                        <br />
                        <span className="text-sm font-medium text-slate-700">{formatDate(record.paid_at!)}</span>
                      </p>
                    ) : (
                      <Button variant="primary" isPending={markPaid.isPending} onClick={() => handleMarkPaid(record.id)}>
                        Mark as Paid
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

        {!isLoading && filtered.length === 0 && (
          <p className="rounded-xl border border-slate-200 bg-white py-10 text-center text-sm text-slate-500">
            No payroll entries match these filters.
          </p>
        )}
      </div>

      <p className="mt-5 text-xs text-slate-400">Bank advice must be uploaded before release · locked runs cannot be edited.</p>

      <HrPayrollFormModal open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
}
