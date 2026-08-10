"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { StatCard } from "@/shared/components/ui/StatCard";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { NumberInput } from "@/shared/components/ui/NumberInput";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable";
import { CheckIcon, ClockIcon, MailIcon, XIcon } from "@/shared/components/icons";
import { ApiError } from "@/shared/lib/api-client";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { useOffers } from "@/modules/placement/hooks/useOffers";
import { useUpdateOfferResponse, useUpdateOfferedPackage } from "@/modules/placement/hooks/useApplicationMutations";
import type { Offer, OfferResponseStatus } from "@/modules/placement/types";

export default function OffersPage() {
  const { data: offers, isLoading, error } = useOffers();
  const updateOfferResponse = useUpdateOfferResponse();
  const updateOfferedPackage = useUpdateOfferedPackage();
  const { show } = useToast();

  const [nameQuery, setNameQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const responseFor = (offer: Offer): OfferResponseStatus => offer.offerResponse ?? "pending";
  const total = offers?.length ?? 0;
  const accepted = offers?.filter((o) => responseFor(o) === "accepted").length ?? 0;
  const declined = offers?.filter((o) => responseFor(o) === "declined").length ?? 0;
  const awaiting = total - accepted - declined;

  const departments = useMemo(() => {
    const names = new Set((offers ?? []).map((o) => o.departmentName).filter((n): n is string => !!n));
    return Array.from(names).sort();
  }, [offers]);

  const visibleOffers = useMemo(() => {
    const q = nameQuery.trim().toLowerCase();
    return (offers ?? []).filter((o) => {
      const matchesName = !q || (o.studentName ?? o.studentIdNo).toLowerCase().includes(q);
      const matchesDept = departmentFilter === "all" || o.departmentName === departmentFilter;
      return matchesName && matchesDept;
    });
  }, [offers, nameQuery, departmentFilter]);

  function handleResponseChange(offer: Offer, value: OfferResponseStatus) {
    updateOfferResponse.mutate(
      { driveId: offer.driveId, studentId: offer.studentId, offerResponse: value },
      {
        onError: (err: unknown) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error"),
      },
    );
  }

  function handlePackageBlur(offer: Offer, rawValue: string) {
    const value = Number(rawValue);
    if (!rawValue || Number.isNaN(value) || value < 0) return;
    if (value === offer.offeredPackageLpa) return;
    updateOfferedPackage.mutate(
      { driveId: offer.driveId, studentId: offer.studentId, offeredPackageLpa: value },
      {
        onError: (err: unknown) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error"),
      },
    );
  }

  const columns: DataTableColumn<Offer>[] = [
    {
      key: "student",
      header: "Student",
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.studentName ?? row.studentIdNo}</p>
          {row.studentName && <p className="text-xs text-slate-500">{row.studentIdNo}</p>}
        </div>
      ),
    },
    { key: "departmentName", header: "Department", render: (row) => row.departmentName ?? "—" },
    { key: "companyName", header: "Company" },
    { key: "jobRole", header: "Job role", render: (row) => row.jobRole ?? "—" },
    {
      key: "packageLpa",
      header: "Package",
      render: (row) =>
        responseFor(row) === "accepted" ? (
          <div className="flex items-center gap-1">
            <span className="text-slate-500">₹</span>
            <NumberInput
              key={row.id}
              className="w-20"
              min={0}
              defaultValue={row.offeredPackageLpa ?? row.packageLpa}
              placeholder="LPA"
              onBlur={(e) => handlePackageBlur(row, e.target.value)}
            />
          </div>
        ) : row.offeredPackageLpa !== undefined ? (
          `₹${row.offeredPackageLpa} LPA`
        ) : row.packageLpa !== undefined ? (
          `₹${row.packageLpa} LPA`
        ) : (
          "—"
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <SelectInput
          className="w-36"
          value={responseFor(row)}
          onChange={(e) => handleResponseChange(row, e.target.value as OfferResponseStatus)}
        >
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="declined">Declined</option>
        </SelectInput>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Offers" description="Students marked placed on a drive." />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total offers" value={total} icon={MailIcon} />
        <StatCard label="Accepted" value={accepted} icon={CheckIcon} />
        <StatCard label="Awaiting response" value={awaiting} icon={ClockIcon} />
        <StatCard label="Declined" value={declined} icon={XIcon} />
      </div>

      <div className="mb-4 mt-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Offer register</h3>
          <p className="text-xs text-slate-500">{visibleOffers.length} of {total} offers</p>
        </div>
        <div className="flex gap-2">
          <SearchInput
            className="w-56"
            placeholder="Search by student name..."
            value={nameQuery}
            onChange={(e) => setNameQuery(e.target.value)}
          />
          <SelectInput className="w-56" value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
            <option value="all">All departments · {total}</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </SelectInput>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={visibleOffers}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        error={error instanceof ApiError ? error.message : error ? "Failed to load offers." : null}
        emptyMessage="No students marked placed yet."
      />
    </div>
  );
}
