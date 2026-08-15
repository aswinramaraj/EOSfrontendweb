"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { StatusPill, type PillTone } from "@/shared/components/ui/StatusPill";
import { Button } from "@/shared/components/ui/Button";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { DownloadIcon, PlusIcon } from "@/shared/components/icons";
import { fullName } from "@/modules/faculty/lib/faculty-format";
import { HrPayrollFormModal } from "@/modules/hr/components/HrPayrollFormModal";
import { useHrPayroll, useMarkHrPayrollPaid } from "@/modules/hr/hooks/useHrPayroll";
import { useHrDashboard } from "@/modules/hr/hooks/useHrDashboard";

const ALL = "all";
type PaidFilter = "all" | "paid" | "pending";

const STATUS_LABEL: Record<Exclude<PaidFilter, "all">, string> = {
  paid: "Paid",
  pending: "Pending",
};

const STATUS_TONE: Record<Exclude<PaidFilter, "all">, PillTone> = {
  paid: "green",
  pending: "amber",
};

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => {
  const date = new Date();
  date.setMonth(date.getMonth() - i);
  const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  const label = date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  return { value, label };
});

function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function HRPayrollPage() {
  const { show } = useToast();
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState(MONTH_OPTIONS[0].value);
  const [paidFilter, setPaidFilter] = useState<PaidFilter>(ALL);
  const [formOpen, setFormOpen] = useState(false);

  const { data, isLoading, error } = useHrPayroll({ month, limit: 100 });
  const { data: dashboard } = useHrDashboard();
  const markPaid = useMarkHrPayrollPaid();

  const records = useMemo(() => data?.data ?? [], [data]);

  const counts = useMemo(
    () => ({
      total: records.length,
      paid: records.filter((r) => r.paid_at !== null).length,
      // "Pending" only covers records that already exist and aren't marked
      // paid — it says nothing about faculty who don't have a record for
      // this month at all, which reads as "0 left to do" when there could
      // still be plenty of people not yet added. notAdded below covers that.
      pending: records.filter((r) => r.paid_at === null).length,
      notAdded: Math.max(0, (dashboard?.payroll.total_active_faculty ?? 0) - records.length),
      totalNet: records.reduce((sum, r) => sum + r.net_amount, 0),
    }),
    [records, dashboard],
  );

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

  return (
    <div>
      <PageHeader
        title="Payroll"
        description="Review and record faculty payroll."
        actions={
          <>
            <Button variant="secondary" onClick={() => show("Export is coming soon.", "info")}>
              <DownloadIcon className="h-4 w-4" />
              Export
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Total Records</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{counts.total}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Paid</p>
          <p className="mt-2 text-2xl font-bold text-green-700">{counts.paid}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Pending</p>
          <p className="mt-2 text-2xl font-bold text-amber-600">{counts.pending}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Not Yet Added</p>
          <p className={`mt-2 text-2xl font-bold ${counts.notAdded > 0 ? "text-red-600" : "text-slate-900"}`}>
            {counts.notAdded}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Total Net Payable</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{formatRupees(counts.totalNet)}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchInput
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <SelectInput className="sm:w-44" value={month} onChange={(e) => setMonth(e.target.value)}>
          {MONTH_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </SelectInput>
        <SelectInput
          className="sm:w-40"
          value={paidFilter}
          onChange={(e) => setPaidFilter(e.target.value as PaidFilter)}
        >
          <option value={ALL}>All Statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
        </SelectInput>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {isLoading && <p className="py-10 text-center text-sm text-slate-500">Loading…</p>}

        {!isLoading &&
          filtered.map((record) => {
            const status: Exclude<PaidFilter, "all"> = record.paid_at !== null ? "paid" : "pending";
            return (
              <div key={record.id} className="rounded-lg border border-slate-200 bg-white p-4">
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
          <p className="rounded-lg border border-slate-200 bg-white py-10 text-center text-sm text-slate-500">
            No payroll entries match these filters.
          </p>
        )}
      </div>

      <HrPayrollFormModal open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
}
